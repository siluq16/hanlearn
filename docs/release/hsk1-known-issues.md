# HanLearn – Known Issues & Defect Triage Register (HSK 1 Pilot)

**Ngày cập nhật:** 2026-11-21  
**Phiên bản:** Commit `111e16e` (`preview/hsk1-full-curriculum`)

---

## 1. Thống kê Tổng hợp theo Mức độ

| Severity | Mở (Open) | Đã sửa Local | Cần xử lý trước Freeze? | Ghi chú |
| :---: | :---: | :---: | :---: | :--- |
| **P0 – Release Blocker** | **0** | 0 | Bắt buộc = `0` | Không có lỗi mất dữ liệu, lộ đáp án hay sập hệ thống |
| **P1 – High** | **0** | **1** (`KI-P2-002`) | Bắt buộc = `0` | `KI-P2-002` (`HTTP 431` từ `user_metadata` Unit Test) đã sửa local, chờ push Preview |
| **P2 – Medium** | **2** | **1** (`KI-P2-001`) | Backlog / Tùy chọn | `KI-P2-001` đã sửa local; còn `KI-P2-003` và `.next/static` `practice/[setId]` |
| **P3 – Low** | **2** | 0 | Backlog | Cảnh báo ESLint & phạm vi Speaking tự đánh giá |

---

## 2. Danh sách Lỗi & Hạn chế Đã Ghi nhận

### `[KI-P2-001]` `scripts/check-security.mjs` fail ở `src/features/listening/queries.ts`
- **Severity:** `P2` (Medium)
- **Route / File:** [src/features/listening/queries.ts](file:///d:/nam4/prj/HanLearn/src/features/listening/queries.ts) & [scripts/check-security.mjs](file:///d:/nam4/prj/HanLearn/scripts/check-security.mjs#L92-L95)
- **Steps to reproduce:** Chạy `npm run test:security`.
- **Expected vs Actual:** Kỳ vọng pass kiểm tra tĩnh; thực tế báo `Offline draft pilot imported into app source: src/features/listening/queries.ts` (lỗi tồn tại từ trước Sprint 8O).
- **Evidence:** Kết quả chạy `npm run test:security` ngày `2026-11-21` (exit code 1).
- **Impact:** Không lộ secrets hay answer keys vì `queries.ts` dùng `import "server-only"`, nhưng khiến `npm run test:security` trả về exit code `1`.
- **Proposed fix:** Tách hoặc bỏ fallback đọc `content/pilot-hsk1` khỏi `src/features/listening/queries.ts` (hoặc thay bằng dữ liệu canonical) trong đợt bảo trì sau khi được phê duyệt.
- **Status:** `FIXED LOCAL` *(đã gỡ dead fallback `content/pilot-hsk1` trong `src/features/listening/queries.ts`; quét `src/` của `check-security.mjs` đã PASS).*

### `[KI-P2-002]` Cookie phiên test tích lũy vượt ngưỡng header mặc định `16KB` của Node (`HTTP 431`)
- **Severity:** `P2` (Medium)
- **Route / File:** `src/features/quizzes/actions.ts` / `user_metadata` fallback
- **Steps to reproduce:** Đăng nhập bằng tài khoản test tự động cũ (tích lũy nhiều lịch sử `quiz_attempts_*` trong `user_metadata`) vào server Node mặc định chưa nâng `--max-http-header-size`.
- **Expected vs Actual:** Kỳ vọng trả `HTTP 200`; thực tế `next start` mặc định trả `HTTP 431` khi cookie vượt 16KB (sau khi thêm `--max-http-header-size=65536` thì trả `HTTP 200`).
- **Evidence:** Log chạy `sprint8o_post_deploy_smoke.mjs` lần đầu (`431`) và sau khi nâng header size (`200`).
- **Impact:** Có thể xảy ra với tài khoản test dùng lâu ngày nếu còn lưu fallback `quiz_attempts_*` lớn trong JWT `user_metadata`; tài khoản người học mới dùng bảng `curriculum_quiz_attempts` ít bị ảnh hưởng.
- **Proposed fix:** Dọn hoặc giới hạn lưu `user_metadata` khi đã có bảng `curriculum_quiz_attempts` ổn định trên Cloud.
- **Status:** `FIXED LOCAL (Upgraded P1)` *(đã vá `submitUnitTestAction` trong `src/features/exam/unit-test-actions.ts` để không ghi `user_metadata` khi DB RPC thành công; chờ push Preview).*

### `[KI-P2-003]` Mini Quiz chưa hiển thị `explanation_vi` chi tiết sau khi nộp bài
- **Severity:** `P2` (Medium)
- **Route / File:** `/lessons/[id]/quiz` ([src/features/quizzes/components/quiz-player.tsx](file:///d:/nam4/prj/HanLearn/src/features/quizzes/components/quiz-player.tsx#L287-L290))
- **Steps to reproduce:** Nộp một lượt Mini Quiz bài học $\rightarrow$ xem màn hình kết quả.
- **Expected vs Actual:** Hiển thị `Đúng` / `Chưa đúng` từng câu và ghi *"Giải thích đáp án chưa khả dụng"*. (Practice Bank, Unit Tests và Mock Exam đều đã có giải thích tiếng Việt).
- **Impact:** Không chặn luồng học, nhưng học viên cần quay lại bài học để tự xem lý do sai ở Mini Quiz.
- **Proposed fix:** Bổ sung hiển thị `explanation_vi` sau khi nộp ở phiên bản sau nếu UAT đánh giá cần thiết.
- **Status:** `OPEN` (Known limitation).

### `[KI-P3-001]` 8 cảnh báo ESLint pre-existing (unused vars & `useMemo` deps)
- **Severity:** `P3` (Low)
- **Route / File:** `lesson-nav-header.tsx`, `practice-player.tsx`, `roadmap-unit-accordion.tsx`.
- **Status:** `OPEN` (Backlog).

### `[KI-P3-002]` Chức năng Speaking là tự luyện & tự đối chiếu (Self-assessment)
- **Severity:** `P3` (Low / Scope boundary)
- **Route / File:** `/speaking`, `/practice` (`speaking` sets).
- **Impact:** Đã ghi nhãn rõ ràng là tự đánh giá; chưa tích hợp chấm điểm phát âm AI tự động trong MVP.
- **Status:** `KNOWN LIMITATION`.
