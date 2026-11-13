# HSK 1 Pilot r3 — real import readiness

## Current preparation — 2026-11-13

**LOCAL_TECHNICAL_PASS; PUBLICATION_METADATA_BLOCKED; CLOUD_EXECUTION_UNSUPPORTED.** The historical assessment below is retained as evidence. Its missing-identity/local-read-authorization/real-read blockers are superseded: owner acceptance and rights decision are RECORDED/VERIFIED, existing backups were restore-verified, and real-key local validation PASS (24 bindings). Routine local reads need no JSON/signature gate. None of those results certifies all third-party rights or authorizes Cloud writes.

Ready locally: draft plan is **224 public rows + 24 protected keys**; the protected worker now binds every public batch and each key with `PQexecParams`. Fixed loopback/sentinel target, exact hashes/bindings, logging guards, collision rejection, SERIALIZABLE transaction and rollback remain enforced. A **separate** synthetic promotion transaction validates the existing draft snapshot, publishes 91 entities with quizzes last, preserves key sealing and leaves `is_active=false`. Worker independently rejects non-synthetic keys/feedback; no real-key database or Cloud execution mode exists.

New public data artifact: [grouped overlay v2](../content/proposals/pilot-hsk1-r3/publication-overlay.v2.json). V1/frozen r3 and 159 PENDING review records are untouched. V2 is a metadata proposal, **not another authorization/signature form**; it reuses locators for the existing acceptance/rights records. Every exact table/UUID/source URI is listed under `groups[].entities`:

| Group      | Exact scope                            | Missing factual decisions                                                                                                      |
| ---------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| curriculum | 1 syllabus + 1 course + 1 unit (3 IDs) | Actual permission/credit and owner-review metadata; actual source/edition verification timestamp/reference for the syllabus    |
| vocabulary | 44 IDs                                 | AI-assisted meanings/examples vs 43 referenced HSK headword/readings; personal permission/credit and actual owner-review scope |
| grammar    | 12 IDs                                 | AI-assisted explanations/examples vs HSK categories/Pinyin references; same metadata and actual input scope                    |
| lessons    | 4 IDs / 29 sections                    | AI-assisted dialogue/transcripts/objectives; actual inputs, permission/credit and owner-review scope                           |
| quizzes    | 4 IDs                                  | Quiz metadata permission/credit and actual owner-review scope                                                                  |
| questions  | 24 IDs                                 | AI-assisted stems/choices and scoped declaration covering protected feedback; no raw keys/feedback in the overlay              |

Special source cases: 越南 `aa4a8f04-c772-54ef-a296-a7fd0a6d37c3` is supplemental, not one of the 43 verified headwords. Grammar 很 `fa09d24a-1c47-51aa-91fa-143b3877e98a` has a remediation trace gap, not evidence of copying. GB/T is an orthography reference; its full text/pages are not imported. pinyin.info is a citation in AI review with no established direct-copy dependency. The existing rights decision E reports no recalled commercial app/book/exam-bank inputs; it is not a proof about every website/dictionary or all AI output. No specific copied third-party passage/ID was established by this preparation. Do not falsely exclude/clear all 91 IDs merely because a source was mentioned.

**Owner input needed once, grouped (chat or an existing evidence record is sufficient; no new signature JSON):** confirm actual inputs and any copied/unresolved portions with affected IDs; choose a truthful personal-use permission statement and attribution; confirm how the existing acceptance represents actual owner/AI-assisted personal review, the reviewer label safe to store/display, and the actual review date/time. Existing recorded name/date may be reused only if they really describe that review, not automatically as an import timestamp. Confirm actual syllabus source verification evidence/time. One package-wide statement may cover multiple groups where accurate; no independent/native certificate or 159 individual PASS decisions is required by the SQL schema/private policy. AI origin is not itself a license.

The validator checks exact hashes/91 identities/references, strict metadata, real reader length limits (license 500/reviewer 200), dates, actual-review declaration, rights/input scope and unresolved copied IDs. Attribution must be present in the persisted license/permission text because current UI has no separate credit field. It rejects unknown/private fields and apply/public-release/activation flags. Formal PASS is **structure/declaration completeness only**, never a rights certificate or execution permission. Current metadata remains null/unconfirmed, so `content:publication:check` correctly returns BLOCKED for all six groups and syllabus verification. No fake reviewer/license/time was filled.

