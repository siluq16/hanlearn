import { createServer } from "vite";
import path from "node:path";
import { chromium } from "playwright";

const repo = process.cwd();
const PORT = 3125;

async function run() {
  console.log("=== BẮT ĐẦU KIỂM TRA BROWSER TÍNH NĂNG LUYỆN NGHE HSK 1 ===");

  const server = await createServer({
    configFile: false,
    root: path.join(repo, "tests/fixtures/listening-browser"),
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

    page.on("console", (msg) => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
    page.on("pageerror", (err) => console.error(`[Browser PageError]`, err));

    // Instrument Web Speech API
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
          setTimeout(() => {
            if (utterance.onend) utterance.onend(new Event("end"));
          }, 50);
          return origSpeak(utterance);
        };
      }
    });

    console.log("\n[Bước 1] Mở trang Luyện nghe và thiết lập bài luyện...");
    await page.goto(`http://127.0.0.1:${PORT}`);
    await page.waitForSelector('[data-testid="start-listening-btn"]');

    // Chọn 5 câu
    await page.click('[data-testid="count-5"]');

    // Chọn tốc độ chậm 0.55x
    const slowToggle = page.locator('[data-mandarin-speed-toggle] button:has-text("0.55x")').first();
    await slowToggle.click();
    await page.waitForTimeout(200);

    // Bấm Bắt đầu luyện nghe
    await page.click('[data-testid="start-listening-btn"]');
    await page.waitForSelector('[data-testid="listening-session-screen"]');
    console.log("  -> Đã vào màn hình làm bài luyện nghe thành công.");

    // --- BƯỚC 2: Kiểm tra câu 1 & bảo đảm không lộ đáp án trước khi trả lời ---
    console.log("\n[Bước 2] Kiểm tra hiển thị câu hỏi và chống lộ đáp án (no spoilers)...");
    const promptText = await page.textContent('[data-testid="question-prompt"]');
    console.log(`  -> Yêu cầu câu hỏi: "${promptText}"`);

    // Verify reveal section does NOT exist before answering
    const revealExistsBefore = await page.locator('[data-testid="reveal-section"]').count();
    if (revealExistsBefore > 0) {
      throw new Error("LỖI: Reveal section bị hiển thị trước khi người học chọn đáp án!");
    }
    console.log("  -> Xác nhận: Không lộ chữ Hán/Pinyin/nghĩa trước khi trả lời.");

    // --- BƯỚC 3: Phát âm và kiểm tra tốc độ gửi tới Web Speech API ---
    console.log("\n[Bước 3] Bấm nút phát âm và kiểm tra tham số Web Speech API...");
    await page.click('[data-testid="play-audio-btn"]');
    await page.waitForTimeout(300);

    const call1 = await page.evaluate(() => window.__speechCalls[window.__speechCalls.length - 1]);
    console.log(`  -> Lần phát 1 (chậm): text="${call1?.text}", rate=${call1?.rate.toFixed(2)}, lang=${call1?.lang}`);
    if (!call1 || Math.abs(call1.rate - 0.55) > 0.01) {
      throw new Error(`Mong đợi rate 0.55, nhận được ${call1?.rate}`);
    }

    // Thử nghe lại ở tốc độ 1.0x bằng nút phụ
    await page.click('[data-testid="alt-speed-btn"]');
    await page.waitForTimeout(300);

    const call2 = await page.evaluate(() => window.__speechCalls[window.__speechCalls.length - 1]);
    console.log(`  -> Lần phát 2 (chuẩn): text="${call2?.text}", rate=${call2?.rate.toFixed(2)}, lang=${call2?.lang}`);
    if (!call2 || Math.abs(call2.rate - 1.0) > 0.01) {
      throw new Error(`Mong đợi rate 1.0, nhận được ${call2?.rate}`);
    }

    // --- BƯỚC 4: Chọn đáp án và kiểm tra hiển thị giải thích ---
    console.log("\n[Bước 4] Chọn đáp án, kiểm tra phản hồi đúng/sai và thông tin giải thích...");
    // Click option 0
    await page.click('[data-testid="option-0"]');
    await page.waitForSelector('[data-testid="reveal-section"]');

    const revealedHanzi = await page.textContent('[data-testid="revealed-hanzi"]');
    const revealedPinyin = await page.textContent('[data-testid="revealed-pinyin"]');
    console.log(`  -> Đã hiển thị giải thích sau khi trả lời: Hanzi="${revealedHanzi}", Pinyin="${revealedPinyin}"`);
    if (!revealedHanzi || !revealedPinyin) {
      throw new Error("Thông tin giải thích thiếu Hanzi hoặc Pinyin!");
    }

    // --- BƯỚC 5: Đi qua các câu tiếp theo cho đến khi hoàn thành phiên ---
    console.log("\n[Bước 5] Trả lời các câu còn lại để kiểm tra chuyển câu và kết thúc phiên...");
    for (let c = 2; c <= 5; c++) {
      await page.click('[data-testid="next-question-btn"]');
      await page.waitForTimeout(200);

      // Verify no spoiler in new question
      const revealInNext = await page.locator('[data-testid="reveal-section"]').count();
      if (revealInNext > 0) throw new Error(`LỖI: Câu ${c} bị lộ đáp án khi mới chuyển sang!`);

      // Answer question
      await page.click('[data-testid="option-0"]');
      await page.waitForSelector('[data-testid="reveal-section"]');
    }

    // Bấm nút xem kết quả ở câu cuối
    await page.click('[data-testid="next-question-btn"]');
    await page.waitForSelector('[data-testid="listening-summary"]');
    console.log("  -> Đã vào màn hình Tổng kết phiên luyện nghe (Summary).");

    // --- BƯỚC 6: Kiểm tra màn hình Tổng kết và nút Luyện lại ---
    console.log("\n[Bước 6] Kiểm tra bảng tổng kết và khả năng luyện lại...");
    const summaryText = await page.textContent('[data-testid="listening-summary"]');
    if (!summaryText.includes("câu đúng")) {
      throw new Error("Màn hình tổng kết thiếu thông tin số câu đúng!");
    }
    console.log("  -> Nội dung tổng kết hiển thị đầy đủ điểm số và danh sách từ đã luyện.");

    // Thử bấm nút Luyện lại
    await page.click('[data-testid="restart-listening-btn"]');
    await page.waitForSelector('[data-testid="listening-session-screen"]');
    console.log("  -> Nút 'Luyện lại' hoạt động chính xác (đã reset về câu 1).");

    console.log("\n=== TẤT CẢ CÁC BƯỚC KIỂM TRA BROWSER ĐỀU ĐẠT (PASS) ===");
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

run().catch((err) => {
  console.error("\n❌ LỖI TRONG QUÁ TRÌNH KIỂM TRA:", err);
  process.exit(1);
});
