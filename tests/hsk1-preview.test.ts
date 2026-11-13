import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  loadPreview,
  assertPresentationModules,
  // @ts-expect-error Node-only offline tooling has no declaration file.
} from "../scripts/hsk1-preview-data.mjs";
// @ts-expect-error Node-only HTTP tool has no declaration file.
import { requestStatus } from "../scripts/hsk1-preview-server.mjs";
import { ContentProvenance } from "@/features/lessons/components/provenance";
import { LessonReader } from "@/features/lessons/components/lesson-reader";
import type { PreviewDataset } from "../tools/hsk1-preview/types";

describe("frozen public-only local preview", () => {
  it("renders one vocabulary audio notice and a single current reading section", () => {
    const data = loadPreview() as PreviewDataset;
    const html = renderToStaticMarkup(
      createElement(LessonReader, data.lessons[0]),
    );
    expect(html.match(/data-vocabulary-audio-notice/g)).toHaveLength(1);
    expect(html.match(/aria-current="location"/g)).toHaveLength(1);
    expect(html).toContain("Nghĩa &amp; cách dùng");
    expect(html).not.toContain(
      "Audio chưa khả dụng. Bạn vẫn có thể đọc từ và ví dụ.",
    );
    expect(html).not.toMatch(/studiedAt|completedAt|mark_lesson_studied/);
  });
  it("does not invent a section or audio notice for empty content", () => {
    const html = renderToStaticMarkup(
      createElement(LessonReader, {
        content: { version: 1, sections: [] },
        vocabulary: [],
        grammar: [],
      }),
    );
    expect(html).toContain("Chưa có phần nội dung");
    expect(html).not.toContain('aria-current="location"');
    expect(html).not.toContain("data-vocabulary-audio-notice");
  });
  it("validates r3 and projects all sections and linked catalog", () => {
    const data = loadPreview() as PreviewDataset;
    expect(data.revision).toBe(3);
    expect(data.lessons).toHaveLength(4);
    expect(
      data.lessons.reduce((n, l) => n + l.content.sections.length, 0),
    ).toBe(29);
    expect(
      new Set(data.lessons.flatMap((l) => l.vocabulary.map((w) => w.id))).size,
    ).toBe(44);
    expect(
      new Set(data.lessons.flatMap((l) => l.grammar.map((g) => g.id))).size,
    ).toBe(12);
    expect(data.lessons.reduce((n, l) => n + l.vocabulary.length, 0)).toBe(66);
    for (const l of data.lessons)
      for (const s of l.content.sections) {
        if (s.type === "vocabulary_refs")
          for (const id of s.vocabularyIds)
            expect(l.vocabulary.some((w) => w.id === id)).toBe(true);
        if (s.type === "grammar_refs")
          for (const id of s.grammarIds)
            expect(l.grammar.some((g) => g.id === id)).toBe(true);
      }
    expect(JSON.stringify(data)).not.toMatch(
      /correct_index|explanation_vi|quiz_bindings|SYNTHETIC LOCAL|studiedAt|completedAt|"quizzes"/,
    );
  });
  it("keeps draft review metadata truthful", () => {
    const html = renderToStaticMarkup(
      createElement(ContentProvenance, {
        value: {
          sourceUri: "urn:test",
          license: "pending-rights-review",
          reviewedAt: null,
          reviewedBy: null,
        },
      }),
    );
    expect(html).toContain("Chưa ghi nhận");
    expect(html).not.toContain("<time");
  });
  it("rejects backend, private filesystem and mutation imports", () => {
    for (const id of [
      "/src/features/auth/access.ts",
      "/src/features/lessons/actions.ts",
      "/node_modules/@supabase/client.js",
      "/repo/.local/private.json",
    ])
      expect(() => assertPresentationModules([id])).toThrow();
    expect(() =>
      assertPresentationModules([
        "/src/features/lessons/components/lesson-reader.tsx",
      ]),
    ).not.toThrow();
  });
  it("fails closed for host, origin, methods and non-generated paths", () => {
    const paths = new Map([["/", true]]);
    const req = {
      method: "GET",
      url: "/?lesson=2",
      headers: { host: "127.0.0.1:3114" },
      socket: { remoteAddress: "127.0.0.1" },
    };
    expect(requestStatus(req, paths)).toBe(200);
    expect(requestStatus({ ...req, method: "POST" }, paths)).toBe(405);
    expect(
      requestStatus(
        { ...req, headers: { ...req.headers, origin: "https://evil.example" } },
        paths,
      ),
    ).toBe(403);
    expect(
      requestStatus({ ...req, headers: { host: "localhost:3114" } }, paths),
    ).toBe(403);
    expect(
      requestStatus(
        { ...req, socket: { remoteAddress: "192.168.1.2" } },
        paths,
      ),
    ).toBe(403);
    for (const url of [
      "/.env",
      "/@fs/D:/repo/.local/answers.json",
      "/content/pilot-hsk1/v1/manifest.json",
      "/api",
      "/%2e%2e/.local",
    ])
      expect(requestStatus({ ...req, url }, paths)).toBe(404);
  });
});
