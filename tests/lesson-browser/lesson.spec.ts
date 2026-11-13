import { expect, test } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== "127.0.0.1" || url.port !== "3103")
      throw Error("Synthetic UI must not access Cloud/external hosts");
    expect(["GET", "HEAD"]).toContain(route.request().method());
    await route.continue();
  });
});
test("published synthetic lesson is responsive/light-dark, keyboard accessible and read-only", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.locator("#lesson-title")).toContainText(
    "kiểm thử giao diện",
  );
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByText("Tiến độ đã lưu", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Đã xác nhận học", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const toggle = page.getByRole("button", {
    name: "Hiển thị pinyin",
    exact: true,
  });
  await toggle.focus();
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-pinyin-text]")).toHaveCount(0);
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Hiển thị pinyin", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator("[data-pinyin-text]").count()).toBeGreaterThan(0);
  const nav = page.getByRole("navigation", { name: "Các phần của bài học" });
  const link = nav.getByRole("link").first();
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#section-intro$/);
  await expect(page.locator("#section-intro")).toBeFocused();
  await page
    .getByText("Nguồn và quyền sử dụng", { exact: true })
    .first()
    .click();
  await expect(
    page.getByText("Giấy phép: synthetic-test-only").first(),
  ).toBeVisible();
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  expect(
    await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(11, 18, 32)");
  await expect(page.locator("audio,iframe,form")).toHaveCount(0);
  await page.screenshot({
    path: `.local/previews/lesson-${testInfo.project.name}-synthetic.png`,
    fullPage: true,
  });
  await expect(
    page.getByRole("button", {
      name: /hoàn thành|xác nhận học|nộp bài|lưu tiến độ/i,
    }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByText("Đã xác nhận học", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Về lộ trình", exact: true }),
  ).toHaveAttribute("href", "/roadmap");
});
test("long content wraps without mobile overflow", async ({ page }) => {
  await page.goto("/?mode=long");
  await expect(page.locator("#lesson-title")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("study confirmation is explicit, pending-safe, separate from completion and survives fixture reload", async ({
  page,
}, testInfo) => {
  await page.goto("/?mode=study");
  await expect(
    page.getByText("Chưa xác nhận học", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => sessionStorage.getItem("synthetic-study:study")),
  ).toBeNull();
  const button = page.getByRole("button", {
    name: "Tôi đã học nội dung này",
    exact: true,
  });
  await button.focus();
  const target = await button.boundingBox();
  expect(target?.height).toBeGreaterThanOrEqual(44);
  await expect(button).toBeFocused();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: "Đang xử lý…" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Đã xác nhận học", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Đã hoàn thành", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/Chức năng làm quiz chưa được mở/)).toBeVisible();
  await page
    .getByRole("button", { name: "Xác nhận lại việc học", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Xác nhận lại việc học", exact: true }),
  ).toBeEnabled();
  await expect(
    page.locator('time[datetime="2026-11-13T02:00:00Z"]'),
  ).toHaveCount(1);
  await page
    .getByRole("button", { name: "Tải lại tiến độ", exact: true })
    .click();
  await expect(
    page.getByText("Đã xác nhận học", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `.local/previews/study-${testInfo.project.name}-synthetic.png`,
    fullPage: true,
  });
});
test("unknown outcome retries the original lesson and no receipt-only optimistic completion", async ({
  page,
}) => {
  await page.goto("/?mode=study-retry");
  await page
    .getByRole("button", { name: "Tôi đã học nội dung này", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "kết quả có thể đã được lưu",
  );
  await expect(
    page.getByText("Chưa xác nhận học", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Thử xác nhận lại an toàn" }).click();
  await expect(
    page.getByText("Đã xác nhận học", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.goto("/?mode=study-no-render");
  await page
    .getByRole("button", { name: "Tôi đã học nội dung này", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Tôi đã học nội dung này", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByText("Chưa xác nhận học", { exact: true }),
  ).toBeVisible();
});
test("fixture completion uses readback and blocked mode never submits", async ({
  page,
}) => {
  await page.goto("/?mode=study-complete");
  await page
    .getByRole("button", { name: "Tôi đã học nội dung này", exact: true })
    .click();
  await expect(page.getByText("Đã hoàn thành", { exact: true })).toBeVisible();
  await expect(
    page.locator('time[datetime="2026-11-13T02:01:00Z"]'),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("Đã hoàn thành", { exact: true })).toBeVisible();
  await page.goto("/?mode=study-blocked");
  await expect(
    page.getByRole("button", { name: "Tôi đã học nội dung này", exact: true }),
  ).toBeDisabled();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("synthetic-study:study-blocked"),
    ),
  ).toBeNull();
});
test("unavailable/invalid/empty/loading/error are distinct and do not leak raw metadata", async ({
  page,
}) => {
  await page.goto("/?mode=unavailable");
  await expect(
    page.getByRole("heading", { name: "Bài học chưa khả dụng" }),
  ).toBeVisible();
  await expect(page.getByText("Course kiểm thử", { exact: true })).toHaveCount(
    0,
  );
  await page.goto("/?mode=malformed");
  await expect(page.getByRole("alert")).toContainText("Nội dung chưa sẵn sàng");
  await expect(page.getByText("private-test-marker")).toHaveCount(0);
  await page.goto("/?mode=empty");
  await expect(
    page.getByRole("heading", { name: "Chưa có phần nội dung" }),
  ).toBeVisible();
  await page.goto("/?mode=loading");
  await expect(
    page.getByRole("status", { name: "Đang tải bài học" }),
  ).toBeVisible();
  await page.goto("/?mode=error");
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(
    page.getByRole("heading", { name: "Chưa có phần nội dung" }),
  ).toBeVisible();
});