### Fresh Development preflight — prepared, NOT connected

When requested, `powershell -NoProfile -File .\scripts\pilot-r3-preflight.ps1 -SecurityPosture` uses the fixed Development `hhgxrjqkuwdgurphopok`, IPv4 Session Pooler, trusted CA/TLS verify-full, secure password prompt, READ ONLY and ON_ERROR_STOP. It captures the frozen six-frame checks plus the separately hash-pinned aggregate-only security supplement. `node scripts/pilot-r3-preflight.mjs --review` supports both formats. The supplement/helper were tested locally; the Cloud helper was parsed, not invoked here.

Recheck: exact connection routing/project/configuration (SQL `postgres` alone is not project identity); six migration versions/hashes; schema/FKs/checks/indexes/triggers/ownership/search_path/EXECUTE/grants/RLS; all 315 UUID/unique/natural/semantic collision probes and revisions 3/2/2/2; effective allowlist and the **actual owner** from verified Auth, not counts alone; DB/pooler/audit parameter logging for the intended write connection; fresh HTTP anonymous/private-schema denial. The new reviewer BLOCKS known unsafe logging/grants/allowlist metadata and otherwise returns WARNING until owner identity, external logging and HTTP checks are resolved. No automated Cloud fixes or TLS downgrades.

### Shortest execution path, future approval only

1. Complete/confirm the actual group metadata and references once; validate a versioned exact promotion payload. No new schema is needed for honest owner-reviewed personal use. `reviewed_by`/permission wording must disclose that method without claiming independent language verification.
2. Perform requested read-only preflight, review secure real-key transport/logging for the actual target, then obtain approval for **one exact draft transaction**: revalidate target/hash/history/collisions under locks → insert 224 draft public rows + 24 real keys with bind parameters → verify scoped postconditions → COMMIT, or rollback all on error. No overwrite/upsert, activation, users or learner progress.
3. A **separate explicitly approved promotion transaction** rechecks scoped draft bytes/IDs/joins/keys and approved overlay hash → publishes ancestry/vocabulary/grammar/lessons/questions with actual metadata → publishes quizzes last. `is_active` is not required for readability: current Settings/Roadmap picks preferred syllabus, then active, then the first readable syllabus. Do not turn activation into an invented blocker or set it automatically.
4. Verify real Lesson Detail/quiz reads. Study Confirmation and quiz start/submit **still reject Cloud on the server**. Actual learning writes therefore need a separately approved narrowly scoped Development guard change and live mutation acceptance; do not tunnel Cloud through loopback to bypass those guards.

Local evidence for this preparation: full unit/quality checks and protected native suite (15 baseline + 17 protected cases) PASS; 224 public rows/24 synthetic keys bound, rollback/publication constraints/collision/no overwrite/log-canary checks, separate 91-entity promotion and read-only posture capture verified. An OpenSSL DLL collision from Python hashlib was reproduced without data and fixed using CPython's builtin SHA-256; hashes/security checks were not lowered. No real keys entered a database, no Cloud connection, new Auth/RLS/migration, activation, owner-data mutation, push or deploy occurred. App browser/live PASS reports were not recreated.

## Historical assessment (superseded where noted above)

2026-11-13, Asia/Saigon. **Rights decision: PENDING. Protected delivery: LOCAL_PASS cho parameterized synthetic integration; real-store E2E BLOCKED. Publication mapping: PROPOSED, chưa APPROVED và chưa được phép thực thi.** Không đọc answers thật, không ghi Cloud hoặc publish r3 trong nhiệm vụ này.

## 1. Rights decision đã đọc, không tự hoàn thiện

Hồ sơ thực tế: `.local/pilot-hsk1/v1/rights/owner-rights-decision-r3.template.md`. Kết luận dựa trên nội dung thực tế, không chỉ tên `.template`: file có phần owner bổ sung ở dòng 89–111, gồm conditional personal-use acceptance và mô tả nguồn. Không sửa nội dung, tên, thời điểm hoặc chữ ký của hồ sơ.

