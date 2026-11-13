import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { createHash } from "node:crypto";
// @ts-expect-error Public offline generator deliberately uses plain ESM.
import * as review from "../scripts/prepare-pilot-human-review.mjs";
const root = "content/pilot-hsk1/v1/";
const read = (file: string) => JSON.parse(fs.readFileSync(root + file, "utf8"));
describe("public human review packet", () => {
  it("has a pending decision per item, with private attestations but no private values", () => {
    const { outputs, snapshot } = review.buildHumanReview();
    const rows = JSON.parse(outputs["REVIEW_REGISTER.template.json"]);
    expect(snapshot.review_counts).toEqual({
      vocabulary: 44,
      grammar: 12,
      lesson: 4,
      section: 29,
      quiz: 4,
      question: 24,
      private_explanation: 24,
      syllabus: 1,
      course: 1,
      unit: 1,
      rights: 6,
      focus: 8,
    });
    expect(
      new Set(rows.map((r: { stable_id: string }) => r.stable_id)).size,
    ).toBe(158);
    for (const row of rows) {
      expect(row.review_status).toBe("PENDING");
      for (const field of [
        "reviewer",
        "reviewed_at",
        "comments",
        "proposed_change",
      ])
        expect(row[field]).toBe("");
      expect(row.draft_revision).toBe(2);
      expect(row.package_snapshot_sha256).toBe(
        snapshot.package_snapshot_sha256,
      );
      expect(row).not.toHaveProperty("correct_index");
      expect(row).not.toHaveProperty("explanation_vi");
      if (row.kind === "private_explanation") {
        expect(row.requires_private_view).toBe(true);
        expect(row.public_item_sha256).toBe("");
      }
    }
  });
  it("binds the snapshot to exact public files and manifest bytes", () => {
    const { snapshot } = review.buildHumanReview();
    expect(snapshot.files).toHaveLength(12);
    for (const file of snapshot.files) {
      expect(file.path).not.toMatch(/\.local|private|\.\./);
      expect(file.sha256).toBe(
        createHash("sha256")
          .update(fs.readFileSync(root + file.path))
          .digest("hex"),
      );
    }
    expect(snapshot.package_snapshot_sha256).toBe(
      createHash("sha256").update(JSON.stringify(snapshot.files)).digest("hex"),
    );
  });
  it("includes all teaching text and all unmarked quiz choices", () => {
    const { outputs } = review.buildHumanReview();
    const m = read("manifest.json");
    for (const v of read("vocabulary.json"))
      for (const value of [
        v.id,
        v.simplified,
        v.pinyin_marked,
        v.meaning_vi,
        v.example_zh,
        v.example_pinyin,
        v.example_vi,
      ])
        expect(outputs["VOCABULARY.md"]).toContain(value);
    for (const g of read("grammar.json")) {
      for (const value of [g.id, g.title, g.pattern, g.explanation_vi])
        expect(outputs["GRAMMAR.md"]).toContain(value);
      for (const e of g.examples)
        for (const value of Object.values(e))
          expect(outputs["GRAMMAR.md"]).toContain(value);
    }
    for (const lm of m.lessons) {
      const l = read(lm.file);
      expect(outputs["LESSONS.md"]).toContain(l.objective_vi);
      for (const s of l.content.sections) {
        expect(outputs["LESSONS.md"]).toContain(`${l.id}/${s.id}`);
        for (const b of s.blocks ?? s.transcript ?? [])
          for (const field of ["text", "hanzi", "pinyin", "translationVi"])
            if (b[field]) expect(outputs["LESSONS.md"]).toContain(b[field]);
      }
      for (const q of read(lm.quiz_file).questions) {
        expect(outputs["QUIZZES.md"]).toContain(q.id);
        expect(outputs["QUIZZES.md"]).toContain(q.prompt);
        for (const choice of q.choices)
          expect(outputs["QUIZZES.md"]).toContain(choice);
      }
    }
  });
  it("flags precisely the 14 changed questions and retains review for the other 10", () => {
    const rows = JSON.parse(
      review.buildHumanReview().outputs["REVIEW_REGISTER.template.json"],
    );
    const questions = rows.filter(
      (r: { kind: string }) => r.kind === "question",
    );
    expect(
      questions
        .filter(
          (r: { changed_in_remediation: boolean }) => r.changed_in_remediation,
        )
        .map((r: { label: string }) => r.label),
    ).toEqual([
      "L1-Q1",
      "L1-Q4",
      "L1-Q6",
      "L2-Q1",
      "L2-Q2",
      "L2-Q3",
      "L2-Q4",
      "L2-Q5",
      "L2-Q6",
      "L3-Q3",
      "L3-Q4",
      "L4-Q4",
      "L4-Q5",
      "L4-Q6",
    ]);
    expect(
      questions.filter(
        (r: { changed_in_remediation: boolean }) => !r.changed_in_remediation,
      ),
    ).toHaveLength(10);
  });
  it("keeps generated packet files current without writing during tests", () => {
    const { outputs } = review.buildHumanReview();
    for (const [file, body] of Object.entries(outputs))
      expect(fs.readFileSync(review.packetRoot + "/" + file, "utf8")).toBe(
        body,
      );
  });
});
