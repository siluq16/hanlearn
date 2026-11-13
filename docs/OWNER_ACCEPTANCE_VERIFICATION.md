# Owner acceptance verification — HSK 1 Pilot revision 3

2026-11-13, Asia/Saigon. **ACCEPTANCE_RECORDED** cho `AI_REVIEWED_OWNER_ACCEPTED_PRIVATE_USE`, giới hạn tự học cá nhân. **Import readiness BLOCKED. Development preflight: PREPARED, NOT EXECUTED, chưa được cấp quyền trong nhiệm vụ này.** Sprint 1 vẫn PARTIAL; Cloud mutation guard Sprint 2.2 giữ nguyên.

## Bằng chứng local và giới hạn

Đọc hồ sơ owner thực tế `.local/pilot-hsk1/v1/private/owner-acceptance-r3.md` (106 dòng), package r3 và hồ sơ review tương ứng. Owner cũng xác nhận chính sách/phạm vi qua yêu cầu hiện tại. Không sửa hồ sơ riêng, tên, thời điểm, chữ ký hoặc phạm vi đã xem; không chép các giá trị nhận dạng vào báo cáo chung. Các báo cáo/packet trước đây giữ nguyên như lịch sử; trạng thái “chưa có acceptance” trong tài liệu cũ được cập nhật bằng báo cáo mới này, không sửa thành chứng cứ đã có tại thời điểm cũ.

| Nội dung kiểm tra                      | Kết quả          | Vị trí/bằng chứng                                                                                                                                                                                                                                                                                           |
| -------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File tồn tại, Git ignored              | PASS             | Đường dẫn trên; `git check-ignore` khớp `.local/`; không có file `.local/pilot-hsk1` tracked hoặc commit tại đường dẫn đó trong các refs local hiện có.                                                                                                                                                     |
| ACL thư mục/private files              | PASS local       | Thư mục private tắt kế thừa; ACL thư mục, acceptance và answers chỉ current Windows owner/SYSTEM; không reparse point. Hai file kế thừa từ parent đã hạn chế là hợp lệ. Đây không phải chứng nhận mã hóa ổ đĩa hoặc backup.                                                                                 |
| Quyết định chính sách và nội dung      | PRESENT          | Dòng 15–21: chấp thuận policy và revision 3 cho mục đích cá nhân, không phải quyết định có điều kiện.                                                                                                                                                                                                       |
| Phạm vi thực sự đã xem                 | PRESENT, LIMITED | Dòng 34–41: owner mô tả tài liệu đã xem và tự nêu chưa rà thủ công toàn bộ từng mục/private answers. Không diễn giải thành đã kiểm 159 nội dung.                                                                                                                                                            |
| Rủi ro còn chấp nhận                   | PRESENT          | Dòng 43–49 và 77–86; gồm giới hạn AI/ngôn ngữ/private/rights theo tự khai của owner.                                                                                                                                                                                                                        |
| Tên thực tế và ngày giờ                | PRESENT          | Dòng 90–91 có tên không phải placeholder, timestamp ISO8601 có timezone, parse được và không ở tương lai tại thời điểm kiểm tra. Không tự điền hoặc công bố tên/thời điểm.                                                                                                                                  |
| Xác nhận thực tế                       | PRESENT          | Dòng 98–101 có xác nhận nhiều dòng chấp nhận revision 3 trong phạm vi cá nhân. Không coi xác nhận văn bản là chữ ký số được kiểm định hay bằng chứng danh tính độc lập.                                                                                                                                     |
| Revision/hashes ghi trong hồ sơ        | PASS             | Dòng 5–11 và 92–96 khớp package hiện tại; quiz revisions **3 / 2 / 2 / 2**.                                                                                                                                                                                                                                 |
| Trạng thái tự đối chiếu hash của owner | LIMITATION       | Dòng 97 ghi “Chờ xác minh bằng lệnh kiểm tra trên máy local.” Phép kiểm tra kỹ thuật được thực hiện trong lượt này và PASS riêng bên dưới; không sửa dòng đó hoặc tuyên bố owner tự chạy phép kiểm. Hồ sơ đã có quyết định chấp nhận thực tế và binding hash đúng, nên câu này không làm mất quyết định đó. |

Không thiếu trường bắt buộc về quyết định/phạm vi/tên/thời điểm/xác nhận/rủi ro trong hồ sơ đã đọc. `ACCEPTANCE_RECORDED` chỉ xác nhận có bản ghi phù hợp, không xác thực danh tính ngoài máy hoặc chứng minh người ký đã đọc nhiều hơn phạm vi họ tự khai.

