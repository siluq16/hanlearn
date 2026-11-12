import { test, expect } from "@playwright/test";
test("login renders, validates required fields and preserves theme", async ({
  page,
}, testInfo) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Tiếp tục hành trình" }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `.local/previews/login-${testInfo.project.name}-initial.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Vào không gian học" }).click();
  expect(
    await page
      .locator("#email")
      .evaluate((input: HTMLInputElement) => input.validity.valueMissing),
  ).toBe(true);
  await page.locator("#email").fill("invalid-email");
  expect(
    await page
      .locator("#email")
      .evaluate((input: HTMLInputElement) => input.validity.typeMismatch),
  ).toBe(true);
  const wasDark = await page
    .locator("html")
    .evaluate((el) => el.classList.contains("dark"));
  await page.getByRole("button", { name: "Chuyển giao diện sáng tối" }).click();
  await expect
    .poll(() =>
      page.locator("html").evaluate((el) => el.classList.contains("dark")),
    )
    .toBe(!wasDark);
  await page.reload();
  await expect
    .poll(() =>
      page.locator("html").evaluate((el) => el.classList.contains("dark")),
    )
    .toBe(!wasDark);
  await page.screenshot({
    path: `.local/previews/login-${testInfo.project.name}-toggled.png`,
    fullPage: true,
  });
});
test("missing configuration reports a real error rather than fake login", async ({
  page,
}) => {
  await page.goto("/login");
  test.skip(
    (await page
      .getByRole("link", { name: "Hướng dẫn kết nối Development" })
      .count()) === 0,
    "Requires unconfigured environment; real cloud Auth is a separate approved test.",
  );
  await page
    .getByLabel("Email", { exact: true })
    .fill("fixture@example.invalid");
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill("test-only-not-a-real-credential");
  await page.getByRole("button", { name: "Vào không gian học" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Chưa kết nối môi trường học" }),
  ).toContainText("Chưa kết nối môi trường học");
  await expect(page).toHaveURL(/\/login$/);
});
test("private pages and API fail closed without a session/config", async ({
  page,
  request,
}) => {
  for (const route of [
    "/dashboard",
    "/roadmap",
    "/vocabulary",
    "/settings",
    "/lessons/20000000-0000-4000-8000-000000000001",
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/(setup|login)$/);
  }
  const me = await request.get("/api/me");
  expect([401, 503]).toContain(me.status());
  expect(me.headers()["cache-control"]).toContain("no-store");
  const body = await me.json();
  expect(body).not.toHaveProperty("id");
  expect(body).not.toHaveProperty("email");
});
test("public setup is readable without horizontal overflow", async ({
  page,
}) => {
  await page.goto("/setup");
  await expect(
    page.getByRole("heading", { name: "Kết nối không gian học" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/login");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
