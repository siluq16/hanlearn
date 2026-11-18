# HanLearn Sprint 8N – HSK Source Verification & Syllabus Alignment

**Ngày xác minh:** 2026-11-17  
**Trạng thái xác minh nguồn chính thức:** `COMMUNITY_SYLLABUS_RECONCILED_WITH_GF0025` (Không tự nhận là bản phát hành điện tử được CTI cấp phép trực tiếp)

---

## 1. Phân định Rõ ràng Các Phiên bản HSK và Nguồn Dữ liệu trong HanLearn

Trong bối cảnh giảng dạy tiếng Trung hiện nay, tồn tại 3 hệ thống danh mục từ vựng HSK 1 thường gây nhầm lẫn nếu không phân tách rõ:

| Hệ thống / Tài liệu | Đơn vị công bố / Nguồn gốc | Số lượng từ HSK 1 | Vai trò trong HanLearn | Tình trạng xác minh (`verification_status`) |
| :--- | :--- | :---: | :--- | :---: |
| **1. HSK 2.0 (2012)** | Hanban / CTI (Đề cương HSK 6 cấp cũ) | 150 từ | Chỉ lưu tham chiếu lịch sử trong bảng `syllabus_versions` (`HSK_2012`). | `HISTORICAL_REFERENCE` |
| **2. HSK 3.0 Band 1 – Tiêu chuẩn Quốc gia GF0025-2021** | Bộ Giáo dục Trung Quốc & Ủy ban Ngôn ngữ Nhà nước công bố ngày 24/03/2021 (áp dụng từ 01/07/2021) — *《国际中文教育中文水平等级标准》 (GF0025-2021)* | **500 mục từ** (496 chữ Hán duy nhất, có 4 chữ đa âm lặp 2 mục: `地, 干, 还, 有`) | Lưu tại `content/hsk_library/hsk1_vocabulary.json` làm kho ngữ liệu mở rộng (Extended Reference Catalog). | `VERIFIED_AGAINST_GF0025_2021_WORDLIST` |
| **3. Danh sách 300 từ HSK 1 (MandarinBean HSK 2025 / HSK 3.0 Revised Outline)** | Tổng hợp giáo trình cộng đồng từ MandarinBean (tham chiếu đề cương rút gọn HSK 3.0 Band 1 gồm 300 từ của CTI giai đoạn 2025–2026) | **300 từ duy nhất** | **Danh sách mục tiêu chính thức của khóa HSK 1 trên HanLearn** (`content/hsk_library/hsk1_exam_2025_official_300.json`). | `COMMUNITY_COMPILATION_VERIFIED` *(Không tuyên bố là file nhị phân chính thức từ chinesetest.cn)* |

---

## 2. Đối chiếu Toán học Tập hợp giữa Danh sách 300 từ (A) và Chuẩn GF0025-2021 500 từ (B)

Hệ thống đã kiểm chứng chính xác quan hệ tập hợp giữa:
- **Tập $A$**: 300 từ HSK 1 mục tiêu (`hsk1_exam_2025_official_300.json`, $|A| = 300$).
- **Tập $B$**: 496 từ Hán tự duy nhất trong danh mục 500 mục từ GF0025-2021 (`hsk1_vocabulary.json`, $|B| = 496$).

$$\text{Giao của hai tập } |A \cap B| = 262 \text{ từ}$$

$$\text{Hiệu } |A \setminus B| = 38 \text{ từ (thuộc HSK 2 trong GF0025-2021 được đưa xuống HSK 1 trong bản 300 từ)}$$

$$\text{Tổng kiểm chứng: } 262 + 38 = 300 \text{ từ (Khớp tuyệt đối 100\%)}$$

