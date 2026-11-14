import { createServer } from "vite";
import path from "node:path";
import { chromium } from "playwright";

const repo = process.cwd();
const PORT = 3128;

async function run() {
  console.log("=== BẮT ĐẦU KIỂM TRA BROWSER TÍNH NĂNG LUYỆN NÓI HSK 1 ===");

  const server = await createServer({
    configFile: false,
    root: path.join(repo, "tests/fixtures/speaking-browser"),
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

    // Instrument Web Speech API (Synthesis & Recognition)
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
          }, 40);
          return origSpeak(utterance);
        };
      }

      class MockSpeechRecognition {
        constructor() {
          this.continuous = false;
          this.interimResults = false;
          this.lang = "zh-CN";
          this.onstart = null;
          this.onaudiostart = null;
          this.onspeechstart = null;
          this.onspeechend = null;
          this.onaudioend = null;
          this.onend = null;
          this.onresult = null;
          this.onerror = null;
        }
        start() {
          if (this.onstart) this.onstart(new Event("start"));
          if (this.onaudiostart) this.onaudiostart(new Event("audiostart"));
          if (this.onspeechstart) this.onspeechstart(new Event("speechstart"));

          const spokenText = window.__mockSpokenText || "你好";
          setTimeout(() => {
            if (this.onresult) {
              const mockEvent = {
                resultIndex: 0,
                results: [
                  [
                    {
                      transcript: spokenText,
                      confidence: 0.95,
                    },
                  ],
                ],
              };
              mockEvent.results[0].isFinal = true;
              this.onresult(mockEvent);
            }
            setTimeout(() => {
              if (this.onspeechend) this.onspeechend(new Event("speechend"));
              if (this.onaudioend) this.onaudioend(new Event("audioend"));
              if (this.onend) this.onend(new Event("end"));
            }, 30);
          }, 60);
        }
        stop() {
          if (this.onspeechend) this.onspeechend(new Event("speechend"));
          if (this.onaudioend) this.onaudioend(new Event("audioend"));
          if (this.onend) this.onend(new Event("end"));
        }
        abort() {
          if (this.onend) this.onend(new Event("end"));
        }
      }

      window.SpeechRecognition = MockSpeechRecognition;
      window.webkitSpeechRecognition = MockSpeechRecognition;
    });

    console.log("\n[Bước 1] Mở trang Thiết lập Luyện nói HSK 1...");
    await page.goto(`http://127.0.0.1:${PORT}`);
    await page.waitForSelector('[data-testid="start-speaking-btn"]');

    // Kiểm tra thông tin quyền riêng tư và khuyến cáo thanh điệu
    const setupContent = await page.textContent("body");
    if (!setupContent.includes("Bảo vệ quyền riêng tư")) {
      throw new Error("LỖI: Thiếu thông tin bảo vệ quyền riêng tư tại màn hình thiết lập!");
    }
    if (!setupContent.includes("không thay thế cho đánh giá thanh điệu")) {
      throw new Error("LỖI: Thiếu khuyến cáo giới hạn thanh điệu tại màn hình thiết lập!");
    }
    console.log("  -> Xác nhận: Hiển thị đầy đủ thông tin quyền riêng tư và giới hạn thanh điệu.");

    // Chọn số lượng 5 câu
    await page.click('[data-testid="count-5"]');

    // Bấm Bắt đầu luyện nói
    await page.click('[data-testid="start-speaking-btn"]');
    await page.waitForSelector('[data-testid="speaking-session-screen"]');
    console.log("  -> Đã vào màn hình luyện nói thành công.");

    // --- BƯỚC 2: Kiểm tra thẻ mục tiêu câu 1 & nghe phát âm mẫu ---
    console.log("\n[Bước 2] Kiểm tra hiển thị chữ Hán, Pinyin, nghĩa và nghe mẫu...");
    const hanzi1 = await page.textContent('[data-testid="target-hanzi"]');
    const pinyin1 = await page.textContent('[data-testid="target-pinyin"]');
    const meaning1 = await page.textContent('[data-testid="target-meaning"]');
    console.log(`  -> Câu 1: "${hanzi1}" (${pinyin1}) - ${meaning1}`);
    if (!hanzi1 || !pinyin1 || !meaning1) {
      throw new Error("LỖI: Thẻ từ vựng hiển thị thiếu thông tin!");
    }

    // Bấm Nghe phát âm mẫu
    await page.click('[data-testid="play-sample-btn"]');
    await page.waitForTimeout(200);
    const speechCall = await page.evaluate(() => window.__speechCalls[window.__speechCalls.length - 1]);
    console.log(`  -> Đã phát âm mẫu Web Speech: "${speechCall?.text}" (rate: ${speechCall?.rate})`);
    if (!speechCall || !speechCall.text) {
      throw new Error("LỖI: Phát âm mẫu không gọi speechSynthesis.speak!");
    }

    // --- BƯỚC 3: Thử nghiệm phát âm khớp chính xác (Exact match) ---
    console.log("\n[Bước 3] Thử nghiệm phát âm khớp chính xác (Exact match)...");
    await page.evaluate((targetText) => {
      window.__mockSpokenText = targetText;
    }, hanzi1.trim());

    await page.click('[data-testid="record-btn"]');
    await page.waitForSelector('[data-testid="speaking-result-card"]');

    const badgeText1 = await page.textContent('[data-testid="match-status-badge"]');
    const feedbackText1 = await page.textContent('[data-testid="match-feedback-text"]');
    console.log(`  -> Trạng thái: "${badgeText1}", Phản hồi: "${feedbackText1}"`);
    if (!badgeText1?.includes("Khớp chính xác")) {
      throw new Error(`Mong đợi "Khớp chính xác", nhận được: "${badgeText1}"`);
    }

    // --- BƯỚC 4: Chuyển sang câu 2 & thử nghiệm phát âm gần khớp (Partial match) ---
    console.log("\n[Bước 4] Chuyển câu 2 và thử nghiệm gần khớp (Partial match)...");
    await page.click('[data-testid="next-speak-btn"]');
    await page.waitForTimeout(200);

    const hanzi2 = await page.textContent('[data-testid="target-hanzi"]');
    console.log(`  -> Câu 2: "${hanzi2}"`);

    // Giả lập nói thiếu 1 chữ hoặc chỉ nói 1 phần
    const partialSpoken = hanzi2.length > 2 ? hanzi2.slice(0, 2) : hanzi2.slice(0, 1);
    await page.evaluate((txt) => {
      window.__mockSpokenText = txt;
    }, partialSpoken);

    await page.click('[data-testid="record-btn"]');
    await page.waitForSelector('[data-testid="speaking-result-card"]');

    const badgeText2 = await page.textContent('[data-testid="match-status-badge"]');
    console.log(`  -> Trạng thái câu 2: "${badgeText2}"`);
    if (!badgeText2?.includes("Gần khớp")) {
      throw new Error(`Mong đợi "Gần khớp", nhận được: "${badgeText2}"`);
    }

    // --- BƯỚC 5: Chuyển sang câu 3 & thử nghiệm cần thử lại (Retry match) ---
    console.log("\n[Bước 5] Chuyển câu 3 và thử nghiệm cần thử lại (Retry match)...");
    await page.click('[data-testid="next-speak-btn"]');
    await page.waitForTimeout(200);

    const hanzi3 = await page.textContent('[data-testid="target-hanzi"]');
    console.log(`  -> Câu 3: "${hanzi3}"`);

    // Giả lập nói từ hoàn toàn khác
    await page.evaluate(() => {
      window.__mockSpokenText = "苹果";
    });

    await page.click('[data-testid="record-btn"]');
    await page.waitForSelector('[data-testid="speaking-result-card"]');

    const badgeText3 = await page.textContent('[data-testid="match-status-badge"]');
    console.log(`  -> Trạng thái câu 3: "${badgeText3}"`);
    if (!badgeText3?.includes("Cần thử lại")) {
      throw new Error(`Mong đợi "Cần thử lại", nhận được: "${badgeText3}"`);
    }

    // --- BƯỚC 6: Trả lời câu 4 và 5 để hoàn thành đủ 5 câu ---
    console.log("\n[Bước 6] Trả lời câu 4 và câu 5 để hoàn thành phiên...");
    for (let c = 4; c <= 5; c++) {
      await page.click('[data-testid="next-speak-btn"]');
      await page.waitForTimeout(200);

      const hanzi = await page.textContent('[data-testid="target-hanzi"]');
      await page.evaluate((txt) => {
        window.__mockSpokenText = txt;
      }, hanzi.trim());

      await page.click('[data-testid="record-btn"]');
      await page.waitForSelector('[data-testid="speaking-result-card"]');
    }

    // --- BƯỚC 7: Kết thúc phiên và kiểm tra Màn hình Tổng kết ---
    console.log("\n[Bước 7] Hoàn thành phiên và kiểm tra Màn hình Tổng kết...");
    await page.click('[data-testid="next-speak-btn"]');
    await page.waitForSelector('[data-testid="speaking-summary"]');
    console.log("  -> Đã vào màn hình Tổng kết phiên luyện nói.");

    const summaryText = await page.textContent('[data-testid="speaking-summary"]');
    if (!summaryText.includes("3 khớp chính xác") || !summaryText.includes("1 gần khớp") || !summaryText.includes("1 cần luyện thêm")) {
      throw new Error(`LỖI: Bảng tổng kết không phản ánh chính xác kết quả 5 câu! Nội dung: ${summaryText}`);
    }
    if (!summaryText.includes("không phản ánh toàn diện độ chuẩn xác của thanh điệu âm học")) {
      throw new Error("LỖI: Thiếu khuyến cáo thanh điệu trên màn hình tổng kết!");
    }
    console.log("  -> Tổng kết chính xác: 3 chính xác, 1 gần khớp, 1 cần thử lại kèm đầy đủ khuyến cáo thanh điệu.");

    // Kiểm tra nút Luyện lại
    await page.click('[data-testid="restart-speaking-btn"]');
    await page.waitForSelector('[data-testid="speaking-session-screen"]');
    console.log("  -> Nút 'Luyện lại' hoạt động tốt (đã reset về câu 1).");

    console.log("\n=== TẤT CẢ CÁC BƯỚC KIỂM TRA BROWSER LUYỆN NÓI ĐỀU ĐẠT (PASS) ===");
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

run().catch((err) => {
  console.error("\n❌ LỖI TRONG QUÁ TRÌNH KIỂM TRA:", err);
  process.exit(1);
});
