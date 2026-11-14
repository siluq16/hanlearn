# Private content policy — PRIVATE_INVITE_ONLY / PUBLIC_RELEASE

## Chính sách hiện hành

**PRIVATE_INVITE_ONLY supersedes singleton PERSONAL_DEVELOPMENT for this pilot.** The owner explicitly requested sharing experimental r3 content with invited friends and keeping both existing allowlist entries. Published catalog remains shared through current learner RLS; each user's personal data stays isolated. Overlay v6 preserves original acceptance/viewing timestamps and records this sharing request separately, without claiming third-party sharing rights. PUBLIC_RELEASE remains unapproved. No additional approval JSON/signature, migration, role, Auth or RLS change is needed. Earlier singleton/removal proposals are withdrawn, never executed.

Owner đã chấp thuận triển khai hai mức, dùng chung SQL schema và importer; không mở draft access hoặc nới RLS:

- **PERSONAL_DEVELOPMENT:** chấp nhận package thử nghiệm đúng revision/hash cho owner tự học trên Development `hhgxrjqkuwdgurphopok`. Tái sử dụng quyết định acceptance thực tế; ghi nhận đã xem không phải approval. Review metadata lấy người/vai trò, thời điểm và phạm vi acceptance thực, không phải ngày import. `content_license` lưu scope declaration AI-assisted/personal-only/distribution-rights-unverified, không giả giấy phép. Independent language review và distribution clearance được giữ PENDING; các vấn đề sao chép cụ thể đã biết vẫn BLOCKED.
- **PUBLIC_RELEASE:** giữ independent language review, provenance/attribution và quyền phân phối có bằng chứng. Scope declaration personal không đáp ứng public release. Không tự chuyển 159 records PENDING hoặc rights thành PASS.

Machine-assisted syllabus verification được phép theo DOMAIN_CONTRACTS: hash PDF/text cache, edition và selected headword/readings phải thực sự được đối chiếu; timestamp là lúc job hoàn tất thật, không tự nhận owner kiểm chứng hoặc chứng nhận toàn bộ ngôn ngữ.

Local metadata PASS không là quyền ghi Cloud. Trước execution phải kiểm tra live target/TLS/history/collisions/logging/RLS và actual operator và các invited learners đã confirmed trong allowlist. Catalog hiện không có per-owner row scope: thêm allowlisted learner sẽ thay đổi phạm vi đọc, nên không coi thêm confirmed invitee là blocker; phải dừng khi allowlist khác snapshot đã chốt hoặc có tài khoản chưa confirmed. Private keys, Auth, learner isolation, quiz sealing và Study/Quiz Cloud guards giữ nguyên. Import/promotion/live mutations cần phê duyệt riêng; không yêu cầu authorization JSON/chữ ký lặp lại.

## Đề xuất lịch sử — giữ nguyên bằng chứng bên dưới

2026-11-13. **PROPOSED — NOT ADOPTED / OWNER ACCEPTANCE PENDING.** Tài liệu này là đề xuất và mẫu quyết định, không phải chữ ký, human-language approval, quyền ghi Cloud hoặc giấy phép phát hành. Không tự cập nhật manifest/DB/review records theo tên chính sách.

## Phạm vi đề xuất

Private Pilot chỉ cho **một owner tự học cá nhân** với exact package revision/hash đã xem. Không cấp quyền phân phối, mở signup, chia sẻ account, chia sẻ nội dung/đáp án cho người khác, phát hành công khai hoặc marketing nội dung là đã được chuyên gia duyệt. Việc dữ liệu cần published để readable qua RLS trong tương lai là trạng thái catalog kỹ thuật; không đồng nghĩa public release. Hiện tại không có quyền import hoặc thay đổi publication status nào.

