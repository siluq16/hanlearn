import { createServer } from "vite";
import path from "node:path";
import { chromium } from "playwright";

const repo = process.cwd();
const PORT = 3118;

async function run() {
  console.log("=== BẮT ĐẦU KIỂM TRA BROWSER ĐỒNG BỘ TỐC ĐỘ ÂM THANH ===");

  // 1. Start synthetic Vite server
  const server = await createServer({
    configFile: false,
    root: path.join(repo, "tests/fixtures/audio-sync-browser"),
    envDir: false,
    resolve: { alias: { "@": path.join(repo, "src") } },
    oxc: { jsx: { runtime: "automatic" } },
    css: { postcss: repo },
    server: {
      host: "127.0.0.1",
      port: PORT,
      strictPort: true,
      fs: {
        strict: true,
        allow: [
          path.join(repo, "src"),
          path.join(repo, "tests"),
          path.join(repo, "node_modules"),
        ],
      },
    },
  });
  await server.listen();
  console.log(`[Harness] Server listening on http://127.0.0.1:${PORT}`);

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      channel: "chrome",
    }).catch(() => chromium.launch({ headless: true }));

    const context = await browser.newContext();
    const page = await context.newPage();

    // Instrument Web Speech API to spy on rate and speech events
    await page.addInitScript(() => {
      window.__speechCalls = [];
      const synth = window.speechSynthesis;
      if (synth) {
        const origSpeak = synth.speak.bind(synth);
        synth.speak = function (utterance) {
          window.__speechCalls.push({
            text: utterance.text,
            rate: utterance.rate,
            pitch: utterance.pitch,
            lang: utterance.lang,
            time: Date.now(),
          });
          // Dispatch fake end to prevent hanging
          setTimeout(() => {
            if (utterance.onend) utterance.onend(new Event("end"));
          }, 50);
          return origSpeak(utterance);
        };
      }
    });

    const isRateClose = (actual, expected) => Math.abs(actual - expected) < 0.001;

    // --- BƯỚC 1: Vào Lesson, chọn 0.55x và phát âm ---
    console.log("\n[Bước 1] Truy cập Lesson, chuyển tốc độ sang 0.55x và phát âm...");
    await page.goto(`http://127.0.0.1:${PORT}/?view=lesson`);
    await page.waitForSelector("[data-testid='lesson-container']");

    // Click 0.55x toggle
    const slowToggle = page.locator('[data-mandarin-speed-toggle] button:has-text("0.55x")').first();
    await slowToggle.click();
    await page.waitForTimeout(200);

    const isSlowActive1 = await slowToggle.getAttribute("data-active");
    console.log(`  -> Trạng thái nút 0.55x tại Lesson: data-active="${isSlowActive1}"`);
    if (isSlowActive1 !== "true") throw new Error("0.55x toggle không active ở Lesson!");

    // Click an audio button in lesson
    const lessonAudioBtn = page.locator('[data-testid="lesson-container"] [data-mandarin-audio-btn="true"]').first();
    await lessonAudioBtn.click();
    await page.waitForTimeout(300);

    const call1 = await page.evaluate(() => window.__speechCalls[window.__speechCalls.length - 1]);
    console.log(`  -> Web Speech API ghi nhận: text="${call1?.text}", rate=${call1?.rate}, lang=${call1?.lang}`);
    if (!call1 || !isRateClose(call1.rate, 0.55)) throw new Error(`Bước 1 thất bại: mong đợi rate 0.55, nhận được ${call1?.rate}`);

    // --- BƯỚC 2: Chuyển sang Vocabulary, xác nhận vẫn là 0.55x ---
    console.log("\n[Bước 2] Chuyển sang Vocabulary, kiểm tra đồng bộ 0.55x...");
    await page.click('[data-testid="nav-vocabulary"]');
    await page.waitForSelector('[data-testid="vocabulary-view"]');

    const vocabSlowToggle = page.locator('[data-testid="vocabulary-view"] [data-mandarin-speed-toggle] button:has-text("0.55x")');
    const isSlowActive2 = await vocabSlowToggle.getAttribute("data-active");
    console.log(`  -> Trạng thái nút 0.55x tại Vocabulary: data-active="${isSlowActive2}"`);
    if (isSlowActive2 !== "true") throw new Error("0.55x toggle không duy trì ở Vocabulary!");

    // Phát âm từ vựng số 1
    const vocabAudioBtn = page.locator('[data-testid="vocab-item-1"] [data-mandarin-audio-btn="true"]').first();
    await vocabAudioBtn.click();
    await page.waitForTimeout(300);

    const call2 = await page.evaluate(() => window.__speechCalls[window.__speechCalls.length - 1]);
    console.log(`  -> Web Speech API ghi nhận: text="${call2?.text}", rate=${call2?.rate}, lang=${call2?.lang}`);
    if (!call2 || !isRateClose(call2.rate, 0.55)) throw new Error(`Bước 2 thất bại: mong đợi rate 0.55, nhận được ${call2?.rate}`);

    // --- BƯỚC 3: Chuyển sang Review, xác nhận vẫn là 0.55x ---
    console.log("\n[Bước 3] Chuyển sang Review, kiểm tra đồng bộ 0.55x...");
    await page.click('[data-testid="nav-review"]');
    await page.waitForSelector('[data-testid="review-container"]');

    const reviewSlowToggle = page.locator('[data-testid="review-container"] [data-mandarin-speed-toggle] button:has-text("0.55x")');
    const isSlowActive3 = await reviewSlowToggle.getAttribute("data-active");
    console.log(`  -> Trạng thái nút 0.55x tại Review: data-active="${isSlowActive3}"`);
    if (isSlowActive3 !== "true") throw new Error("0.55x toggle không duy trì ở Review!");

    // Bấm nút nghe phát âm tại Review (ListenBeforeGuessButton)
    const reviewAudioBtn = page.locator('[data-listen-guess-btn="true"]');
    await reviewAudioBtn.click();
    await page.waitForTimeout(300);

    const call3 = await page.evaluate(() => window.__speechCalls[window.__speechCalls.length - 1]);
    console.log(`  -> Web Speech API ghi nhận: text="${call3?.text}", rate=${call3?.rate}, lang=${call3?.lang}`);
    if (!call3 || !isRateClose(call3.rate, 0.55)) throw new Error(`Bước 3 thất bại: mong đợi rate 0.55, nhận được ${call3?.rate}`);

    // --- BƯỚC 4: Đổi về 1.0x và kiểm tra ngược lại ---
    console.log("\n[Bước 4] Đổi về 1.0x tại Review và kiểm tra ngược lại tại Lesson...");
    const reviewNormalToggle = page.locator('[data-testid="review-container"] [data-mandarin-speed-toggle] button:has-text("1.0x")');
    await reviewNormalToggle.click();
    await page.waitForTimeout(200);

    await reviewAudioBtn.click();
    await page.waitForTimeout(300);
    const call4 = await page.evaluate(() => window.__speechCalls[window.__speechCalls.length - 1]);
    console.log(`  -> Tại Review sau khi chọn 1.0x: rate=${call4?.rate}`);
    if (!call4 || !isRateClose(call4.rate, 1.0)) throw new Error(`Bước 4 thất bại: mong đợi rate 1.0, nhận được ${call4?.rate}`);

    // Chuyển ngược lại Lesson
    await page.click('[data-testid="nav-lesson"]');
    await page.waitForSelector('[data-testid="lesson-container"]');

    const lessonNormalToggle = page.locator('[data-testid="lesson-container"] [data-mandarin-speed-toggle] button:has-text("1.0x")');
    const isNormalActive = await lessonNormalToggle.getAttribute("data-active");
    console.log(`  -> Trạng thái nút 1.0x tại Lesson: data-active="${isNormalActive}"`);
    if (isNormalActive !== "true") throw new Error("1.0x toggle không active khi quay lại Lesson!");

    const lessonAudioBtn2 = page.locator('[data-testid="lesson-container"] [data-mandarin-audio-btn="true"]').first();
    await lessonAudioBtn2.click();
    await page.waitForTimeout(300);
    const call5 = await page.evaluate(() => window.__speechCalls[window.__speechCalls.length - 1]);
    console.log(`  -> Tại Lesson sau khi đồng bộ 1.0x: rate=${call5?.rate}`);
    if (!call5 || !isRateClose(call5.rate, 1.0)) throw new Error(`Bước 4 thất bại: mong đợi rate 1.0, nhận được ${call5?.rate}`);

    // --- BƯỚC 5: Reload trang và xác nhận tốc độ được giữ ---
    console.log("\n[Bước 5] Đổi sang 0.55x, reload trang và xác nhận tốc độ được lưu giữ...");
    const lessonSlowToggle2 = page.locator('[data-testid="lesson-container"] [data-mandarin-speed-toggle] button:has-text("0.55x")');
    await lessonSlowToggle2.click();
    await page.waitForTimeout(200);

    console.log("  -> Reload trang (F5)...");
    await page.reload();
    await page.waitForSelector("[data-testid='lesson-container']");

    const reloadedSlowToggle = page.locator('[data-testid="lesson-container"] [data-mandarin-speed-toggle] button:has-text("0.55x")');
    const isSlowActiveAfterReload = await reloadedSlowToggle.getAttribute("data-active");
    console.log(`  -> Trạng thái nút 0.55x sau khi reload: data-active="${isSlowActiveAfterReload}"`);
    if (isSlowActiveAfterReload !== "true") throw new Error("Tốc độ 0.55x bị mất sau khi reload!");

    // --- BƯỚC 6: Kiểm tra tốc độ thực tế truyền vào Web Speech API ---
    console.log("\n[Bước 6] Kiểm tra chi tiết dữ liệu SpeechSynthesisUtterance...");
    const lessonAudioBtn3 = page.locator('[data-testid="lesson-container"] [data-mandarin-audio-btn="true"]').first();
    await lessonAudioBtn3.click();
    await page.waitForTimeout(300);

    const allCalls = await page.evaluate(() => window.__speechCalls);
    console.log(`  -> Tổng số lượt phát âm trong phiên: ${allCalls.length}`);
    for (const [idx, c] of allCalls.entries()) {
      console.log(`     [Lượt ${idx + 1}] rate=${c.rate.toFixed(2)}, pitch=${c.pitch}, lang=${c.lang}, text="${c.text}"`);
      if (typeof c.rate !== "number" || (!isRateClose(c.rate, 0.55) && !isRateClose(c.rate, 1.0))) {
        throw new Error(`Tốc độ bất thường tại lượt ${idx + 1}: ${c.rate}`);
      }
      if (c.pitch !== 1.0) {
        throw new Error(`Pitch bị thay đổi sai quy định tại lượt ${idx + 1}: ${c.pitch}`);
      }
      if (!c.lang.startsWith("zh")) {
        throw new Error(`Ngôn ngữ không phải tiếng Trung tại lượt ${idx + 1}: ${c.lang}`);
      }
    }

    console.log("\n=== TẤT CẢ 6 BƯỚC XÁC MINH TRÌNH DUYỆT ĐỀU ĐẠT (PASS) ===");
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

run().catch((err) => {
  console.error("\n❌ LỖI TRONG QUÁ TRÌNH KIỂM TRA:", err);
  process.exit(1);
});
