# Sprint 2.2 — Study Confirmation, local-only

2026-11-13, Asia/Saigon. **Source/local verification PASS; live acceptance BLOCKED. Sprint 1 vẫn PARTIAL.** 2.1 reader giữ hợp đồng Content V1; HSK 1 Pilot revision 2 vẫn draft/pending human review, không import/publish. Không triển khai Sprint 2.3 mini-quiz UI, SRS UI, plan, timer hoặc analytics.

## Luồng đã triển khai

1. Lesson Detail đọc bundle/progress bằng learner JWT/RLS hiện có. Không mutation trong render, GET, prefetch hoặc effect-on-mount. Trang chỉ truyền Server Action reference vào nút client.
2. Nút **“Tôi đã học nội dung này”** gửi đúng `{lessonId}`. Server Action gọi `requireLearner` độc lập, Zod strict UUID và chặn user_id/studied_at/completed_at hoặc field dư. Không tin action state/hidden input/disabled button để phân quyền.
3. **Guard local-only ở server lẫn presentation:** cần server flag `HANLEARN_LOCAL_STUDY_CONFIRMATION=1` và Supabase URL HTTPS với hostname literal `127.0.0.1` hoặc `[::1]`, không credentials/query/hash/path khác root. Mặc định disabled trong .env.example; **mọi Cloud/non-loopback URL bị chặn dù flag=1**, kể cả gọi thẳng Server Action. Không có flag mở Cloud. Không đổi .env.local hoặc cấu hình URL đang dùng.
4. Action đọc lại lesson bundle để chứng minh ancestry/content hiện readable, rồi chỉ gọi `mark_lesson_studied({p_lesson_id})` bằng client của learner. RPC database tự lấy user/time, serialize và gọi completion/card creation. Không insert/update lesson_progress hoặc tạo cards từ app/browser.
5. Receipt chỉ được validate `{completed:boolean}`, không dùng nó suy timestamps/completion. Action SELECT lại đúng columns của lesson_progress với cả lesson_id và user_id; kiểm identity/UUID/timestamps và studied_at tồn tại rồi chỉ trả hai timestamps an toàn. Không trả raw row/owner UUID/SQL error/private fields.
6. Revalidate lesson/roadmap/dashboard. Next Server Action re-render route trong cùng response; UI hiển thị **progress props đọc từ server**, không lấy `completed` receipt hoặc React optimistic state để hoàn thành. Client action result chỉ quản lý lỗi/pending; trường progress trong result không tự ghi đè SSR props.
7. Pending và ref chống bấm lặp; đã học cho phép xác nhận lại, DB giữ timestamp đầu tiên. Completed hiển thị từ persisted completed_at. Study-only có hướng dẫn cần quiz đạt ít nhất 80%, đồng thời nói quiz UI chưa mở và không gắn link route chưa tồn tại. Không tự suy quiz đã pass từ studied_at.
8. Lỗi known rejection (input/visibility/authorization) hiển thị message an toàn. Timeout/lỗi RPC không phân loại/malformed receipt/readback lỗi được ghi nhận **outcome unknown**, không khẳng định rollback; tải lại tiến độ hoặc explicit retry cùng lesson. RPC idempotent giữ thời gian/card state, không đổi sang user/lesson/key mới. Reload chỉ GET/read. Không tự retry loop.

Endpoint local TLS/Auth/PostgREST thật chưa được cung cấp trong nhiệm vụ này; app không được trỏ vào native PostgreSQL như thể nó là Supabase. Flag local chỉ dùng trong mocks/transport cô lập phù hợp, không hướng dẫn bypass TLS/config hoặc proxy request sang Cloud. Trong website local đang trỏ Development, CTA tồn tại nhưng disabled; server vẫn chặn direct invocation trước write RPC.

## File thay đổi

