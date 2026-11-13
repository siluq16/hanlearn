# HSK 1 Pilot r3 — final rights and publication gates

2026-11-13, Asia/Saigon. Chỉ kiểm tra hồ sơ/quyền và chuẩn bị artifacts local. Không đọc answers thật, mở kết nối Cloud, import/publish hoặc thay đổi frozen content/migrations/RLS/guard.

| Gate                | Trạng thái cuối    | Ý nghĩa                                                                                                                                                        |
| ------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RIGHTS_DECISION     | **VERIFIED**       | Hồ sơ decision hoàn chỉnh, có tên/ngày giờ/typed confirmation do owner tự điền và exact package binding; không phải chứng nhận license hoặc danh tính độc lập. |
| RIGHTS_CLEARANCE    | **PENDING**        | Personal-use decision có phạm vi/ngoại lệ; chưa đủ evidence để agent cấp license hoặc publish mọi entity.                                                      |
| RIGHTS_BACKUP       | **VERIFIED**       | Archive mới AES-256/header encrypted, actual test/decrypt/restore, **4/4 files khớp**.                                                                         |
| PUBLICATION_MAPPING | **BLOCKED**        | Có proposal overlay v1 riêng; thiếu rights/reviewer/license/mapping evidence và live effective-allowlist verification để approved/apply.                       |
| REAL_KEYS_LOCAL_E2E | **NOT_AUTHORIZED** | Chỉ có inactive authorization template; không mở/validate answers thật hoặc đưa keys vào DB.                                                                   |
| CLOUD_IMPORT        | **BLOCKED**        | Không Cloud/apply mode hoặc write approval trong nhiệm vụ này.                                                                                                 |

## Hồ sơ rights thực tế

Đọc `.local/pilot-hsk1/v1/rights/owner-rights-decision-r3.md`, không dựa vào tên file để tự suy đã ký. Lúc đầu dòng “Ngày, họ tên và chữ ký” còn placeholder và chưa có hashes. Owner đã tự hoàn thiện file trong phiên này; agent không sửa fields, chữ ký hoặc thời điểm.

- Dòng 23–26: actual date/time ISO8601 có timezone, parse hợp lệ/không ở tương lai khi kiểm; tên và typed confirmation có giá trị, không còn placeholder. Không chép thông tin nhận dạng/chữ ký vào báo cáo chung.
- Dòng 28–39: package ID `hanlearn-pilot-hsk1-v1`, draft revision 3, quiz revisions 3/2/2/2, manifest/snapshot hashes và evidence locator khớp hồ sơ đã freeze.
- Quyết định chấp nhận **sử dụng cá nhân đối với phần có nguồn gốc và phạm vi đã xác định**, không phân phối/kinh doanh/public release; phần chưa rõ quyền không tự thành licensed/publishable.
- Tính VERIFIED ở đây là xác minh có bản ghi quyết định/phạm vi/binding phù hợp và xác nhận văn bản; không phải crypto signature verification hoặc independent language/originality review.

Public bindings:

- Manifest SHA-256: `dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b`.
- Public snapshot SHA-256: `2cb3e0d7a667dd6faba633c4df1e87e6dbaee539e19d0cb394e9dcc769c91deb`.
- 12 public files và sáu migration hashes được đối chiếu local; content r3, 4 lessons/29 sections/44 words/12 grammar/24 questions và **159 human-review PENDING** giữ nguyên.

### Nguồn và ngoại lệ chưa được phép publish

