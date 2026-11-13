# HSK 1 Pilot r3 — offline importer verification

2026-11-13, Asia/Saigon. **OFFLINE_IMPORTER: PASS — draft-only plan và thực thi trên native PostgreSQL disposable với synthetic keys.** **Real private-key delivery / Cloud import / readable r3 publication: BLOCKED.** Không kết nối Supabase, không thay content/159 PENDING records, owner acceptance, migrations, RLS hoặc Sprint 2.2 Cloud guard.

## Exact package và phạm vi

- Package `hanlearn-pilot-hsk1-v1`, draft revision **3**, quiz revisions **3/2/2/2**.
- Manifest SHA-256 `dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b`.
- Public snapshot SHA-256 `2cb3e0d7a667dd6faba633c4df1e87e6dbaee539e19d0cb394e9dcc769c91deb`.
- File audit kiểm 12 public files và sáu local migration hashes. Reuse Content V1/Zod và `validatePilot` cho IDs, ancestry, joins, unique section IDs, source-cache hashes, source contracts và quiz bindings. So parsed in-memory package với exact source đã freeze để chặn thay đổi payload sau file audit.
- Preview chỉ có table order/counts, mode và gates; không chứa keys, explanations, private store digest hoặc private payload. CLI chỉ hỗ trợ `--preview`; không có Cloud/apply/real-key flag.

## Owner rights decision template

Đã tạo **`.local/pilot-hsk1/v1/rights/owner-rights-decision-r3.template.md`**, Git ignored. Thư mục rights tắt kế thừa; folder/file ACL chỉ current Windows owner/SYSTEM. Không sửa acceptance hiện tại, không điền tên/ngày/chữ ký hoặc quyết định.

Mẫu có exact public revision/hashes và năm nhóm: AI-assisted original drafting; HSK lexical/grammar facts; GB/T pinyin reference; nguồn chỉ được nhắc trong AI review; nguồn bên thứ ba chưa rõ quyền. Mỗi nhóm có actual inputs/copy/adaptation scope, evidence quyền đã kiểm, attribution, phần chưa kiểm và xử lý rủi ro. Owner tự xác nhận phạm vi personal use, role thật, ngày/chữ ký và private evidence reference không chứa keys/digests.

**RIGHTS_PENDING**; template PENDING không phải evidence approval, không tự cấp license hoặc thay `distribution_license`/`content_license`. Template mới nằm ngoài 11 private files trong archive đã BACKUP_VERIFIED; archive 30-file cũ vẫn có giá trị cho core r3, nhưng **không bao gồm quyết định rights mới**. Sau khi owner điền thật cần bổ sung vào backup inventory/restore workflow theo scope riêng; không tự sửa/xóa archive hoặc staging cũ.

## Implementation và FK plan

`scripts/pilot-r3-importer.mjs` không đọc `.env`, `answers.json`, owner identity hoặc backup password. `syntheticDelivery()` tạo 24 records và 4 public quiz bindings bằng công thức test độc lập với teaching answers; explanation rõ synthetic, không phải lời giải học tập. WeakSet branding và kiểm lại canonical synthetic envelope từ chối JSON store bên ngoài, thiếu key, changed binding hoặc sửa nội dung key. Chế độ real delivery chưa triển khai.

| Thứ tự | Table                      | Dòng                                 |
| ------ | -------------------------- | ------------------------------------ |
| 1      | public.syllabus_versions   | 1                                    |
| 2      | public.courses             | 1                                    |
| 3      | public.units               | 1                                    |
| 4      | public.vocabulary          | 44                                   |
| 5      | public.grammar_points      | 12                                   |
| 6      | public.lessons             | 4, tổng 29 sections                  |
| 7      | public.syllabus_vocabulary | 43; không tự gán membership cho 越南 |
| 8      | public.syllabus_grammar    | 12                                   |
| 9      | public.lesson_vocabulary   | 66                                   |
| 10     | public.lesson_grammar      | 12                                   |
| 11     | public.lesson_quizzes      | 4                                    |
| 12     | public.quiz_questions      | 24                                   |
| 13     | private.quiz_answer_keys   | 24 synthetic-only                    |