| Evidence trong file                      | Kết quả                                                                                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact package r3, quiz revisions 3/2/2/2 | Khớp.                                                                                                                                                                                 |
| Manifest SHA-256                         | `dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b` khớp.                                                                                                              |
| Public snapshot SHA-256                  | `2cb3e0d7a667dd6faba633c4df1e87e6dbaee539e19d0cb394e9dcc769c91deb` khớp.                                                                                                              |
| Phạm vi ở dòng 91, 103, 107              | Chỉ một owner tự học, không phân phối/kinh doanh/public release. Chấp nhận **những phần có nguồn gốc/phạm vi đã xác định**, không phải clearance vô điều kiện cho tất cả nội dung.    |
| Actual identity/date/confirmation        | Các trường dòng 80–82 vẫn underscores; dòng gộp 111 còn giá trị dạng placeholder/nhãn, không có ngày thực tế nhận diện được. Chưa xác minh được bộ tên/thời điểm/xác nhận hoàn chỉnh. |
| AI origin, dòng 93                       | Khai AI hỗ trợ bài học/nghĩa/ví dụ/grammar/quiz; tự thừa nhận chưa có bảo đảm originality độc lập. Chưa có bằng chứng terms/inputs/grants cụ thể.                                     |
| HSK, dòng 95                             | Tham khảo bản 11/2025 về facts/readings/categories; không chủ trương đưa toàn văn vào ứng dụng. Đây không phải bằng chứng cấp phép hoặc xác minh mọi nghĩa.                           |
| GB/T, dòng 97                            | Thừa nhận tham khảo chính tả, chưa xác nhận quyền sao chép/phân phối tiêu chuẩn.                                                                                                      |
| pinyin.info, dòng 99                     | Chưa xác minh direct use hoặc quyền sao chép; link trong review không chứng minh đã đọc/sử dụng/được phép.                                                                            |
| Third-party inputs, dòng 101             | Còn `[Tự điền CÓ / KHÔNG / CHƯA RÕ ...]`, chưa xác định phạm vi HelloChinese/sách/từ điển/đề hoặc nguồn khác đã đưa vào authoring.                                                    |
| Attribution, dòng 105                    | Định hướng giữ nguồn HSK/Pinyin/AI theo việc thực dùng là trung thực, nhưng còn điều kiện; cần actual source/use references và rights evidence cụ thể trước approval.                 |

**Blockers chính xác:** actual decision identity/time/confirmation còn thiếu; nhóm E chưa trả lời; nguồn/quyền đã xác minh chưa được khoanh phạm vi/IDs và dẫn evidence; GB/T/pinyin.info còn quyền/direct-use chưa rõ; attribution chưa chốt theo nguồn thực dùng. `distribution_license=null`, `content_license=pending-rights-review` trong frozen package vẫn giữ nguyên; không tạo license hoặc đổi approved thay owner.

Owner cần tự hoàn tất quyết định thực tế: phần nào thực sự dùng trực tiếp, có chép/dịch/chuyển thể không, evidence quyền cho scope cá nhân, phần nào còn pending và attribution cụ thể. Nếu có nội dung ngoài hồ sơ hoặc không đủ quyền, loại khỏi proposed scope hoặc đề xuất biên soạn lại trong revision mới được duyệt; không sửa r3/nhân danh chữ ký hiện tại. Không coi AI-generated hoặc mục đích cá nhân là bảo đảm quyền bên thứ ba.

### Backup bổ sung đã thực hiện

Mở rộng `scripts/private-pilot-backup.ps1 -RightsOnly`: không đọc core private answers; chọn **1 rights record + manifest + SOURCE_SNAPSHOT = 3 files**, result riêng `.local/pilot-hsk1/rights-backup-result.json`. Owner nhập password tại prompt ẩn; archive AES-256/header encryption, test/decrypt/restore và **3/3 hash matches** thực tế PASS. Private digests chỉ trong memory, không ghi báo cáo/log/Git.

