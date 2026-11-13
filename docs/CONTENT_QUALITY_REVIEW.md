# HSK 1 Pilot v1 — Content Quality Review

**Cập nhật 2026-11-13: đã sửa draft_revision 2 theo phạm vi được phê duyệt.** CQ-01–CQ-11 đều FIXED ở mức triển khai offline; bảng remediation ở cuối và [PILOT_CONTENT_REMEDIATION](PILOT_CONTENT_REMEDIATION.md) là trạng thái hiện tại. Human review vẫn pending và import/publish BLOCKED. Các nhận xét, số đếm và kết quả kiểm thử của baseline dưới đây được giữ làm bằng chứng lịch sử, không áp dụng nguyên trạng cho revision 2.

## Review baseline revision 1 — giữ bằng chứng

Ngày: **2026-11-13, Asia/Saigon**. Baseline nội dung: commit `61aa76e`. Đây là rà soát có AI hỗ trợ, **không phải human review**, không điền tên/chữ ký người duyệt. Tất cả `review_status=pending`, `status=draft`, human reviewer/date null và import/publish authorization false được giữ nguyên.

**Kết luận: CẦN CHỈNH SỬA / CHƯA ĐỦ ĐIỀU KIỆN IMPORT.** Đã đọc 44 mục vocabulary, 12 grammar, toàn bộ 24 sections của 4 lesson, 24 câu quiz và REVIEW_CHECKLIST. Phát hiện 1 vấn đề mức Cao, 6 mức Vừa và 4 mức Thấp bên dưới; đây gồm cả rủi ro sư phạm và đề xuất biên tập, không phải 11 lỗi phát âm đã được chuyên gia xác nhận. Không sửa payload draft hoặc private answers trong vòng này để giữ baseline review rõ ràng; mọi đề xuất đang mở.

## Cách định vị và mức độ

Các đường dẫn dưới đây tính từ `content/pilot-hsk1/v1/`. JSON Pointer đánh số array từ 0; mã L2-Q1 nghĩa là lesson 2, question sort_order 1. Với vocabulary dùng thêm chữ Hán để tránh nhầm sau khi sắp lại.

- **Cao:** cần xử lý trước khi dùng câu hỏi để chấm điểm.
- **Vừa:** cần xử lý hoặc có quyết định sư phạm có lý do trước import/publication.
- **Thấp:** cải thiện cách trình bày; không tự coi là lỗi ngữ pháp.

## Danh sách vấn đề và đề xuất sửa

