# Hồ sơ human review — HSK 1 Pilot draft_revision 2

Chuẩn bị 2026-11-13. **158 quyết định PENDING, chưa có người duyệt/ngày duyệt hoặc human PASS. Import readiness BLOCKED.** Nguồn frozen ở commit `4aeb303`; không sửa data trong nhiệm vụ chuẩn bị này.

## Mở hồ sơ

- [VOCABULARY](VOCABULARY.md): 44 mục, Hanzi/pinyin/nghĩa/ví dụ, xuất xứ biên soạn và bằng chứng nguồn HSK từng mục.
- [GRAMMAR](GRAMMAR.md): 12 mục, đầy đủ mẫu, giải thích và ví dụ, nguồn category có giới hạn.
- [LESSONS](LESSONS.md): 4 mục tiêu, thời lượng 20/25/40/30 phút, đủ 29 sections, hội thoại/transcripts và refs đã giải tên.
- [QUIZZES](QUIZZES.md): đủ 24 stems/choices không đánh dấu đáp án, ngữ cảnh học; đánh dấu 14 câu đã đổi. L2-Q1 cần đặc biệt kiểm ngữ cảnh đứng riêng.
- [CATALOG_AND_RIGHTS](CATALOG_AND_RIGHTS.md): syllabus/course/unit, nguồn/edition và rights manifest đầy đủ. Không coi headword match là sense/human/rights approval.
- [REVIEW_REGISTER.template.csv](REVIEW_REGISTER.template.csv) hoặc [JSON](REVIEW_REGISTER.template.json): mỗi nội dung một stable ID. CSV UTF-8 BOM để đọc tiếng Việt/Hán trong Excel; chỉ chọn **một** bản làm sổ chính, không duyệt hai bản rồi gộp tùy ý.
- [SOURCE_SNAPSHOT](SOURCE_SNAPSHOT.json): SHA-256 của manifest và 11 JSON nguồn khác; mỗi dòng register có package revision/snapshot hash và source file hash. Private attestation chỉ bind public quiz file, không có digest của đáp án.
- [PRIVATE_REVIEW](PRIVATE_REVIEW.md), [SIGN_OFF](SIGN_OFF.template.md), [IMPORT_GATES_AND_DRY_RUN](IMPORT_GATES_AND_DRY_RUN.md).

Đây là tài liệu nội bộ không chứa key; chữ “public” trong hướng dẫn nghĩa là được tách khỏi private store, **không cấp phép xuất bản** lên web. Không đặt hồ sơ vào public/, src/ hoặc frontend bundle.

## Bắt đầu một lượt duyệt thật

1. Người phụ trách chỉ định người duyệt có năng lực Trung–Việt, người duyệt sư phạm/quiz và người có thẩm quyền quyền sử dụng. Không tự điền reviewer bằng AI hoặc chủ repo nếu họ chưa thực hiện. Cùng một người có thể nhận nhiều vai trò nhưng phải ghi rõ năng lực/phạm vi và trách nhiệm; ưu tiên kiểm độc lập.
2. Tại repo chạy `npm run content` và `npm run test`; đối chiếu SOURCE_SNAPSHOT với source bytes. Nếu lệch revision/hash: dừng, không ký sổ cũ cho data mới. Các lệnh này offline, không cần Supabase credentials.
3. Tạo thư mục làm việc **được kiểm soát truy cập** dưới `.local/pilot-hsk1/human-review/` và copy sổ mẫu cùng SIGN_OFF vào đó. Thư mục vẫn phải Git ignored; người phụ trách xác nhận ACL theo người được ủy quyền. Tác vụ chuẩn bị không cấp thêm ACL hoặc tự chỉ định người duyệt. Không sửa tracked templates hay bản đọc frozen.
4. Mỗi người ghi quyết định từng dòng của sổ chính; khi nhiều người duyệt, dùng file riêng theo vai trò, không ghi đè chữ ký nhau. Dùng stable_id và hash để đối chiếu, không chỉ số thứ tự. Người quản lý phải giải quyết mọi bất đồng; không lấy đa số PASS để bỏ NEEDS_FIX.
5. Đọc word/grammar rồi đọc toàn lesson và giải quiz độc lập. Không xem đáp án trước khi tự giải. Chỉ người được ủy quyền mở private viewer ở local theo PRIVATE_REVIEW; không điền lựa chọn/giải thích đáp án vào sổ chung.
6. Hoàn tất các dòng focus và rights, đối chiếu checklist nguồn REVIEW_CHECKLIST vẫn đang trống. Ký SIGN_OFF thật theo phạm vi/hashes, không backdate. Chữ ký tổng hợp không thay cho 158 quyết định có bằng chứng.