Archive: `D:\nam4\prj\backup\hanlearn-rights-r3-46f1a266e59c43dcad3659cf00525a63\rights-r3.7z`. Run bắt đầu `2026-11-13T07:18:01.6701436Z` theo máy local. Chỉ dọn plaintext copies do run đó tạo; archive core 30-file vẫn BACKUP_VERIFIED và không bị sửa/xóa. Backup bảo vệ đúng bytes hồ sơ lúc đó, **không chứng nhận rights**. Nếu owner sửa/hoàn thiện decision sau này cần backup bổ sung mới; không sửa lịch sử archive cũ.

## 2. Protected local adapter đã triển khai

Files: `scripts/protected-local-keys.mjs`, `scripts/protected-key-worker.py`; share **public-only** plan/collision SQL qua `publicDraftParts()` của importer. Không import các modules này từ src/browser, không tạo Cloud/apply mode hoặc nhận target URL tùy ý.

### Data flow và parameterization

1. Generated synthetic envelope hoặc separately authorized real read được giữ trong WeakMap; caller chỉ nhận frozen opaque handle. `JSON.stringify`/console inspection chỉ thấy mode/count, không fields/values/digest riêng.
2. Public package được audit exact r3 hashes, production Zod/source contracts, 24 unique question IDs/key ranges và 4 quiz ID/revision/public-hash bindings. Missing/duplicate/binding mismatch hoặc changed public bytes bị từ chối trước DB.
3. **Đường DB hiện chỉ nhận generated synthetic handles.** Keys đi qua stdin pipe trong memory tới Python isolated worker (`-I -B`); không qua args/env/URL/SQL file. Worker cũng tự từ chối payload không khớp synthetic fixture, không chỉ tin mode của Node.
4. Worker dùng libpq cài local với PostgreSQL 18, **`PQexecParams` extended protocol** cho từng private INSERT: SQL giữ `$1/$2/$3`, values truyền riêng. Không interpolate private payload vào SQL. Parameter read-back chỉ trả số lượng match; thử quote/backslash/newline và Unicode synthetic đạt 24/24. Public INSERTs vẫn dùng frozen public SQL; không có private values trong phần đó.
5. Một SERIALIZABLE transaction: local identity/sentinel + logging gate → BEGIN, timeouts/search_path → khóa 13 tables → 315 collision probes → 224 public draft rows → 24 bound synthetic keys → COMMIT. Lỗi/partial batch rollback toàn bộ; không UPSERT/overwrite hoặc gọi study/quiz mutation RPC.

Legacy `executeSynthetic` vẫn là synthetic-literal fixture runner được kiểm trước đây; **không phải real-key delivery path**. Protected path mới không dùng literal serialization của legacy runner cho keys. Preview cập nhật rõ real DB bị chặn và local adapter còn cần authorization cho real read.

### Local target, logs và errors

- Fresh cluster loopback **127.0.0.1:55449**, database `hanlearn_import_r3_<GUID>` và nonce sentinel. Worker hardcode literal loopback/port, verify database/role/address/port/sentinel bằng bind parameters; không fallback Supabase/service config. Scrub PG/Supabase/Python debug environment; không dùng password/passfile thật.
- Native wrapper chỉ áp đúng sáu migrations/hash vào database mới với Auth shim, không sửa file migration hoặc Cloud. All test users/catalog publication fixtures là synthetic.
- Trước keys worker kiểm `log_statement=none`, `log_min_error_statement=panic`, `log_parameter_max_length_on_error=0`, `log_error_verbosity=terse`, `log_min_messages=panic`, preload libraries rỗng. Không tự đổi cấu hình server để bỏ qua guard. Test âm chỉ đổi verbosity của session synthetic sang verbose và chứng minh bị BLOCKED trước bind/write.
- libpq notice handler bỏ qua text; không gọi/in PQerrorMessage, không echo stderr. Lỗi chỉ trả SQLSTATE/safe code và counts; không failing-row DETAIL hoặc parameter dump. Synthetic canary không xuất hiện trong local PostgreSQL log đã kiểm.
- Đây là bằng chứng local, không chứng nhận log/audit/pooler settings trên Supabase hoặc bảo đảm chống OS heap/swap/crash-dump forensics. Cloud implementation/log boundary vẫn cần review riêng.