| ID | Mức | File / vị trí | Phát hiện và tác động | Đề xuất cụ thể — chưa áp dụng |
| --- | --- | --- | --- | --- |
| CQ-01 | Cao | `quizzes/lesson-02.json#/questions/0/prompt`; lesson 2 `l2-dialogue` | Stem hỏi “câu hỏi tên theo mẫu của bài”, nhưng bài có cả mẫu hỏi đầy đủ và lượt hỏi tiếp rút gọn. Thiếu ngữ cảnh khiến chưa thể chứng nhận duy nhất một lựa chọn đúng theo mọi cách hiểu hợp lý. Key vẫn khớp ý đồ tác giả; điều đó không giải quyết tính mơ hồ. | Đổi stem thành: “Hai người mới gặp nhau và chưa ai nói tên. Chọn câu hỏi tên đầy đủ, tự hiểu được khi đứng riêng.” Rà lại toàn bộ choices và giải thích trong private store với stem mới; không chỉ giữ key vì validator PASS. |
| CQ-02 | Vừa | `lessons/lesson-03.json#/estimated_minutes`; `l3-intro`, `l3-words`; manifest lesson 3 `new_vocabulary_ids` | 15 từ mới, 22 refs tổng cộng, sở hữu, 有, hai lượng từ, 二/两 và biến điệu trong 30 phút có nguy cơ quá tải người mới. Đây là đánh giá thiết kế, chưa có số liệu người học. | Chia thành 3 lượt học trong cùng lesson, nhóm 6/6/3 ở phần sau; thêm ôn không nhìn pinyin giữa các lượt. Thử nghiệm 35–45 phút tổng hoặc hai lượt học ngắn trước khi chốt thời lượng. Không tăng số lesson hoặc triển khai progress/Sprint 2.2. |
| CQ-03 | Vừa | `quizzes/lesson-03.json#/questions/2/choices/1` | Distractor chứa từ chỉ thời gian của bài 4 chưa được giới thiệu tại bài 3. Người học có thể bị kiểm tra chữ chưa học hoặc loại bằng hình thức. Đây là sai thứ tự học, không phải câu Trung sai. | Thay bằng một câu hỏi hoàn chỉnh chỉ dùng từ bài 1–3, ví dụ câu hỏi danh tính đã học; sau đó đối chiếu private key/revision. Rà phạm vi từ của mọi distractor mới. |
| CQ-04 | Vừa | Quiz L1-Q1/Q6, L2-Q2/Q6; xem bảng 24 câu | Mảnh từ đơn, phát ngôn không thành câu và nhận định phi lý làm distractor quá dễ. Phân biệt dạng câu thay thế cho việc hiểu nghĩa. Distractor cố ý sai không được tính là lỗi tiếng Trung của lesson. | L1 dùng các phát ngôn trọn vẹn đã học. L2-Q2 giữ cùng khung câu rồi đổi nhân xưng/tên nhân vật. L2-Q6 dùng các nhận định cùng chủ đề về cấu trúc câu hỏi, không dùng lời chào làm “quy tắc tạo câu hỏi”. Không tăng độ khó bằng chữ chưa học hoặc thêm hai cách diễn đạt tương đương cùng đúng. |
| CQ-05 | Vừa | `grammar.json#/6/examples/0`, `#/8/examples`; vocabulary 的/和/一/五/七/月; lesson 3 `l3-dialogue` block 2; lesson 4 `l4-dialogue` block 3 | Phần lớn bản dịch vocabulary đã ghi “cụm”, nhưng một số grammar/dialogue dùng dấu chấm mà không nhắc đó là cụm hoặc lời đáp rút gọn. Người mới có thể suy rằng mọi danh ngữ đều là câu trần thuật đầy đủ. Trong hội thoại, đáp ngắn như vậy vẫn tự nhiên, không phải câu sai. | Giữ câu trả lời rút gọn trong hội thoại, ghi “lời đáp rút gọn cho câu hỏi trước”. Ví dụ standalone bỏ dấu chấm ở chữ Hán/pinyin nếu dùng như nhãn cụm; bản dịch ghi “cụm danh từ/cụm chỉ ngày”. Với grammar ngày tháng có thể thêm ví dụ câu đầy đủ với 今天 rồi giữ ví dụ ngắn có nhãn. Không gán mọi dạng không có 是 là câu thiếu vị ngữ. |
| CQ-06 | Vừa | lesson 1 `l1-intro` block 2; lesson 3 `l3-intro` block 4; manifest `pinyin_policy` | Quy ước giữ thanh gốc cho thanh 3, ghi biến điệu 一/不 đã được nêu đúng hướng. Tuy nhiên ví dụ 你好 hai âm tiết không đủ giúp người học tự suy cách đọc chuỗi ba thanh 3 như 我很好; câu “pinyin chữ thường” dễ bị hiểu thành quy tắc viết hoa/thường. | Đổi thành “Pinyin của âm tiết mang thanh 3 vẫn ghi thanh gốc; khi nói, cách đọc phụ thuộc nhóm nhịp và ngữ cảnh. Không tự đổi tất cả thanh 3 liền nhau thành thanh 2.” Dùng đối chiếu ngắn với 你好 và 我很好; người dạy duyệt cách giải thích và audio trước khi dạy phát âm. Không sửa máy móc mọi nǐ/hěn/hǎo thành ní/hén. |
| CQ-07 | Vừa | `grammar.json#/0/explanation_vi` | “Không dùng trật tự tiếng Việt để tự ý đảo” là lời cấm chung, không chỉ ra thao tác nào sai; có thể khiến người Việt nghĩ trật tự chủ ngữ–vị ngữ của hai ngôn ngữ luôn đối lập. | Thay bằng “Trong các mẫu của bài, 我/你 đứng trước phần nói về người đó. Ví dụ 我很好: 我 là chủ ngữ, 很好 là phần nói về trạng thái. Học cả mẫu, chưa tự đảo vị trí.” Không mở rộng thành mệnh đề tổng quát về hai ngôn ngữ. |
| CQ-08 | Thấp | `grammar.json#/8/explanation_vi` | Cụm tiếng Việt “tương đương và” thiếu dấu chỉ từ đang được giải nghĩa, dễ đọc vấp. | Viết “和 nối danh từ hoặc cụm danh từ, gần nghĩa ‘và’ trong các mẫu của bài; không dùng để nối tùy ý mọi mệnh đề.” Giữ giới hạn hiện có. |
| CQ-09 | Thấp | `grammar.json#/1/examples/1` | Ví dụ câu hỏi nằm trong mục mang tên câu trần thuật và pattern có 很. Ví dụ không sai, nhưng không minh họa trực tiếp pattern của mục. | Giữ ví dụ trần thuật làm trọng tâm; chuyển ví dụ nghi vấn sang phần đối chiếu có ghi rõ hoặc chỉ dẫn tới mục 吗. Không thêm từ bài sau chỉ để có ví dụ mới. |
| CQ-10 | Thấp | `lessons/lesson-02.json#/objective_vi`, `l2-intro` block 0, `l2-review` block 0 | “membership HSK” và “không sửa bản ghi học trên Cloud” lẫn nghiệp vụ kỹ thuật vào mục tiêu/nghiệm vụ của người học. | Mục tiêu đề xuất: “Hỏi và nói tên; giới thiệu bản thân và xuất xứ; nói mình học tiếng Trung.” Bài tự ôn: “Dùng tên hư cấu, tự nói một câu giới thiệu và một câu phủ định danh tính.” Giữ giới hạn Cloud/provenance trong manifest/README. |
| CQ-11 | Thấp | vocabulary 家/天/叫; `grammar.json#/6/examples/0/translationVi`; lesson 1 hội thoại | Không thấy dịch sai rõ, nhưng gloss 家 và bản dịch “gia đình/ngôi nhà” thay đổi trọng tâm; 天 trong 星期天 không nên dạy như phép dịch từng chữ; 叫 có nghĩa rộng hơn sense giới thiệu tên. Hội thoại chào hỏi cố ý lặp nhiều, có tính luyện mẫu. | Ở lesson gia đình ưu tiên “gia đình của tôi”; giữ nghĩa “nhà” như nghĩa khác có chú thích. Nói rõ 星期天 là một cụm nói thứ, không suy nghĩa từ 天 riêng lẻ. Giữ 叫 trong mẫu mang tên; không tự chứng nhận mọi nghĩa “gọi” là sense HSK 1. Có thể rút một lượt chào lặp sau khi người học đã nhận diện mẫu. |

