# HSK 1 Pilot r3 — Development read-only preflight

**DEVELOPMENT_PREFLIGHT: PASS** trong phạm vi tương thích schema/security metadata, migration history và catalog collisions đã duyệt. **IMPORT/PUBLISH: BLOCKED, chưa được cấp quyền.** Sprint 1 vẫn PARTIAL; Sprint 2.2 Cloud mutation guard giữ nguyên.

Project `hhgxrjqkuwdgurphopok`. Ngày 2026-11-13, Asia/Saigon. Capture bắt đầu `2026-11-13T05:07:00.2252587Z` theo đồng hồ máy local; owner chạy helper và nhập password tại prompt ẩn, assistant đọc/đối chiếu evidence local sau khi owner xác nhận đã chạy. Không suy thời điểm bắt đầu capture thành timestamp do database chứng thực.

## Bằng chứng và target

- Cross-check public URL local là `https://hhgxrjqkuwdgurphopok.supabase.co`, Session Pooler `aws-1-ap-southeast-2.pooler.supabase.com:5432`, database `postgres`, tenant login `postgres.hhgxrjqkuwdgurphopok`. Backend trả database/role `postgres`, `transaction_read_only=on`. Không dùng riêng tên database để nhận diện project; không truy cập Production.
- psql qua IPv4 được resolve lúc chạy, giữ hostname để TLS kiểm certificate name. Libpq bị ép `verify-full`, trusted project CA `.local/cloud-preflight/prod-supabase.cer`; không giảm TLS hoặc thử endpoint khác. Capture chỉ được chấp nhận khi helper thành công và ghi mode `verify-full`. Không dùng `pg_stat_ssl` của backend để suy TLS của client-to-pooler.
- Evidence ignored: `.local/pilot-r3-preflight/capture.json`, `result.txt`, `review.json`. SHA-256 của result bytes: `bb3c218ead1afb3f26d0452d05f371dc2d3ee4e92c3b7d0a2a69c5ca3e111217`; đối chiếu lại trước review. Result chứa sáu JSON frames đọc metadata/catalog, không answers, credentials hoặc learner state.
- Manifest SHA-256: `dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b`.
- Public snapshot SHA-256: `2cb3e0d7a667dd6faba633c4df1e87e6dbaee539e19d0cb394e9dcc769c91deb`. Tính lại **12/12 public files PASS**, draft revision **3**, quiz revisions **3 / 2 / 2 / 2**, private bindings PASS qua content validation local. Package revision không phải cột Cloud; không tuyên bố r3 đã import khi không có catalog rows tương ứng.

## Audit trước khi kết nối

Đã đọc SQL chính, hai includes và các truy vấn collision; đối chiếu input keys với package public. Không chạy migrations, DML, mutation RPC hoặc function body lấy ra từ metadata. `pg_get_expr`, `pg_get_functiondef`, privilege predicates và JSON aggregates là introspection/built-ins; đọc definition không thực thi definition. Event triggers không được gọi bởi việc đọc catalog.

| SQL đã audit                                            | SHA-256 exact bytes tại capture                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| `supabase/verification/pilot_r3_readonly_preflight.sql` | `e952c38ab4392221b5f7cdaf1df5e44141536f3f4e2dcad162bab63a89fad908` |
| `supabase/verification/cloud_schema_manifest.sql`       | `a19aa25a74c75a4e5846713c6a4400ac9cb812b5a72e2c5d5bd05791835d5c23` |
| `supabase/verification/cloud_platform_security.sql`     | `f123a5632ae35a959db4e1c0897d45973593feec04c2abc332f0f002e7352fbc` |

So với plan trước, SQL được harden local: `SET LOCAL search_path=pg_catalog` để built-ins không bị shadow; backend identity/read-only assertion trước đọc catalog; output JSON cho capture đầy đủ, collision list luôn có kể cả rỗng. Không mở rộng tập catalog rows được đọc, không sửa schema/migrations. Wrapper pin hashes của toàn bộ SQL closure, kiểm trước/sau capture; node reviewer bind lại capture TLS/project/package/SQL hashes với audit hiện tại.

Đã thực thi 8 top-level SELECT trong một transaction: 2 identity/history guards dùng `\gset`, 6 JSON result frames. Toàn bộ 315 input probes cũng được đối chiếu lại với public source records local; 91/91 UUID được bao phủ.

Kết nối dùng psql `-X -w`, `ON_ERROR_STOP=1`, session `default_transaction_read_only=on`; transaction `REPEATABLE READ READ ONLY`, lock timeout 5s, statement timeout 30s, kết thúc `ROLLBACK`. Password chỉ được nhập local qua SecureString, đưa vào môi trường child psql tạm thời, xóa buffer sau chạy; không nằm trong args/connection URL/file/log/Git. Không in raw native errors. Script không có apply/import mode.

## Kết quả đọc Cloud

