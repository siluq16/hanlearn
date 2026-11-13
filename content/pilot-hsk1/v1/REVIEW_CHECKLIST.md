# Phiếu kiểm duyệt pilot v1 — tất cả pending_review

Ngày biên soạn: 2026-11-13. Người duyệt: **chưa có**. Không đánh dấu xong thay cho người kiểm duyệt. Phiếu này không chứa đáp án hoặc feedback của câu quiz.

Đối tượng duyệt hiện tại: **draft_revision 2 / quiz revision 2** sau remediation CQ-01–CQ-11. Mọi checkbox dưới đây vẫn để trống cho người duyệt độc lập; FIXED trong báo cáo kỹ thuật không thay cho chữ ký con người.

## Ngôn ngữ và pinyin

- [ ] Kiểm toàn bộ 44 nghĩa Việt và ví dụ, không chỉ 43 đối chiếu headword/reading. Nhãn source có các nghĩa/từ loại ở cấp khác; xét đúng cách dùng đã chọn.
- [ ] Kiểm thanh nhẹ: ma/ne/de, xièxie, míngzi, bàba/māma/gēge/jiějie và ge trong cụm số lượng. Không đánh thanh nhẹ thành dấu của thanh đầy đủ một cách máy móc.
- [ ] Kiểm quy ước ghi thanh gốc trong nǐ hǎo / jǐ kǒu và cách giải thích biến điệu khi nói. Chưa có audio để xác minh phát âm thực.
- [ ] Kiểm bù trong mục từ nhưng bú shì trong câu; yī ở dạng từ điển/ngày tháng, yí ge trong 一个. Xác nhận cách tách từ và viết hoa pinyin câu cho người mới học.
- [ ] Kiểm 二 khi đếm/星期二/二月 và 两 trước lượng từ/两点. Không tạo ví dụ 二个, 二口 hoặc 星期七.
- [ ] Kiểm 口 trong đếm thành viên gia đình, 个 trong mẫu thông dụng; không khái quát quy tắc sang mọi danh từ.
- [ ] Kiểm lược 的 trong 我家/我爸爸; phân biệt cụm danh từ và câu hoàn chỉnh. Không dùng 不有 làm phủ định sở hữu.
- [ ] Kiểm nghĩa/sắc thái 很 trong 我很好; các lời chào/hỏi thăm chỉ là mẫu theo tình huống, không phải công thức bắt buộc cho mọi lần gặp.
- [ ] Kiểm tên hư cấu 小明/Xiǎomíng và 小红/Xiǎohóng, không coi tên là mục từ HSK hoặc thông tin người học thật.
- [ ] Kiểm ba tình huống thời gian độc lập, giờ đúng chưa chỉ sáng/chiều; thứ tiếng Việt không dịch máy từ số Trung. Ngày dùng tháng trước ngày, không ngầm khẳng định lịch thực tế.

## Nội dung và sư phạm

- [ ] Đọc cả 4 mục tiêu, 29 sections và hội thoại: tự nhiên, rõ người nói, tải từ mới vừa sức. Bài gia đình có 15 mục mới chia ba lượt 6/6/3, cần thử thời lượng 40 phút, hoạt động tự nhớ và mức độ khó.
- [ ] Các ví dụ từ vựng độc lập không phải cùng một gia đình; không suy cộng anh/chị của các ví dụ vào tình huống ba người chính.
- [ ] Xác nhận mọi từ/cụm ngoài từ mới đã được ôn/giải thích; tách tên riêng/cụm cấu tạo khỏi danh sách distinct.
- [ ] Giữ 越南 là bổ trợ ngoài danh mục headword đã kiểm, không tự thêm membership cấp 1. Người duyệt có thể xác minh bổ sung bằng nguồn chính thức riêng.
- [ ] Kiểm đủ 24 câu quiz và mọi distractor qua vùng riêng: đúng một đáp án về nghĩa/grammar/ngữ cảnh, không có lựa chọn tương đương hoặc gợi ý do formatting.
- [ ] Kiểm giải thích quiz trong private store đầy đủ và khớp revision; cấu trúc PASS không thay cho kiểm ngữ nghĩa. Không chép chúng vào file công khai.
- [ ] Đọc lại stem L2-Q1 khi không có ngữ cảnh tên trước đó; xác nhận một lựa chọn phù hợp duy nhất. Đối chiếu toàn bộ 24 key/explanation revision 2 qua vùng private, kể cả câu giữ nguyên wording.

## Nguồn và quyền

- [ ] Đối chiếu bìa/version/checksum PDF, ordinal/trang/reading cho từng headword đã gắn verified; phân biệt headword verified với nghĩa/biên soạn còn pending.
- [ ] Đối chiếu 12 nhóm ngữ pháp với các mục nguồn; chú thích và cách trình bày là biên soạn mới, không tự tuyên bố HSK phê duyệt.
- [ ] Kiểm nguyên gốc/nguồn của nghĩa Việt, hội thoại, ví dụ, prompt và distractors. Chưa có giấy phép phân phối; pending-rights-review không phải giấy phép.
- [ ] Chốt attribution, người có thẩm quyền, ngày duyệt thật; không ghi AI vào reviewer để vượt gate.
- [ ] Duyệt cách lưu/backup/bàn giao private key riêng; ACL local không phải mã hóa hoặc quyền commit/chia sẻ đã duyệt.

## An toàn dữ liệu và import gate

- [ ] Chạy validator thật; mọi public payload không có key, đúng Content V1 và joins, NFC/pinyin đúng ký tự, không HTML/embed/external audio URL.
- [ ] Tất cả draft/pending, inactive syllabus, verified_at null và official totals rỗng trước quyết định duyệt. Không chỉ flip status để làm app hiện nội dung.
- [ ] Kiểm hashes/package revision sau mọi chỉnh sửa; private keys vẫn bị ignore, không đi vào Git, public assets hoặc frontend bundle.
- [ ] Có phê duyệt riêng cho đúng Development/revision/counts/IDs/import scope; kiểm collision trước khi ghi. Không chạy 6 migrations lại, không đụng dữ liệu owner, Auth/Storage hay Sprint 2.2.

Kết luận người duyệt, vấn đề còn lại và chữ ký/ngày: **để trống tới khi có người thực hiện**.