### Hash freeze

- Manifest SHA-256: `dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b`.
- Public package snapshot SHA-256: `2cb3e0d7a667dd6faba633c4df1e87e6dbaee539e19d0cb394e9dcc769c91deb`.
- Tính lại SHA-256 từng file và đối chiếu [SOURCE_SNAPSHOT r3](human-review/pilot-hsk1-r3/SOURCE_SNAPSHOT.json): **12/12 file PASS**. Snapshot là SHA-256 của UTF-8 `JSON.stringify(files)` không newline; danh sách `{path,sha256}` sắp theo path, gồm manifest và 11 JSON dữ liệu. Không hash nhầm toàn bộ SOURCE_SNAPSHOT thành package snapshot.
- Nội dung giữ **4 lessons / 29 sections / 44 vocabulary / 12 grammar / 24 questions**; không đổi IDs, revision hoặc publication flags. Sáu migration hashes local khớp `supabase/verification/expected_schema.json`.
- **159/159 review records r3 vẫn PENDING**, reviewer/date chưa điền; không biến owner acceptance thành từng dòng PASS. Packet r2 không thay đổi.

## Phân biệt các gate

| Gate                        | Trạng thái và việc còn thiếu                                                                                                                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Private owner acceptance    | RECORDED theo chính sách owner đã chấp thuận; chỉ tự học cá nhân, không cấp quyền Cloud.                                                                                                                                                                                              |
| AI review                   | Đã có hỗ trợ kỹ thuật/ngôn ngữ; không phải chứng nhận độc lập hoặc đảm bảo không còn lỗi.                                                                                                                                                                                             |
| Independent language review | CHƯA CÓ; pinyin/thanh điệu, sắc thái nghĩa, tính duy nhất câu hỏi, độ tự nhiên hội thoại và tải bài 3 chưa có chứng nhận độc lập. Owner chấp nhận rủi ro này không đồng nghĩa human-review PASS.                                                                                      |
| Source membership           | 43 headwords/readings theo evidence hiện có; 越南 bổ trợ. Membership không xác minh toàn bộ nghĩa/ví dụ, không cấp license. Không tra nguồn Internet mới trong nhiệm vụ này.                                                                                                          |
| Rights/attribution          | CHƯA CLEAR: owner có khai nguồn gốc AI hỗ trợ tự biên soạn và giới hạn; `distribution_license=null`, metadata `pending-rights-review` chưa phải license. Cần chốt quyền dùng/attribution cho đúng phạm vi và từng nguồn/tài sản thực tế; personal use không tự hợp thức hóa sao chép. |
| Private management          | ACL/ignore/bindings PASS; private human attestation/integrity seal và backup/restore thực tế chưa hoàn tất. Hồ sơ mô tả backup **dự kiến**, không phải bằng chứng phục hồi thành công. Không đưa private digest vào báo cáo chung.                                                    |
| Publication contract        | Toàn bộ dữ liệu vẫn draft/pending, import/publish authorization false, syllabus inactive/verified_at null. Chưa có mapping bằng chứng owner/rights sang metadata database được duyệt. Không tự điền approved/reviewed_by/time hoặc nới constraints để dữ liệu readable.               |

### Private store và leakage

Protected helper `-PrepareOnly` PASS ACL/snapshot/bindings của **24 câu**, package revision 3 và bốn quiz bindings. Không mở GUI, không xem thay owner hoặc ghi kết quả human review. Không có private answer/input-report path tracked; `git log --all -- .local/pilot-hsk1` không trả commit trong các refs local hiện có.

Quét **253 files**, gồm tracked/unignored files, public assets và **41 browser chunks hiện có**: không thấy nguyên văn private file payload hoặc private explanations. Static security scan PASS. Không công bố correct_index, explanations, answer vectors hoặc private hashes. Đây là exact-match/static scan, không chứng minh không có bản sao đã biến đổi, dữ liệu trong unreachable Git objects, remote refs chưa fetch, máy khác hoặc lịch sử artifacts ngoài workspace. Không tạo frontend build mới trong lượt này.

## Development preflight đã chuẩn bị, chưa chạy

Artifact: [pilot_r3_readonly_preflight.sql](../supabase/verification/pilot_r3_readonly_preflight.sql), frozen theo snapshot r3 trên. Có **315 collision probes / 12 public catalog tables**, trong đó **91 UUID probes**; không chứa answers, explanations hoặc dữ liệu học. File này là verification SQL, không phải migration/importer.

### Checklist trước khi được thực thi