| Nhóm                     | Evidence và phạm vi có căn cứ                                                                                                                                                                | Điều còn thiếu / ngoại lệ                                                                                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — AI-assisted drafting | Owner khai lessons, nghĩa Việt, examples, grammar/quiz do AI hỗ trợ theo hồ sơ dự án. Personal-use acceptance đã ghi; disclosure AI được giữ.                                                | Không có chứng nhận originality độc lập; AI-generated không bảo đảm không có quyền bên thứ ba. Không tự gán license từ tên chính sách hoặc từ việc AI tạo nội dung.                           |
| B — HSK                  | Reference edition 11/2025/facts/readings/categories khớp manifest; machine evidence trước có 43 headwords/readings, 越南 bổ trợ. Không chủ trương đưa toàn văn HSK vào app.                  | Membership/reading khác sense review và rights. Không cấp quyền phát hành full PDF/table arrangement hoặc mọi content chỉ vì có source URL.                                                   |
| C — GB/T 16159-2012      | Owner xác nhận reference trong hồ sơ pinyin.                                                                                                                                                 | Chính decision ghi chưa xác nhận license sao chép/phân phối tài liệu tiêu chuẩn. Full text/pages/images không được tự đưa vào published payload.                                              |
| D — pinyin.info          | Chỉ được nhắc trong AI Review; owner ghi chưa xác minh direct use/quyền copy.                                                                                                                | Không coi citation là evidence đã đọc/được phép. Bất kỳ đoạn/asset thực sự phụ thuộc nguồn này phải trace và clear/thay thế trước khi đưa vào readable scope.                                 |
| E — third-party inputs   | **Đã có câu trả lời**, không còn placeholder: theo phần owner trực tiếp thực hiện/nhớ được, không đưa nội dung app học tiếng Trung, sách trả phí hoặc ngân hàng đề thương mại vào authoring. | Đây là self-declaration có giới hạn trí nhớ/phạm vi, không kiểm chứng toàn bộ corpus/AI output; không tự mở rộng thành chứng nhận tuyệt đối cho mọi dictionary/website hoặc nguồn chưa trace. |
| Attribution              | Giữ reference HSK/Pinyin và AI assistance theo actual use; không tuyên bố giáo trình/quiz chính thức hoặc native-verified.                                                                   | Cần chốt credit text/source-use/evidence theo scope entities thực sự định promote; generic attribution không thay license nếu có đoạn/asset cần permission.                                   |

Chấp nhận **bản ghi personal-use decision** không đồng nghĩa agent kết luận quyền pháp lý của mọi từ/fact/câu thông dụng hoặc phủ nhận khả năng tự biên soạn. Vấn đề còn thiếu là exact usage/evidence/mapping: không tự whitelist 91 entities, phân phối nguồn chưa rõ quyền, hoặc đặt `content_license=self-authored` cho toàn gói. `distribution_license=null` và các license/review fields frozen r3 không bị sửa.

Hướng xử lý: khoanh phạm vi/IDs thực dùng và nguồn tham khảo, xác minh hoặc loại các đoạn/asset bên thứ ba chưa rõ quyền; nếu cần sửa nội dung, trình revision mới thay vì sửa r3. Với AI-assisted original text, owner cần actual authoring/rights declaration phù hợp và reviewer scope thật cho metadata dự kiến. Không yêu cầu ký lại acceptance/policy đã RECORDED, không tự tạo independent review PASS.

## Backup quyền mới

Owner chạy `powershell -NoProfile -File .\scripts\private-pilot-backup.ps1 -RightsOnly` với password nhập tại native hidden prompts. Luồng chỉ đọc **2 rights files + manifest + SOURCE_SNAPSHOT**, không đọc core answers.

- Result ignored: `.local/pilot-hsk1/rights-backup-result.json`: BACKUP_VERIFIED, sourceFiles=4, matchedFiles=4, privateFiles=0, rightsFiles=2, encryptedHeader=true, reason=null.
- Archive mới: `D:\nam4\prj\backup\hanlearn-rights-r3-f1baa94ac6ae46aea32e0af7efb2fa23\rights-r3.7z`.
- Capture bắt đầu `2026-11-13T07:59:38.6899639Z` theo máy local; archive create, AES header gate, `7z t`, extraction và hash comparison thực tế PASS, không chỉ kiểm file tồn tại.
- Directory/restore workspace được hạn chế owner/SYSTEM; hash map chỉ trong memory, chỉ lưu status/counts/path, không private digests/passwords. Chỉ dọn copies do run thành công tạo; không xóa archive/staging cũ hoặc source.

