# HanLearn Sprint 8N – Controlled Content Remediation Report

**Ngày thực hiện:** 2026-11-17  
**Nguyên tắc tuân thủ:** Không thay đổi bất kỳ ID ổn định nào (`vocabulary_id`, `lesson_id`, `stage_id`, `practice_set_id`, `question_id`), không thay đổi cấu trúc 32 bài học, không tự ý sửa bảng `private.curriculum_quiz_keys` trên Supabase Cloud.

---

## 1. Bảng Đối chiếu Trước và Sau Khắc phục (Before vs. After Remediation)

| Hạng mục khắc phục | Mã lỗi (`issue_id`) | Trước khi sửa (Before) | Sau khi sửa (After) | File được cập nhật |
| :--- | :---: | :--- | :--- | :--- |
| **1. Chống lộ Transcript trong phần Nghe của Mock Exam** | `ISS-8N-001` (P0) | Câu 11–20 của Mock Exam hiển thị nguyên văn lời thoại tiếng Trung (`Nữ: ... Nam: ...`) ngay trong `prompt` trên màn hình thi. | Xóa lời thoại tiếng Trung khỏi `prompt`; giữ nguyên lời thoại trong `audio_text` để thí sinh bắt buộc phải nghe băng. | `content/hsk_library/hsk1_mock_exam_official.json` |
| **2. Chống lộ Dịch nghĩa trong các lựa chọn của Mock Exam** | `ISS-8N-002` (P1) | Các lựa chọn `choices` ở Câu 16–20 và 31–39 của Mock Exam kèm sẵn dịch nghĩa tiếng Việt trong ngoặc đơn (`A. 直走... (Đi thẳng...)`). | Thay thế phần dịch tiếng Việt trong `choices` bằng phiên âm Pinyin chuẩn HSK 1 (`A. 一直走... (Yìzhí zǒu...)`), giữ bản dịch tiếng Việt trong `explanation_vi`. | `content/hsk_library/hsk1_mock_exam_official.json` |
| **3. Chuẩn hóa phạm vi từ vựng Câu 40 Mock Exam** | `ISS-8N-003` (P1) | Đoạn văn Câu 40 dùng nhiều từ HSK 3–4 (`需要, 只要, 坚持, 复习, 词汇, 语法, 通过, 轻松`). | Thay bằng đoạn văn chuẩn HSK 1 về giờ học tiếng Trung của cô Lý (`李老师是我们的汉语老师...`), giữ nguyên `correct_index: 0`. | `content/hsk_library/hsk1_mock_exam_official.json` |
| **4. Chuẩn hóa phát âm hô độc âm (`呼读音`) cho Module 0 Pinyin** | `ISS-8N-004` (P0) | `speak(init)` truyền chữ cái Latinh (`"b"`, `"q"`, `"zh"`, `"mǎ"`) vào `zh-CN` TTS khiến máy đọc thành chữ cái tiếng Anh. | Ánh xạ 21 thanh mẫu, 36 vận mẫu và 5 mức thanh điệu sang chữ Hán hô độc âm chuẩn (`波, 坡, 欺, 知, 妈, 麻, 马, 骂, 吗`) trước khi gọi `speak()`. | `src/app/(app)/pinyin/page.tsx` |
| **5. Bổ sung đủ 36 Vận mẫu & Quy tắc chính tả `ü` ở Module 0** | `ISS-8N-005` (P1) | Chỉ liệt kê 24/36 vận mẫu; ghi `q (si bật hơi)`; thiếu quy tắc lược dấu hai chấm trên `ü` sau `j, q, x, y`. | Bổ sung đủ 12 vận mẫu ghép có giới âm (đủ 36 vận mẫu); sửa mô tả `q (chi bật hơi mạnh)`; thêm quy tắc `j, q, x, y + ü -> ju, qu, xu, yu`. | `content/hsk_library/module0_pinyin.json` |
| **6. Chuẩn hóa 300/300 nghĩa tiếng Việt & câu ví dụ HSK 1** | `ISS-8N-006`, `ISS-8N-007` (P1) | 42/300 từ trên `/vocabulary` hiển thị tiếng Anh (4 từ chứa `&#8217;`), 38 từ thiếu ví dụ; 258 từ hiển thị chuỗi PDF lẫn tiếng Anh (`"zi cup cái cốc"`). Từ đa âm `只` (`zhī`) có nguy cơ lệch nghĩa với `zhǐ`. | Toàn bộ 300/300 từ có `meaning_vi` thuần Việt chuẩn xác, giải mã HTML entities và có đủ `example_zh`, `example_pinyin`, `example_vi`. Phân định rõ lượng từ `只` (`zhī`). | `content/hsk_library/hsk1_exam_2025_official_300.json`, `src/features/vocabulary/hsk1-library-vocab.ts` |
| **7. Xóa sạch Watermark / Quảng cáo Zalo & TikTok trong kho từ vựng** | `ISS-8N-008` (P1) | 11 vị trí trong `hsk1..hsk5_vocabulary.json` dính chuỗi quảng cáo Zalo/TikTok từ chân trang PDF. | Làm sạch 100% watermark quảng cáo và ký tự `\u00A0` (NBSP) trên cả 5 file từ vựng HSK 1–5. | `content/hsk_library/hsk1_vocabulary.json` .. `hsk5_vocabulary.json` |
| **8. Sửa 9 mục từ lệch cột PDF & 23 câu đứt âm tiết Pinyin** | `ISS-8N-009` (P1) | 9 mục từ (`别人, 第, 多, 分, 们, 下, 有时候, 有, 子`) bị rỗng `pinyin`; 23 câu ví dụ đứt khoảng trắng (`Chàngg ē`, `Duìb uqǐ`, `Wǒm en`). | Khôi phục đầy đủ `raw_hanzi`, `pinyin`, `raw_definition`, `example_zh_py` cho 9 mục từ và nối liền toàn bộ 23 âm tiết Pinyin bị đứt. | `content/hsk_library/hsk1_vocabulary.json` |
| **9. Bổ sung 15 từ cơ bản vào `1_vocab_core` của Bài 1 & Bài 4** | `ISS-8N-010` (P1) | 15 từ cơ bản (`你, 我, 好, 很, 吗, 谢谢, 再见, 天, 一..七`) vắng mặt trong `stages[1].vocabulary` của 32 bài học (chỉ đạt 285/300). | Bổ sung 7 từ vào Bài 1 và 8 từ vào Bài 4 (đạt **300/300 = 100%** trong 32 bài); lọc `learnedWordsSet` theo đúng 300 từ mục tiêu. | `content/hsk_library/hsk1_lesson_01.json`, `hsk1_lesson_04.json`, `src/features/courses/queries.ts` |
| **10. Chặn lộ âm đọc `bú` trên mặt trước Flashcard chữ `不`** | `ISS-8N-011` (P2) | Nghĩa `"Không (phó từ phủ định, đọc bú trước 是)"` dùng dấu phẩy nên `đọc bú` vẫn lọt lên mặt trước thẻ Việt $\rightarrow$ Hán. | Đổi thành `"Không (phó từ phủ định); đọc biến điệu bú trước thanh 4 như 是"` và nâng cấp `sanitizeCardPrompt()` để tách ghi chú phát âm sang mặt sau. | `src/features/review/hint-sanitizer.ts`, `hsk1_exam_2025_official_300.json`, `hsk1_lesson_02.json` |
| **11. Sửa 16 câu prompt lỗi template & 10 câu nhiễu lặp lại trong Practice Bank** | `ISS-8N-012`, `ISS-8N-013` (P2) | 16 câu Listening ghi `"Câu 2: Nghe đoạn phát âm '2'..."`; 10 câu `-q6` lặp lại nhiễu `['喜欢', '朋友', '中国']`. | Thay bằng hướng dẫn tiếng Việt tự nhiên và thiết kế lại 10 câu `ps-listen-01-q6..ps-listen-10-q6` với từ vựng và phương án nhiễu riêng biệt theo từng Unit. | `content/hsk_library/practice_bank.json` |
| **12. Loại bỏ chú thích ngoặc đơn làm lộ đáp án & từ vượt cấp** | `ISS-8N-014`, `ISS-8N-015` (P2) | 11 câu Practice và 4 câu Unit Test chỉ có đáp án đúng mang chú thích ngoặc đơn (`24 tệ (3 cân táo to)`, `11:50 (12 giờ kém 10)`); câu `pg09-5` dùng từ `春风/暖和`. | Đồng nhất hình thức 4 phương án lựa chọn (bỏ chú thích gợi ý trên nút đáp án) và thay câu `pg09-5` bằng câu HSK 1 (`下雨了，天气冷____。`). | `content/hsk_library/practice_bank.json`, `content/hsk_library/unit_tests/hsk1_unit_test_02..06.json` |

