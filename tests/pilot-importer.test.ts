import { describe, expect, it } from "vitest";
// @ts-expect-error Offline utilities use plain ESM.
import * as importer from "../scripts/pilot-r3-importer.mjs";
const {
  loadPilot,
  syntheticDelivery,
  draftPlan,
  preview,
  localFixtureSession,
  executeSynthetic,
} = importer;
describe("offline r3 importer", () => {
  it("previews all public counts in FK order without private payload", () => {
    const pkg = loadPilot(),
      p = preview(draftPlan(pkg, syntheticDelivery(pkg)));
    expect(p.orderedBatches).toHaveLength(12);
    expect(p.orderedBatches[0]).toEqual({
      table: "public.syllabus_versions",
      count: 1,
    });
    expect(
      p.orderedBatches.reduce(
        (n: number, b: { count: number }) => n + b.count,
        0,
      ),
    ).toBe(224);
    const text = JSON.stringify(p);
    expect(text).not.toContain("correct_index");
    expect(text).not.toContain("explanation_vi");
    expect(text).not.toContain("SYNTHETIC LOCAL IMPORT FIXTURE");
  });
  it("rejects a duplicated entity UUID", () => {
    const pkg = loadPilot();
    pkg.vocabulary[1].id = pkg.vocabulary[0].id;
    expect(() => draftPlan(pkg, syntheticDelivery(pkg))).toThrow();
  });
  it("rejects changed text even when its schema remains valid", () => {
    const pkg = loadPilot();
    pkg.vocabulary[0].meaning_vi = "Changed draft";
    expect(() => draftPlan(pkg, syntheticDelivery(pkg))).toThrow(
      "hash_mismatch",
    );
  });
  it("rejects missing protected delivery records", () => {
    const pkg = loadPilot(),
      store = syntheticDelivery(pkg);
    store.keys.pop();
    expect(() => draftPlan(pkg, store)).toThrow("modified_or_missing");
  });
  it("rejects an imported/forged envelope rather than loading real private data", () => {
    const pkg = loadPilot(),
      store = JSON.parse(JSON.stringify(syntheticDelivery(pkg)));
    expect(() => draftPlan(pkg, store)).toThrow("synthetic_delivery_required");
  });
  it("rejects changed quiz bindings", () => {
    const pkg = loadPilot(),
      store = syntheticDelivery(pkg);
    store.quiz_bindings[0].revision++;
    expect(() => draftPlan(pkg, store)).toThrow("modified_or_missing");
  });
  it("rejects foreign lesson ancestry before any database operation", () => {
    const pkg = loadPilot();
    pkg.lessons[0].unit_id = "ffffffff-ffff-4fff-8fff-ffffffffffff";
    expect(() => draftPlan(pkg, syntheticDelivery(pkg))).toThrow();
  });
  it("rejects a caller-supplied database connector", () => {
    expect(() =>
      executeSynthetic(
        {
          query: () => {
            throw Error("must not be called");
          },
        },
        null,
        null,
      ),
    ).toThrow("untrusted_database_session");
  });
  it("refuses execution without explicit disposable fixture identity", () => {
    const previous = process.env.HANLEARN_IMPORT_LOCAL_ONLY;
    delete process.env.HANLEARN_IMPORT_LOCAL_ONLY;
    try {
      expect(() => localFixtureSession()).toThrow(
        "disposable_local_target_required",
      );
    } finally {
      if (previous === undefined) delete process.env.HANLEARN_IMPORT_LOCAL_ONLY;
      else process.env.HANLEARN_IMPORT_LOCAL_ONLY = previous;
    }
  });
});