Backup 30-file core và các rights archives cũ giữ nguyên. Archive mới chứng minh recoverability cho đúng bytes hồ sơ đã backup, không chứng minh rights clearance. Mọi chỉnh sửa hồ sơ sau thời điểm này cần snapshot/backup mới, không viết lại evidence cũ.

## Versioned publication proposal riêng

Artifact public: [publication-overlay.v1.json](../content/proposals/pilot-hsk1-r3/publication-overlay.v1.json). Proposal version **1**, bind exact r3 hashes; public artifact SHA-256 `aa5f148fd559225a79f8fcf9924b116abbb3ad2b0ee62acdf5ff881d430ef1bb` — không phải private integrity digest.

Proposal chứa **91 entity IDs**: syllabus 1, course 1, unit 1, lessons 4, vocabulary 44, grammar 12, quizzes 4, questions 24. 133 joins không có review/status fields; draft import scope vẫn là 224 public rows + 24 protected keys nếu được cấp quyền riêng trong tương lai.

- `current` vẫn draft/pending. `required_for_readability` mô tả target published/approved, **không là state đã được phê duyệt**.
- `proposed_metadata.content_license/reviewed_by/reviewed_at` đều null; syllabus `verified_at` null. Không copy owner signature/time sang reviewer/license tự động. Source URI giữ locator công khai có sẵn, không tự coi locator là license.
- `proposal_status=PROPOSED_BLOCKED`, `apply_authorized=false`, `execution_supported=false`, public release false. Không có SQL/apply consumer cho artifact này.
- Evidence references/owner allowlist identity chưa được gán; activation không được đề xuất; quiz published_at chỉ do trigger sau khi đủ reviewed questions/keys.

### Trạng thái và evidence cần trước readable catalog

| Field/gate                         | Thay đổi dự kiến, chỉ sau evidence/approval thật                                                                                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| status/review_status               | Published/approved cho actual scope 91 entities; đủ parent ancestry và hai đầu joins readable. Không tự chuyển 159 decisions thành PASS.                                                                 |
| source_uri/content_license         | Actual provenance và quyền dùng đúng scope. Không dùng pending-rights-review hoặc policy label làm license đã clear. Attribution thật không chứa private reviewer notes/signature.                       |
| reviewed_by/reviewed_at            | Actual person, role, thời điểm và phạm vi review/decision cụ thể. Rights signature time không tự là thời điểm language/content review của từng entity.                                                   |
| Owner method vs independent review | Evidence có thể ghi honest owner-reviewed/AI-assisted personal method; independent language review vẫn PENDING/chưa có. Cần chốt meaning của approved cho scope cá nhân, không giả native certification. |
| Syllabus                           | Actual edition/source verification cho verified_at; unknown official totals vẫn bỏ trống. is_active cần quyết định riêng, không tự bật.                                                                  |
| Quiz seal                          | 5–10 published/reviewed questions và valid protected keys; quiz publish cuối, trigger tự đặt published_at/immutability. Không sửa sealed keys để ép thành công.                                          |

**BLOCKED hiện tại:** rights clearance theo exact usage chưa đủ; actual per-scope reviewer/license metadata và quyết định áp dụng mapping còn thiếu; real-key validation/delivery chưa authorized; effective allowlist chưa được kiểm live; chưa có Cloud write approval. Việc DB chỉ CHECK metadata có giá trị không làm license/review thành thật.

Phương án ưu tiên không migration: dùng đúng columns hiện có, actual owner role/evidence trong scope personal policy đã chấp thuận, và một promotion overlay được review/approve riêng. Giữ r3/source acceptance/review history bất biến. Overlay v1 hiện chỉ là proposal; hoàn thiện/approve actual values phải tạo version/payload hash riêng được owner duyệt. Nếu sửa frozen content/metadata source thì cần revision/hash/bindings phù hợp, không mượn chữ ký r3 cho bytes khác.

Pilot validator hiện cố ý draft-only; promotion cần validator/contract overlay riêng, không nới draft validator để giấu field pending. Nếu muốn DB enforce review_method/access_scope hoặc per-owner catalog state mới, cần policy/schema/migration review riêng; không thực hiện trong nhiệm vụ này. Không thêm HTML/unknown Content V1 fields để nhét attribution hoặc exception.