| Nhóm                             | Kết quả            | Bằng chứng                                                                                                                                 |
| -------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Target/backend/read-only         | PASS               | URL + tenant login được khóa theo project; backend identity/read-only khớp.                                                                |
| Migration history                | PASS               | Đúng sáu versions/names dưới đây, không entry ngoài dự kiến. Sáu local migration hashes cũng khớp reference.                               |
| Schema/security metadata         | PASS               | **9/9 sections** khớp cả counts và canonical hashes với `expected_schema.json`, có phân loại pre-existing function riêng.                  |
| Platform function/wiring         | PASS               | **7/7 checks** về lịch sử tồn tại, metadata/body/definition, event trigger wiring, schema privileges và role flags khớp reviewed baseline. |
| UUID/natural/semantic collisions | PASS               | **315 probes**, **0 matching rows**: 91 UUID, 211 enforced unique/composite-key probes, 13 advisory semantic-duplicate probes.             |
| Active syllabus                  | PASS informational | 0 active syllabus hiện có. Source pilot vẫn inactive; không tự activation.                                                                 |
| Package/quiz revisions           | PASS local binding | r3 và 3/2/2/2 khớp snapshot/private bindings; không có existing quiz collision cần giải quyết revision.                                    |

### Remote migration history cuối cùng

| Version      | Name            | Kết quả |
| ------------ | --------------- | ------- |
| 202611120001 | catalog         | PASS    |
| 202611120002 | srs             | PASS    |
| 202611120003 | quiz            | PASS    |
| 202611120004 | plans_sessions  | PASS    |
| 202611120005 | learner_access  | PASS    |
| 202611120006 | catalog_queries | PASS    |

History được đọc trong cùng snapshot transaction, không apply lại và không repair. History không lưu bằng chứng bytes SQL đã chạy; kết luận dùng thêm hash file local và structural metadata remote, không khẳng định remote migration bytes đã được hash trực tiếp.

### Schema/security compatibility

| Section                  | Actual/reference | Kết quả |
| ------------------------ | ---------------- | ------- |
| Columns                  | 230 / 230        | PASS    |
| Indexes                  | 51 / 51          | PASS    |
| Policies                 | 26 / 26          | PASS    |
| Table triggers           | 6 / 6            | PASS    |
| HanLearn functions       | 30 / 30          | PASS    |
| Relations                | 28 / 28          | PASS    |
| Constraints              | 149 / 149        | PASS    |
| Table privilege records  | 56 / 56          | PASS    |
| Column privilege records | 460 / 460        | PASS    |

26 tables và 2 views; **24/24 public tables bật RLS**. Constraints gồm 26 PK, **39 FK**, 67 CHECK và 17 UNIQUE; definitions/validation và index readiness/definitions khớp reference. Hai views cũng nằm trong structural comparison, gồm metadata options.

30 hàm HanLearn do postgres sở hữu, search_path rỗng; 13 SECURITY DEFINER application functions. Không hàm ứng dụng nào có EXECUTE cho anon/PUBLIC, không relation nào có table SELECT grant cho anon. EXECUTE/grants cho authenticated và column grants được so toàn bộ với reference, không giả mọi authenticated grant đều phải bằng zero. `public.rls_auto_enable()` là **REVIEWED_PREEXISTING**, metadata và body/definition hashes khớp; không bị loại khỏi kiểm chứng hoặc sửa/xóa.

7 event triggers khớp reviewed baseline: `ensure_rls`, `issue_graphql_placeholder`, `issue_pg_cron_access`, `issue_pg_graphql_access`, `issue_pg_net_access`, `pgrst_ddl_watch`, `pgrst_drop_watch`. Không có drift chưa phân loại trong metadata thu được. Như baseline, sáu infrastructure trigger bodies ngoài focused body review; không tuyên bố đã audit mới mọi implementation của Supabase.

Quét leakage local bổ sung trên 257 files, gồm 41 browser chunks hiện có: không exact private payload/explanation matches, không private paths tracked. Hash đối chiếu local xác nhận owner acceptance và answers không đổi; 159 review rows vẫn PENDING. Đây là static/exact-match check, không chứng minh không có bản sao biến đổi hoặc artifacts ngoài workspace.

### Collision coverage

12 tables: syllabus_versions, courses, units, lessons, vocabulary, grammar_points, lesson_quizzes, quiz_questions và bốn syllabus/lesson vocabulary/grammar joins. UUID cho toàn bộ 91 entities. Natural/unique keys: syllabus code; vocabulary `(simplified,pinyin_marked,sense_key)`; unit/lesson parent + sort_order; quiz lesson_id; question quiz_id + sort_order; bốn composite join PKs. Course syllabus/level/title/order và grammar title/pattern là advisory duplicates, không nhầm với unique constraints. Unique `(id,quiz_id)` của quiz_questions được bao phủ chặt hơn bởi UUID id probe; source inactive không thuộc partial unique active-syllabus index. Tất cả **0 collisions** tại snapshot này; không UPSERT/overwrite và không đọc private key rows Cloud.