| Khái niệm                   | Ý nghĩa / bằng chứng bắt buộc                                                                                                                    | Không đồng nghĩa                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| AI review                   | Công cụ hỗ trợ tìm lỗi/ngữ nghĩa; ghi đúng input/revision và giới hạn; có thể cùng bỏ sót lỗi giữa nhiều lượt AI.                                | Chứng nhận người bản ngữ, độc lập về chuyên môn, official HSK certification hoặc rights clearance.                               |
| Owner acceptance            | Owner thực sự đọc, thử học và xem riêng quiz/explanations, tự ghi quyết định có ngày/phạm vi/hash và rủi ro còn chấp nhận.                       | Tự động PASS 158/159 human review rows, giả chữ ký reviewer, waiver bảo mật hoặc quyền import/publish.                           |
| Public release              | Quy trình riêng với ngôn ngữ/sư phạm/rights/attribution/ops/security và phê duyệt release đầy đủ.                                                | Được mở vì owner đã chấp nhận học cá nhân.                                                                                       |
| Licensed/authorized content | Có provenance và quyền dùng đúng phạm vi của từng nguồn/đóng góp; tự biên soạn AI-assisted cần được khai báo, chốt quyền và attribution phù hợp. | URL truy cập công khai hoặc mục đích cá nhân tự biến mọi tài liệu Internet/giáo trình trả phí thành nội dung được phép sao chép. |

Owner có thể chấp nhận rủi ro **độ chính xác ngôn ngữ, độ tự nhiên, pinyin chưa có audio và thời lượng học chưa thử đầy đủ** trong phạm vi cá nhân sau khi biết rõ. Không dùng bảng rủi ro để tự hợp thức hóa nội dung chưa rõ quyền, lộ keys, bỏ RLS/constraints, dùng Production, hoặc cấp quyền ghi Cloud chưa được phê duyệt.

## So với contracts và workflow hiện có

DOMAIN_CONTRACTS yêu cầu approved/provenance/license/reviewer/time cho published và verified_at cho syllabus; không có field `AI_REVIEWED_OWNER_ACCEPTED_PRIVATE_USE` trong schema. PILOT_CONTENT_PLAN cho phép một người nhận nhiều vai trò nhưng cần named review evidence. Workflow human-review r2/r3 đòi reviewer độc lập cho ngôn ngữ là gate mạnh hơn việc owner tự chấp nhận rủi ro; hồ sơ đó vẫn là bằng chứng chờ duyệt, không được đổi tên hoặc tự chuyển PASS.

**Đề xuất thay đổi chính sách riêng:** sau khi owner chủ động chấp thuận đề xuất này, có thể chấp nhận private personal pilot mà không tuyên bố đã có independent language sign-off. Quyết định owner được lưu riêng với `review_method=AI_assisted_owner_accepted`; independent linguistic review vẫn PENDING/chưa có. Chỉ những việc owner thật sự đã kiểm mới có thể có attestation của owner, không điền retroactive PASS cho mọi record. Không áp ngoại lệ này sang public release, nội dung bên thứ ba chưa rõ quyền, audio hoặc release security gates.

| Gate                                 | Tác động đề xuất nếu chính sách được chấp thuận thật                                                                                                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Independent linguistic certification | Có thể chưa có cho personal pilot; ghi rõ thiếu và rủi ro owner chấp nhận. Không quảng bá human-verified/native-certified.                                                                                                             |
| Review records lịch sử               | Giữ nguyên revision/hash/tên/ngày cũ; quyết định owner dùng hồ sơ riêng. Không rewrite 158 rows r2 thành PASS, không auto-fill 159 rows r3.                                                                                            |
| DB constraints / runtime reader      | Không đổi. Nếu muốn catalog readable trong tương lai, operator cần đề xuất mapping metadata chính xác, actual reviewer role/date và content_license có bằng chứng; không đặt tên AI vào reviewed_by, không flip status để né workflow. |
| Publication/Cloud writes             | Approval riêng cho exact package/IDs/transaction/target vẫn bắt buộc. Owner acceptance không phải lệnh import hoặc bật Study Confirmation Cloud.                                                                                       |
| Rights / private-key isolation       | Không nới. Vẫn chốt quyền dùng/attribution, restricted private evidence/backup và no key exposure.                                                                                                                                     |
| Auth/RLS/ops / Sprint 1              | Không miễn các blocker đang mở; single-owner product không làm mất trust boundary. Sprint 1 vẫn PARTIAL.                                                                                                                               |

