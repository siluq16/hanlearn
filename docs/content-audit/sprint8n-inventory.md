# HanLearn Sprint 8N – Content Inventory & Structural Verification

**Ngày kiểm kê:** 2026-11-17  
**Nhánh Git:** `preview/hsk1-full-curriculum`  
**Môi trường cơ sở dữ liệu đối chiếu:** Supabase Cloud Development (`hhgxrjqkuwdgurphopok`)

---

## 1. Tổng quan Kiểm kê Toàn Hệ thống (Collection Summary)

| Collection / Thực thể | Số lượng dự kiến | Số lượng thực tế (Trước Remediation) | Số lượng thực tế (Sau Remediation) | File nguồn / Bảng dữ liệu chính | Revision / Version | Tình trạng & Ghi chú bất thường |
| :--- | :---: | :---: | :---: | :--- | :---: | :--- |
| **Module 0: Pinyin Foundation** | 1 module (21 thanh mẫu, 36 vận mẫu, 4+1 thanh điệu, quy tắc biến điệu) | 1 module (21 thanh mẫu, **24** vận mẫu, 5 thanh, 3 quy tắc) | 1 module (**21** thanh mẫu, **36** vận mẫu, **5** thanh, **4** quy tắc) | `content/hsk_library/module0_pinyin.json`, `src/app/(app)/pinyin/page.tsx` | `v1.1` | Trước khi sửa thiếu 12 vận mẫu có giới âm (`ia, iao...`) và gọi TTS bằng chữ cái Latinh thay vì chữ Hán hô độc âm (`呼读音`). Đã khắc phục. |
| **HSK 1 Target Vocabulary (2025 Core)** | 300 từ duy nhất | 300 từ (258 có nghĩa Việt lẫn tiếng Anh, **42 từ bị fallback tiếng Anh**, 38 từ thiếu ví dụ) | **300 từ** (100% có `meaning_vi` thuần Việt, `example_zh`, `example_pinyin`, `example_vi`) | `content/hsk_library/hsk1_exam_2025_official_300.json`, `src/features/vocabulary/hsk1-library-vocab.ts` | `HSK_2025` | ID sinh định danh ổn định qua MD5 UUID (`hsk1_word_<hanzi>`). Đã bổ sung đủ 300/300 nghĩa Việt và câu ví dụ. |
| **HSK 1 Extended Catalog (GF0025-2021)** | 500 mục từ (496 chữ Hán duy nhất) | 500 mục từ (9 mục bị rỗng `pinyin` do lệch cột PDF, 23 câu đứt khoảng trắng Pinyin, 2 mục dính watermark Zalo/TikTok) | **500 mục từ** (100% có đủ `pinyin`, `raw_definition`, sạch watermark và chuẩn hóa khoảng trắng) | `content/hsk_library/hsk1_vocabulary.json` | `GF0025_2021` | Bao gồm 4 từ đa âm lặp 2 dòng (`地`, `干`, `还`, `有`). |
| **Units (Đơn vị bài học HSK 1)** | 6 Units | 6 Units (`u-hsk1-01` .. `u-hsk1-06`) | **6 Units** (`u-hsk1-01` .. `u-hsk1-06`) | `src/features/courses/constants.ts`, `src/features/curriculum/unified-metadata.ts` | `1.0` | Phân bổ chuẩn: Unit 1 (Bài 1–4), Unit 2 (Bài 5–8), Unit 3 (Bài 9–14), Unit 4 (Bài 15–20), Unit 5 (Bài 21–25), Unit 6 (Bài 26–32). |
| **Core Lessons (Bài học chính khóa)** | 32 bài học | 32 bài học (`hsk1-lesson-01` .. `hsk1-lesson-32`) | **32 bài học** (`hsk1-lesson-01` .. `hsk1-lesson-32`) | `content/hsk_library/hsk1_lesson_01.json` .. `32.json` | `1.0` | Trước khi sửa có 15 từ cơ bản (`你, 我, 好, 很, 吗, 谢谢, 再见, 天, 一..七`) chỉ nằm ở `warmup_words` mà thiếu trong `stages[1].vocabulary` (độ phủ 285/300). Sau khi bổ sung vào Bài 1 & Bài 4 đạt **300/300 (100%)**. |
| **Unit Checkpoints (Bài tổng kết Unit)** | 6 bài Checkpoint | 6 bài (`hsk1-checkpoint-01` .. `06`) | **6 bài** (`hsk1-checkpoint-01` .. `06`) | `content/hsk_library/hsk1_checkpoint_01.json` .. `06.json` | `1.0` | Đầy đủ 10 chặng mỗi bài (60 chặng tổng cộng). |
| **Lesson Stages (Chặng học mỗi bài)** | 320 chặng (32 bài × 10 chặng) | 320 chặng bài học + 60 chặng checkpoint = 380 chặng | **320 chặng bài học** + 60 chặng checkpoint | `src/features/content-library/curriculum-data.ts` | `1.0` | Đúng 10 chặng/bài từ index `0` đến `9`. |
| **Lesson Stage Vocabulary Entries** | ~300–400 lượt từ | 391 lượt từ (351 từ duy nhất: 285 từ thuộc danh sách 300 + 66 từ mở rộng GF0025) | **406 lượt từ** (366 từ duy nhất: **300/300** từ thuộc danh sách 300 + 66 từ mở rộng GF0025) | `hsk1_lesson_01.json` .. `32.json` (`stages[1].vocabulary`) | `1.0` | Đã đảm bảo 100% (300/300) từ mục tiêu xuất hiện trong chặng Từ vựng trọng tâm. |
| **Grammar Points & Examples** | 50–60 điểm ngữ pháp | 54 điểm ngữ pháp, 69 câu ví dụ ngữ pháp | **54 điểm ngữ pháp**, **69 câu ví dụ** | `hsk1_lesson_01.json` .. `32.json` (`stages[3].grammar_points`) | `1.0` | Tất cả đều có `id`, `titleVi`, `pattern`, `explanationVi` và `examples` (Hanzi, Pinyin, dịch Việt). |
| **Dialogues & Dialogue Turns** | 32 bài hội thoại | 32 hội thoại bài học (91 lượt thoại) + 8 bộ hội thoại Practice (49 lượt thoại) | **32 hội thoại bài học (91 lượt thoại)** + **8 bộ Practice (49 lượt thoại)** | `hsk1_lesson_*.json` (`stages[5].dialogue`), `practice_bank.json` | `1.0` | Đầy đủ `speaker`, `hanzi`, `pinyin`, `translationVi`/`vi`. |
| **Reading Passages** | 32 đoạn văn bài học + 8 đoạn văn Practice | 32 đoạn văn bài học + 8 đoạn văn Practice | **32 đoạn văn bài học** + **8 đoạn văn Practice** | `hsk1_lesson_*.json` (`stages[7].passage`), `practice_bank.json` | `1.0` | Có tiêu đề, văn bản chữ Hán và bản dịch tiếng Việt. |
| **In-Lesson Interactive Exercises** | ~300 câu | 308 câu bài tập tương tác trong chặng 2, 4, 5, 6, 7 | **308 câu bài tập tương tác** | `hsk1_lesson_01.json` .. `32.json` (`stages[*].exercises`) | `1.0` | Không có lựa chọn trùng lặp, đáp án hợp lệ 100%. |
| **Curriculum Mini Quizzes (Chặng 9)** | 38 đề (32 bài + 6 checkpoint) | 38 đề (308 câu hỏi trắc nghiệm) | **38 đề (308 câu hỏi)** | `src/features/quizzes/curriculum-quizzes*.ts`, `202611150009_curriculum_quiz_server_grading.sql` | `rev 1` | Chấm điểm server-side qua `private.curriculum_quiz_keys`. Phát hiện 294/308 câu có `correct_index = 0` (đã ghi nhận để cập nhật qua migration riêng). |
| **Practice Bank Sets** | 56 sets (12 Vocab, 10 Grammar, 10 Listening, 8 Speaking, 8 Reading, 8 Dialogue) | 56 sets | **56 sets** | `content/hsk_library/practice_bank.json` | `2.0` | Khớp chính xác phân bổ: Vocabulary (12), Grammar (10), Listening (10), Speaking (8), Reading (8), Dialogue (8). |
| **Practice Bank Questions / Turns** | 381 câu hỏi / lượt tương tác | 381 mục (332 `questions` + 49 `turns` hội thoại) | **381 mục** (332 `questions` + 49 `turns` hội thoại) | `content/hsk_library/practice_bank.json` | `2.0` | Đã sửa 16 câu prompt lỗi template, 10 câu nhiễu lặp lại, 11 câu lộ gợi ý ngoặc đơn và 1 câu ngoài phạm vi từ vựng. |
| **Unit Tests** | 6 đề (20 câu/đề = 120 câu) | 6 đề (`ut-hsk1-01` .. `06`, 120 câu) | **6 đề** (`ut-hsk1-01` .. `06`, **120 câu**) | `content/hsk_library/unit_tests/hsk1_unit_test_01.json` .. `06.json` | `1.0` | Mỗi đề gồm: Listening (6), Vocabulary (4), Grammar (4), Reading (6). Thời gian 20 phút, đạt 16/20 (80%). |
| **HSK 1 Mock Exam** | 1 đề (40 câu: 20 Nghe + 20 Đọc) | 1 đề (`exam-hsk1-official-mock`, 40 câu) | **1 đề** (`exam-hsk1-official-mock`, **40 câu**) | `content/hsk_library/hsk1_mock_exam_official.json` | `1.0` | Đã khắc phục lỗi lộ transcript trong `prompt` của Câu 11–20, lộ dịch nghĩa tiếng Việt trong `choices` của Câu 16–20 & 31–39, và thay thế đoạn văn HSK 3/4 ở Câu 40. |

