import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { testStore, developmentConfig } from "./development.mjs";
import { createServerClient } from "@supabase/ssr";

const PORT = 3118;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = "C:/Users/ASUS/.gemini/antigravity/brain/51f4604f-408e-463f-875f-ade46b64c419/screenshots";

const RESULTS = { passed: 0, failed: 0, checks: [] };

function record(name, pass, note = "") {
  RESULTS.checks.push({ name, pass, note });
  if (pass) {
    RESULTS.passed++;
    console.log(`[PASS] ${name} - ${note}`);
  } else {
    RESULTS.failed++;
    console.error(`[FAIL] ${name} - ${note}`);
  }
}

function killTree(pid) {
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(pid), "/T", "/F"]);
    } else {
      process.kill(-pid, "SIGKILL");
    }
  } catch {}
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/api/health`, { redirect: "manual" });
      if (res.status === 200 || res.status === 401 || res.status === 307) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

async function main() {
  console.log("=== SPRINT 8L: POST-DEPLOYMENT SRS & VOCABULARY VERIFICATION ===");

  const account = testStore("Read");
  const config = developmentConfig();

  // 1. Start Next.js production server on port 3118
  console.log(`Starting Next.js server on port ${PORT}...`);
  const server = spawn("cmd.exe", ["/c", `npx next start -p ${PORT}`], {
    cwd: process.cwd(),
    stdio: "pipe",
    env: { ...process.env, PORT: String(PORT), NODE_OPTIONS: "--max-http-header-size=65536" },
  });

  server.stdout?.on("data", (d) => {
    const s = d.toString();
    if (s.includes("Ready") || s.includes("started")) {
      console.log("[Server]", s.trim());
    }
  });

  const ready = await waitForServer(ORIGIN, 30000);
  record("nextjs_server_ready", ready, `Port ${PORT}`);
  if (!ready) {
    killTree(server.pid);
    process.exit(1);
  }

  // 2. Setup Supabase Client & Authenticated Session
  const cookies = new Map();
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
      setAll: (rows) => {
        for (const row of rows) {
          if (row.value) cookies.set(row.name, row.value);
          else cookies.delete(row.name);
        }
      },
    },
  });

  const loginRes = await supabase.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  record("auth_signin", !!loginRes.data.session, `User ${loginRes.data.user?.id}`);

  const cookieList = [...cookies].map(([name, value]) => ({
    name,
    value,
    domain: "127.0.0.1",
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  }));

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  // -------------------------------------------------------------
  // Scenario 1 & 2: Flashcard SRS (Desktop & Mobile)
  // -------------------------------------------------------------
  console.log("\n--- Scenario 1 & 2: Flashcard Việt -> Hán (Before & After Flip) ---");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addCookies(cookieList);
    const page = await context.newPage();

    await page.goto(`${ORIGIN}/review`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-review-stat]", { timeout: 10000 });

    // Check stats: 43 cards due in total, batch of 20
    const dueStat = await page.locator('[data-review-stat="Đến hạn"]').textContent();
    record("review_due_count_43", dueStat.trim() === "43", `Stat 'Đến hạn' = ${dueStat.trim()}`);

    // Check batch progress label
    const progressText = await page.locator(".space-y-1\\.5 .text-xs").first().textContent();
    const hasBatchExplanation = progressText.includes("20") || progressText.includes("đợt");
    record("review_batch_explanation", hasBatchExplanation, `Progress label: "${progressText.trim()}"`);

    // Before flip: Check front of card
    const cardDirection = await page.locator(".border-b span.uppercase").textContent();
    console.log(`[Info] First card direction: "${cardDirection.trim()}"`);

    const flipBtn = page.getByRole("button", { name: "Lật thẻ" });
    const isFlipBtnVisible = await flipBtn.isVisible();
    record("review_flip_btn_visible", isFlipBtnVisible, "Button 'Lật thẻ' is visible");

    if (cardDirection.includes("Nghĩa tiếng Việt → Hán tự")) {
      // Check NO audio before flip
      const audioBeforeFlip = await page.locator("[data-speech-audio-button]").isVisible().catch(() => false);
      record("review_vi_to_hanzi_no_audio_leak", !audioBeforeFlip, "No audio button before flip (no sound leak)");

      // Check card heading is Vietnamese meaning
      const heading = await page.locator("h2[tabindex='-1']").textContent();
      record("review_vi_to_hanzi_shows_meaning", !!heading && heading.length > 0, `Prompt heading: "${heading.trim()}"`);

      // Check back is NOT yet visible
      const backBefore = await page.locator("[data-review-back]").isVisible();
      record("review_back_hidden_before_flip", !backBefore, "Back is hidden before flip");

      // Save screenshot before flip
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "review_desktop_before_flip.png"), fullPage: false });
      console.log("[Screenshot] saved review_desktop_before_flip.png");

      // Flip the card!
      await flipBtn.click();
      await page.waitForTimeout(400);

      // After flip: Check back is visible
      const backAfter = await page.locator("[data-review-back]").isVisible();
      record("review_back_visible_after_flip", backAfter, "Back is visible after flip");

      // Check Hanzi is revealed
      const hanziText = await page.locator("[data-review-back] p[lang='zh-Hans']").first().textContent();
      record("review_reveals_hanzi", !!hanziText && hanziText.trim().length > 0, `Revealed Hanzi: "${hanziText.trim()}"`);

      // Check Pinyin is revealed
      const pinyinText = await page.locator("[data-review-back] p.text-primary").first().textContent();
      record("review_reveals_pinyin", !!pinyinText && pinyinText.trim().length > 0, `Revealed Pinyin: "${pinyinText.trim()}"`);

      // Check Mandarin audio bar is visible on the back
      const audioBarVisible = await page.locator("[data-review-back] button:has-text('Nghe phát âm')").isVisible();
      record("review_audio_bar_on_back", audioBarVisible, "Audio bar visible on card back");

      // Check rating buttons enabled
      const quenBtn = page.getByRole("button", { name: "Quên", exact: true });
      const khoBtn = page.getByRole("button", { name: "Khó", exact: true });
      const nhoBtn = page.getByRole("button", { name: "Đã nhớ", exact: true });
      const ratingsEnabled = (await quenBtn.isEnabled()) && (await khoBtn.isEnabled()) && (await nhoBtn.isEnabled());
      record("review_3_rating_buttons_enabled", ratingsEnabled, "3 rating buttons (Quên, Khó, Đã nhớ) are enabled");

      // Save screenshot after flip
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "review_desktop.png"), fullPage: false });
      console.log("[Screenshot] saved review_desktop.png (after flip)");
    } else {
      console.log("[Info] First card is hanzi_to_vi. Testing flip...");
      await flipBtn.click();
      await page.waitForTimeout(400);
      const backAfter = await page.locator("[data-review-back]").isVisible();
      record("review_back_visible_after_flip", backAfter, "Back is visible after flip");
    }

    await context.close();
  }

  // -------------------------------------------------------------
  // Mobile Flashcard Screenshot
  // -------------------------------------------------------------
  console.log("\n--- Scenario Mobile Flashcard ---");
  {
    const contextMobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
    await contextMobile.addCookies(cookieList);
    const pageMobile = await contextMobile.newPage();

    await pageMobile.goto(`${ORIGIN}/review`, { waitUntil: "domcontentloaded" });
    await pageMobile.waitForSelector("[data-review-stat]", { timeout: 10000 });

    const mobileFlipBtn = pageMobile.getByRole("button", { name: "Lật thẻ" });
    if (await mobileFlipBtn.isVisible()) {
      await mobileFlipBtn.click();
      await pageMobile.waitForTimeout(400);
    }

    await pageMobile.screenshot({ path: path.join(SCREENSHOT_DIR, "review_mobile.png"), fullPage: false });
    console.log("[Screenshot] saved review_mobile.png");
    await contextMobile.close();
  }

  // -------------------------------------------------------------
  // Scenario 6: Vocabulary 300 words & Unit Filters
  // -------------------------------------------------------------
  console.log("\n--- Scenario 6: Vocabulary 300 Words & Unit Filter Verification ---");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addCookies(cookieList);
    const page = await context.newPage();

    await page.goto(`${ORIGIN}/vocabulary`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("input#vocab-search", { timeout: 10000 });

    // Check 300 words stat card
    const bodyContent = await page.textContent("body");
    const has300Stat = bodyContent.includes("300") && bodyContent.includes("từ vựng");
    record("vocabulary_300_words_stat", has300Stat, "300 total words card displayed");

    // Check Unit select filter
    const unitSelect = page.locator("select").first();
    const hasUnitSelect = await unitSelect.isVisible();
    record("vocabulary_unit_select_visible", hasUnitSelect, "Unit select dropdown visible");

    if (hasUnitSelect) {
      await unitSelect.selectOption("1");
      await page.waitForTimeout(400);
      const filteredCountText = await page.locator("text=/Hiển thị \\d+ từ/").textContent();
      record("vocabulary_unit1_filtered_count", filteredCountText.includes("Hiển thị 61 từ"), `Filtered to Unit 1: "${filteredCountText.trim()}" (expected 61 words)`);

      const filteredContent = await page.textContent("body");
      const hasNi = filteredContent.includes("你");
      const hasHao = filteredContent.includes("好");
      record("vocabulary_unit1_has_foundation_words", hasNi && hasHao, "Unit 1 contains foundation words 你 and 好");
    }

    await context.close();
  }

  // Cleanup
  await browser.close();
  killTree(server.pid);

  console.log("\n========================================================");
  console.log(`SUMMARY: ${RESULTS.passed} passed, ${RESULTS.failed} failed.`);
  console.log("========================================================");

  if (RESULTS.failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("FATAL ERROR in main:", err);
  process.exit(1);
});
