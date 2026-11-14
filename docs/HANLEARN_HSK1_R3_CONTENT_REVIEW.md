# HanLearn HSK 1 r3 — rà soát độc lập dựa trên 5 tài liệu công khai

**Phạm vi:** VOCABULARY.md, GRAMMAR.md, LESSONS.md, QUIZZES.md, CATALOG_AND_RIGHTS.md (người dùng cung cấp). Đây là **đánh giá nội dung công khai hỗ trợ owner review**, không phải reviewer bản ngữ/giấy chứng nhận pháp lý/owner approval; không thay đổi source, revision, review records, private keys hay Cloud.

## Kết luận nhanh

- **44/44 mục từ:** đã đọc nghĩa, ví dụ chữ Hán/Pinyin/Vietnamese; không phát hiện lỗi ngôn ngữ chắc chắn, có một số lựa chọn cách diễn đạt cần lưu ý. Không tuyên bố đã xác minh toàn bộ HSK official membership độc lập.
- **12/12 mục ngữ pháp:** nội dung giải thích nhìn chung nhất quán với mẫu câu và có phạm vi áp dụng rõ; không phát hiện lỗi ngữ pháp hiển nhiên ở những ví dụ được cung cấp.
- **4 bài, 29 sections:** đủ cấu trúc 6/6/11/6; hướng dẫn biến điệu và các ngữ cảnh giả định tương đối cẩn thận. Bài 3 là điểm cần owner đánh giá tải học thực tế.
- **24 câu hỏi công khai:** mỗi quiz 6 câu, đa số có một lựa chọn phù hợp rõ theo bài học; **23 câu có 4 lựa chọn, riêng L3-Q4 có 2 lựa chọn**. Không đọc/chấm/đối chiếu private answer store.
- **Quyền/nguồn:** các tài liệu này không chứng minh giấy phép tái phân phối, không chứng nhận owner đã trực tiếp review hoặc tự xác minh đề cương HSK. `review_status=pending`, `content_license=pending-rights-review`, `verified_at=null` đang được trình bày trung thực.

## Phát hiện ưu tiên

| Ưu tiên | Mã/vị trí | Quan sát | Khuyến nghị |
|---|---|---|---|
| P2 – nhất quán đánh giá | `QUIZZES.md` L3-Q4 (`7dca8e38-6482-5716-87f8-0086c6f02b93`) | Chỉ có A/B; 23 câu còn lại A–D. Xác suất đoán đúng câu này 50% thay vì 25% nếu lựa chọn đều ngẫu nhiên. Không phải sai tiếng Trung hoặc bắt buộc là lỗi schema. | Owner chọn giữ dạng phân biệt hai từ hoặc thiết kế thêm 2 distractors hợp lệ. Nếu chỉnh câu frozen, tạo revision và cập nhật key/bindings đúng quy trình. |
| P2 – thiếu phạm vi kiểm chứng | `QUIZZES.md` phần tiêu đề quiz | Cho thấy 6 câu/bài và quiz revisions nhưng **không cung cấp ngưỡng đạt** hoặc cấu hình grading; không thể từ tài liệu này chứng nhận pass threshold từng quiz. | Đối chiếu cấu hình quiz metadata/DB contract riêng trước khi chốt. |
| P2 – tải học | `LESSONS.md` Bài 3 | 15 từ mới theo 3 lượt (6+6+3), 3 điểm ngữ pháp và 11 sections trong ước tính 40 phút; có nguy cơ quá nặng cho người bắt đầu. Đây là **rủi ro trải nghiệm**, chưa phải lỗi đã được chứng minh. | Owner học thử lượt A/B/C; nếu nặng, chia thành 2 buổi hoặc điều chỉnh kế hoạch học mà không cần sửa source ngay. |
| P3 – độ tự nhiên | `LESSONS.md` Bài 1–2 | 你好吗？ là mẫu nhập môn thông dụng trong giáo trình nhưng không phải lời hỏi thăm phù hợp với mọi hoàn cảnh. Câu cuối hội thoại Bài 2 (我学习汉语。) chuyển chủ đề hơi đột ngột. | Có thể giữ cho bài nhập môn; nếu chỉnh, thêm nhãn ngữ cảnh hoặc đối thoại nối ý trong một content revision mới. |
| P2 – phạm vi provenance | `CATALOG_AND_RIGHTS.md` | `third_party_lesson_text_copied=false` là khai báo authoring; không phải kiểm chứng corpus độc lập. Official HSK lookup chỉ `machine_checked_on`, `human_reviewer=null`, `verified_at=null`. | Không dùng các cờ này để tự cấp license, điền human review date hoặc tự promote. Phần nguồn sao chép trực tiếp chưa rõ tiếp tục là phạm vi chưa xác minh. |