---

## 2. Chi tiết Kiểm kê 32 Bài học & Mapping 6 Units

| Unit | Lesson ID | Slug | Tiêu đề bài học | Số chặng | Số từ vựng (`1_vocab_core`) | Số điểm ngữ pháp | Số câu bài tập chặng | Quiz ID |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Unit 1** | `l-hsk1-01` | `hsk1-lesson-01` | Bài 1: Chào hỏi & Tự giới thiệu (自我介绍) | 10 | 19 (đã bổ sung 7 từ gốc) | 3 | 6 | `11111111-1111-4111-8111-000000000101` |
| **Unit 1** | `l-hsk1-02` | `hsk1-lesson-02` | Bài 2: Tôi tên là... (我叫…… — Giới thiệu bản thân) | 10 | 12 | 3 | 6 | `11111111-1111-4111-8111-000000000102` |
| **Unit 1** | `l-hsk1-03` | `hsk1-lesson-03` | Bài 3: Gia đình của tôi (我的家 — Gia đình & Thành viên) | 10 | 15 | 3 | 6 | `11111111-1111-4111-8111-000000000103` |
| **Unit 1** | `l-hsk1-04` | `hsk1-lesson-04` | Bài 4: Hôm nay thứ mấy? (今天星期几？ — Ngày tháng & Thời gian) | 10 | 22 (đã bổ sung 8 từ số/ngày) | 3 | 6 | `11111111-1111-4111-8111-000000000104` |
| **Unit 2** | `l-hsk1-05` | `hsk1-lesson-05` | Bài 5: Gia đình & Nghề nghiệp của tôi (我的家与职业) | 10 | 8 | 2 | 4 | `55555555-5555-4555-8555-000000000005` |
| **Unit 2** | `l-hsk1-06` | `hsk1-lesson-06` | Bài 6: Bây giờ là mấy giờ? (现在几点？) | 10 | 8 | 2 | 4 | `55555555-5555-4555-8555-000000000006` |
| **Unit 2** | `l-hsk1-07` | `hsk1-lesson-07` | Bài 7: Mua sắm & Giá cả (买东西与多少钱) | 10 | 10 | 2 | 5 | `55555555-5555-4555-8555-000000000007` |
| **Unit 2** | `l-hsk1-08` | `hsk1-lesson-08` | Bài 8: Ăn uống & Gọi món (吃饭与喝水) | 10 | 9 | 2 | 5 | `55555555-5555-4555-8555-000000000008` |
| **Unit 3** | `l-hsk1-09`..`14` | `hsk1-lesson-09`..`14` | Bài 9 – Bài 14 (Vị trí, Đi lại, Thời tiết, Trường lớp) | 6 × 10 | 69 | 10 | 58 | `55555555-5555-4555-8555-000000000009`..`14` |
| **Unit 4** | `l-hsk1-15`..`20` | `hsk1-lesson-15`..`20` | Bài 15 – Bài 20 (Nhà cửa, Sức khỏe, Trang phục, Ẩm thực, Sở thích) | 6 × 10 | 84 | 6 | 68 | `55555555-5555-4555-8555-000000000015`..`20` |
| **Unit 5** | `l-hsk1-21`..`25` | `hsk1-lesson-21`..`25` | Bài 21 – Bài 25 (Lịch trình, Điện thoại, Giao thông, Khách sạn, Phương hướng) | 5 × 10 | 67 | 5 | 55 | `55555555-5555-4555-8555-000000000021`..`25` |
| **Unit 6** | `l-hsk1-26`..`32` | `hsk1-lesson-26`..`32` | Bài 26 – Bài 32 (Số lớn, Xưng hô, Động tác, Trạng thái, Tổng ôn) | 7 × 10 | 83 | 13 | 85 | `55555555-5555-4555-8555-000000000026`..`32` |

