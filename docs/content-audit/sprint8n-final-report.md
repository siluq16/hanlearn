# HanLearn Sprint 8N – Final Content Quality & Learning Experience Acceptance Report

**Ngày hoàn thành:** 2026-11-17  
**Nhánh Git:** `preview/hsk1-full-curriculum`  
**Môi trường kiểm thử:** Local Production Build + Supabase Cloud Development (`hhgxrjqkuwdgurphopok`)

---

## 1. Tổng số Nội dung Đã Kiểm tra & Tỷ lệ Bao phủ (Sections 1 & 2)

| Nhóm nội dung | Số mục thực tế | Số mục đã kiểm toán | Tỷ lệ bao phủ | Trạng thái sau Remediation |
| :--- | :---: | :---: | :---: | :---: |
| **Module 0 Pinyin** | 21 thanh mẫu, 36 vận mẫu, 5 thanh, 4 quy tắc | Toàn bộ 66 mục âm + quy tắc | **100%** | **PASS (Đã bổ sung 12 vận mẫu & hô độc âm TTS)** |
| **Từ vựng mục tiêu HSK 1 (2025)** | 300 từ | 300 / 300 từ | **100%** | **PASS (100% có nghĩa Việt chuẩn & ví dụ đầy đủ)** |
| **Kho từ vựng mở rộng GF0025-2021** | 500 mục từ (HSK 1) + HSK 2–5 | 500 / 500 mục từ HSK 1 + quét toàn bộ HSK 2–5 | **100%** | **PASS (Đã sửa 9 mục lệch cột, 23 lỗi Pinyin, xóa watermark)** |
| **32 Bài học & 6 Checkpoints** | 38 bài × 10 chặng = 380 chặng | 380 / 380 chặng (406 lượt từ, 54 ngữ pháp, 308 bài tập) | **100%** | **PASS (Độ phủ 300/300 từ ngay trong 32 bài học)** |
| **Practice Bank (6 kỹ năng)** | 56 bộ / 381 câu & lượt thoại | 56 / 56 bộ (381 / 381 mục) | **100%** | **PASS (Đã sửa prompt template, nhiễu lặp, gợi ý ngoặc đơn)** |
| **Curriculum Mini Quizzes** | 38 đề / 308 câu | 38 / 38 đề (308 / 308 câu) | **100%** | **PASS (Khớp 100% với server grading keys)** |
| **Unit Tests (6 Units)** | 6 đề / 120 câu | 6 / 6 đề (120 / 120 câu) | **100%** | **PASS (Đã bỏ gợi ý ngoặc đơn trên 4 câu)** |
| **HSK 1 Mock Exam** | 1 đề / 40 câu | 40 / 40 câu | **100%** | **PASS (Đã xóa transcript lộ ở câu 11–20 & dịch nghĩa ở choices)** |

---

## 2. Thống kê Phân loại Lỗi (Sections 3, 4, 5, 6, 7)