---

## 2. Đánh giá Tác động tới Tiến độ Học viên & Chấm điểm (Impact Analysis)

1. **Tính toàn vẹn ID & Tiến độ học viên (`learner_stage_progress`, `review_cards`, `learner_practice_history`):**
   - **0 thay đổi** đối với `vocabulary_id` (vẫn dùng cùng công thức MD5 UUID `hsk1_word_<hanzi>`), `lesson_id`, `slug`, `stage` index, `practice_set_id` và `question_id`.
   - Toàn bộ lịch sử học tập, thẻ SRS và điểm số đã lưu của người học hoàn toàn tương thích 100%.
2. **Tính toàn vẹn Chấm điểm Server (`private.curriculum_quiz_keys`):**
   - **0 thay đổi** đối với `correct_index` của 38 Curriculum Quizzes và 6 Unit Tests. Việc làm sạch chú thích ngoặc đơn trên 4 câu Unit Test (`ut2-q05`, `ut4-q11`, `ut5-q12`, `ut6-q09`) chỉ cập nhật nhãn hiển thị tiếng Việt, giữ nguyên tuyệt đối `correct_index: 0` trên server.
3. **Kế hoạch cập nhật an toàn cho các mục chưa tự sửa (`DEFERRED_REQUIRES_CLOUD_MIGRATION`):**
   - Đối với hiện tượng lệch phân bổ vị trí đáp án `correct_index = 0` trong `private.curriculum_quiz_keys` (`ISS-8N-016`): Đề xuất thực hiện trong một Sprint database riêng bằng script hoán vị có hạt giống cố định (seeded shuffle) cập nhật đồng thời cả file JSON/TS và bảng `private.curriculum_quiz_keys` thông qua migration SQL mới, tránh làm sai lệch kết quả chấm điểm trên Cloud hiện tại.
