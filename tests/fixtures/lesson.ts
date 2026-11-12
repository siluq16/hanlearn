// SYNTHETIC LOCAL TEST FIXTURE. Not an official HSK lesson or authorized pilot.
export const lessonIds = {
  user: "10000000-0000-4000-8000-000000000001",
  other: "10000000-0000-4000-8000-000000000002",
  lesson: "20000000-0000-4000-8000-000000000001",
  unit: "30000000-0000-4000-8000-000000000001",
  course: "40000000-0000-4000-8000-000000000001",
  syllabus: "50000000-0000-4000-8000-000000000001",
  word: "60000000-0000-4000-8000-000000000001",
  grammar: "70000000-0000-4000-8000-000000000001",
};
export function lessonFixture() {
  const id = lessonIds;
  const publication = {
    status: "published",
    review_status: "approved",
    source_uri: "urn:hanlearn:test-only",
    content_license: "synthetic-test-only",
    reviewed_by: "Local test fixture",
    reviewed_at: "2026-11-12T10:00:00Z",
  };
  return {
    lesson: {
      id: id.lesson,
      unit_id: id.unit,
      title: "Bài kiểm thử giao diện — không phải giáo trình HSK",
      objective_vi:
        "Kiểm tra cách hiển thị nội dung tổng hợp local, không dùng làm nội dung học chính thức.",
      estimated_minutes: 15,
      ...publication,
      content: {
        version: 1,
        sections: [
          {
            id: "intro",
            title: "Văn bản kiểm thử",
            type: "text",
            blocks: [
              {
                type: "paragraph",
                text: "Đây là fixture tổng hợp, chỉ phục vụ kiểm thử.",
                lang: "vi",
              },
              {
                type: "example",
                hanzi: "学习",
                pinyin: "xuéxí",
                translationVi: "Ví dụ tổng hợp để kiểm thử hiển thị.",
              },
            ],
          },
          {
            id: "words",
            title: "Từ vựng kiểm thử",
            type: "vocabulary_refs",
            vocabularyIds: [id.word],
          },
          {
            id: "grammar",
            title: "Ngữ pháp kiểm thử",
            type: "grammar_refs",
            grammarIds: [id.grammar],
          },
          {
            id: "listening",
            title: "Phần nghe chưa có audio",
            type: "listening",
            audioAssetId: null,
            transcript: [
              {
                type: "example",
                hanzi: "学习",
                pinyin: "xuéxí",
                translationVi: "Bản chữ tổng hợp.",
              },
            ],
          },
        ],
      },
    },
    unit: {
      id: id.unit,
      course_id: id.course,
      title: "Unit tổng hợp",
      ...publication,
    },
    course: {
      id: id.course,
      syllabus_id: id.syllabus,
      title: "Course kiểm thử",
      hsk_level: 1,
      ...publication,
    },
    syllabus: {
      id: id.syllabus,
      code: "LOCAL-TEST",
      display_name: "Syllabus kiểm thử",
      verified_at: "2026-11-12T10:00:00Z",
      ...publication,
    },
    vocabularyLinks: [
      { lesson_id: id.lesson, vocabulary_id: id.word, sort_order: 2 },
    ],
    grammarLinks: [
      { lesson_id: id.lesson, grammar_id: id.grammar, sort_order: 1 },
    ],
    vocabulary: [
      {
        id: id.word,
        simplified: "学习",
        traditional: null,
        pinyin_marked: "xuéxí",
        meaning_vi: "Học — dữ liệu tổng hợp để kiểm thử",
        example_zh: "学习",
        example_pinyin: "xuéxí",
        example_vi: "Ví dụ local.",
        ...publication,
      },
    ],
    grammar: [
      {
        id: id.grammar,
        title: "Mẫu ngữ pháp kiểm thử",
        pattern: "学习",
        explanation_vi:
          "Giải thích tổng hợp dùng để kiểm thử giao diện, không phải giáo trình.",
        examples: [
          { hanzi: "学习", pinyin: "xuéxí", translationVi: "Ví dụ tổng hợp." },
        ],
        ...publication,
      },
    ],
    progress: {
      user_id: id.user,
      lesson_id: id.lesson,
      studied_at: "2026-11-12T10:00:00Z",
      completed_at: null,
    },
  };
}