Không phát hiện bằng chứng để đổi thanh của 44 headwords trong vòng này. Không coi Hànyǔ viết hoa, thanh nhẹ ở bàba/māma/gēge/jiějie, hoặc yí ge/bú shì trong chú âm giảng dạy là lỗi chỉ vì khác cách ghi thanh từ điển. Không có audio nên chưa đánh giá phát âm thực.

## Rà từng mục vocabulary

“Chưa thấy lỗi rõ” là nhận xét của vòng AI trên nghĩa Việt, pinyin, ví dụ và cách dùng trong pilot, không phải human PASS hoặc xác minh sense theo syllabus. Index là vị trí hiện tại trong `vocabulary.json`; mọi hàng vẫn pending.

| Index | Mục / pinyin | Nhận xét |
| --- | --- | --- |
| 0 | 你 nǐ | Nghĩa/đại từ và lời chào phù hợp; thanh gốc đúng quy ước, đọc liền xem CQ-06. |
| 1 | 好 hǎo | “Khỏe/ổn” phù hợp ngữ cảnh hỏi thăm; không suy mọi 好 đều nói sức khỏe. |
| 2 | 吗 ma | Thanh nhẹ, hỏi có/không; ví dụ phù hợp. |
| 3 | 很 hěn | Chú thích không luôn dịch nhấn mạnh “rất” là cần thiết; giữ. |
| 4 | 我 wǒ | Nghĩa và ví dụ phù hợp; chuỗi thanh 3 cần hướng dẫn CQ-06. |
| 5 | 谢谢 xièxie | Âm tiết sau nhẹ, nghĩa/đối tượng cảm ơn phù hợp. |
| 6 | 再见 zàijiàn | Phát ngôn chào kết thúc hoàn chỉnh theo chức năng; không cần ép thành câu có chủ ngữ. |
| 7 | 呢 ne | Hỏi tiếp đã giới hạn theo ngữ cảnh; giữ giới hạn đó khi ra quiz. |
| 8 | 叫 jiào | Mẫu giới thiệu tên tự nhiên; sense rộng “gọi” chưa được bằng chứng headword chứng minh (CQ-11). |
| 9 | 什么 shénme | Thanh nhẹ me, câu hỏi đúng vị trí; không thêm 吗 trong mẫu này. |
| 10 | 名字 míngzi | Thanh nhẹ zi; nghĩa và ví dụ phù hợp. |
| 11 | 是 shì | Danh tính/loại, không khái quát “là” trước mọi tính từ; ví dụ phù hợp. |
| 12 | 人 rén | Nghĩa người, cấu tạo quốc gia + 人 phù hợp. |
| 13 | 中国 Zhōngguó | Tên riêng viết hoa, nghĩa/biến điệu trong ví dụ phù hợp. |
| 14 | 越南 Yuènán | Đúng tên quốc gia/pinyin; giữ bổ trợ, không thêm membership cấp 1. |
| 15 | 汉语 Hànyǔ | “Tiếng Hán/tiếng Trung” phù hợp; viết hoa có căn cứ chuẩn chính tả, không sửa thành thường máy móc. |
| 16 | 学习 xuéxí | Ví dụ học ngôn ngữ đúng và vừa sức. |
| 17 | 不 bù | Headword bù, câu bú shì là quy ước giảng dạy đã giải thích. Không áp quy tắc phủ định này cho 有. |
| 18 | 家 jiā | Ngữ cảnh household phù hợp; thống nhất dịch theo CQ-11. |
| 19 | 的 de | Thanh nhẹ, đã ghi cụm danh từ; câu mẫu không phải phát ngôn trần thuật đầy đủ. |
| 20 | 有 yǒu | Ví dụ sở hữu với lượng từ phù hợp; chưa dạy phủ định thì không thêm distractor cần 没有. |
| 21 | 几 jǐ | Hỏi lượng nhỏ, không tuyên bố giới hạn số tuyệt đối; giữ thanh gốc trong 几口. |
| 22 | 口 kǒu | Đếm thành viên gia đình đúng trong ngữ cảnh đã chọn; không dạy như lượng từ người nói chung. |
| 23 | 爸爸 bàba | Âm sau nhẹ; ví dụ thân thuộc bỏ 的 phù hợp. |
| 24 | 妈妈 māma | Âm sau nhẹ; ví dụ phù hợp. |
| 25 | 哥哥 gēge | Anh trai lớn tuổi hơn mình, âm sau nhẹ; tình huống độc lập, không cộng vào household chính. |
| 26 | 姐姐 jiějie | Chị gái lớn tuổi hơn mình, âm sau nhẹ; ví dụ phù hợp. |
| 27 | 和 hé | Nối danh từ, ví dụ là cụm; gloss phù hợp nhưng phân loại sense nguồn vẫn cần người duyệt. |
| 28 | 一 yī | Dạng từ điển và yí ge đã tách; ví dụ là cụm số lượng. |
| 29 | 二 èr | Đếm số phù hợp, ví dụ dạng liệt kê không phải câu; không thay bằng 两 khi đọc chuỗi số. |
| 30 | 三 sān | Số lượng household đúng với ngữ cảnh ba người. |
| 31 | 个 gè | Headword gè, ge trong ví dụ khẩu ngữ là có chủ đích; không bắt thanh nhẹ trong mọi hoàn cảnh nhấn mạnh. |
| 32 | 两 liǎng | Các ví dụ trước 个 đúng trong phạm vi bài; không suy mọi số 2 đều phải 两. |
| 33 | 今天 jīntiān | Câu vị ngữ thời gian có thể không có 是, dịch thứ Tư đúng. |
| 34 | 星期 xīngqī | Nghĩa tuần và mẫu nói thứ đã phân biệt; giữ qī theo nguồn đã chọn. |
| 35 | 四 sì | Ví dụ giờ đúng phù hợp; không ép thêm buổi sáng/chiều. |
| 36 | 五 wǔ | Ngày/tháng dịch đúng thứ tự; đã ghi cụm. |
| 37 | 六 liù | 星期六 dịch thứ Bảy đúng. |
| 38 | 七 qī | Không dùng 星期七 là quy tắc đúng trong mẫu cơ bản; ngày mẫu là cụm, 一 giữ yī trong chuỗi ngày. |
| 39 | 月 yuè | Ngày ba tháng hai đúng; hai dùng 二 trong tháng. |
| 40 | 号 hào | Nghĩa ngày tháng phù hợp; không nhập chung với mọi sense “số/hiệu”. |
| 41 | 现在 xiànzài | Nghĩa và ví dụ hỏi giờ phù hợp. |
| 42 | 点 diǎn | Đơn vị giờ đúng; 两点 phù hợp; không suy nghĩa của dấu chấm hay lượng nhỏ từ lookup này. |
| 43 | 天 tiān | Trong 星期天 có nghĩa theo cả cụm, xem CQ-11; không tự thêm ngày cuối tuần khác chưa học. |