| Nhóm | Files / mục đích |
| --- | --- |
| Action/boundary | `src/features/lessons/actions.ts`, `study-contract.ts`: auth, strict input, hard local gate, RPC, owned readback, sanitized result/revalidation. |
| UI | `src/features/lessons/components/study-confirmation.tsx`; LessonView thêm slot, page lesson dùng component/action. Read-only fallback của 2.1 vẫn dùng được trong fixture/tests. |
| Types/config | `src/types/database.ts` thêm signature RPC đã tồn tại; `.env.example` flag mặc định 0. Đây là projection curated, không claim CLI-generated types đã được giải quyết. |
| Local tests | `tests/study-action.test.ts`; synthetic lesson-browser fixture và spec; `supabase/tests/study_confirmation.sql`, `scripts/test-database.mjs` thêm suite trong disposable DB. |
| Guard/checks | `scripts/check-security.mjs` giới hạn điểm gọi RPC và chặn direct progress write; `scripts/check-type-projections.mjs` thêm catalog signature study RPC. |

Không đổi 6 migration files, SQL snapshot, source content/manifest/human review packet hoặc báo cáo Sprint 0/1. Không có migration mới hay apply remote. Native test harness bootstrap lại **sáu file DDL bất biến** và Auth shim vào database test mới trên loopback để kiểm RPC; đây là setup disposable test, không phải thay đổi schema Development/Production hoặc Supabase migration acceptance.

## Kiểm thử thực chạy

| Kiểm tra | Kết quả / phạm vi |
| --- | --- |
| `npm run test` | **173 tests / 17 files PASS**, gồm 28 cases action/gate mới. Transport/auth/query/revalidation mocks, không chứng minh live Auth/JWT. |
| `npm run test:lessons:browser` | **12 PASS**, desktop 1280×900 và mobile 360×800; 6 checks mới trong 12. Real production UI components, synthetic fake action/store, request chỉ GET/HEAD đến 127.0.0.1:3103, không .env/Supabase/auth client. |
| Native `scripts/test-native.ps1` | **86 core + 12 Sprint 1 + 22 study SQL assertions PASS**, cộng 3 concurrency regressions có sẵn. PostgreSQL 18.4, database test mới, loopback 55439, Auth shim/synthetic UUIDs; study suite transaction rollback, synthetic concurrency fixture được cleanup, server đã stop. Không Docker/Cloud/owner data. |
| `npm run build` | PASS production compile/typecheck/static generation, lesson route vẫn dynamic; không execute write RPC để build. |
| `npm run lint`, `npm run typecheck`, `npm run format:check` | PASS; next-env generated path diff được hoàn nguyên sau build rồi typecheck lại. |
| `npm run test:contracts`, `npm run test:security` | PASS static repository/grant boundary và browser bundle scan sau build; không thay thế RLS/JWT tests thật. |
| `npm run test:lessons:catalog` | PASS 76 columns/9 groups với capture local từ Development trước đây; cả 6 migration hashes không đổi. Không truy vấn Cloud mới. |
| `node scripts/check-type-projections.mjs` | PASS 77 checks trên captured catalog, gồm mark_lesson_studied(uuid) → jsonb. CLI type-generation blocker vẫn còn. |
| `npm run content` | PASS kỹ thuật; human/quiz/pinyin review pending và import readiness BLOCKED; không import/publish pilot. |

### Ma trận theo yêu cầu