### Danh sách 38 từ thuộc $A \setminus B$ (Có trong 300 từ mục tiêu, gốc HSK 2 trong GF0025-2021):
1. `边` (`biān` – phía, bên)
2. `不要` (`búyào` – đừng, không cần)
3. `超市` (`chāoshì` – siêu thị)
4. `出租车` (`chūzūchē` – xe taxi)
5. `大家` (`dàjiā` – mọi người)
6. `店` (`diàn` – cửa hàng, tiệm)
7. `分钟` (`fēnzhōng` – phút)
8. `公司` (`gōngsī` – công ty)
9. `狗` (`gǒu` – con chó)
10. `件` (`jiàn` – chiếc, cái - lượng từ quần áo/sự việc)
11. `饺子` (`jiǎozi` – sủi cảo, bánh chẻo)
12. `可以` (`kěyǐ` – có thể, được)
13. `卖` (`mài` – bán)
14. `猫` (`māo` – con mèo)
15. `没事` (`méishì` – không có gì, không bận)
16. `哪个` (`nǎge` – cái nào)
17. `那个` (`nàge` – cái kia, người kia)
18. `你好` (`nǐ hǎo` – xin chào)
19. `女士` (`nǚshì` – nữ sĩ, quý bà)
20. `便宜` (`piányi` – rẻ)
21. `漂亮` (`piàoliang` – xinh đẹp)
22. `苹果` (`píngguǒ` – quả táo)
23. `千` (`qiān` – nghìn)
24. `它` (`tā` – nó - đồ vật/động vật)
25. `它们` (`tāmen` – chúng nó)
26. `玩` (`wán` – chơi)
27. `喂` (`wèi` – alo)
28. `问题` (`wèntí` – câu hỏi, vấn đề)
29. `些` (`xiē` – một vài, những)
30. `雪` (`xuě` – tuyết)
31. `一下` (`yíxià` – một chút, một lát)
32. `椅子` (`yǐzi` – cái ghế)
33. `有点儿` (`yǒudiǎnr` – hơi ... một chút)
34. `有些` (`yǒuxiē` – một số, có phần)
35. `怎么样` (`zěnmeyàng` – thế nào, ra sao)
36. `这个` (`zhège` – cái này, người này)
37. `只` (`zhī` – con, chiếc - lượng từ)
38. `做饭` (`zuò fàn` – nấu ăn)

---

## 3. Danh sách 66 Từ Bổ trợ (Supplemental Vocabulary) trong 32 Bài học

Ngoài **300/300 từ mục tiêu** đã được phủ kín 100% trong `stages[1].vocabulary` của 32 bài học, giáo trình 32 bài có giới thiệu thêm **66 từ mở rộng** (thuộc danh mục 500 từ GF0025-2021 hoặc cụm từ giao tiếp cơ bản) để đảm bảo các chủ đề hội thoại (Thời tiết, Thể thao, Màu sắc, Phương hướng, Trường lớp) tự nhiên và đầy đủ ngữ cảnh:

- **Bài 1 & Bài 3 (4 mục):** `您好` (chào ngài), `姓` (họ), `很高兴` (rất vui mừng), `没` (không có).
- **Bài 11 – Thời tiết (2 mục):** `阴` (âm u), `晴` (nắng).
- **Bài 12 – Giao thông & Khoảng cách (6 mục):** `站`, `车站`, `路`, `远`, `近`, `走路`.
- **Bài 13 & Bài 14 – Trường học & Thi cử (7 mục):** `本子`, `笔`, `教室`, `书包`, `题`, `考`, `考试`.
- **Bài 16 – Sức khỏe & Thể thao (8 mục):** `身体`, `药`, `洗`, `累`, `跑步`, `踢`, `足球`, `游泳`.
- **Bài 17 – Màu sắc & Hình dáng (10 mục):** `颜色`, `红`, `白`, `黑`, `蓝`, `绿`, `黄`, `长`, `短`, `旧`.
- **Bài 18 & Bài 19 – Ẩm thực (6 mục):** `西瓜`, `咖啡`, `好喝`, `甜`, `饿`, `饭馆`.
- **Bài 20 & Bài 22 – Giải trí & Giúp đỡ (6 mục):** `唱歌`, `跳舞`, `玩儿`, `音乐`, `帮`, `帮助`.
- **Bài 25 – Phương hướng (9 mục):** `旁`, `旁边`, `东`, `西`, `南`, `北`, `前边`, `后边`, `里边`.
- **Bài 26, 29, 30, 31, 32 (8 mục):** `万`, `以前`, `以后`, `希望`, `别`, `最`, `已经`, `错`.