## Rà 12 grammar và 4 lessons

| Grammar index | Chủ điểm | Kết quả / hành động |
| --- | --- | --- |
| 0 | Đại từ/chủ ngữ | Ví dụ đúng; sửa lời giải thích theo CQ-07. |
| 1 | 很 + 好 | Giữ phân biệt nghĩa “rất”; làm rõ loại ví dụ theo CQ-09. |
| 2 | 吗 / 呢 | Mẫu phù hợp, 呢 phụ thuộc lượt trước; không tự coi nó là câu hỏi tên độc lập trong quiz. |
| 3 | 叫 + tên | Câu hoàn chỉnh, tên hư cấu/pinyin phù hợp. |
| 4 | 什么 | Giữ vị trí từ hỏi và giới hạn không thêm 吗 trong mẫu cụ thể; phù hợp. |
| 5 | 是 / 不是 | Danh tính và chú thích 不 phù hợp; chỉ là mẫu ngôn ngữ, không xác minh quốc tịch pháp lý. |
| 6 | 的 / bỏ 的 | Có giới hạn quan hệ thân thuộc đúng hướng; thống nhất nhãn cụm và gloss 家 (CQ-05/11). |
| 7 | 有 / lượng từ / 二两 | Ví dụ đúng; nên tách thành các bước trong lesson 3 thay vì một khối quy tắc (CQ-02). |
| 8 | 和 | Dạng cụm dùng được; chỉnh tiếng Việt và nhãn cụm (CQ-05/08). |
| 9 | Thứ / vị ngữ thời gian | Ánh xạ thứ và Chủ nhật phù hợp; không cần chèn 是 vào mọi mẫu. |
| 10 | Ngày tháng | Tháng trước ngày, các tình huống độc lập; ghi nhãn lời đáp ngắn (CQ-05). |
| 11 | Giờ đúng | 两点, không có buổi/phút là phù hợp phạm vi; không diễn giải thành giờ hệ thống thật. |

