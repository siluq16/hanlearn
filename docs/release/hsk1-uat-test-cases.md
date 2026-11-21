# HanLearn – Bộ Test Cases Pilot UAT Chuẩn hóa (HSK 1)

**Kế thừa từ:** [docs/sprint8o/pilot-uat-checklist.md](file:///d:/nam4/prj/HanLearn/docs/sprint8o/pilot-uat-checklist.md)  
**Cập nhật nghiệm thu:** 2026-11-21 — Chủ dự án đã trực tiếp học thử trên Vercel Preview (`d68cf39`) và xác nhận **không phát hiện lỗi trong quá trình sử dụng**.  
**Nguyên tắc trung thực:** Các nhóm có bằng chứng kiểm thử tự động + xác nhận trải nghiệm thực tế của chủ dự án được ghi nhận rõ phạm vi; các hạng mục chưa có log chi tiết từng bước hoặc chưa có con người chuyên môn kiểm định (như **Human Native-Speaker Linguistic Review**, **Supabase Backup/Restore Drill**) vẫn giữ nguyên **`NOT VERIFIED`** / **`PENDING`**.

---

| Test Case ID | Nhóm / Feature | Expected Result | Actual Result & Bằng chứng | Environment | Status | Tester | Date |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **UAT-A01** | **A. Auth & Vercel SSO** | Vượt qua Vercel SSO và mở `/login` | Chủ dự án đã truy cập và học thử thành công trên Vercel Preview (`d68cf39`); probe tự động xác nhận SSO bật (`HTTP 302`) | Vercel Preview (`d68cf39`) | **PASS** *(Owner Trial)* | Owner | 2026-11-21 |
| **UAT-A02** | **A. Auth – Đăng nhập / Reload / Đăng xuất** | Đăng nhập, reload, đăng xuất hoạt động; không `HTTP 431` | Chủ dự án sử dụng bình thường trên Preview; smoke test xác nhận `/dashboard` `200`, logout redirect `307` | Vercel Preview (`d68cf39`) + Cloud | **PASS** | Owner + Automated | 2026-11-21 |
| **UAT-A03** | **A. Auth – Anonymous & Cross-User** | Anon nhận `401`; `private` trả `406` | `check-anonymous-api.mjs` PASS 100%; `tables_without_rls = 0` | Cloud `hhgxrjqkuwdgurphopok` | **PASS** | Automated | 2026-11-21 |
| **UAT-B01** | **B. Module 0 – Pinyin & Audio** | Hiển thị 21 thanh mẫu, 36 vận mẫu, biến điệu; TTS `zh-CN` rõ | Chủ dự án học thử không phát hiện lỗi; **Human native-speaker acoustic review** vẫn **`PENDING`** | Vercel Preview (`d68cf39`) | **PASS** *(Owner Trial)* · Native Review **PENDING** | Owner | 2026-11-21 |
| **UAT-C01** | **C. Curriculum – 6 Units, 32 Bài, 10 Chặng** | Tải đúng, chuyển chặng & lưu tiến độ khi reload | Chủ dự án học thử không phát hiện lỗi; routes SSR & contracts PASS | Vercel Preview (`d68cf39`) | **PASS** *(Owner Trial)* | Owner | 2026-11-21 |
| **UAT-D01** | **D. Vocabulary 300 từ & Pilot UUID** | Đủ 300 từ HSK 1 + `越南` ngoài 300; Pilot UUID hoạt động | Chủ dự án học thử không phát hiện lỗi; `sprint8o_post_deploy_smoke.mjs` xác nhận `不, 只, 杯子, 大学生, 不客气` & Pilot UUID `200` | Vercel Preview (`d68cf39`) + Cloud | **PASS** | Owner + Automated | 2026-11-21 |
| **UAT-D02** | **D. SRS Review 2 Chiều & Bảo toàn Thẻ** | Không lộ đáp án mặt trước; không trùng thẻ; giữ lịch sử | Checksum `60` thẻ / `89` sự kiện bất biến 100%; SSR `/review` `200`; chủ dự án không thấy lỗi | Vercel Preview (`d68cf39`) + Cloud | **PASS** | Owner + Automated | 2026-11-21 |
| **UAT-E01** | **E. Practice Center – 6 Kỹ năng (56 Sets)** | Hiển thị câu hỏi, feedback tức thì, filter URL, Listening/Speaking | Chủ dự án học thử không phát hiện lỗi; `/practice` & `/listening` `200`; Speaking giữ rõ nhãn tự đánh giá | Vercel Preview (`d68cf39`) | **PASS** *(Owner Trial)* | Owner | 2026-11-21 |
| **UAT-F01** | **F. Assessment – Mini Quiz & Unit Test Rev 1/2** | Cân bằng Rev 2, bảo toàn Rev 1, chống nộp trùng `PT409`, `0` leakage | `506/506` Vitest + Cloud RPC smoke test PASS (`5/20` toàn A, `20/20` đúng, `PT409`); fail-closed authority verified | Vercel Preview (`d68cf39`) + Cloud | **PASS** | Owner + Automated | 2026-11-21 |
| **UAT-F02** | **F. Assessment – Mock Exam (40 câu)** | Hiển thị cấu trúc Nghe/Đọc, không lộ transcript Nghe 11–20 | Chủ dự án không báo lỗi; Vitest kiểm thử cấu trúc Mock Exam PASS | Vercel Preview (`d68cf39`) | **PASS** *(Automated + No defect in trial)* | Owner + Automated | 2026-11-21 |
| **UAT-G01** | **G. Dashboard & Progress** | Snapshot RPC, tiến độ, số từ mục tiêu (không tính `越南`) | Snapshot RPC & `/dashboard` & `/roadmap` `200` PASS | Vercel Preview (`d68cf39`) + Cloud | **PASS** | Owner + Automated | 2026-11-21 |
| **UAT-H01** | **H. Responsive, Offline Sync & Restore Drill** | Mobile/Desktop ổn định; Backup/Restore xác minh | Chủ dự án học thử không phát hiện lỗi UI/chức năng; **Offline Sync** & **Supabase Backup/Restore Drill** chưa chạy | — | **NOT VERIFIED** *(Offline Sync / Restore Drill)* | — | — |
