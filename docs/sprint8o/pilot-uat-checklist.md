# HanLearn – Pilot UAT Checklist & Bug Logging Guide (Module 0 $\rightarrow$ HSK 1)

**Phiên bản nghiệm thu:** Commit `111e16e` (`preview/hsk1-full-curriculum`)  
**Backend Development:** Supabase `hhgxrjqkuwdgurphopok` (Migrations `001–012` đã đồng bộ)  
**Lưu ý trạng thái trước UAT:**
- **HTTPS Preview URL:** Chưa được kiểm thử tự động do **Vercel Deployment Protection (SSO)** bật (`NOT VERIFIED` qua HTTP tự động) — cần bạn đăng nhập Vercel SSO trực tiếp trên trình duyệt khi mở URL Preview.
- **Backup & Restore:** Các file snapshot/checksum JSON trong `.local/` chỉ là bằng chứng đối chiếu toàn vẹn dữ liệu, **không thay thế bản backup PostgreSQL có thể restore** (`pg_dump` hoặc Supabase Dashboard backup/PITR).

---

## Phần 1: Checklist Pilot UAT (Học thử từ Module 0 đến HSK 1)

### A. Truy cập, Đăng nhập & Bảo mật (`PRIVATE_INVITE_ONLY`)
- [ ] Truy cập URL Vercel Preview trên trình duyệt (Desktop & Mobile), vượt qua Vercel SSO.
- [ ] Thử mở `/dashboard`, `/vocabulary`, `/review` khi chưa đăng nhập $\rightarrow$ chuyển hướng về `/login`, không lộ dữ liệu.
- [ ] Đăng nhập bằng tài khoản allowlisted của bạn $\rightarrow$ vào được `/dashboard`.
- [ ] Kiểm tra `/settings`: mục tiêu 60 phút/ngày, múi giờ `Asia/Ho_Chi_Minh`, lưu cấu hình và F5 reload vẫn giữ nguyên.

### B. Module 0 – Làm quen Pinyin & Phát âm (`/pinyin`)
- [ ] Mở `/pinyin`: kiểm tra bảng Thanh mẫu (21), Vận mẫu (36), Thanh điệu (4 thanh + thanh nhẹ) và quy tắc biến điệu (`你好`, `不`, `一`).
- [ ] Bấm phát âm (TTS / Audio) trên cả Desktop và Mobile (iOS/Android Chrome/Safari): nghe rõ, không lỗi đứng nút.
- [ ] Làm bài luyện phân biệt thanh điệu / âm dễ nhầm $\rightarrow$ phản hồi đúng/sai rõ ràng.

### C. Lộ trình học (`/roadmap`) & Bài học 10 chặng (`/lessons/[id]`, `/lessons/stage/[slug]`)
- [ ] Mở `/roadmap`: kiểm tra cấu trúc 6 Unit, 32 bài học + 6 Checkpoints, thanh tiến độ và trạng thái hoàn thành.
- [ ] Học thử tối thiểu các bài đại diện: **Bài 1**, **Bài 4**, **Bài 8**, **Bài 13**, **Bài 27**.
- [ ] Kiểm tra đủ **10 chặng** trong Lesson Reader (chuyển chặng mượt, hiển thị từ vựng chuẩn Sprint 8N/8O: `不`, `只 zhī`, `杯子`, `大学生`, `不客气`, `越南`).
- [ ] Đánh dấu xác nhận đã học (`mark_lesson_studied`) và F5 reload $\rightarrow$ tiến độ vẫn còn.

### D. Mini Quiz & Chống thiên lệch đáp án Revision 2 (`/lessons/[id]/quiz`)
- [ ] Mở Mini Quiz của Bài 1 hoặc Bài 2: quan sát vị trí đáp án đúng phân bố đều A/B/C/D (không còn toàn bộ là A).
- [ ] Kiểm tra DevTools Network / Page Source: không thấy `correct_index` hoặc `explanation_vi` trước khi nộp bài.
- [ ] Thử chọn toàn bộ đáp án A và nộp $\rightarrow$ điểm thấp (~25%), trạng thái `Chưa đạt`.
- [ ] Làm lại một lượt mới với đáp án đúng $\rightarrow$ đạt `8/8` (`Đạt`), F5 reload vẫn giữ kết quả.
- [ ] Mở lại một attempt **Revision 1 cũ** trong lịch sử (nếu có) $\rightarrow$ lựa chọn hiển thị và kết quả chấm vẫn khớp chính xác với Revision 1.

### E. Thư viện Từ vựng 300 từ (`/vocabulary` & `/vocabulary/[id]`)
- [ ] Mở `/vocabulary`: xác nhận hiển thị đủ **300 từ HSK 1**, tìm kiếm theo chữ Hán, Pinyin và nghĩa tiếng Việt.
- [ ] Kiểm tra trực tiếp 5 từ trọng điểm:
  - `不` (`bù`): `"Không (phó từ phủ định); đọc biến điệu là bú trước thanh 4"` (mở `/vocabulary/df6876e3-e013-584d-b584-64c5d6f29048` phải ra HTTP 200).
  - `只` (`zhī`): `"con, chiếc (lượng từ cho động vật); phân biệt với phó từ zhǐ (chỉ)"`.
  - `杯子` (`bēizi`), `大学生` (`dàxuéshēng`), `不客气` (`bú kèqi`).
