# HanLearn – Hướng dẫn Nghiệm thu Thủ công (Manual Pilot UAT)

**Mục tiêu:** Bạn tự trải nghiệm học thử từ Module 0 đến HSK 1 trên môi trường Vercel Preview để xác nhận chất lượng sư phạm, âm thanh và luồng sử dụng thực tế trước khi quyết định đóng băng Release Candidate.

---

## 1. Thông tin Truy cập
- **URL Vercel Preview:** `https://hanlearn-git-preview-hsk1-full-curriculum-siluq16s-projects.vercel.app`
- **Bước qua Vercel SSO:** Khi mở URL, Vercel sẽ chuyển hướng sang màn hình xác thực Vercel (`Deployment Protection`). Hãy đăng nhập bằng tài khoản Vercel của bạn để vào trang `/login` của HanLearn.
- **Tài khoản HanLearn:** Đăng nhập bằng tài khoản đã được cấp quyền trong `private.allowed_learners` (không dùng chung tài khoản với người khác).

---

## 2. Lộ trình Học thử Từng bước (Đánh dấu `[PASS]` hoặc `[FAIL]`)

### Hành trình 1: Đăng nhập & Thiết lập (`/login`, `/settings`, `/dashboard`)
1. Đăng nhập thành công $\rightarrow$ vào `/dashboard`.
2. Nhấn **F5** để tải lại trang $\rightarrow$ vẫn giữ nguyên phiên đăng nhập.
3. Vào `/settings` $\rightarrow$ kiểm tra mục tiêu 60 phút/ngày, múi giờ `Asia/Ho_Chi_Minh`.
   - **Kết quả của bạn:** `[ ] PASS` · `[ ] FAIL`

### Hành trình 2: Module 0 – Pinyin (`/pinyin`)
1. Mở `/pinyin`, bấm nghe thử ít nhất 5 thanh mẫu (`b, p, q, zh, x`), 5 vận mẫu (`a, u, ü, ian, uai`) và 4 thanh điệu + biến điệu `一 / 不`.
2. Đọc phần giải thích quy tắc `j, q, x, y + ü`: có dễ hiểu cho người mới bắt đầu không?
3. Kiểm tra trên cả **Desktop** và **Mobile** (nếu có).
   - **Kết quả của bạn:** `[ ] PASS` · `[ ] FAIL`

### Hành trình 3: Lộ trình & Bài học 10 Chặng (`/roadmap`, `/lessons/stage/...`)
1. Mở `/roadmap`, vào học thử các bài đại diện: **Bài 1, Bài 4, Bài 8, Bài 13, Bài 27, Bài 32**.
2. Đi qua đủ 10 chặng của ít nhất 2 bài $\rightarrow$ kiểm tra chuyển chặng, bài tập tương tác, nút xác nhận đã học, rồi **F5 reload**.
3. Tự hỏi: *"Nếu là người mới, mình có biết bước tiếp theo cần bấm nút nào không?"*
   - **Kết quả của bạn:** `[ ] PASS` · `[ ] FAIL`

### Hành trình 4: Mini Quiz Revision 2 & Chống đoán mò (`/lessons/[id]/quiz`)
1. Vào Mini Quiz của **Bài 2**: thử chọn toàn bộ đáp án **A** rồi nộp $\rightarrow$ phải **Chưa đạt** (~25%).
2. Làm lại lượt mới chọn đáp án đúng $\rightarrow$ phải **Đạt (8/8)**. **F5 reload** $\rightarrow$ lịch sử và tiến độ bài học vẫn còn.
   - **Kết quả của bạn:** `[ ] PASS` · `[ ] FAIL`

### Hành trình 5: Từ vựng 300 từ & Ôn tập SRS (`/vocabulary`, `/review`)
1. Mở `/vocabulary`, tìm 5 từ: `不`, `只`, `杯子`, `大学生`, `不客气` $\rightarrow$ kiểm tra Pinyin và nghĩa tiếng Việt.
2. Mở `/vocabulary/df6876e3-e013-584d-b584-64c5d6f29048` (`不`) $\rightarrow$ trang chi tiết mở bình thường.
3. Mở `/review`: kiểm tra thẻ Việt $\rightarrow$ Hán không lộ chữ Hán/Pinyin ở mặt trước; lật thẻ và đánh giá 2–3 thẻ; **F5 reload** xem số thẻ còn lại cập nhật đúng không.
   - **Kết quả của bạn:** `[ ] PASS` · `[ ] FAIL`

### Hành trình 6: Practice Center, Unit Test & Mock Exam (`/practice`, `/exam`)
1. Vào `/practice`: thử lọc theo kỹ năng & Unit, mở một bài Listening (ví dụ `ps-listen-01` câu `q6`) kiểm tra âm thanh và nút quay lại giữ nguyên bộ lọc.
2. Vào `/exam/unit/1`: làm thử hoặc kiểm tra 20 câu (chú ý câu Đúng/Sai hiển thị `Đúng / Sai`), nộp bài xem giải thích.
3. Vào `/exam/hsk1`: kiểm tra nhanh câu 11–20 Nghe không lộ transcript.
   - **Kết quả của bạn:** `[ ] PASS` · `[ ] FAIL`

---

## 3. Cách Ghi nhận & Báo lỗi Cho Antigravity
Khi phát hiện bất kỳ lỗi nào, hãy chụp ảnh màn hình (hoặc copy lỗi Console/Network nếu có) và gửi lại theo mẫu ngắn gọn:
```text
- Trang / URL: ...
- Mức độ dự kiến: P0 (sập/mất dữ liệu/chấm sai) | P1 (lỗi học/sai tiếng Trung) | P2 (UI/UX) | P3 (nhỏ)
- Bạn đã bấm gì (1, 2, 3): ...
- Điều gì xảy ra (Thực tế vs Kỳ vọng): ...
```

## 4. Xác nhận Hoàn tất Nghiệm thu
Sau khi học thử xong, nếu bạn chấp nhận kết quả, hãy nhắn lại:
> **"Tôi xác nhận đã hoàn tất Manual Pilot UAT trên Preview `111e16e`: [PASS / có danh sách lỗi kèm theo]."**