### Owner-only và effective allowlist

RLS hiện cho confirmed allowlisted learners đọc published catalog, không gắn catalog với một owner UUID. Native evidence trước đã cho thấy user B **synthetic/disposable** cũng đọc được published synthetic lesson; không tạo User B Cloud hoặc chạy DB trong nhiệm vụ hiện tại.

Không migration chỉ hợp lệ **có điều kiện vận hành**: effective allowlist đúng một owner đã verified email và kiểm quyền anon/outsider; mọi thêm learner phải review scope nội dung trước. Proposal ghi `confirmed_learner_count=1` là yêu cầu, `live_verified=false` là thực tế hiện chưa kiểm. Không suy mục tiêu “một tài khoản” thành proof live account state. Chặn signup chỉ là defense in depth.

Nếu cần owner-specific enforcement dù có learner thứ hai trong allowlist, phải thiết kế owner/scope predicate và migration/RLS/DTO riêng. Nếu muốn đọc draft, đó là thay security contract chứ không phải lách bằng overlay. Không thực hiện hoặc phê duyệt các thay đổi đó ở đây.

## Authorization plan — NOT_AUTHORIZED

Inactive private template: `.local/pilot-hsk1/v1/authorizations/real-key-read-r3.template.json`, Git ignored, folder/file chỉ owner/SYSTEM. `template_only=true`, `approved=false`, actual name/confirmation rỗng, signedAt null; exact public r3 hashes đã bind. Không tạo active `.local/pilot-hsk1/v1/authorizations/real-key-read-r3.json`, không sao chép chữ ký rights vào authorization.

Scope mẫu duy nhất: **READ_VALIDATE_REAL_KEYS_LOCAL_NO_DB** — nếu được phê duyệt riêng sau này, đọc đúng store r3 vào memory, kiểm ACL/no-reparse, stable bytes/bindings/cardinality/ranges, chỉ xuất status/counts; không values/private digests, sửa file, DB connection/write, env/args/URL payload hoặc Cloud. Người ký thật tự điền trong quy trình authorization riêng; template hiện không phải quyền đọc.

Không chạy reader entry point, `npm run content` (đọc store thật), real-key E2E hoặc real-key leakage scan trong nhiệm vụ này. Parameterized **synthetic** delivery giữ nguyên; kiểm thử denial không mở file trước authorization vẫn PASS. Read-only real authorization sau này cũng không cho real keys vào disposable DB hoặc Supabase; hai scope đó cần approval riêng và review tương ứng.

## Kiểm thử, files và bước tiếp theo

- Source generator `scripts/pilot-r3-publication-plan.mjs`; chỉ ghi public proposal, không có database/apply mode. Authorization template được tạo riêng theo chế độ exclusive, không overwrite record đã có.
- `tests/publication-proposal.test.ts`: kiểm 91 identities, null reviewer/license/time, inactive/no-DB authorization, artifact reproducibility và 159 PENDING; protected adapter denial/redaction tests giữ nguyên.
- `npm run test`: **212 tests / 22 files PASS**; typecheck, lint, format, contracts/security PASS. `npm run content:publication:plan`, `npm run content:import:plan` và public hash/migration audit PASS. Không chạy native DB/Cloud/live Auth trong nhiệm vụ source/proposal này.

Trước bất kỳ Cloud transaction: owner chốt rights/actual metadata/method/overlay; grant real-read riêng nếu muốn kiểm E2E; review real delivery/local test riêng; backup evidence cần thiết; target-specific read-only recheck history/schema/collisions/effective allowlist; sau đó approval riêng cho exact 224+24 transaction và promotion scope. Mọi lỗi trước COMMIT rollback toàn bộ; sau COMMIT không tự DELETE/reset/repair hoặc giả định sealed quiz có thể unpublish. Live acceptance read-only và mọi study/quiz mutation là approval riêng.

**Dừng tại final gates. Không import/publish, thay migrations/RLS/Auth/guard, sửa answers hoặc owner acceptance, ký thay owner, push/deploy hoặc bắt đầu Sprint 2.3.**