| Mức độ nghiêm trọng (`Severity`) | Số nhóm lỗi phát hiện | Số nhóm đã sửa triệt để (`FIXED`) | Số nhóm hoãn chờ Migration / Giáo viên duyệt | Chi tiết tóm tắt |
| :--- | :---: | :---: | :---: | :--- |
| **CRITICAL – P0** | **2** | **2** | 0 | `ISS-8N-001` (Lộ transcript chữ Hán trong 10 câu Nghe của Mock Exam), `ISS-8N-004` (Module 0 Pinyin truyền chữ Latinh vào TTS `zh-CN` khiến máy đọc tên chữ cái tiếng Anh). |
| **HIGH – P1** | **8** | **8** | 0 | `ISS-8N-002` (Lộ dịch tiếng Việt trong `choices` của Mock Exam), `ISS-8N-003` (Câu 40 Mock Exam dùng từ HSK 3–4), `ISS-8N-005` (Module 0 thiếu 12 vận mẫu & sai mô tả âm `q`), `ISS-8N-006` (42/300 từ trên `/vocabulary` hiển thị tiếng Anh, 258 từ lẫn chuỗi PDF), `ISS-8N-007` (Phân biệt từ đa âm `只 zhī` vs `zhǐ`), `ISS-8N-008` (Watermark Zalo/TikTok trong file JSON), `ISS-8N-009` (9 mục rỗng Pinyin & 23 câu đứt âm tiết Pinyin), `ISS-8N-010` (15 từ cơ bản thiếu trong `stages[1].vocabulary` của Bài 1 & Bài 4). |
| **MEDIUM – P2** | **6** | **5** | **1** | Đã sửa `ISS-8N-011` (Lộ gợi ý `đọc bú` trên Flashcard từ `不`), `ISS-8N-012` (16 câu prompt lỗi template `"Nghe đoạn phát âm '2'"`), `ISS-8N-013` (10 câu Listening lặp nhiễu `['喜欢','朋友','中国']`), `ISS-8N-014` (15 câu chỉ có đáp án đúng mang chú thích ngoặc đơn), `ISS-8N-015` (Câu `pg09-5` dùng từ ngoài phạm vi `春风/暖和`). Hoãn `ISS-8N-016` (Lệch phân bổ vị trí đáp án `correct_index = 0` trong `private.curriculum_quiz_keys` do quy tắc không tự sửa Cloud database khi chưa có migration được duyệt). |
| **LOW – P3** | **1** | **1** | 0 | `ISS-8N-017` (66 từ bổ trợ GF0025-2021 được cộng vào bộ đếm 300 từ — đã lọc chuẩn xác trong `getLearnerCurriculumProgress()`). |
| **NEEDS HUMAN REVIEW** | **1** | 0 | **1** | `ISS-8N-018` (2 câu nghe Unit Test `ut2-q05` dùng `差` và `ut6-q06` dùng `趴` làm bối cảnh phụ cạnh từ khóa đích — giữ nguyên chờ giáo viên quyết định). |
| **TỔNG CỘNG** | **18 nhóm lỗi** | **16 nhóm (`FIXED`)** | **2 nhóm (`DEFERRED` / `NEEDS_HUMAN_REVIEW`)** | Chi tiết từng mục được lưu tại [sprint8n-issues.csv](file:///d:/nam4/prj/HanLearn/docs/content-audit/sprint8n-issues.csv). |

---

## 3. Những Kiến thức Dễ gây Hiểu nhầm & Khoảng trống Curriculum Đã Xử lý (Sections 8, 9, 10, 11, 12)

1. **Những điểm dễ gây hiểu nhầm cho người Việt đã được làm rõ:**
   - **Phát âm `j, q, x` vs `z, c, s` vs `zh, ch, sh`:** Đã sửa mô tả âm `q` từ `"si bật hơi"` thành `"chi bật hơi mạnh"` và bổ sung cảnh báo không đồng nhất hoàn toàn phụ âm tiếng Trung với phụ âm tiếng Việt.
   - **Quy tắc lược bỏ hai chấm trên `ü` sau `j, q, x, y`:** Đã bổ sung vào Module 0 để học viên không đọc nhầm `去 (qù)`, `学 (xué)`, `语 (yǔ)` thành nguyên âm `u` tròn môi sau.
   - **Biến điệu chữ `不` và `一`:** Giữ nguyên Pinyin từ điển ở từ đơn (`bù`, `yī`) kèm quy tắc biến điệu ở mặt sau Flashcard, đồng thời ghi dạng biến điệu thực tế ở các từ ghép thông dụng (`bú kèqi`, `búyào`, `yíxià`, `yìdiǎnr`).
2. **Khoảng trống trong Curriculum đã được lấp đầy:**
   - Bổ sung 15 từ cơ bản (`你, 我, 好, 很, 吗, 谢谢, 再见, 天, 一..七`) vào chặng Từ vựng trọng tâm của Bài 1 và Bài 4, nâng độ phủ trực tiếp của 32 bài học từ `285/300` lên **`300/300 (100%)`**.
   - Bổ sung đủ 12 vận mẫu có giới âm vào Module 0 (đạt đủ `36/36` vận mẫu).
3. **Độ phù hợp với nguồn HSK & Vệ sinh Bản quyền:**
   - Phân tách minh bạch giữa danh sách **300 từ mục tiêu** (MandarinBean HSK 2025) và danh sách **500 từ mở rộng** (GF0025-2021).
   - Xóa sạch toàn bộ watermark quảng cáo Zalo/TikTok bị lẫn từ tài liệu PDF tham khảo trong các file `hsk1..hsk5_vocabulary.json`.

---

## 4. Quality Scorecard – Bảng Điểm Chất lượng 12 Tiêu chí (Section 15.1)

| # | Tiêu chí đánh giá | Điểm (/10) | Số mục kiểm tra | Rubric & Bằng chứng thực tế | Giới hạn của đánh giá |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | **Vocabulary Accuracy** | **9.4 / 10** | 300 từ cốt lõi + 500 mục GF0025 | 100% chữ Hán giản thể chuẩn, không trùng lặp, phân biệt chính xác từ đa âm `只 (zhī)` và khôi phục 9 mục từ lệch cột PDF. | Danh sách 300 từ dựa trên tài liệu tổng hợp MandarinBean HSK 2025, chưa phải file nhị phân được CTI ký số. |
| 2 | **Pinyin Accuracy** | **9.3 / 10** | 300 từ + 406 từ bài học + 69 ví dụ ngữ pháp + 91 lượt thoại | Đã sửa toàn bộ 23 câu đứt khoảng trắng Pinyin (`Chànggē`, `Wǒmen`, `Duìbuqǐ`), bổ sung đủ 36 vận mẫu và quy tắc `j/q/x/y + ü`. | Một số từ có thanh nhẹ tùy chọn theo vùng miền (ví dụ `xuéshēng` vs `xuésheng`) đều được chấp nhận trong từ điển hiện đại. |
| 3 | **Translation Quality** | **9.2 / 10** | 300 nghĩa từ + 300 câu ví dụ + 32 bài học | Đã thay thế toàn bộ 42 nghĩa tiếng Anh fallback và 258 chuỗi `raw_definition` lẫn tiếng Anh bằng nghĩa tiếng Việt thuần Việt, rõ từ loại. | Bản dịch ưu tiên nghĩa sơ cấp HSK 1, lược bớt các nghĩa bóng ở cấp độ HSK cao hơn. |
| 4 | **Grammar Accuracy** | **9.4 / 10** | 54 điểm ngữ pháp / 32 bài | Công thức, điều kiện sử dụng và lưu ý lỗi sai của người Việt (`是`, `有/没`, `在`, `的`, `了`, `二/两`, `几/多少`) chính xác và nhất quán. | Chưa bao gồm toàn bộ các trường hợp ngoại lệ nâng cao ngoài phạm vi HSK 1. |
| 5 | **Example Naturalness** | **9.0 / 10** | 300 ví dụ từ vựng + 69 ví dụ ngữ pháp | Câu ví dụ ngắn gọn, đúng ngữ pháp phổ thông, gắn với giao tiếp đời sống; đã thay thế câu vượt cấp `春风来了，天气变暖和了`. | Các câu ví dụ được viết theo văn phong mẫu mực sách giáo khoa để dễ phân tích cấu trúc. |
| 6 | **Curriculum Progression** | **9.2 / 10** | Module 0 + 6 Units + 32 bài (320 chặng) | Sau khi bổ sung 15 từ cơ bản vào Bài 1 & Bài 4 và 12 vận mẫu vào Module 0, lộ trình từ số 0 đến Bài 32 hoàn toàn liền mạch, phủ 300/300 từ. | 66 từ mở rộng GF0025-2021 xuất hiện thêm ở các bài chủ đề (Unit 3–6) làm lượng từ thực tế học viên tiếp xúc là 366 từ. |
| 7 | **Practice Question Quality** | **8.9 / 10** | 56 bộ / 381 câu & lượt tương tác | Đã sửa 16 câu prompt lỗi template, 10 câu nhiễu lặp lại và 11 câu lộ chú thích ngoặc đơn. | Tỷ lệ đáp án ở vị trí index 0 trong các câu trắc nghiệm cũ vẫn còn cao, có thể trộn ngẫu nhiên thêm trên giao diện client. |
| 8 | **Listening Quality** | **8.6 / 10** | 10 bộ Listening (60 câu) + 36 câu UT + 20 câu Mock Exam | Đã xóa sạch transcript bị lộ ở Câu 11–20 của Mock Exam và thiết kế lại 10 câu `ps-listen-*-q6`. | Âm thanh sử dụng giọng đọc `zh-CN` Web Speech API trên trình duyệt của thiết bị, chất lượng phụ thuộc vào bộ giọng cài sẵn trên máy người dùng. |
| 9 | **Speaking Learning Design** | **8.7 / 10** | 8 bộ Speaking (48 lượt) + 8 bộ Dialogue (49 lượt) + Module 0 | Đã sửa lỗi lớn ở Module 0 bằng cách truyền chữ Hán hô độc âm (`呼读音`) vào TTS; giao diện trình bày trung thực là tự luyện và đối chiếu. | Chưa có chấm điểm phát âm từng âm tiết bằng AI ở giai đoạn MVP. |
| 10 | **Unit Test Quality** | **8.5 / 10** | 6 đề / 120 câu | Bám sát kiến thức từng Unit, cấu trúc 4 kỹ năng cân đối, đã bỏ 4 gợi ý ngoặc đơn. | 120/120 câu trong `private.curriculum_quiz_keys` đang có `correct_index = 0` (cần 1 migration riêng để hoán vị đồng bộ). |
| 11 | **Mock Exam Quality** | **9.1 / 10** | 1 đề / 40 câu (20 Nghe + 20 Đọc) | Sau khi xóa transcript lộ ở Câu 11–20, thay dịch nghĩa tiếng Việt trong `choices` bằng Pinyin ở Câu 16–20 & 31–39 và sửa Câu 40, đề thi mô phỏng sát thực tế HSK 1. | Sử dụng mô tả tình huống bằng chữ thay cho tranh vẽ minh họa ở các câu chọn tranh. |
| 12 | **Overall Learning Experience** | **9.1 / 10** | Toàn trình Module 0 $\rightarrow$ Mock Exam | Kết hợp tốc độ điều hướng tức thì của Sprint 8M với nội dung sạch, thuần Việt, giải thích chi tiết và không lộ đáp án của Sprint 8N. | Cần tiếp tục hoán vị vị trí đáp án A/B/C/D cho bảng `private.curriculum_quiz_keys` trong đợt cập nhật database tiếp theo. |

---

## 5. Kết quả Kiểm thử Hồi quy (Regression Testing – Section 13 & 14)

- **Vitest Test Suite:** **54 / 54 test files PASS (494 / 494 tests PASS, 100%)**, bao gồm bộ kiểm thử mới [tests/sprint8n-content-quality-audit.test.ts](file:///d:/nam4/prj/HanLearn/tests/sprint8n-content-quality-audit.test.ts).
- **TypeScript (`npm run typecheck`):** `0` lỗi.
- **ESLint (`npx eslint src/`):** `0` lỗi.
- **Next.js Production Build (`npm run build`):** Biên dịch thành công 100%.

---

## 6. Đề xuất Công việc Tiếp theo (Next Steps – Section 15)

1. **Phê duyệt Migration hoán vị vị trí đáp án (`ISS-8N-016`):** Chạy script hoán vị có hạt giống cố định (seeded permutation) để phân bổ đều `correct_index` (25% A, 25% B, 25% C, 25% D) đồng thời trên cả `hsk1_unit_test_01..06.json`, `curriculum-quizzes*.ts` và bảng `private.curriculum_quiz_keys` trên Supabase Cloud.
2. **Xem xét 2 câu nghe Unit Test (`ISS-8N-018`):** Giáo viên quyết định giữ nguyên hay đơn giản hóa từ `差` trong `ut2-q05` và `趴` trong `ut6-q06`.
3. **Phê duyệt Push lên nhánh Vercel Preview:** Sau khi xem xét báo cáo Sprint 8N và commit local, phê duyệt push lên `origin/preview/hsk1-full-curriculum`.