## Kiểm tra theo từng nhóm nội dung

### 1. Vocabulary — 44 mục từ

Đã kiểm tra các cặp chữ Hán / pinyin / nghĩa / câu ví dụ dưới đây theo phạm vi tiếng Trung giao tiếp nhập môn. Nhận xét “ổn sơ bộ” **không đồng nghĩa human PASS hoặc xác nhận bản quyền**.

| # | Từ | Pinyin | Kết quả kiểm tra sơ bộ |
|---:|---|---|---|
| 1 | 你 | nǐ | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 2 | 好 | hǎo | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 3 | 吗 | ma | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 4 | 很 | hěn | Giải thích 很 không nhất thiết nhấn mạnh “rất” trong 我很好 là phù hợp |
| 5 | 我 | wǒ | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 6 | 谢谢 | xièxie | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 7 | 再见 | zàijiàn | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 8 | 呢 | ne | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 9 | 叫 | jiào | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 10 | 什么 | shénme | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 11 | 名字 | míngzi | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 12 | 是 | shì | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 13 | 人 | rén | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 14 | 中国 | Zhōngguó | Tên quốc gia viết hoa trong pinyin nhất quán |
| 15 | 越南 | Yuènán | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 16 | 汉语 | Hànyǔ | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 17 | 学习 | xuéxí | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 18 | 不 | bù | Phân biệt bù (mục từ) với bú shì trong câu là phù hợp |
| 19 | 家 | jiā | Đã ghi rõ 我的家 là cụm từ, không phải câu |
| 20 | 的 | de | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 21 | 有 | yǒu | Yí ge phản ánh biến điệu của 一 trong mẫu 一个 |
| 22 | 几 | jǐ | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 23 | 口 | kǒu | 口 giới hạn ở đếm thành viên gia đình, tránh khái quát hóa |
| 24 | 爸爸 | bàba | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 25 | 妈妈 | māma | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 26 | 哥哥 | gēge | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 27 | 姐姐 | jiějie | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 28 | 和 | hé | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 29 | 一 | yī | Ghi yī ở mục từ và yí trong 一个人 là hợp lý |
| 30 | 二 | èr | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 31 | 三 | sān | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 32 | 个 | gè | 个 dạng từ điển gè; nhẹ ge trong câu là hợp lý trong ngữ cảnh |
| 33 | 两 | liǎng | 两 trước lượng từ là phù hợp |
| 34 | 今天 | jīntiān | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 35 | 星期 | xīngqī | Cụm 星期三 viết xīngqīsān nhất quán |
| 36 | 四 | sì | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 37 | 五 | wǔ | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 38 | 六 | liù | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 39 | 七 | qī | 七月一号 là câu minh họa ngày, không khẳng định ngày thực |
| 40 | 月 | yuè | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 41 | 号 | hào | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 42 | 现在 | xiànzài | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 43 | 点 | diǎn | Không phát hiện lệch nghĩa/Pinyin rõ trong ví dụ |
| 44 | 天 | tiān | Giải thích 星期天 theo cụm, tránh dịch chữ 天 riêng |

