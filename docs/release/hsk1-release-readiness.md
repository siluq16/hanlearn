# HanLearn – Backup & Production Readiness Assessment (Phase 7)

**Ngày đánh giá:** 2026-11-21  
**Phạm vi hiện tại:** Development & Vercel Preview (`PRIVATE_INVITE_ONLY`), **chưa triển khai Production**.

---

| Hạng mục Vận hành | Trạng thái | Bằng chứng & Đánh giá Thực tế |
| :--- | :---: | :--- |
| **Supabase Backup / PITR** | **NOT VERIFIED** | Cần kiểm tra trực tiếp trên Supabase Dashboard gói cước/lịch Daily Backup hoặc Point-in-Time Recovery (PITR) cho project trước khi lên Production. |
| **Restore Drill (Khả năng khôi phục)** | **NOT VERIFIED** | Chưa thực hiện bài tập restore thử từ bản backup Supabase sang project tách biệt. **Lưu ý:** Các file snapshot/checksum JSON trong `.local/` chỉ là bằng chứng đối chiếu dữ liệu, **không thay thế bản backup PostgreSQL có thể restore**. |
| **Database Migration Recovery** | **PASS (Dev)** | Lịch sử migration `001–012` sạch, tuần tự; có cơ chế rollback an toàn không mất dữ liệu bằng feature flag `HANLEARN_ASSESSMENT_KEY_REVISION=1` cho đánh giá và script rollback có bảo vệ FK `review_cards` cho catalog. |
| **Vercel Environment Separation** | **PASS (Preview)** | Nhánh `preview/hsk1-full-curriculum` tách biệt khỏi `main/master`, trỏ tới Supabase Development `hhgxrjqkuwdgurphopok` và bật Vercel Deployment Protection (SSO). |
| **Auth Configuration** | **PASS (Dev)** | Đăng ký công khai bị tắt; chỉ `auth.users` đã xác nhận email và có mặt trong `private.allowed_learners` mới truy cập được dữ liệu. |
| **RLS & Private Keys** | **PASS** | `tables_without_rls = 0`; `anon` bị chặn (`401`); `private` schema bị chặn khỏi Data API (`406`). |
| **Secrets Management** | **PASS** | Không có `service_role`, DB password hay token nào trong repo hoặc client bundle (`NEXT_PUBLIC_*` chỉ chứa URL + publishable key). |
| **Monitoring / Error Reporting** | **PARTIAL / NOT VERIFIED** | Có route `/api/health` và log runtime Vercel, chưa cấu hình cảnh báo tập trung (Sentry/Alerting) cho Production. |
| **Cơ chế phát hiện dữ liệu lỗi** | **PASS** | Có kiểm thử hợp đồng `test:contracts`, `test:db:native`, `sprint8o-assessment-and-catalog-integrity.test.ts` và script đối chiếu checksum Cloud. |
| **Quyền phân phối nội dung & `PRIVATE_INVITE_ONLY`** | **PENDING (Public) / PASS (Invite-only)** | Phù hợp cho giai đoạn học thử nội bộ có kiểm soát (`PRIVATE_INVITE_ONLY`). **Không đủ điều kiện phát hành công khai (`PUBLIC_RELEASE`)** cho đến khi hoàn tất Human Linguistic Review, Human Audio Verification và Third-Party Rights Clearance. |
