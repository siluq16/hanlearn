# Biên bản xác nhận — mẫu trống

Không ký trong tracked template. Copy vào nơi làm việc local được kiểm soát theo README; mỗi vai trò dùng bản riêng nếu nhiều người. Không điền tên thay người thực hiện.

- Package ID: hanlearn-pilot-hsk1-v1
- Draft revision: 3
- Manifest SHA-256: __________________ (copy nguyên văn từ SOURCE_SNAPSHOT sau khi kiểm bytes)
- Package snapshot SHA-256: __________________
- Tên file sổ quyết định / phiên bản / SHA-256 của file sổ đã chốt: __________________
- Vai trò/phạm vi và năng lực người duyệt: __________________
- Bằng chứng ủy quyền reviewer / người phụ trách xác nhận: __________________
- Họ tên thực tế: __________________
- Ngày giờ thực tế kèm múi giờ: __________________
- Kết luận phạm vi: **PENDING** (chỉ thay khi người duyệt thật quyết định PASS / NEEDS_FIX / PENDING)
- Số stable IDs đã kiểm / IDs chưa kiểm hoặc còn tranh luận: __________________
- Tham chiếu bằng chứng và ghi chú (không có đáp án/explanation riêng): __________________
- Chữ ký tay trên bản in hoặc chữ ký điện tử theo quy trình được chấp thuận: __________________

## Phạm vi cần có người ký

| Phạm vi | Stable IDs tương ứng | Trạng thái ban đầu | Người ký / ngày |
| --- | --- | --- | --- |
| Ngôn ngữ Trung–Việt | 44 vocabulary, 12 grammar, 29 sections; `focus/pinyin`, `focus/sandhi`, `focus/numerals-classifiers`, `focus/dialogues` | PENDING | |
| Sư phạm và trình tự | 4 lessons, 4 quiz-level rows; `focus/lesson-3`, `focus/changed-14` | PENDING | |
| Quiz công khai | 24 question UUIDs, focus/l2-q1 | PENDING | |
| Duyệt private | 24 private/UUID attestations, focus/private-24; chỉ tham chiếu ghi chú restricted nếu có | PENDING | |
| Syllabus/nguồn/sense | 3 ancestors và evidence của từng word/grammar | PENDING | |
| Quyền sử dụng/attribution | 6 rights rows; giấy phép/phạm vi và attribution cuối cùng | PENDING | |
| Quản lý private store | Quyền truy cập, backup, bàn giao, revision binding; xác nhận riêng của người phụ trách | PENDING | |

## Xác nhận trước khi ký

- [ ] Tôi đã thực hiện đúng phạm vi, không chỉ dựa vào AI review hoặc số tests PASS.
- [ ] Sổ quyết định đã có tên/ngày/căn cứ thật cho từng item trong phạm vi; các PENDING/NEEDS_FIX và bất đồng được liệt kê rõ.
- [ ] Tôi đang ký đúng revision/hash; không có source hoặc quiz/private binding thay đổi giữa lúc đọc và ký.
- [ ] Tôi không ghi key/explanation hoặc digest đáp án vào hồ sơ chung; thông tin riêng chỉ trong khu vực được phép.
- [ ] Các giới hạn audio, quyền sử dụng và phạm vi source đã được ghi đúng; không coi phần chưa kiểm là PASS.
- [ ] Biên bản này không tự cấp quyền import hoặc publish và không cập nhật DB statuses.

Quyết định import Development và publication cần phê duyệt riêng sau khi người phụ trách đối chiếu toàn bộ sổ, chữ ký, bằng chứng rights và kế hoạch preflight. Chưa có phê duyệt đó trong mẫu này.