Lesson 1: câu Trung và bản dịch hiểu được; hội thoại hơi có tính luyện mẫu, đã chú thích ngữ cảnh. Lesson 2: hội thoại và tên hư cấu dùng được; lượt nói học tiếng Trung cuối đoạn hơi đột ngột, có thể đặt dưới tiểu mục “nói thêm về bản thân” để rõ mục đích. Lesson 3: cả household ba người và các ví dụ anh/chị độc lập không mâu thuẫn; cần chia tải học và ghi lời đáp liệt kê. Lesson 4: ba tình huống độc lập, không có xung đột lịch thật; chỉ bao phủ số đã học, không tuyên bố đọc được mọi ngày/tháng. Listening ở cả 4 bài chỉ có transcript/audioAssetId null: không được tính là bài nghe đã được kiểm chứng.

Các quy tắc trọng tâm đã rà: 二 dùng trong chuỗi đếm, 二月/星期二; 两 trong ví dụ trước 个/giờ; 一 giữ thanh từ điển khi đọc chuỗi số/ngày, 一个 chú âm giảng dạy; 不 trước 是 chú âm biến điệu; 个 và 口 đã có phạm vi; không có ví dụ khẳng định sai như 星期七 hoặc 不有 trong lesson. Những hình thức sai nằm trong distractor là chủ ý, không phải mẫu để học thuộc.

## Đề xuất chia bài 3 trong cùng lesson

| Lượt | Nhóm từ mới | Hoạt động / điều kiện sang lượt sau |
| --- | --- | --- |
| A — 6 từ | 家、爸爸、妈妈、哥哥、姐姐、的 | Nhận diện quan hệ và cụm sở hữu, chưa ép nói câu sở hữu số lượng. Phân biệt cụm “mẹ của tôi” với câu nói trạng thái đã học. |
| B — 6 từ | 一、二、三、两、有、个 | Đếm trước, sau đó luyện mẫu 有 với 个; đối chiếu dạng số và cách nói số lượng. Ôn lại các danh từ A. |
| C — 3 từ | 几、口、和 | Hỏi/đáp số thành viên, liệt kê household giả định; đối chiếu 个/口 trong ngữ cảnh cụ thể. |

Xen 2–3 phút tự nhớ lại không nhìn pinyin; kết thúc bằng hội thoại chính. Thời lượng 35–45 phút là đề xuất thử nghiệm gồm ôn, không phải kết quả nghiên cứu hoặc cam kết. Có thể học hai lượt ngắn, không yêu cầu tạo thêm record/progress. Khi sửa sau review, dùng section text hợp lệ Content V1, giữ 4 lesson, IDs/refs và 44 distinct words; không sửa schema.

## 24 quiz: rà ý nghĩa và đối chiếu private store

Đã giải các câu từ public stem/choices trước rồi so với store riêng bằng helper local nằm **bên trong thư mục private có ACL**, không in index, lựa chọn được gắn key hoặc nội dung giải thích. Kết quả: **24/24 key khớp ý đồ giải độc lập; 23/24 chưa thấy cách hiểu dẫn tới lựa chọn thứ hai trong vòng AI; L2-Q1 chưa thể chốt duy nhất một đáp án vì CQ-01.** Không đánh dấu quizSemanticReview PASS.

Giải thích riêng: 24/24 có nội dung đủ dài, không markup nguy hiểm và có dấu hiệu từ vựng đúng chủ đề theo rubric. Đây là kiểm tra nội dung có giới hạn bằng các predicate local, **chưa xác minh đầy đủ toàn văn lập luận, sắc thái hoặc khả năng giải thích nhầm distractor**. Không suy từ topic-match ra “24 giải thích hoàn toàn hợp lý”. Cần người duyệt đọc toàn văn tại private store bằng quy trình được duyệt; không copy vào báo cáo công khai. Lần probe đầu cho L1-Q3 không khớp mẫu cụm từ quá hẹp; probe tiếp xác nhận có cách diễn đạt trạng thái tương ứng, rubric được mở cho paraphrase. Không sửa answer store hoặc bỏ qua mismatch key; 24 key khớp ngay từ lần đầu.