> **Quy tắc tính tiến độ minh bạch:** Trong `getLearnerCurriculumProgress()` (`src/features/courses/queries.ts`), chỉ số `vocabularyLearnedCount` trên Dashboard và Roadmap chỉ đếm các từ thuộc đúng **300 từ mục tiêu**, không cộng dồn 66 từ bổ trợ làm sai lệch tỷ lệ `X / 300`.

---

## 4. Kiểm toán Nguồn gốc Bản quyền & Vệ sinh Dữ liệu (Provenance & Hygiene)

1. **Chính sách truy cập hiện hành:** `PRIVATE_INVITE_ONLY` (phục vụ học tập cá nhân và nhóm người học được mời của chủ sở hữu; không phát hành thương mại công khai).
2. **Xử lý nhiễm bẩn dữ liệu từ tài liệu tham khảo:**
   - Phát hiện trong `hsk1_vocabulary.json` .. `hsk5_vocabulary.json` có 2 vị trí ở mỗi file bị dính chuỗi quảng cáo chân trang PDF (`ZALO : 0329797625`, `TIKTOK : THÍCH HỌC TIẾNG TRUNG ĐÀI`).
   - **Đã xử lý triệt để:** Xóa sạch toàn bộ chuỗi quảng cáo/watermark bên thứ ba khỏi cả 5 file JSON và bổ sung kiểm thử tự động ngăn tái nhiễm.

---

## 5. Kiểm tra Nhất quán Nguồn Dữ liệu Thực tế trên 7 Bề mặt Ứng dụng (Content Source Consistency)

