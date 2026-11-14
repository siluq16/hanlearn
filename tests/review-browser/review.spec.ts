import { test, expect } from "@playwright/test";
test("flip, three ratings, automatic next card and summary", async ({
  page,
}, info) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:3110")) requests.push(r.url());
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Đã nhớ", exact: true }),
  ).toBeDisabled();
  for (const [i, rating] of ["Quên", "Khó", "Đã nhớ"].entries()) {
    await page.getByRole("button", { name: "Lật thẻ", exact: true }).click();
    await expect(page.locator("[data-review-back]")).toContainText("Nǐ hǎo!");
    if (!i)
      await page.screenshot({
        path: `.local/development/srs-${info.project.name}.png`,
        fullPage: true,
      });
    await page.getByRole("button", { name: rating, exact: true }).click();
    await expect(
      page.locator('[data-review-stat="Đã ôn trong phiên"]'),
    ).toHaveText(String(i + 1));
  }
  await expect(
    page.getByRole("heading", { name: "Đã kết thúc phiên ôn", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-review-stat="Đến hạn"]')).toHaveText("0");
  await page.reload();
  await expect(page.locator('[data-review-stat="Lượt ôn hôm nay"]')).toHaveText(
    "3",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(requests).toEqual([]);
});
test("lost response survives reload and replays exactly once", async ({
  page,
}) => {
  await page.goto("/?scenario=response-loss");
  await page.getByRole("button", { name: "Lật thẻ", exact: true }).click();
  await page.getByRole("button", { name: "Đã nhớ", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Mất kết nối");
  await page
    .getByRole("button", { name: "Tải lại danh sách ôn", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Thử lại đánh giá cũ", exact: true }),
  ).toBeEnabled();
  const original = await page.evaluate(() =>
    sessionStorage.getItem("hanlearn-review:synthetic-only"),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("chưa xác nhận");
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { reviewCalls: unknown[] }).reviewCalls.length,
    ),
  ).toBe(0);
  await page
    .getByRole("button", { name: "Thử lại đánh giá cũ", exact: true })
    .click();
  await expect(page.locator('[data-review-stat="Lượt ôn hôm nay"]')).toHaveText(
    "1",
  );
  expect(
    await page.evaluate(() =>
      JSON.stringify(
        (window as unknown as { reviewCalls: unknown[] }).reviewCalls[0],
      ),
    ),
  ).toBe(original);
});
test("empty and disabled environment do not mutate", async ({ page }) => {
  await page.goto("/?scenario=empty");
  await expect(
    page.getByRole("heading", { name: "Chưa có thẻ đến hạn", exact: true }),
  ).toBeVisible();
  await page.goto("/?scenario=blocked");
  await expect(page.getByRole("note")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { reviewCalls: unknown[] }).reviewCalls.length,
    ),
  ).toBe(0);
});
test("version conflict permits read-only refresh", async ({ page }) => {
  await page.goto("/?scenario=conflict");
  await page.getByRole("button", { name: "Lật thẻ", exact: true }).click();
  await page.getByRole("button", { name: "Khó", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Thẻ đã thay đổi");
  await page
    .getByRole("button", { name: "Tải lại danh sách ôn", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("hanlearn-review:synthetic-only"),
    ),
  ).toBeNull();
});
