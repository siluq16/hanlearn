# HanLearn – HSK 1 Pilot Acceptance & Release Freeze Final Report

**Ngày lập báo cáo:** 2026-11-21  
**Trạng thái kết luận:** **`READY FOR MANUAL UAT`**  
*(Không phải `RELEASE FROZEN` — chờ bạn học thử trực tiếp trên HTTPS Vercel Preview và xác nhận UAT).*

---

## 1. Thông tin Phiên bản & Hạ tầng
1. **Verified Branch / HEAD:** `preview/hsk1-full-curriculum` tại **`111e16eab2735d85ffcf3e4c940405febc2b6a1c`** (`111e16e`).
2. **Vercel Deployment:** **`state: "success"`** (`Deployment has completed`) cho commit `111e16e`, Deployment Protection (SSO) **BẬT**.
3. **Migration History (`hhgxrjqkuwdgurphopok`):** **`001–012`** (`202611120001` $\rightarrow$ `202611200012`) đồng bộ 100% giữa local và remote, `0` schema drift.

## 2. Kết quả Kiểm thử Tự động & Độ phủ
4. **Test Coverage:** Bao phủ 4 trạng thái Version Skew (`Old/New App × Old/New DB`), rollback dual-revision, phân bố đáp án `428` câu (`[107, 107, 107, 107]`), `300` từ vựng HSK 1 + `43` Pilot UUIDs, RLS/anon isolation, và Cloud RPC grading.
5. **Automated Tests:**
   - `npm run typecheck`: **PASS** (`0` lỗi).
   - `npm run build` (Next.js `16.4.6`): **PASS** (`25` routes).
   - `npm run test:contracts`: **PASS**.
   - `npx vitest run`: **PASS (`55 / 55` files · `504 / 504` tests)** *(chạy lại tại `111e16e`)*.
   - `node scripts/check-anonymous-api.mjs`: **PASS**.
   - `node .local/scripts/sprint8o_post_deploy_smoke.mjs` (Local Next.js $\rightarrow$ Cloud Development): **PASS** (`5/20` toàn A, `20/20` đúng Rev 2, `PT409` anti-replay, `0` leakage).
   - `npm run test:security`: **FAIL (Pre-existing P2)** tại `src/features/listening/queries.ts` (fallback `content/pilot-hsk1`).

## 3. Nghiệm thu Thực tế, Giáo dục & Giới hạn Con người
6. **HTTPS Preview UAT thực tế:** **`NOT VERIFIED`** do Vercel SSO chặn truy cập tự động (`HTTP 302` $\rightarrow$ `vercel.com/sso-api`).
7. **Educational Acceptance:** Structural Content **PASS** · Automated Content QA **PASS** · AI Linguistic Review **COMPLETED (Sprint 8N/8O)**.
8. **Nội dung cần con người kiểm chứng (`PENDING`):**
   - **Human Linguistic Review** (giáo viên tiếng Trung độc lập).
   - **Human Audio Verification** (nghe thực tế TTS/Audio trên Chrome/Edge/Mobile).
   - **Human Learner Acceptance** (bạn học thử theo [hsk1-manual-uat.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-manual-uat.md)).

## 4. Lỗi, Bảo mật, Backup & Freeze Gate
9. **P0 / P1 / P2 / P3 tồn tại:** **`0` P0 · `0` P1 · `3` P2 · `2` P3** (chi tiết tại [hsk1-known-issues.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-known-issues.md)).
10. **Data Integrity & Security Status:** **PASS** (`tables_without_rls = 0`, private keys bị chặn qua API, checksum `60` `review_cards` và `89` `review_events` trùng khớp 100% trước/sau migration).
11. **Backup / Restore Readiness:** **`NOT VERIFIED`** cho restore drill & Supabase PITR/daily backup. Các snapshot JSON trong `.local/` **không thay thế** bản backup PostgreSQL có thể restore.
12. **Known Limitations:** Speaking là tự đánh giá; Mini Quiz chưa hiện `explanation_vi` sau khi nộp; chính sách nội dung là `PRIVATE_INVITE_ONLY` (chưa đủ quyền phát hành công khai `PUBLIC_RELEASE`).
13. **Freeze Gate:** **`FAIL / PENDING`** (thiếu bằng chứng Manual Pilot UAT qua HTTPS Preview của người dùng và backup restore verification).

---

## 5. Việc Cần Bạn Xác nhận & Đề xuất Quyết định Cuối cùng
- **Hành động tiếp theo dành cho bạn:**
  1. Mở URL Preview, đăng nhập Vercel SSO và thực hiện học thử theo [docs/release/hsk1-manual-uat.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-manual-uat.md).
  2. Gửi lại các lỗi phát hiện (nếu có) theo mẫu P0–P3.
  3. Kiểm tra cấu hình backup/PITR trên Supabase Dashboard trước khi xét bước Production sau này.
- **Kết luận chính thức:** **`READY FOR MANUAL UAT`**