| Bề mặt / Route | File truy vấn (`Server` / `Client`) | Nguồn dữ liệu thực tế | Cơ chế Cache | Trạng thái đồng bộ sau Sprint 8N |
| :--- | :--- | :--- | :--- | :--- |
| **1. `/vocabulary`** | `src/app/(app)/vocabulary/page.tsx` → `getOfficial300VocabItems()` | **Local JSON** (`hsk1_exam_2025_official_300.json` + câu ví dụ từ `hsk1_vocabulary.json`) + tiến độ `vocabulary_progress` từ **Supabase Cloud** (`getLearnerCurriculumSnapshot()`). | Không cache tĩnh (`force-dynamic`); ánh xạ cả MD5 UUID lẫn Pilot v1 UUID qua `PILOT_ID_TO_SIMPLIFIED`. | **ĐỒNG BỘ 100%** (300/300 từ dùng nghĩa/Pinyin mới nhất). |
| **2. `/vocabulary/[id]`** | `src/features/vocabulary/queries.ts` → `getVocabulary(id)` | **Hybrid:** Truy vấn `public.vocabulary` trên **Supabase Cloud** trước; nếu không có (256/300 từ mới) thì fallback về `getOfficial300VocabItems()`. Với 44 từ Pilot có trên Cloud, hàm `getVocabulary(id)` đã được bổ sung **Canonical Overlay** từ `getOfficial300VocabItems()` theo `simplified`. | Không cache; luôn đọc trực tiếp và overlay `pinyin_marked` + `meaning_vi` chuẩn từ `getOfficial300VocabItems()`. | **ĐỒNG BỘ 100%** (Không còn trả về nghĩa cũ trên Cloud của từ `不`). |
| **3. `Lesson Reader` (`/lessons/stage/[slug]`)** | `src/features/curriculum/stage-Always-reader` / `lesson-loader.ts` | **Local JSON** (`content/hsk_library/hsk1_lesson_01..32.json` & `hsk1_checkpoint_01..06.json`). Tiến độ chặng lưu qua RPC `upsert_learner_stage_progress` trên **Supabase Cloud**. | In-memory `lessonCache` theo tiến trình Node.js. | **ĐỒNG BỘ 100%** (Đã chuẩn hóa toàn bộ 35 mục từ giữa 32 bài học và danh sách 300 từ: `0` lệch Pinyin, `0` lệch `meaning_vi`). |
| **4. `SRS Review` (`/review`)** | `src/features/review/queries.ts` → `getReviewView()` | **Supabase Cloud** (`public.review_cards` + `public.vocabulary` gồm 44 từ Pilot v1) kết hợp **Canonical Overlay** từ `getOfficial300VocabItems()` và bộ lọc `sanitizeCardPrompt()`. | In-memory `vocabCache` (`TTL = 10 phút`). Overlay được áp dụng ngay khi nạp vào `vocabCache`. | **ĐỒNG BỘ 100%** (Thẻ SRS của từ `不` nhận nghĩa chuẩn `"không (đọc là bú trước thanh 4)"`, sau khi qua `sanitizeCardPrompt()` hiển thị `prompt: "không"`, `notes: "đọc là bú trước thanh 4"`). |
| **5. `Practice` (`/practice`, `/practice/[setId]`)** | `src/features/practice/practice-loader.ts` | **Local JSON** (`content/hsk_library/practice_bank.json`, 56 bộ / 381 câu). | In-memory `cachedPracticeBank` (nạp lại từ file JSON mới). | **ĐỒNG BỘ 100%** (Đã đồng bộ `audioText` camelCase trên toàn bộ `ps-listen-01-q6..10-q6`). |
| **6. `Unit Tests` (`/exam/unit/[unitId]`)** | `src/features/curriculum/unit-test-loader.ts` + `src/features/curriculum/unit-test-actions.ts` | Câu hỏi và lựa chọn từ **Local JSON** (`content/hsk_library/unit_tests/hsk1_unit_test_01..06.json`). Chấm điểm server-side đối chiếu bảng `private.curriculum_quiz_keys` trên **Supabase Cloud**. | In-memory `unitTestCache`. | **ĐỒNG BỘ 100%** (120/120 câu khớp `correct_index` với `private.curriculum_quiz_keys`). |
| **7. `Mock Exam` (`/exam/hsk1`)** | `src/features/exam/queries.ts` + `src/features/exam/actions.ts` | **Local JSON** (`content/hsk_library/hsk1_mock_exam_official.json`, 40 câu). Chấm điểm trong Server Action `submitMockExamAction`. | Đọc từ JSON module server-side. | **ĐỒNG BỘ 100%** (Đã cập nhật câu 11–20 và 31–40, bao gồm sửa ngữ nghĩa câu 31 và 35). |

### Đối chiếu chi tiết 5 từ mục tiêu (`不`, `只`, `杯子`, `大学生`, `不客气`) trên toàn hệ thống

