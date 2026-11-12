// Offline only. Reuse the production Content V1 Zod validators without importing Next/Auth.
import { z } from "zod";
import {
  lessonText,
  lessonContentSchema,
  lessonRowSchema,
  vocabularyRowSchema,
  grammarRowSchema,
} from "../src/features/lessons/schemas.ts";
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  uuid = z.uuid();
const draft = {
  status: z.literal("draft"),
  review_status: z.literal("pending"),
  source_uri: lessonText(2048),
  content_license: z.literal("pending-rights-review"),
  reviewed_by: z.null(),
  reviewed_at: z.null(),
};
const publicationKeys = {
  status: true,
  review_status: true,
  source_uri: true,
  content_license: true,
  reviewed_by: true,
  reviewed_at: true,
};
const word = vocabularyRowSchema
  .omit(publicationKeys)
  .extend({
    ...draft,
    pinyin_numeric: z.null(),
    part_of_speech: lessonText(200),
    sense_key: lessonText(100),
    audio_asset_id: z.null(),
  })
  .strict();
const grammar = grammarRowSchema.omit(publicationKeys).extend(draft).strict();
const lesson = lessonRowSchema
  .omit(publicationKeys)
  .extend({
    ...draft,
    sort_order: z.number().int().positive(),
    content: lessonContentSchema,
  })
  .strict();
const question = z
  .object({
    id: uuid,
    quiz_id: uuid,
    sort_order: z.number().int().positive(),
    prompt: lessonText(2000),
    choices: z
      .array(lessonText(1000))
      .min(2)
      .max(6)
      .refine((x) => new Set(x).size === x.length),
    ...draft,
  })
  .strict();
const quiz = z
  .object({
    quiz: z
      .object({
        id: uuid,
        lesson_id: uuid,
        revision: z.literal(1),
        title: lessonText(300),
        published_at: z.null(),
        ...draft,
      })
      .strict(),
    questions: z.array(question).min(5).max(10),
  })
  .strict();
const syllabus = z
  .object({
    id: uuid,
    code: lessonText(100),
    display_name: lessonText(300),
    published_on: z.null(),
    effective_on: z.null(),
    verified_at: z.null(),
    official_vocab_totals: z.object({}).strict(),
    is_active: z.literal(false),
    ...draft,
  })
  .strict();
const course = z
  .object({
    id: uuid,
    syllabus_id: uuid,
    hsk_level: z.literal(1),
    title: lessonText(300),
    sort_order: z.number().int().positive(),
    ...draft,
  })
  .strict();
const unit = z
  .object({
    id: uuid,
    course_id: uuid,
    title: lessonText(300),
    sort_order: z.number().int().positive(),
    ...draft,
  })
  .strict();
const keySchema = z
  .object({
    package_id: lessonText(100),
    review_state: z.literal("pending_review"),
    human_reviewer: z.null(),
    human_reviewed_at: z.null(),
    keys: z.array(
      z
        .object({
          question_id: uuid,
          correct_index: z.number().int().min(0).max(5),
          explanation_vi: lessonText(4000),
        })
        .strict(),
    ),
  })
  .strict();
const keyNames = new Set([
  "correct_index",
  "correctIndex",
  "correctAnswer",
  "correct_answer",
  "answerKey",
  "answer_key",
  "answer_keys",
  "is_correct",
  "isCorrect",
  "solution",
  "solutions",
  "submission_payload",
  "submission_fingerprint",
]);
const pinyinChars =
  /^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹḿ\s'’.,!?，。？！：:“”"—…-]+$/u;
