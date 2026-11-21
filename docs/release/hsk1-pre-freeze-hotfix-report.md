# HanLearn – HSK 1 Pre-Freeze Minimal Hotfix Report

**Ngày hoàn thành:** 2026-11-21  
**Nhánh Git:** `preview/hsk1-full-curriculum`  
**Trạng thái triển khai:** `COMMITTED LOCAL ONLY` (chưa push Preview, chưa thay đổi Cloud, chưa deploy Production, chưa tạo RC tag).

---

## 1. Tóm tắt Root Cause & Thay đổi Trước / Sau

### A. `KI-P2-002` (`P1` – `HTTP 431` Cookie Header từ `user_metadata` Unit Test)
- **Root Cause:** Trong [src/features/exam/unit-test-actions.ts](file:///d:/nam4/prj/HanLearn/src/features/exam/unit-test-actions.ts), `submitUnitTestAction` trước đây luôn gọi `supabase.auth.updateUser()` để nối thêm toàn bộ attempt + 20 câu `answers` vào `user_metadata["quiz_attempts_hsk1-unit-test-0X"]` ngay cả khi PostgreSQL RPC `submit_curriculum_quiz_attempt` đã lưu thành công (`submitted = true`). Ngoài ra, nhánh RPC không ném lỗi ngay khi gặp `PT409` (`ALREADY_SUBMITTED`) hoặc `22023` (`EXAM_DEADLINE_EXCEEDED`).
- **Before / After Logic:**
  - **Before:** `if (submitted)` không hề ngăn Bước 4 ghi đè vào `user_metadata` $\rightarrow$ tài khoản test tăng lên `9,556 bytes` trong `raw_user_meta_data` (vượt ngưỡng cookie `16KB` của Node `next start`).
  - **After:**
    1. Nếu RPC trả về `PT409` hoặc `22023`, hàm **dừng và ném lỗi ngay lập tức** (không rơi xuống fallback).
    2. Khi `submitted === true` (lưu PostgreSQL thành công), **tuyệt đối không ghi** `quiz_attempts_${quizSlug}` vào `user_metadata` (chỉ dọn `active_unit_test_attempts[attemptId]` nếu trước đó hàm `startUnitTestAction` phải dùng fallback).
    3. Nếu `!submitted` (chỉ xảy ra trong môi trường chưa migrate DB), fallback `user_metadata` chỉ lưu tối đa `3` bản tóm tắt gần nhất và **không lưu object `answers` 20 câu**.

### B. `KI-P2-001` (`P2` – `npm run test:security` FAIL tại `src/features/listening/queries.ts`)
- **Root Cause:** Hàm `loadStaticCurriculum()` trong [src/features/listening/queries.ts](file:///d:/nam4/prj/HanLearn/src/features/listening/queries.ts) chứa nhánh fallback dead-code đọc `content/pilot-hsk1/v1/vocabulary.json` và `content/pilot-hsk1/v1/lessons/lesson-01..04.json` (bị `scripts/check-security.mjs` chặn ở rule tĩnh dòng 92–95).
- **Before / After Logic:**
  - **Before:** Khi `content/hsk_library/hsk1_lesson_01.json` không tồn tại, rơi xuống đọc `content/pilot-hsk1`.
  - **After:** Loại bỏ hoàn toàn nhánh fallback dead-code tới `content/pilot-hsk1`; giữ nguyên luồng chính từ Supabase DB và `content/hsk_library/` cho môi trường test.

---

## 2. Danh sách Source Files Thay đổi
1. [src/features/exam/unit-test-actions.ts](file:///d:/nam4/prj/HanLearn/src/features/exam/unit-test-actions.ts)
2. [src/features/listening/queries.ts](file:///d:/nam4/prj/HanLearn/src/features/listening/queries.ts)
3. [tests/sprint8o-assessment-and-catalog-integrity.test.ts](file:///d:/nam4/prj/HanLearn/tests/sprint8o-assessment-and-catalog-integrity.test.ts) *(thêm Test #10 kiểm chứng 25 lượt thi Unit Test liên tiếp = `0 bytes` phình `user_metadata`, chống nộp trùng `PT409`, giữ tương thích Rev 1/2)*
4. [docs/release/hsk1-oversized-metadata-remediation.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-oversized-metadata-remediation.md) *(phương án phục hồi tài khoản đã có oversized metadata, không tự xóa dữ liệu cũ)*
5. [docs/release/hsk1-known-issues.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-known-issues.md) & [docs/release/hsk1-pre-freeze-hotfix-report.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-pre-freeze-hotfix-report.md)

---

## 3. Bằng chứng Kiểm thử & Kết quả Xác minh (Phase 5)

| Hạng mục Kiểm thử | Lệnh chạy | Kết quả Thực tế | Ghi chú |
| :--- | :--- | :---: | :--- |
| **TypeScript Strict** | `npm run typecheck` | **PASS** | `0` lỗi |
| **Repository Contracts** | `npm run test:contracts` | **PASS** | Khớp `docs/postgres_schema.sql` (`0` schema drift) |
| **Vitest Regression Suite** | `npx vitest run` | **PASS (`55 / 55` files · `505 / 505` tests)** | Test #10 chứng minh sau 25 lượt Unit Test liên tiếp, `user_metadata` vẫn là `"{}"` (`0` tăng trưởng); Rev 1 & Rev 2 chấm `20/20`; duplicate submit ném `PT409` |
| **ESLint** | `npx eslint src/ tests/sprint8o-assessment-and-catalog-integrity.test.ts` | **PASS** | `0` errors (`8` warnings pre-existing) |
| **Next.js Production Build** | `npm run build` | **PASS** | `25` routes biên dịch thành công |
| **Static Security Scan** | `npm run test:security` | **PARTIAL** *(xem chi tiết)* | **Quét `src/` PASS 100%** (lỗi `listening/queries.ts` đã hết hoàn toàn). Sau khi `next build` tạo `.next/static`, bước quét bundle client báo `practice/[setId]/page-*.js` (PracticePlayer tự luyện tương tác có `correct_index`/`explanation_vi` từ các sprint trước — ngoài phạm vi hotfix này). |

---

## 4. Phương án Phục hồi Oversized Metadata & Tình trạng Lỗi Còn lại
- **Tài khoản đã có oversized metadata (`7e94f8e5-...`, `9,556 B`):** Tài liệu phục hồi an toàn tại [hsk1-oversized-metadata-remediation.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-oversized-metadata-remediation.md) quy định chỉ gỡ các key bản sao `quiz_attempts_hsk1-unit-test-*` sau khi đối chiếu 100% `id` đã có trong `public.curriculum_quiz_attempts` và có phê duyệt riêng. Không tự động xóa trên Cloud.
- **Remaining Issues sau Hotfix:**
  - `P0`: **`0`**
  - `P1`: **`0`** *(sau khi `KI-P2-002` đã được vá local)*
  - `P2`: **`2`** (`KI-P2-003` Mini Quiz `explanation_vi` sau nộp; `.next/static` `practice/[setId]` trong `check-security.mjs`)
  - `P3`: **`2`** (`8` ESLint warnings; Speaking là tự đánh giá)

---

## 5. Đề xuất Tiếp theo
- Bản vá local đã sẵn sàng để bạn phê duyệt **push lên `origin/preview/hsk1-full-curriculum`** phục vụ **Manual Pilot UAT**, sau đó mới xem xét Release Freeze (`hsk1-rc1`).
