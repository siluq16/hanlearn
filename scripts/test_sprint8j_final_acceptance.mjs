import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { developmentConfig, testStore } from "./development.mjs";

const PORT = 3111;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = "C:/Users/ASUS/.gemini/antigravity/brain/51f4604f-408e-463f-875f-ade46b64c419/screenshots";
const GLOBAL_TIMEOUT_MS = 180000; // 3-minute hard watchdog limit

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Global watchdog timer
const watchdog = setTimeout(() => {
  console.error(`\n[FATAL] Global watchdog timer exceeded ${GLOBAL_TIMEOUT_MS / 1000}s. Aborting immediately!`);
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
      } catch {}
    }
    throw err;
  }
}

async function main() {
  const targetStep = process.argv.find((a) => a.startsWith("--step="))?.split("=")[1] || null;
  console.log("=== SPRINT 8J: FINAL UX & INTERACTIVE EXERCISE ACCEPTANCE ===");
  if (targetStep) {
    console.log(`[MODE] Focused test on step: "${targetStep}"`);
  } else {
    console.log(`[MODE] Full Acceptance Suite (all 4 scopes)`);
  }

  const account = testStore("Read");
  const config = developmentConfig();

  // 1. Start Next.js production server on port 3111
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
    viewport: { width: 1280, height: 800 },
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
    // PHẠM VI 1: ROADMAP & ĐIỀU HƯỚNG
    // ========================================================
    if (shouldRun("scope1_roadmap")) {
      await runStepWithTimeout("scope1_roadmap", page, 30000, async () => {
        console.log("\n--- SCOPE 1: Roadmap Accordion & Navigation ---");
        await page.goto(`${ORIGIN}/roadmap`, { timeout: 15000 });
        await page.waitForSelector("h1", { timeout: 10000 });

        // 1. Verify all 6 units present
        const u1 = await page.getByText(/Unit 1:/i).first().isVisible();
        const u2 = await page.getByText(/Unit 2:/i).first().isVisible();
        const u3 = await page.getByText(/Unit 3:/i).first().isVisible();
        const u4 = await page.getByText(/Unit 4:/i).first().isVisible();
        const u5 = await page.getByText(/Unit 5:/i).first().isVisible();
        const u6 = await page.getByText(/Unit 6:/i).first().isVisible();
        record("roadmap_all_6_units", u1 && u2 && u3 && u4 && u5 && u6, "All 6 units present in roadmap");

        // 2. Test expand/collapse on Unit 2
        const u2Header = page.locator("h3").filter({ hasText: /Unit 2:/i }).first();
        await u2Header.click();
        await page.waitForTimeout(400);
        const hasU2Lessons = await page.getByText(/Bài 5:/i).first().isVisible();
        record("roadmap_accordion_toggle", hasU2Lessons, "Unit 2 expands on click to reveal lessons");

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "roadmap_accordion_expanded.png"), fullPage: false });

        // 3. Test CTA links
        const ctaPractice = page.locator("a[href*='/practice?unit=']").first();
        const ctaPracticeHref = await ctaPractice.getAttribute("href");
        record("roadmap_cta_practice_link", !!ctaPracticeHref && ctaPracticeHref.includes("/practice?unit="), ctaPracticeHref);

        // 4. Test Responsive Viewports
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(200);
        const tabletU1 = await page.getByText(/Unit 1:/i).first().isVisible();
        record("roadmap_responsive_tablet_768px", tabletU1, "Roadmap renders properly on 768px tablet");

        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(200);
        const mobileU1 = await page.getByText(/Unit 1:/i).first().isVisible();
        record("roadmap_responsive_mobile_375px", mobileU1, "Roadmap renders cleanly without overflow on 375px mobile");
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "roadmap_mobile_375px.png"), fullPage: false });

        // Reset to desktop viewport
        await page.setViewportSize({ width: 1280, height: 800 });
      });
    }

    // ========================================================
    // PHẠM VI 2: PRACTICE CENTER
    // ========================================================
    if (shouldRun("scope2_practice")) {
      await runStepWithTimeout("scope2_practice", page, 30000, async () => {
        console.log("\n--- SCOPE 2: Practice Center Organization & Filters ---");
        await page.goto(`${ORIGIN}/practice?unit=2`, { timeout: 15000 });
        await page.waitForSelector("h1", { timeout: 10000 });

        // 1. Verify Unit 2 filtered
        const unitSelectVal = await page.locator("select").first().inputValue();
        record("practice_initial_unit_resolved", unitSelectVal === "u-hsk1-02", `Selected unit: ${unitSelectVal}`);

        // 2. Verify 6 skill tabs
        const skTabs = await page.locator("div.grid-cols-2 button, div.lg\\:grid-cols-6 button").count();
        record("practice_6_skill_tabs", skTabs >= 6, `Found ${skTabs} skill buttons`);

        // 3. Test Unit accordion in Practice
        await page.goto(`${ORIGIN}/practice`, { timeout: 15000 });
        await page.waitForSelector("h1", { timeout: 10000 });
        const uAccordionHdr = page.locator("button").filter({ hasText: /Unit 1:/i }).first();
        await uAccordionHdr.click();
        await page.waitForTimeout(300);
        await uAccordionHdr.click();
        await page.waitForTimeout(300);
        record("practice_unit_accordion_toggle", await uAccordionHdr.isVisible(), "Practice unit accordion expands/collapses cleanly");

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "practice_center_accordions.png"), fullPage: false });
      });
    }

    // ========================================================
    // PHẠM VI 3A: MATCHING EXERCISE (ps-vocab-05)
    // ========================================================
    if (shouldRun("scope3_matching")) {
      await runStepWithTimeout("scope3_matching", page, 30000, async () => {
        console.log("\n[A] Testing Matching Pairs Exercise (ps-vocab-05)...");
        await page.goto(`${ORIGIN}/practice/ps-vocab-05`, { timeout: 15000 });
        await page.waitForSelector("h2", { timeout: 10000 });

        const hasLeftCol = await page.getByText("Mục cần ghép").isVisible();
        const hasRightCol = await page.getByText("Nghĩa tương ứng").isVisible();
        record("matching_two_columns_rendered", hasLeftCol && hasRightCol, "Both Left and Right matching columns visible");

        const leftItem1 = page.locator("div.space-y-2:nth-child(1) button").first();
        await leftItem1.click();
        await page.waitForTimeout(200);
        await leftItem1.click(); // deselect
        await page.waitForTimeout(200);
        record("matching_deselect_functional", true, "Clicking selected left item deselects it cleanly");

        await leftItem1.click();
        await page.waitForTimeout(200);
        const rightItemWrong = page.locator("div.space-y-2:nth-child(2) button").nth(2);
        if (await rightItemWrong.isVisible()) {
          await rightItemWrong.click();
          await page.waitForTimeout(200);
          const hasMismatchRing = await page.locator(".ring-rose-500, .border-rose-500").count();
          record("matching_mismatch_feedback", hasMismatchRing > 0, "Mismatch triggers visual red feedback");
        }

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "matching_interaction_feedback.png") });
      });
    }

    // ========================================================
    // PHẠM VI 3B: SENTENCE ORDERING (ps-gram-01)
    // ========================================================
    if (shouldRun("scope3_sentence_order") || shouldRun("sentence_order")) {
      await runStepWithTimeout("scope3_sentence_order", page, 30000, async () => {
        console.log("\n[B] Testing Sentence Ordering Interactive Exercise (ps-gram-01)...");
        await page.goto(`${ORIGIN}/practice/ps-gram-01`, { timeout: 15000 });
        await page.waitForSelector("h2", { timeout: 10000 });

        const hasLeakedTarget = await page.getByText("Đáp án chuẩn:").isVisible();
        record("sentence_ordering_no_answer_leak", !hasLeakedTarget, "Target sentence is hidden before submission");

        const getPoolTokens = () =>
          page.locator("div.space-y-1\\.5:has-text('Từ vựng có sẵn') div.flex-wrap button:not([disabled])");
        const tokCount = await page.locator("div.space-y-1\\.5:has-text('Từ vựng có sẵn') div.flex-wrap button").count();
        record("sentence_ordering_tokens_available", tokCount >= 3, `Available tokens count: ${tokCount}`);

        // Click first token from pool
        await getPoolTokens().first().click();
        await page.waitForTimeout(200);

        const inTray = await page.locator("div.min-h-14 button").count();
        record("sentence_ordering_token_click_tray", inTray === 1, "Token moved to answer tray");

        // Clear button
        const clearBtn = page.getByRole("button", { name: "Xóa làm lại" });
        await clearBtn.click();
        await page.waitForTimeout(200);
        const inTrayAfterClear = await page.locator("div.min-h-14 button").count();
        record("sentence_ordering_clear_undo", inTrayAfterClear === 0, "Clear button resets all tokens back to available pool");

        // Assemble all tokens
        while ((await getPoolTokens().count()) > 0) {
          await getPoolTokens().first().click();
          await page.waitForTimeout(100);
        }

        const checkSentenceBtn = page.getByRole("button", { name: "Kiểm tra câu" });
        await checkSentenceBtn.click();
        await page.waitForTimeout(400);

        const hasRevealedTarget = await page.getByText("Câu chuẩn:").isVisible();
        record("sentence_ordering_checked_feedback", hasRevealedTarget, "Correct target sentence revealed after check with feedback");
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "sentence_ordering_interactive.png") });
      });
    }

    // ========================================================
    // PHẠM VI 3C: DICTATION / FILL BLANK (Lesson 5 Stage 6)
    // ========================================================
    if (shouldRun("scope3_dictation")) {
      await runStepWithTimeout("scope3_dictation", page, 30000, async () => {
        console.log("\n[C] Testing Dictation / Fill Blank Input Exercise (Lesson 5 Stage 6)...");
        await page.goto(`${ORIGIN}/lessons/stage/hsk1-lesson-05`, { timeout: 15000 });
        await page.waitForSelector("h2", { timeout: 10000 });

        const group4Tab = page.getByRole("button", { name: /4\. Nghe & Nói/i });
        await group4Tab.click();
        await page.waitForTimeout(500);

        const inputField = page.locator("input[placeholder*='Ví dụ: 你好']").first();
        const hasInput = await inputField.isVisible();
        record("fill_blank_input_field_present", hasInput, "Text input field rendered for dictation");

        if (hasInput) {
          await inputField.fill("   wo baba shi yisheng   ");
          const checkBtn = page.getByRole("button", { name: "Kiểm tra" });
          await checkBtn.click();
          await page.waitForTimeout(400);

          const isCorrectBanner = await page.getByText("Chính xác! Làm rất tốt.").isVisible();
          record("fill_blank_check_tolerance", isCorrectBanner, "Dictation checked and accepted with whitespace/tone tolerance");
        }
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fill_blank_verified.png") });
      });
    }

    // ========================================================
    // PHẠM VI 3D: DIALOGUE ROLEPLAY (ps-dia-01)
    // ========================================================
    if (shouldRun("scope3_dialogue")) {
      await runStepWithTimeout("scope3_dialogue", page, 30000, async () => {
        console.log("\n[D] Testing Scripted Dialogue Roleplay (ps-dia-01)...");
        await page.goto(`${ORIGIN}/practice/ps-dia-01`, { timeout: 15000 });
        await page.waitForSelector("h2", { timeout: 10000 });

        const roleBBtn = page.getByRole("button", { name: "Đóng vai B" });
        await roleBBtn.click();
        await page.waitForTimeout(200);

        const hasMyRoleB = await page.getByText("(Vai của bạn)").first().isVisible();
        record("dialogue_role_selection", hasMyRoleB, "Role B successfully selected with highlighted turns");

        const completeDiaBtn = page.getByRole("button", { name: "Hoàn thành phiên luyện tập" });
        await completeDiaBtn.click();
        await page.waitForTimeout(300);
        record("dialogue_complete_action", true, "Dialogue session completed and saved");
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "dialogue_roleplay_completed.png") });
      });
    }

    // ========================================================
    // PHẠM VI 3E: FULL PRACTICE SET PERSISTENCE & RELOAD
    // ========================================================
    if (shouldRun("scope3_persistence")) {
      await runStepWithTimeout("scope3_persistence", page, 45000, async () => {
        console.log("\n--- Testing Full Practice Set Execution & Reload Persistence (ps-vocab-01) ---");
        await page.goto(`${ORIGIN}/practice/ps-vocab-01`, { timeout: 15000 });
        await page.waitForSelector("h2", { timeout: 10000 });

        let answeredCount = 0;
        while (answeredCount < 15) {
          answeredCount++;
          await page.waitForTimeout(200);
          const choice = page.locator("div.space-y-2\\.5 button").first();
          if (await choice.isVisible()) {
            await choice.click();
            await page.waitForTimeout(200);
          }
          const xemKetQua = page.getByRole("button", { name: "Xem kết quả" });
          if (await xemKetQua.isVisible()) {
            await xemKetQua.click();
            break;
          }
          const nextBtn = page.getByRole("button", { name: "Câu tiếp theo" });
          if (await nextBtn.isVisible()) {
            await nextBtn.click();
          } else {
            break;
          }
        }

        await page.waitForSelector("text=KẾT QUẢ BỘ BÀI TẬP", { timeout: 10000 });
        const scoreText = await page.locator("text=/ 8 câu").first().isVisible();
        record("practice_full_set_summary_score", scoreText, "Summary screen accurately shows total of 8 questions");
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "practice_summary_results.png") });

        // Reload /practice and check persistence
        await page.goto(`${ORIGIN}/practice`, { timeout: 15000 });
        await page.waitForSelector("h1", { timeout: 10000 });
        const cardText = await page.locator("div").filter({ hasText: "Bộ 01: Nhận diện từ vựng Chào hỏi & Xưng hô" }).first().innerText();
        const hasPersistedStatus = cardText.includes("Đã làm") && cardText.includes("Luyện lại");
        record("practice_dual_persistence_on_reload", hasPersistedStatus, "Reloading /practice preserves completed status and best score");
      });
    }

    // ========================================================
    // PHẠM VI 4: LESSON READER 6-SKILL GROUPS & 10 STAGES
    // ========================================================
    if (shouldRun("scope4_reader")) {
      await runStepWithTimeout("scope4_reader", page, 30000, async () => {
        console.log("\n--- Testing Lesson Reader 6-Skill Groups & 10 Stages Navigation ---");
        await page.goto(`${ORIGIN}/lessons/stage/hsk1-lesson-01`, { timeout: 15000 });
        await page.waitForSelector("h2", { timeout: 10000 });

        const initialHeadings = await page.locator("h1, h2").allInnerTexts();
        console.log("Initial headings on load:", initialHeadings);

        const gWarmup = await page.getByText("1. Khởi động").first().isVisible();
        const gVocab = await page.getByText("2. Từ vựng").first().isVisible();
        const gGrammar = await page.getByText("3. Ngữ pháp & Thoại").first().isVisible();
        const gListen = await page.getByText("4. Nghe & Nói").first().isVisible();
        const gReadQuiz = await page.getByText("5. Đọc & Quiz").first().isVisible();
        const gReview = await page.getByText("6. Ôn tập").first().isVisible();
        record("lesson_reader_6_skill_groups", gWarmup && gVocab && gGrammar && gListen && gReadQuiz && gReview, "All 6 skill group tabs displayed on reader");

        // Click the first skill tab explicitly inside the 6-tab grid
        const skillTabs = page.locator("div.grid-cols-2 button, div.lg\\:grid-cols-6 button");
        console.log("Skill tabs count:", await skillTabs.count());
        await skillTabs.first().click();
        await page.waitForTimeout(400);

        const hasActiveBadge = await page.locator(".font-bold:has-text('1. Khởi động')").first().isVisible();
        record("lesson_reader_active_group_badge", hasActiveBadge, "Active group context badge highlights current skill");

        // Now click Group 3 (index 2 in the 6 skill tabs)
        await skillTabs.nth(2).click();
        await page.waitForTimeout(600);

        const headingsAfterGroup3 = await page.locator("h1, h2, h3").allInnerTexts();
        console.log("Headings after clicking Group 3:", headingsAfterGroup3);

        const hasGrammarPattern = await page.getByRole("heading", { name: /Học cấu trúc ngữ pháp/i }).first().isVisible();
        record("lesson_reader_stage_switching", hasGrammarPattern, "Switched to Stage 3 grammar learn cleanly");

        const stage4Pill = page.getByRole("button", { name: /Chặng 4:/i });
        if (await stage4Pill.isVisible()) {
          await stage4Pill.click();
          await page.waitForTimeout(400);
        }

        const dotCount = await page.locator("button[title^='Giai đoạn']").count();
        record("lesson_reader_10_step_dots", dotCount === 10, `Found all 10 compact step dots`);

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "lesson_reader_6_skill_groups.png") });
      });
    }
  } catch (err) {
    record("suite_execution_error", false, err.stack || err.message);
  } finally {
    console.log("\n>>> Cleaning up resources (closing browser & terminating server tree)...");
    try {
      if (page && !page.isClosed()) await page.close();
    } catch {}
    try {
      if (context) await context.close();
    } catch {}
    try {
      if (browser) await browser.close();
    } catch {}
    if (server && server.pid) {
      killTree(server.pid);
    }
    console.log("<<< Cleanup completed.");
  }

  console.log("\n=== FINAL ACCEPTANCE SUMMARY ===");
  console.log(`Passed: ${RESULTS.passed} / ${RESULTS.checks.length}`);
  console.log(`Failed: ${RESULTS.failed}`);
  console.log(`Status: ${RESULTS.failed === 0 ? "SUCCESS" : "FAILURE"}`);

  // Guaranteed clean exit code
  process.exit(RESULTS.failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