### Real reader: code sẵn, chưa được phép chạy E2E

`readApprovedRealStore()` **chưa được gọi với real store**. Nó từ chối non-Windows, browser/Next runtime, CI/Vitest, non-interactive terminal và missing/invalid owner authorization trước khi mở answers. Approval path riêng là `.local/pilot-hsk1/v1/authorizations/real-key-read-r3.json`; **không được tạo hoặc điền approval trong nhiệm vụ này**.

Nếu owner cấp quyền sau, record phải có action `READ_VALIDATE_REAL_KEYS_LOCAL_NO_DB`, approved thật, actual name/confirmation/signedAt, exact packageRevision/manifestHash/snapshotHash. Folder/file ACL owner/SYSTEM, parent inheritance protection và toàn bộ path không reparse được kiểm trước đọc. Reader validate strict JSON/bindings/source, kiểm bytes ổn định bằng digest in-memory; chỉ trả opaque counts handle. Không mặc định authorization file tự chứng minh danh tính/chữ ký mật mã hoặc content-language approval.

**Real handles bị từ chối vô điều kiện bởi DB delivery hiện tại.** Không có real-write/Cloud flag để bật. Trước khi muốn dùng keys thật trong disposable database cần approval riêng và code/security review mở scope đó; không chỉ tạo record đọc hoặc đổi một env var. Unit denial test khóa mọi file read và xác nhận reader thoát mà không mở store.

## 3. Tests thực chạy và giới hạn

| Kiểm tra                                 | Kết quả                                                                                                                                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit suite                               | **208 tests / 21 files PASS**, gồm 8 tests mới: opaque-handle redaction, forged handle, missing key, duplicate ID, binding mismatch, public hash mismatch, real-read denial không file I/O và missing local-target opt-in. |
| Native baseline                          | **15 cases PASS** như offline importer: 248 draft rows, FK/CHECK rollback, constraints/RLS, no overwrite, synthetic publication/sealing.                                                                                   |
| Protected native                         | **12 cases PASS**, dưới đây; result ignored `.local/pilot-importer/protected-result.json`. Alias mới `npm run test:delivery:native`; wrapper `-ProtectedDelivery` đã thực chạy.                                            |
| Public/source validation                 | `npm run content:import:plan` PASS, dùng full Content V1/source validation với synthetic keys.                                                                                                                             |
| contracts/security/typecheck/lint/format | **PASS** cho contracts/security/typecheck/lint/format. Python AST PASS. Không build hoặc live HTTP/JWT test.                                                                                                               |
| Rights supplement                        | BACKUP_VERIFIED, AES/header check + actual test/restore **3/3**; core evidence vẫn 30/30.                                                                                                                                  |

12 protected cases: second allowlisted synthetic user thấy published synthetic catalog; prewrite reject missing key, duplicate ID, binding mismatch; rollback khi failure sau 7 private binds; duplicate PK 23505; FK 23503; logging guard; successful 24-key parameterized commit + Unicode/quote roundtrip; collision/no overwrite; no parameter text trong client error; no canary trong PostgreSQL log. Sau failure, connection mới xác nhận **0 rows** trong toàn bộ 13 import tables, không partial public rows hoặc private rows.

Lần đầu test logging dùng `SET ...=DEFAULT` nên reset về giá trị terse an toàn của cluster và không tạo tình huống unsafe như dự kiến; đã sửa fixture sang verbose rồi chạy lại fresh cluster, 12/12 PASS. Không bỏ qua failure hoặc giảm log gate. Cluster fixtures được stop trong finally; không xóa archive/staging cũ.

**Không chạy `npm run content` trong nhiệm vụ này** vì script đó đọc answers thật. Không chạy reader real validation, real-key exact-match leakage scan hoặc real-key disposable import khi chưa có quyền; static security/public payload checks và synthetic canaries không thay thế real E2E. Không báo real keys đã được parameterized-deliver chỉ vì synthetic pass.

## 4. Publication mapping owner-only

