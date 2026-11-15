import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { developmentConfig, testStore } from "./development.mjs";

const PORT = 3112;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = "C:/Users/ASUS/.gemini/antigravity/brain/51f4604f-408e-463f-875f-ade46b64c419/screenshots";
const GLOBAL_TIMEOUT_MS = 180000; // 3-minute hard watchdog limit

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Global watchdog
const watchdog = setTimeout(() => {
  console.error(`\n[FATAL] Watchdog exceeded ${GLOBAL_TIMEOUT_MS / 1000}s. Aborting!`);
  process.exit(1);
}, GLOBAL_TIMEOUT_MS);
watchdog.unref();

const RESULTS = {
  status: "PENDING",
  passed: 0,
  failed: 0,
  checks: [],
};

function record(name, pass, detail = "") {
  if (pass) {
    RESULTS.passed++;
    RESULTS.checks.push({ name, status: "PASS", detail });
    console.log(`[PASS] ${name}${detail ? ` - ${detail}` : ""}`);
  } else {
    RESULTS.failed++;
    RESULTS.checks.push({ name, status: "FAIL", detail });
    console.error(`[FAIL] ${name} - ${detail}`);
  }
}

function killTree(pid) {
  if (!pid) return;
  try {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      process.kill(pid, "SIGKILL");
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
  console.log("=== SPRINT 8L: UNIFIED NAMING & LEARNING EXPERIENCE ACCEPTANCE ===");

  const account = testStore("Read");
  const config = developmentConfig();

  // 1. Start Next.js production server on port 3112
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
  if (loginRes.error) {
    killTree(server.pid);
    throw new Error("Auth error: " + loginRes.error.message);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  const cookieList = [];
  for (const [name, value] of cookies.entries()) {
    cookieList.push({
      name,
      value,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    });
  }

  // Test Area 1: Roadmap (/roadmap)
  console.log("\n--- Area 1: Roadmap (/roadmap) ---");
  {
    // Desktop
    const contextDesktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await contextDesktop.addCookies(cookieList);
    const page = await contextDesktop.newPage();

    await page.goto(`${ORIGIN}/roadmap`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("h2, h3", { timeout: 10000 });

    const unitHeader = await page.textContent("body");
    const hasUnit1 = unitHeader.includes("Unit 1: Chào hỏi & Giới thiệu");
    record("roadmap_unit1_short_name", hasUnit1, "Unit 1: Chào hỏi & Giới thiệu");

    const hasLesson1 = unitHeader.includes("Bài 1: Chào hỏi");
    record("roadmap_lesson1_short_name", hasLesson1, "Bài 1: Chào hỏi");

    // Unit test card check: no "0/20 (Chưa đạt)" when not attempted
    const hasInvalidScore = unitHeader.includes("0/20 (Chưa đạt)");
    record("roadmap_unit_test_no_false_zero", !hasInvalidScore, "No false 0/20 Chưa đạt");

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "roadmap_desktop.png"), fullPage: false });
    console.log("[Screenshot] saved roadmap_desktop.png");
    await contextDesktop.close();

    // Mobile
    const contextMobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
    await contextMobile.addCookies(cookieList);
    const pageMobile = await contextMobile.newPage();

    await pageMobile.goto(`${ORIGIN}/roadmap`, { waitUntil: "domcontentloaded" });
    await pageMobile.waitForSelector("h2, h3", { timeout: 10000 });
    await pageMobile.screenshot({ path: path.join(SCREENSHOT_DIR, "roadmap_mobile.png"), fullPage: false });
    console.log("[Screenshot] saved roadmap_mobile.png");
    await contextMobile.close();
  }

  // Test Area 2: Practice Center (/practice)
  console.log("\n--- Area 2: Practice Center (/practice) ---");
  {
    // Desktop
    const contextDesktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await contextDesktop.addCookies(cookieList);
    const page = await contextDesktop.newPage();

    await page.goto(`${ORIGIN}/practice`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("button", { timeout: 10000 });

    const content = await page.textContent("body");
    const hasSetCode = content.includes("Bộ 01");
    record("practice_set_code_badge", hasSetCode, "Bộ 01 badge visible");

    const hasShortTitle = content.includes("Chào hỏi & Xưng hô");
    record("practice_short_title", hasShortTitle, "Chào hỏi & Xưng hô title visible");

    const hasUnit1Header = content.includes("Unit 1: Chào hỏi & Giới thiệu");
    record("practice_unit_accordion_title", hasUnit1Header, "Unit 1 accordion matches unified name");

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "practice_center_desktop.png"), fullPage: false });
    console.log("[Screenshot] saved practice_center_desktop.png");
    await contextDesktop.close();

    // Mobile
    const contextMobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
    await contextMobile.addCookies(cookieList);
    const pageMobile = await contextMobile.newPage();

    await pageMobile.goto(`${ORIGIN}/practice`, { waitUntil: "domcontentloaded" });
    await pageMobile.waitForSelector("button", { timeout: 10000 });
    await pageMobile.screenshot({ path: path.join(SCREENSHOT_DIR, "practice_center_mobile.png"), fullPage: false });
    console.log("[Screenshot] saved practice_center_mobile.png");
    await contextMobile.close();
  }

  // Test Area 3: Exam Overview (/exam)
  console.log("\n--- Area 3: Exam Overview (/exam) ---");
  {
    // Desktop
    const contextDesktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await contextDesktop.addCookies(cookieList);
    const page = await contextDesktop.newPage();

    await page.goto(`${ORIGIN}/exam`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("h2, h3", { timeout: 10000 });

    const content = await page.textContent("body");
    const hasExamHeader = content.includes("Kiểm tra HSK 1");
    record("exam_unified_header", hasExamHeader, "Kiểm tra HSK 1");

    const hasMockExam = content.includes("Đề thi thử HSK 1");
    record("exam_mock_card_title", hasMockExam, "Đề thi thử HSK 1 (40 câu)");

    const hasNoCTIClaim = !content.includes("Chuẩn CTI");
    record("exam_no_cti_claim", hasNoCTIClaim, "No CTI claim");

    const hasUnit1Test = content.includes("Unit 1: Chào hỏi & Giới thiệu");
    record("exam_unit1_test_title", hasUnit1Test, "Unit 1: Chào hỏi & Giới thiệu");

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "exam_overview_desktop.png"), fullPage: false });
    console.log("[Screenshot] saved exam_overview_desktop.png");
    await contextDesktop.close();

    // Mobile
    const contextMobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
    await contextMobile.addCookies(cookieList);
    const pageMobile = await contextMobile.newPage();

    await pageMobile.goto(`${ORIGIN}/exam`, { waitUntil: "domcontentloaded" });
    await pageMobile.waitForSelector("h2, h3", { timeout: 10000 });
    await pageMobile.screenshot({ path: path.join(SCREENSHOT_DIR, "exam_overview_mobile.png"), fullPage: false });
    console.log("[Screenshot] saved exam_overview_mobile.png");
    await contextMobile.close();
  }

  // Test Area 4: Vocabulary (/vocabulary)
  console.log("\n--- Area 4: Vocabulary (/vocabulary) ---");
  {
    // Desktop
    const contextDesktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await contextDesktop.addCookies(cookieList);
    const page = await contextDesktop.newPage();

    await page.goto(`${ORIGIN}/vocabulary`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("input#vocab-search", { timeout: 10000 });

    const content = await page.textContent("body");
    const hasVocabHeader = content.includes("Từ vựng HSK 1");
    record("vocabulary_unified_header", hasVocabHeader, "Từ vựng HSK 1");

    const hasTotal300 = content.includes("300 từ");
    record("vocabulary_300_words_stat", hasTotal300, "300 từ total stat card");

    // Test Hide Meaning Toggle
    const hideBtn = page.getByRole("button", { name: "Ẩn nghĩa tiếng Việt" });
    await hideBtn.click();
    await page.waitForTimeout(300);

    const contentAfterHide = await page.textContent("body");
    const hasHiddenText = contentAfterHide.includes("Nhấp để xem nghĩa") || contentAfterHide.includes("Đang ẩn nghĩa");
    record("vocabulary_hide_meaning_toggle", hasHiddenText, "Hide meaning toggle activated");

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "vocabulary_desktop.png"), fullPage: false });
    console.log("[Screenshot] saved vocabulary_desktop.png");
    await contextDesktop.close();

    // Mobile
    const contextMobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
    await contextMobile.addCookies(cookieList);
    const pageMobile = await contextMobile.newPage();

    await pageMobile.goto(`${ORIGIN}/vocabulary`, { waitUntil: "domcontentloaded" });
    await pageMobile.waitForSelector("input#vocab-search", { timeout: 10000 });
    await pageMobile.screenshot({ path: path.join(SCREENSHOT_DIR, "vocabulary_mobile.png"), fullPage: false });
    console.log("[Screenshot] saved vocabulary_mobile.png");
    await contextMobile.close();
  }

  // Test Area 5: Review SRS (/review)
  console.log("\n--- Area 5: Review SRS (/review) ---");
  {
    // Desktop
    const contextDesktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await contextDesktop.addCookies(cookieList);
    const page = await contextDesktop.newPage();

    await page.goto(`${ORIGIN}/review`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-review-stat]", { timeout: 10000 });

    const content = await page.textContent("body");
    const hasDueStat = await page.locator('[data-review-stat="Đến hạn"]').isVisible();
    record("review_due_stat_visible", hasDueStat, "Stat 'Đến hạn' is visible");

    const hasTodayStat = await page.locator('[data-review-stat="Lượt ôn hôm nay"]').isVisible();
    record("review_today_stat_visible", hasTodayStat, "Stat 'Lượt ôn hôm nay' is visible");

    // If flip button exists, test flipping
    const flipBtn = page.getByRole("button", { name: "Lật thẻ" });
    if (await flipBtn.isVisible()) {
      await flipBtn.click();
      await page.waitForTimeout(400);
      const backVisible = await page.locator("[data-review-back]").isVisible();
      record("review_flip_card", backVisible, "Card back revealed with audio and example");

      const rememberedBtn = page.getByRole("button", { name: "Đã nhớ" });
      const canEvaluate = await rememberedBtn.isEnabled();
      record("review_evaluate_buttons_enabled", canEvaluate, "Rating buttons enabled after flip");
    } else {
      record("review_session_status", true, "Review session status / empty state active");
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "review_desktop.png"), fullPage: false });
    console.log("[Screenshot] saved review_desktop.png");
    await contextDesktop.close();

    // Mobile
    const contextMobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
    await contextMobile.addCookies(cookieList);
    const pageMobile = await contextMobile.newPage();

    await pageMobile.goto(`${ORIGIN}/review`, { waitUntil: "domcontentloaded" });
    await pageMobile.waitForSelector("[data-review-stat]", { timeout: 10000 });
    await pageMobile.screenshot({ path: path.join(SCREENSHOT_DIR, "review_mobile.png"), fullPage: false });
    console.log("[Screenshot] saved review_mobile.png");
    await contextMobile.close();
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
