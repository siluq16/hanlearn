import { describe, expect, it } from "vitest";
import fs from "node:fs";
// @ts-expect-error Offline utility deliberately uses plain ESM.
import * as pilot from "../scripts/pilot-validation.mjs";
const { validatePilot, publicPayloadHasKeys } = pilot;
const root = "content/pilot-hsk1/v1";
const read = (file: string) =>
  JSON.parse(fs.readFileSync(root + "/" + file, "utf8"));
function load() {
  const manifest = read("manifest.json");
  return {
    manifest,
    vocabulary: read("vocabulary.json"),
    grammar: read("grammar.json"),
    lessons: manifest.lessons.map((x: { file: string }) => read(x.file)),
    quizzes: manifest.lessons.map((x: { quiz_file: string }) =>
      read(x.quiz_file),
    ),
    rights: read("rights-manifest.json"),
  };
}
// Structural-only dummy indices, never author answers or semantic grading.
function syntheticKeys(pkg: ReturnType<typeof load>) {
  return {
    package_id: pkg.manifest.package_id,
    package_revision: pkg.manifest.draft_revision,
    quiz_bindings: pkg.quizzes.map(
      (q: { quiz: { id: string; lesson_id: string; revision: number } }) => ({
        quiz_id: q.quiz.id,
        revision: q.quiz.revision,
        public_sha256: pkg.manifest.files.find(
          (f: { path: string }) =>
            f.path ===
            pkg.manifest.lessons.find(
              (l: { id: string }) => l.id === q.quiz.lesson_id,
            ).quiz_file,
        ).sha256,
      }),
    ),
    review_state: "pending_review",
    human_reviewer: null,
    human_reviewed_at: null,
    keys: pkg.quizzes.flatMap((q: { questions: { id: string }[] }) =>
      q.questions.map((question) => ({
        question_id: question.id,
        correct_index: 0,
        explanation_vi:
          "Synthetic validator test only; not an authored answer.",
      })),
    ),
  };
}
describe("offline draft pilot package", () => {
  it("binds private keys to current package and quiz revisions/hashes", () => {
    const pkg = load(),
      keys = syntheticKeys(pkg);
    keys.quiz_bindings[0].revision--;
    expect(validatePilot(pkg, { privateKeys: keys }).privateValidation).toBe(
      "FAIL",
    );
    const wrongHash = syntheticKeys(pkg);
    wrongHash.quiz_bindings[0].public_sha256 = "0".repeat(64);
    expect(
      validatePilot(pkg, { privateKeys: wrongHash }).privateValidation,
    ).toBe("FAIL");
    const stalePackage = syntheticKeys(pkg);
    stalePackage.package_revision--;
    expect(
      validatePilot(pkg, { privateKeys: stalePackage }).privateValidation,
    ).toBe("FAIL");
    pkg.manifest.lessons[0].quiz_revision++;
    expect(validatePilot(pkg).status).toBe("FAIL");
  });
  it("keeps three learning rounds in lesson 3 with 6/6/3 distinct new words", () => {
    const pkg = load();
    expect(
      pkg.manifest.lessons[2].learning_rounds.map(
        (r: { new_vocabulary_ids: string[] }) => r.new_vocabulary_ids.length,
      ),
    ).toEqual([6, 6, 3]);
    pkg.manifest.lessons[2].learning_rounds[0].new_vocabulary_ids.pop();
    expect(validatePilot(pkg).status).toBe("FAIL");
  });
  it("does not require later-round characters in the new family-word examples", () => {
    const pkg = load();
    const earlier = pkg.manifest.lessons
      .slice(0, 2)
      .flatMap((l: { new_vocabulary_ids: string[] }) => l.new_vocabulary_ids);
    const known = new Set(
      pkg.vocabulary
        .filter((v: { id: string }) => earlier.includes(v.id))
        .flatMap((v: { simplified: string }) => [...v.simplified]),
    );
    for (const round of pkg.manifest.lessons[2].learning_rounds) {
      const words = pkg.vocabulary.filter((v: { id: string }) =>
        round.new_vocabulary_ids.includes(v.id),
      );
      words.forEach((v: { simplified: string }) =>
        [...v.simplified].forEach((c) => known.add(c)),
      );
      for (const word of words) {
        expect(
          [...word.example_zh]
            .filter((c) => /\p{Script=Han}/u.test(c))
            .every((c) => known.has(c)),
        ).toBe(true);
      }
    }
  });
  it("rejects quiz distractors with Chinese characters from a later lesson", () => {
    const pkg = load();
    pkg.quizzes[2].questions[2].choices[1] = "现在几点？";
    expect(validatePilot(pkg).status).toBe("FAIL");
  });
  it("validates public draft payloads with the real Content V1 schema", () => {
    const result = validatePilot(load());
    expect(result.publicValidation).toBe("PASS");
    expect(result.status).toBe("BLOCKED");
    expect(result.counts).toEqual({
      lessons: 4,
      vocabulary: 44,
      grammar: 12,
      quizzes: 4,
      questions: 24,
    });
    expect(result.importReadiness).toBe("BLOCKED");
  });
  it("keeps 43 source-matched headwords separate from the supplemental country", () => {
    const pkg = load();
    const result = validatePilot(pkg);
    expect(result.hskVerifiedHeadwords).toBe(43);
    expect(result.supplementaryWords).toBe(1);
    const vn = pkg.vocabulary.find(
      (v: { simplified: string }) => v.simplified === "越南",
    );
    expect(
      pkg.manifest.syllabus_vocabulary.some(
        (v: { vocabulary_id: string }) => v.vocabulary_id === vn.id,
      ),
    ).toBe(false);
  });
  it("rejects a section ref that does not belong to the lesson", () => {
    const pkg = load();
    pkg.lessons[0].content.sections.find(
      (s: { type: string }) => s.type === "vocabulary_refs",
    ).vocabularyIds[0] = pkg.vocabulary[20].id;
    expect(validatePilot(pkg).status).toBe("FAIL");
  });
  it("rejects duplicate global section IDs and entity UUIDs", () => {
    const pkg = load();
    pkg.lessons[1].content.sections[0].id =
      pkg.lessons[0].content.sections[0].id;
    expect(validatePilot(pkg).status).toBe("FAIL");
    const other = load();
    other.vocabulary[0].id = other.vocabulary[1].id;
    expect(validatePilot(other).status).toBe("FAIL");
  });
  it("rejects HTML or extra answer-key data in lesson content", () => {
    for (const payload of [
      { type: "paragraph", text: "<script>alert(1)</script>" },
      { type: "paragraph", text: "Test", correct_index: 0 },
    ]) {
      const pkg = load();
      pkg.lessons[0].content.sections[0].blocks[0] = payload;
      expect(validatePilot(pkg).status).toBe("FAIL");
    }
  });
  it("rejects keys in public metadata but permits public grammar explanation", () => {
    const pkg = load();
    expect(publicPayloadHasKeys(pkg)).toBe(false);
    pkg.manifest.extra = { answerKey: 0 };
    expect(validatePilot(pkg).status).toBe("FAIL");
  });
  it("rejects numerical pinyin and decomposed Unicode", () => {
    const pkg = load();
    pkg.vocabulary[0].pinyin_marked = "ni3";
    expect(validatePilot(pkg).status).toBe("FAIL");
    const other = load();
    other.vocabulary[0].pinyin_marked = "ni\u030c";
    expect(validatePilot(other).status).toBe("FAIL");
  });
  it("never treats unreviewed content as published or human-approved", () => {
    const pkg = load();
    pkg.lessons[0].status = "published";
    expect(validatePilot(pkg).status).toBe("FAIL");
    const other = load();
    other.manifest.source.human_reviewer = "AI";
    expect(validatePilot(other).status).toBe("FAIL");
    const third = load();
    third.manifest.import_authorized = true;
    expect(validatePilot(third).status).toBe("FAIL");
  });
  it("requires exactly one structurally valid private index per question, without loading real keys", () => {
    const pkg = load(),
      keys = syntheticKeys(pkg);
    expect(validatePilot(pkg, { privateKeys: keys }).privateValidation).toBe(
      "PASS",
    );
    keys.keys[0].correct_index = 9;
    expect(validatePilot(pkg, { privateKeys: keys }).privateValidation).toBe(
      "FAIL",
    );
    const missing = syntheticKeys(pkg);
    missing.keys.pop();
    expect(validatePilot(pkg, { privateKeys: missing }).privateValidation).toBe(
      "FAIL",
    );
    const duplicate = syntheticKeys(pkg);
    duplicate.keys[0].question_id = duplicate.keys[1].question_id;
    expect(
      validatePilot(pkg, { privateKeys: duplicate }).privateValidation,
    ).toBe("FAIL");
  });
  it("blocks missing private/source artifacts and rejects an unrelated reference cache", () => {
    const pkg = load();
    expect(validatePilot(pkg).privateValidation).toBe(
      "BLOCKED_PRIVATE_STORE_MISSING",
    );
    expect(validatePilot(pkg).sourceVerification).toBe(
      "BLOCKED_SOURCE_CACHE_MISSING",
    );
    expect(
      validatePilot(pkg, {
        source: {
          pdfSha: "wrong",
          textSha: "wrong",
          pages: Array(406).fill(""),
        },
      }).sourceVerification,
    ).toBe("FAIL");
  });
  it("rejects missing source URIs, evidence links and rights provenance", () => {
    const missing = load();
    delete missing.manifest.source.source_uri;
    expect(validatePilot(missing).status).toBe("FAIL");
    const badLink = load();
    badLink.manifest.hsk_verification[0].evidence.source_id = "unrelated";
    expect(validatePilot(badLink).status).toBe("FAIL");
    const rights = load();
    rights.rights.sources = [];
    expect(validatePilot(rights).status).toBe("FAIL");
  });
  it("rejects rogue audio and early human approval in the restricted draft store", () => {
    const pkg = load();
    pkg.lessons[0].content.sections.find(
      (s: { type: string }) => s.type === "listening",
    ).audioAssetId = pkg.vocabulary[0].id;
    expect(validatePilot(pkg).status).toBe("FAIL");
    const clean = load(),
      keys = syntheticKeys(clean);
    Object.assign(keys, { human_reviewer: "AI" });
    expect(validatePilot(clean, { privateKeys: keys }).privateValidation).toBe(
      "FAIL",
    );
  });
});
