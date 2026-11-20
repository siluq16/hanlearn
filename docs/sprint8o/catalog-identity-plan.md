# HanLearn Sprint 8O – Phase 5: Canonical Vocabulary Identity & Data Migration Design

**Ngày thiết kế:** 2026-11-20  
**Nguyên tắc cốt lõi:** **Bảo toàn tuyệt đối các UUID đã có khóa ngoại (`review_cards`, `lesson_vocabulary`, `syllabus_vocabulary`) — Không bao giờ xóa dòng Pilot v1 hoặc tạo 2 dòng cho cùng một từ mục tiêu.**

---

## 1. Quy tắc Định danh Chuẩn Duy nhất (Single Effective Database Identity Rule)

Đối với mỗi từ $w$ trong danh mục 300 từ HSK 1:

$$\text{effective\_database\_id}(w) = \begin{cases} \text{pilot\_v1\_id}(w) & \text{nếu } w \in P_{43} \text{ (đã tồn tại trong } \texttt{public.vocabulary}\text{)} \\ \text{UUID}_{\text{MD5}}(\texttt{"hsk1\_word\_"} \mathbin{\Vert} w.\text{hanzi}) & \text{nếu } w \in C_{300} \setminus P_{43} \text{ (257 từ mới)} \end{cases}$$

Trong [src/features/vocabulary/hsk1-library-vocab.ts](file:///d:/nam4/prj/HanLearn/src/features/vocabulary/hsk1-library-vocab.ts), mỗi phần tử `HSK1VocabItem` lưu tường minh cả 3 trường:
- `id`: **`effective_database_id`** (khóa chính duy nhất dùng cho `/vocabulary`, `/vocabulary/[id]`, `/review`, `review_cards`, `vocabulary_progress`).
- `canonical_source_id`: UUID dẫn xuất từ MD5(`hsk1_word_${hanzi}`).
- `pilot_v1_id`: UUID Pilot v1 nếu thuộc 43 từ Pilot, ngược lại là `null`.

Hàm tra cứu `findOfficial300VocabItem(idOrHanzi)` lập chỉ mục theo cả 3 khóa (`id`, `canonical_source_id`, và `simplified`), đảm bảo mọi đường dẫn cũ (`/vocabulary/<md5_id>`) hay mới (`/vocabulary/<pilot_id>`) đều phân giải về **cùng một đối tượng từ vựng duy nhất**.

---

## 2. Phương án Xử lý 7 Trường hợp Nghiệp vụ (Section 6 Checklist)

| # | Trường hợp nghiệp vụ | Số lượng thực tế | Chiến lược xử lý trong Code & Database Migration (`0012`) |
| :---: | :--- | :---: | :--- |
| **1** | **Từ chỉ xuất hiện trong Pilot (`P_{44} \setminus C_{300}`)** | **1 từ** (`越南`, `aa4a8f04-c772-54ef-a296-a7fd0a6d37c3`) | Giữ nguyên dòng trong `public.vocabulary` và liên kết trong `public.lesson_vocabulary` (để Bài 2 Pilot v1 hoạt động bình thường); không đưa vào `public.syllabus_vocabulary` của 300 từ HSK 1 và không tính vào bộ đếm `vocabularyLearnedCount` (`X / 300`). |
| **2** | **Từ có trong cả Pilot và Canonical 300 (`C_{300} \cap P_{44}`)** | **43 từ** (`你, 我, 好, 不, 很...`) | Giữ nguyên `pilot_v1_id` làm `effective_database_id` (`item.id`). Trong Migration 0012, dùng câu lệnh `UPDATE public.vocabulary SET pinyin_marked = ..., meaning_vi = ..., example_* = ... WHERE id = pc.id` để cập nhật nghĩa/Pinyin chuẩn Sprint 8N ngay tại chỗ mà không chạm vào khóa chính hay khóa ngoại. |
| **3** | **Từ mới chỉ có trong JSON (`C_{300} \setminus P_{44}`)** | **257 từ** (`杯子, 不客气, 大学生, 只...`) | Sử dụng `canonical_source_id` (`generateCanonicalSourceUUID(hanzi)`) làm `effective_database_id`. Trong Migration 0012, `INSERT INTO public.vocabulary ... ON CONFLICT (id) DO UPDATE` với `sense_key = 'hsk1-2025-1'`, `status = 'published'`, `review_status = 'approved'`, và liên kết vào `public.syllabus_vocabulary`. |
| **4** | **Hanzi đa âm (`Polyphones`)** | **`只` (`zhī` vs `zhǐ`)**, plus `地, 干, 还, 有` | Khóa duy nhất trên bảng `public.vocabulary` là `UNIQUE (simplified, pinyin_marked, sense_key)`. Từ `只` trong HSK 1 được định danh rõ là `(simplified='只', pinyin_marked='zhī', sense_key='hsk1-2025-1')` với nghĩa lượng từ và ghi chú phân biệt `zhǐ (chỉ)`. |
| **5** | **Từ đã có lịch sử SRS (`review_cards` & `review_events`)** | **22 từ Pilot** (`44` thẻ `review_cards`, `79` sự kiện `review_events`) | Vì `effective_database_id` giữ nguyên 100% `pilot_v1_id`, toàn bộ 44 thẻ `review_cards` (`interval_days`, `ease_factor`, `repetitions`, `version`, `due_at`) và 79 `review_events` giữ nguyên liên kết FK, không bị reset chu kỳ ôn tập và không bao giờ sinh thẻ SRS trùng lặp. |
| **6** | **Từ chưa từng được review** | **21 từ Pilot còn lại + 257 từ mới** | Khi học viên hoàn thành bài học hoặc mở thẻ mới, hệ thống sử dụng đúng `effective_database_id` duy nhất của từ đó kèm ràng buộc `ON CONFLICT (user_id, vocabulary_id, card_type) DO NOTHING`. |
| **7** | **Dữ liệu lỗi hoặc xung đột** | Kiểm tra ràng buộc toàn vẹn cuối hàm `sync_hsk1_canonical_vocabulary_catalog()` | Hàm PL/pgSQL kiểm tra tự động `v_orphaned_cards = 0`; nếu phát hiện bất kỳ lỗi khóa ngoại nào, toàn bộ transaction tự động `RAISE EXCEPTION` và rollback nguyên tử. |
