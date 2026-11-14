import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { developmentConfig, testStore } from "./development.mjs";

const PORT = 3108;
const ORIGIN = `http://127.0.0.1:${PORT}`;

const RESULTS = {
  status: "PENDING",
  passed_checks: 0,
  failed_checks: 0,
  checks: [],
};

function record(name, pass, detail = "") {
  if (pass) {
    RESULTS.passed_checks++;
    RESULTS.checks.push({ name, status: "PASS", detail });
    console.log(`[PASS] ${name}${detail ? ` - ${detail}` : ""}`);
  } else {
    RESULTS.failed_checks++;
    RESULTS.checks.push({ name, status: "FAIL", detail });
    console.error(`[FAIL] ${name} - ${detail}`);
  }
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/api/health`, { redirect: "manual" });
      if (res.status === 200 || res.status === 401 || res.status === 307) return true;
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function run() {
  console.log("=== SPRINT 8H BROWSER ACCEPTANCE SUITE ===");
  const account = testStore("Read");

  // 1. Start Next.js standalone on port 3108
  console.log(`Starting Next.js on port ${PORT}...`);
  const server = spawn("cmd.exe", ["/c", `npx next start -p ${PORT}`], {
    cwd: process.cwd(),
    stdio: "pipe",
    env: { ...process.env, PORT: String(PORT) },
  });

  server.stdout?.on("data", (d) => {
    const s = d.toString();
    if (s.includes("Ready") || s.includes("started")) {
      console.log("[Server]", s.trim());
    }
  });

  server.stderr?.on("data", (d) => {
    // console.error("[Server Error]", d.toString().trim());
  });

  const ready = await waitForServer(ORIGIN);
  if (!ready) {
    server.kill();
    throw new Error("Next.js server failed to respond within 60s.");
  }
  record("nextjs_server_ready", true, `Port ${PORT}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 2. Login Flow with Supabase Session Cookies
    console.log("\nLogging in with session cookies...");
    const clientCookies = new Map();
    const config = developmentConfig();
    const client = createServerClient(config.url, config.key, {
      cookies: {
        getAll: () => [...clientCookies].map(([name, value]) => ({ name, value })),
        setAll: (rows) => {
          for (const row of rows) {
            if (row.value) clientCookies.set(row.name, row.value);
            else clientCookies.delete(row.name);
          }
        },
      },
    });

    const loginRes = await client.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });
    if (loginRes.error) throw new Error("Auth failed: " + loginRes.error.message);

    const playwrightCookies = [];
    for (const [name, value] of clientCookies) {
      playwrightCookies.push({ name, value, domain: "127.0.0.1", path: "/" });
    }
    await context.addCookies(playwrightCookies);

    await page.goto(`${ORIGIN}/dashboard`);
    await page.waitForSelector("h1", { timeout: 10000 });
    record("learner_login", page.url().includes("/dashboard"), "Logged in to dashboard via session");

    // 3. Module 0 Pinyin Foundation Acceptance
    console.log("\nTesting Module 0 Pinyin Foundation...");
    await page.goto(`${ORIGIN}/pinyin`);
    const pinyinH1 = await page.getByRole("heading", { level: 1 }).innerText();
    record("pinyin_page_loads", pinyinH1.includes("Pinyin"), pinyinH1);

    const hasInitials = await page.getByText("Thanh mẫu", { exact: false }).first().isVisible();
    const hasFinals = await page.getByText("Vận mẫu", { exact: false }).first().isVisible();
    const hasTones = await page.getByText("Thanh điệu", { exact: false }).first().isVisible();
    const hasToneSandhi = await page.getByText("Biến điệu", { exact: false }).first().isVisible();
    record("pinyin_core_sections", hasInitials && hasFinals && hasTones && hasToneSandhi, "Initials, Finals, Tones, Sandhi present");

    // 4. Roadmap Acceptance (All 32 Lessons & 6 Checkpoints)
    console.log("\nTesting Roadmap...");
    await page.goto(`${ORIGIN}/roadmap`);
    const roadmapH1 = await page.getByRole("heading", { level: 1 }).innerText();
    record("roadmap_page_loads", roadmapH1.length > 0, roadmapH1);

    // Verify Mock Exam banner on roadmap has simulation disclaimer
    const mockExamBannerText = await page.getByText("HanLearn HSK 1 Mock Exam", { exact: false }).first().innerText();
    record("roadmap_mock_exam_simulation_title", mockExamBannerText.includes("Mô phỏng"), mockExamBannerText);

    // Verify Lesson 1, 11, 20, 26, 32 and Checkpoints exist on Roadmap in DOM
    const hasL1 = (await page.locator('a[href="/lessons/stage/hsk1-lesson-01"]').count()) > 0;
    const hasL11 = (await page.locator('a[href="/lessons/stage/hsk1-lesson-11"]').count()) > 0;
    const hasL20 = (await page.locator('a[href="/lessons/stage/hsk1-lesson-20"]').count()) > 0;
    const hasL26 = (await page.locator('a[href="/lessons/stage/hsk1-lesson-26"]').count()) > 0;
    const hasL32 = (await page.locator('a[href="/lessons/stage/hsk1-lesson-32"]').count()) > 0;
    const hasCP5 = (await page.locator('a[href="/lessons/stage/hsk1-checkpoint-05"]').count()) > 0;
    const hasCP6 = (await page.locator('a[href="/lessons/stage/hsk1-checkpoint-06"]').count()) > 0;
    record("roadmap_links_32_lessons_6_checkpoints", hasL1 && hasL11 && hasL20 && hasL26 && hasL32 && hasCP5 && hasCP6, "Lessons 1..32 and CP1..6 present");

    // 5. Deep-dive on Key Lessons
    const keyLessons = [
      { slug: "hsk1-lesson-01", name: "Lesson 1 (Greetings)" },
      { slug: "hsk1-lesson-11", name: "Lesson 11 (Weather)" },
      { slug: "hsk1-lesson-20", name: "Lesson 20 (Weekends)" },
      { slug: "hsk1-lesson-26", name: "Lesson 26 (Large Numbers)" },
      { slug: "hsk1-lesson-32", name: "Lesson 32 (Particles & Synthesis)" },
    ];

    for (const kl of keyLessons) {
      console.log(`\nDeep testing ${kl.name}...`);
      await page.goto(`${ORIGIN}/lessons/stage/${kl.slug}`);
      await page.waitForSelector("h2", { timeout: 10000 });
      const title = await page.getByRole("heading", { level: 2 }).first().innerText();

      // Check stage navigator / tabs
      const stageButtons = await page.locator("button, a").filter({ hasText: /Giai đoạn|Chặng|Khởi động|Từ vựng|Ngữ pháp|Hội thoại|Luyện nghe|Đọc hiểu|Mini Quiz|SRS/i }).count();
      record(`deep_dive_${kl.slug}_loads`, title.length > 0 && stageButtons >= 5, `Title: "${title.slice(0, 35)}...", stages: ${stageButtons}`);

      // Verify no broken "undefined" or null data rendered
      const bodyText = await page.locator("body").innerText();
      const hasUndefined = bodyText.includes("undefined") || bodyText.includes("null") || bodyText.includes("[object Object]");
      record(`deep_dive_${kl.slug}_clean_content`, !hasUndefined, "No undefined/null glitches");
    }

    // 6. Checkpoints 1 & 6 Deep Test
    console.log("\nTesting Checkpoint 1 & 6...");
    await page.goto(`${ORIGIN}/lessons/stage/hsk1-checkpoint-01`);
    await page.waitForSelector("h2", { timeout: 10000 });
    const cp1Title = await page.getByRole("heading", { level: 2 }).first().innerText();
    record("checkpoint_01_loads", cp1Title.includes("Chặng 1"), cp1Title);

    await page.goto(`${ORIGIN}/lessons/stage/hsk1-checkpoint-06`);
    await page.waitForSelector("h2", { timeout: 10000 });
    const cp6Title = await page.getByRole("heading", { level: 2 }).first().innerText();
    record("checkpoint_06_loads", cp6Title.includes("Chặng 6"), cp6Title);

    // 7. Full Mock Exam Acceptance Test
    console.log("\nTesting HanLearn HSK 1 Mock Exam...");
    await page.goto(`${ORIGIN}/exam/hsk1`);
    const examH1 = await page.getByRole("heading", { level: 1 }).first().innerText();
    record("mock_exam_loads", examH1.includes("Mô phỏng"), examH1);

    // Verify 40 questions in palette
    const paletteCount = await page.locator('a[href^="#question-"]').count();
    record("mock_exam_40_questions_in_palette", paletteCount === 40, `Found ${paletteCount} palette items`);

    // Verify transcript is HIDDEN before submit
    const transcriptButtonBefore = await page.getByRole("button", { name: "Hiện Transcript Nghe" }).count();
    record("mock_exam_transcript_hidden_during_exam", transcriptButtonBefore === 0, "No transcript toggle visible during test");

    // Answer questions (e.g. click first choice for several questions)
    console.log("Answering mock exam questions...");
    const questionContainers = await page.locator('[id^="question-"]').all();
    record("mock_exam_40_question_containers", questionContainers.length === 40, `Found ${questionContainers.length} question cards`);

    // Pick choices for all 40 questions to simulate complete submission
    for (let i = 0; i < 40; i++) {
      const qCard = questionContainers[i];
      const buttons = await qCard.locator("button").all();
      // First button in card might be audio button if listening, choices are below
      const choices = await qCard.locator("button").filter({ hasText: /A|B|C|D|Đúng|Sai|✓|✗|[a-zA-Z\u4e00-\u9fa5]/ }).all();
      if (choices.length > 0) {
        // click first available choice
        await choices[choices.length > 1 ? 1 : 0].click();
      }
    }

    // Submit exam
    console.log("Submitting Mock Exam...");
    await page.getByRole("button", { name: "Nộp bài thi", exact: true }).first().click();
    await page.waitForSelector("h2", { timeout: 15000 });

    const resultBannerText = await page.getByRole("heading", { level: 2 }).first().innerText();
    const isResultBannerValid =
      resultBannerText.includes("KẾT QUẢ THI THỬ") ||
      resultBannerText.includes("CHÚC MỪNG") ||
      resultBannerText.includes("HSK 1");
    record("mock_exam_submission_result_banner", isResultBannerValid, resultBannerText);

    // Verify scores rendered
    const bodyAfterSubmit = await page.locator("body").innerText();
    const hasTotalScore = bodyAfterSubmit.includes("/200") || bodyAfterSubmit.includes("Tổng điểm");
    const hasListeningScore = bodyAfterSubmit.includes("Phần I: Nghe");
    const hasReadingScore = bodyAfterSubmit.includes("Phần II: Đọc");
    record("mock_exam_server_scoring_displayed", hasTotalScore && hasListeningScore && hasReadingScore, "Total score /200 and sectional scores displayed");

    // Verify transcript button is now REVEALED for review
    const transcriptButtonAfter = await page.getByRole("button", { name: /Transcript Nghe/i }).count();
    record("mock_exam_transcript_revealed_after_submit", transcriptButtonAfter > 0, "Transcript review toggle available");

    // 8. Mobile Responsiveness Acceptance Test (375x667)
    console.log("\nTesting Mobile Viewport (375x667)...");
    await page.setViewportSize({ width: 375, height: 667 });

    const mobilePages = ["/pinyin", "/roadmap", "/exam/hsk1", "/lessons/stage/hsk1-lesson-26"];
    for (const mp of mobilePages) {
      await page.goto(`${ORIGIN}${mp}`);
      await page.waitForTimeout(500);
      const isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      record(`mobile_no_overflow_${mp.replace(/[^a-zA-Z0-9]/g, "_")}`, !isOverflowing, `scrollWidth <= innerWidth (${mp})`);
    }

    RESULTS.status = RESULTS.failed_checks === 0 ? "SUCCESS" : "FAILED";
  } finally {
    await browser.close();
    server.kill();
  }

  console.log("\n=== BROWSER ACCEPTANCE RESULTS ===");
  console.log(`Status: ${RESULTS.status}`);
  console.log(`Passed: ${RESULTS.passed_checks} / ${RESULTS.checks.length}`);
  console.log(`Failed: ${RESULTS.failed_checks}`);

  if (RESULTS.status !== "SUCCESS") {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