---

## 3. Kiểm kê Chi tiết 56 Practice Sets (`content/hsk_library/practice_bank.json`)

| Kỹ năng (`skill`) | Số bộ (`sets`) | IDs | Tổng số câu / lượt (`items`) | Phân loại theo dạng bài (`type` / `exercise_type`) |
| :--- | :---: | :--- | :---: | :--- |
| **Vocabulary** | 12 | `ps-vocab-01` .. `ps-vocab-12` | 96 câu | `mcq` (83), `fill` (10), `matching` (3) |
| **Grammar** | 10 | `ps-gram-01` .. `ps-gram-10` | 80 câu | `mcq` (38), `sentence_ordering` (31), `fill` (11) |
| **Listening** | 10 | `ps-listen-01` .. `ps-listen-10` | 60 câu | `audio_mcq` (25), `audio_dialogue` (20), `mcq` (10), `audio_fill` (5) |
| **Speaking** | 8 | `ps-speak-01` .. `ps-speak-08` | 48 lượt | `speaking_item` (48) — luyện từ, cụm từ, câu, hội thoại và tự giới thiệu |
| **Reading** | 8 | `ps-read-01` .. `ps-read-08` | 48 câu | `mcq` / `passage_qa` (45), `tf` (3) kèm `stimulus` đoạn văn dùng chung |
| **Dialogue** | 8 | `ps-dia-01` .. `ps-dia-08` | 49 lượt | `roleplay` turns (49 lượt hội thoại phân vai A/B) |
| **TỔNG CỘNG** | **56 sets** | `ps-*` | **381 mục** | **Đầy đủ 100% ID ổn định, đáp án và giải thích hợp lệ** |
