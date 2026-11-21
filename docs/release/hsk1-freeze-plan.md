# HanLearn – Release Candidate Freeze Plan (Phase 6)

**Trạng thái hiện tại:** **`ACCEPTANCE PENDING / READY FOR MANUAL UAT`** *(Chưa đủ điều kiện ghi `RELEASE FROZEN` vì còn chờ Manual Pilot UAT của bạn và nghiệm thu HTTPS Preview qua Vercel SSO).*

---

## 1. Release Candidate Dự kiến (Khi Đủ Điều kiện Freeze)
- **Đề xuất tên Git Tag RC:** `hsk1-rc1` *(chỉ tạo và push tag khi có phê duyệt Release Freeze riêng của bạn)*.
- **Release Candidate SHA dự kiến:** `111e16eab2735d85ffcf3e4c940405febc2b6a1c` (`111e16e`) — hoặc commit ngay sau khi xử lý xong bất kỳ lỗi P0/P1 nào phát sinh từ Manual UAT.
- **Database Migration Version:** `202611120001` $\rightarrow$ `202611200012` (`001–012`).
- **Checksum Nội dung & Core Files (SHA256 tại `111e16e`):**
  - `content/hsk_library/hsk1_exam_2025_official_300.json`: `C72A3C99A4035B0C18EE012ECBEDBB3227531B93EAD11AC1E6F6C9D54C7D6996`
  - `content/hsk_library/practice_bank.json`: `9C757F89AA0BE281320D8AD7C70F5B8D531308DA6C09BB396C16706E018FAFA3`
  - `content/hsk_library/unit_tests/hsk1_unit_test_01.json`: `2E4F65E4782C0F62E6BE9630B91ED8FD51B95E17F8B76F6BE1E412C9205C1F2C`
  - `src/features/quizzes/quiz-revisions.ts`: `FA14B730D08277C9281B6568F01064BECACD1D02A47838D2E3AAEF708F561240`

---

## 2. Điều kiện Bắt buộc Trước Khi Phê duyệt Freeze (`READY FOR FREEZE`)
1. Không còn lỗi **P0** hoặc **P1** chưa xử lý.
2. Bạn đã hoàn tất **Manual Pilot UAT** trên URL Vercel Preview (qua SSO) và xác nhận kết quả theo [hsk1-manual-uat.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-manual-uat.md).
3. Chấp nhận (hoặc xử lý) các Known Issues P2/P3 trong [hsk1-known-issues.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-known-issues.md).
4. Xác nhận trạng thái nội dung (`PRIVATE_INVITE_ONLY`, Human Review `PENDING`).
5. Có phương án backup PostgreSQL có thể restore trước mọi thay đổi Production.

---

## 3. Quy định Kiểm soát Thay đổi Sau Khi Freeze (Post-Freeze Change Control)
- Sau khi phê duyệt Freeze (`hsk1-rc1`):
  - **Đóng băng tính năng:** Không thêm tính năng mới, không chỉnh sửa cấu trúc giáo trình hay hoán vị đáp án.
  - **Chỉ cho phép Hotfix P0/P1:** Mọi thay đổi phải có phiếu lỗi P0/P1, diff tối thiểu, chạy lại kiểm thử tự động + SQL regression và được bạn phê duyệt riêng.
  - **Rollback / Recovery:**
    - Đánh giá (`Assessment`): đặt biến môi trường `HANLEARN_ASSESSMENT_KEY_REVISION=1` trên Vercel (zero-data-loss dual-revision rollback).
    - Danh mục từ vựng: giữ nguyên 43 Pilot UUID; chỉ gỡ từ mới khi chưa có `review_cards` tham chiếu ([docs/sprint8o/rollback-plan.md](file:///d:/nam4/prj/HanLearn/docs/sprint8o/rollback-plan.md)).
