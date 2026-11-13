# HSK 1 Pilot v1 — Offline Quality Remediation

Ngày 2026-11-13, Asia/Saigon. Baseline: authoring `61aa76e`, quality review `e99f4fc`. Phạm vi được phê duyệt: sửa offline CQ-01–CQ-11; không import/publish. **Đã sửa dữ liệu thực, chuẩn bị cho human review. Import readiness: BLOCKED.**

## Phiên bản và bất biến

- `package_version=1` và lesson `content.version=1` giữ nguyên định dạng Content V1; `draft_revision` tăng từ baseline 1 lên **2**, có `revised_on` và revision_history trong manifest.
- Cả 4 quiz tăng `revision` 1 → **2**. Giữ nguyên tất cả syllabus/course/unit/vocabulary/grammar/lesson/quiz/question UUIDs, section IDs cũ, ancestry, 66 lesson-vocabulary joins và 12 lesson-grammar joins. Thêm 5 section IDs mới ở bài 3; tổng 29 sections.
- Số lượng giữ 1 syllabus / 1 course / 1 unit / 4 lessons / 44 words / 12 grammar / 4 quizzes / 24 questions. Không thêm từ mới hoặc tự gán membership mới. 43 headwords/readings theo bằng chứng nguồn cũ, 越南 vẫn bổ trợ không có membership cấp 1.
- Toàn bộ DB statuses vẫn draft/pending; human reviewer/date null; syllabus inactive/unverified và official totals rỗng; import/publish authorization false. Không đổi provenance pending thành license được duyệt.
- Không chạy lại private `author.mjs`. Helper remediation chỉ sửa có mục tiêu; source cũ giữ trong vùng private để tránh mất nguồn gốc, không được dùng để ghi đè revision mới.

## Kết quả 11 findings

FIXED dưới đây nghĩa là thay đổi offline đã thực hiện và được AI rà lại; không phải human-approved.

| Finding | Trạng thái | File/field đã sửa | Kết quả và điểm cần người duyệt xác nhận |
| --- | --- | --- | --- |
| CQ-01 | FIXED | `quizzes/lesson-02.json` Q1.prompt; private explanation/binding | Stem yêu cầu hai người mới gặp, chưa ai nói tên, câu hỏi tên đầy đủ đứng riêng. AI rà từng lựa chọn không còn dùng cách hiểu hỏi tiếp để chấp nhận lựa chọn rút gọn. Người duyệt phải xác nhận lại tính duy nhất trong ngữ cảnh mới. |
| CQ-02 | FIXED | `lessons/lesson-03.json` intro, vocabulary sections, 3 guides, estimated_minutes; manifest.learning_rounds | Ba lượt A/B/C có 6/6/3 từ mới, ôn 2–3 phút mỗi lượt; dự kiến 40 phút, có thể chia hai buổi. Thêm 5 section, giữ l3-words và tất cả IDs cũ. Một số ví dụ family/number đổi để không đòi chữ của lượt sau. Chưa có thử nghiệm tải học với người thật. |
| CQ-03 | FIXED | `quizzes/lesson-03.json` Q3.choices | Bỏ câu hỏi thời gian bài 4, thay bằng câu hỏi danh tính đã học bài 2; key/explanation tính lại. Guard ký tự đã học bắt lỗi hồi quy này, không thay thế kiểm sense/ngữ pháp. |
| CQ-04 | FIXED | Quiz L1-Q1/Q4/Q6; L2-Q2–Q6; L3-Q4; L4-Q4–Q6 | Distractors mục tiêu được đổi sang phát ngôn đầy đủ, cùng khung câu/loại ngữ nghĩa; L3-Q4 dùng hai lựa chọn có mục tiêu thay vì ép bốn. Giữ một số câu nhận biết dễ: xem phần giải trình dưới. Cần human review độ khó và tính duy nhất. |
| CQ-05 | FIXED | vocabulary examples; grammar indices 6/8/10; lesson 3 dialogue và lesson 4 dialogue | Ví dụ standalone là cụm bỏ dấu chấm, bản dịch có nhãn cụm; lời đáp ngắn trong hội thoại có nhãn rút gọn. Grammar ngày tháng thêm câu đầy đủ với 今天 và giữ đáp ngắn có chú thích. Không ép chèn 是 vào câu vị ngữ thời gian hợp lệ. |
| CQ-06 | FIXED | Lesson 1/3/4 intro; grammar 7; manifest.pinyin_policy | Giữ thanh gốc của thanh 3; giải thích nhịp/ngữ cảnh và không đổi mọi thanh 3 thành thanh 2. Làm rõ yī/yí ge, bù/bú shì, gè/ge và phạm vi giảng dạy. Không sửa máy móc pinyin từ điển, không có audio nên chưa xác minh phát âm thực. |
| CQ-07 | FIXED | `grammar.json` index 0.explanation_vi | Dùng phân tích 我 là chủ ngữ, 很好 nói trạng thái; bỏ lời cấm chung về trật tự tiếng Việt. Người dạy duyệt cách gọi vị ngữ cho người mới. |
| CQ-08 | FIXED | `grammar.json` index 8.explanation_vi | 和 gần nghĩa “và”, nối danh từ/cụm danh từ trong mẫu; nhắc giới hạn không nối tùy ý mọi mệnh đề. |
| CQ-09 | FIXED | `grammar.json` index 1.examples/explanation_vi | Chỉ giữ ví dụ trần thuật minh họa 很; câu hỏi vẫn được dạy ở grammar 吗/呢 hiện có. Không thêm từ bài sau chỉ để có ví dụ thứ hai. |
| CQ-10 | FIXED | Lesson 2 objective, intro, review; grammar 叫/是; vocabulary 越南 gloss | Mục tiêu/nghiệm vụ chỉ nói việc học và luyện câu; bỏ thuật ngữ membership/Cloud khỏi các field học tập đó. Phân loại HSK/giới hạn vận hành vẫn ở metadata/README. |
| CQ-11 | FIXED | vocabulary 家/天/叫 và examples; grammar sở hữu | Ưu tiên 家 là gia đình theo chủ đề, chỉ chú thích nghĩa nhà theo ngữ cảnh; 叫 giới hạn mang tên; 星期天 hiểu cả cụm. Gia đình/anh/chị có ví dụ cụm rõ; 三 có ví dụ số lượng thuộc lượt B. Cần người duyệt sense/nghĩa theo nguồn. |