- [ ] Mở trang chi tiết của cả từ Pilot cũ (UUID giữ nguyên) và từ mới (257 từ) $\rightarrow$ không lỗi 404.

### F. Ôn tập SRS (`/review`)
- [ ] Mở `/review`: kiểm tra số thẻ đến hạn (`due_count`) khớp với Dashboard.
- [ ] Kiểm tra thẻ Việt $\rightarrow$ Hán: mặt trước **không lộ** Hán tự hay Pinyin.
- [ ] Chấm thử vài thẻ (Again / Hard / Good / Easy), F5 reload $\rightarrow$ tiến độ thẻ được lưu, **không tạo thẻ trùng lặp** cho cùng một từ & chiều thẻ.

### G. Practice Center (`/practice` & `/practice/[setId]`)
- [ ] Kiểm tra 6 nhóm kỹ năng: Vocabulary (12), Grammar (10), Listening (10), Speaking (8), Reading (8), Dialogue (8).
- [ ] Mở Listening (`ps-listen-01..10`, đặc biệt câu `q6`): kiểm tra âm thanh phát đúng `audioText`, không lộ transcript trước khi trả lời.
- [ ] Bấm quay lại danh sách Practice sau khi lọc `skill`, `unit`, `diff`, `q` $\rightarrow$ giữ nguyên bộ lọc trên URL.

### H. Unit Tests (`/exam/unit/[1..6]`) & Đề thi thử HSK 1 (`/exam/hsk1`)
- [ ] Làm thử ít nhất 1 Unit Test (`Unit 1` hoặc `Unit 6`): kiểm tra 20 câu, câu Đúng/Sai hiển thị theo thứ tự `["Đúng", "Sai"]`, không lộ đáp án trước khi nộp, nộp xong hiển thị giải thích tiếng Việt.
- [ ] Mở Đề thi thử HSK 1 (40 câu): kiểm tra câu 11–20 phần Nghe không lộ transcript, câu 31–40 phần Đọc hiển thị rõ ràng.

---

## Phần 2: Quy chuẩn Ghi nhận Lỗi Thực tế (Severity P0–P3)

### Thang phân loại mức độ nghiêm trọng
| Mức độ | Định nghĩa | Ví dụ điển hình |
| :---: | :--- | :--- |
| **P0 (Blocker)** | Mất dữ liệu học tập, hỏng tiến độ SRS, rò rỉ đáp án/dữ liệu người dùng khác, sập trang (`500`), không đăng nhập/nộp bài được. | Nộp đúng hết bị chấm 0 điểm; thẻ SRS bị nhân đôi/reset; user A thấy dữ liệu user B; trang `/review` crash. |
| **P1 (Major)** | Chức năng chính chạy sai, chấm điểm sai câu hỏi, dạy sai kiến thức tiếng Trung (sai Pinyin/nghĩa/audio), hoặc luồng học bị kẹt. | Audio phát sai câu; câu hỏi có 2 đáp án đúng hoặc không có đáp án đúng; nút "Hoàn thành bài" không lưu sau F5. |
| **P2 (Medium)** | Lỗi UX/hiển thị ảnh hưởng trải nghiệm nhưng vẫn có thể học tiếp, bố cục vỡ trên mobile, câu giải thích khó hiểu. | Text tràn màn hình mobile; bộ lọc Practice mất khi quay lại; giải thích tiếng Việt thiếu dấu/chưa tự nhiên. |
| **P3 (Minor)** | Lỗi thẩm mỹ nhỏ, chính tả nhẹ, khoảng cách/màu sắc chưa đều, đề xuất cải thiện nhỏ. | Sai khoảng trắng, icon lệch nhẹ, wording nút bấm có thể mượt hơn. |

### Mẫu Phiếu Ghi nhận Lỗi (Copy cho mỗi lỗi phát hiện khi UAT)

```markdown
### [MÃ LỖI: UAT-00X] <Tiêu đề ngắn gọn>
- **Severity:** P0 / P1 / P2 / P3
- **Môi trường:** Vercel Preview (`111e16e`) · Thiết bị (Mobile/Desktop) · Trình duyệt
- **Trang / URL:** (ví dụ: `/lessons/l-hsk1-004/quiz` hoặc `/review`)
- **Tài khoản test:** (chỉ ghi tên vai trò như `owner` / `test-learner`, không ghi mật khẩu)
- **Các bước tái hiện:**
  1. ...
  2. ...
  3. ...
- **Kết quả kỳ vọng:** ...
- **Kết quả thực tế:** ...
- **Bằng chứng đính kèm:** (Ảnh chụp màn hình / Console error / Network status code / Request ID)
```
