import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

test("all frozen lessons render locally with toggle, navigation and no Cloud traffic", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.route("**/*", async (route) => {
    const r = route.request();
    expect(new URL(r.url()).origin).toBe("http://127.0.0.1:3114");
    expect(["GET", "HEAD"]).toContain(r.method());
    await route.continue();
  });
  const counts = [6, 6, 11, 6];
  for (let i = 0; i < 4; i++) {
    await page.goto(`/?lesson=${i + 1}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("article section[id^='section-']")).toHaveCount(
      counts[i],
    );
    await expect(page.locator("[data-pinyin-text]").first()).toBeVisible();
    const toggle = page.getByRole("button", { name: "Hiển thị pinyin" });
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-pinyin-text]")).toHaveCount(0);
    await toggle.click();
    await expect(page.locator("[data-pinyin-text]").first()).toBeVisible();
    await expect(
      page.getByText("LOCAL CONTENT PREVIEW", { exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Tôi đã học nội dung này" }),
    ).toHaveCount(0);
    const firstLink = page
      .getByRole("navigation", { name: "Các phần của bài học" })
      .getByRole("link")
      .first();
    await firstLink.click();
    expect(new URL(page.url()).hash).toMatch(/^#section-/);
  }
  await expect(page.getByRole("button", { name: "Bài tiếp →" })).toBeDisabled();
  await page.getByRole("button", { name: "← Bài trước" }).click();
  await expect(page).toHaveURL(/lesson=3$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("今天");
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(".local/previews", { recursive: true });
  await page.screenshot({
    path: `.local/previews/hsk1-${info.project.name}.png`,
  });
  if (info.project.name === "preview-mobile") {
    await page.locator("article section").nth(1).scrollIntoViewIfNeeded();
    await page.screenshot({
      path: ".local/previews/hsk1-mobile-vocabulary.png",
    });
  }
  expect(errors).toEqual([]);
});

test("feedback stays in memory and exports only public snapshot-bound notes", async ({
  page,
}) => {
  await page.goto("/?lesson=3");
  await page
    .getByLabel("Nhận xét", { exact: true })
    .fill("Kiểm thử ghi chú: <script> không được chạy.");
  await page.getByRole("button", { name: "Thêm ghi chú" }).click();
  await expect(page.getByRole("status")).toContainText("1 ghi chú");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Tải ghi chú" }).click();
  const file = await (await download).path();
  const json = JSON.parse(fs.readFileSync(file!, "utf8"));
  expect(json.revision).toBe(3);
  expect(json.notes).toHaveLength(1);
  expect(JSON.stringify(json)).not.toMatch(
    /correct_index|explanation_vi|reviewed_by/,
  );
  await page.reload();
  await expect(page.getByRole("status")).toContainText("0 ghi chú");
});

test("static allowlist and headers isolate draft assets; browser output contains no key payloads", async ({
  request,
}) => {
  const response = await request.get("/");
  expect(response.headers()["content-security-policy"]).toContain(
    "connect-src 'none'",
  );
  for (const p of [
    "/.env",
    "/.local/pilot-hsk1/v1/private/answers.json",
    "/@fs/D:/",
    "/api/lessons",
    "/content/pilot-hsk1/v1/manifest.json",
  ])
    expect((await request.get(p)).status()).toBe(404);
  expect((await request.post("/")).status()).toBe(405);
  expect(
    (
      await request.get("/", { headers: { Host: "evil.example:3114" } })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.get("/", { headers: { Origin: "https://evil.example" } })
    ).status(),
  ).toBe(403);
  function scan(dir: string) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, e.name);
      if (e.isDirectory()) scan(file);
      else if (/\.(?:html|js|css|map|json)$/.test(file)) {
        expect(e.name).not.toMatch(/\.map$/);
        expect(fs.readFileSync(file, "utf8")).not.toMatch(
          /correct_index|explanation_vi|quiz_bindings|SYNTHETIC LOCAL IMPORT|supabase\.co|\.local\/pilot-hsk1|service_role|mark_lesson_studied/,
        );
      }
    }
  }
  scan(".local/hsk1-preview/site");
});
