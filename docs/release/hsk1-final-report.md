# HanLearn – HSK 1 Release Candidate Freeze Final Report (`hsk1-rc1`)

**Ngày đóng băng:** 2026-11-21  
**Tình trạng đóng băng Release Candidate:** **`RELEASE CANDIDATE FROZEN (PRIVATE_INVITE_ONLY)`**  
*(Không phải `PRODUCTION RELEASED` hoặc `PUBLIC RELEASED` — phạm vi chỉ áp dụng cho Release Candidate nội bộ trên Preview & Supabase Development).*

---

## 1. Thông tin Tag & Baseline Đóng băng
- **Tag Name:** **`hsk1-rc1`** (annotated tag object: `3c46acbfc41891afd63d596f34c4032351516972`)
- **Tag Target SHA:** **`d68cf39eb2ad4a3ed19e483866321b4dd3c3ff3c`** (`d68cf39`)
- **Remote Tag Verification:** `git ls-remote --tags origin hsk1-rc1` xác nhận `3c46acbfc41891afd63d596f34c4032351516972 refs/tags/hsk1-rc1` trên `github.com:siluq16/hanlearn.git`, giải mã `hsk1-rc1^{commit}` = `d68cf39eb2ad4a3ed19e483866321b4dd3c3ff3c`.
- **Vercel Deployment SHA:** `d68cf39eb2ad4a3ed19e483866321b4dd3c3ff3c` (`CfSsCaJt1TkpktXCcjV5fh5B7nJM`, `state: "success"`, Deployment Protection SSO bật).
- **Migration Baseline (`hhgxrjqkuwdgurphopok`):** `202611120001` $\rightarrow$ `202611200012` (`001–012`, `12/12` đồng bộ, `0` schema drift).
- **Freeze Checksums:** Lưu đầy đủ trong [docs/release/hsk1-freeze-plan.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-freeze-plan.md).

---

## 2. Bằng chứng Kiểm thử & Manual UAT
- **Automated Gate (`d68cf39`):** `npm run typecheck` **PASS**, `npm run test:contracts` **PASS**, `npx vitest run` **PASS (`55 / 55` files · `506 / 506` tests)**, `npx eslint` **PASS (`0` errors)**, `npm run build` **PASS (`25` routes)**, `npm run test:security` **PASS (`545` files + `.next/static`)**, Cloud RLS/grading smoke test **PASS**.
- **Manual UAT Evidence Status:** Chủ dự án đã trực tiếp học thử trên Vercel Preview `d68cf39` và xác nhận **không phát hiện lỗi**. Chi tiết phân biệt giữa Automated Coverage, Owner Trial (`NO DEFECTS OBSERVED`), và các phần vẫn `PENDING` / `NOT VERIFIED` được ghi nhận trung thực tại [docs/release/hsk1-uat-test-cases.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-uat-test-cases.md).

---

## 3. Accepted Known Issues & Production Readiness Limitations
- **Accepted Known Issues (áp dụng cho RC nội bộ `PRIVATE_INVITE_ONLY`, `0` P0 · `0` P1):**
  1. `KI-P2-003` (`P2`): Mini Quiz chưa hiển thị `explanation_vi` sau khi nộp bài.
  2. Oversized Old Metadata: Tài khoản test cũ (`7e94f8e5-...`, `9,556 B`) có thể gặp `HTTP 431` nếu chưa dọn bản sao dư thừa (tăng trưởng mới đã bị chặn 100%).
  3. **Human Native-Speaker Linguistic & Acoustic Review:** `PENDING`.
  4. **Supabase Backup / Restore Drill:** `NOT VERIFIED`.
  5. **Offline Sync:** `NOT VERIFIED` (ngoài phạm vi MVP).
- **Production Readiness Limitations:** Không đủ điều kiện phát hành Production hoặc `PUBLIC_RELEASE` cho đến khi hoàn tất Human Linguistic/Audio Review, Third-Party Rights Clearance, Supabase Backup/Restore Drill và kế hoạch vận hành tại [docs/release/hsk1-operational-backlog.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-operational-backlog.md).