**224 public rows + 24 synthetic keys = 248 rows.** Các payload public chỉ là bản sao draft trong disposable fixture; không publish nội dung r3 hoặc đưa private answers thật vào database nào. Publication-positive tests dùng **catalog hoàn toàn synthetic khác IDs/text**, metadata được ghi rõ synthetic, không giả người duyệt thật.

Mỗi import thử là **một SERIALIZABLE transaction**: fixed search_path, standard_conforming_strings on, timeouts → khóa toàn bộ 13 tables bằng SHARE ROW EXCLUSIVE → kiểm 315 frozen public probes → INSERT theo thứ tự trên → COMMIT hoặc explicit ROLLBACK. Guard xử lý 91 UUID, 211 unique/composite keys và 13 advisory semantic duplicates; bất kỳ match nào đều raise 23505, không tự phân loại thành update/retry thành công. Không UPSERT, overwrite, seed owner hoặc tạo cards/progress.

INSERT dùng explicit columns và `jsonb_populate_recordset` với identifiers giới hạn, JSON literal escape trong **fixture-only** executor. Statement/parameters chứa synthetic keys không được export từ CLI. Đây không phải protected SQL delivery cho keys thật; không được chuyển cách literal serialization này sang Cloud bằng việc đổi hostname.

## Local target isolation

`npm run test:importer:native` tạo cluster mới dưới `.local/pilot-importer/cluster-<GUID>`, chỉ bind **127.0.0.1:55449**, database `hanlearn_import_r3_<32 hex>`. Không dùng cluster native cũ, `.env` hoặc target URL của user. Chính xác sáu migration names/hashes phải khớp trước khi áp vào DB mới, sau Auth shim riêng.

Executor không nhận hostname/URL tùy ý: chỉ binary psql local, literal loopback/port, database prefix + nonce + explicit synthetic-disposable flag. Mọi query kiểm `current_database`, role postgres, server address/port và nonce sentinel của chính fresh database trước SQL. PG connection env được scrub/override; không lấy `.pgpass` mặc định. Session object được đóng băng và brand-check, không nhận connector giả. Đây là guard chống nhầm target cho trusted operator, không phải sandbox ngăn người có quyền shell chạy chương trình khác.

Native logs của cluster mới tắt statement/error-statement/parameter logging; stdin SQL và raw errors không được đưa vào report. Database test result chỉ chứa counts/case statuses/SQLSTATE và cờ synthetic; không lưu private integrity hashes. Cluster được stop trong finally; data directory fixture mới giữ local ignored, không xóa staging/backup đã có.

Lần bootstrap đầu gặp timeout của hệ thống duyệt công cụ, retry được phép sau timeout; không phải xác định hành động nguy hiểm. Sau đó wrapper Windows bị giữ pipe do background PostgreSQL kế thừa handle. Đã dừng **đúng cluster mới vừa tạo**, sửa pg_ctl bằng process riêng hidden + log files + WaitForExit trên pg_ctl, rồi chạy lại trên cluster mới. Các lần hoàn tất dưới đây mới được tính PASS; không bỏ qua lần lỗi hoặc tái dùng DB chưa sạch.

## Transaction / rollback evidence thực tế

`npm run test:importer:native` thực chạy trên **PostgreSQL 18.4 native + Auth shim**, không Docker/Supabase. Kết quả `.local/pilot-importer/database-result.json`, 15 cases PASS; wrapper đã stop cluster riêng sau run. Counts của result là mốc sau successful draft transaction trước khi harness dọn/reset các fixture tables để chạy cases tiếp; không phải tuyên bố final database còn giữ catalog r3. Publication-positive fixture cuối dùng dữ liệu synthetic riêng.

