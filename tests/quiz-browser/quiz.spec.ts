import { test, expect } from "@playwright/test";
import fs from "node:fs";
test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    expect(new URL(route.request().url()).origin).toBe("http://127.0.0.1:3105");
    expect(["GET", "HEAD"]).toContain(route.request().method());
    await route.continue();
  });
});
test("explicit start, keyboard answers, confirmation, DB receipt and reload", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(
    page.getByText("Chưa bắt đầu lượt làm mới.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(0);
  await page.getByRole("button", { name: "Bắt đầu quiz", exact: true }).click();
  const radio = page.getByRole("radio").first();
  await expect(radio).toBeVisible();
  await radio.focus();
  await page.keyboard.press("Space");
  await expect(radio).toBeChecked();
  await page.getByRole("button", { name: "Câu tiếp", exact: true }).click();
  await expect(page.locator("#quiz-question")).toBeFocused();
  await page.getByRole("radio").last().check();
  await page.getByRole("button", { name: "Câu trước", exact: true }).click();
  await expect(page.getByRole("radio").first()).toBeChecked();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Câu tiếp", exact: true }).click();
    if (i > 0) await page.getByRole("radio").first().check();
  }
  fs.mkdirSync(".local/previews", { recursive: true });
  await page.screenshot({
    path: `.local/previews/${info.project.name}-question.png`,
  });
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Nộp lượt làm này?" }),
  ).toBeFocused();
  await expect(page.getByText(/Còn 1 câu bỏ trống/)).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận nộp", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Kết quả: Đạt", exact: true }),
  ).toBeFocused();
  await expect(page.getByText("4 / 5 câu đúng")).toBeVisible();
  await expect(page.getByText(/Quiz đạt chưa có nghĩa/)).toBeVisible();
  await expect(page.getByText(/Giải thích đáp án chưa khả dụng/)).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Về bài học để xác nhận đã học",
      exact: true,
    }),
  ).toHaveAttribute("href", /#lesson-progress$/);
  await expect(
    page.locator('a[aria-current="page"][href^="?attempt="]'),
  ).toHaveCount(1);
  await page.screenshot({
    path: `.local/previews/${info.project.name}-result.png`,
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Kết quả: Đạt", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(0);
  const all = await page.content();
  expect(all).not.toMatch(
    /correct_index|explanation_vi|submission_fingerprint/,
  );
});
test("lost start retries identical key and no mutation on mount", async ({
  page,
}) => {
  await page.goto("/?scenario=start-loss");
  await page.getByRole("button", { name: "Bắt đầu quiz", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page
    .getByRole("button", { name: "Tải lại kết quả và tiến độ", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Thử lại yêu cầu cũ" }),
  ).toBeEnabled();
  const original = await page.evaluate(
    () =>
      (window as unknown as { quizCalls: { start: unknown[] } }).quizCalls
        .start[0],
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Thử lại yêu cầu cũ" }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { quizCalls: { start: unknown[] } }).quizCalls
          .start.length,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "Thử lại yêu cầu cũ" }).click();
  await expect(page.getByRole("radio").first()).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { quizCalls: { start: unknown[] } }).quizCalls
          .start[0],
    ),
  ).toEqual(original);
});
test("unknown submit locks choices and retries exact payload once", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu quiz", exact: true }).click();
  await page.getByRole("radio").first().check();
  await page.getByLabel("Kịch bản kiểm thử").selectOption("submit-loss");
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await page.getByRole("button", { name: "Xác nhận nộp", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("radio").first()).toBeDisabled();
  await page.getByRole("button", { name: "Thử lại yêu cầu cũ" }).click();
  await expect(
    page.getByRole("heading", { name: "Kết quả: Đạt", exact: true }),
  ).toBeVisible();
  const calls = await page.evaluate(
    () =>
      (window as unknown as { quizCalls: { submit: unknown[] } }).quizCalls
        .submit,
  );
  expect(calls).toHaveLength(2);
  expect(calls[0]).toEqual(calls[1]);
});
test("server fail and study-first completion are not inferred from answers", async ({
  page,
}) => {
  await page.goto("/?scenario=fail");
  await page.getByRole("button", { name: "Bắt đầu quiz", exact: true }).click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await page.getByRole("button", { name: "Xác nhận nộp", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Kết quả: Chưa đạt" }),
  ).toBeVisible();
  await page.goto("/?scenario=studied");
  await page.getByRole("button", { name: "Bắt đầu quiz", exact: true }).click();
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await page.getByRole("button", { name: "Xác nhận nộp", exact: true }).click();
  await expect(
    page.getByText("Bài học đã hoàn thành theo tiến độ đã lưu."),
  ).toBeVisible();
});
test("blocked environment never starts from UI", async ({ page }) => {
  await page.goto("/?scenario=blocked");
  await expect(
    page.getByRole("button", { name: "Bắt đầu quiz", exact: true }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { quizCalls: { start: unknown[] } }).quizCalls
          .start.length,
    ),
  ).toBe(0);
});
