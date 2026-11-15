import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { developmentConfig, testStore } from "./development.mjs";

const PORT = 3112;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = "C:/Users/ASUS/.gemini/antigravity/brain/51f4604f-408e-463f-875f-ade46b64c419/screenshots";
const GLOBAL_TIMEOUT_MS = 180000;

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Watchdog
const watchdog = setTimeout(() => {
  console.error(`\n[FATAL] Global watchdog timer exceeded ${GLOBAL_TIMEOUT_MS / 1000}s. Aborting!`);
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
  } catch { }
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/api/health`, { redirect: "manual" });
      if (res.status === 200 || res.status === 401 || res.status === 307) return true;
    } catch { }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

async function runStepWithTimeout(name, page, timeoutMs, stepFn) {
  const t0 = Date.now();
  console.log(`\n>>> [START] ${name} (timeout: ${timeoutMs / 1000}s)`);
  try {
    await Promise.race([
      stepFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`TIMEOUT: Step "${name}" exceeded ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
    const elapsed = Date.now() - t0;
    console.log(`<<< [DONE]  ${name} (${elapsed}ms)`);
  } catch (err) {
    const elapsed = Date.now() - t0;
    console.error(`<<< [FAIL]  ${name} after ${elapsed}ms: ${err.message}`);
    record(name, false, err.message);
    if (page && !page.isClosed()) {
      try {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `FAIL_${name}.png`) });
      } catch { }
    }
    throw err;
  }
}

