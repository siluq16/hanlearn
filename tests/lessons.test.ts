import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { lessonContentSchema } from "@/features/lessons/schemas";
import { buildLessonBundle } from "@/features/lessons/model";
import { LessonView } from "@/features/lessons/components/lesson-view";
import {
  LessonUnavailable,
  InvalidLessonContent,
  LessonLoading,
} from "@/features/lessons/components/lesson-states";
import { safeSourceHref } from "@/features/lessons/components/provenance";
import { lessonFixture, lessonIds } from "./fixtures/lesson";

describe("Content V1 strict structure", () => {
  it("enforces the total serialized budget even within per-block limits", () => {
    const value = {
      version: 1,
      sections: [
        {
          id: "large",
          title: "Text",
          type: "text",
          blocks: Array.from({ length: 30 }, () => ({
            type: "paragraph",
            text: "x".repeat(3900),
          })),
        },
      ],
    };
    expect(lessonContentSchema.safeParse(value).success).toBe(false);
  });
  it("accepts four section types and an explicit empty V1", () => {
    expect(
      lessonContentSchema.safeParse(lessonFixture().lesson.content).success,
    ).toBe(true);
    expect(
      lessonContentSchema.safeParse({ version: 1, sections: [] }).success,
    ).toBe(true);
  });
  it.each([
    {},
    null,
    "{}",
    { version: 2, sections: [] },
    { version: 1, sections: [], answerKey: 0 },
  ])("rejects malformed/legacy/unknown root shape %j", (value) => {
    expect(lessonContentSchema.safeParse(value).success).toBe(false);
  });
  it.each([
    "<script>alert(1)</script>",
    "<img src=x onerror=alert(1)>",
    "<iframe src=x>",
    "\u0000",
  ])("rejects markup/control payload %s", (text) => {
    const c = lessonFixture().lesson.content;
    c.sections[0] = {
      id: "x",
      title: "Text",
      type: "text",
      blocks: [{ type: "paragraph", text, lang: "vi" }],
    } as (typeof c.sections)[0];
    expect(lessonContentSchema.safeParse(c).success).toBe(false);
  });
  it("rejects hidden key/embed/audio URL fields at nested boundaries", () => {
    for (const extra of [
      { correct_index: 0 },
      { answer_key: { correct: 1 } },
      { html: "text" },
      { audioUrl: "https://example.invalid/audio.mp3" },
    ]) {
      const c = lessonFixture().lesson.content;
      Object.assign(c.sections[3], extra);
      expect(lessonContentSchema.safeParse(c).success).toBe(false);
    }
    const c = lessonFixture().lesson.content;
    Object.assign(c.sections[0].blocks![0], { answerKey: 1 });
    expect(lessonContentSchema.safeParse(c).success).toBe(false);
  });
  it("bounds section/block/text counts and requires unique section/ref IDs", () => {
    const c = lessonFixture().lesson.content;
    expect(
      lessonContentSchema.safeParse({
        ...c,
        sections: Array(31).fill(c.sections[0]),
      }).success,
    ).toBe(false);
    expect(
      lessonContentSchema.safeParse({
        ...c,
        sections: [c.sections[0], c.sections[0]],
      }).success,
    ).toBe(false);
    expect(
      lessonContentSchema.safeParse({
        version: 1,
        sections: [
          {
            id: "x",
            title: "Text",
            type: "text",
            blocks: [{ type: "paragraph", text: "x".repeat(4001) }],
          },
        ],
      }).success,
    ).toBe(false);
    expect(
      lessonContentSchema.safeParse({
        version: 1,
        sections: [
          {
            id: "x",
            title: "Words",
            type: "vocabulary_refs",
            vocabularyIds: [lessonIds.word, lessonIds.word],
          },
        ],
      }).success,
    ).toBe(false);
    const many = Array.from({ length: 2 }, (_, i) => ({
      id: "s" + i,
      title: "Text",
      type: "text",
      blocks: Array.from({ length: 60 }, () => ({
        type: "paragraph",
        text: "x",
      })),
    }));
    expect(
      lessonContentSchema.safeParse({ version: 1, sections: many }).success,
    ).toBe(false);
  });
});
describe("LessonBundle publication/ownership boundaries", () => {
  it("keeps joined vocabulary in persisted sort order regardless of query row order", () => {
    const data = lessonFixture(),
      second = "60000000-0000-4000-8000-000000000002";
    data.vocabularyLinks.push({
      lesson_id: lessonIds.lesson,
      vocabulary_id: second,
      sort_order: 1,
    });
    data.vocabulary.push({ ...data.vocabulary[0], id: second });
    const result = buildLessonBundle(data, lessonIds.user);
    expect(
      result?.kind === "ready" && result.bundle.vocabulary.map((w) => w.id),
    ).toEqual([second, lessonIds.word]);
  });
  it("accepts a new learner with no saved progress without fabricating completion", () => {
    const data = lessonFixture();
    Object.assign(data, { progress: null });
    const result = buildLessonBundle(data, lessonIds.user);
    expect(result?.kind === "ready" && result.bundle.progress).toEqual({
      studiedAt: null,
      completedAt: null,
    });
  });
  it("projects exact safe DTO and never returns owner/raw rows", () => {
    const result = buildLessonBundle(lessonFixture(), lessonIds.user);
    expect(result?.kind).toBe("ready");
    if (result?.kind !== "ready") throw Error();
    expect(result.bundle.progress.studiedAt).toBeTruthy();
    expect(result.bundle.vocabulary[0].audio.status).toBe("unavailable");
    for (const field of [
      "user_id",
      "review_status",
      "correct_index",
      "submission_payload",
      "storage_path",
    ])
      expect(JSON.stringify(result.bundle)).not.toContain(`"${field}"`);
  });
  it.each(["lesson", "unit", "course", "syllabus"] as const)(
    "does not disclose draft %s metadata",
    (name) => {
      const data = lessonFixture();
      data[name].status = "draft";
      expect(buildLessonBundle(data, lessonIds.user)).toBeNull();
    },
  );
  it("requires approved provenance and linked published ancestry", () => {
    const data = lessonFixture();
    data.unit.course_id = lessonIds.other;
    expect(buildLessonBundle(data, lessonIds.user)).toBeNull();
    const other = lessonFixture();
    other.syllabus.verified_at = "invalid";
    expect(buildLessonBundle(other, lessonIds.user)).toBeNull();
  });
  it("rejects vocabulary/grammar refs outside this lesson or hidden leaf rows", () => {
    for (const name of ["vocabularyLinks", "grammarLinks"] as const) {
      const data = lessonFixture();
      data[name][0].lesson_id = lessonIds.other;
      expect(buildLessonBundle(data, lessonIds.user)).toEqual({
        kind: "invalid-content",
      });
    }
    const data = lessonFixture();
    data.vocabulary = [];
    expect(buildLessonBundle(data, lessonIds.user)).toEqual({
      kind: "invalid-content",
    });
    const unknown = lessonFixture();
    unknown.grammarLinks = [];
    unknown.grammar = [];
    expect(buildLessonBundle(unknown, lessonIds.user)).toEqual({
      kind: "invalid-content",
    });
  });
  it("rejects duplicate/draft/unreviewed catalog rows and invalid grammar JSON", () => {
    const duplicate = lessonFixture();
    duplicate.vocabulary.push({ ...duplicate.vocabulary[0] });
    expect(buildLessonBundle(duplicate, lessonIds.user)?.kind).toBe(
      "invalid-content",
    );
    const draft = lessonFixture();
    draft.grammar[0].status = "draft";
    expect(buildLessonBundle(draft, lessonIds.user)?.kind).toBe(
      "invalid-content",
    );
    const bad = lessonFixture();
    Object.assign(bad.grammar[0], { examples: { html: "<script>" } });
    expect(buildLessonBundle(bad, lessonIds.user)?.kind).toBe(
      "invalid-content",
    );
  });
  it("rejects another learner's progress and completion without study", () => {
    const data = lessonFixture();
    data.progress.user_id = lessonIds.other;
    expect(buildLessonBundle(data, lessonIds.user)).toEqual({
      kind: "invalid-content",
    });
    const bad = lessonFixture();
    Object.assign(bad.progress, {
      studied_at: null,
      completed_at: "2026-11-12T10:00:00Z",
    });
    expect(buildLessonBundle(bad, lessonIds.user)?.kind).toBe(
      "invalid-content",
    );
  });
  it("rereads saved state, never caches a synthetic completion", () => {
    const data = lessonFixture();
    const first = buildLessonBundle(data, lessonIds.user);
    Object.assign(data.progress, { completed_at: "2026-11-12T11:00:00Z" });
    const second = buildLessonBundle(data, lessonIds.user);
    expect(
      first?.kind === "ready" && first.bundle.progress.completedAt,
    ).toBeNull();
    expect(second?.kind === "ready" && second.bundle.progress.completedAt).toBe(
      "2026-11-12T11:00:00Z",
    );
  });
  it("fails safely for malformed content without leaking raw JSON", () => {
    const data = lessonFixture();
    Object.assign(data.lesson, {
      content: { version: 1, sections: [], answerKey: "secret-test-marker" },
    });
    expect(buildLessonBundle(data, lessonIds.user)).toEqual({
      kind: "invalid-content",
    });
  });
});
describe("safe read-only lesson presentation", () => {
  it("renders progress/provenance/audio-unavailable without mutation controls", () => {
    const data = buildLessonBundle(lessonFixture(), lessonIds.user);
    if (data?.kind !== "ready") throw Error();
    const html = renderToStaticMarkup(
      createElement(LessonView, { bundle: data.bundle }),
    );
    expect(html).toContain("Tiến độ đã lưu");
    expect(html).toContain("Đã xác nhận học");
    expect(html).toContain("Audio");
    expect(html).toContain("synthetic-test-only");
    expect(html).not.toContain("<audio");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("Lưu tiến độ");
  });
  it("React escapes a bypassed malicious DTO; source links cannot execute script", () => {
    const data = buildLessonBundle(lessonFixture(), lessonIds.user);
    if (data?.kind !== "ready") throw Error();
    data.bundle.lesson.title = '<img src=x onerror="alert(1)">';
    data.bundle.lesson.provenance.sourceUri = "javascript:alert(1)";
    const html = renderToStaticMarkup(
      createElement(LessonView, { bundle: data.bundle }),
    );
    expect(html).toContain("&lt;img");
    expect(html).not.toContain("<img");
    expect(html).not.toContain('href="javascript:');
    expect(safeSourceHref("https://user:password@example.invalid")).toBeNull();
    expect(safeSourceHref("urn:hanlearn:test")).toBeNull();
  });
  it("has explicit empty/invalid/unavailable/loading states without parent metadata", () => {
    const unavailable = renderToStaticMarkup(createElement(LessonUnavailable));
    expect(unavailable).toContain("Bài học chưa khả dụng");
    expect(unavailable).not.toContain("Course kiểm thử");
    expect(renderToStaticMarkup(createElement(InvalidLessonContent))).toContain(
      'role="alert"',
    );
    expect(renderToStaticMarkup(createElement(LessonLoading))).toContain(
      'role="status"',
    );
    const data = buildLessonBundle(lessonFixture(), lessonIds.user);
    if (data?.kind !== "ready") throw Error();
    data.bundle.content.sections = [];
    data.bundle.vocabulary = [];
    data.bundle.grammar = [];
    expect(
      renderToStaticMarkup(createElement(LessonView, { bundle: data.bundle })),
    ).toContain("Chưa có phần nội dung");
  });
});