- [ ] Có approval riêng cho **read-only Development preflight**, project `hhgxrjqkuwdgurphopok`, phạm vi metadata/catalog collisions. Hiện yêu cầu này cấm kết nối Cloud nên chưa thực thi.
- [ ] Kiểm lại hash freeze, six local migration hashes và SQL/includes trước chạy; dữ liệu hoặc SQL thay đổi phải review lại. `npm run content` và private `-PrepareOnly` vẫn PASS.
- [ ] Đối chiếu Dashboard/config chính xác Development reference, pooler host, database/user; database tên postgres một mình không chứng minh đúng project. Không dùng Production.
- [ ] Đối chiếu Session Pooler `aws-1-ap-southeast-2.pooler.supabase.com:5432`, database `postgres`, user `postgres.hhgxrjqkuwdgurphopok`. Resolve IPv4 sau khi được cấp quyền; không hardcode IP cũ. Giữ hostname để verify-full kiểm certificate name.
- [ ] Dùng trusted project CA `.local/cloud-preflight/prod-supabase.cer`, TLS verify-full; không downgrade khi lỗi. psql executable và CA file hiện có local; việc tồn tại file không thay thế kiểm chứng TLS live.
- [ ] Xác thực qua prompt ẩn local `psql -W`, không URL có password, debug logging, transcript hoặc credentials trong chat/file báo cáo.

### Lệnh dự kiến — CHƯA CHẠY, chỉ sau approval riêng

Chạy tại repository bằng Windows PowerShell. Không truyền mật khẩu qua biến/args; psql tự hỏi ẩn. Command này không import, không dùng Supabase CLI `db push`.

```powershell
$ErrorActionPreference = 'Stop'
$pooler = 'aws-1-ap-southeast-2.pooler.supabase.com'
$ipv4 = @(Resolve-DnsName -Name $pooler -Type A -ErrorAction Stop |
    Where-Object { $_.IPAddress -match '^\d+\.\d+\.\d+\.\d+$' } |
    Select-Object -ExpandProperty IPAddress)
if ($ipv4.Count -eq 0) { throw 'BLOCKED: no IPv4 address' }
$ca = (Resolve-Path '.local/cloud-preflight/prod-supabase.cer').Path.Replace('\','/')
$connection = "host=$pooler hostaddr=$($ipv4[0]) port=5432 dbname=postgres user=postgres.hhgxrjqkuwdgurphopok sslmode=verify-full sslrootcert='$ca' connect_timeout=15 options='-c default_transaction_read_only=on'"
$previousEncoding = $env:PGCLIENTENCODING
try {
    $env:PGCLIENTENCODING = 'UTF8'
    & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -X -W `
        --dbname $connection --set ON_ERROR_STOP=1 `
        --file 'supabase/verification/pilot_r3_readonly_preflight.sql'
    if ($LASTEXITCODE -ne 0) { throw 'BLOCKED: read-only preflight failed; stop and inspect safely' }
} finally {
    $env:PGCLIENTENCODING = $previousEncoding
}
```

Không chạy `cloud-preflight.ps1` fresh-install vì helper đó đòi migration history trống; database hiện đã có sáu migrations. Không dùng helper apply/check-cloud có mutation probes. Không thử INSERT rồi ROLLBACK để gọi là read-only.

### Phạm vi đối chiếu và điều kiện dừng

