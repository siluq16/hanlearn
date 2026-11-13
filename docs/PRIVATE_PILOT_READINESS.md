# Final HSK 1 AI Review Fix & Private Pilot Readiness

2026-11-13, Asia/Saigon. **Đã sửa dữ liệu offline; sẵn cho owner xem xét, chưa có owner acceptance. Import readiness BLOCKED.** Sprint 1 vẫn PARTIAL; Sprint 2.2 Cloud mutation guard giữ nguyên.

## Finding và bằng chứng xử lý

Đã đọc báo cáo owner cung cấp `HanLearn_HSK1_AI_Review_R2_Full.md` và đối chiếu package JSON thực tế, không coi kết quả AI của ZIP là kết quả tests repo hoặc private-store review. Bản gốc không sửa, giữ local/ignored và bản lưu restricted vì có gợi ý lời giải; không đưa nguyên báo cáo vào Git/packet chung. Các báo cáo CQ/remediation và packet r2 cũ không được sửa để trở thành bằng chứng cho r3.

| Finding | Trạng thái | Bằng chứng / giới hạn |
| --- | --- | --- |
| HSK-AI-01 — L1-Q4 | FIXED offline | UUID `76015916-80bf-52c2-bd11-a9a9812b0408` giữ nguyên. Đã đọc stem/4 choices nguyên trạng trong bộ r2. Hai cách diễn đạt có thể cùng phù hợp: lời dịch hỏi tiếp và diễn đạt hàm ý hỏi sức khỏe trong chính ngữ cảnh đó. Đây là ambiguity hợp lý, không quy người học suy diễn sai. |
| HSK-AI-01 — cách sửa | FIXED offline | Stem r3 hỏi **chức năng** của 呢 trong lượt nói có ngữ cảnh; bốn lựa chọn là bốn chức năng giao tiếp phân biệt, không để hai bản dịch/hàm ý gần nhau cạnh nhau. Giữ mục tiêu hỏi tiếp và question UUID. Không công bố lựa chọn được gắn key hoặc giải thích riêng ở đây. |
| HSK-AI-02 — tải bài 3 | JUSTIFIED / chưa thử với người học thật | Giữ 6/6/3 và khả năng học hai buổi; 40 phút là ước lượng, không phải kết quả quan sát. Owner phải ghi trải nghiệm/độ khó nếu chấp nhận. |
| HSK-AI-03 — hội thoại luyện mẫu | JUSTIFIED cho pilot nhập môn | Giữ ngữ cảnh luyện mẫu đã có; chưa khẳng định văn nói phong phú hoặc native naturalness. Không thêm từ mới để làm hội thoại phức tạp. |
| HSK-AI-04 — pinyin/phát âm | LIMITATION OPEN | Giữ thanh gốc và chú thích biến điệu; không có audio/người nghe kiểm nên chưa chứng nhận phát âm/ngữ điệu. |
| HSK-AI-05 — viết liền thứ | JUSTIFIED / không đổi | Giữ policy viết pinyin nhất quán hiện tại; không có finding mới buộc sửa hàng loạt. Lượt này không tuyên bố đã xác minh thêm các tài liệu bên ngoài mà báo cáo AI tham khảo. |

## Revision và hashes cuối

- Format package/content **V1** không đổi; **draft_revision 2 → 3**.
- Quiz revisions: **3 / 2 / 2 / 2**. Chỉ quiz bài 1 có thay đổi, chỉ question L1-Q4 đổi stem/choices; 23 câu khác byte/value không đổi.
- 4 lessons, 29 sections, 44 words, 12 grammar, 24 questions, 66 vocabulary joins và 12 grammar joins giữ nguyên IDs/relationships. Không thay vocabulary/grammar/lessons/rights manifest hoặc tự thêm source membership.
- Manifest SHA-256: `dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b`.
- Public package snapshot SHA-256: `2cb3e0d7a667dd6faba633c4df1e87e6dbaee539e19d0cb394e9dcc769c91deb` — cách tính trong [SOURCE_SNAPSHOT](human-review/pilot-hsk1-r3/SOURCE_SNAPSHOT.json): sorted public `{path,sha256}`, JSON.stringify UTF-8, không newline, gồm manifest + 11 JSON dữ liệu. Không có private answer digest trong public metadata.
- [Hồ sơ r3](human-review/pilot-hsk1-r3/README.md) có **159 PENDING** rows (thêm focus L1-Q4); 158 records r2 giữ nguyên, không names/dates/signatures mới. Viewer/generator theo revision hiện tại và quiz revisions thực, không hardcode mọi quiz là 3.

