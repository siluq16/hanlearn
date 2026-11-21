# HanLearn – Release Candidate Freeze Plan (`hsk1-rc1`)

**Ngày cập nhật:** 2026-11-21  
**Trạng thái hiện tại:** **`RELEASE CANDIDATE FROZEN (PRIVATE_INVITE_ONLY)`** — Tag `hsk1-rc1` (`3c46acbfc41891afd63d596f34c4032351516972`) đã tạo và push lên `origin`, trỏ tới **`d68cf39eb2ad4a3ed19e483866321b4dd3c3ff3c`** (`d68cf39`). *(Không phải `PRODUCTION RELEASED` hoặc `PUBLIC RELEASED`).*

---

## 1. Thông tin Release Candidate Đề xuất Đóng băng
- **Nhánh Git:** `preview/hsk1-full-curriculum`
- **Commit SHA Đề xuất Đóng băng (Deployed Preview SHA):** **`d68cf39eb2ad4a3ed19e483866321b4dd3c3ff3c`** (`d68cf39`)
- **Đề xuất Tên Tag RC:** **`hsk1-rc1`** *(trỏ tới `d68cf39eb2ad4a3ed19e483866321b4dd3c3ff3c` khi được phê duyệt)*
- **Vercel Deployment đã Ready:** `CfSsCaJt1TkpktXCcjV5fh5B7nJM` (`state: "success"`, Deployment Protection SSO bật)
- **Supabase Development Target:** `hhgxrjqkuwdgurphopok` (`PostgreSQL 17.11`)
- **Migration Baseline (`001–012`):** `202611120001` $\rightarrow$ `202611200012` (`12/12` đồng bộ local & remote, `0` schema drift)

---

## 2. SHA256 Checksums Giáo trình, Đề kiểm tra & Schema tại `d68cf39`

| Tệp tin | SHA256 Checksum |
| :--- | :--- |
| `content/hsk_library/hsk1_exam_2025_official_300.json` | `C72A3C99A4035B0C18EE012ECBEDBB3227531B93EAD11AC1E6F6C9D54C7D6996` |
| `content/hsk_library/practice_bank.json` | `9C757F89AA0BE281320D8AD7C70F5B8D531308DA6C09BB396C16706E018FAFA3` |
| `content/hsk_library/module0_pinyin.json` | `2ED807176F194DD5EDDB2CD6A692D0B0F0812A8BE85AA5FFF85951D33FA2BB86` |
| `content/hsk_library/unit_tests/hsk1_unit_test_01.json` | `2E4F65E4782C0F62E6BE9630B91ED8FD51B95E17F8B76F6BE1E412C9205C1F2C` |
| `content/hsk_library/unit_tests/hsk1_unit_test_02.json` | `6E8AF4FBC0D9FBCCBC45FC37BF80ADB35BC8524BB33736E6E4BB280419734DD8` |
| `content/hsk_library/unit_tests/hsk1_unit_test_03.json` | `2B03BCF0EEB98F142D2C9E04B194D2419114571A402EBBCE93B504F285615119` |
| `content/hsk_library/unit_tests/hsk1_unit_test_04.json` | `47E8E231BF4B0614795C7D3AE108BF3520BA49397F38FCC0ADBD2A6C2164416C` |
| `content/hsk_library/unit_tests/hsk1_unit_test_05.json` | `5489CCC3164FE732E5B91536E7CBF9A75CF64B4E8C6C5BEC9218B9B20079AEAB` |
| `content/hsk_library/unit_tests/hsk1_unit_test_06.json` | `6C336A8B23D63449F760E4B9AEE99AA0715FBB68D7D76354F19EC6504F120C58` |
| `src/features/quizzes/quiz-revisions.ts` | `FA14B730D08277C9281B6568F01064BECACD1D02A47838D2E3AAEF708F561240` |
| `docs/postgres_schema.sql` | `B51E906E66C49DDE3A45289E18C20348BE0CB3943D3850F9063A508CA0F86566` |

---

## 3. Kết quả Kiểm thử Tự động & Known Issues Đã Ghi nhận

- **Automated Tests tại `d68cf39`:** `npm run typecheck` (**PASS**), `npm run test:contracts` (**PASS**), `npx vitest run` (**55/55 files · 506/506 tests PASS**), `npx eslint` (**0 errors**), `npm run build` (**PASS · 25 routes**), `npm run test:security` (**PASS · 545 source files + `.next/static`**), `sprint8o_post_deploy_smoke.mjs` (**PASS**).
- **Known Issues Chấp nhận / Theo dõi (`0` P0 · `0` P1):**
  1. **`KI-P2-003` (`P2`):** Mini Quiz chưa hiển thị `explanation_vi` sau khi nộp bài.
  2. **Oversized Old Metadata (`P2` cho tài khoản cũ):** Tài khoản test cũ (`7e94f8e5-...`, `9,556 bytes`) có thể gặp `HTTP 431` nếu chưa thực hiện cleanup theo [hsk1-oversized-metadata-remediation.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-oversized-metadata-remediation.md); tăng trưởng mới đã bị chặn 100%.
  3. **Human Native-Speaker Linguistic & Acoustic Review:** `PENDING` (chính sách `PRIVATE_INVITE_ONLY`).
  4. **Supabase Backup / Restore Drill:** `NOT VERIFIED` (bắt buộc kiểm tra trước khi xét Production).

---

## 4. Chính sách Change-Control Sau Khi Freeze (`hsk1-rc1`)
1. **Đóng băng nội dung & tính năng:** Không thay đổi nội dung giáo trình HSK 1, không chỉnh sửa `private.curriculum_quiz_keys`, không thêm tính năng mới hay mở Sprint mới trên nhánh RC.
2. **Quy trình Hotfix sau Freeze:** Chỉ chấp nhận hotfix đối với lỗi **`P0` hoặc `P1`** có bằng chứng tái hiện rõ ràng, được chủ dự án phê duyệt riêng, có diff tối thiểu và phải vượt qua đầy đủ `typecheck`, `test:security`, `test:contracts`, `vitest`, `eslint`, `build`.
3. **Rollback:** Đánh giá dùng `HANLEARN_ASSESSMENT_KEY_REVISION=1` (zero-data-loss); từ vựng bảo toàn 43 Pilot UUIDs và không xóa từ đã có `review_cards`.
