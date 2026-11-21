# HanLearn – HSK 1 Pre-Freeze Minimal Hotfix & Security Gate Report

**Ngày hoàn thành:** 2026-11-21  
**Nhánh Git:** `preview/hsk1-full-curriculum`  
**Trạng thái triển khai:** `COMMITTED LOCAL ONLY` (chưa push Preview, chưa thay đổi Supabase Cloud, chưa deploy Production, chưa tạo RC tag).

---

## 1. Practice Client Bundle Audit (`.next/static/chunks/app/(app)/practice/[setId]/page-*.js`)

1. **Dữ liệu xuất hiện trong bundle:** Chỉ chứa code UI của `PracticePlayer` (`"use client"`) cho **56 bộ Practice tự luyện có feedback tức thì** (`content/hsk_library/practice_bank.json`).
2. **Có rò rỉ protected answer keys không?** **KHÔNG.** Kiểm tra toàn bộ `.next/static/**/*.js` (`Test #11` trong [sprint8o-assessment-and-catalog-integrity.test.ts](file:///d:/nam4/prj/HanLearn/tests/sprint8o-assessment-and-catalog-integrity.test.ts)) xác nhận **0** mã câu hỏi hay đáp án nào của **38 Mini Quizzes (`308` câu)** hoặc **6 Unit Tests (`120` câu)** xuất hiện trong bất kỳ client chunk nào; `submission_fingerprint` và `submission_payload` cũng hoàn toàn vắng mặt.
3. **Practice client-side feedback có hợp lệ không?** **Hợp lệ.** Đây là *Intended client-side self-practice data* cho phép học viên luyện tập tự do và xem giải thích tức thì; `savePracticeAttempt` ([src/features/practice/actions.ts](file:///d:/nam4/prj/HanLearn/src/features/practice/actions.ts)) chỉ ghi điểm luyện tập tốt nhất vào `learner_practice_history`, **không** thể mở khóa bài học, **không** ghi `lesson_progress`, **không** sinh thẻ SRS và **không** ảnh hưởng `curriculum_quiz_attempts`.
4. **Trạng thái Security Gate (`npm run test:security`):** **`PASS` 100%** (`PASS static credential/grant-boundary scan (545 source files; browser bundle checked when present)`). Trong [scripts/check-security.mjs](file:///d:/nam4/prj/HanLearn/scripts/check-security.mjs#L124-L140), mọi `.next/static/*.js` vẫn bị quét đầy đủ `submission_fingerprint`, `submission_payload`, `draft pilot`, `synthetic fixtures`, `secretPatterns`; chỉ cấp ngoại lệ cho `correct_index|explanation_vi` trên đúng duy nhất route chunk `.next/static/chunks/app/(app)/practice/[setId]/page-*.js`.

---

## 2. Unit Test Fallback Authority (`src/features/exam/unit-test-actions.ts`)

5. **Tuân thủ Server-Authoritative Grading (Fail-Closed):**
   - **Trước:** Khi `submit_curriculum_quiz_attempt` RPC gặp lỗi tạm thời (không phải `PT409`/`22023`), code cũ có thể rơi xuống nhánh `update`/`insert` trực tiếp hoặc trả kết quả `passed` từ server action kèm ghi `user_metadata`.
   - **Sau (Fail-Closed):**
     - `startUnitTestAction`: Bắt buộc insert vào `public.curriculum_quiz_attempts` thành công; nếu lỗi DB, ném lỗi ngay (**không** ghi `active_unit_test_attempts` vào `user_metadata`).
     - `submitUnitTestAction`: Bắt buộc gọi `submit_curriculum_quiz_attempt` RPC thành công. Nếu `PT409` $\rightarrow$ ném lỗi chống nộp trùng; nếu `22023` $\rightarrow$ ném lỗi quá hạn; nếu mọi lỗi RPC khác $\rightarrow$ **ném lỗi ngay (fail-closed)**, tuyệt đối **không** trả kết quả giả và **không** ghi vào `user_metadata`.

---

## 3. Existing Cookie 431 (`user_metadata` Tích lũy Cũ)

6. **Trạng thái hiện tại:**
   - **Ngăn tăng trưởng mới:** Đã chặn 100% (`Test #10`: 25 lượt thi Unit Test liên tiếp gây `0 bytes` tăng trưởng `user_metadata`).
   - **Tài khoản tích lũy cũ (`7e94f8e5-...` với `9,556 bytes` trong `raw_user_meta_data`):** Chưa tự động xóa trên Cloud. Tài khoản này vẫn cần xử lý theo quy trình tại [hsk1-oversized-metadata-remediation.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-oversized-metadata-remediation.md) (đối chiếu 100% ID đã có trong PostgreSQL $\rightarrow$ gỡ bản sao trong `user_metadata` $\rightarrow$ đăng nhập lại để nhận JWT gọn) nếu muốn chạy lại qua server Node `16KB` header mặc định. Hai tài khoản người học thông thường (`24B` và `522B`) không bị `431`.

---

## 4. Kết quả Kiểm thử & Build (`Tests #1–11`, Production Build, Security Gate)

7. **Kết quả chạy thực tế sau lần sửa cuối cùng:**
   - `npm run typecheck`: **PASS** (`0` lỗi).
   - `npm run test:contracts`: **PASS** (`0` schema drift).
   - `npx vitest run`: **PASS (`55 / 55` files · `506 / 506` tests)** — bao gồm kiểm chứng fail-closed khi RPC timeout, 25 lượt Unit Test = `0` metadata growth, Mini Quiz & Unit Test Rev 1/2, chống nộp trùng `PT409`, và xác nhận `.next/static` không chứa Mini Quiz / Unit Test keys.
   - `npx eslint src/ tests/sprint8o-assessment-and-catalog-integrity.test.ts`: **PASS** (`0` errors, `8` warnings pre-existing).
   - `npm run build`: **PASS** (`25` routes).
   - `npm run test:security`: **PASS** (`545` source files + `.next/static` bundles).

---

## 5. Remaining Issues, Commit & Khuyến nghị Release

8. **Remaining Issues:**
   - `P0`: **`0`**
   - `P1`: **`0`**
   - `P2`: **`1`** (`KI-P2-003`: Mini Quiz chưa hiển thị `explanation_vi` sau nộp — backlog/tùy chọn)
   - `P3`: **`2`** (`8` ESLint warnings; Speaking là tự đánh giá)
9. **Files thay đổi trong đợt hotfix & gate:**
   - [src/features/exam/unit-test-actions.ts](file:///d:/nam4/prj/HanLearn/src/features/exam/unit-test-actions.ts)
   - [src/features/listening/queries.ts](file:///d:/nam4/prj/HanLearn/src/features/listening/queries.ts) *(đã commit ở `4cade03`)*
   - [scripts/check-security.mjs](file:///d:/nam4/prj/HanLearn/scripts/check-security.mjs)
   - [tests/sprint8o-assessment-and-catalog-integrity.test.ts](file:///d:/nam4/prj/HanLearn/tests/sprint8o-assessment-and-catalog-integrity.test.ts)
10. **Khuyến nghị Push Preview để Manual UAT:** **ĐỦ ĐIỀU KIỆN PUSH PREVIEW.** Toàn bộ `P0`, `P1` và `npm run test:security` đã **PASS**. Khi bạn phê duyệt, có thể push lên `origin/preview/hsk1-full-curriculum` để bạn thực hiện Manual Pilot UAT qua Vercel SSO.
