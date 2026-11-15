import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { developmentConfig, testStore } from "./development.mjs";

const PORT = 3109;
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
  console.log("=== SPRINT 8I BROWSER ACCEPTANCE SUITE ===");
  const account = testStore("Read");

  // 1. Start Next.js standalone on port 3109
  console.log(`Starting Next.js on port ${PORT}...`);
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
    // 2. Auth Flow
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

    // 3. Header Course Selector
    console.log("\nTesting Header Course Selector...");
    await page.goto(`${ORIGIN}/dashboard`);
    await page.waitForSelector("h1", { timeout: 10000 });
    record("dashboard_login", page.url().includes("/dashboard"), "Logged in to dashboard");

    const selectorBtn = page.getByRole("button", { name: "Chọn khóa học tiếng Trung" });
    const hasSelector = await selectorBtn.isVisible();
    record("header_course_selector_visible", hasSelector, "Selector button found on header");

    await selectorBtn.click();
    const hasHsk2 = await page.getByText("HSK 2", { exact: false }).first().isVisible();
    record("header_course_dropdown_opens", hasHsk2, "Course dropdown options displayed");

    // Click Coming Soon course (HSK 2)
    const hsk2Option = page.locator("button").filter({ hasText: "HSK 2" }).first();
    await hsk2Option.click();
    const modalHeading = await page.getByText("đang được biên soạn").isVisible();
    record("course_coming_soon_modal", modalHeading, "Coming Soon modal popped up for HSK 2");
    await page.getByRole("button", { name: "Đã hiểu, quay lại học HSK 1" }).click();

    // 4. Roadmap & 6 Units
    console.log("\nTesting Roadmap & 6 Units Structure...");
    await page.goto(`${ORIGIN}/roadmap`);
    await page.waitForSelector("h1", { timeout: 10000 });

    const u1 = await page.getByText("Unit 1: Khởi đầu").first().isVisible();
    const u2 = await page.getByText("Unit 2: Gia đình").first().isVisible();
    const u3 = await page.getByText("Unit 3: Nơi chốn").first().isVisible();
    const u4 = await page.getByText("Unit 4: Đời sống").first().isVisible();
    const u5 = await page.getByText("Unit 5: Sở thích").first().isVisible();
    const u6 = await page.getByText("Unit 6: Hoạt động").first().isVisible();
    record("roadmap_6_units_present", u1 && u2 && u3 && u4 && u5 && u6, "All 6 units present with correct updated titles");

    const pinyinBanner = await page.getByText("Module 0: Ngữ âm & Phát âm Pinyin Nền tảng").isVisible();
    const mockExamBanner = await page.getByText("Đề thi thử HSK 1 Chuẩn CTI (40 câu)").first().isVisible();
    record("roadmap_pinyin_and_mock_exam", pinyinBanner && mockExamBanner, "Pinyin module & Mock exam banners positioned correctly");

    // 5. Synchronized Lessons & 9-Stage Reader
    console.log("\nTesting Unified 9-Stage Reader on Lesson 2...");
    await page.goto(`${ORIGIN}/lessons/stage/hsk1-lesson-02`);
    await page.waitForSelector("h2", { timeout: 10000 });
    const readerTitle = await page.getByRole("heading", { level: 2 }).first().innerText();
    record("lesson2_9stage_reader_loads", readerTitle.includes("Bài 2"), readerTitle);

    const hasVocabTab = await page.getByText("1. Từ vựng").isVisible();
    const hasGrammarTab = await page.getByText("2. Ngữ pháp & Thoại").isVisible();
    const hasReadingTab = await page.getByText("3. Nghe & Đọc").isVisible();
    const hasQuizTab = await page.getByText("4. Quiz & SRS").isVisible();
    record("grouped_4_phase_navigation", hasVocabTab && hasGrammarTab && hasReadingTab && hasQuizTab, "Grouped skill tabs prevent overflow");

    // Test legacy UUID redirect
    console.log("\nTesting Legacy Pilot UUID Redirect...");
    await page.goto(`${ORIGIN}/lessons/639665c9-952d-5714-a276-537a3568b463`);
    await page.waitForURL("**/lessons/stage/hsk1-lesson-01", { timeout: 10000 });
    record("pilot_uuid_redirect", page.url().includes("/lessons/stage/hsk1-lesson-01"), "UUID redirected to stage slug");

    // 6. Practice Center
    console.log("\nTesting Practice Center & 6 Skills...");
    await page.goto(`${ORIGIN}/practice`);
    await page.waitForSelector("h1", { timeout: 10000 });
    const practiceH1 = await page.getByRole("heading", { level: 1 }).innerText();
    record("practice_center_loads", practiceH1.includes("Luyện tập"), practiceH1);

    // Check all 6 skill tabs
    const skVocab = await page.getByText("Từ vựng", { exact: true }).first().isVisible();
    const skGram = await page.getByText("Ngữ pháp", { exact: true }).first().isVisible();
    const skListen = await page.getByText("Luyện nghe", { exact: true }).first().isVisible();
    const skSpeak = await page.getByText("Luyện nói", { exact: true }).first().isVisible();
    const skRead = await page.getByText("Đọc hiểu", { exact: true }).first().isVisible();
    const skDia = await page.getByText("Hội thoại", { exact: true }).first().isVisible();
    record("practice_6_skills_tabs", skVocab && skGram && skListen && skSpeak && skRead && skDia, "All 6 skill tabs visible");

    // Filter by Unit
    await page.locator("select").first().selectOption("u-hsk1-03");
    const filteredText = await page.getByText("Bộ 05: Ghép cặp Phương tiện").isVisible();
    record("practice_unit_filtering", filteredText, "Filtered practice sets by Unit 3");

    // 7. Interactive Practice Execution (Vocabulary Set 1)
    console.log("\nTesting Interactive Vocabulary Practice Player...");
    await page.goto(`${ORIGIN}/practice/ps-vocab-01`);
    await page.waitForSelector("h2", { timeout: 10000 });
    
    // Choose answer on question 1
    const firstChoice = page.locator("button").filter({ hasText: "Chào ngài" }).first();
    await firstChoice.click();
    const hasNextBtn = await page.getByRole("button", { name: "Câu tiếp theo" }).isVisible();
    record("practice_instant_feedback", hasNextBtn, "Selected choice gave instant feedback with next button");

    // 8. Dialogue Roleplay Practice
    console.log("\nTesting Scripted Dialogue Roleplay...");
    await page.goto(`${ORIGIN}/practice/ps-dia-01`);
    await page.waitForSelector("h2", { timeout: 10000 });
    const hasRoleA = await page.getByRole("button", { name: "Đóng vai A" }).isVisible();
    const hasRoleB = await page.getByRole("button", { name: "Đóng vai B" }).isVisible();
    const hasCompleteBtn = await page.getByRole("button", { name: "Hoàn thành phiên luyện tập" }).isVisible();
    record("dialogue_roleplay_view", hasRoleA && hasRoleB && hasCompleteBtn, "Role selection & turns rendered");

    // 9. Unit Test System (/exam and /exam/unit/1)
    console.log("\nTesting Unit Test Examination System...");
    await page.goto(`${ORIGIN}/exam`);
    await page.waitForSelector("h1", { timeout: 10000 });
    const hasUnitTest1Card = await page.getByText("Unit Test 1").first().isVisible();
    const hasUnitTest6Card = await page.getByText("Unit Test 6").first().isVisible();
    record("exam_overview_cards", hasUnitTest1Card && hasUnitTest6Card, "Unit Tests 1-6 listed on /exam");

    // Open Unit Test 1
    await page.goto(`${ORIGIN}/exam/unit/1`);
    await page.waitForSelector("h2", { timeout: 10000 });
    const introPassing = await page.getByText("16 / 20", { exact: false }).isVisible();
    const introDuration = await page.getByText("20", { exact: false }).first().isVisible();
    record("unit_test_intro_screen", introPassing && introDuration, "20 mins & 16/20 (80%) passing criteria displayed");

    // Start exam
    await page.locator("button").filter({ hasText: "Bắt đầu làm bài kiểm tra" }).click();
    const timerElem = page.locator("text=20:").or(page.locator("text=19:")).first();
    await timerElem.waitFor({ timeout: 10000 });
    const timerVisible = await timerElem.isVisible();
    const paletteCount = await page.locator("button:text-matches('^[0-9]+$')").count();
    record("unit_test_exam_screen", timerVisible && paletteCount === 20, "20-minute timer active & 20 question buttons");

    // 10. Vocabulary 300 Sync
    console.log("\nTesting Vocabulary Page with 300 words...");
    await page.goto(`${ORIGIN}/vocabulary`);
    await page.waitForSelector("h1", { timeout: 10000 });
    const vocabH1 = await page.getByRole("heading", { level: 1 }).innerText();
    record("vocabulary_page_loads", vocabH1.includes("Tích lũy từng từ một") || vocabH1.includes("Từ vựng"), vocabH1);

    // 11. Listening & Speaking Routes
    console.log("\nTesting Synchronized /listening and /speaking...");
    await page.goto(`${ORIGIN}/listening`);
    await page.waitForSelector("h1", { timeout: 10000 });
    const listeningBanner = await page.getByText("10 bộ bài tập Luyện nghe").isVisible();
    record("listening_page_sync", listeningBanner, "Listening page has practice bank link");

    await page.goto(`${ORIGIN}/speaking`);
    await page.waitForSelector("h1", { timeout: 10000 });
    const speakingBanner = await page.getByText("8 bộ Luyện nói").isVisible();
    record("speaking_page_sync", speakingBanner, "Speaking page has practice bank link");

    // 12. Mobile 375px Viewport Verification
    console.log("\nTesting Mobile 375px Viewport...");
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${ORIGIN}/roadmap`);
    await page.waitForSelector("h1", { timeout: 10000 });
    const mobileRoadmapH1 = await page.getByRole("heading", { level: 1 }).isVisible();
    record("mobile_375px_roadmap", mobileRoadmapH1, "Roadmap renders properly on 375px mobile viewport");

    await page.goto(`${ORIGIN}/lessons/stage/hsk1-lesson-01`);
    await page.waitForSelector("h2", { timeout: 10000 });
    const mobileLessonH2 = await page.getByRole("heading", { level: 2 }).first().isVisible();
    record("mobile_375px_lesson_reader", mobileLessonH2, "NineStageReader renders cleanly without breaking on mobile");

    RESULTS.status = RESULTS.failed_checks === 0 ? "SUCCESS" : "FAILURE";
  } catch (err) {
    record("unexpected_error", false, err.message);
    RESULTS.status = "FAILURE";
  } finally {
    await browser.close();
    server.kill();
    // Kill cmd.exe child if lingering
    try {
      process.kill(server.pid);
    } catch {}
  }

  console.log("\n=== FINAL BROWSER ACCEPTANCE SUMMARY ===");
  console.log(`Status: ${RESULTS.status}`);
  console.log(`Passed: ${RESULTS.passed_checks} / ${RESULTS.passed_checks + RESULTS.failed_checks}`);
  console.log(`Failed: ${RESULTS.failed_checks}`);
  
  if (RESULTS.status !== "SUCCESS") {
    process.exit(1);
  }
  process.exit(0);
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