**PROPOSED — ưu tiên không migration, nhưng adoption/execution BLOCKED bởi evidence thiếu.** SQL có thể nhận metadata của một reviewer là owner, không có constraint đòi hai người hoặc field independent reviewer. Nhưng owner risk acceptance/rights declaration không tự biến mọi entity thành reviewed/approved; current 159 decisions vẫn PENDING và chưa có independent language certification.

| Required field/decision | Mapping hợp lệ cần evidence thật                                                                                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| status/review_status    | Syllabus/course/unit/lesson/vocabulary/grammar/quiz/questions phải published/approved cho readable scope. Không đổi r3 source hoặc flip flags bằng importer hiện tại.                                                                    |
| source_uri              | Actual provenance theo entity; giữ reference HSK/Pinyin/AI thực dùng, không dùng URL như license.                                                                                                                                        |
| content_license         | Quyền/authoring declaration thực sự có evidence và đúng personal scope; không tự chọn self-authored, policy identifier hoặc pending-rights-review làm license đã clear.                                                                  |
| reviewed_by/reviewed_at | Actual person/role/time của việc review/approval cụ thể. Không ghi AI, reviewer giả hoặc ngày import thay cho ngày đã review. Owner-reviewed evidence phải ghi method/scope trung thực, không tự nhận independent language verification. |
| syllabus.verified_at    | Actual source/edition verification riêng; không tự điền chỉ vì import. Unknown official totals vẫn bỏ trống.                                                                                                                             |
| published_at của quiz   | Trigger tự ghi sau đủ 5–10 published/reviewed questions và valid keys; quiz publish sau cùng. Không forge thời gian hoặc sửa sealed keys.                                                                                                |
| is_active               | Quyết định riêng cho selection/default; không tự bật, kiểm partial unique active syllabus trước nếu có đề nghị activation.                                                                                                               |

Owner đã có personal acceptance đúng r3, technical backup và preflight cũ PASS; vẫn thiếu signed rights evidence hoàn chỉnh, direct third-party use/permissions, actual reviewer scope/method approval và protected real-read/delivery proof. Policy private-use có thể chấp nhận rủi ro ngôn ngữ trong scope cá nhân, nhưng không miễn rights hoặc tự thay meaning của approved. Cần owner/technical policy decision thật chốt mapping trước khi dùng binary approved; không nới public-release gate.

### Giới hạn owner-only không nới RLS

Current RLS đọc published catalog theo **confirmed allowlisted learner**, không gắn catalog với một owner UUID. Native test tạo **user B synthetic trong disposable DB** và xác nhận B cũng đọc được published synthetic lesson. Không tạo Auth account Cloud.

Phương án không migration: giữ **đúng một owner** trong effective allowlist/confirmed-account scope, bảo vệ operator và không mở public signup; anonymous/outsider không đọc được theo model. Cần kiểm lại trạng thái live read-only riêng, task này không truy vấn Cloud. Đây là giới hạn vận hành dựa trên allowlist, không là per-entity owner enforcement khi sau này thêm learner thứ hai.

Nếu cần per-owner catalog scope dù thêm allowlisted users, hoặc DB lưu/enforce `owner_accepted_private`/review_method/scope riêng, phải có policy/schema/DTO/RLS design và migration được duyệt riêng. Nếu muốn reader đọc draft thay published, đó cũng là thay security contract; không thực hiện để vượt gate.

### Revision và metadata overlay

R3 frozen files/159 records/acceptance giữ nguyên. Sửa source metadata/content làm đổi bytes thì cần revision/review/binding thích hợp và acceptance scope tương ứng. Có thể đề xuất **versioned promotion overlay** riêng bind r3 public snapshot + overlay public hash + actual decision/evidence references; overlay không được tự sinh license, signature hoặc approved claims. Overlay chưa tồn tại/chưa approved ở đây. Validator pilot hiện cố ý draft-only (draft/pending, license placeholder và source shape đã chốt); payload promotion không thể chỉ chạy lại validator đó rồi flip status. Cần validator/contract overlay riêng được review, không nới draft validator để che evidence thiếu; việc này tự nó không đòi sửa sáu migrations nếu vẫn dùng đúng columns hiện có. Không đưa real-key/private integrity digest vào public combined hash/report; dùng opaque protected evidence reference cho key store.

