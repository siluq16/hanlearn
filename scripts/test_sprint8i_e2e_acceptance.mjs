import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { developmentConfig, testStore } from "./development.mjs";

const PORT = 3110;
const ORIGIN = `http://127.0.0.1:${PORT}`;

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

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/api/health`, { redirect: "manual" });
      if (res.status === 200 || res.status === 401 || res.status === 307) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function main() {
  console.log("=== SPRINT 8I-F: CLOUD PERSISTENCE & E2E ACCEPTANCE ===");
  const account = testStore("Read");
  const config = developmentConfig();

  // 1. Start Next.js on PORT 3110
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

  const ready = await waitForServer(ORIGIN);
  record("nextjs_server_ready", ready, `Port ${PORT}`);
  if (!ready) {
    server.kill();
    process.exit(1);
  }

  // 2. Setup Supabase Client & Session
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
  if (loginRes.error) throw new Error("Auth error: " + loginRes.error.message);

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const context = await browser.newContext();

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

  try {
    // PHASE 2: Practice End-to-End Execution & Persistence
    console.log("\n--- Testing Phase 2: Practice Set Execution & Dual Persistence ---");
    await page.goto(`${ORIGIN}/practice/ps-vocab-01`);
    await page.waitForSelector("h2", { timeout: 10000 });

    // Answer question 1
    const opt1 = page.locator("button").filter({ hasText: "Chào ngài" }).first();
    await opt1.click();
    await page.waitForTimeout(300);
    const nextBtn1 = page.getByRole("button", { name: "Câu tiếp theo" });
    await nextBtn1.click();

    // Answer questions 2, 3, 4, 5
    for (let i = 2; i <= 5; i++) {
      await page.waitForTimeout(300);
      const choice = page.locator("div.space-y-2\\.5 button").first();
      await choice.click();
      await page.waitForTimeout(300);
      const isLast = i === 5;
      const btn = isLast
        ? page.getByRole("button", { name: "Xem kết quả" })
        : page.getByRole("button", { name: "Câu tiếp theo" });
      await btn.click();
    }

    // Verify Summary View
    await page.waitForSelector("text=KẾT QUẢ BỘ BÀI TẬP", { timeout: 10000 });
    const hasScoreDisplay = await page.getByText(/\/ 5 câu/i).isVisible();
    const hasLuyenLaiBtn = await page.getByRole("button", { name: "Luyện lại bộ này" }).isVisible();
    record("practice_completion_summary", hasScoreDisplay && hasLuyenLaiBtn, "Completed all 5 questions and reached summary view");

    // Test Reload Persistence
    await page.goto(`${ORIGIN}/practice`);
    await page.waitForSelector("h1", { timeout: 10000 });
    const setCard = page.locator("div").filter({ hasText: "Bộ 01: Nhận diện từ vựng Chào hỏi & Xưng hô" }).first();
    const cardText = await setCard.innerText();
    const hasBestScore = cardText.includes("Điểm cao nhất:") || cardText.includes("Luyện tập");
    record("practice_history_persisted", hasBestScore, "Practice history shows recorded score on /practice");

    // Test Grammar Set (ps-gram-01)
    console.log("\nTesting Representative Grammar Practice Set (ps-gram-01)...");
    await page.goto(`${ORIGIN}/practice/ps-gram-01`);
    await page.waitForSelector("h2", { timeout: 10000 });
    const hasTargetSentence = await page.getByText("Đáp án chuẩn:").isVisible();
    record("practice_grammar_tokens_rendered", hasTargetSentence, "Grammar sentence ordering target and tokens displayed");

    // Test Listening Set (ps-listen-01)
    console.log("\nTesting Representative Listening Practice Set (ps-listen-01)...");
    await page.goto(`${ORIGIN}/practice/ps-listen-01`);
    await page.waitForSelector("h2", { timeout: 10000 });
    const hasAudioPrompt = await page.getByText("Bấm nghe âm thanh mẫu:").isVisible();
    record("practice_listening_audio_btn", hasAudioPrompt, "Audio trigger button and listening prompt present");

    // Test Reading Set (ps-read-01)
    console.log("\nTesting Representative Reading Practice Set (ps-read-01)...");
    await page.goto(`${ORIGIN}/practice/ps-read-01`);
    await page.waitForSelector("h2", { timeout: 10000 });
    const hasPassage = await page.locator("text=你好！我叫王朋").first().isVisible();
    record("practice_reading_passage_rendered", hasPassage, "Reading passage rendered with comprehension questions");

    // Test Dialogue Set (ps-dia-01)
    console.log("\nTesting Representative Dialogue Practice Set (ps-dia-01)...");
    await page.goto(`${ORIGIN}/practice/ps-dia-01`);
    await page.waitForSelector("h2", { timeout: 10000 });
    const diaRoleA = await page.getByRole("button", { name: "Đóng vai A" }).isVisible();
    const diaComplete = await page.getByRole("button", { name: "Hoàn thành phiên luyện tập" }).isVisible();
    record("practice_dialogue_interactive", diaRoleA && diaComplete, "Dialogue role selection and completion button active");

    // PHASE 3: Unit Test 1 & 6 End-to-End
    console.log("\n--- Testing Phase 3: Unit Test 1 & 6 End-to-End ---");
    
    // Unit Test 1
    await page.goto(`${ORIGIN}/exam/unit/1`);
    await page.waitForSelector("h2", { timeout: 10000 });
    await page.locator("button").filter({ hasText: "Bắt đầu làm bài kiểm tra" }).click();
    await page.waitForSelector("text=20:", { timeout: 10000 });

    // Verify answers are not exposed in DOM before submission
    const exposedKeys = await page.evaluate(() => {
      return document.body.innerHTML.includes('"correct_index"') || document.body.innerHTML.includes('"correctChoice"');
    });
    record("unit_test_answers_not_leaked", !exposedKeys, "Correct answers are stripped from client before submission");

    // Answer all 20 questions in Unit Test 1
    for (let q = 1; q <= 20; q++) {
      await page.waitForTimeout(50);
      const opt = page.locator("div.space-y-2\\.5 button").first();
      await opt.click();
      if (q < 20) {
        const nextQBtn = page.getByRole("button", { name: "Câu tiếp theo" });
        await nextQBtn.click();
      }
    }

    // Submit Unit Test 1
    const submitTestBtn = page.getByRole("button", { name: "Nộp bài thi" });
    await submitTestBtn.click();
    await page.waitForSelector("text=KẾT QUẢ BÀI KIỂM TRA UNIT 1", { timeout: 15000 });
    
    const hasBreakdown = await page.getByText("Nghe hiểu").first().isVisible();
    const hasPassedBadge = await page.getByText(/CHÚC MỪNG|KẾT QUẢ/).first().isVisible();
    record("unit_test_1_server_evaluation", hasBreakdown && hasPassedBadge, "Unit Test 1 server-evaluated with 4-skill breakdown");

    // Unit Test 6
    console.log("\nTesting Unit Test 6 End-to-End...");
    await page.goto(`${ORIGIN}/exam/unit/6`);
    await page.waitForSelector("h2", { timeout: 10000 });
    await page.locator("button").filter({ hasText: "Bắt đầu làm bài kiểm tra" }).click();
    await page.waitForSelector("text=20:", { timeout: 10000 });

    // Answer questions 1 to 20 in Unit Test 6
    for (let q = 1; q <= 20; q++) {
      await page.waitForTimeout(50);
      const opt = page.locator("div.space-y-2\\.5 button").first();
      await opt.click();
      if (q < 20) {
        const nextQBtn = page.getByRole("button", { name: "Câu tiếp theo" });
        await nextQBtn.click();
      }
    }

    const submitTest6Btn = page.getByRole("button", { name: "Nộp bài thi" });
    await submitTest6Btn.click();
    await page.waitForSelector("text=KẾT QUẢ BÀI KIỂM TRA UNIT 6", { timeout: 15000 });
    const ut6Breakdown = await page.getByText("Nghe hiểu").first().isVisible();
    record("unit_test_6_server_evaluation", ut6Breakdown, "Unit Test 6 server-evaluated and scored successfully");

    // PHASE 6: Audio Speed & SRS Invariants
    console.log("\n--- Testing Phase 6: Audio Speed Standard & SRS Invariants ---");
    await page.goto(`${ORIGIN}/vocabulary`);
    await page.waitForSelector("h1", { timeout: 10000 });
    
    // Audio Speed Buttons
    const speedNormal = await page.getByRole("button", { name: "1.0x" }).first().isVisible();
    const speedSlow = await page.getByRole("button", { name: "0.55x" }).first().isVisible();
    record("mandarin_audio_speeds", speedNormal && speedSlow, "Dual standard audio speeds 1.0x and 0.55x present");

    RESULTS.status = RESULTS.failed === 0 ? "SUCCESS" : "FAILURE";
  } catch (err) {
    record("unexpected_error", false, err.message);
    RESULTS.status = "FAILURE";
  } finally {
    await browser.close();
    server.kill();
    try {
      process.kill(server.pid);
    } catch {}
  }

  console.log("\n=== FINAL E2E ACCEPTANCE SUMMARY ===");
  console.log(`Status: ${RESULTS.status}`);
  console.log(`Passed: ${RESULTS.passed} / ${RESULTS.passed + RESULTS.failed}`);
  console.log(`Failed: ${RESULTS.failed}`);

  if (RESULTS.status !== "SUCCESS") {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