| Câu / JSON Pointer question | Key dự kiến khớp | Tính duy nhất trong vòng AI | Distractor / hành động đề xuất |
| --- | --- | --- | --- |
| L1-Q1 `/questions/0` | Có | Chưa thấy lựa chọn thứ hai | Thay mảnh đại từ bằng phát ngôn hoàn chỉnh đã học (CQ-04). |
| L1-Q2 `/questions/1` | Có | Chưa thấy lựa chọn thứ hai | Có thể giữ ở mức nhận biết đầu bài; các speech acts khác nhau là scaffold có chủ đích. |
| L1-Q3 `/questions/2` | Có | Chưa thấy lựa chọn thứ hai | Dễ; nếu tăng khó dùng các phát ngôn trọn vẹn cùng ngữ cảnh, tránh thêm hai lời đáp đồng nghĩa. |
| L1-Q4 `/questions/3` | Có | Chưa thấy lựa chọn thứ hai trong stem có ngữ cảnh | Các lựa chọn Việt nên cùng là câu hỏi tiếp, không trộn lời chào kết thúc. |
| L1-Q5 `/questions/4` | Có | Chưa thấy lựa chọn thứ hai | Giữ như câu nhận biết dễ; không nhất thiết tăng khó mọi câu đầu tiên. |
| L1-Q6 `/questions/5` | Có | Chưa thấy lựa chọn thứ hai | Ưu tiên thay mảnh từ đơn bằng lời nói hoàn chỉnh (CQ-04). |
| L2-Q1 `/questions/0` | Có | CẦN SỬA STEM | CQ-01; stem mới phải loại phụ thuộc vào lượt nói bị lược bỏ. |
| L2-Q2 `/questions/1` | Có | Chưa thấy lựa chọn thứ hai | Cùng khung câu, thay người/tên; bỏ tổ hợp vô nghĩa dễ loại (CQ-04). |
| L2-Q3 `/questions/2` | Có | Chưa thấy lựa chọn thứ hai | Làm bốn bản dịch cùng chủ đề giới thiệu xuất xứ, tránh nhảy sang hoạt động học. |
| L2-Q4 `/questions/3` | Có | Chưa thấy lựa chọn thứ hai | Cân nhắc các phát ngôn cùng về danh tính/người nói; không đưa thêm kiểu phủ định chưa học. |
| L2-Q5 `/questions/4` | Có | Chưa thấy lựa chọn thứ hai | Bốn bản dịch nên cùng là hoạt động/người học, tránh cách dịch tiếng Việt vô nghĩa quá rõ. |
| L2-Q6 `/questions/5` | Có | Chưa thấy lựa chọn thứ hai trong mẫu cụ thể | Cùng loại nhận định về quy tắc hỏi; tránh lời chào và lượng từ tuyệt đối “mọi câu” (CQ-04). |
| L3-Q1 `/questions/0` | Có | Chưa thấy lựa chọn thứ hai | Dễ vì các chức năng khác chủ đề; có thể giữ làm kiểm tra nhận biết hư từ. |
| L3-Q2 `/questions/1` | Có | Chưa thấy lựa chọn thứ hai | Các lựa chọn cùng loại số lượng, phù hợp; chưa cần tăng khó. |
| L3-Q3 `/questions/2` | Có | Chưa thấy lựa chọn thứ hai | Thay distractor bài 4 chưa học (CQ-03). |
| L3-Q4 `/questions/3` | Có | Chưa thấy lựa chọn thứ hai khi stem chỉ định giá trị cần điền | Hai lựa chọn bị loại chỉ bằng số; cân nhắc câu đối chiếu 2 lựa chọn, contract cho phép 2–6. Không buộc đủ 4 distractor kém. |
| L3-Q5 `/questions/4` | Có | Chưa thấy lựa chọn thứ hai | Dạng gloss hư từ dễ nhưng vừa sức; không thay bằng nhiều bản dịch Việt cùng nghĩa. |
| L3-Q6 `/questions/5` | Có | Chưa thấy lựa chọn thứ hai | Cùng loại quan hệ họ hàng, có đảo thứ tự; có thể giữ, cần giữ nghĩa lớn tuổi hơn người nói. |
| L4-Q1 `/questions/0` | Có | Chưa thấy lựa chọn thứ hai | Các thứ cùng loại, phù hợp. |
| L4-Q2 `/questions/1` | Có | Chưa thấy lựa chọn thứ hai | Cùng loại cấu trúc thứ; dạng cố ý sai là distractor, không chuyển sang ví dụ học thuộc. |
| L4-Q3 `/questions/2` | Có | Chưa thấy lựa chọn thứ hai | Đảo tháng/ngày có mục tiêu rõ, giữ. |
| L4-Q4 `/questions/3` | Có | Chưa thấy lựa chọn thứ hai | Các câu hỏi về thời gian cùng loại hơn câu hỏi household; chỉ dùng các mẫu đã học. |
| L4-Q5 `/questions/4` | Có | Chưa thấy lựa chọn thứ hai | Nên đặt các distractor cùng loại câu nói giờ, cùng phạm vi số đã học. |
| L4-Q6 `/questions/5` | Có | Chưa thấy lựa chọn thứ hai | Cùng loại mốc giờ; stem hơi dài. Rút phần “giả định/12 giờ” thành hướng dẫn chung nhưng giữ giới hạn không suy sáng/chiều. |

