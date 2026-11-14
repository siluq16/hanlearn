import { describe, it, expect } from "vitest";
import fs from "node:fs";
import {
  buildOwnerReviewPage,
  renderDocument,
  // @ts-expect-error Offline-only public document renderer.
} from "../scripts/prepare-owner-content-review.mjs";

describe("offline owner content review", () => {
  it("renders untrusted Markdown as inert text, including tables", () => {
    const html = renderDocument(
      "# <img src=x onerror=alert(1)>\n| a | b |\n|---|---|\n| <script>attack()</script> | [x](https://example.com) |",
    );
    expect(html).not.toMatch(/<(?:img|script|a)\b/);
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<table>");
    expect(html).not.toContain("<td>---</td>");
  });
  it("provides all public review documents, explicit notes and no approval automation", () => {
    const html = buildOwnerReviewPage();
    for (const file of [
      "VOCABULARY.md",
      "GRAMMAR.md",
      "LESSONS.md",
      "QUIZZES.md",
      "CATALOG_AND_RIGHTS.md",
      "HANLEARN_HSK1_R3_CONTENT_REVIEW.md",
    ])
      expect(html).toContain(file);
    expect(html).toContain("connect-src 'none'");
    expect(html).toContain("VIEWED_NOT_APPROVED");
    expect(html).not.toMatch(
      /fetch\(|XMLHttpRequest|localStorage|https?:\/\/.*?<script src=/,
    );
    expect(html).toContain('name="when" type="text"');
    expect(html).toContain("159 records");
    const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
    expect(script).toBeDefined();
    expect(script).not.toMatch(
      /innerHTML|\.submit\(|correct_index|explanation_vi/,
    );
  });
  it("keeps the binary question valid and derives a shared threshold from the RPC contract", () => {
    const sql = fs.readFileSync(
      "supabase/migrations/202611120003_quiz.sql",
      "utf8",
    );
    expect(sql).toContain("jsonb_array_length(choices) between 2 and 6");
    expect(sql).toContain("'passed',correct*100>=n*80");
    const sizes: number[] = [];
    for (const i of [1, 2, 3, 4]) {
      const q = JSON.parse(
        fs.readFileSync(
          `content/pilot-hsk1/v1/quizzes/lesson-0${i}.json`,
          "utf8",
        ),
      );
      expect(q.questions).toHaveLength(6);
      expect(q.quiz).not.toHaveProperty("pass_threshold");
      sizes.push(
        ...q.questions.map(
          (question: { choices: string[] }) => question.choices.length,
        ),
      );
      if (i === 3)
        expect(q.questions[3]).toMatchObject({
          id: "7dca8e38-6482-5716-87f8-0086c6f02b93",
          choices: ["二", "两"],
        });
    }
    expect(sizes.filter((n) => n === 2)).toHaveLength(1);
    expect(sizes.filter((n) => n === 4)).toHaveLength(23);
  });
});