| Trường hợp | Bằng chứng / trạng thái |
| --- | --- |
| Anonymous/outsider | PASS mocked action denial và native anon/nonallowlisted Auth-shim RPC denial. Real outsider account/JWT: BLOCKED. |
| Missing/draft/không readable | PASS action preflight mocks, native PT404 missing/draft ancestry, 2.1 query tests cho mọi ancestor. Race bị hidden sau preflight vẫn do RPC quyết định. |
| Lần đầu / study-only | PASS native timestamp có, completion null, không thêm card; UI synthetic hiển thị riêng đã học/hoàn thành và quiz guidance. |
| Xác nhận lại / retry | PASS native unique progress, giữ first studied_at/completed_at, không duplicate/reset/resurrect cards; mock action retry cùng RPC/lesson sau lỗi network/readback. |
| Pass-first rồi study | PASS native: pass không tạo study, mark study tạo completion và cards trong RPC; synthetic UI completed lấy từ fake readback. |
| Study-first rồi pass | PASS native: study-only chưa completed, submit_quiz sau đó hoàn thành với studied_at cũ. Chỉ gọi quiz RPC trong native synthetic test; không mini-quiz app UI/Cloud. |
| Reload | PASS fresh mocked reads/filter và browser reload từ synthetic sessionStorage. **Không** claim browser reload qua Next/Auth/PostgREST/PostgreSQL thật đã được chứng minh. Native assertions ở transaction test chứng minh state/time, không phải live SSR/new-session acceptance. |
| Không lộ user khác | PASS exact user+lesson SELECT filters và DTO identity check; native RLS shim A/B không đọc progress nhau. Không tạo Supabase users/allowlist thật; fixtures chỉ là hàng synthetic trong auth shim disposable. |
| Không ghi Cloud | PASS gate tests cho Development/Production-like host, hostile suffix/userinfo, localhost/http và thiếu flag; direct action bị chặn. Không live mutation request nào chạy. |
| Responsive/accessibility | PASS keyboard Space/focus, CTA ≥44px, pending disabled, role=status/alert, mobile không overflow, safe retry. Đã xem ảnh mobile synthetic; không claim kiểm toán screen-reader/WCAG toàn bộ. |
| Không optimistic completion | PASS test receipt.completed khác readback vẫn dùng readback; client nhận success mà SSR props chưa đổi không tự hiển thị studied/completed. |

Browser synthetic state trong sessionStorage chỉ ở tests/fixtures, **không** phải cơ chế lưu tiến độ sản phẩm. Real app dùng PostgreSQL và fresh RSC. Ảnh kiểm UI local nằm `.local/previews/study-lesson-{desktop,mobile}-synthetic.png`, không chứa owner data hoặc pilot đã published. Không có fixture mode/route trong app production hoặc data pilot trong browser bundle.

## Lệnh local và giới hạn

```powershell
npm run test
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run test:lessons:browser
powershell -NoProfile -File .\scripts\test-native.ps1
npm run test:contracts
npm run test:security
npm run test:lessons:catalog
node scripts/check-type-projections.mjs
npm run content
```

Native command chỉ được dùng với harness loopback workspace hiện có; không trỏ fixtures/test-database/auth shim đến Cloud hoặc database cá nhân. Captured catalog checks báo thiếu evidence nếu file local không có; không tự giả metadata. Không dùng owner đang login để bấm mutation test trên website trỏ Cloud.

## Điều kiện cần phê duyệt trước live mutation testing

**BLOCKED** tới khi có approval riêng naming Development project, RPC mark_lesson_studied, exact test lesson/quiz/word IDs và tài khoản/allowlist được phép; quy định tác động completion/card creation, retry và cleanup fixture phù hợp immutable data. Cần reviewed/published/licensed test catalog hoặc pilot đã human-approved và được cấp quyền import riêng; không dùng pilot pending hoặc dữ liệu học owner để thay fixture. Các kiểm pass-first/study-first live cần scope quiz RPC cụ thể ngoài study action.

Cần review thay đổi guard server để mở target Cloud được phê duyệt; **không** thể mở Cloud chỉ bằng env flag hiện tại. Cần kiểm real Auth/JWT/outsider/B, actual PostgREST/RLS/readback, Next Server Action CSRF/revalidation và reload với dữ liệu PostgreSQL thật trong dataset được duyệt. Không tự tạo User B/outsider hoặc thêm allowlist để vượt gate.

Sprint 1 vẫn PARTIAL: outsider/B live isolation, expiry/revocation, typegen, Storage/audio và release/ops gates không được đóng bởi mocks/native/browser harness. Pilot human review, rights, private management và import còn BLOCKED. Không SRS UI/quiz UI/plan/timer/analytics, không migration remote, GitHub push hoặc deploy. **Dừng sau Sprint 2.2 local-only.**
