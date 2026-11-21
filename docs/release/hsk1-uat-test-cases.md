# HanLearn – Bộ Test Cases Pilot UAT Chuẩn hóa (HSK 1)

**Kế thừa từ:** [docs/sprint8o/pilot-uat-checklist.md](file:///d:/nam4/prj/HanLearn/docs/sprint8o/pilot-uat-checklist.md)  
**Cập nhật:** 2026-11-21 — Ghi nhận trung thực kết quả nghiệm thu trước Freeze tại Preview SHA **`d68cf39`**.

> **Nguyên tắc phân biệt bằng chứng:**
> - **Automated Evidence (`PASS`):** Kiểm chứng trực tiếp bằng script/test tự động (`Vitest`, `check-anonymous-api.mjs`, `sprint8o_post_deploy_smoke.mjs`, Cloud SQL).
> - **Owner Trial (`OWNER TRIAL: NO DEFECTS OBSERVED`):** Chủ dự án đã trực tiếp học thử trên Vercel Preview `d68cf39` và xác nhận không phát hiện lỗi; **không suy diễn** thành việc mọi bước nhỏ lẻ đã được ghi log chi tiết từng dòng.
> - **Chưa có bằng chứng độc lập (`NOT VERIFIED` / `PENDING`):** Giữ nguyên trạng thái chưa nghiệm thu.

---

| Test Case ID | Nhóm / Feature | Automated Coverage | Manual UAT / Human Evidence | Status |
| :--- | :--- | :--- | :--- | :---: |
| **UAT-A01** | **A. Auth & Vercel SSO** | Probe HTTPS xác nhận SSO bật (`HTTP 302` $\rightarrow$ `sso-api`) | Chủ dự án đã vượt qua SSO và học thử trên Preview `d68cf39` (không lỗi) | **OWNER TRIAL: NO DEFECTS** |
| **UAT-A02** | **A. Auth – Đăng nhập / Reload / Đăng xuất** | Smoke test local $\rightarrow$ Cloud `/dashboard` `200`, logout `307` | Chủ dự án sử dụng bình thường trên Preview `d68cf39` | **PASS (Automated) · OWNER TRIAL: NO DEFECTS** |
| **UAT-A03** | **A. Auth – Anonymous & Cross-User** | `check-anonymous-api.mjs` PASS (`401` / `406`), `tables_without_rls = 0` | Không cần manual | **PASS (Automated)** |
| **UAT-B01** | **B. Module 0 – Pinyin & Audio** | `sprint8n-content-quality-audit.test.ts` & `mandarin-speech.test.ts` PASS | Chủ dự án học thử không báo lỗi; **Human native-speaker acoustic review: `PENDING`** | **OWNER TRIAL: NO DEFECTS · Native Review PENDING** |
| **UAT-C01** | **C. Curriculum – 6 Units, 32 Bài, 10 Chặng** | `lessons.test.ts`, `lesson-queries.test.ts`, `sprint8i-course-architecture.test.ts` PASS | Chủ dự án học thử không báo lỗi; log từng chặng lẻ của cả 32 bài: `NOT VERIFIED` | **PASS (Automated) · OWNER TRIAL: NO DEFECTS** |
| **UAT-D01** | **D. Vocabulary 300 từ & Pilot UUID** | `sprint8o-assessment-and-catalog-integrity.test.ts` + Cloud SQL (`301` rows, `0` orphans) + SSR `不/只` `200` | Chủ dự án học thử không báo lỗi | **PASS (Automated) · OWNER TRIAL: NO DEFECTS** |
| **UAT-D02** | **D. SRS Review 2 Chiều & Bảo toàn Thẻ** | Checksum `60` thẻ / `89` sự kiện bất biến 100%, concurrency tests PASS, SSR `/review` `200` | Chủ dự án học thử không báo lỗi | **PASS (Automated) · OWNER TRIAL: NO DEFECTS** |
| **UAT-E01** | **E. Practice Center – 6 Kỹ năng (56 Sets)** | `listening.test.ts`, `speaking.test.ts`, `shared-stimulus-practice.test.ts` PASS, SSR `/practice` & `/listening` `200` | Chủ dự án học thử không báo lỗi; Speaking ghi rõ tự đánh giá | **PASS (Automated) · OWNER TRIAL: NO DEFECTS** |
| **UAT-F01** | **F. Assessment – Mini Quiz & Unit Test Rev 1/2** | `506/506` Vitest + Cloud RPC (`5/20` toàn A, `20/20` đúng, `PT409`, `0` leakage, fail-closed) PASS | Chủ dự án học thử không báo lỗi | **PASS (Automated) · OWNER TRIAL: NO DEFECTS** |
| **UAT-F02** | **F. Assessment – Mock Exam (40 câu)** | `hsk1-full-curriculum-mock-exam.test.ts` PASS | Chưa có log làm hết 40 câu thủ công trên Preview | **PASS (Automated) · Manual Full-Exam NOT VERIFIED** |
| **UAT-G01** | **G. Dashboard & Progress** | Snapshot RPCs + `/dashboard` + `/roadmap` `200` PASS | Chủ dự án học thử không báo lỗi | **PASS (Automated) · OWNER TRIAL: NO DEFECTS** |
| **UAT-H01** | **H. Responsive, Offline Sync & Restore Drill** | Build 25 routes PASS | **Offline Sync:** `NOT VERIFIED` · **Backup/Restore Drill:** `NOT VERIFIED` | **NOT VERIFIED** |
