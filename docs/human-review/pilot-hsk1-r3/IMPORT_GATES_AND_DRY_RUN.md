# Điều kiện import và kế hoạch Development read-only — revision 3

Chính sách [AI_REVIEWED_OWNER_ACCEPTED_PRIVATE_USE](../../PRIVATE_PILOT_POLICY.md) chỉ đang PROPOSED. Nếu owner muốn chọn route private-use thay independent language sign-off, cần quyết định chính sách và acceptance thật riêng; không tự coi 159 dòng đã PASS. Các gate đầy đủ dưới đây chưa bị bãi bỏ hoặc sửa thành chữ ký owner.

**PLAN ONLY — không có lệnh Cloud nào được chạy trong bước chuẩn bị hồ sơ. Import readiness BLOCKED.** Các DB publication statuses tiếp tục draft/pending. PASS của hồ sơ sau này cũng không tự đổi chúng thành approved/published.

## Điều kiện còn thiếu

- [ ] Có reviewer được ủy quyền/năng lực và người phụ trách đã chốt nơi lưu/ACL của hồ sơ thật, private notes và backup.
- [ ] Toàn bộ 159 stable IDs được quyết định theo đúng phạm vi; không còn PENDING/NEEDS_FIX hoặc bất đồng chưa xử lý cho phần định import. Không bỏ qua 10 câu quiz giữ wording hay private attestations.
- [ ] Có chữ ký/ngày thật cho ngôn ngữ, sư phạm/độ khó bài 3, nguồn/sense, quiz và private, quyền sử dụng/attribution.
- [ ] L2-Q1 duy nhất một lựa chọn theo ngữ cảnh mới; 14 câu đã đổi và 24 private explanations package revision 3 đều được đọc độc lập.
- [ ] Có license/phạm vi sử dụng và attribution rõ cho nội dung AI hỗ trợ tự biên soạn và facts từ nguồn HSK; không dùng “pending-rights-review” như license hợp lệ.
- [ ] Package revision/hashes và quiz/private bindings không thay đổi sau ký. Mọi sửa theo quyết định mới phải có revision/review lại phù hợp; không sửa dữ liệu để giả đủ chữ ký.
- [ ] Có private integrity evidence được ký và giữ restricted cho đúng bytes answer store đã duyệt; private digest không nằm trong hồ sơ chung. Key/explanation đổi sau ký phải duyệt lại, dù public quiz hash không đổi.
- [ ] `npm run content`, unit regressions, contracts/security PASS; không private key leakage. Lưu bằng chứng kỹ thuật local không chứa credentials/answers.
- [ ] Có quyền riêng cho **chạy preflight chỉ đọc** trên đúng Development và kết nối xác thực an toàn; không suy từ văn bản kế hoạch này thành quyền chạy Cloud.
- [ ] Sau preflight đạt, có đề xuất concrete import (revision/hash/IDs/counts, draft-only hoặc publication phạm vi nào, transaction/rollback, private key delivery) và **approval ghi Development riêng**. Hiện chưa có importer đã được kiểm chứng cho nội dung này.

## Kế hoạch dry-run chỉ đọc sau khi hồ sơ được duyệt

Mục tiêu là mô phỏng đối chiếu offline và kiểm tra compatibility/collisions bằng SELECT, **không phải thực thi INSERT rồi ROLLBACK**. READ ONLY không cho thử DML. Không được gọi db push để “import content”; SQL migrations không phải seed/import và đã có lịch sử remote.