| Case thực chạy                                 | Kết quả / evidence                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------- |
| Explicit rollback sau đủ import statements     | PASS, tổng rows 0 → 0.                                                          |
| FK failure sau lessons đã INSERT               | PASS, SQLSTATE **23503**, tổng 0 → 0.                                           |
| CHECK failure sau private keys đã INSERT       | PASS, **23514**, tổng 0 → 0.                                                    |
| Draft-only COMMIT                              | PASS, 0 → **248**; đủ counts ở cả 13 tables.                                    |
| Từng table/join count sau commit               | PASS, 43/12 syllabus joins, 66/12 lesson joins, 24 synthetic keys.              |
| Import lặp cùng IDs                            | PASS fail-closed **23505**, tổng 248 → 248; không overwrite.                    |
| Synthetic allowlisted learner đọc draft        | PASS, 0 lessons visible.                                                        |
| Learner đọc private key table                  | PASS bị từ chối **42501**.                                                      |
| Publish lesson r3 thiếu approval metadata      | PASS bị từ chối **23514**, row vẫn draft.                                       |
| Syllabus thiếu verified_at                     | PASS bị từ chối **23514**, row vẫn draft dù metadata khác có giá trị synthetic. |
| Vocabulary natural-key collision với UUID khác | PASS **23505**, giữ đúng một row fixture đã seed, không thêm row import.        |
| Grammar semantic duplicate                     | PASS **23505**, giữ đúng một fixture, không import.                             |
| Quiz synthetic thiếu private keys              | PASS không seal, **23514**.                                                     |
| Synthetic published ancestry đủ metadata       | PASS, synthetic learner đọc được 1 lesson synthetic. Không publish r3.          |
| Sửa synthetic keys sau seal                    | PASS bị từ chối **55000**.                                                      |

Lỗi SQL làm psql ON_ERROR_STOP đóng connection; PostgreSQL rollback transaction chưa COMMIT. Đếm lại qua **connection mới** chứng minh không còn partial rows. Explicit ROLLBACK và error rollback đều được chạy, không chỉ kiểm string SQL. Table locks/serializable được triển khai; chưa chạy stress/concurrent importer tests hoặc chứng nhận hành vi Supabase/pooler thực.

## Publication mapping và conflict hiện tại

**Draft-only feasible:** DB chấp nhận draft/pending, reviewer/time null, inactive/unverified syllabus và pending-rights-review; importer giữ nguyên metadata. Điều này không cấp quyền import thật: rights decision và write approval vẫn cần. RLS/reader tiếp tục giấu draft khỏi learner.

**Readable personal r3 hiện BLOCKED:**

- Syllabus/course/unit/lesson, vocabulary/grammar liên quan, quiz và questions cần `status=published`, `review_status=approved` với nonempty `source_uri`, `content_license`, `reviewed_by`, `reviewed_at` thực tế. Parent ancestry và hai đầu joins phải readable.
- Syllabus cần `verified_at` và exact edition; unknown official cumulative totals vẫn bỏ trống, không bịa số. `is_active` là lựa chọn syllabus/default và partial-unique gate riêng, không tự bật chỉ vì publication; test RLS visibility không yêu cầu active.
- Quiz cần 5–10 questions published/reviewed và đủ valid keys, publish quiz **sau cùng**; trigger tự ghi `published_at` và đóng băng. Không tự đặt timestamp hoặc sửa sealed keys để ép thành công.
- `self-authored` chỉ dùng khi có author/reviewer/source evidence phù hợp. Không đặt `AI` hoặc reviewer giả; `pending-rights-review`, policy identifier hay URL công khai không tự trở thành license. DB chỉ kiểm metadata có giá trị, **không chứng minh quyền hoặc năng lực reviewer**.
- SQL không có constraint bắt hai người khác nhau hoặc cờ independent language review. DOMAIN_CONTRACTS/PILOT_CONTENT_PLAN cho actual named role/evidence; workflow human-review độc lập là gate chính sách mạnh hơn. Owner acceptance hiện có là personal risk acceptance/phạm vi tự khai, không tự chứng minh từng entity được approved hoặc 159 decisions đã PASS.

Phương án hợp lệ cần **quyết định chính sách riêng** nhận owner-reviewed personal evidence, định nghĩa honest meaning của approved trong scope cá nhân, actor/date/evidence thực và rights/attribution đã xác nhận; independent language review vẫn PENDING/chưa có. Giữ evidence/method của owner ở protected decision/audit mapping, không nhét thuộc tính lạ vào Content V1. Có thể không cần DDL nếu chỉ dùng đúng fields hiện có, nhưng mapping hiện **chưa được duyệt**; phải review payload/revision hoặc metadata overlay hash mới trước mọi promotion, không dùng acceptance hash cũ cho bytes mới.

Nếu muốn lưu method/access_scope/owner_accepted_private như field/state có enforcement DB, enum hiện chỉ pending/approved nên cần thiết kế schema/migration, types/validators/policies/queries và approval riêng. Nếu muốn reader thấy draft bằng ngoại lệ owner, đó là thay RLS/security contract, cũng cần migration/security review riêng. Không thực hiện hai hướng này trong nhiệm vụ. Không nới public-release gates.

