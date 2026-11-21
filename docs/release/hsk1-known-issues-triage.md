# HanLearn HSK 1 – Pre-Freeze Known Issues Triage

**Ngày điều tra:** 2026-11-21  
**Phạm vi:** Điều tra chỉ đọc (read-only) trên commit `d36c78a` (`preview/hsk1-full-curriculum`) & Supabase Cloud Development `hhgxrjqkuwdgurphopok`. Không sửa source code, không tạo migration, không thay đổi Cloud.

---

## Tóm tắt Quyết định Triage

| ID | Vấn đề | Severity Cũ | Severity Mới | Chặn Manual UAT? | Chặn Release Freeze? | Hướng xử lý đề xuất |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **KI-P2-001** | `npm run test:security` FAIL tại `src/features/listening/queries.ts` | `P2` | **`P2` (Medium)** | Không | **Không** *(nhưng nên dọn nhẹ để CI xanh 100%)* | Gỡ nhánh fallback dead-code `content/pilot-hsk1` khỏi `listening/queries.ts` |
| **KI-P2-002** | `HTTP 431` Cookie Header từ `user_metadata` | `P2` | **`P1` (High)** | Không *(với user mới 1–2 lượt)* | **CÓ (Nên fix trước Freeze)** | Dừng ghi đè `user_metadata` trong `unit-test-actions.ts` khi DB RPC đã thành công |
| **KI-P2-003** | Mini Quiz chưa hiện `explanation_vi` sau nộp | `P2` | **`P2` (Medium)** | Không | **Không** *(có thể fix nhẹ trước Freeze hoặc đưa backlog)* | Trả `explanation_vi` trong `responses` **chỉ khi** `attemptRaw.submitted_at` khác rỗng |

---

## 1. `KI-P2-001` – `npm run test:security` FAIL tại `src/features/listening/queries.ts`