Việc sửa DOMAIN_CONTRACTS hoặc quy trình publication để nhận loại owner evidence này cần một quyết định chính sách rõ ràng tiếp theo; nhiệm vụ hiện tại chỉ đề xuất, không thay contracts, SQL constraints hay app guard. Chưa có automatic policy evaluator/importer.

## Mẫu quyết định thực tế — để owner điền

Copy mẫu này vào nơi local được kiểm soát và Git ignored; không ký vào tracked template. Không gửi key/explanation hoặc private digest trong phần quyết định chung.

- Policy proposal: AI_REVIEWED_OWNER_ACCEPTED_PRIVATE_USE
- Quyết định có chấp thuận áp dụng chính sách không: **PENDING** — owner điền CHẤP THUẬN / KHÔNG CHẤP THUẬN / CẦN SỬA.
- Quyết định chấp nhận nội dung exact package để tự học: **PENDING** — quyết định riêng với việc chấp thuận chính sách.
- Họ tên owner thực tế: __________________
- Ngày giờ thực tế ISO 8601 kèm timezone: __________________
- Package ID: hanlearn-pilot-hsk1-v1
- Draft revision: **3**; quiz revisions: **3/2/2/2**.
- Manifest SHA-256: `dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b`
- Public package snapshot SHA-256: `2cb3e0d7a667dd6faba633c4df1e87e6dbaee539e19d0cb394e9dcc769c91deb`
- Tôi đã đối chiếu bytes thực tế với hashes trên: __________________
- Phạm vi tôi đã thực sự đọc/thử (lesson/word/grammar/question IDs, private review evidence ID): __________________
- Phạm vi dùng cá nhân được chấp nhận (offline; nếu mong muốn Development phải ghi như đề nghị cần approval riêng): __________________
- Hạng mục chưa xem/không chấp nhận/cần sửa: __________________
- Rủi ro ngôn ngữ/sư phạm còn chấp nhận và lý do cụ thể: __________________
- Quyền sử dụng từng nguồn/phạm vi và attribution đã đối chiếu, bằng chứng còn thiếu: __________________
- Nơi lưu bằng chứng private integrity/backup đã được xác nhận (chỉ opaque reference; không private hash/key): __________________
- Điều kiện dừng dùng/thu hồi acceptance nếu phát hiện lỗi hoặc vượt phạm vi: __________________
- Chữ ký thật của owner theo quy trình được chọn: __________________

### Checklist owner thực hiện, không được tự tick

- [ ] Tôi đã tự đọc và chấp nhận exact scope ở trên, hiểu AI có thể sai và chưa có chứng nhận ngôn ngữ độc lập.
- [ ] Tôi đã xem riêng đủ quiz/key/explanations mình chấp nhận, đặc biệt L1-Q4 mới; ghi private evidence revision đúng mà không lộ nội dung.
- [ ] Tôi đã ghi từng rủi ro còn chấp nhận, không dùng câu “mọi rủi ro được chấp nhận” để bỏ qua quyền sử dụng/bảo mật.
- [ ] Tôi hiểu official headword/reading lookup không chứng minh mọi nghĩa hoặc cho phép phân phối tài liệu nguồn.
- [ ] Tôi không cấp public release hoặc quyền ghi Cloud bằng mẫu này; các thao tác đó cần quyết định riêng.
- [ ] Nếu sửa source hoặc private explanations sau ký, acceptance chịu ảnh hưởng phải được kiểm/ghi lại theo revision/hashes mới; không sửa chữ ký/hash cũ.

Sau quyết định thật, người phụ trách đánh giá scope và bằng chứng rights/security trước khi trình preflight/import. **Hiện không có chữ ký hoặc owner acceptance nào được tạo.**