## Protected real-key delivery — thiết kế để review, chưa triển khai

1. Operator đọc exact store từ nguồn ACL owner/SYSTEM hoặc giải mã backup bằng prompt riêng, xác nhận opaque private integrity/review evidence; không đưa digest/key vào preview/Git. Template rights và actual evidence phải được review trước, không coi pending là grant.
2. Một broker server/local-trusted truyền **in-memory stream/OS pipe** cho một importer process được review, không command args/env/public SQL files/browser/API props. Validate 24 records, unique IDs, key range theo choices, exact quiz revisions và public hashes trước transaction; không suy đáp án từ public choices.
3. Driver DB riêng dùng parameterized delivery trong cùng transaction có target/schema/history/collision locks, không literal dump keys. Sanitize lỗi ở client **và kiểm server/pooler/audit logging** để không ghi bind values hoặc failing-row DETAIL; dry-run synthetic trước. Nếu không xác minh được log boundary thì real delivery BLOCKED, không tự đổi Cloud logging/settings.
4. Không expose private schema; không dùng browser/service-role frontend. Mọi trường hợp mismatch/partial batch phải rollback. Chỉ công bố row counts/opaque evidence references. Release quyền operator, retention và future secret access phải có scope riêng.

Implementation hiện chỉ chấp nhận generated synthetic envelope; không có CLI hoặc adapter để đọc real store. Thêm adapter thật/Cloud executor cần code/security review và approval riêng, không chỉ đổi một env var hoặc bật flag.

## Kiểm thử và file bàn giao

- `npm run content:import:plan`: PASS, safe counts-only preview.
- `npm run test:importer:native`: **15 database cases PASS**, 248 draft rows + synthetic publication fixtures, rollback/constraints/RLS thực.
- `npm run test`: **200 tests / 20 files PASS**, gồm 9 tests importer về duplicate UUID, FK, missing key, forged envelope/bindings, valid-schema hash mismatch, safe preview, target/session guards.
- `npm run content`, contracts/security, typecheck/lint/format: **PASS** sau kiểm tra cuối; content source vẫn draft/pending và importReadiness BLOCKED. Leakage scan 267 tracked/unignored/artifact files (41 browser chunks baseline) không có exact private payload/explanation matches; không phải bảo đảm against transformed copies hoặc ngoài workspace. Typecheck lần đầu phát hiện vị trí directive ESM bị formatter tách dòng; đã sửa namespace import và chạy lại PASS, không bỏ qua lỗi.

Source: `scripts/pilot-r3-importer.mjs`; native fixture driver `scripts/test-pilot-importer-db.mjs`; fresh-cluster wrapper `scripts/test-pilot-importer-native.ps1`; unit tests `tests/pilot-importer.test.ts`; hai npm scripts mới trong package.json. Template rights chỉ local ignored, không commit owner-specific evidence. Không chạy authoring/remediation scripts hoặc sửa backup archives.

## Trước khi ghi Development — approval chính xác còn cần

1. Owner tự hoàn tất rights decision đúng scope/source/attribution; kiểm evidence và phạm vi actor/review thực. Chưa có tên/ngày/chữ ký/approval nào được agent tạo.
2. Chốt publication route (draft-only hoặc readable personal) và actual metadata; giữ rõ thiếu independent language certification. Hoàn tất protected private review/integrity/delivery và backup có bao gồm quyết định rights mới khi cần.
3. Review importer **real-key/Cloud** implementation còn thiếu, exact payload/hash/IDs/counts, single transaction/rollback/collision policy và log boundary. Test native/synthetic không tự chứng nhận Cloud.
4. Đọc lại đúng Development `hhgxrjqkuwdgurphopok` history/schema/collisions sát lần ghi theo quyền được duyệt; preflight PASS trước đây chỉ là snapshot. Xin approval **riêng** cho exact catalog/joins/questions/private-key import transaction và publication/metadata promotion nếu có; không suy từ owner acceptance/backup/native PASS.
5. Cloud study/quiz/completion/card mutations, Auth/allowlist/Storage/DDL/migration, guard change hoặc deploy/push là các scope riêng. Không bắt đầu bất kỳ bước ghi nào sau báo cáo này.