## Điền sổ và xử lý lỗi

Các cột ổn định (`stable_id`, kind, source_file/json_pointer, revision/hashes, flags) không sửa. `public_item_sha256` là SHA-256 JSON.stringify của public item; private attestation để trống cột này vì không phân phối hash dữ liệu riêng. `source_file` tính từ content/pilot-hsk1/v1; `json_pointer` định vị array hiện tại, stable_id mới là định danh để theo dõi qua các lần sắp lại.

Điền `review_status` bằng **PASS / NEEDS_FIX / PENDING**:

- PASS: chính người ghi đã đọc/kiểm đủ nội dung yêu cầu, có tên thật, thời điểm thực tế ISO 8601 kèm múi giờ và căn cứ trong comments. PASS kỹ thuật trước đây không đủ. Nếu chỉ kiểm một phần thì giữ PENDING và ghi phần còn thiếu.
- NEEDS_FIX: nêu đúng field/ID, lỗi quan sát được và sửa đề xuất; giữ reviewer/ngày thực tế. Với private, chỉ ghi “cần sửa giải thích riêng, xem ghi chú restricted”, không sao chép đáp án hoặc lập luận vào sổ chung.
- PENDING: chưa kiểm đủ/chưa có thẩm quyền/chưa có bằng chứng. Mặc định mọi dòng là PENDING. Không bắt người chưa duyệt điền tên/ngày chỉ để đủ form.

Nhận xét/proposed_change của **câu quiz** trong sổ chung cũng không được đánh dấu lựa chọn đúng hoặc giải thích đáp án. Ghi chi tiết đó trong ghi chú restricted local được duyệt. Public register chỉ là attestation theo question ID và hash; signed records không tự chuyển DB status hoặc cấp quyền import.

Không chỉnh source draft trong lúc duyệt. Khi NEEDS_FIX có quyết định sửa được phê duyệt riêng: tạo revision mới, cập nhật public hashes/private bindings, regenerate hồ sơ ở thư mục revision mới, chạy regressions; mọi item/file bị đổi và các lesson/quiz phụ thuộc phải được duyệt lại. Không sửa hash trong sổ cũ để “giữ chữ ký”. Không chạy lại author/remediation helpers.

## Thứ tự tập trung

1. 44 gloss/senses và pinyin từ/câu: thanh nhẹ, 一/不, thanh 3 và quy ước giảng dạy. Chưa có audio nên không ký xác nhận phát âm/audio thực tế.
2. 12 grammar: 二/两, 个/口, chủ ngữ-vị ngữ, câu đầy đủ/cụm/lời đáp, ngày/tháng/thứ/giờ.
3. Bài 3: thử ba lượt 6/6/3 và hoạt động nhớ lại, ghi thời lượng quan sát thật, khó ở từ/nhóm nào. 40 phút chỉ là dự toán; không tạo user hoặc ghi dữ liệu Cloud để thử.
4. Đọc theo vai hội thoại cả 4 bài; kiểm ngữ cảnh lời chào, tên hư cấu, household giả định và ba tình huống thời gian riêng.
5. Đủ 24 câu, ưu tiên 14 câu thay đổi và L2-Q1, đồng thời duyệt riêng **24 explanations revision 2**. Một vị trí key đã đổi sau remediation; không dùng store revision 1.
6. Sáu dòng rights và tám dòng focus đều cần quyết định; ghi giấy phép/phạm vi sử dụng/attribution được chốt, không chỉ “nguồn có trên web”.

158 dòng gồm: 44 vocabulary, 12 grammar, 4 lessons, 29 sections, 4 quiz-level reviews, 24 questions, 24 private attestations, 3 catalog ancestors, 6 rights và 8 focus checks. **Hiện thiếu toàn bộ bằng chứng duyệt thật**, chữ ký, quyền sử dụng được chốt và approval cho import. Không có công cụ tự tổng hợp PASS thành quyền ghi Cloud.