1. **Chốt bằng chứng offline:** đối chiếu lại bytes với SOURCE_SNAPSHOT, chữ ký/sổ quyết định và private bindings. Chuẩn bị danh sách IDs/natural keys từ file công khai, không gửi answer store sang dịch vụ để dry-run. Kiểm schema/ràng buộc từ migrations version-controlled và catalog snapshot hiện có; lên thứ tự dự kiến syllabus → course → unit → words/grammar → lessons → joins → quizzes/questions/private keys. Đây chỉ là kế hoạch, không DML.
2. **Xác nhận target ngoài SQL:** Dashboard/config phải là project `hhgxrjqkuwdgurphopok`; Session Pooler `aws-1-ap-southeast-2.pooler.supabase.com:5432`, database postgres, user postgres.hhgxrjqkuwdgurphopok. Khớp hostname/user/project URL với hồ sơ được duyệt. `current_database()='postgres'` một mình không chứng minh project. Dừng nếu khác target; không Production.
3. **Kết nối có phạm vi read-only:** dùng psql IPv4 Session Pooler, TLS verify-full và CA đã kiểm chứng; password nhập local ẩn, không qua URL/args/chat/log, không debug. psql -X, ON_ERROR_STOP, default_transaction_read_only và REPEATABLE READ READ ONLY, kết thúc ROLLBACK. Không đưa batch BEGIN/SELECT/ROLLBACK vào một CLI prepared query. Mọi lỗi phải dừng, không tự repair/schema fix.
4. **History/catalog SELECT:** đọc migration history ngay trước đối chiếu, mong đợi versions/names của sáu migrations đã áp dụng; kiểm hashes các migration files local đã chốt và so metadata schema remote với snapshot local. History không tự chứng minh bytes SQL/hash remote bằng đúng file local. Có thay đổi bất ngờ thì BLOCKED. Không chạy lại fresh-install `cloud-preflight.ps1`: helper cũ có điều kiện lịch sử trống và không phù hợp database đã áp dụng sáu migrations. Không gọi cloud-apply/reset/repair hoặc scripts/check-cloud.mjs có mutation probes.
5. **Collision SELECT với parameters:** kiểm UUID/natural keys/ancestry/order/revision trong syllabus_versions, courses, units, vocabulary, grammar_points, lessons, syllabus_vocabulary/syllabus_grammar, lesson_vocabulary/lesson_grammar, lesson_quizzes và quiz_questions theo đúng tên/constraint migrations. Tìm existing IDs/natural keys hoặc published objects trùng; phát hiện bất kỳ collision phải ghi đối tượng và đề xuất quyết định riêng, không upsert/overwrite tự động. Không đọc/dump bảng quiz keys Cloud hoặc dữ liệu học owner để thực hiện bước này.
6. **Compatibility/security SELECT:** xác nhận columns/enums/checks/FKs/unique indexes và publication/sealing triggers; SQL review_status chỉ pending/approved; grants/RLS/function EXECUTE/search_path/private schema exclusion đối chiếu catalog hiện tại. Chỉ đọc metadata liên quan, không đổi Auth/allowlist/Storage/RLS hoặc gọi mutation RPC.
7. **HTTP nếu được phê duyệt riêng:** các GET/read-only RPC đã chứng minh an toàn để xác nhận private schema không expose, anonymous access bị chặn và draft không xuất hiện qua API. Không tạo Auth user, bucket hoặc nội dung thử; không gọi POST mutation/transaction RPC. Các kiểm JWT với tài khoản thật còn thiếu phải báo riêng, không tự tạo user.
8. **Báo cáo và dừng:** PASS/FAIL/BLOCKED cho target, history, compatibility/collisions/security; ghi command mode/counts/hash và giới hạn không thực thi constraints bằng DML. Không credentials/answers/user data. Chỉ trình đề xuất importer sau khi đã có chứng cứ; chờ approval ghi Cloud riêng, không import/publish ngay sau read-only dry-run.

Không có kế hoạch này đồng nghĩa bảo đảm transaction import sẽ thành công: quyền ghi, trigger, actual content-rights metadata, immutable quiz lifecycle và rollback strategy cần được thiết kế/kiểm riêng trước approval importer. Không bắt đầu Sprint 2.2 hoặc deploy để chạy thử.