export function publicPayloadHasKeys(value) {
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).some(
    ([key, v]) => keyNames.has(key) || publicPayloadHasKeys(v),
  );
}
function checkText(value, issues, location = "package") {
  if (typeof value === "string") {
    if (
      value !== value.normalize("NFC") ||
      /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
    )
      issues.push({ code: "unsafe_or_non_nfc_text", location });
    return;
  }
  if (value && typeof value === "object")
    for (const [key, v] of Object.entries(value)) {
      if (
        (key === "status" && v !== "draft") ||
        (key === "review_status" && v !== "pending") ||
        (key === "review_state" && v !== "pending_review")
      )
        issues.push({
          code: "non_draft_review_state",
          location: location + "." + key,
        });
      if (
        [
          "human_reviewer",
          "human_reviewed_at",
          "reviewed_by",
          "reviewed_at",
        ].includes(key) &&
        v !== null
      )
        issues.push({
          code: "unreviewed_package_claims_reviewer",
          location: location + "." + key,
        });
      if (
        typeof v === "string" &&
        ["pinyin", "pinyin_marked", "example_pinyin", "source_pinyin"].includes(
          key,
        ) &&
        !pinyinChars.test(v.toLowerCase())
      )
        issues.push({
          code: "invalid_pinyin_characters",
          location: location + "." + key,
        });
      checkText(v, issues, location + "." + key);
    }
}
const sameSet = (a, b) =>
  a.length === b.length &&
  new Set(a).size === a.length &&
  a.every((x) => b.includes(x));
const numbersUnique = (rows) =>
  new Set(rows.map((x) => x.sort_order)).size === rows.length;