### Root Cause
- File [scripts/check-security.mjs](file:///d:/nam4/prj/HanLearn/scripts/check-security.mjs#L92-L95) kiểm tra tĩnh toàn bộ `src/` và chặn mọi tham chiếu chuỗi `content/pilot-hsk1` (`Offline draft pilot imported into app source`).
- File [src/features/listening/queries.ts](file:///d:/nam4/prj/HanLearn/src/features/listening/queries.ts#L114-L160) (tồn tại từ trước Sprint 8O) có một khối fallback `// Fallback: 4 Pilot lessons` đọc `content/pilot-hsk1/v1/vocabulary.json` và `content/pilot-hsk1/v1/lessons/lesson-01..04.json` bên trong hàm `loadStaticCurriculum()`.

### Reproduction
- Chạy `npm run test:security` $\rightarrow$ exit code `1`:
  `AssertionError [ERR_ASSERTION]: Offline draft pilot imported into app source: src/features/listening/queries.ts`.

### Luồng Dữ liệu & Security / Data Impact
- `src/features/listening/queries.ts` khai báo `import "server-only";` (dòng 1) và chỉ được gọi từ Server Component [src/app/(app)/listening/page.tsx](file:///d:/nam4/prj/HanLearn/src/app/%28app%29/listening/page.tsx#L18).
- Khi chạy thực tế, dòng 46–47 kiểm tra `fs.existsSync("content/hsk_library/hsk1_lesson_01.json")`: vì thư mục `content/hsk_library/` luôn tồn tại trong repo, nhánh dòng 47–112 luôn `return` trước khi chạm tới dòng 115 (`content/pilot-hsk1` thực tế là **dead fallback code**).
- Khối fallback chỉ trích xuất `{ id, title, sortOrder }` và `{ hanzi, pinyin, translationVi, lessonId }` — **không đọc** `answers.json`, `.local/pilot-hsk1`, `private.curriculum_quiz_keys` hay `explanation_vi`.
- **Đối chiếu `SECURITY_MODEL.md`:** **Không vi phạm** nguyên tắc bảo mật thực tế (không lộ key/bí mật ra client). Đây là **lỗi vệ sinh repo tĩnh (static hygiene defect)** chứ không phải lỗ hổng rò rỉ dữ liệu.

### Severity Xác minh lại & Quyết định Freeze
- **Severity:** **`P2` (Medium)**.
- **Chặn Release Freeze?** **Không** (nhưng sửa rất nhỏ để khôi phục `npm run test:security` PASS).

### Recommended Minimal Fix & Regression Tests
- **Fix tối thiểu:** Xóa khối fallback `content/pilot-hsk1` (dòng 114–195) trong `loadStaticCurriculum()` của `src/features/listening/queries.ts` (trả về `{ lessons: [], vocabulary: [], sentences: [] }` nếu thiếu `content/hsk_library`), tuyệt đối không sửa hay bỏ qua rule trong `scripts/check-security.mjs`.
- **Regression test:** `npm run test:security`, `npm run typecheck`, `npx vitest run tests/listening.test.ts`.

---

## 2. `KI-P2-002` – `HTTP 431` Cookie Header (`Request Header Fields Too Large`)

### Root Cause
- Truy vấn trực tiếp `auth.users` trên Cloud Development (`hhgxrjqkuwdgurphopok`) cho thấy 3 tài khoản có kích thước `raw_user_meta_data` như sau:
  - User `e230a6ee-...` (mới): `24 bytes` (`email_verified`).
  - User `3070605e-...` (học viên thông thường): `522 bytes` (`stage_prog_*` ~90–99 bytes/bài).
  - User `7e94f8e5-...` (tài khoản test tự động): **`9,556 bytes`**, trong đó `quiz_attempts_hsk1-unit-test-01` chiếm **`5,346 bytes`** và `quiz_attempts_hsk1-unit-test-06` chiếm **`3,888 bytes`**.
- **Nguyên nhân trong code:** Tại [src/features/exam/unit-test-actions.ts](file:///d:/nam4/prj/HanLearn/src/features/exam/unit-test-actions.ts#L402-L426) (`// 4. Dual-layer safe persistence to user_metadata`), Server Action **luôn luôn** gọi `supabase.auth.updateUser()` để nối thêm toàn bộ bản ghi attempt (kèm object 20 câu `answers`) vào `user_metadata["quiz_attempts_hsk1-unit-test-0X"]` **ngay cả khi PostgreSQL RPC `submit_curriculum_quiz_attempt` đã lưu thành công** (`submitted = true`), và **không giới hạn số phần tử**.
- Vì `@supabase/ssr` nhúng toàn bộ `user_metadata` vào JWT cookie (`sb-<ref>-auth-token.0/.1/.2/...`), khi `user_metadata` vượt ~`9–11 KB` (sau khoảng 10–15 lượt nộp Unit Test), tổng kích thước cookie + headers vượt ngưỡng mặc định `16 KB` của Node.js (`HTTP 431`).

### Reproduction & Tác động Người học Hiện tại
- Tài khoản `7e94f8e5-...` (`9,556 bytes` `user_metadata`) khi gửi request vào `next start` mặc định (không có `--max-http-header-size=65536`) bị **`HTTP 431`** ở mọi route (`/dashboard`, `/review`, `/vocabulary`).
- **Reload, đăng nhập lại và refresh token đều tái hiện `HTTP 431`** vì JWT mới được cấp lại vẫn mang nguyên `raw_user_meta_data` từ `auth.users`!
- **Tác động người học thật:** Hiện tại 2 tài khoản người học thông thường (`522 bytes` và `24 bytes`) chưa bị lỗi, **nhưng nếu một học viên làm lại Unit Test trên 10–15 lần, họ sẽ bị khóa khỏi ứng dụng với lỗi `HTTP 431`**.

### Severity Xác minh lại & Quyết định Freeze
- **Severity:** **Nâng từ `P2` lên `P1` (High)** vì có khả năng làm học viên tích cực không thể truy cập `/dashboard` hoặc học tiếp sau nhiều lượt Unit Test.
- **Chặn Release Freeze?** **CÓ (Khuyến nghị fix trước Freeze)**; không chặn Manual UAT nếu tài khoản UAT mới chỉ làm 1–2 lượt Unit Test.

### Recommended Minimal Fix & Regression Tests
- **Fix tối thiểu (không xóa `user_metadata` hay lịch sử cũ):**
  1. Trong `submitUnitTestAction` ([src/features/exam/unit-test-actions.ts](file:///d:/nam4/prj/HanLearn/src/features/exam/unit-test-actions.ts#L402)), chỉ ghi vào `user_metadata` **khi `!submitted`** (tức DB table/RPC chưa lưu được), đồng thời giới hạn `.slice(-5)` nếu phải fallback.
  2. Tương tự kiểm tra `startUnitTestAction`: chỉ ghi `active_unit_test_attempts` khi `!dbSaved` (giữ nguyên như hiện tại, nhưng xóa key trong `active_unit_test_attempts` nếu tồn tại).
- **Regression test:** `tests/sprint8o-assessment-and-catalog-integrity.test.ts` (xác nhận `submitUnitTestAction` khi DB thành công không làm phình `user_metadata`), `npm run typecheck`, `npm run build`.

---

## 3. `KI-P2-003` – Mini Quiz Chưa Hiển thị `explanation_vi` Sau Khi Nộp

### Root Cause
- Toàn bộ `308` câu Mini Quiz trong `src/features/quizzes/curriculum-quizzes*.ts` **đã có sẵn trường `explanation_vi`** trong `curriculum.answerKeys[q.id].explanation_vi` (không chứa chữ cái vị trí A/B/C/D nên tương thích cả Revision 1 và Revision 2).
- Tuy nhiên, trong [src/features/quizzes/contracts.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/contracts.ts#L4-L10), `responseRow` chỉ có 3 trường `{ question_id, answer_index, is_correct }`, và [src/features/quizzes/components/quiz-player.tsx](file:///d:/nam4/prj/HanLearn/src/features/quizzes/components/quiz-player.tsx#L288-L290) hiển thị dòng cố định *"Giải thích đáp án chưa khả dụng"*.

### Security / Data Impact & Tương thích Revision 1/2
- Trong [src/features/quizzes/queries.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/queries.ts#L118-L135), mảng `responses` chỉ được tạo **khi `attemptRaw?.submitted_at` khác rỗng** (tức attempt đã được server xác nhận nộp); trước khi nộp, `responses` luôn là `[]` và `questions` chỉ có `{ id, prompt, choices }`.
- Vì vậy, `explanation_vi` hiện đang được giữ private hoàn toàn, và có thể hiển thị an toàn **chỉ sau khi `submitted_at != null`** mà không làm rò rỉ đáp án trước khi nộp và không ảnh hưởng Revision 1/2.

### Severity Xác minh lại & Quyết định Freeze
- **Severity:** **`P2` (Medium)**.
- **Chặn Release Freeze?** **Không** (có thể đưa vào backlog sau UAT hoặc bổ sung theo phê duyệt).

### Recommended Minimal Fix & Regression Tests
- **Fix tối thiểu:** Thêm `explanation_vi: z.string().optional()` vào `responseRow` (`contracts.ts`), gán `explanation_vi: curriculum.answerKeys[q.id]?.explanation_vi` trong nhánh `if (attemptRaw?.submitted_at && attemptRaw.answers)` của `getQuizView` (`queries.ts`), và hiển thị `r?.explanation_vi` trong `quiz-player.tsx` khi `submitted && attempt`.
- **Regression test:** Kiểm tra `getQuizView` trước khi nộp (`submittedAt === null`) không chứa `explanation_vi`; sau khi nộp trả đủ `explanation_vi`; `npx vitest run tests/quiz-query.test.ts tests/quiz-action.test.ts`.