**Giới hạn:** Đây là kiểm tra nghĩa và cấu trúc dựa trên các câu cung cấp, không phải đối chiếu âm thanh phát âm, chứng thực danh mục HSK chính thức hay đánh giá bởi người bản ngữ.

### 2. Grammar — 12 mục

| # | Chủ đề | Đánh giá |
|---:|---|---|
| 1 | Đại từ làm chủ ngữ | Ổn trong phạm vi chủ ngữ + vị ngữ của bài; không suy khái quát sai trật tự hai ngôn ngữ. |
| 2 | Câu trần thuật với 很 và tính từ | Giải thích 很 trong vị ngữ tính từ có sắc thái phù hợp; không thêm 是. |
| 3 | Câu hỏi có/không với 吗 và hỏi tiếp bằng 呢 | Phân biệt 吗 (có/không) và 呢 (hỏi tiếp theo ngữ cảnh) rõ. |
| 4 | Giới thiệu tên với 叫 | 我叫… phù hợp; tên nhân vật được đánh dấu hư cấu. |
| 5 | Hỏi tên với 什么 | 什么 giữ đúng vị trí; không thêm 吗 ở cuối kiểu câu đã có từ nghi vấn. |
| 6 | Danh tính với 是 và phủ định 不是 | 不是 và pinyin bú shì phù hợp với biến điệu của 不. |
| 7 | Sở hữu với 的 trong chủ đề gia đình | Phân biệt 我的家 (cụm từ) và 我爸爸很好 (câu); không khái quát bỏ 的. |
| 8 | 有 và số lượng: 个, 口, 二, 两 | 个/口 và 二/两 được khu biệt; cách ghi yí ge được giải thích. |
| 9 | Liên kết danh từ bằng 和 | 和 nối cụm danh từ; không giới thiệu như liên từ nối mọi mệnh đề. |
| 10 | Thứ trong tuần và vị ngữ thời gian | 星期一…星期六 và 星期天; các tình huống giả định rõ. |
| 11 | Ngày tháng theo thứ tự tháng rồi ngày | Tháng rồi ngày; 五月三号 là ngày 3/5; câu đáp rút gọn có nhãn. |
| 12 | Hỏi giờ đúng với 现在、几点 | 两点 với giờ đúng, khác 二月/星期二; không ngầm định AM/PM. |

### 3. Lessons — 4 bài / 29 sections

| Bài | Sections | Mục tiêu / đánh giá |
|---|---:|---|
| 1: Chào hỏi | 6 | Các mẫu chào, hỏi khỏe, đáp, cảm ơn, tạm biệt nhất quán. Mẫu `你好吗？` phù hợp bài nhập môn nhưng không nên dạy là hỏi thăm bắt buộc trong mọi cuộc gặp. |
| 2: Giới thiệu bản thân | 6 | Hỏi tên, 是/不是, giới thiệu người Việt Nam, học tiếng Trung được liên kết. Lượt kết `我学习汉语。` hơi đột ngột nhưng không sai ngữ pháp. |
| 3: Gia đình | 11 | Tách lượt 6/6/3 hợp lý để giảm tải; tuy nhiên 15 từ + 3 chủ điểm trong 40 phút cần người học thực tế xác nhận. Các câu người thân và số lượng có chú thích không ghép ví dụ hư cấu với gia đình chính. |
| 4: Ngày tháng/giờ | 6 | Phân biệt 星期, ngày tháng, giờ đúng; ba tình huống độc lập được ghi rõ. Không có khẳng định sai về ngày thực. |

### 4. Quizzes — 4 × 6 = 24 câu công khai

**Đánh giá này chỉ xem stem và distractors công khai; không biết `correct_index` thật, giải thích đáp án hoặc ngưỡng đạt trong DB.**