1. **History:** SQL dừng nếu remote versions/names không đúng chính xác sáu migrations `202611120001_catalog`, `202611120002_srs`, `202611120003_quiz`, `202611120004_plans_sessions`, `202611120005_learner_access`, `202611120006_catalog_queries`. History không tự chứng minh bytes SQL remote; kết hợp local migration hashes và structural metadata.
2. **Schema/security:** reuse SELECT-only `cloud_schema_manifest.sql` và `cloud_platform_security.sql` trong cùng REPEATABLE READ READ ONLY transaction, ON_ERROR_STOP; kết thúc ROLLBACK. Đối chiếu columns/types/nullability/defaults, constraints/FKs, valid indexes, publication/sealing triggers, policies/RLS, anon/authenticated grants, function ownership/EXECUTE/search_path và schema privileges với `expected_schema.json` và `reviewed_platform.json`. Phân loại riêng platform `public.rls_auto_enable()`/event trigger, không bỏ qua khác biệt chưa phân loại. SQL chạy thành công chưa đồng nghĩa metadata PASS. Metadata không chứng minh HTTP exposure hoặc JWT/RLS runtime; nếu cần HTTP, xin phạm vi riêng cho các GET/read RPC an toàn, không tự mở mạng trong lượt này.
3. **UUID:** so tất cả IDs syllabus/course/unit/lesson/vocabulary/grammar/quiz/question; collision kể cả draft cùng ID phải BLOCKED, không suy là retry an toàn.
4. **Unique/natural keys:** syllabus code; vocabulary `(simplified,pinyin_marked,sense_key)`; unit `(course_id,sort_order)`; lesson `(unit_id,sort_order)`; quiz `lesson_id`; question `(quiz_id,sort_order)`; bốn loại joins theo composite PK. Courses `(syllabus_id,hsk_level,title,sort_order)` và grammar `(title,pattern)` chỉ là **advisory semantic duplicates**, không giả là constraints unique. Active syllabus count riêng cho partial unique index; source hiện inactive, không activation tự động.
5. **Revision:** public quiz revisions 3/2/2/2, private bindings khớp exact public hashes. SQL trả revision hiện có khi quiz collision; mọi collision phải có quyết định riêng, không blind upsert/overwrite. Không đọc private keys Cloud hoặc learner state để kiểm collision. Package draft_revision là offline metadata, không có cột database tương ứng; phải bind qua audit/import payload sau này.
6. **Kết luận:** mọi UUID/UNIQUE collision, history drift, schema/security difference chưa giải thích hoặc lỗi query đều dừng BLOCKED; ADVISORY rows phải được phân loại. Zero collision không thay thế kiểm rights, Auth hay transaction import. Không auto repair, reset hoặc schema changes. SQL chưa được chạy trên PostgreSQL trong nhiệm vụ này; cần kiểm parser/runtime sau approval đọc Cloud, không tuyên bố PASS SQL execution.

## Import transaction — kế hoạch, không cấp quyền ghi

- Chưa có importer production-ready được nghiệm thu. Trước khi xin quyền ghi phải có exact payload hash/revision/IDs/counts, collision policy, protected key delivery và reviewed importer; không tái sử dụng owner acceptance làm approval.
- Một transaction dự kiến: syllabus → course → unit, vocabulary/grammar → lessons → syllabus/lesson joins → quiz/questions → protected keys; đối chiếu FK ordering thực tế. Chỉ publish sau keys đủ và triggers được thỏa, publication phải có approval rõ riêng. Lỗi bất kỳ rollback toàn bộ; không manual schema fixes hoặc tự mở transaction mới để “tiếp tục”.
- Chốt rõ draft-only import hay readable catalog. Draft/pending không xuất hiện với learner theo RLS; owner acceptance không tự chuyển approved/published hoặc điền verified_at/license/reviewer. Nếu cần thay metadata/data phải có bằng chứng thật, revision/hash và acceptance phạm vi phù hợp, giữ lịch sử hồ sơ hiện tại.
- Không gọi study/quiz/completion RPC, không tạo cards/progress/allowlist/users/Storage. READ ONLY preflight không chứng minh DML/trigger/rollback/concurrency của importer sẽ thành công; các kiểm thử đó cần scope disposable riêng được phê duyệt, không dùng dữ liệu học thật.

## Kiểm tra thực chạy và phê duyệt còn thiếu

| Kiểm tra                                                                    | Kết quả                                                                                                                                                        |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run content`                                                           | PASS schema/references/hashes/source-cache/private bindings; human review pending, import BLOCKED.                                                             |
| `powershell -NoProfile -File scripts/review-private-pilot.ps1 -PrepareOnly` | PASS 24 câu/ACL/snapshot/bindings. Lần đầu sandbox AuthorizationManager từ chối; chạy lại cùng helper offline với quyền thực thi được duyệt, không bỏ qua lỗi. |
| `npm run test:contracts`, `npm run test:security`                           | PASS static; không RLS/JWT live.                                                                                                                               |
| Unit regression                                                             | **176 tests / 17 files PASS** (`npm run test`), local mocks/static fixtures; không dùng Cloud.                                                                 |
| Prepared SQL                                                                | Kiểm cấu trúc/coverage offline; **NOT EXECUTED** database/API.                                                                                                 |

**Preflight plan PREPARED; execution chưa được cấp quyền. Import/publication BLOCKED.** Cần approval riêng cho read-only Development SQL (và HTTP nếu muốn), rồi reviewed exact import transaction/private key delivery; publication/metadata promotion và mọi Cloud study mutation là các approval riêng. Auth/allowlist/Storage/DDL/migrations/push/deploy vẫn ngoài scope. Không thay Cloud guard hoặc đánh dấu Sprint 1 COMPLETED.
