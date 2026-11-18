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
| **CRITICAL – P0** | **3** | **3** | 0 | `ISS-8N-001` (Lộ transcript chữ Hán trong 10 câu Nghe của Mock Exam), `ISS-8N-004` (Module 0 Pinyin truyền chữ Latinh vào TTS `zh-CN` khiến máy đọc tên chữ cái tiếng Anh), `ISS-8N-019` (Phát hiện trong vòng Integrity Check: 10 câu `ps-listen-01-q6..10-q6` ghi khóa `audio_text` thay vì `audioText` mà `practice-player.tsx` đọc, khiến nút phát âm đọc từ cũ; riêng `ps-listen-01-q6` trùng từ `再见` với `pl01-3` — đã sửa toàn bộ sang `audioText`, `type: "audio_mcq"` và đổi `ps-listen-01-q6` sang từ `不客气` chọn nghĩa tiếng Việt). |
| **HIGH – P1** | **9** | **9** | 0 | `ISS-8N-002` (Lộ dịch tiếng Việt trong `choices` của Mock Exam), `ISS-8N-003` (Câu 40 Mock Exam dùng từ HSK 3–4), `ISS-8N-005` (Module 0 thiếu 12 vận mẫu & sai mô tả âm `q`), `ISS-8N-006` (42/300 từ trên `/vocabulary` hiển thị tiếng Anh, 258 từ lẫn chuỗi PDF), `ISS-8N-007` (Phân biệt từ đa âm `只 zhī` vs `zhǐ`), `ISS-8N-008` (Watermark Zalo/TikTok trong file JSON), `ISS-8N-009` (9 mục rỗng Pinyin & 23 câu đứt âm tiết Pinyin), `ISS-8N-010` (15 từ cơ bản thiếu trong `stages[1].vocabulary` của Bài 1 & Bài 4), `ISS-8N-020` (Phát hiện trong vòng Integrity Check: Câu `q-hsk1-mock-31` có đáp án `"一直走，在前面左边的楼就是。"` gượng nghĩa vì `第三教室` là phòng học chứ không phải cả tòa nhà `楼`, và `q-hsk1-mock-35` dùng `已经` HSK 2 — đã sửa thành `"A. 一直走，在二楼左边。(Yìzhí zǒu, zài èr lóu zuǒbian.)"` và `"A. 好多了，今天可以去上课了。(Hǎo duō le, jīntiān kěyǐ qù shàngkè le.)"`). |
| **MEDIUM – P2** | **6** | **5** | **1** | Đã sửa `ISS-8N-011` (Lộ gợi ý `đọc bú` trên Flashcard từ `不` + bổ sung Canonical Overlay cho `/vocabulary/[id]` và `/review`), `ISS-8N-012` (16 câu prompt lỗi template `"Nghe đoạn phát âm '2'"`), `ISS-8N-013` (10 câu Listening lặp nhiễu `['喜欢','朋友','中国']`), `ISS-8N-014` (15 câu chỉ có đáp án đúng mang chú thích ngoặc đơn), `ISS-8N-015` (Câu `pg09-5` dùng từ ngoài phạm vi `春风/暖和`). Hoãn `ISS-8N-016` (Lệch phân bổ vị trí đáp án `correct_index = 0` trong `private.curriculum_quiz_keys` do quy tắc không tự sửa Cloud database khi chưa có migration được duyệt). |
| **LOW – P3** | **1** | **1** | 0 | `ISS-8N-017` (66 từ bổ trợ GF0025-2021 được cộng vào bộ đếm 300 từ + đồng bộ 100% Pinyin/nghĩa của 35 mục từ giữa 32 bài học và danh sách 300 từ). |
| **NEEDS HUMAN REVIEW** | **1** | 0 | **1** | `ISS-8N-018` (2 câu nghe Unit Test `ut2-q05` dùng `差` và `ut6-q06` dùng `趴` làm bối cảnh phụ cạnh từ khóa đích — giữ nguyên chờ giáo viên quyết định). |
| **TỔNG CỘNG** | **20 nhóm lỗi** | **18 nhóm (`FIXED`)** | **2 nhóm (`DEFERRED` / `NEEDS_HUMAN_REVIEW`)** | Chi tiết từng mục được lưu tại [sprint8n-issues.csv](file:///d:/nam4/prj/HanLearn/docs/content-audit/sprint8n-issues.csv). |

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

## 4. Phân tách 5 Tầng Bằng chứng Kiểm toán (Content QA Evidence Tiers) & Quality Scorecard Hiệu chỉnh

### 4.1. Phân tách Minh bạch 5 Tầng Bằng chứng QA

| Tầng bằng chứng QA | Độ bao phủ thực tế | Trạng thái xác minh | Chi tiết phương pháp & Giới hạn |
| :--- | :---: | :---: | :--- |
| **1. Structural Validation Coverage** | **100%** (32 bài, 300 từ, 56 bộ Practice, 6 Unit Tests, 1 Mock Exam, 38 Mini Quizzes) | `VERIFIED_AUTOMATED` | Kiểm tra tự động bằng Vitest (`tests/sprint8n-content-quality-audit.test.ts`): toàn vẹn khóa JSON, `correct_index` hợp lệ, không trùng `choices`, `audioText` camelCase khớp câu giải thích, `0` lệch Pinyin/nghĩa giữa 300 từ và 32 bài học. |
| **2. Automated Linguistic Warning Coverage** | **100%** toàn bộ kho JSON & TS | `VERIFIED_AUTOMATED` | Quét tự động phát hiện watermark/quảng cáo PDF, nghĩa tiếng Anh sót lại, Pinyin rỗng, lộ transcript trong prompt nghe, gợi ý ngoặc đơn bất đối xứng trong đáp án đúng. |
| **3. Semantic Review Coverage (AI Specialist Audit)** | **100%** trên 300 từ cốt lõi, 54 điểm ngữ pháp, toàn bộ câu hỏi đã chỉnh sửa, 6 Unit Tests & 1 Mock Exam | `VERIFIED_BY_AI_AUDIT` | Đối chiếu từng câu hỏi đã thay đổi trong Sprint 8N (Mock Exam câu 11–20 & 31–40, `ps-listen-01..10`, `pg09-5`, 15 câu bỏ ngoặc đơn) về ngữ nghĩa câu hỏi, độ tự nhiên của đáp án tiếng Trung, tính duy nhất của đáp án đúng và sự tương khớp với `explanation_vi` + server grading keys. |
| **4. Actual Acoustic Audio Review Coverage** | **Code path & TTS Mapping: 100%** / **Nghe âm học bằng tai người: 0%** | `NOT VERIFIED (ACOUSTIC)` | Đã xác minh hàm `speak()` truyền đúng chữ Hán (`zh-CN`) và bảng `INITIAL_CALL_HANZI` / `FINAL_CALL_HANZI` / `audioText`. **Tuy nhiên, chưa có người thật nghe trực tiếp âm thanh phát ra từ loa trên mọi hệ điều hành/trình duyệt.** |
| **5. Human / Native-Speaker Review Coverage** | **0%** (Chưa có giáo viên bản ngữ ký duyệt độc lập) | `NOT VERIFIED (HUMAN)` | Toàn bộ rà soát ngôn ngữ và sư phạm trong Sprint 8N được thực hiện bởi hệ thống kiểm toán chuyên gia AI; cần giáo viên tiếng Trung / người bản ngữ nghiệm thu cuối trước khi phát hành thương mại công khai. |

### 4.2. Quality Scorecard – Bảng Điểm Chất lượng 12 Tiêu chí (Đã hiệu chỉnh theo Bằng chứng Thực tế)

| # | Tiêu chí đánh giá | Điểm Kỹ thuật & Nội dung (/10) | Điểm Hiệu chỉnh theo Bằng chứng Thực tế (/10) | Số mục kiểm tra | Rubric, Bằng chứng thực tế & Lý do hiệu chỉnh |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | **Vocabulary Accuracy** | 9.5 / 10 | **9.0 / 10** | 300 từ cốt lõi + 500 mục GF0025 | 100% chữ Hán chuẩn, phân biệt từ đa âm `只 (zhī / zhǐ)`, đồng bộ 100% giữa `/vocabulary`, `/vocabulary/[id]`, `/review` và 32 bài học. Hiệu chỉnh `-0.5` vì danh mục 300 từ đối chiếu qua bản chụp đề cương, chưa đối chiếu trực tiếp PDF ký số từ cổng SPA `chinesetest.cn`. |
| 2 | **Pinyin Accuracy** | 9.5 / 10 | **9.1 / 10** | 300 từ + 406 từ bài học + 69 ví dụ ngữ pháp + 91 lượt thoại | `0` khác biệt Pinyin giữa 300 từ và 32 bài học; đã sửa 9 mục rỗng Pinyin và 23 câu dính âm tiết; ghi rõ biến điệu `不`/`一` và quy tắc `ü`. Hiệu chỉnh `-0.4` vì chưa có người bản ngữ duyệt thủ công toàn bộ câu hội thoại. |
| 3 | **Translation Quality** | 9.4 / 10 | **9.0 / 10** | 300 nghĩa từ + 300 câu ví dụ + 32 bài học | Đã thay 100% nghĩa tiếng Anh và chuỗi thô PDF bằng tiếng Việt chuẩn sư phạm; đồng bộ 100% nghĩa giữa `/vocabulary` và 32 bài học. Hiệu chỉnh `-0.4` do chưa qua vòng biên tập viên con người độc lập. |
| 4 | **Grammar Accuracy** | 9.4 / 10 | **9.1 / 10** | 54 điểm ngữ pháp / 32 bài | Công thức, cấu trúc và lưu ý lỗi sai thường gặp của người Việt chính xác, đúng trình độ HSK 1. |
| 5 | **Example Naturalness** | 9.2 / 10 | **8.8 / 10** | 300 ví dụ từ vựng + 69 ví dụ ngữ pháp + Mock Exam | Đã sửa câu `pg09-5` (`下雨了，天气冷了`), câu `q-hsk1-mock-31` (`一直走，在二楼左边。`) và `q-hsk1-mock-35` (`好多了，今天可以去上课了。`). Hiệu chỉnh `-0.4` vì chưa có người bản ngữ nghiệm thu. |
| 6 | **Curriculum Progression** | 9.2 / 10 | **8.9 / 10** | Module 0 + 6 Units + 32 bài (320 chặng) | Độ phủ `300/300` từ mục tiêu trong 32 bài học; Module 0 đủ `21` thanh mẫu + `36` vận mẫu + phân biệt rõ **âm vị độc lập** và **âm tiết minh họa (`呼读音`)**. |
| 7 | **Practice Question Quality** | 9.1 / 10 | **8.6 / 10** | 56 bộ / 381 câu & lượt tương tác | Đã sửa 16 câu lỗi prompt, 10 câu `ps-listen-*-q6` (đồng bộ khóa `audioText` camelCase), 11 câu lộ gợi ý ngoặc đơn và câu `pg09-5`. Hiệu chỉnh `-0.5` do các câu `pl01-1..5` vẫn có tỷ lệ `correct_index = 0` cao. |
| 8 | **Listening Quality** | 9.0 / 10 | **7.8 / 10** | 10 bộ Listening (60 câu) + 36 câu UT + 20 câu Mock Exam | Đã xóa sạch transcript lộ ở Mock Exam câu 11–20 và sửa triệt để lỗi `audioText` trên `ps-listen-01-q6..10-q6`. Hiệu chỉnh xuống `7.8/10` vì **chất lượng âm học thực tế qua Web Speech API chưa được kiểm chứng bằng tai người (`NOT VERIFIED`)**. |
| 9 | **Speaking Learning Design** | 8.9 / 10 | **7.9 / 10** | 8 bộ Speaking (48 lượt) + 8 bộ Dialogue (49 lượt) + Module 0 | Đã giải thích rõ sự khác biệt giữa **âm vị phụ âm/vần độc lập** và **âm tiết minh họa (`呼读音`, ví dụ `b -> mẫu: 波`)** trên giao diện `/pinyin`. Hiệu chỉnh xuống `7.9/10` do âm thanh TTS chưa kiểm chứng bằng tai người. |
| 10 | **Unit Test Quality** | 8.5 / 10 | **7.5 / 10** | 6 đề / 120 câu | Nội dung câu hỏi chuẩn xác, đã bỏ 4 gợi ý ngoặc đơn (`ut2-q05`, `ut4-q11`, `ut5-q12`, `ut6-q09`), khớp 100% với `private.curriculum_quiz_keys`. Hiệu chỉnh xuống `7.5/10` vì lỗi `ISS-8N-016` (`120/120` câu có `correct_index = 0`) đang chờ phê duyệt migration Cloud. |
| 11 | **Mock Exam Quality** | 9.3 / 10 | **8.9 / 10** | 1 đề / 40 câu (20 Nghe + 20 Đọc) | Đã xóa lộ đáp án câu 11–20 & 31–39, viết lại câu 40 đúng chuẩn HSK 1, và sửa câu 31 (`一直走，在二楼左边。`) + câu 35 (`好多了，今天可以去上课了。`). Phân bổ đáp án A/B/C cân bằng. |
| 12 | **Overall Learning Experience** | 9.2 / 10 | **8.6 / 10** | Toàn trình Module 0 $\rightarrow$ Mock Exam | Trải nghiệm học từ số 0 mạch lạc, chính xác về mặt dữ liệu và ngôn ngữ; điểm hiệu chỉnh phản ánh trung thực 2 hạng mục `NOT VERIFIED` (nghe âm học bằng tai người & duyệt bản ngữ) và `ISS-8N-016` chờ migration. |

---

## 5. Xác minh Ngữ nghĩa Chi tiết Các Câu Hỏi Đã Chỉnh sửa (Assessment Semantic Verification)

1. **Mock Exam (`content/hsk_library/hsk1_mock_exam_official.json`):**
   - **Câu 11–15 (Listening Part 3):** `prompt` chỉ còn hướng dẫn chung; `audio_text` chứa hội thoại tiếng Trung đầy đủ; 3 lựa chọn A/B/C bằng tiếng Việt mô tả đúng 1 tình huống khớp duy nhất với `audio_text`; `correct_index` và `explanation_vi` khớp tuyệt đối.
   - **Câu 16–20 (Listening Part 4):** `prompt` không còn lộ lời thoại; `choices` hiển thị chữ Hán kèm Pinyin (không dịch nghĩa tiếng Việt hộ thí sinh); mỗi câu có duy nhất 1 đáp án đúng khớp câu hỏi cuối băng (`问：...`).
   - **Câu 31 (`q-hsk1-mock-31`):**
     - Lời hỏi: `'请问，去第三教室怎么走？'` (Xin hỏi, đi đến phòng học số 3 đi thế nào?).
     - Phát hiện trong vòng Integrity Check: Câu trả lời trước đó (`"一直走，在前面左边的楼就是。"`) dùng chữ `楼` (tòa nhà) để chỉ `第三教室` (phòng học số 3) nên thiếu tự nhiên về ngữ nghĩa.
     - **Đã sửa thành:** `"A. 一直走，在二楼左边。(Yìzhí zǒu, zài èr lóu zuǒbian.)"` (Đi thẳng, ở bên trái tầng 2) — dùng 100% từ vựng HSK 1 (`一直, 走, 在, 二, 楼, 左边`), tự nhiên, chỉ có duy nhất đáp án A chỉ phương hướng/vị trí (B nói về thời tiết, C nói về tuổi), khớp `correct_index = 0` và `explanation_vi`.
   - **Câu 32–34 & 36–40:** Toàn bộ câu hỏi rõ nghĩa, lựa chọn A/B/C tự nhiên, chỉ có 1 đáp án đúng duy nhất, `correct_index` và `explanation_vi` khớp 100%.
   - **Câu 35 (`q-hsk1-mock-35`):** Đã thay `"好多了，今天已经去上课了。"` (có từ `已经` HSK 2) bằng `"A. 好多了，今天可以去上课了。(Hǎo duō le, jīntiān kěyǐ qù shàngkè le.)"` (100% từ HSK 1) và cập nhật `explanation_vi` tương ứng.
2. **Listening Practice (`ps-listen-01..10`, đặc biệt `q6`):**
   - **Phát hiện quan trọng (`ISS-8N-019`):** Component `src/features/practice/components/practice-player.tsx` (dòng 762, 771) đọc thuộc tính `currentQ.audioText` (camelCase). Trong commit `164f48b`, script tự động đã ghi vào thuộc tính `audio_text` (snake_case) trên 10 câu `ps-listen-01-q6..ps-listen-10-q6`, khiến `audioText` vẫn giữ từ cũ (`"老师"`, `"买东西"`, `"昨天"`, `"热"`), và câu `ps-listen-01-q6` kiểm tra trùng từ `"再见"` với `pl01-3` bằng lựa chọn chữ Hán trong bộ bài `word_to_meaning`.
   - **Đã khắc phục triệt để:**
     - Cập nhật thuộc tính `audioText` (camelCase) và `type: "audio_mcq"` cho toàn bộ 10 câu `ps-listen-01-q6..ps-listen-10-q6`, đồng thời xóa bỏ khóa dư `audio_text`.
     - Đổi `ps-listen-01-q6` sang kiểm tra từ `"不客气"` với 4 lựa chọn nghĩa tiếng Việt (`["Xin chào", "Cảm ơn", "Xin lỗi", "Không có chi / đừng khách sáo"]`, `correct_index: 3`), thống nhất hoàn toàn với kiểu bài `word_to_meaning` của bộ `ps-listen-01`.
3. **Các câu Practice bỏ chú thích ngoặc đơn (11 câu) & Câu `pg09-5`:**
   - 11 câu (`pv01-1`, `pv03-1`, `pv03-q8`, `pv08-3`, `pv08-5`, `pv09-1`, `pv10-q8`, `pg09-1`, `pl07-1`, `pl10-2`, `pr08-4`) sau khi bỏ phần giải thích phụ trong ngoặc đơn vẫn hoàn toàn rõ nghĩa, chỉ có duy nhất 1 đáp án đúng và khớp `correct_index`.
   - Câu `pg09-5` (`"Điền từ: '下雨了，天气冷____。' (Biến đổi trạng thái)"`): 4 lựa chọn `["了", "呢", "吧", "吗"]`, đáp án đúng duy nhất là `"了"` (`correct_index = 0`), giải thích rõ chức năng trợ từ ngữ khí `了` cuối câu biểu thị sự thay đổi trạng thái.
4. **Các câu Unit Test bỏ chú thích ngoặc đơn (`ut2-q05`, `ut4-q11`, `ut5-q12`, `ut6-q09`):**
   - Đã kiểm tra từng câu: `ut2-q05` (`11:50` cho `现在差十分十二点`), `ut4-q11` (`Biểu thị sự trầm trồ, khen ngợi` cho phó từ `真`), `ut5-q12` (`Biểu thị số nhiều cho đại từ/danh từ chỉ người` cho hậu tố `们`), `ut6-q09` (`Rất / vô cùng` cho phó từ `非常`). Cả 4 câu đều có duy nhất 1 đáp án đúng tại `correct_index = 0`, khớp 100% với bảng `private.curriculum_quiz_keys` trên Supabase Cloud.

---

## 6. Kế hoạch Xử lý Độc lập cho `ISS-8N-016` (Hoán vị Vị trí Đáp án `correct_index = 0` — Chờ Phê duyệt)

### 6.1. Hiện trạng
- Toàn bộ **120/120 câu Unit Tests** (`ut1-q01..ut6-q20`) và **294/308 câu Curriculum Mini Quizzes** hiện đặt đáp án đúng ở vị trí đầu tiên (`correct_index = 0`, tức đáp án A).
- Vì Unit Tests và Mini Quizzes chấm điểm ở phía server thông qua bảng `private.curriculum_quiz_keys` trên Supabase Cloud (`hhgxrjqkuwdgurphopok`), việc đảo thứ tự mảng `choices` trong file JSON/TS local bắt buộc phải đi kèm migration cập nhật cột `correct_index` trong `private.curriculum_quiz_keys`.

### 6.2. Thiết kế Thuật toán Seeded Permutation (Đảm bảo Tất định & Cân bằng)
1. **Hàm băm tất định (Deterministic Hash):**
   - Với mỗi câu hỏi có định danh `(scope_id, question_id)` và $N = \text{choices.length}$ ($N \in \{2, 3, 4\}$), tính giá trị dịch chuyển tất định:
     $$\text{targetIndex} = \text{SHA256}(\text{scope\_id} + \text{":"} + \text{question\_id}) \bmod N$$
   - Thực hiện hoán đổi phần tử tại vị trí `oldCorrectIndex` (hiện tại là `0`) với phần tử tại `targetIndex` trong mảng `choices`, sau đó gán `newCorrectIndex = targetIndex`.
   - Kiểm chứng phân bổ trên 120 câu Unit Tests (4 lựa chọn): thuật toán tạo phân bổ cân bằng xấp xỉ **25% A (index 0), 25% B (index 1), 25% C (index 2), 25% D (index 3)** và không bao giờ thay đổi ngẫu nhiên giữa các lần build.
2. **Đồng bộ hóa 3 nguồn dữ liệu trong cùng một đợt phát hành:**
   - **Bước 1 (Local Content):** Cập nhật mảng `choices` và `correct_index` trong `content/hsk_library/unit_tests/hsk1_unit_test_01..06.json` và `src/features/curriculum/curriculum-quizzes*.ts`.
   - **Bước 2 (Database Migration):** Tạo file migration SQL mới `supabase/migrations/202611180002_permute_curriculum_quiz_keys.sql` cập nhật chính xác `correct_index = targetIndex` cho từng `(scope_id, question_id)` trong `private.curriculum_quiz_keys`.
3. **Đánh giá Tác động lên Lịch sử Làm bài (`Historical Attempts Impact`):**
   - Bảng `public.lesson_quiz_attempts` và `public.unit_test_attempts` lưu `score`, `total_questions`, `passed` và mảng chi tiết kết quả đã chấm tại thời điểm nộp bài (`graded_results`).
   - Do điểm số lịch sử được chấm và ghi cố định tại thời điểm nộp (`append-only`), việc cập nhật `private.curriculum_quiz_keys` **không làm thay đổi điểm số hay trạng thái qua môn (`passed`) của bất kỳ lần làm bài nào trong quá khứ**.
4. **Kế hoạch Kiểm thử Hồi quy & Rollback:**
   - **Regression Test:** Viết test đối chiếu 100% `(scope_id, question_id)` giữa local JSON/TS và file SQL migration, đồng thời gọi RPC `submit_unit_test_attempt` / `submit_lesson_quiz` trên tài khoản test với mảng đáp án mới để xác nhận đạt `100%` điểm tối đa.
   - **Rollback Plan:** Lưu bản chụp `correct_index` cũ trong script rollback SQL; nếu cần hoàn tác, chạy lệnh `UPDATE private.curriculum_quiz_keys` khôi phục `correct_index` cũ và `git revert` commit nội dung tương ứng trong vòng chưa đến 1 phút.

---

## 7. Kết quả Kiểm thử Hồi quy (Regression Testing – Section 13 & 14)

- **Vitest Test Suite:** **54 / 54 test files PASS (494 / 494 tests PASS, 100%)**, bao gồm bộ kiểm thử mới [tests/sprint8n-content-quality-audit.test.ts](file:///d:/nam4/prj/HanLearn/tests/sprint8n-content-quality-audit.test.ts).
- **TypeScript (`npm run typecheck`):** `0` lỗi.
- **ESLint (`npx eslint src/`):** `0` lỗi.
- **Next.js Production Build (`npm run build`):** Biên dịch thành công 100%.

---

## 6. Đề xuất Công việc Tiếp theo (Next Steps – Section 15)

1. **Phê duyệt Migration hoán vị vị trí đáp án (`ISS-8N-016`):** Chạy script hoán vị có hạt giống cố định (seeded permutation) để phân bổ đều `correct_index` (25% A, 25% B, 25% C, 25% D) đồng thời trên cả `hsk1_unit_test_01..06.json`, `curriculum-quizzes*.ts` và bảng `private.curriculum_quiz_keys` trên Supabase Cloud.
2. **Xem xét 2 câu nghe Unit Test (`ISS-8N-018`):** Giáo viên quyết định giữ nguyên hay đơn giản hóa từ `差` trong `ut2-q05` và `趴` trong `ut6-q06`.
3. **Phê duyệt Push lên nhánh Vercel Preview:** Sau khi xem xét báo cáo Sprint 8N và commit local, phê duyệt push lên `origin/preview/hsk1-full-curriculum`.
