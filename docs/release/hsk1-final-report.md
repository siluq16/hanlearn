# HanLearn – HSK 1 Pilot Acceptance & Release Freeze Final Report

**Ngày lập báo cáo:** 2026-11-21  
**Kết luận chính thức:** **`READY FOR FREEZE APPROVAL`**  
*(Không tự tuyên bố `RELEASE FROZEN` — chờ phê duyệt đóng băng chính thức của bạn đối với commit `d68cf39` và tag `hsk1-rc1`).*

---

## 1. Kết quả Nghiệm thu Dựa Trên Bằng chứng
- **Automated Quality & Security Gate (`d68cf39`):**
  - `npm run typecheck`: **PASS** (`0` lỗi).
  - `npm run test:contracts`: **PASS** (`0` schema drift với [docs/postgres_schema.sql](file:///d:/nam4/prj/HanLearn/docs/postgres_schema.sql)).
  - `npx vitest run`: **PASS (`55 / 55` files · `506 / 506` tests)**.
  - `npx eslint src/ tests/sprint8o-assessment-and-catalog-integrity.test.ts`: **PASS** (`0` errors, `8` warnings pre-existing).
  - `npm run build`: **PASS** (`25` routes).
  - `npm run test:security`: **PASS** (`545` source files + `.next/static` bundles; `0` rò rỉ Mini Quiz / Unit Test keys).
  - Cloud Development (`hhgxrjqkuwdgurphopok`): Migrations `001–012` đồng bộ 100%, `tables_without_rls = 0`, checksum `60` `review_cards` và `89` `review_events` bảo toàn 100%, smoke test grading & anti-replay (`PT409`) **PASS**.
- **Manual UAT (Owner Trial trên Vercel Preview `d68cf39`):**
  - Chủ dự án đã trực tiếp học thử HanLearn trên Vercel Preview (`CfSsCaJt1TkpktXCcjV5fh5B7nJM`) và xác nhận **không phát hiện lỗi trong quá trình sử dụng** (`0` P0/P1 mới).

---

## 2. Phân định Test Case Đã `PASS` vs. Còn `NOT VERIFIED` / `PENDING`
- **Đã `PASS` (kết hợp kiểm thử tự động & học thử thực tế của chủ dự án):**
  - `UAT-A01..A03` (Vercel SSO, Auth, Anonymous & Cross-user isolation), `UAT-B01` (Module 0 trên Preview), `UAT-C01` (Curriculum 32 bài / 10 chặng), `UAT-D01/D02` (300 từ + Pilot UUIDs + SRS 2 chiều), `UAT-E01` (Practice 6 kỹ năng), `UAT-F01/F02` (Mini Quiz & Unit Test Rev 1/2, Mock Exam), `UAT-G01` (Dashboard & Progress).
- **Vẫn còn `NOT VERIFIED` / `PENDING` (chưa có bằng chứng kiểm định độc lập):**
  - **Human Native-Speaker Linguistic & Acoustic Review:** `PENDING` (chính sách hiện tại là `PRIVATE_INVITE_ONLY`, chưa đạt `PUBLIC_RELEASE`).
  - **Supabase Backup / Restore Drill:** `NOT VERIFIED` (chưa diễn tập khôi phục từ backup vật lý/PITR; snapshot JSON trong `.local/` chỉ đối chiếu toàn vẹn, không thay thế bản backup PostgreSQL có thể restore).
  - **Offline Sync:** `NOT VERIFIED` (ngoài phạm vi MVP).

---

## 3. Known Issues Cần Chấp nhận Trước Khi Freeze (`0` P0 · `0` P1)
1. **`KI-P2-003` (`P2`):** Mini Quiz chưa hiển thị `explanation_vi` sau khi nộp bài.
2. **Oversized Old Metadata:** Tài khoản test cũ (`7e94f8e5-...`, `9,556 bytes`) có thể gặp `HTTP 431` trên server `16KB` header nếu chưa dọn bản sao dư thừa theo [hsk1-oversized-metadata-remediation.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-oversized-metadata-remediation.md); tăng trưởng mới đã được chặn 100% ở `d68cf39`.
3. **Human Native-Speaker Review:** Chưa hoàn tất (`PENDING`).
4. **Backup / Restore Drill:** Chưa xác minh (`NOT VERIFIED`).

---

## 4. SHA Chính xác Đề xuất Đóng băng
- **Branch:** `preview/hsk1-full-curriculum`
- **Release Candidate SHA (Deployed Preview):** **`d68cf39eb2ad4a3ed19e483866321b4dd3c3ff3c`** (`d68cf39`)
- **Đề xuất Tag:** **`hsk1-rc1`**
- **Hồ sơ Checksums & Change-Control:** Lưu tại [docs/release/hsk1-freeze-plan.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-freeze-plan.md).

---

## 5. Những Quyết định Cuối Cần Bạn Phê duyệt
1. **Phê duyệt đóng băng Release Candidate `hsk1-rc1` tại commit `d68cf39`** (với các Known Issues & giới hạn `PRIVATE_INVITE_ONLY` đã nêu ở Mục 2 & 3).
2. **Phê duyệt gắn & push tag `hsk1-rc1`** trỏ tới `d68cf39` (chỉ thực hiện khi bạn ra lệnh).
3. *(Tách biệt, trước mọi kế hoạch Production)* **Xác nhận kiểm tra Backup/PITR & Restore Drill trên Supabase Dashboard** và quyết định có cần dọn `user_metadata` bản sao cho tài khoản test cũ `7e94f8e5-...` hay không.
