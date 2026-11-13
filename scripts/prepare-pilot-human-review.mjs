// Reads public draft files only. Never loads .env, private answers, or a DB client.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
export const sourceRoot = "content/pilot-hsk1/v1";
export const packetRoot = "docs/human-review/pilot-hsk1-r2";
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const text = (v) =>
  String(v ?? "")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const json = (v) => JSON.stringify(v, null, 2) + "\n";
export function buildHumanReview() {
  const m = read(sourceRoot + "/manifest.json");
  if (m.draft_revision !== 2 || m.import_authorized || m.publish_authorized)
    throw Error("Expected pending revision 2");
  const expectedFiles = [
    "vocabulary.json",
    "grammar.json",
    "rights-manifest.json",
    ...[1, 2, 3, 4].flatMap((i) => [
      `lessons/lesson-0${i}.json`,
      `quizzes/lesson-0${i}.json`,
    ]),
  ].sort();
  if (
    JSON.stringify(m.files.map((f) => f.path).sort()) !==
      JSON.stringify(expectedFiles) ||
    m.lessons.length !== 4 ||
    m.lessons.some(
      (l, i) =>
        l.file !== `lessons/lesson-0${i + 1}.json` ||
        l.quiz_file !== `quizzes/lesson-0${i + 1}.json`,
    )
  )
    throw Error("Unexpected public source paths");
  const files = ["manifest.json", ...m.files.map((f) => f.path)]
    .sort()
    .map((file) => ({
      path: file,
      sha256: sha(fs.readFileSync(path.join(sourceRoot, file))),
    }));
  if (
    m.files.some(
      (f) => files.find((x) => x.path === f.path)?.sha256 !== f.sha256,
    )
  )
    throw Error("Source hashes changed");
  const manifestSha = files.find((f) => f.path === "manifest.json").sha256;
  const snapshot = {
    package_id: m.package_id,
    draft_revision: 2,
    source_root: sourceRoot,
    manifest_sha256: manifestSha,
    // Digest of sorted public {path,sha256} entries encoded by JSON.stringify (no newline).
    package_snapshot_sha256: sha(JSON.stringify(files)),
    files,
  };
  const vocabulary = read(sourceRoot + "/vocabulary.json");
  const grammar = read(sourceRoot + "/grammar.json");
  const rights = read(sourceRoot + "/rights-manifest.json");
  const lessons = m.lessons.map((l) => read(sourceRoot + "/" + l.file));
  const quizzes = m.lessons.map((l) => read(sourceRoot + "/" + l.quiz_file));
  const rows = [];
  const add = (id, kind, label, file, pointer, value, focus, extra = {}) =>
    rows.push({
      stable_id: id,
      kind,
      label,
      source_file: file,
      json_pointer: pointer,
      content_to_review: focus,
      review_status: "PENDING",
      comments: "",
      proposed_change: "",
      reviewer: "",
      reviewed_at: "",
      package_id: m.package_id,
      draft_revision: 2,
      source_file_sha256: files.find((f) => f.path === file).sha256,
      public_item_sha256:
        kind === "private_explanation" ? "" : sha(JSON.stringify(value)),
      manifest_sha256: manifestSha,
      package_snapshot_sha256: snapshot.package_snapshot_sha256,
      quiz_revision: "",
      changed_in_remediation: "",
      requires_private_view: false,
      ...extra,
    });
  const header = (title) =>
    `# ${title}\n\nDraft revision 2 — chỉ là hồ sơ chờ người duyệt. Không có human PASS.\n\nManifest SHA-256: \`${manifestSha}\`.\n\nPackage snapshot SHA-256: \`${snapshot.package_snapshot_sha256}\`.\n\nGhi quyết định theo stable_id trong REVIEW_REGISTER; không sửa nội dung nguồn.\n\n`;
  const example = (e) =>
    `- Chữ Hán: ${text(e.hanzi)}\n- Pinyin: ${text(e.pinyin)}\n- Tiếng Việt: ${text(e.translationVi)}\n\n`;
  const provenance = (x) =>
    `Xuất xứ biên soạn: ${text(x.source_uri)}. Quyền: ${text(x.content_license)}; chưa được duyệt.\n\n`;
  let vocabDoc = header("44 mục từ cần duyệt");
  vocabulary.forEach((v, i) => {
    const ev = m.hsk_verification.find((x) => x.vocabulary_id === v.id);
    add(
      v.id,
      "vocabulary",
      v.simplified,
      "vocabulary.json",
      `/${i}`,
      v,
      "Hanzi/pinyin, thanh nhẹ, nghĩa Việt, từ loại/sense, ví dụ/cụm/câu, source headword khác sense và rights.",
    );
    vocabDoc += `## ${i + 1}. ${text(v.simplified)} — ${text(v.pinyin_marked)}\n\nStable ID: \`${v.id}\`.\n\nNghĩa: ${text(v.meaning_vi)}\n\nTừ loại: ${text(v.part_of_speech)}; sense: ${text(v.sense_key)}.\n\n`;
    vocabDoc += example({
      hanzi: v.example_zh,
      pinyin: v.example_pinyin,
      translationVi: v.example_vi,
    });
    vocabDoc +=
      provenance(v) +
      `HSK: **${ev.classification}**; sense vẫn ${ev.sense_review_state}.\n\n`;
    if (ev.evidence)
      vocabDoc += `Nguồn đối chiếu: [${ev.evidence.source_id}](${m.source.source_uri}), edition ${m.source.edition}; ordinal ${ev.evidence.ordinal}, term ${text(ev.evidence.source_term)}, nhãn ${text(ev.evidence.source_level_label)}, reading ${ev.evidence.source_pinyin}; PDF ${ev.evidence.pdf_page}, trang in ${ev.evidence.printed_page}; đối chiếu máy ${ev.machine_checked_on}.\n\n`;
    else vocabDoc += `Không có evidence membership cấp 1. ${text(ev.note)}\n\n`;
  });
  let grammarDoc = header("12 điểm ngữ pháp cần duyệt");
  grammar.forEach((g, i) => {
    const ev = m.grammar_verification.find((x) => x.grammar_id === g.id);
    add(
      g.id,
      "grammar",
      g.title,
      "grammar.json",
      `/${i}`,
      g,
      "Mẫu/giải thích/ví dụ, chủ ngữ-vị ngữ, cụm/câu, 二/两, 一/不, 个/口, scope/sense nguồn.",
    );
    grammarDoc += `## ${i + 1}. ${text(g.title)}\n\nStable ID: \`${g.id}\`.\n\nMẫu: ${text(g.pattern)}\n\n${text(g.explanation_vi)}\n\n`;
    g.examples.forEach((e) => {
      grammarDoc += example(e);
    });
    grammarDoc +=
      provenance(g) +
      `Đối chiếu: [${ev.source_id}](${m.source.source_uri}), PDF ${ev.pdf_page}, trang in ${ev.printed_page}, category nội bộ ${ev.source_category}; ${ev.alignment_state}. Không phải phê duyệt mọi cách dùng.\n\n`;
  });
  let lessonDoc = header("4 bài học — 29 sections");
  let quizDoc = header("24 câu quiz — không kèm đáp án");
  const changed = [
    [1, 4, 6],
    [1, 2, 3, 4, 5, 6],
    [3, 4],
    [4, 5, 6],
  ];
  lessons.forEach((l, i) => {
    const lm = m.lessons[i],
      q = quizzes[i];
    add(
      l.id,
      "lesson",
      l.title,
      lm.file,
      "",
      l,
      "Mục tiêu, thời lượng, trình tự/độ khó, tự nhiên hội thoại; bài 3 ba lượt 6/6/3 và 40 phút cần thử.",
    );
    lessonDoc +=
      `## Bài ${i + 1}. ${text(l.title)}\n\nStable ID: \`${l.id}\`. Thời lượng dự kiến ${l.estimated_minutes} phút.\n\nMục tiêu: ${text(l.objective_vi)}\n\n` +
      provenance(l);
    l.content.sections.forEach((s, j) => {
      add(
        `${l.id}/${s.id}`,
        "section",
        `L${i + 1} ${s.id} — ${s.title}`,
        lm.file,
        `/content/sections/${j}`,
        s,
        "Đọc toàn section, pinyin/translation, ngữ cảnh lượt nói, refs đúng nhóm, cụm/câu/lời đáp; không có audio để chấm phát âm thực.",
      );
      lessonDoc += `### ${s.id} — ${text(s.title)} (${s.type})\n\nStable ID: \`${l.id}/${s.id}\`.\n\n`;
      if (s.type === "text")
        s.blocks.forEach((b) => {
          lessonDoc +=
            b.type === "paragraph" ? text(b.text) + "\n\n" : example(b);
        });
      if (s.type === "listening") {
        lessonDoc += "Audio chưa có; chỉ duyệt transcript.\n\n";
        s.transcript.forEach((b) => {
          lessonDoc += example(b);
        });
      }
      if (s.type === "vocabulary_refs")
        s.vocabularyIds.forEach((id) => {
          const v = vocabulary.find((v) => v.id === id);
          lessonDoc += `- ${v.simplified} — ${v.pinyin_marked} — ${v.meaning_vi} (\`${id}\`)\n`;
        });
      if (s.type === "grammar_refs")
        s.grammarIds.forEach((id) => {
          lessonDoc += `- ${grammar.find((g) => g.id === id).title} (\`${id}\`)\n`;
        });
      lessonDoc += "\n";
    });
    add(
      q.quiz.id,
      "quiz",
      `L${i + 1} quiz revision 2`,
      lm.quiz_file,
      "/quiz",
      q.quiz,
      "Phạm vi từ đã học, 6 câu và mức độ khó; không chấp thuận grading trước khi duyệt từng câu/private explanation.",
      { quiz_revision: 2 },
    );
    quizDoc += `## Quiz bài ${i + 1} — ${text(l.title)}\n\nQuiz ID: \`${q.quiz.id}\`, revision ${q.quiz.revision}.\n\nNgữ cảnh học: ${text(l.objective_vi)}\n\nTham khảo đầy đủ hội thoại/sections bài ${i + 1} trong LESSONS.md.\n\n`;
    q.questions.forEach((question, j) => {
      const label = `L${i + 1}-Q${j + 1}`,
        isChanged = changed[i].includes(j + 1);
      const focus =
        label === "L2-Q1"
          ? "Ưu tiên: câu hỏi tên đứng riêng, chưa có lượt giới thiệu; đúng một lựa chọn phù hợp, không nhận mẫu hỏi tiếp phụ thuộc ngữ cảnh."
          : "Đúng một lựa chọn phù hợp với toàn stem, distractors cùng phạm vi kiến thức, không suy từ formatting.";
      add(
        question.id,
        "question",
        label,
        lm.quiz_file,
        `/questions/${j}`,
        question,
        focus,
        { quiz_revision: 2, changed_in_remediation: isChanged },
      );
      add(
        `private/${question.id}`,
        "private_explanation",
        `${label} — attestation riêng`,
        lm.quiz_file,
        `/questions/${j}`,
        null,
        "Chỉ mở private viewer: tự giải trước, đối chiếu key, đọc toàn explanation và từng distractor; không ghi nội dung giải vào register chung.",
        {
          quiz_revision: 2,
          requires_private_view: true,
          changed_in_remediation: isChanged,
        },
      );
      quizDoc += `### ${label}${isChanged ? " — ĐÃ ĐỔI trong remediation" : " — wording giữ nguyên, vẫn phải duyệt"}\n\nStable ID: \`${question.id}\`.\n\n${text(question.prompt)}\n\n`;
      question.choices.forEach((choice, k) => {
        quizDoc += `${String.fromCharCode(65 + k)}. ${text(choice)}\n\n`;
      });
      quizDoc += `Cần xác nhận: ${focus}\n\nAttestation riêng: \`private/${question.id}\`. Không điền đáp án vào hồ sơ chung.\n\n`;
    });
  });
  let catalogDoc = header("Catalog, nguồn và quyền sử dụng");
  for (const name of ["syllabus", "course", "unit"]) {
    add(
      m[name].id,
      name,
      name,
      "manifest.json",
      `/${name}`,
      m[name],
      "Ancestry, edition/phạm vi pilot, inactive/draft, source/license chưa được người duyệt ký.",
    );
    catalogDoc += `## ${name}\n\n${Object.entries(m[name])
      .map(
        ([k, v]) =>
          `- ${k}: ${text(typeof v === "object" ? JSON.stringify(v) : v)}`,
      )
      .join("\n")}\n\n`;
  }
  catalogDoc += `## Nguồn HSK\n\n${Object.entries(m.source)
    .map(
      ([k, v]) =>
        `- ${k}: ${text(typeof v === "object" ? JSON.stringify(v) : v)}`,
    )
    .join(
      "\n",
    )}\n\nHeadword/reading đã đối chiếu máy khác với human sense review và quyền sử dụng. Không trộn phiên bản nguồn. 越南 vẫn bổ trợ; không cộng vào membership cấp 1.\n\n## Rights manifest (đầy đủ)\n\n`;
  catalogDoc += "```json\n" + JSON.stringify(rights, null, 2) + "\n```\n";
  rights.scopes.forEach((scope, i) =>
    add(
      `rights/scope-${i + 1}`,
      "rights",
      scope,
      "rights-manifest.json",
      `/scopes/${i}`,
      scope,
      "Nguyên gốc/AI assistance, quyền phân phối cụ thể, người có thẩm quyền và cách attribution; ghi bằng chứng, không coi pending-rights-review là giấy phép.",
    ),
  );
  add(
    "rights/source-cti-hsk-2025-11",
    "rights",
    "Nguồn HSK / attribution",
    "rights-manifest.json",
    "/sources/0",
    rights.sources[0],
    "Đối chiếu đúng URI/version/phạm vi sử dụng; xác nhận quyền dùng factual headwords/readings và attribution, không suy website công khai = license.",
  );
  const focuses = [
    [
      "l2-q1",
      "Stem L2-Q1",
      "Tự đọc khi chưa có ngữ cảnh tên; đúng một lựa chọn phù hợp, đối chiếu private riêng.",
    ],
    [
      "changed-14",
      "14 câu đã đổi",
      "L1 Q1/Q4/Q6; L2 Q1–Q6; L3 Q3/Q4; L4 Q4–Q6: ký từng question và private attestation, không duyệt gộp.",
    ],
    [
      "private-24",
      "24 explanations revision 2",
      "Đọc toàn văn 24 giải thích trong private viewer, từng distractor hợp lý; public register chỉ attestation, không giải thích/đáp án.",
    ],
    [
      "pinyin",
      "Pinyin và thanh điệu",
      "44 heads và mọi câu, thanh nhẹ, viết hoa/tách từ, thanh gốc và nhịp; audio chưa có nên không đánh dấu pronunciation audio PASS.",
    ],
    [
      "numerals-classifiers",
      "二/两 và 个/口",
      "Phân biệt chuỗi đếm với trước lượng từ/giờ; giới hạn household, tháng/thứ dùng 二.",
    ],
    [
      "sandhi",
      "一/不 và chuỗi thanh 3",
      "yī/yí ge, bù/bú shì, gè/ge; không đổi máy móc mọi thanh 3; cần người dạy xác nhận giải thích.",
    ],
    [
      "lesson-3",
      "Bài 3 — 6/6/3",
      "Thử ba lượt, hoạt động nhớ lại, ví dụ không đòi chữ lượt sau; ghi thời lượng thực, khó ở đâu và đề xuất, không suy 40 phút đã tối ưu.",
    ],
    [
      "dialogues",
      "Tự nhiên hội thoại",
      "Đọc theo vai cả 4 bài: đúng ngữ cảnh, household giả định độc lập, cụm/câu/lời đáp và ba tình huống thời gian riêng.",
    ],
  ];
  for (const [id, label, focus] of focuses)
    add(`focus/${id}`, "focus", label, "manifest.json", "", m, focus);
  const counts = Object.fromEntries(
    [...new Set(rows.map((r) => r.kind))].map((k) => [
      k,
      rows.filter((r) => r.kind === k).length,
    ]),
  );
  snapshot.review_counts = counts;
  snapshot.review_rows = rows.length;
  const outputs = {
    "VOCABULARY.md": vocabDoc,
    "GRAMMAR.md": grammarDoc,
    "LESSONS.md": lessonDoc,
    "QUIZZES.md": quizDoc,
    "CATALOG_AND_RIGHTS.md": catalogDoc,
    "SOURCE_SNAPSHOT.json": json(snapshot),
    "REVIEW_REGISTER.template.json": json(rows),
  };
  const columns = Object.keys(rows[0]);
  const csv = (v) => '"' + String(v ?? "").replaceAll('"', '""') + '"';
  outputs["REVIEW_REGISTER.template.csv"] =
    "\uFEFF" +
    [
      columns.map(csv).join(","),
      ...rows.map((r) => columns.map((c) => csv(r[c])).join(",")),
    ].join("\r\n") +
    "\r\n";
  for (const file of Object.keys(outputs).filter((file) => file.endsWith(".md")))
    outputs[file] = outputs[file].trimEnd() + "\n";
  return { outputs, snapshot };
}
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { outputs, snapshot } = buildHumanReview();
  fs.mkdirSync(packetRoot, { recursive: true });
  for (const file of [
    "REVIEW_REGISTER.template.json",
    "REVIEW_REGISTER.template.csv",
  ]) {
    const target = path.join(packetRoot, file);
    if (
      fs.existsSync(target) &&
      fs.readFileSync(target, "utf8") !== outputs[file]
    )
      throw Error(
        "Existing review template differs; preserve reviewer work and prepare a separately versioned packet.",
      );
  }
  for (const [file, body] of Object.entries(outputs))
    fs.writeFileSync(path.join(packetRoot, file), body);
  console.log(
    JSON.stringify({
      scope: "PUBLIC_OFFLINE_HUMAN_REVIEW_PREPARATION",
      rows: snapshot.review_rows,
      counts: snapshot.review_counts,
      package_snapshot_sha256: snapshot.package_snapshot_sha256,
      allDecisions: "PENDING",
    }),
  );
}