Bảng không chứa answer indices, key vector hoặc giải thích đáp án riêng. Các đề xuất đổi distractor là hướng thiết kế, chưa được chốt thành choices mới hay cấp revision mới. Sau khi sửa stem/choices phải kiểm lại key và explanation cùng revision, ngay cả khi giữ nguyên question UUID.

## Metadata HSK, chính tả và quyền sử dụng

1. Chạy lại kiểm cache hiện có: 43/44 exact headword + reading khớp bản **HSK考试大纲 2025-11 / ghi triển khai 2026-07**; có ordinal/trang, PDF SHA-256 và text-cache SHA-256. Một tên quốc gia bổ trợ, không có membership cấp 1. Không nâng `sense_review_state` hoặc `syllabus.verified_at` vì kết quả này.
2. Nguồn [Chinese Tests syllabus](https://www.chinesetest.cn/syllabus) và [PDF chính thức](https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf). Bảng từ PDF 80–87 / trang in 77–84; grammar PDF 386–388 / trang in 383–385. Đã đọc lại các trang grammar trích xuất local: có pronouns, particles, classifiers/numerals, các loại vị ngữ và biểu đạt thời gian. Mã category tiếng Anh trong manifest là nhãn đối chiếu nội bộ, không phải trích nguyên văn mọi quy tắc dạy học.
3. Giữ nguyên raw labels như 好 `1（2）（4）`, 点 `1（3）`, 和1. Số phân biệt trong bảng từ và số đánh sense/chức năng trong bảng grammar không tự được coi là cùng một mapping. Ví dụ grammar có 和1/和2 theo chức năng; headword lookup không chứng minh mọi cách dùng “và”. Các nghĩa 好/家/叫/号/点/天 và câu do tác giả biên soạn vẫn cần review riêng.
4. Đối chiếu thêm **GB/T 16159-2012**: [SAMR catalog](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=5645BD8DB9D8D73053AD3A2397E15E74), [PDF trên website Bộ Giáo dục](https://www.moe.gov.cn/ewebeditor/uploadfile/2015/01/13/20150113091717604.pdf). Đọc trực quan PDF trang 13–14 / trang in 9–10: §6.3.3 có Hànyǔ viết hoa; §6.5.1 không ghi dấu thanh nhẹ; §6.5.2 cho phép cách ghi biến điệu 一/不 phục vụ giảng dạy. Vì vậy không ghi các lựa chọn hiện tại đó thành lỗi chính tả. Tách từ theo policy hiện tại, gồm các thứ viết liền; chưa có bằng chứng trong vòng này để buộc đổi toàn bộ kiểu tách.
5. Headword match, đối chiếu chính tả, xác minh nghĩa và quyền phân phối là **bốn việc khác nhau**. Chưa có người duyệt thật hoặc giấy phép phân phối được chốt. `pending-rights-review` không phải license. Không đổi người review thành AI hoặc điền ngày duyệt thay con người.

## Cách ly private và giới hạn kiểm tra an toàn

- `answers.json`, `author.mjs` chứa key vẫn trong `.local/pilot-hsk1/v1/private/`; helper audit mới cũng ở đó, không đưa vào Git. `git check-ignore` xác nhận cả ba; `git ls-files -- .local/pilot-hsk1` không có file.
- Windows ACL trên directory và từng file trên chỉ có tài khoản local hiện tại/SYSTEM; directory tắt kế thừa. Không in tài khoản/SID hoặc key trong báo cáo. Đây là cách ly local, không phải mã hóa hay phê duyệt backup/chia sẻ.
- Helper đối chiếu key chỉ đọc answer store, xác nhận bytes không đổi trước/sau. Kết quả local chỉ có IDs, boolean/counts tại `.local/pilot-hsk1/quality-audit-result.json`; không có raw private explanations hoặc key indices. Source author cũ không được chạy lại để tránh ghi đè draft.
- Scan lần đầu 172 files tracked/unignored và 41 browser JS chunks hiện có: không tìm thấy bản sao đầy đủ private author hoặc chuỗi giải thích riêng (ngưỡng 25 ký tự). Security scan kiểm thêm forbidden key fields trong public JSON, app imports và draft markers trong browser chunks. Không thấy evidence lộ private store. Các scan không chứng minh mọi obfuscation hay bản backup ngoài workspace đều an toàn.
- Browser bundle là artifact production đã có từ lần build baseline; không chạy build lại vì app/content không đổi. Không gọi Cloud, không đọc credentials, không import/provisioning. Không có browser execution hoặc Cloud authorization test mới trong vòng này.

## Validation, thay đổi và điều kiện bàn giao

File tracked mới duy nhất của vòng review: **`docs/CONTENT_QUALITY_REVIEW.md`**. Private helper/report và cache chuẩn chính tả là local ignored. Không thay vocabulary/grammar/lessons/quizzes, manifest, hashes, review metadata, app code hoặc migrations. Các hash public hiện tại vẫn PASS; không tạo revision giả chỉ vì viết báo cáo.

Lệnh hiện có trong repository là `npm run content:validate` (không có script tên `content`). Kết quả thực hiện ngày 2026-11-13, các tiến trình đều đã kết thúc:

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run content:validate` | PASS public schema, refs, counts, private-key structure và source-cache cross-check; không issue kỹ thuật. Human/quiz/pinyin semantic review vẫn pending; importReadiness BLOCKED. |
| `npm run test` | 136 tests / 15 files PASS; đây là regression tests, không phải 136 chứng nhận ngôn ngữ. |
| `npm run test:contracts` | PASS static repository/snapshot checks. |
| `npm run test:security` | PASS static scan và browser chunks hiện có; chưa có kiểm tra Cloud mới. |
| So sánh toàn bộ package với commit `61aa76e` | Bytes không đổi; mọi public hash trong manifest khớp. |
| Đối chiếu riêng private store | 24 intended keys khớp; kiểm topic/length/markup của 24 explanations đạt trong phạm vi rubric; semantic readiness vẫn BLOCKED theo CQ-01 và giới hạn review toàn văn. |
| `git diff --check` | PASS. |

Không thêm test mới chỉ để kiểm tra một báo cáo Markdown. Kiểm thử cấu trúc không tự đóng các finding sư phạm. Không chạy lại lint/typecheck/build vì không sửa code hoặc payload; lần build baseline là bằng chứng đã có, không được tính là build mới của vòng review này.

Trước import: xử lý CQ-01; sửa/giải trình các vấn đề Vừa; người duyệt đọc riêng mọi key/explanation và toàn bộ nội dung Trung/Việt; duyệt senses/nguồn/quyền và workflow private store; nếu chỉnh draft thì cập nhật manifest public hashes, đối chiếu key revision và chạy lại validator/regressions; chốt package/revision rồi xin phê duyệt riêng Development import. Tất cả human review và import/publish vẫn **pending/BLOCKED**. Không thay Supabase, không migration hoặc Sprint 2.2.

## Kết quả remediation draft_revision 2 — trạng thái hiện tại

Ngày 2026-11-13. Các finding của baseline đã được xử lý trực tiếp trong JSON; chi tiết field, quiz revisions và giới hạn nằm trong [PILOT_CONTENT_REMEDIATION](PILOT_CONTENT_REMEDIATION.md).

| Finding | Trạng thái | Thay đổi chính |
| --- | --- | --- |
| CQ-01 | FIXED | Thu hẹp stem L2-Q1 thành câu hỏi tên đầy đủ khi chưa có ngữ cảnh trước; kiểm lại cả 24 câu và private explanations. |
| CQ-02 | FIXED | Bài 3 có ba lượt 6/6/3, guides/refs và ôn ngắn, 40 phút dự kiến; ví dụ từ mới không cần chữ của lượt sau. |
| CQ-03 | FIXED | Thay distractor bài 4 trong quiz bài 3 bằng mẫu danh tính đã học. |
| CQ-04 | FIXED | Cải thiện các distractor mục tiêu, cùng khung/loại ngữ nghĩa; giữ một số câu dễ có lý do scaffold trong báo cáo remediation. |
| CQ-05 | FIXED | Nhãn cụm và lời đáp rút gọn, dấu câu standalone; thêm câu ngày tháng hoàn chỉnh. |
| CQ-06 | FIXED | Làm rõ thanh 3/nhịp/ngữ cảnh và 一/不/gè–ge; giữ thanh gốc headwords. |
| CQ-07 | FIXED | Giải thích chủ ngữ/vị ngữ theo mẫu cụ thể, bỏ lời cấm chung về tiếng Việt. |
| CQ-08 | FIXED | Sửa diễn đạt 和 và giới hạn nối danh từ/cụm. |
| CQ-09 | FIXED | Chỉ giữ ví dụ trần thuật minh họa 很; dẫn sang mục hỏi hiện có. |
| CQ-10 | FIXED | Mục tiêu và tự ôn lesson 2 bỏ thuật ngữ Cloud/membership. |
| CQ-11 | FIXED | Thống nhất nghĩa ngữ cảnh và ví dụ của 家/天/叫 cùng family examples. |

FIXED là kết quả sửa draft và AI review, **không phải human PASS**. Kết quả hiện tại: `npm run content` PASS, 140 tests/15 files PASS; lint/typecheck/format/contracts/security PASS. Private store revision 2 bind đúng quiz hashes, 24 keys tính lại và đối chiếu; không xuất key/explanation. Human language/quiz/pedagogy/rights review vẫn pending; import/publish **BLOCKED**. Các kết quả 136 tests, 24 sections, câu còn mơ hồ và package bytes không đổi ở phần baseline là lịch sử, đã được thay thế bằng 29 sections và remediation này.