### Bài 3: cách học được triển khai

| Lượt | Từ mới | Section refs |
| --- | --- | --- |
| A — 6 | 家、爸爸、妈妈、哥哥、姐姐、的 | `l3-words` (thêm các từ ôn đã học) |
| B — 6 | 一、二、三、两、有、个 | `l3-round-b-words` |
| C — 3 | 几、口、和 | `l3-round-c-words` |

Mỗi lượt có guide text trước refs và hoạt động che pinyin/tự nhớ lại, đều là văn bản Content V1, không tạo tính năng completion/progress mới. Grammar refs tổng hợp và hội thoại được đặt sau ba lượt. Thời gian 40 phút là dự toán cần thử nghiệm, không tuyên bố tối ưu sư phạm đã được đo.

### Giải trình giữ lại một số lựa chọn thiết kế

L1-Q2/Q3/Q5 giữ mức nhận biết speech acts đã học; L3-Q1/Q5 giữ nhận biết hư từ. Đây là scaffold cho bài đầu, không cố làm mọi câu khó. L4-Q1/Q2/Q3/Q6 tiếp tục dùng các lựa chọn cùng loại thứ/ngày/mốc giờ. Không thêm từ chưa học hoặc nhiều cách nói đồng nghĩa chỉ để tăng số distractors. Hội thoại chào hỏi bài 1 giữ lặp mẫu có giới hạn và chú thích hoàn cảnh; CQ-11 không yêu cầu xóa lời chào tự nhiên.

## Quiz và private store

- **14 câu đổi stem/choices**, 10 câu giữ wording; cả 24 đều được giải lại và đối chiếu, không mặc định giữ key cũ. Thay đổi wording/semantics vẫn trong cùng mục tiêu câu draft nên giữ question IDs.
- Cụ thể: L1 Q1/Q4/Q6; L2 Q1–Q6; L3 Q3/Q4; L4 Q4–Q6. CQ-01 thu hẹp ngữ cảnh; L2-Q2 làm rõ người nói; các câu còn lại sửa độ tương đồng distractor/phạm vi kiến thức, hoặc cách diễn đạt stem. L3-Q4 giảm choices theo constraint SQL 2–6; không có schema change.
- Toàn bộ **24 giải thích private được biên soạn lại** theo stem/choices hiện tại, nêu lý do lựa chọn dự kiến phù hợp và vì sao các lựa chọn khác không đáp ứng stem. Một vị trí key thay đổi khi tập choices đổi. Không ghi index, vector, nội dung đáp án được đánh dấu hoặc raw explanation vào tài liệu/Git/log.
- Private store có `package_revision` và bốn `quiz_bindings` theo quiz UUID/revision/SHA-256 file công khai. Validator từ chối store cũ hoặc sai hash/revision; không xuất hash/digest của đáp án vào manifest công khai. `package_version` không bị dùng nhầm làm revision nội dung.
- Helper riêng `verify-remediation.mjs` đọc local store, giải lại từng câu từ nội dung hiện tại theo rubric AI và so selection/reason checks; chỉ in IDs, boolean/counts. Đây là đối chiếu AI có giới hạn, không phải chứng minh toán học chỉ có một cách hiểu tiếng Trung hoặc human sign-off. Người duyệt vẫn cần đọc toàn văn 24 explanations trong vùng riêng.
- Bản trước remediation cùng source/helper có key chỉ ở `.local/pilot-hsk1/v1/private/`, ACL owner/SYSTEM, Git ignored. Bản cũ phục vụ đối chiếu local, không phải key revision 2 để import. Workflow backup/chia sẻ vẫn cần duyệt; không có quyền commit private package.