## Quiz và private regression

L1-Q4 được **giải lại**, tính correct_index từ lựa chọn theo stem mới và viết lại explanation tương ứng trong protected local store, không giữ key theo vị trí cũ. Private package_revision tăng 3; bindings dùng actual quiz UUID/revision/public SHA. Một key/explanation đổi, 23 key/explanations còn lại đối chiếu với backup r2 và giữ nguyên. Không chạy lại author.mjs, không công khai index/answer vector/explanation/private digest.

Đã rà hồi quy toàn bộ 24 stems/choices cùng local private helper: 24 unique intended selections theo AI reasoning, 24 stored selections khớp, 24 reason predicates/binding checks đạt. Người duyệt vẫn phải đọc đầy đủ explanations; predicate match không chứng minh mọi cách hiểu ngôn ngữ hoặc independent human sign-off. Bản raw AI review đầu vào không có private bundle, nên không được coi nó là đã kiểm private answers.

| Script/kiểm tra thực chạy | Kết quả |
| --- | --- |
| `npm run content` | PASS public schema/IDs/refs/hashes/source-cache và private bindings; human/pinyin/quiz review pending, importReadiness BLOCKED. |
| `npm run test` | **176 tests / 17 files PASS**; thêm kiểm revision 3, quiz revisions thực, history r2 riêng biệt, flags cho câu thay đổi và ngăn hồi quy ambiguity L1-Q4. Không load private answers trong unit suite. |
| `npm run typecheck`, `npm run lint`, `npm run format:check` | PASS. |
| `npm run test:contracts`, `npm run test:security` | PASS static checks; không SQL/Cloud execution. |
| Protected viewer `-PrepareOnly` | PASS snapshot r3/ACL/private bindings cho 24 câu; không mở GUI hoặc giả owner đã xem. |
| Regression private local | 24/24 selections/bindings và reason predicates đạt; chỉ target key/explanation đổi, 23 record khác giữ nguyên. Không phải chứng nhận mọi sắc thái ngữ nghĩa bởi con người. |
| Private leakage/ACL | Không private copies trong 210 tracked/unignored files và 41 browser chunks hiện có; không private/input-report files tracked. 11 private paths chỉ owner/SYSTEM, directory tắt kế thừa. |

Chỉ thực hiện offline, không build/deploy hoặc DB/API mutation trong lượt này; security scan dùng browser artifacts baseline hiện có. Kiểm snapshot/records và Git diff xác nhận packet r2 không đổi; không ghi lại hash/chữ ký cũ cho dữ liệu r3. Source ứng dụng, contracts và migration files không có diff, nên Cloud mutation guard Sprint 2.2 giữ nguyên.

## Chính sách private-use và mẫu owner decision

[PRIVATE_PILOT_POLICY](PRIVATE_PILOT_POLICY.md) đề xuất **AI_REVIEWED_OWNER_ACCEPTED_PRIVATE_USE**, trạng thái **PROPOSED / NOT ADOPTED**. Tài liệu có mẫu owner tự điền quyết định chính sách và quyết định chấp nhận nội dung riêng, actual name/date/signature, exact package revision/hash, IDs/scope đã xem, phần chưa kiểm và rủi ro còn chấp nhận. Không điền các trường đó thay owner và không tự biến review rows thành PASS.

DOMAIN_CONTRACTS không yêu cầu hai người khác nhau ở mọi role; PILOT_CONTENT_PLAN cho một người nhận nhiều role nhưng cần evidence thật. Workflow human-review hiện đòi independent linguistic review là gate mạnh hơn private owner acceptance. Đề xuất ngoại lệ personal pilot được phân tích riêng, chưa thay contracts hoặc constraints. Owner có thể chọn chấp nhận rủi ro học cá nhân sau khi đọc thật; không được gọi đó là native-certified/human-language-verified, public release hay rights clearance. Nếu muốn import readable catalog sau này, cần quyết định mapping role/evidence/license thực với publication constraints giữ nguyên; không fake reviewed_by/time hoặc flip approved để vượt gate.

