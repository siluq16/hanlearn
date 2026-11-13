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
      focus: 9,
    });
    expect(
      new Set(rows.map((r: { stable_id: string }) => r.stable_id)).size,
    ).toBe(159);
    for (const row of rows) {
      expect(row.review_status).toBe("PENDING");
      for (const field of [
        "reviewer",
        "reviewed_at",
        "comments",
        "proposed_change",
      ])
        expect(row[field]).toBe("");
      expect(row.draft_revision).toBe(3);
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
  it("flags only L1-Q4 in revision 3 and uses actual mixed quiz revisions", () => {
    const rows = JSON.parse(
      review.buildHumanReview().outputs["REVIEW_REGISTER.template.json"],
    );
    const questions = rows.filter(
      (r: { kind: string }) => r.kind === "question",
    );
    expect(
      questions
        .filter(
          (r: { changed_in_current_revision: boolean }) =>
            r.changed_in_current_revision,
        )
        .map((r: { label: string }) => r.label),
    ).toEqual(["L1-Q4"]);
    const m = read("manifest.json");
    expect(
      m.lessons.map(
        (l: { quiz_file: string }) => read(l.quiz_file).quiz.revision,
      ),
    ).toEqual([3, 2, 2, 2]);
    for (const q of questions)
      expect(q.quiz_revision).toBe(q.label.startsWith("L1-") ? 3 : 2);
    expect(
      rows.find((r: { stable_id: string }) => r.stable_id === "focus/l1-q4")
        .review_status,
    ).toBe("PENDING");
  });
  it("keeps revision 2 evidence separate and unmodified while other source data stays fixed", () => {
    const oldRoot = "docs/human-review/pilot-hsk1-r2/";
    const old = JSON.parse(
      fs.readFileSync(oldRoot + "SOURCE_SNAPSHOT.json", "utf8"),
    );
    const oldRows = JSON.parse(
      fs.readFileSync(oldRoot + "REVIEW_REGISTER.template.json", "utf8"),
    );
    expect(old.draft_revision).toBe(2);
    expect(old.package_snapshot_sha256).toBe(
      "f6bee81f2329f7822d2aeab8187b7f45de324c0fa7fd3744f2373672b40b2b94",
    );
    expect(oldRows).toHaveLength(158);
    expect(
      oldRows.every(
        (r: { review_status: string; reviewer: string; reviewed_at: string }) =>
          r.review_status === "PENDING" && !r.reviewer && !r.reviewed_at,
      ),
    ).toBe(true);
    const current = review.buildHumanReview();
    for (const file of current.snapshot.files) {
      const previous = old.files.find(
        (f: { path: string }) => f.path === file.path,
      );
      if (["manifest.json", "quizzes/lesson-01.json"].includes(file.path))
        expect(file.sha256).not.toBe(previous.sha256);
      else expect(file.sha256).toBe(previous.sha256);
    }
    const rows = JSON.parse(current.outputs["REVIEW_REGISTER.template.json"]);
    expect(
      rows
        .filter((r: { kind: string }) => r.kind === "question")
        .map((r: { stable_id: string }) => r.stable_id),
    ).toEqual(
      oldRows
        .filter((r: { kind: string }) => r.kind === "question")
        .map((r: { stable_id: string }) => r.stable_id),
    );
  });
  it("keeps L1-Q4 about discourse function without the overlapping health paraphrase", () => {
    const question = read("quizzes/lesson-01.json").questions.find(
      (q: { id: string }) => q.id === "76015916-80bf-52c2-bd11-a9a9812b0408",
    );
    expect(question.prompt).toContain("chức năng");
    expect(question.prompt).toContain("我很好，你呢？");
    expect(question.choices).not.toContain("Bạn có khỏe không?");
    expect(
      new Set(question.choices.map((s: string) => s.trim().normalize("NFC")))
        .size,
    ).toBe(4);
  });
});