## Files và validation

Dữ liệu sửa: `vocabulary.json`, `grammar.json`, cả 4 lesson JSON, cả 4 quiz JSON, `manifest.json`. `rights-manifest.json` giữ pending và bytes không đổi. README/checklist cập nhật revision, sections/thời gian và gates; checklist human vẫn để trống. Báo cáo review/authoring giữ bằng chứng baseline, thêm trạng thái mới.

Hỗ trợ validation: `package.json` thêm alias **`npm run content`** cho command `content:validate` hiện có; `scripts/pilot-validation.mjs` kiểm revision/binding, learning rounds và ký tự chưa học trong quiz. Chỉ thay validator biên soạn offline; production Zod Content V1, source ứng dụng, SQL/schema và migrations giữ nguyên. Tests dùng synthetic key index, không load đáp án thật vào test suite.

Public file hashes được tính lại từ bytes JSON hiện tại; private bindings khớp bốn quiz files. Không chạy author.mjs để tái tạo toàn bộ package.

| Kiểm tra thực hiện 2026-11-13 | Kết quả |
| --- | --- |
| `npm run content` | PASS: Content V1/draft rows, references, 4/44/12/24 counts, public hashes, 43 source lookups và private bindings. Import readiness vẫn BLOCKED. |
| `npm run test` | **140 tests / 15 files PASS**, thêm 4 regression tests cho revision/hash binding, ba lượt 6/6/3, ví dụ không đòi chữ lượt sau và distractor dùng chữ bài sau. Tests dùng key giả để kiểm cấu trúc, không đọc private answers thật. |
| `npm run lint`, `npm run typecheck`, `npm run format:check` | PASS. |
| `npm run test:contracts` | PASS static contracts/snapshot checks; không thực thi SQL. |
| `npm run test:security` | PASS static scan, gồm forbidden public key fields, source imports và draft markers trong browser chunks. |
| Private helper verification | 24/24 unique intended choice, selection matches và reason predicates đạt; bốn quiz bindings đúng. Đây là bằng chứng AI có giới hạn, human semantics còn pending. |
| Private leakage/ACL | 174 tracked/unignored files và 41 browser chunks hiện có: không bản sao private bodies/full explanations/key payload; không file private tracked. 7 private paths chỉ owner/SYSTEM, directory tắt kế thừa. |
| `git diff --check` | PASS. |
| Đối chiếu baseline/SQL | Entity/question IDs, section IDs cũ, joins, headwords/readings, HSK evidence và rights manifest giữ nguyên. Cả 6 migration SHA-256 khớp expected_schema.json. App source, SQL snapshot và báo cáo Sprint 0/1 không đổi. |

Không chạy build mới vì app/production schema không thay đổi; browser artifacts được scan là bundle baseline đã có, không phải build mới của revision 2. Không chạy DB/API/Auth hoặc test ghi dữ liệu Cloud.

## Remaining human review gates

1. Người kiểm tiếng Trung độc lập đọc 44 gloss/examples, 12 grammar và toàn bộ 29 sections; duyệt pinyin/biến điệu, thanh nhẹ, nhịp câu, độ tự nhiên, cụm/câu/lời đáp và sense theo ngữ cảnh. AI rà lại không phát hiện lỗi thanh rõ cần đổi headword; không chứng nhận native quality.
2. Duyệt độc lập tính duy nhất của toàn bộ 24 câu và lập luận từng explanation riêng, đặc biệt stem L2-Q1, các câu giữ nguyên wording và choices mới. Xác nhận mức độ khó/thời lượng 40 phút bằng người học thật.
3. Xác nhận source edition/reading/sense riêng với quyền sử dụng; source headword match không phê duyệt nghĩa/giáo trình hoặc quyền phân phối. 越南 vẫn bổ trợ, không tự thêm nhãn official.
4. Duyệt quyền truy cập/backup/bàn giao private store, đúng package revision và quiz hashes. Giữ người duyệt/ngày ký trống đến khi có người thực hiện thật.
5. Chốt revision/hashes sau human edits, chạy lại checks rồi cần phê duyệt riêng cho import Development và publication. Chưa chạy collision preflight/live Cloud trong nhiệm vụ này.

**Import readiness: BLOCKED** vì chưa có human language/quiz/rights approval, private management chưa chốt và chưa có quyền ghi Development. Bản sửa đã sẵn cho vòng human review, không đồng nghĩa sẵn sàng import. Không truy cập/thay đổi Supabase, user/allowlist/Storage, không migration, Sprint 2.2, push hoặc deploy.