function sourceEntries(pages) {
  const rows = [];
  for (let p = 79; p < 87; p++)
    for (const line of (pages[p] ?? "").split("\n")) {
      const m = line.match(/^(\d+)\s+(\S+)\s+(\S+)\s+(\S+)/u);
      if (m && /^1(?:（.*）)?$/.test(m[2]))
        rows.push({
          ordinal: Number(m[1]),
          source_term: m[3],
          term: m[3].replace(/[0-9¹²³]+$/u, ""),
          source_level_label: m[2],
          source_pinyin: m[4],
          pdf_page: p + 1,
          printed_page: p - 2,
        });
    }
  return rows;
}
export function validatePilot(pkg, { privateKeys = null, source = null } = {}) {
  const issues = [],
    m = pkg.manifest;
  const fail = (code, location = "package") => issues.push({ code, location });
  const summary = () => ({
    status: issues.length ? "FAIL" : "PASS",
    issues,
    counts: {
      lessons: pkg.lessons?.length ?? 0,
      vocabulary: pkg.vocabulary?.length ?? 0,
      grammar: pkg.grammar?.length ?? 0,
      quizzes: pkg.quizzes?.length ?? 0,
      questions:
        pkg.quizzes?.reduce((n, q) => n + (q.questions?.length ?? 0), 0) ?? 0,
    },
  });
  if (
    !m ||
    ![
      "lessons",
      "lesson_vocabulary",
      "lesson_grammar",
      "syllabus_vocabulary",
      "syllabus_grammar",
      "hsk_verification",
      "grammar_verification",
      "supporting_expressions",
    ].every((k) => Array.isArray(m[k]))
  )
    return {
      status: "FAIL",
      issues: [{ code: "manifest_structure_invalid" }],
      privateValidation: "NOT_RUN",
      sourceVerification: "NOT_RUN",
      importReadiness: "BLOCKED",
    };
  for (const [name, value, schema] of [
    ["vocabulary", pkg.vocabulary, z.array(word).min(30).max(50)],
    ["grammar", pkg.grammar, z.array(grammar).length(12)],
    ["lessons", pkg.lessons, z.array(lesson).length(4)],
    ["quizzes", pkg.quizzes, z.array(quiz).length(4)],
  ])
    if (!schema.safeParse(value).success) fail("schema_invalid", name);
  if (
    !m ||
    !syllabus.safeParse(m.syllabus).success ||
    !course.safeParse(m.course).success ||
    !unit.safeParse(m.unit).success ||
    !date.safeParse(m.authored_on).success
  )
    fail("invalid_catalog_manifest");
  if (issues.length)
    return {
      ...summary(),
      privateValidation: "NOT_RUN",
      sourceVerification: "NOT_RUN",
      humanReview: "pending_review",
      importReadiness: "BLOCKED",
    };
  if (
    m.review_state !== "pending_review" ||
    m.import_authorized !== false ||
    m.publish_authorized !== false ||
    m.origin !== "ai_assisted_original" ||
    !m.human_review ||
    Object.values(m.human_review).some(
      (v) => v !== null && v !== "pending_review",
    )
  )
    fail("review_gate_changed");
  if (
    m.private_answer_store?.location !==
      ".local/pilot-hsk1/v1/private/answers.json" ||
    m.private_answer_store.committed !== false ||
    m.private_answer_store.frontend_access !== false
  )
    fail("private_store_policy_changed");
  if (
    m.supporting_expressions?.some((x) => x.review_state !== "pending_review")
  )
    fail("supporting_expression_review_missing");
  if (
    pkg.rights?.review_state !== "pending_review" ||
    pkg.rights.distribution_license !== null ||
    pkg.rights.publication_blocked !== true ||
    pkg.rights.human_reviewer !== null ||
    pkg.rights.human_reviewed_at !== null
  )
    fail("rights_not_pending");
  const sourceMetadata = z.object({
    id: lessonText(100),
    title: lessonText(300),
    edition: lessonText(300),
    landing_uri: z.literal("https://www.chinesetest.cn/syllabus"),
    source_uri: z.literal(
      "https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf",
    ),
    pdf_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    extracted_text_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    machine_checked_on: date,
    comparison_by: lessonText(1000),
    human_reviewer: z.null(),
    human_reviewed_at: z.null(),
  });
  if (!sourceMetadata.safeParse(m.source).success)
    fail("source_provenance_incomplete");
  if (
    pkg.rights.package_id !== m.package_id ||
    pkg.rights.authoring_date !== m.authored_on ||
    !lessonText(1000).safeParse(pkg.rights.declared_origin).success ||
    pkg.rights.ai_assistance_disclosed !== true ||
    pkg.rights.third_party_lesson_text_copied !== false ||
    pkg.rights.third_party_reference_facts_used !== true ||
    !Array.isArray(pkg.rights.sources) ||
    pkg.rights.sources.length !== 1 ||
    pkg.rights.sources.some(
      (s) =>
        s.source_id !== m.source?.id ||
        s.uri !== m.source?.source_uri ||
        s.permission_state !== "pending_review" ||
        s.full_document_distributed !== false ||
        !lessonText(2000).safeParse(s.use).success,
    ) ||
    pkg.rights.audio?.state !== "unavailable_no_assets" ||
    !Array.isArray(pkg.rights.audio?.files) ||
    pkg.rights.audio.files.length !== 0
  )
    fail("rights_provenance_incomplete");
  if (publicPayloadHasKeys(pkg)) fail("private_key_field_in_public_package");
  checkText(pkg, issues);
  const allRows = [
    m.syllabus,
    m.course,
    m.unit,
    ...pkg.vocabulary,
    ...pkg.grammar,
    ...pkg.lessons,
    ...pkg.quizzes.map((q) => q.quiz),
    ...pkg.quizzes.flatMap((q) => q.questions),
  ];
  if (
    !sameSet(
      allRows.map((x) => x.id),
      [...new Set(allRows.map((x) => x.id))],
    )
  )
    fail("duplicate_entity_uuid");
  if (
    m.course.syllabus_id !== m.syllabus.id ||
    m.unit.course_id !== m.course.id ||
    pkg.lessons.some((l) => l.unit_id !== m.unit.id) ||
    !numbersUnique(pkg.lessons)
  )
    fail("broken_ancestry_or_order");
  const ids = {
    lessons: pkg.lessons.map((x) => x.id),
    words: pkg.vocabulary.map((x) => x.id),
    grammar: pkg.grammar.map((x) => x.id),
  };
  if (
    !sameSet(
      m.lessons.map((l) => l.id),
      ids.lessons,
    ) ||
    m.lessons.some((l) => l.review_state !== "pending_review")
  )
    fail("lesson_manifest_mismatch");
  if (
    new Set(
      pkg.vocabulary.map((w) =>
        JSON.stringify([w.simplified, w.pinyin_marked, w.sense_key]),
      ),
    ).size !== pkg.vocabulary.length
  )
    fail("duplicate_vocabulary_natural_key");
  const sectionIds = pkg.lessons.flatMap((l) =>
    l.content.sections.map((s) => s.id),
  );
  if (new Set(sectionIds).size !== sectionIds.length)
    fail("duplicate_section_id");
  const newWords = m.lessons.flatMap((l) => l.new_vocabulary_ids);
  if (!sameSet(newWords, ids.words)) fail("new_vocabulary_distribution");
  for (const l of pkg.lessons) {
    const vl = m.lesson_vocabulary.filter((x) => x.lesson_id === l.id),
      gl = m.lesson_grammar.filter((x) => x.lesson_id === l.id);
    if (
      !numbersUnique(vl) ||
      !numbersUnique(gl) ||
      new Set(vl.map((x) => x.vocabulary_id)).size !== vl.length ||
      new Set(gl.map((x) => x.grammar_id)).size !== gl.length ||
      vl.some((x) => !ids.words.includes(x.vocabulary_id)) ||
      gl.some((x) => !ids.grammar.includes(x.grammar_id))
    )
      fail("invalid_join", l.id);
    const wr = l.content.sections.flatMap((s) =>
        s.type === "vocabulary_refs" ? s.vocabularyIds : [],
      ),
      gr = l.content.sections.flatMap((s) =>
        s.type === "grammar_refs" ? s.grammarIds : [],
      );
    if (
      !sameSet(
        wr,
        vl.map((x) => x.vocabulary_id),
      ) ||
      !sameSet(
        gr,
        gl.map((x) => x.grammar_id),
      )
    )
      fail("section_reference_not_lesson_join", l.id);
    if (
      l.content.sections.some(
        (s) => s.type === "listening" && s.audioAssetId !== null,
      )
    )
      fail("unexpected_audio_asset", l.id);
  }
  if (
    m.lesson_vocabulary.some((x) => !ids.lessons.includes(x.lesson_id)) ||
    m.lesson_grammar.some((x) => !ids.lessons.includes(x.lesson_id))
  )
    fail("foreign_join_lesson");
  if (
    !sameSet(
      pkg.quizzes.map((q) => q.quiz.lesson_id),
      ids.lessons,
    )
  )
    fail("quiz_lesson_mismatch");
  for (const q of pkg.quizzes)
    if (
      !numbersUnique(q.questions) ||
      q.questions.some((x) => x.quiz_id !== q.quiz.id)
    )
      fail("quiz_question_relation", q.quiz.id);
  const actual = summary().counts;
  for (const [key, count] of Object.entries({
    ...actual,
    syllabuses: 1,
    courses: 1,
    units: 1,
  }))
    if (m.counts?.[key] !== count) fail("manifest_count_mismatch", key);
  if (
    !sameSet(
      m.hsk_verification.map((v) => v.vocabulary_id),
      ids.words,
    )
  )
    fail("hsk_evidence_coverage");
  for (const evidence of m.hsk_verification) {
    const row = pkg.vocabulary.find((v) => v.id === evidence.vocabulary_id);
    if (
      evidence.review_state !== "pending_review" ||
      evidence.sense_review_state !== "pending_review" ||
      evidence.human_reviewer !== null ||
      evidence.human_reviewed_at !== null ||
      !date.safeParse(evidence.machine_checked_on).success ||
      !lessonText(2000).safeParse(evidence.note).success ||
      (evidence.classification === "verified_hsk1_headword" &&
        evidence.evidence?.source_id !== m.source?.id) ||
      evidence.term !== row?.simplified ||
      ![
        "verified_hsk1_headword",
        "unverified",
        "supplementary_outside_verified_list",
      ].includes(evidence.classification)
    )
      fail("invalid_hsk_review_record");
  }
  const verified = m.hsk_verification.filter(
    (x) => x.classification === "verified_hsk1_headword",
  );
  if (
    !sameSet(
      m.syllabus_vocabulary.map((x) => x.vocabulary_id),
      verified.map((x) => x.vocabulary_id),
    ) ||
    m.syllabus_vocabulary.some(
      (x) => x.syllabus_id !== m.syllabus.id || x.introduced_level !== 1,
    )
  )
    fail("unverified_official_membership");
  if (
    !sameSet(
      m.grammar_verification.map((x) => x.grammar_id),
      ids.grammar,
    ) ||
    m.grammar_verification.some(
      (x) =>
        x.review_state !== "pending_review" ||
        x.human_reviewer !== null ||
        x.human_reviewed_at !== null,
    )
  )
    fail("grammar_review_coverage");
  if (
    m.grammar_verification.some(
      (x) =>
        x.source_id !== m.source?.id ||
        !lessonText(300).safeParse(x.source_category).success ||
        x.alignment_state !== "source_category_located_pending_review" ||
        !Number.isInteger(x.pdf_page) ||
        x.pdf_page < 386 ||
        x.pdf_page > 388 ||
        x.printed_page !== x.pdf_page - 3,
    )
  )
    fail("grammar_source_provenance_incomplete");
  if (
    m.syllabus_grammar.some(
      (x) => x.syllabus_id !== m.syllabus.id || x.introduced_level !== 1,
    ) ||
    !sameSet(
      m.syllabus_grammar.map((x) => x.grammar_id),
      ids.grammar,
    )
  )
    fail("grammar_membership_mismatch");
  const publicIssues = [...issues];
  let sourceVerification = "BLOCKED_SOURCE_CACHE_MISSING";
  if (source) {
    const expectedPdf =
      "d8b6646599bc9a0c9616a4cb06d4b37461f8792f70a3171016d00fcd8eda09ad";
    const rows = sourceEntries(source.pages);
    if (
      source.pdfSha !== expectedPdf ||
      m.source.pdf_sha256 !== expectedPdf ||
      source.textSha !== m.source.extracted_text_sha256 ||
      rows.length !== 300 ||
      new Set(rows.map((x) => x.ordinal)).size !== 300 ||
      !source.pages[0].includes("2025-11") ||
      !source.pages[0].includes("2026-07")
    )
      fail("source_integrity_or_edition");
    for (const ev of verified) {
      const row = pkg.vocabulary.find((w) => w.id === ev.vocabulary_id),
        hit = rows.find((r) => r.ordinal === ev.evidence?.ordinal);
      if (
        !hit ||
        hit.term !== row.simplified ||
        hit.source_pinyin !== row.pinyin_marked ||
        [
          "source_term",
          "source_level_label",
          "pdf_page",
          "printed_page",
          "source_pinyin",
        ].some((k) => hit[k] !== ev.evidence[k])
      )
        fail("source_headword_reading_mismatch", ev.term);
    }
    if (verified.length !== m.source.selected_level1_headwords)
      fail("source_verified_count");
    sourceVerification = issues.length > publicIssues.length ? "FAIL" : "PASS";
  }
  let privateValidation = "BLOCKED_PRIVATE_STORE_MISSING";
  if (privateKeys) {
    const before = issues.length,
      parsed = keySchema.safeParse(privateKeys),
      questions = pkg.quizzes.flatMap((q) => q.questions);
    if (!parsed.success || privateKeys.package_id !== m.package_id)
      fail("private_answer_structure_invalid");
    else if (
      !sameSet(
        privateKeys.keys.map((k) => k.question_id),
        questions.map((q) => q.id),
      ) ||
      privateKeys.keys.some(
        (k) =>
          k.correct_index >=
          questions.find((q) => q.id === k.question_id)?.choices.length,
      )
    )
      fail("private_answer_cardinality_or_range");
    if (parsed.success) checkText(privateKeys, issues, "private_store");
    privateValidation = issues.length === before ? "PASS" : "FAIL";
  }
  return {
    ...summary(),
    status: issues.length
      ? "FAIL"
      : privateValidation !== "PASS" || sourceVerification !== "PASS"
        ? "BLOCKED"
        : "PASS",
    publicValidation: publicIssues.length ? "FAIL" : "PASS",
    privateValidation,
    sourceVerification,
    hskVerifiedHeadwords: verified.length,
    supplementaryWords: m.hsk_verification.filter(
      (x) => x.classification === "supplementary_outside_verified_list",
    ).length,
    unverifiedWords: m.hsk_verification.filter(
      (x) => x.classification === "unverified",
    ).length,
    humanReview: "pending_review",
    quizSemanticReview: "pending_review",
    pinyinSemanticReview: "pending_review",
    importReadiness: "BLOCKED",
  };
}