## Lỗi đã gặp, kiểm thử local và giới hạn

- Ban đầu chưa có secret trong phiên: `-NoPrompt` dừng BLOCKED **trước DNS/kết nối**, đúng fail-closed. Sau đó owner nhập password ẩn qua helper được audit; capture hoàn tất, không cần fallback endpoint/TLS hay retry với phạm vi rộng hơn.
- Không có lỗi SQL/TLS hoặc collision/drift được ghi nhận trong successful capture. Parse Windows PowerShell và audit local PASS.
- `npm run content`, `npm run test:contracts`, `npm run test:security`, `npm run typecheck`, `npm run lint`, `npm run format:check`: **PASS**. `npm run test`: **184 tests / 18 files PASS**, gồm 8 tests mới về package/SQL pin, collision, history/policy/function drift, partial capture và writable identity. Đây là local fixtures/static tests; không dùng Cloud mutation tests.
- Không chạy HTTP/JWT/Auth/Storage probes trong nhiệm vụ này. SQL schema privileges không chứng minh private schema exclusion của Data API live. Không xác nhận expiry/revocation, quyền user B/outsider hoặc owner learning mutations.
- Application function comparison ở đây là metadata/ownership/EXECUTE/search_path; không hash mới toàn bộ 30 application function bodies hoặc chạy RPC. Focused body/definition hash review chỉ cho platform function đã nêu. Không tuyên bố đã chứng minh mọi runtime behavior.
- Read-only preflight không thực thi DML nên không chứng minh importer transaction, trigger failure/rollback, concurrency hoặc immutability runtime. Collisions chỉ đúng tại snapshot capture; cần đối chiếu lại ngay trước mọi import được duyệt.

## Import blockers và đề xuất tiếp theo

**Không có blocker schema/security-metadata/collision phát hiện trong phạm vi preflight. Import readiness vẫn BLOCKED** vì:

1. Rights/attribution chưa clear; `distribution_license=null`, `pending-rights-review` không phải license. Owner acceptance là personal risk decision, không phải independent language review hoặc rights clearance. 159 human-review records vẫn PENDING.
2. Private backup/restore thực tế và private integrity attestation/seal chưa hoàn tất; ACL/ignore/bindings PASS không thay thế các bằng chứng này. Không công bố private hashes/answers/explanations.
3. Chưa có reviewed importer/exact payload transaction được nghiệm thu; source vẫn draft/pending, import/publish authorization false, syllabus inactive/verified_at null. Chưa có mapping bằng chứng thực sang publication metadata; không tự giả reviewer/date/license hoặc nới constraints.
4. Chưa có approval ghi Development. Read-only approval và acceptance không cấp quyền import/publish hoặc study mutations.

Đề xuất: chốt rights/private management và phạm vi **draft-only hoặc readable personal pilot**; chuẩn bị importer offline, exact payload/hash/IDs/counts, safe private-key delivery và rollback policy. Kiểm FK ordering syllabus → course → unit, vocabulary/grammar → lessons → joins → quiz/questions → private keys; publication chỉ sau khi keys/rights/review evidence đáp ứng constraints. Không dùng blind upsert cho bất kỳ collision nào; dừng để có quyết định riêng. Trước lần ghi được duyệt, đọc lại history/schema/collisions vì snapshot này không khóa trạng thái Cloud mãi mãi.

Approval ghi cần xin riêng cho **catalog/joins/quiz/question/private-key import transaction** và phạm vi publication/metadata promotion; Cloud study/quiz/completion/card mutations là scope riêng. Auth/allowlist/Storage/DDL/migrations và push/deploy vẫn ngoài phạm vi. Không bắt đầu import, thay Cloud guard hoặc ghi tiến độ học sau báo cáo này.

## File thay đổi và lệnh tái kiểm local

- Báo cáo này.
- `supabase/verification/pilot_r3_readonly_preflight.sql`: hardening read-only identity/search_path và output format; không migration.
- `scripts/pilot-r3-preflight.ps1`: fixed-target secure capture và offline review, không Cloud write mode.
- `scripts/pilot-r3-preflight.mjs`: offline hash audit + evidence comparison; `--review` không mở kết nối.
- `tests/pilot-r3-preflight.test.ts`: 8 local regression cases.

```powershell
node scripts/pilot-r3-preflight.mjs --audit
node scripts/pilot-r3-preflight.mjs --review
```

Hai lệnh trên chỉ đọc local files. Cloud helper đã hoàn tất trong nhiệm vụ này; không cần chạy lại để xem báo cáo. Không sửa owner acceptance, private answers, content revision, review records, migrations hoặc application guard; không import/publish/push/deploy.
