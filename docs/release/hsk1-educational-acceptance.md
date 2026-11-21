# HanLearn – Educational Acceptance Review (Phase 4)

**Cơ sở đánh giá:** Kế thừa kiểm toán sư phạm Sprint 8N ([docs/content-audit/sprint8n-learning-experience.md](file:///d:/nam4/prj/HanLearn/docs/content-audit/sprint8n-learning-experience.md)) và Sprint 8O ([docs/sprint8o/assessment-permutation-design.md](file:///d:/nam4/prj/HanLearn/docs/sprint8o/assessment-permutation-design.md)).

---

## 1. Phân loại Trạng thái Kiểm định Nội dung & Sư phạm

| Cấp độ kiểm định | Trạng thái | Ghi chú minh bạch |
| :--- | :---: | :--- |
| **Structural Content** | **PASS** | Đủ Module 0 (`21` thanh mẫu, `36` vận mẫu), `6` Units, `32` bài học + `6` Checkpoints (`10` chặng/bài), `300` từ HSK 1 (`+ 1` từ bổ trợ `越南`), `56` Practice Sets (`381` câu), `6` Unit Tests (`120` câu), `1` Mock Exam (`40` câu). |
| **Automated Content QA** | **PASS** | `504/504` Vitest tests kiểm tra schema, không trùng `choices`, phân bố đáp án Rev 2 cân bằng `[107, 107, 107, 107]`, không có `3` đáp án giống nhau liên tiếp, nghĩa chuẩn `只 (zhī)` và biến điệu `不 (bù)`. |
| **AI Linguistic Review** | **COMPLETED (Sprint 8N/8O)** | Đã rà soát toàn bộ Pinyin, nghĩa Việt, ví dụ, distractors và phụ thuộc từ vựng Unit 1 $\rightarrow$ Unit 6 bằng công cụ hỗ trợ AI. |
| **Human Linguistic Review** | **PENDING** | Chưa có giáo viên / chuyên gia tiếng Trung độc lập ký xác nhận ngôn ngữ học cho toàn bộ giáo trình. |
| **Human Audio Verification** | **PENDING** | Đã chuẩn hóa ánh xạ *hūdúyīn* cho Web Speech `zh-CN` trên code, nhưng chưa có người nghe trực tiếp kiểm tra phát âm trên nhiều thiết bị thực tế. |
| **Human Learner Acceptance** | **PENDING** | Chờ bạn (và/hoặc học viên pilot trong allowlist) học thử qua [hsk1-manual-uat.md](file:///d:/nam4/prj/HanLearn/docs/release/hsk1-manual-uat.md). |

---

## 2. Đánh giá 10 Câu hỏi Trải nghiệm Người mới Học từ Số 0

1. **Người mới có hiểu Pinyin không?** **Đạt mức cấu trúc (chờ Human UAT):** Module 0 trình bày đủ 21 thanh mẫu, 36 vận mẫu, 4 thanh + thanh nhẹ, biến điệu `一/不` và quy tắc `j, q, x, y + ü`, kèm phát âm theo âm hô độc (*hūdúyīn*).
2. **Bài học có giới thiệu kiến thức trước khi kiểm tra không?** **Có:** Mỗi bài đi theo trình tự Chặng 0 (`warmup`) $\rightarrow$ Chặng 1 (`1_vocab_core`) $\rightarrow$ Chặng 2 (`vocab_practice`) $\rightarrow$ Chặng 3 (`grammar_core`) $\rightarrow$ Chặng 4 (`grammar_practice`) trước khi vào Hội thoại, Đọc hiểu và Mini Quiz (đã vá lỗ hổng phụ thuộc từ số đếm/đại từ ở Bài 1 và Bài 4 trong Sprint 8N).
3. **Các chặng có hợp lý về thứ tự và thời lượng không?** **Có:** Mô hình 10 chặng chia nhỏ tải nhận thức (cognitive load ~53–60 từ mỗi Unit, mục tiêu 60 phút/ngày).
4. **Hướng dẫn có rõ ràng bằng tiếng Việt không?** **Có (chờ Human UAT):** Toàn bộ đề mục, hướng dẫn làm bài, thông báo lỗi và giải thích đáp án đều bằng tiếng Việt.
5. **Ví dụ có phù hợp trình độ không?** **Có (chờ Human Review):** Ví dụ bám sát từ vựng HSK 1 và đã loại bỏ các cụm danh từ cụt gây hiểu nhầm ở bài luyện nghe.
6. **Câu hỏi có một đáp án đúng rõ ràng không?** **Có (Automated QA PASS):** Đã xử lý các câu đa nghĩa/mơ hồ ở Sprint 8N và cân bằng vị trí đáp án `[107, 107, 107, 107]` ở Sprint 8O.
7. **Phản hồi khi trả lời sai có giúp học viên hiểu lý do không?** **Có:** Các bài Practice, Unit Tests và Mock Exam đều hiển thị `explanation_vi` sau khi kiểm tra/nộp bài. *(Lưu ý: Mini Quiz hiện hiển thị đúng/sai từng câu, chưa mở giải thích chi tiết sau nộp).*
8. **SRS có giúp ôn lại đúng kiến thức không?** **Có:** Áp dụng SM-2 hai chiều (`hanzi_to_vi`, `vi_to_hanzi`), mặt trước `vi_to_hanzi` đã lọc bỏ Hán tự/Pinyin để không lộ đáp án.
9. **Người học có biết tiếp tục bài nào không?** **Có:** Dashboard và Roadmap hiển thị bài học tiếp theo chưa hoàn thành, kết hợp kế hoạch ngày 60 phút.
10. **Có nội dung nào gây hiểu nhầm hoặc làm gián đoạn quá trình học không?** **Chưa phát hiện thêm P0/P1 ở tầng dữ liệu**; tính năng Speaking được trình bày minh bạch là **luyện nói tự đối chiếu** (không chấm điểm phát âm tự động). Cần **Manual Pilot UAT** để xác nhận trên trải nghiệm thực tế.