## 5. Approval scope còn thiếu

1. **Real read-only validation local:** owner cho phép đọc đúng answers r3 trong memory để kiểm 24 records/bindings/ACL/bytes ổn định, chỉ in counts/status; không DB/Cloud, không lưu values/digest. Cần actual authorization riêng, không suy từ quyền đọc rights record hoặc backup.
2. **Real keys vào disposable DB:** approval riêng cho exact local fixture/session, logging controls, 224 public draft rows + 24 real keys trong một transaction, rollback/retention và private evidence. Hiện code không có real-write adapter; phải review thêm trước sử dụng. Không được chạy bằng synthetic mode trá hình.
3. **Rights + publication policy/mapping:** actual named/time/confirmed decision, source-use/rights/attribution scope, phương pháp owner review và versioned metadata payload; phần chưa rõ tiếp tục PENDING hoặc loại khỏi scope bằng revision được duyệt.
4. **Cloud transaction riêng**, chỉ sau các gate trên và secure target/log review. Owner acceptance/read-only preflight/private backup/local PASS không phải write approval.

## 6. Exact Cloud transaction đề xuất — chưa thực hiện, chưa có mode

Target duy nhất nếu được duyệt riêng: Development `hhgxrjqkuwdgurphopok`, IPv4 Session Pooler/TLS verify-full/secure local auth đã review. Đọc lại six-migration history/schema/security và collisions sát lần ghi; old preflight chỉ là snapshot.

- **Draft-only proposal:** single transaction và target identity checks → SERIALIZABLE/timeouts + locks → fail-closed collision checks → **224 public draft/pending rows + 24 private real keys bằng parameterized delivery**, bound đúng r3/3-2-2-2/opaque private evidence → postcondition counts/relationships/security → COMMIT. Không seed user/allowlist/audio/cards/progress, không activate hoặc publish. Quyền/source/retention và protected key logging phải được chốt trước, dù draft không readable.
- **Readable personal proposal:** cần approve riêng exact promotion payload. Sau import draft và keys, actual metadata cho **91 public entities** phải hợp lệ; publish ancestry/vocab/grammar/questions, verified_at syllabus có evidence, **4 quizzes publish cuối** sau đủ keys. Có thể nằm cùng transaction nếu toàn bộ overlay/rights đã approved; không tự nối bước này sau draft import. 133 joins không có reviewer/status fields để giả lập approval. Activation nếu muốn là scope riêng rõ ràng.
- Không ghi actual keys vào SQL file, args/env/URL, browser hoặc log. Không dùng literal synthetic runner làm Cloud executor. Nếu không kiểm chứng được server/pooler/audit logging boundary thì BLOCKED thay vì giảm yêu cầu.

### Rollback và live acceptance riêng

Trước COMMIT: bất kỳ lỗi/partial delivery/constraint/collision phải ROLLBACK toàn bộ, connection mới kiểm không có partial writes. Local evidence đã chạy thật; Cloud behavior chưa được xác nhận.

Sau COMMIT: **không tự DELETE/reset/repair**. Published quiz/key immutability và learner evidence FKs có thể chặn việc đảo ngược. Cần recovery/forward-version plan được duyệt riêng; nếu đề xuất tạm ẩn qua parent ancestry thì cũng là Cloud write cần scope cụ thể, không tự chạm sealed quiz. Không hứa “unpublish quiz” sẽ luôn được phép.

Live acceptance cần approval riêng cho read-only SQL/HTTP/Auth checks đúng owner: counts/IDs/revisions/provenance, 24 private keys qua aggregate-only authorized verification, RLS/private schema không expose, anonymous/outsider bị chặn, effective allowlist chỉ owner và UI chỉ nhận safe public fields. Không tạo User B Cloud; không gọi study/quiz submission/completion để thử nếu chưa có mutation approval riêng. Sprint 2.2 Cloud guard và Sprint 1 PARTIAL giữ nguyên; không Sprint 2.3, push hoặc deploy.