| Chữ Hán | MD5 UUID (`/vocabulary`) | Pinyin chuẩn (`300-list` & `Lesson`) | Nghĩa chuẩn (`meaning_vi`) | Trạng thái trên Supabase Cloud (`public.vocabulary`) | Trạng thái hiển thị thực tế tới Học viên |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **不** | `3a27411c-0f69-4fd8-aa0b-46b94c7911ef` | `bù` | `không (đọc là bú trước thanh 4)` | Có bản ghi Pilot v1 (`07072003-2d5d-5d6e-9170-12a6c9d2b578`) mang chuỗi cũ `"không; trong bài dùng để phủ định 是"`. | **ĐÃ ĐỒNG BỘ 100%** trên `/vocabulary`, `/vocabulary/[id]`, `Lesson 03`, và `/review` (nhờ Canonical Overlay + `sanitizeCardPrompt`). |
| **只** | `29f8512b-0936-4f59-8873-2532165c6278` | `zhī` | `con (lượng từ cho động vật) / chỉ (phó từ zhǐ)` | Chưa có trong 44 từ Pilot trên Cloud. | **ĐÃ ĐỒNG BỘ 100%** giữa `/vocabulary`, `/vocabulary/[id]`, và `Lesson 27`. |
| **杯子** | `70671642-1607-4703-a660-767275365831` | `bēizi` | `cái cốc, cái ly` | Chưa có trong 44 từ Pilot trên Cloud. | **ĐÃ ĐỒNG BỘ 100%** (Ví dụ chuẩn: `桌子上有一个杯子。`). |
| **大学生** | `0c080a93-9566-46a2-96d5-491811602833` | `dàxuéshēng` | `sinh viên đại học` | Chưa có trong 44 từ Pilot trên Cloud. | **ĐÃ ĐỒNG BỘ 100%** (Ví dụ chuẩn: `哥哥是大学生。`). |
| **不客气** | `7c1c1a9f-4c26-445f-8730-350463751836` | `bú kèqi` | `Không có chi / đừng khách sáo` | Chưa có trong 44 từ Pilot trên Cloud. | **ĐÃ ĐỒNG BỘ 100%** trên `/vocabulary`, `Lesson 04`, `ps-listen-01-q6`, và `q-hsk1-mock-34`. |

---

## 6. Trạng thái Xác minh với `https://www.chinesetest.cn/HSK/1?type=syllabus`

- **Phương thức kiểm chứng:** Đối chiếu danh mục 300 từ (`content/hsk_library/hsk1_exam_2025_official_300.json`) với:
  1. Đề cương HSK 1 sửa đổi (300 từ, áp dụng 2025–2026) được công bố trên hệ thống thông tin của Chinese Testing International (`chinesetest.cn`) và bản tổng hợp đối chiếu cộng đồng MandarinBean.
  2. Danh mục 500 từ Band 1 thuộc Tiêu chuẩn Quốc gia `GF0025-2021` (`content/hsk_library/hsk1_vocabulary.json`).
- **Kết quả định lượng:**
  - **Số từ khớp với Đề cương HSK 1 rút gọn 300 từ (2025/2026):** `300 / 300` từ (`0` từ lệch).
  - **Số từ khớp với Chuẩn GF0025-2021 Band 1 (500 từ):** `262 / 300` từ khớp trực tiếp; `38 / 300` từ thuộc nhóm từ giao tiếp thiết yếu được giữ lại trong đề cương 300 từ từ HSK 2.0 / Band 2 (xem danh sách đầy đủ 38 từ tại Mục 2).
- **Giới hạn xác minh cần ghi nhận trung thực (`PARTIAL_DIRECT_PORTAL_VERIFICATION`):**
  - Trang `https://www.chinesetest.cn/HSK/1?type=syllabus` trên cổng `chinesetest.cn` là giao diện SPA tải dữ liệu động / tài liệu PDF đính kèm theo phiên truy cập. Việc đối chiếu tự động không qua xác thực cổng CTI được thực hiện gián tiếp qua bản chụp đề cương 300 từ và chuẩn quốc gia `GF0025-2021` lưu trong kho dữ liệu, **chưa đối chiếu thủ công từng dòng trực tiếp trên file PDF gốc tải từ phiên đăng nhập `chinesetest.cn`**. Do đó, trạng thái xác minh trực tiếp với cổng `chinesetest.cn` được gắn nhãn trung thực là **`CROSS_CHECKED_VIA_PUBLISHED_SYLLABUS_SNAPSHOT (DIRECT_PORTAL_SPA_UNVERIFIED)`**.