## Điều kiện còn thiếu

| Gate | Hiện tại |
| --- | --- |
| Owner chấp thuận policy và nội dung đúng revision/hash | PENDING; mẫu chưa ký, không suy từ việc phê duyệt sửa offline thành acceptance. |
| Independent language review | Chưa có; private policy đề xuất có thể ghi rõ thiếu để owner cân nhắc, không giả PASS. |
| Source/sense/rights/attribution | 43 headwords/readings theo evidence cũ, 越南 bổ trợ. Nghĩa/cách dùng/quyền dùng vẫn cần quyết định thật; `distribution_license=null`, pending-rights-review không là giấy phép. Personal use không tự hợp thức hóa sao chép nguồn. |
| Private management | Owner/SYSTEM ACL, ignored và revision bindings đã kiểm kỹ thuật; actual access/backup/handover và sealed integrity evidence sau review chưa chốt. Không đưa digest private vào sổ chung. |
| Audio/pedagogy | Không audio, 40 phút/độ tự nhiên chưa có xác nhận người học/chuyên gia thật. |
| Sprint 1/security | Vẫn PARTIAL; real outsider/B, expiry/revocation, typegen và ops/Storage gates không bị policy cá nhân tự xóa. |
| Preflight Development | Chưa chạy trong nhiệm vụ này, cần quyền target-specific chỉ đọc và secure credentials local. |
| Import/publication/live study | Không được phép trong nhiệm vụ; guard Sprint 2.2 giữ nguyên. |

## Trước Development preflight chỉ đọc

Chốt route review/policy được phê duyệt và owner acceptance thật theo scope, source/rights và private evidence; freeze package/hashes hiện tại, runs kỹ thuật PASS; có approval riêng cho preflight trên Development `hhgxrjqkuwdgurphopok`. Kết nối IPv4 Session Pooler đã biết, TLS verify-full/trusted CA, nhập secrets ẩn trên máy local, ON_ERROR_STOP và transaction READ ONLY. Kiểm target ngoài SQL, remote history sáu migrations và schema/FKs/checks/grants/RLS, ID/natural-key/revision collisions bằng SELECT. Không dựa riêng vào current_database=postgres để nhận diện project; không dùng fresh-install preflight yêu cầu history trống; không thử DML rồi rollback.

Kế hoạch [IMPORT_GATES_AND_DRY_RUN](human-review/pilot-hsk1-r3/IMPORT_GATES_AND_DRY_RUN.md) chỉ là tài liệu, không cấp quyền thực thi. Có lỗi/collision thì dừng, không repair/reset hoặc tự sửa schema. Metadata checks và dry-run read-only không chứng minh transaction import sẽ thành công.

## Mọi thao tác ghi cần approval riêng

1. Import catalog/joins/quizzes/questions và đưa keys vào private store Cloud: exact project/revision/hashes/IDs/counts, reviewed importer, transaction/rollback, collision policy và secure key delivery phải được duyệt trước.
2. Chuyển status/review metadata/verified_at để catalog readable: quyền riêng và actual provenance/license/reviewer/evidence phù hợp policy đã được chấp thuận; không đồng nghĩa public release. Hiện toàn bộ source vẫn draft/pending, authorization false.
3. Bật hoặc thay guard để gọi mark_lesson_studied trên Cloud và các mutation quiz/completion/card creation: approval riêng theo account/dataset/RPC/ảnh hưởng/cleanup; không dùng owner learning data làm mutation tests.
4. Mọi Auth user/allowlist, Storage, DDL/migration/RLS, push/deploy/public release đều ngoài scope; không được suy từ owner acceptance.

**Kết luận hiện tại: OFFLINE FIX DONE, OWNER DECISION PENDING, CLOUD IMPORT/PUBLISH BLOCKED.** Không ghi Cloud, không sửa migrations/RLS/Study Confirmation guard, không tạo account hoặc tiến độ học; không Sprint 1 COMPLETED, push hoặc deploy.
