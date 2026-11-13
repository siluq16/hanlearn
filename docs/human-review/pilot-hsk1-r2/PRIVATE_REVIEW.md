# Duyệt đáp án và explanations trên máy local

Tất cả 24 `private/<question UUID>` vẫn PENDING. Gói đọc và Git không chứa nội dung private. Người phụ trách phải xác nhận người duyệt được ủy quyền ngoài công cụ; checkbox UI không phải chứng thực danh tính hoặc quyền truy cập mới.

## Điều kiện local

- Dùng máy Windows được kiểm soát, không screen sharing/recording/transcript/screenshot; không mở private store bằng dịch vụ editor đồng bộ hoặc gửi qua chat.
- Store hiện tại là `.local/pilot-hsk1/v1/private/answers.json`, package revision 2; source author cũ và bản đối chiếu cũng chỉ ở vùng đó. Không chạy author.mjs, remediation.mjs hoặc helper audit revision 1.
- Directory tắt kế thừa ACL, chỉ tài khoản local hiện tại và SYSTEM. Người được ủy quyền có thể duyệt trong phiên local được người phụ trách giám sát; không chia sẻ credentials. Nếu cần tài khoản/ACL khác thì phải có quyết định riêng; viewer không thêm quyền.
- Trước khi xem, đối chiếu SOURCE_SNAPSHOT và private bindings. Viewer từ chối thiếu/sai revision/hash/coverage/ACL; không “bypass” để mở store cũ. Quy trình quản lý backup/chia sẻ vẫn cần được người có thẩm quyền duyệt.

## Kiểm tra không hiển thị dữ liệu riêng

Tại root repo, Windows PowerShell 5.1:

```powershell
powershell -NoProfile -File .\scripts\review-private-pilot.ps1 -PrepareOnly
```

Chỉ in PASS/BLOCKED và số câu; không in key, explanation, username hoặc password. Không có network/DB/export/save. Nếu Windows/sandbox chặn thực thi, dùng quy trình phê duyệt local hoặc script-signing của người phụ trách; không hạ execution policy toàn máy hoặc vô hiệu hóa ACL. Kiểm tra PrepareOnly không được tính là human review.

## Người duyệt mở cửa sổ riêng

```powershell
powershell -NoProfile -STA -File .\scripts\review-private-pilot.ps1
```

Cửa sổ WinForms local bắt đầu trống. Sau khi xác nhận thẩm quyền đã được kiểm riêng, chọn câu theo Lx-Qy/UUID để xem stem/choices, lựa chọn dự kiến và explanation đầy đủ. Tự giải trên hồ sơ không đáp án **trước** khi mở câu đó. Không có máy chủ HTTP, browser asset, telemetry hoặc ghi decisions trong viewer. Chỉ có thông báo đóng cửa sổ ở console.

Với từng câu: kiểm đúng question ID/hash/revision, đánh giá chỉ một lựa chọn thỏa toàn stem, đọc toàn explanation và lý do loại từng distractor, tìm phát biểu quá rộng/sai sense hoặc không tương ứng với choices hiện tại. L2-Q1 phải kiểm ngữ cảnh mới gặp và câu hỏi đứng riêng; 14 câu đổi và 10 câu giữ wording đều phải làm đủ bước. Nếu lý do chưa đủ/không đồng ý thì NEEDS_FIX, không ký PASS chỉ vì stored key khớp ý định tác giả.

Ghi vào register chung **chỉ** attestation PASS/NEEDS_FIX/PENDING, reviewer, ngày và nhận xét không tiết lộ. Các sửa đề xuất về index/đáp án/lập luận lưu trong ghi chú riêng dưới directory private, theo UUID và public quiz hash, ACL tương đương và không Git. Không copy chúng vào proposed_change của sổ chung. Viewer không lưu, không tự điền tên hoặc ngày, không tự đổi human_review/status nào.

Sau lượt duyệt thật, người phụ trách phải chốt **bằng chứng restricted** gắn SHA-256 của đúng answers.json đã đọc, public quiz bindings, reviewer/ngày và chữ ký thật. Private digest chỉ lưu/ký trong vùng private, không in terminal hoặc đưa vào register/SIGN_OFF chung; hồ sơ chung chỉ tham chiếu một evidence ID không chứa đáp án/digest. Trước import so private bytes với bằng chứng restricted đó. Public quiz hashes không phát hiện được việc ai đó sửa key/explanation mà giữ nguyên quiz file; không được dùng chúng thay cho private integrity evidence. Chưa tạo chữ ký hoặc sealed private evidence trong bước chuẩn bị này. Viewer chỉ giữ digest trong bộ nhớ và chặn nếu file đổi khi đọc/chọn câu/đóng phiên; nó không cấp chứng nhận ký duyệt.

Đóng cửa sổ khi xong và khóa phiên máy. Viewer chặn thao tác copy thông thường và không có export; nó **không** ngăn được OS administrator, quay màn hình, clipboard qua công cụ khác hoặc memory inspection. Chuỗi .NET có trong bộ nhớ để đọc và không có đảm bảo xóa vật lý ngay khi đóng; không tuyên bố mã hóa/zeroization. Các kiểm soát phiên máy và thẩm quyền thực tế vẫn cần con người thực hiện.

Chỉ chế độ PrepareOnly được kiểm chứng tự động trong bước chuẩn bị. Chưa có người duyệt mở giao diện/thực hiện quyết định; không có bằng chứng duyệt 24 explanations thật.