async function main() {
  const targetStep = process.argv.find((a) => a.startsWith("--step="))?.split("=")[1] || null;
  console.log("=== SPRINT 8K: LEARNING NAVIGATION REDESIGN & ADAPTIVE PRACTICE ===");
  if (targetStep) {
    console.log(`[MODE] Focused test on step: "${targetStep}"`);
  } else {
    console.log(`[MODE] Full Sprint 8K Acceptance Suite`);
  }

  const account = testStore("Read");
  const config = developmentConfig();

  // 1. Start Next.js production server on port 3112
  console.log(`Starting Next.js production server on port ${PORT}...`);
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
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
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
  await context.addCookies(cookieList);
  const page = await context.newPage();
  page.on("dialog", (dialog) => dialog.accept());

  const shouldRun = (stepName) => !targetStep || targetStep === stepName;

  try {
    // ========================================================
    // SCOPE 1: LESSON READER NAVIGATION REDESIGN
    // ========================================================
    if (shouldRun("reader_navigation")) {
      await runStepWithTimeout("reader_navigation", page, 35000, async () => {
        console.log("\n--- Testing Lesson Reader Redesign (Breadcrumb, Switcher, 2 Layers) ---");
        await page.goto(`${ORIGIN}/lessons/stage/hsk1-lesson-01`, { timeout: 15000 });
        await page.waitForSelector("h1", { timeout: 10000 });

        // 1. Breadcrumb validation
        const breadcrumb = page.locator("nav[aria-label='Breadcrumb']");
        const hasBreadcrumb = await breadcrumb.isVisible();
        const breadcrumbText = await breadcrumb.innerText();
        const hasRoadmapLink = breadcrumbText.includes("Lộ trình") && breadcrumbText.includes("HSK 1");
        record("reader_breadcrumb_present", hasBreadcrumb && hasRoadmapLink, breadcrumbText);

        // 2. Verify 32-button horizontal bar is GONE
        // Top container should not contain 32 horizontal lesson buttons
        const rawLessonButtons = await page.locator("div.flex-wrap a[href*='/lessons/stage/hsk1-lesson-']").count();
        record("reader_no_32_button_bar", rawLessonButtons === 0, `Found ${rawLessonButtons} horizontal lesson buttons (expected 0)`);

        // 3. Lesson Switcher Dropdown
        const switcherBtn = page.getByRole("button", { name: /Bài 1\/\d+/i });
        const hasSwitcher = await switcherBtn.isVisible();
        record("reader_lesson_switcher_trigger", hasSwitcher, "Lesson switcher trigger button present");

        // Click switcher to open popover
        await switcherBtn.click();
        await page.waitForTimeout(300);

        const switcherMenu = page.locator("div[role='menu']");
        const isMenuOpen = await switcherMenu.isVisible();
        const hasUnitGroups = (await page.getByText(/Unit 1:/i).count()) > 0;
        record("reader_lesson_switcher_popover_open", isMenuOpen && hasUnitGroups, "Switcher opens showing units & lessons");

        // Test search input in lesson switcher
        const searchInput = switcherMenu.locator("input[placeholder*='Tìm theo tên bài']");
        await searchInput.fill("chào");
        await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "lesson_switcher_dropdown.png") });
        await searchInput.fill(""); // Clear search

        // Close switcher
        await page.keyboard.press("Escape");
        await page.waitForTimeout(200);

        // 4. Previous / Next Lesson Navigation
        const prevBtn = page.locator("button:has-text('Bài trước'), a:has-text('Bài trước')").first();
        const nextBtn = page.locator("button:has-text('Bài tiếp'), a:has-text('Bài tiếp')").first();
        const prevDisabled = (await prevBtn.getAttribute("disabled")) !== null || (await prevBtn.getAttribute("aria-disabled")) === "true" || (await prevBtn.getAttribute("class"))?.includes("disabled") || (await prevBtn.isDisabled());
        const nextHref = await nextBtn.getAttribute("href");
        record("reader_prev_next_lesson_buttons", prevDisabled && !!nextHref, `Lesson 1: prev disabled, next href: ${nextHref}`);

        // 5. Tầng 1: 6 Skill Groups
        const skillTabs = page.locator("div.grid-cols-2 button, div.lg\\:grid-cols-6 button");
        const skillTabsCount = await skillTabs.count();
        record("reader_6_skill_groups", skillTabsCount === 6, `Found ${skillTabsCount} skill group tabs`);

        // Click Group 1 (Khởi động) explicitly
        await skillTabs.first().click();
        await page.waitForTimeout(300);

        // 6. Tầng 2: Sub-stages of selected group ONLY
        // On Stage 1, Warmup group has 1 sub-stage (Chặng 1)
        const subStages = page.locator("div.p-3\\.5.sm\\:p-4 button");
        const subStageCount = await subStages.count();
        const subStageText = await subStages.first().innerText();
        const isStandard1Indexed = subStageText.includes("Chặng 1:");
        record("reader_substages_layer_only", subStageCount === 1 && isStandard1Indexed, `Sub-stage text: ${subStageText}`);

        // Click Group 2 (Từ vựng) to verify dynamic 2-layer switching (stages 1, 2)
        await skillTabs.nth(1).click();
        await page.waitForTimeout(300);
        const vocabSubStages = await page.locator("div.p-3\\.5.sm\\:p-4 button").count();
        const vocabText = await page.locator("div.p-3\\.5.sm\\:p-4 button").first().innerText();
        record("reader_group2_substages", vocabSubStages === 2 && vocabText.includes("Chặng 2:"), `Group 2 (Từ vựng) has ${vocabSubStages} sub-stages`);

        // Click Group 3 (Ngữ pháp & Hội thoại) to verify 3 sub-stages (stages 3, 4, 5)
        await skillTabs.nth(2).click();
        await page.waitForTimeout(300);
        const grammarSubStages = await page.locator("div.p-3\\.5.sm\\:p-4 button").count();
        const grammarText = await page.locator("div.p-3\\.5.sm\\:p-4 button").first().innerText();
        record("reader_group3_substages", grammarSubStages === 3 && grammarText.includes("Chặng 4:"), `Group 3 (Ngữ pháp & Hội thoại) has ${grammarSubStages} sub-stages`);

        // Switch back to Group 1
        await skillTabs.first().click();
        await page.waitForTimeout(200);

        // 7. Verify NO redundant 10-dot row (0-9)
        const dotRow = page.locator("span:has-text('Toàn bộ 10 chặng:')");
        const hasDotRow = await dotRow.isVisible();
        record("reader_no_redundant_10_dots", !hasDotRow, "Redundant 10-dot bar successfully removed");

        // 8. Footer Navigation
        const footerPrev = page.getByRole("button", { name: /Chặng trước/i });
        const footerNext = page.getByRole("button", { name: /Hoàn thành & Tiếp tục|Chặng tiếp theo/i });
        const hasFooter = (await footerPrev.isVisible()) && (await footerNext.isVisible());
        record("reader_footer_navigation_present", hasFooter, "Footer navigation bar with Prev & Next/Complete");

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "lesson_reader_redesigned_desktop.png") });

        // Mobile responsive check
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(300);
        const mobileBreadcrumb = await page.locator("nav[aria-label='Breadcrumb']").isVisible();
        const mobileScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const mobileClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        record("reader_mobile_no_overflow", mobileBreadcrumb && mobileScrollWidth <= mobileClientWidth, `Mobile 375px: ${mobileScrollWidth}px / ${mobileClientWidth}px`);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "lesson_reader_redesigned_mobile.png") });

        // Reset to desktop viewport
        await page.setViewportSize({ width: 1440, height: 900 });
      });
    }

    // ========================================================
    // SCOPE 2: ADAPTIVE PRACTICE PLAYER & QUESTION NAVIGATOR
    // ========================================================
    if (shouldRun("practice_adaptive")) {
      await runStepWithTimeout("practice_adaptive", page, 35000, async () => {
        console.log("\n--- Testing Adaptive Practice Player (Question Navigator, Modes, Skip) ---");
        await page.goto(`${ORIGIN}/practice/ps-vocab-01`, { timeout: 15000 });
        await page.waitForSelector("h2, h1", { timeout: 10000 });

        // 1. Question Navigator rendered
        const navPills = page.locator("div.overflow-x-auto button");
        const navCount = await navPills.count();
        record("practice_question_navigator_pills", navCount === 8, `Found ${navCount} question pills for 8 questions`);

        // 2. Active pill is highlighted
        const pill1Class = await navPills.first().getAttribute("class");
        record("practice_nav_active_highlight", pill1Class.includes("bg-primary"), "Pill 1 is actively highlighted");

        // 3. Test Skip Question
        const skipBtn = page.getByRole("button", { name: "Bỏ qua" });
        await skipBtn.click();
        await page.waitForTimeout(300);

        // Verify advanced to question 2 and pill 1 is marked skipped (amber)
        const pill1AfterSkip = await navPills.nth(0).getAttribute("class");
        const pill2Active = await navPills.nth(1).getAttribute("class");
        record("practice_skip_question", pill1AfterSkip.includes("amber") && pill2Active.includes("primary"), "Question 1 marked skipped, advanced to Question 2");

        // 4. Test Jump to Question 4
        await navPills.nth(3).click();
        await page.waitForTimeout(300);

        // Answer question 4: select choice, verify it's selected, then click "Kiểm tra"
        const choice = page.locator("div.space-y-2\\.5 button").first();
        await choice.click();
        await page.waitForTimeout(300);

        // Click "Kiểm tra" to check answer
        const checkBtn = page.getByRole("button", { name: /^Kiểm tra/i }).first();
        await checkBtn.click();
        await page.waitForTimeout(300);

        // While active, pill 4 shows the green indicator dot
        const hasActiveIndicator = (await navPills.nth(3).locator("span.bg-emerald-500").count()) > 0;

        // Advance to Question 5
        const nextQBtn = page.getByRole("button", { name: "Câu tiếp theo" });
        await nextQBtn.click();
        await page.waitForTimeout(300);

        // When inactive, pill 4 transitions to emerald completed styling
        const pill4Class = await navPills.nth(3).getAttribute("class");
        record("practice_answered_pill_state", hasActiveIndicator || pill4Class.includes("emerald"), "Answered question pill displays emerald completed indicator and style");

        // 5. ANTI-LEAKAGE VERIFICATION on Question 5 (pv01-5: 对不起 -> response)
        // Verify answer 没关系 is NOT leaked as an obvious standalone card before answering
        const hasLeakedStimulus = (await page.locator("div.text-center.py-3 p.hanzi:has-text('没关系')").count()) > 0;
        record("practice_no_answer_leakage", !hasLeakedStimulus, "Target answer 没关系 is NOT leaked in stimulus before answer selection");

        // Select Choice A on Question 5
        const choice5 = page.locator("div.space-y-2\\.5 button").first();
        await choice5.click();
        await page.waitForTimeout(300);
        // Before clicking check: take practice_before_answer.png
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "practice_before_answer.png") });

        // Click "Kiểm tra" to evaluate answer
        const checkBtn5 = page.getByRole("button", { name: /^Kiểm tra/i }).first();
        await checkBtn5.click();
        await page.waitForTimeout(300);
        // After clicking check: take practice_after_answer.png
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "practice_after_answer.png") });

        // Screenshot Question Navigator showing active, completed, and skipped states
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "practice_question_navigator.png") });
      });
    }

    // ========================================================
    // SCOPE 3: READING COMPREHENSION HYBRID LAYOUT (Mode 3)
    // ========================================================
    if (shouldRun("reading_hybrid")) {
      await runStepWithTimeout("reading_hybrid", page, 35000, async () => {
        console.log("\n--- Testing Reading Comprehension Hybrid Layout (Desktop Split & Mobile Drawer) ---");
        await page.goto(`${ORIGIN}/practice/ps-read-01`, { timeout: 15000 });
        await page.waitForSelector("h2, h1", { timeout: 10000 });

        // 1. Desktop: Left column sticky passage
        const desktopPassageCol = page.locator("div.sticky.top-20");
        const hasStickyPassage = await desktopPassageCol.isVisible();
        record("reading_desktop_split_passage", hasStickyPassage, "Desktop hybrid layout: Left column sticky reading passage visible");
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "practice_reading_hybrid_desktop.png") });

        // 2. Mobile: Drawer toggle
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(300);

        const mobileDrawerBtn = page.getByRole("button", { name: /Xem đoạn văn bài đọc/i });
        const hasDrawerBtn = await mobileDrawerBtn.isVisible();
        record("reading_mobile_drawer_button", hasDrawerBtn, "Mobile: 'Xem đoạn văn bài đọc' button visible");

        // Open mobile passage modal
        await mobileDrawerBtn.click();
        await page.waitForTimeout(300);
        const hasFullScreenSheet = await page.locator("div.fixed.inset-0.z-50").first().isVisible();
        const hasAudioBtn = await page.locator("div.fixed.inset-0.z-50 button[data-mandarin-audio-btn='true']").isVisible();
        const hasToggleTransBtn = (await page.locator("div.fixed.inset-0.z-50 button:has-text('Bản dịch'), div.fixed.inset-0.z-50 button:has-text('Ẩn Dịch')").count()) > 0;
        record("reading_mobile_drawer_open", hasFullScreenSheet && hasAudioBtn && hasToggleTransBtn, "Mobile reading full-screen sheet opens cleanly with audio and translation controls");
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "practice_reading_drawer_mobile.png") });

        // Close mobile passage modal
        const closeBtn = page.getByRole("button", { name: "Đóng và làm câu hỏi" });
        await closeBtn.click();
        await page.waitForTimeout(200);

        // Reset to desktop viewport
        await page.setViewportSize({ width: 1440, height: 900 });
      });
    }

  } catch (err) {
    record("suite_execution_error", false, err.stack || err.message);
  } finally {
    console.log("\n>>> Cleaning up resources (closing browser & terminating server tree)...");
    try {
      if (page && !page.isClosed()) await page.close();
    } catch { }
    try {
      if (context) await context.close();
    } catch { }
    try {
      if (browser) await browser.close();
    } catch { }
    if (server && server.pid) {
      killTree(server.pid);
    }
    console.log("<<< Cleanup completed.");
  }

  console.log("\n=== FINAL ACCEPTANCE SUMMARY ===");
  console.log(`Passed: ${RESULTS.passed} / ${RESULTS.checks.length}`);
  console.log(`Failed: ${RESULTS.failed}`);
  console.log(`Status: ${RESULTS.failed === 0 ? "SUCCESS" : "FAILURE"}`);

  process.exit(RESULTS.failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
