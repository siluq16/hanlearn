# HSK 1 Pilot — hồ sơ revision 3

Chuẩn bị 2026-11-13. **159 dòng PENDING**, không reviewer/date hoặc owner acceptance tự điền. Format package/content V1 giữ nguyên; draft_revision 3; quiz revisions **3/2/2/2**. Chỉ L1-Q4 đổi stem/choices, quiz 1 tăng revision. Bộ 4 lessons / 29 sections / 44 words / 12 grammar / 24 questions và mọi UUID/relationships giữ nguyên.

## Hồ sơ cần đọc

- [VOCABULARY](VOCABULARY.md): 44 từ, pinyin/gloss/ví dụ/nguồn và phân loại headword.
- [GRAMMAR](GRAMMAR.md): 12 điểm đầy đủ.
- [LESSONS](LESSONS.md): 29 sections, mục tiêu/hội thoại/thời lượng, bài 3 giữ ba lượt 6/6/3.
- [QUIZZES](QUIZZES.md): 24 stems/choices không gắn key; đánh dấu L1-Q4 thay đổi ở revision hiện tại và 14 câu có lịch sử remediation r2. Mọi câu vẫn cần được xem lại trong scope chấp nhận.
- [CATALOG_AND_RIGHTS](CATALOG_AND_RIGHTS.md): ancestry, nguồn và rights manifest chưa được duyệt.
- [Register CSV](REVIEW_REGISTER.template.csv) / [JSON](REVIEW_REGISTER.template.json): stable IDs, field cần kiểm, PENDING/nhận xét/sửa đề xuất/reviewer/date, source/revision/hashes. Chọn một sổ chính, copy vào local ACL-restricted/Git ignored trước khi điền; không sửa tracked templates.
- [SOURCE_SNAPSHOT](SOURCE_SNAPSHOT.json): manifest/source hashes hiện tại. 159 dòng là 158 loại item trước đó cùng focus mới `focus/l1-q4`; không chuyển quyết định hoặc chữ ký cũ sang dữ liệu mới.
- [PRIVATE_REVIEW](PRIVATE_REVIEW.md): local Windows viewer, package/private bindings và private integrity evidence.
- [SIGN_OFF](SIGN_OFF.template.md), [IMPORT_GATES_AND_DRY_RUN](IMPORT_GATES_AND_DRY_RUN.md).

Manifest SHA-256: `dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b`.

Public snapshot SHA-256: `2cb3e0d7a667dd6faba633c4df1e87e6dbaee539e19d0cb394e9dcc769c91deb`.

## Lựa chọn chính sách — chưa có quyết định thật

[PRIVATE_PILOT_POLICY](../../PRIVATE_PILOT_POLICY.md) đề xuất AI_REVIEWED_OWNER_ACCEPTED_PRIVATE_USE cho một owner tự học; AI review không là chứng nhận độc lập, owner acceptance không là public release/rights waiver/Cloud write approval. Hiện policy và owner acceptance đều PENDING. Dùng mẫu owner trong policy nếu muốn chủ động quyết định thật; không lấy nó để auto-PASS register hoặc tự flip database review fields.

Nếu tiếp tục route human review đầy đủ: giữ yêu cầu reviewer thật, từng item quyết định PASS/NEEDS_FIX/PENDING có comments/name/time thực và sign-off theo scope/hash. Nếu chọn private owner acceptance: cần chấp thuận chính sách riêng và ghi rõ các phần thực sự đã đọc/thử, phần chưa kiểm, rủi ro, quyền sử dụng và actual name/date/signature; independent language certification vẫn chưa có. Không ghi đáp án/index/explanation trong sổ hoặc quyết định chung; chi tiết đó chỉ ở restricted notes.

## Thực hiện local

```powershell
npm run content
npm run test
powershell -NoProfile -File .\scripts\review-private-pilot.ps1 -PrepareOnly
# Chỉ người được ủy quyền mở cửa sổ local, không screen sharing/recording:
powershell -NoProfile -STA -File .\scripts\review-private-pilot.ps1
```

Viewer tự chọn snapshot theo manifest revision; không dùng private backup r2 hoặc helper author/remediation cũ. Chuẩn bị này chỉ kiểm PrepareOnly, không xác nhận người đã duyệt GUI. Sau khi đọc private phải chốt/ký restricted integrity evidence cho đúng bytes; public hash của quiz không bảo vệ khỏi sửa key/explanation riêng.

Không sửa source khi đang quyết định. Nếu có sửa tiếp, cần revision/hash/binding/hồ sơ mới và kiểm lại scope bị tác động, không thay hash/chữ ký cũ. Toàn bộ packet r2 và báo cáo cũ vẫn giữ nguyên làm lịch sử; packet đó không chứng nhận nội dung r3.

Hiện **import/publish BLOCKED**: thiếu quyết định owner hoặc independent review theo route được chấp thuận, rights/attribution/private management chưa chốt, chưa có preflight/approval ghi Cloud riêng. Không gọi Cloud mutation, không bỏ Sprint 2.2 guard hoặc thay DB constraints.