| Câu | Số lựa chọn | Nhận xét |
|---|---:|---|
| L1-Q1 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L1-Q2 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L1-Q3 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L1-Q4 | 4 | Đã có ngữ cảnh cụ thể cho 你呢？; loại mơ hồ trước đây. |
| L1-Q5 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L1-Q6 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L2-Q1 | 4 | Ràng buộc câu hỏi tên tự đứng riêng rõ ràng. |
| L2-Q2 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L2-Q3 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L2-Q4 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L2-Q5 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L2-Q6 | 4 | Đánh giá quy tắc đặt 什么 / không thêm 吗, phù hợp chủ điểm; khá nhiều chữ cho người mới. |
| L3-Q1 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L3-Q2 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L3-Q3 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L3-Q4 | 2 | Chỉ 2 lựa chọn: dễ đoán hơn. Đúng mục tiêu phân biệt 二/两, cần quyết định thiết kế. |
| L3-Q5 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L3-Q6 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L4-Q1 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L4-Q2 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L4-Q3 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L4-Q4 | 4 | Khác biệt giữa hỏi riêng ngày/thứ/giờ và hỏi cả tháng-ngày rõ. |
| L4-Q5 | 4 | Chỉ có một phương án phù hợp rõ với stem theo kiến thức bài học; chưa đối chiếu private key. |
| L4-Q6 | 4 | Mốc 12 giờ `3:00` rõ, không suy AM/PM. |

### 5. Catalog & rights

- `syllabus/course/unit`: tổng 3 entities, vẫn draft/pending; `verified_at` và reviewer/time rỗng.
- Syllabus source ghi edition `2025-11`, triển khai `2026-07`; 43 headword/readings được **máy đối chiếu**, không phải con người phê duyệt. `越南` là từ bổ trợ, không cộng vào 43 membership.
- Rights manifest khai AI-assisted Vietnamese teaching text, examples, quiz; `distribution_license=null`; không có audio; `publication_blocked=true`.
- **Không kiểm chứng trực tiếp** PDF bản quyền/edition/nguồn ngoài, không xác định được mọi website/từ điển đã được dùng ở giai đoạn authoring. Mục này tiếp tục cần owner xác nhận nguồn thực tế; không tự suy quyền tái phân phối từ URL hoặc nguồn trích dẫn.

## Khuyến nghị triển khai

1. **Không sửa r3 ngay** chỉ vì đánh giá này: các vấn đề chính là nhất quán đề thi và tải học, không phải lỗi Hán/Pinyin nghiêm trọng đã xác minh.
2. Owner quyết định giữ L3-Q4 dạng 2 lựa chọn hay tạo revision mới nếu muốn 4 lựa chọn; đồng thời đối chiếu `pass_threshold` từ source quiz config để đánh giá tác động.
3. Học thử Bài 3 đầy đủ và ghi feedback thời lượng/thông tin quá tải (nếu có).
4. Khi cần promotion: owner review thực tế, ghi phạm vi/ngày giờ đúng; hoàn thiện source-use/rights/attribution. ChatGPT review không ký thay owner và không đổi `159 PENDING`.
5. Chỉ sau khi metadata hợp lệ và quyền Cloud được cấp mới chuẩn bị preflight/import/promotion; không bỏ qua yêu cầu RLS/private answer isolation.

## Phương pháp và giới hạn

- Đọc toàn bộ năm file Markdown đã tải lên, trích cấu trúc và so sánh các mục lặp lại; xác minh đếm: 44 từ, 12 grammar, 29 sections (6+6+11+6), 24 câu hỏi/4 quiz (23 câu A–D, 1 câu A–B).
- Không có private answer keys, nên không thể kết luận `correct_index`/giải thích riêng khớp từng câu; không kiểm tra audio.
- Không đọc hồ sơ review register và không thay quyết định của owner.
- Đây là nhận xét chuyên môn của trợ lý từ nội dung cung cấp, **không phải chứng nhận giáo viên bản ngữ, bản quyền hay giấy phép xuất bản**.
