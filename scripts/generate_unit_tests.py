"""
Generates 6 Exam-Style Unit Tests for HSK 1 (Sprint 8I-C).
Each Unit Test contains exactly 20 questions (6 Listening, 4 Vocabulary, 4 Grammar, 6 Reading).
Duration: 20 minutes. Mastery threshold: 80% (16/20 correct).
"""

import json
import os

unit_configs = [
    {
        "unit_id": 1,
        "title": "Unit Test 1: Khởi đầu & Giới thiệu bản thân",
        "scope_vi": "Phạm vi: Bài 1 – Bài 4 (Chào hỏi, họ tên, quốc tịch, gia đình, ngày tháng, thời gian)",
        "lessons": ["hsk1-lesson-01", "hsk1-lesson-02", "hsk1-lesson-03", "hsk1-lesson-04"],
        "questions": [
            # 6 Listening
            {"id": "ut1-q01", "section": "listening", "audioText": "你好！很高兴认识你。", "prompt": "Nghe đoạn ghi âm và chọn câu đáp lại phù hợp nhất:", "choices": ["我也很高兴认识你。", "我家有四口人。", "今天星期五。", "明天见。"], "correct_index": 0, "explanation_vi": "Khi đối phương nói '很高兴认识你', câu đáp lễ chuẩn là '我也很高兴认识你' (Tôi cũng rất vui được làm quen với bạn)."},
            {"id": "ut1-q02", "section": "listening", "audioText": "你叫什么名字？", "prompt": "Nghe câu hỏi và chọn câu trả lời đúng:", "choices": ["我叫李明。", "我是老师。", "我不是中国人。", "他叫大卫。"], "correct_index": 0, "explanation_vi": "Hỏi '你叫什么名字' (Bạn tên là gì) trả lời bằng '我叫...' (Tôi tên là...)."},
            {"id": "ut1-q03", "section": "listening", "audioText": "你家有几口人？", "prompt": "Nghe câu hỏi và chọn câu trả lời đúng ngữ cảnh:", "choices": ["我家有四口人。", "现在三点半。", "我是学生。", "他是医生。"], "correct_index": 0, "explanation_vi": "Hỏi số người trong gia đình '几口人' trả lời '我家有四口人' (Nhà tôi có 4 người)."},
            {"id": "ut1-q04", "section": "listening", "audioText": "今天星期几？", "prompt": "Nghe câu hỏi và chọn câu trả lời tương ứng:", "choices": ["今天星期三。", "今天是十月。", "现在八点。", "明天不上课。"], "correct_index": 0, "explanation_vi": "Hỏi thứ trong tuần '星期几' trả lời '今天星期三' (Hôm nay thứ Tư)."},
            {"id": "ut1-q05", "section": "listening", "audioText": "他是中国学生吗？", "prompt": "Nghe câu hỏi nghi vấn và chọn câu trả lời:", "choices": ["他不是中国人，他是美国人。", "我今年二十岁。", "我家在北京。", "他是我的爸爸。"], "correct_index": 0, "explanation_vi": "Hỏi '他是中国学生吗', câu trả lời xác định quốc tịch là '他不是中国人...'."},
            {"id": "ut1-q06", "section": "listening", "audioText": "现在几点？——现在上午十点十分。", "prompt": "Nghe đoạn đối thoại và xác định thời gian:", "choices": ["10:10 sáng", "10:30 sáng", "9:10 sáng", "2:10 chiều"], "correct_index": 0, "explanation_vi": "'上午十点十分' là 10 giờ 10 phút sáng."},
            
            # 4 Vocabulary
            {"id": "ut1-q07", "section": "vocabulary", "prompt": "Từ nào dưới đây có nghĩa là 'giáo viên, thầy cô giáo'?", "choices": ["老师", "学生", "医生", "朋友"], "correct_index": 0, "explanation_vi": "'老师' (lǎoshī) là giáo viên; '学生' là học sinh, '医生' là bác sĩ."},
            {"id": "ut1-q08", "section": "vocabulary", "prompt": "Chọn Pinyin chuẩn của từ '名字' (tên):", "choices": ["míngzi", "míngzhì", "míngshì", "mínzi"], "correct_index": 0, "explanation_vi": "'名字' có pinyin là 'míngzi' (chữ zi đọc thanh nhẹ)."},
            {"id": "ut1-q09", "section": "vocabulary", "prompt": "Từ nào sau đây là lượng từ đếm thành viên trong gia đình?", "choices": ["口", "个", "只", "本"], "correct_index": 0, "explanation_vi": "Trong câu '我家有三口人', '口' là lượng từ đếm nhân khẩu gia đình."},
            {"id": "ut1-q10", "section": "vocabulary", "prompt": "Cách nói 'Chủ nhật' đúng quy tắc trong tiếng Trung là:", "choices": ["星期天", "星期七", "星期八", "星期九"], "correct_index": 0, "explanation_vi": "Chủ nhật dùng '星期天' hoặc '星期日', không dùng '星期七'."},

            # 4 Grammar
            {"id": "ut1-q11", "section": "grammar", "prompt": "Điền từ phủ định thích hợp: '我____是老师，我是学生。'", "choices": ["不", "没", "很", "也"], "correct_index": 0, "explanation_vi": "Phủ định trước động từ 是 dùng '不' (đọc biến điệu bú shì)."},
            {"id": "ut1-q12", "section": "grammar", "prompt": "Điền số từ thích hợp trước lượng từ: '我有____个姐姐。' (Tôi có hai người chị gái)", "choices": ["两", "二", "几", "口"], "correct_index": 0, "explanation_vi": "Trước lượng từ 个 dùng '两' (liǎng), không dùng '二'."},
            {"id": "ut1-q13", "section": "grammar", "prompt": "Cặp câu nào sắp xếp trật tự thời gian đúng quy tắc tiếng Trung?", "choices": ["明天上午九点", "九点明天上午", "上午九点明天", "九点上午明天"], "correct_index": 0, "explanation_vi": "Trật tự thời gian tiếng Trung đi từ lớn đến nhỏ: Ngày (明天) -> Buổi (上午) -> Giờ (九点)."},
            {"id": "ut1-q14", "section": "grammar", "prompt": "Trợ từ kết cấu '的' trong câu '这是我妈妈的书' biểu thị ý nghĩa gì?", "choices": ["Mối quan hệ sở hữu", "Mối quan hệ so sánh", "Hành động tiếp diễn", "Câu hỏi nghi vấn"], "correct_index": 0, "explanation_vi": "'的' ở đây là trợ từ sở hữu (sách của mẹ tôi)."},

            # 6 Reading
            {"id": "ut1-q15", "section": "reading", "prompt": "Đọc đoạn văn sau:\n'你好！我叫王朋。我是中国人，也是汉语老师。我家有三口人：爸爸、妈妈和我。'\nCâu hỏi: Vương Bằng làm nghề gì?", "choices": ["Giáo viên tiếng Trung", "Học sinh", "Bác sĩ", "Nhân viên công ty"], "correct_index": 0, "explanation_vi": "Đoạn văn viết: '也是汉语老师' -> Giáo viên tiếng Trung."},
            {"id": "ut1-q16", "section": "reading", "prompt": "Theo đoạn văn trên, nhà Vương Bằng có mấy người?", "choices": ["3 người", "4 người", "2 người", "5 người"], "correct_index": 0, "explanation_vi": "'我家有三口人：爸爸、妈妈和我' -> Có 3 người."},
            {"id": "ut1-q17", "section": "reading", "prompt": "Đọc câu: '今天星期五，明天我和大卫去商店。'\nHỏi: Ngày mai là thứ mấy?", "choices": ["Thứ Bảy", "Chủ nhật", "Thứ Sáu", "Thứ Hai"], "correct_index": 0, "explanation_vi": "Hôm nay thứ Sáu (星期五) thì ngày mai là thứ Bảy (星期六)."},
            {"id": "ut1-q18", "section": "reading", "prompt": "Đọc câu: '李明不是医生，他是学生。'\nNhận định sau Đúng hay Sai: 'Lý Minh là bác sĩ.'", "choices": ["Sai", "Đúng"], "correct_index": 0, "explanation_vi": "Trong bài: '李明不是医生' (Lý Minh không phải bác sĩ) -> Nhận định là Sai."},
            {"id": "ut1-q19", "section": "reading", "prompt": "Đọc đối thoại:\nA: '请问，您是哪国人？'\nB: '我是越南人。你呢？'\nA: '我是中国人。'\nHỏi: Nhân vật A mang quốc tịch nào?", "choices": ["Trung Quốc", "Việt Nam", "Mỹ", "Pháp"], "correct_index": 0, "explanation_vi": "Nhân vật A trả lời: '我是中国人' (Tôi là người Trung Quốc)."},
            {"id": "ut1-q20", "section": "reading", "prompt": "Đọc câu: '现在是下午两点半，我们去喝茶吧。'\nHỏi: Họ dự định làm gì lúc 2 giờ rưỡi chiều?", "choices": ["Đi uống trà", "Đi ăn cơm", "Đi mua đồ", "Đi ngủ"], "correct_index": 0, "explanation_vi": "'我们去喝茶吧' -> Đi uống trà."}
        ]
    },
    {
        "unit_id": 2,
        "title": "Unit Test 2: Gia đình, Thời gian & Sinh hoạt",
        "scope_vi": "Phạm vi: Bài 5 – Bài 8 (Nghề nghiệp, giờ giấc, mua sắm, giá cả, ăn uống, gọi món)",
        "lessons": ["hsk1-lesson-05", "hsk1-lesson-06", "hsk1-lesson-07", "hsk1-lesson-08"],
        "questions": [
            # 6 Listening
            {"id": "ut2-q01", "section": "listening", "audioText": "这个苹果多少钱一斤？——五块钱一斤。", "prompt": "Nghe đoạn đối thoại và xác định giá táo:", "choices": ["5 đồng một cân", "10 đồng một cân", "15 đồng một cân", "2 đồng một cân"], "correct_index": 0, "explanation_vi": "'五块钱一斤' -> 5 đồng/cân."},
            {"id": "ut2-q02", "section": "listening", "audioText": "你想吃米饭还是面条？", "prompt": "Nghe câu hỏi lựa chọn và chọn câu trả lời đúng nghĩa:", "choices": ["我想吃米饭。", "我是医生。", "今天很冷。", "谢谢你。"], "correct_index": 0, "explanation_vi": "Hỏi '吃米饭还是面条' trả lời bằng món muốn ăn '我想吃米饭' (Tôi muốn ăn cơm)."},
            {"id": "ut2-q03", "section": "listening", "audioText": "太贵了，便宜一点儿吧！", "prompt": "Nghe câu nói và chọn ý nghĩa của người nói:", "choices": ["Đắt quá, bớt một chút đi!", "Rẻ quá, tôi mua hết!", "Rất ngon, tôi muốn ăn nữa!", "Đồ này không đẹp."], "correct_index": 0, "explanation_vi": "'太贵了，便宜一点儿吧' là mẫu câu mặc cả: Đắt quá, rẻ một chút đi."},
            {"id": "ut2-q04", "section": "listening", "audioText": "服务员，我想喝一杯热茶。", "prompt": "Nghe và xác định thức uống được gọi:", "choices": ["Một ly trà nóng", "Một chai nước lạnh", "Một ly cà phê", "Một bát canh"], "correct_index": 0, "explanation_vi": "'一杯热茶' là một ly trà nóng."},
            {"id": "ut2-q05", "section": "listening", "audioText": "现在差十分十二点。", "prompt": "Nghe giờ giấc và chọn mốc giờ tương ứng:", "choices": ["11:50 (12 giờ kém 10)", "12:10", "10:12", "11:10"], "correct_index": 0, "explanation_vi": "'差十分十二点' là 12 giờ kém 10 (tức 11:50)."},
            {"id": "ut2-q06", "section": "listening", "audioText": "我妈妈在医院工作，她是医生。", "prompt": "Nghe và xác định nghề nghiệp của người mẹ:", "choices": ["Bác sĩ", "Giáo viên", "Đầu bếp", "Nhân viên"], "correct_index": 0, "explanation_vi": "'她是医生' -> Mẹ là bác sĩ."},

            # 4 Vocabulary
            {"id": "ut2-q07", "section": "vocabulary", "prompt": "Từ nào sau đây có nghĩa là 'cơm, gạo'?", "choices": ["米饭", "面条", "包子", "菜"], "correct_index": 0, "explanation_vi": "'米饭' (mǐfàn) là cơm."},
            {"id": "ut2-q08", "section": "vocabulary", "prompt": "Đơn vị tiền tệ khẩu ngữ phổ biến nhất của Trung Quốc là:", "choices": ["块", "分", "角", "元"], "correct_index": 0, "explanation_vi": "Trong giao tiếp khẩu ngữ, người Trung Quốc thường dùng '块' (kuài) để chỉ đồng nhân dân tệ."},
            {"id": "ut2-q09", "section": "vocabulary", "prompt": "Từ '买' (mǎi) và '卖' (mài) khác nhau như thế nào?", "choices": ["买 là mua, 卖 là bán", "买 là bán, 卖 là mua", "Cả hai đều là mua", "Cả hai đều là bán"], "correct_index": 0, "explanation_vi": "'买' (thanh 3) là Mua; '卖' (thanh 4) là Bán."},
            {"id": "ut2-q10", "section": "vocabulary", "prompt": "Từ nào có nghĩa là 'nước uống'?", "choices": ["水", "茶", "酒", "奶"], "correct_index": 0, "explanation_vi": "'水' (shuǐ) là nước."},

            # 4 Grammar
            {"id": "ut2-q11", "section": "grammar", "prompt": "Chọn trợ từ ngữ khí biểu thị cảm thán trong cấu trúc '太...了':", "choices": ["太好了！", "太好吗？", "太好呢！", "太好吧！"], "correct_index": 0, "explanation_vi": "Cấu trúc cảm thán: 太 + Tính từ + 了! -> '太好了!' (Tốt quá rồi!)."},
            {"id": "ut2-q12", "section": "grammar", "prompt": "Để hỏi giá cả của một món đồ, câu nào đúng chuẩn?", "choices": ["这个多少钱？", "这个几钱？", "这个怎么钱？", "这个什么钱？"], "correct_index": 0, "explanation_vi": "Hỏi giá tiền dùng '多少钱？'."},
            {"id": "ut2-q13", "section": "grammar", "prompt": "Chọn liên từ biểu thị sự lựa chọn trong câu hỏi: '你想吃米饭____面条？'", "choices": ["还是", "或者", "和", "跟"], "correct_index": 0, "explanation_vi": "Trong câu hỏi lựa chọn, dùng '还是' (háishi)."},
            {"id": "ut2-q14", "section": "grammar", "prompt": "Điền động từ năng nguyện: '我想____中国买东西。'", "choices": ["去", "是", "在", "叫"], "correct_index": 0, "explanation_vi": "'我想去中国...' (Tôi muốn đi Trung Quốc...)."},

            # 6 Reading
            {"id": "ut2-q15", "section": "reading", "prompt": "Đọc đoạn văn:\n'今天中午我和朋友去饭馆吃饭。我吃了一碗面条，喝了一杯水。朋友想吃米饭和牛肉。我们一共花了五十块钱。'\nHỏi: Nhân vật 'tôi' đã ăn gì vào buổi trưa?", "choices": ["Một bát mì", "Cơm và thịt bò", "Bánh bao", "Không ăn gì"], "correct_index": 0, "explanation_vi": "'我吃了一碗面条' -> Ăn một bát mì."},
            {"id": "ut2-q16", "section": "reading", "prompt": "Tổng số tiền hai bạn đã chi cho bữa trưa là bao nhiêu?", "choices": ["50 tệ", "15 tệ", "5 tệ", "100 tệ"], "correct_index": 0, "explanation_vi": "'我们一共花了五十块钱' -> 50 tệ."},
            {"id": "ut2-q17", "section": "reading", "prompt": "Đọc thông báo:\n'苹果：三块钱一斤。西瓜：两块钱一斤。'\nHỏi: Mua 2 cân dưa hấu hết bao nhiêu tiền?", "choices": ["4 tệ", "6 tệ", "2 tệ", "5 tệ"], "correct_index": 0, "explanation_vi": "Dưa hấu 2 tệ/cân, 2 cân là 2 * 2 = 4 tệ."},
            {"id": "ut2-q18", "section": "reading", "prompt": "Đọc đối thoại:\nA: '服务员，买单！'\nB: '您好，一共七十八块。'\nHỏi: Nhân vật A đang làm gì?", "choices": ["Thanh toán tiền bữa ăn", "Gọi thêm món", "Hỏi đường đi", "Chào tạm biệt"], "correct_index": 0, "explanation_vi": "'买单' là thanh toán hóa đơn."},
            {"id": "ut2-q19", "section": "reading", "prompt": "Đọc câu: '这家饭馆的菜很好吃，但是有点儿贵。'\nNhận định Đúng hay Sai: Món ăn ở đây dở nhưng rẻ.", "choices": ["Sai", "Đúng"], "correct_index": 0, "explanation_vi": "Trong bài: món ăn rất ngon (很好吃) nhưng hơi đắt (有点儿贵) -> Nhận định là Sai."},
            {"id": "ut2-q20", "section": "reading", "prompt": "Đọc câu: '我爸爸不喝茶，他喜欢喝水。'\nHỏi: Bố thích uống gì?", "choices": ["Nước", "Trà", "Cà phê", "Rượu"], "correct_index": 0, "explanation_vi": "'他喜欢喝水' -> Thích uống nước."}
        ]
    },
    {
        "unit_id": 3,
        "title": "Unit Test 3: Mua sắm, Ẩm thực & Địa điểm",
        "scope_vi": "Phạm vi: Bài 9 – Bài 14 (Vị trí, thói quen, thời tiết, giao thông, trường lớp, bài tập)",
        "lessons": ["hsk1-lesson-09", "hsk1-lesson-10", "hsk1-lesson-11", "hsk1-lesson-12", "hsk1-lesson-13", "hsk1-lesson-14"],
        "questions": [
            # 6 Listening
            {"id": "ut3-q01", "section": "listening", "audioText": "请问，火车站怎么走？", "prompt": "Nghe và xác định người nói muốn hỏi điều gì:", "choices": ["Hỏi đường đi đến ga tàu", "Hỏi giờ tàu chạy", "Hỏi giá vé tàu", "Hỏi tìm người"], "correct_index": 0, "explanation_vi": "'火车站怎么走' là hỏi cách đi/đường đi đến ga tàu hỏa."},
            {"id": "ut3-q02", "section": "listening", "audioText": "今天天气太热了，明天会下雨吗？", "prompt": "Nghe và xác định thời tiết hôm nay:", "choices": ["Rất nóng", "Rất lạnh", "Đang mưa to", "Có tuyết rơi"], "correct_index": 0, "explanation_vi": "'今天天气太热了' -> Thời tiết hôm nay rất nóng."},
            {"id": "ut3-q03", "section": "listening", "audioText": "我每天坐公共汽车去学校。", "prompt": "Nghe và xác định phương tiện di chuyển:", "choices": ["Xe buýt", "Xe taxi", "Tàu điện ngầm", "Đi bộ"], "correct_index": 0, "explanation_vi": "'坐公共汽车' là đi xe buýt."},
            {"id": "ut3-q04", "section": "listening", "audioText": "他在图书馆看书呢。", "prompt": "Nghe và xác định vị trí nhân vật:", "choices": ["Thư viện", "Phòng học", "Bệnh viện", "Ký túc xá"], "correct_index": 0, "explanation_vi": "'在图书馆' -> Ở thư viện."},
            {"id": "ut3-q05", "section": "listening", "audioText": "这本书里有很多生词和练习。", "prompt": "Nghe và chọn nội dung của quyển sách:", "choices": ["Nhiều từ mới và bài tập", "Nhiều tranh ảnh", "Nhiều câu chuyện cổ tích", "Nhiều bài hát"], "correct_index": 0, "explanation_vi": "'很多生词和练习' -> Nhiều từ mới và bài tập."},
            {"id": "ut3-q06", "section": "listening", "audioText": "喂，老师，明天上午我有考试。", "prompt": "Nghe đoạn thông báo và xác định lịch trình:", "choices": ["Sáng mai có bài thi", "Chiều mai có tiết học", "Ngày mai được nghỉ", "Tối mai đi gặp bạn"], "correct_index": 0, "explanation_vi": "'明天上午我有考试' -> Sáng mai có bài thi."},

            # 4 Vocabulary
            {"id": "ut3-q07", "section": "vocabulary", "prompt": "Từ nào sau đây có nghĩa là 'mưa' hoặc 'trời đổ mưa'?", "choices": ["下雨", "天气", "冷", "热"], "correct_index": 0, "explanation_vi": "'下雨' (xiàyǔ) là trời mưa."},
            {"id": "ut3-q08", "section": "vocabulary", "prompt": "Phương tiện giao thông '出租车' có nghĩa là gì?", "choices": ["Xe taxi", "Xe đạp", "Máy bay", "Tàu hỏa"], "correct_index": 0, "explanation_vi": "'出租车' (chūzūchē) là xe taxi."},
            {"id": "ut3-q09", "section": "vocabulary", "prompt": "Từ nào chỉ địa điểm 'trường học'?", "choices": ["学校", "医院", "饭馆", "商店"], "correct_index": 0, "explanation_vi": "'学校' (xuéxiào) là trường học."},
            {"id": "ut3-q10", "section": "vocabulary", "prompt": "Từ '认识' có nghĩa là:", "choices": ["Quen biết", "Học tập", "Nói chuyện", "Nghe"], "correct_index": 0, "explanation_vi": "'认识' (rènshi) là quen biết, nhận biết."},

            # 4 Grammar
            {"id": "ut3-q11", "section": "grammar", "prompt": "Để hỏi cách thức thực hiện hành động, ta dùng đại từ nghi vấn nào?", "choices": ["怎么", "什么", "哪儿", "谁"], "correct_index": 0, "explanation_vi": "'怎么' + Động từ dùng để hỏi cách thức (ví dụ: 怎么去, 怎么写)."},
            {"id": "ut3-q12", "section": "grammar", "prompt": "Điền giới từ chỉ nơi chốn: '我____大学学习中文。'", "choices": ["在", "到", "从", "给"], "correct_index": 0, "explanation_vi": "Giới từ '在' + Nơi chốn + Động từ -> '在大学学习中文' (học tiếng Trung ở trường đại học)."},
            {"id": "ut3-q13", "section": "grammar", "prompt": "Trợ từ '呢' trong câu '他在看书呢' diễn tả điều gì?", "choices": ["Hành động đang tiếp diễn", "Quá khứ hoàn thành", "Hỏi lựa chọn", "Lời mời gọi"], "correct_index": 0, "explanation_vi": "'呢' đứng cuối câu trần thuật biểu thị hành động đang diễn ra."},
            {"id": "ut3-q14", "section": "grammar", "prompt": "Cấu trúc hỏi thời tiết đúng ngữ pháp là:", "choices": ["今天天气怎么样？", "今天天气什么？", "今天天气谁？", "今天天气在哪儿？"], "correct_index": 0, "explanation_vi": "Hỏi tình hình, tính chất dùng '怎么样？'."},

            # 6 Reading
            {"id": "ut3-q15", "section": "reading", "prompt": "Đọc đoạn văn:\n'北京秋天的天气最好，不冷也不热。我和同学们经常去公园跑步，或者在草地上看书。大家都喜欢秋天。'\nHỏi: Thời tiết mùa thu ở Bắc Kinh như thế nào?", "choices": ["Không lạnh cũng không nóng", "Rất lạnh và có tuyết", "Rất nóng và mưa nhiều", "Gió to"], "correct_index": 0, "explanation_vi": "'不冷也不热' -> Không lạnh cũng không nóng."},
            {"id": "ut3-q16", "section": "reading", "prompt": "Các bạn học sinh thường làm gì ở công viên vào mùa thu?", "choices": ["Chạy bộ hoặc đọc sách", "Đi bơi", "Học bài thi", "Nấu ăn"], "correct_index": 0, "explanation_vi": "'经常去公园跑步，或者在草地上看书' -> Chạy bộ hoặc đọc sách."},
            {"id": "ut3-q17", "section": "reading", "prompt": "Đọc câu: '学校在前面，离车站不远。'\nHỏi: Trường học ở đâu?", "choices": ["Ở phía trước, cách bến xe không xa", "Ở phía sau bệnh viện", "Ở bên cạnh công ty", "Cách rất xa"], "correct_index": 0, "explanation_vi": "'在前面，离车站不远' -> Phía trước, không xa bến xe."},
            {"id": "ut3-q18", "section": "reading", "prompt": "Đọc thông báo:\n'明天上午八点在302教室上课，请大家准时到。'\nHỏi: Tiết học ngày mai bắt đầu lúc mấy giờ?", "choices": ["8:00 sáng", "8:30 sáng", "9:00 sáng", "2:00 chiều"], "correct_index": 0, "explanation_vi": "'上午八点' -> 8 giờ sáng."},
            {"id": "ut3-q19", "section": "reading", "prompt": "Đọc câu: '下雨了，路上车很多，我们坐地铁吧。'\nHỏi: Tại sao họ chọn đi tàu điện ngầm?", "choices": ["Trời mưa và đường đông xe", "Họ thích ngắm cảnh", "Tàu điện ngầm miễn phí", "Hết xe buýt"], "correct_index": 0, "explanation_vi": "'下雨了，路上车很多' -> Trời mưa và đường đông xe."},
            {"id": "ut3-q20", "section": "reading", "prompt": "Đọc câu: '大卫汉字写得很好，老师表扬了他。'\nNhận định Đúng hay Sai: Chữ Hán của David viết rất xấu.", "choices": ["Sai", "Đúng"], "correct_index": 0, "explanation_vi": "Trong bài: '汉字写得很好' (chữ viết rất đẹp) -> Nhận định là Sai."}
        ]
    },
    {
        "unit_id": 4,
        "title": "Unit Test 4: Phương hướng, Giao thông & Thời tiết",
        "scope_vi": "Phạm vi: Bài 15 – Bài 20 (Nhà cửa, sức khỏe, thể thao, quần áo, nấu ăn, công sở, giải trí)",
        "lessons": ["hsk1-lesson-15", "hsk1-lesson-16", "hsk1-lesson-17", "hsk1-lesson-18", "hsk1-lesson-19", "hsk1-lesson-20"],
        "questions": [
            # 6 Listening
            {"id": "ut4-q01", "section": "listening", "audioText": "你身体怎么样？——我感冒了，有点儿头疼。", "prompt": "Nghe đoạn thoại và cho biết người nói bị làm sao:", "choices": ["Bị cảm và hơi đau đầu", "Bị gãy chân", "Đau bụng do ăn no", "Rất khỏe mạnh"], "correct_index": 0, "explanation_vi": "'感冒了，有点儿头疼' -> Bị cảm, hơi đau đầu."},
            {"id": "ut4-q02", "section": "listening", "audioText": "这件衣服真漂亮，颜色也很好看。", "prompt": "Nghe và cho biết người nói khen điều gì:", "choices": ["Bộ quần áo đẹp và màu sắc hài hòa", "Đôi giày vừa vặn", "Chiếc mũ quá đắt", "Cái túi xách nhỏ"], "correct_index": 0, "explanation_vi": "'这件衣服真漂亮，颜色也很好看' -> Khen áo đẹp và màu sắc."},
            {"id": "ut4-q03", "section": "listening", "audioText": "周末我们一起去看电影吧！", "prompt": "Nghe lời rủ và xác định hoạt động cuối tuần:", "choices": ["Đi xem phim", "Đi bơi", "Đi leo núi", "Đi ăn nhà hàng"], "correct_index": 0, "explanation_vi": "'去看电影' là đi xem phim."},
            {"id": "ut4-q04", "section": "listening", "audioText": "我爸爸在一家大公司上班。", "prompt": "Nghe và xác định nơi làm việc của người bố:", "choices": ["Công ty", "Bệnh viện", "Trường học", "Cửa hàng"], "correct_index": 0, "explanation_vi": "'在一家大公司上班' -> Làm việc ở công ty lớn."},
            {"id": "ut4-q05", "section": "listening", "audioText": "你喜欢打篮球还是踢足球？", "prompt": "Nghe câu hỏi và chọn hai môn thể thao được nhắc đến:", "choices": ["Bóng rổ và bóng đá", "Cầu lông và bơi lội", "Bóng bàn và chạy bộ", "Tennis và bóng chuyền"], "correct_index": 0, "explanation_vi": "'打篮球' (bóng rổ) và '踢足球' (bóng đá)."},
            {"id": "ut4-q06", "section": "listening", "audioText": "医生让我多喝热水，多休息。", "prompt": "Nghe lời khuyên của bác sĩ:", "choices": ["Uống nhiều nước ấm và nghỉ ngơi nhiều", "Uống thuốc đúng giờ và đi làm", "Ăn nhiều đồ ngọt", "Chạy bộ mỗi sáng"], "correct_index": 0, "explanation_vi": "'多喝热水，多休息' -> Uống nhiều nước ấm và nghỉ ngơi."},

            # 4 Vocabulary
            {"id": "ut4-q07", "section": "vocabulary", "prompt": "Lượng từ phù hợp cho quần áo (như áo sơ mi, áo khoác) là:", "choices": ["件", "本", "个", "只"], "correct_index": 0, "explanation_vi": "Lượng từ cho quần áo là '件' (jiàn, ví dụ: 一件衣服)."},
            {"id": "ut4-q08", "section": "vocabulary", "prompt": "Từ nào sau đây có nghĩa là 'màu đỏ'?", "choices": ["红色", "白色", "黑色", "黄色"], "correct_index": 0, "explanation_vi": "'红色' (hóngsè) là màu đỏ."},
            {"id": "ut4-q09", "section": "vocabulary", "prompt": "Từ '电影' có nghĩa là gì?", "choices": ["Phim ảnh / điện ảnh", "Truyền hình", "Âm nhạc", "Sách báo"], "correct_index": 0, "explanation_vi": "'电影' (diànyǐng) là phim ảnh."},
            {"id": "ut4-q10", "section": "vocabulary", "prompt": "Từ nào chỉ hành động 'nấu cơm / làm bếp'?", "choices": ["做饭", "吃饭", "喝水", "买菜"], "correct_index": 0, "explanation_vi": "'做饭' (zuòfàn) là nấu cơm, làm đồ ăn."},

            # 4 Grammar
            {"id": "ut4-q11", "section": "grammar", "prompt": "Phó từ '真' (zhēn) dùng để bổ nghĩa trước tính từ nhằm mục đích gì?", "choices": ["Biểu thị sự trầm trồ, khen ngợi (thật là...)", "Phủ định tính chất", "Đặt câu hỏi nghi vấn", "So sánh hơn"], "correct_index": 0, "explanation_vi": "'真' đứng trước tính từ biểu thị cảm thán (ví dụ: 真漂亮 - thật đẹp)."},
            {"id": "ut4-q12", "section": "grammar", "prompt": "Điền từ thích hợp: '这双鞋子____点儿大。'", "choices": ["有", "点", "很", "太"], "correct_index": 0, "explanation_vi": "Cấu trúc: 有点儿 + Tính từ (biểu thị không hài lòng: 有点儿大 - hơi to một chút)."},
            {"id": "ut4-q13", "section": "grammar", "prompt": "Điền trợ từ ngữ khí đề nghị, rủ rê: '我们一起去踢球____！'", "choices": ["吧", "吗", "呢", "了"], "correct_index": 0, "explanation_vi": "'吧' đứng cuối câu biểu thị lời rủ rê, đề xuất."},
            {"id": "ut4-q14", "section": "grammar", "prompt": "Chọn cách nói đúng khi biểu thị sự yêu thích làm một việc gì đó:", "choices": ["我喜欢看电影。", "我喜欢看电影吗。", "看电影我喜欢了。", "我喜欢看电影吧。"], "correct_index": 0, "explanation_vi": "Cấu trúc: Chủ ngữ + 喜欢 + Động từ/Tân ngữ."},

            # 6 Reading
            {"id": "ut4-q15", "section": "reading", "prompt": "Đọc đoạn văn:\n'李明今天生病了，没去上班。他觉得身体很冷，头也疼。医生给他开了一些药，让他多睡一会儿。明天他就会好起来。'\nHỏi: Tại sao hôm nay Lý Minh không đi làm?", "choices": ["Vì bị ốm", "Vì đi du lịch", "Vì công ty cho nghỉ", "Vì trời mưa to"], "correct_index": 0, "explanation_vi": "'李明今天生病了，没去上班' -> Bị ốm nên không đi làm."},
            {"id": "ut4-q16", "section": "reading", "prompt": "Bác sĩ đã khuyên Lý Minh điều gì?", "choices": ["Kê thuốc và khuyên ngủ nhiều hơn", "Bảo đi làm bình thường", "Khuyên đi tập thể thao", "Bảo nhịn ăn"], "correct_index": 0, "explanation_vi": "'开了一些药，让他多睡一会儿' -> Kê thuốc và bảo ngủ nhiều hơn."},
            {"id": "ut4-q17", "section": "reading", "prompt": "Đọc câu: '这件红色的衣服一百块，那件黑色的只要八十块。'\nHỏi: Bộ quần áo màu đen giá bao nhiêu?", "choices": ["80 tệ", "100 tệ", "180 tệ", "20 tệ"], "correct_index": 0, "explanation_vi": "'黑色的只要八十块' -> Màu đen 80 tệ."},
            {"id": "ut4-q18", "section": "reading", "prompt": "Đọc câu: '姐姐非常喜欢小狗，她家里养了三只小狗。'\nHỏi: Chị gái nuôi mấy con chó nhỏ?", "choices": ["3 con", "2 con", "4 con", "1 con"], "correct_index": 0, "explanation_vi": "'养了三只小狗' -> Nuôi 3 con chó nhỏ."},
            {"id": "ut4-q19", "section": "reading", "prompt": "Đọc câu: '明天晚上我们去超市买菜，然后在家里做饭。'\nNhận định Đúng hay Sai: Họ dự định ăn tối ở nhà hàng ngoài phố.", "choices": ["Sai", "Đúng"], "correct_index": 0, "explanation_vi": "Trong bài: '在家里做饭' (nấu cơm ở nhà) -> Nhận định là Sai."},
            {"id": "ut4-q20", "section": "reading", "prompt": "Đọc câu: '王老师周末喜欢在家里听音乐、看书。'\nHỏi: Thầy Vương có sở thích gì vào cuối tuần?", "choices": ["Nghe nhạc và đọc sách", "Chơi điện tử", "Đi mua sắm", "Đi leo núi"], "correct_index": 0, "explanation_vi": "'听音乐、看书' -> Nghe nhạc, đọc sách."}
        ]
    },
    {
        "unit_id": 5,
        "title": "Unit Test 5: Sở thích, Công việc & Giao tiếp",
        "scope_vi": "Phạm vi: Bài 21 – Bài 25 (Điện thoại, xưng hô, đại từ nhân xưng, chỉ định, nghi vấn, vị trí không gian)",
        "lessons": ["hsk1-lesson-21", "hsk1-lesson-22", "hsk1-lesson-23", "hsk1-lesson-24", "hsk1-lesson-25"],
        "questions": [
            # 6 Listening
            {"id": "ut5-q01", "section": "listening", "audioText": "喂，请问王经理在吗？", "prompt": "Nghe câu nói qua điện thoại và chọn mục đích:", "choices": ["Hỏi tìm giám đốc Vương", "Báo tin có bưu kiện", "Hẹn đi ăn tối", "Gọi nhầm số"], "correct_index": 0, "explanation_vi": "'请问王经理在吗' là hỏi giám đốc Vương có ở đó không."},
            {"id": "ut5-q02", "section": "listening", "audioText": "很高兴认识您！这是我的名片。", "prompt": "Nghe đoạn giao tiếp lịch thiệp và cho biết nhân vật đưa cái gì:", "choices": ["Danh thiếp", "Bức ảnh", "Cuốn sách", "Chiếc bút"], "correct_index": 0, "explanation_vi": "'名片' là danh thiếp."},
            {"id": "ut5-q03", "section": "listening", "audioText": "我们大家都是好朋友，互相帮助。", "prompt": "Nghe và xác định mối quan hệ giữa các nhân vật:", "choices": ["Bạn bè tốt, luôn giúp đỡ nhau", "Đồng nghiệp mới quen", "Người xa lạ", "Đối thủ cạnh tranh"], "correct_index": 0, "explanation_vi": "'大家都是好朋友，互相帮助' -> Đều là bạn tốt, giúp đỡ lẫn nhau."},
            {"id": "ut5-q04", "section": "listening", "audioText": "请问，卫生间在哪个方向？——在左边。", "prompt": "Nghe và xác định vị trí nhà vệ sinh:", "choices": ["Ở bên trái", "Ở bên phải", "Ở phía trước", "Ở tầng hai"], "correct_index": 0, "explanation_vi": "'在左边' -> Ở bên trái."},
            {"id": "ut5-q05", "section": "listening", "audioText": "这些苹果很甜，那些不大好吃。", "prompt": "Nghe và so sánh chất lượng hoa quả:", "choices": ["Những quả này ngọt, những quả kia không ngon lắm", "Những quả kia ngọt hơn", "Tất cả đều rất chua", "Tất cả đều rất ngon"], "correct_index": 0, "explanation_vi": "'这些苹果很甜，那些不大好吃' -> Những quả này ngọt, quả kia không ngon lắm."},
            {"id": "ut5-q06", "section": "listening", "audioText": "图书馆就在学校的前面。", "prompt": "Nghe và xác định vị trí thư viện:", "choices": ["Ở phía trước trường học", "Ở phía sau trường học", "Ở bên ngoài trường học", "Ở bên trong bệnh viện"], "correct_index": 0, "explanation_vi": "'在学校的前面' -> Ở phía trước trường học."},

            # 4 Vocabulary
            {"id": "ut5-q07", "section": "vocabulary", "prompt": "Từ nào sau đây là kính ngữ của '你' (bạn)?", "choices": ["您", "他", "她", "它"], "correct_index": 0, "explanation_vi": "'您' (nín) là đại từ nhân xưng trang trọng, kính ngữ của '你'."},
            {"id": "ut5-q08", "section": "vocabulary", "prompt": "Từ '大家' (dàjiā) có nghĩa là gì?", "choices": ["Mọi người / tất cả mọi người", "Gia đình lớn", "Nhà của anh ấy", "Chuyên gia"], "correct_index": 0, "explanation_vi": "'大家' (dàjiā) là mọi người."},
            {"id": "ut5-q09", "section": "vocabulary", "prompt": "Cặp từ trái nghĩa chỉ phương hướng nào đúng?", "choices": ["左边 (trái) - 右边 (phải)", "前边 (trên) - 后边 (dưới)", "里边 (ngoài) - 外边 (trong)", "上边 (trái) - 下边 (phải)"], "correct_index": 0, "explanation_vi": "'左边' là bên trái, '右边' là bên phải."},
            {"id": "ut5-q10", "section": "vocabulary", "prompt": "Từ '帮助' (bāngzhù) có nghĩa là:", "choices": ["Giúp đỡ / tương trợ", "Luyện tập", "Học tập", "Nghỉ ngơi"], "correct_index": 0, "explanation_vi": "'帮助' (bāngzhù) là giúp đỡ."},

            # 4 Grammar
            {"id": "ut5-q11", "section": "grammar", "prompt": "Phân biệt đại từ chỉ định: '这' (gần) và '那' (xa). Câu nào đúng nghĩa 'Quyển sách này là của tôi'?", "choices": ["这本书是我的。", "那本书是我的。", "哪本书是我的？", "什么书是我的？"], "correct_index": 0, "explanation_vi": "'这' chỉ vật ở gần người nói (này / đây)."},
            {"id": "ut5-q12", "section": "grammar", "prompt": "Hậu tố '们' thêm vào sau đại từ hoặc danh từ chỉ người để biểu thị điều gì?", "choices": ["Số nhiều (chúng tôi, các bạn, họ)", "Sở hữu", "Kính trọng", "Thời gian"], "correct_index": 0, "explanation_vi": "Hậu tố '们' (men) biểu thị số nhiều (ví dụ: 我们, 你们, 他们, 老师们)."},
            {"id": "ut5-q13", "section": "grammar", "prompt": "Điền từ chỉ phương vị thích hợp: '书在桌子____。'", "choices": ["上", "前", "后", "左"], "correct_index": 0, "explanation_vi": "Sách nằm ở trên bàn: 桌子上."},
            {"id": "ut5-q14", "section": "grammar", "prompt": "Chọn câu hỏi đúng khi muốn hỏi vị trí: 'Quyển sách của tôi ở đâu?'", "choices": ["我的书在哪儿？", "我的书怎么了？", "我的书是谁？", "我的书什么时候？"], "correct_index": 0, "explanation_vi": "Hỏi vị trí nơi chốn dùng '在哪儿？'."},

            # 6 Reading
            {"id": "ut5-q15", "section": "reading", "prompt": "Đọc đoạn văn:\n'李经理的办公室在三楼，电梯出来往右走就是。他现在正在开会，请您在会议室外边等一下。'\nHỏi: Văn phòng của giám đốc Lý ở tầng mấy?", "choices": ["Tầng 3", "Tầng 2", "Tầng 1", "Tầng 4"], "correct_index": 0, "explanation_vi": "'在三楼' -> Ở tầng 3."},
            {"id": "ut5-q16", "section": "reading", "prompt": "Giám đốc Lý hiện đang làm gì?", "choices": ["Đang họp", "Đang ăn cơm", "Đang đi công tác", "Đang ngủ"], "correct_index": 0, "explanation_vi": "'正在开会' -> Đang họp."},
            {"id": "ut5-q17", "section": "reading", "prompt": "Đọc câu: '我们学校的前面是一个大公园，后面是一个超市。'\nHỏi: Địa điểm nào nằm ở phía sau trường học?", "choices": ["Siêu thị", "Công viên lớn", "Bệnh viện", "Sân vận động"], "correct_index": 0, "explanation_vi": "'后面是一个超市' -> Phía sau là một siêu thị."},
            {"id": "ut5-q18", "section": "reading", "prompt": "Đọc câu: '这位是张老师，她是教我们汉语的。'\nNhận định Đúng hay Sai: Cô Trương là giáo viên dạy tiếng Anh.", "choices": ["Sai", "Đúng"], "correct_index": 0, "explanation_vi": "Trong bài: '教我们汉语的' (dạy tiếng Hán) -> Nhận định là Sai."},
            {"id": "ut5-q19", "section": "reading", "prompt": "Đọc câu: '大家在学习上遇到困难，老师都会热心帮助。'\nHỏi: Khi gặp khó khăn trong học tập, ai sẽ nhiệt tình giúp đỡ?", "choices": ["Thầy cô giáo", "Bạn cùng phòng", "Bác sĩ", "Người lạ"], "correct_index": 0, "explanation_vi": "'老师都会热心帮助' -> Thầy cô giáo nhiệt tình giúp đỡ."},
            {"id": "ut5-q20", "section": "reading", "prompt": "Đọc câu: '这几张照片很漂亮，是我在北京拍的。'\nHỏi: Những bức ảnh này được chụp ở đâu?", "choices": ["Bắc Kinh", "Thượng Hải", "Hà Nội", "Tokyo"], "correct_index": 0, "explanation_vi": "'在北京拍的' -> Chụp ở Bắc Kinh."}
        ]
    },
    {
        "unit_id": 6,
        "title": "Unit Test 6: Hoạt động xã hội & Đời sống hàng ngày",
        "scope_vi": "Phạm vi: Bài 26 – Bài 32 (Số đếm lớn, lượng từ, lịch trình, thời gian, động từ năng nguyện, phó từ mức độ, ngữ khí tổng kết)",
        "lessons": ["hsk1-lesson-26", "hsk1-lesson-27", "hsk1-lesson-28", "hsk1-lesson-29", "hsk1-lesson-30", "hsk1-lesson-31", "hsk1-lesson-32"],
        "questions": [
            # 6 Listening
            {"id": "ut6-q01", "section": "listening", "audioText": "这部新手机要两千五百块钱。", "prompt": "Nghe đoạn thông báo giá tiền và chọn con số đúng:", "choices": ["2.500 tệ", "2.050 tệ", "5.200 tệ", "250 tệ"], "correct_index": 0, "explanation_vi": "'两千五百块' là 2.500 tệ."},
            {"id": "ut6-q02", "section": "listening", "audioText": "我希望明年能去中国留学。", "prompt": "Nghe và xác định ước muốn của người nói:", "choices": ["Năm sau có thể đi Trung Quốc du học", "Mua nhà mới", "Tìm được việc làm lương cao", "Học tiếng Anh"], "correct_index": 0, "explanation_vi": "'希望明年能去中国留学' -> Hy vọng năm sau đi Trung Quốc du học."},
            {"id": "ut6-q03", "section": "listening", "audioText": "请不要在图书馆里大声说话。", "prompt": "Nghe câu yêu cầu và cho biết nội dung cấm chỉ:", "choices": ["Không được nói chuyện to trong thư viện", "Không được ăn uống", "Không được dùng điện thoại", "Không được mang cặp vào"], "correct_index": 0, "explanation_vi": "'不要在图书馆里大声说话' -> Đừng nói to trong thư viện."},
            {"id": "ut6-q04", "section": "listening", "audioText": "他正在操场上跑步呢。", "prompt": "Nghe và xác định hành động đang tiếp diễn:", "choices": ["Đang chạy bộ trên sân tập", "Đang đá bóng", "Đang học bài", "Đang nghe nhạc"], "correct_index": 0, "explanation_vi": "'正在操场上跑步呢' -> Đang chạy bộ trên sân thể dục."},
            {"id": "ut6-q05", "section": "listening", "audioText": "时间不早了，我们一起走吧！", "prompt": "Nghe câu giục và chọn ý nghĩa:", "choices": ["Không còn sớm nữa, chúng ta cùng đi thôi!", "Trời còn sớm, ở lại chơi tiếp nhé!", "Tôi muốn đi ngủ rồi.", "Hôm nay tôi không đi đâu."], "correct_index": 0, "explanation_vi": "'时间不早了，我们一起走吧' -> Không còn sớm nữa, chúng ta cùng đi thôi."},
            {"id": "ut6-q06", "section": "listening", "audioText": "小猫趴在椅子下面睡着了。", "prompt": "Nghe và xác định vị trí chú mèo con đang ngủ:", "choices": ["Dưới gầm ghế", "Trên bàn", "Bên ngoài cửa", "Trong phòng ngủ"], "correct_index": 0, "explanation_vi": "'在椅子下面' -> Dưới ghế."},

            # 4 Vocabulary
            {"id": "ut6-q07", "section": "vocabulary", "prompt": "Từ nào sau đây biểu thị số đếm 'một nghìn' (1.000)?", "choices": ["一千", "一百", "一万", "一十"], "correct_index": 0, "explanation_vi": "'千' (qiān) là hàng nghìn -> '一千' là 1.000."},
            {"id": "ut6-q08", "section": "vocabulary", "prompt": "Động từ năng nguyện nào mang nghĩa 'hy vọng, mong muốn'?", "choices": ["希望", "知道", "认识", "工作"], "correct_index": 0, "explanation_vi": "'希望' (xīwàng) là hy vọng, ước mong."},
            {"id": "ut6-q09", "section": "vocabulary", "prompt": "Từ '非常' (fēicháng) là phó từ chỉ mức độ gì?", "choices": ["Rất / vô cùng (mức độ cao hơn 很)", "Một chút", "Không hẳn", "Bình thường"], "correct_index": 0, "explanation_vi": "'非常' (fēicháng) nghĩa là vô cùng, hết sức."},
            {"id": "ut6-q10", "section": "vocabulary", "prompt": "Trợ từ ngữ khí '吧' (ba) thường dùng ở cuối câu để biểu thị điều gì?", "choices": ["Thương lượng, đề nghị, rủ rê", "Khẳng định tuyệt đối", "Câu hỏi vặn lại", "Cảm thán ngạc nhiên"], "correct_index": 0, "explanation_vi": "'吧' đứng cuối câu biểu thị lời đề xuất, rủ rê nhẹ nhàng."},

            # 4 Grammar
            {"id": "ut6-q11", "section": "grammar", "prompt": "Chọn phó từ cấm chỉ thích hợp: '天气很冷，你____穿得太少。'", "choices": ["不要", "不会", "不能", "不可"], "correct_index": 0, "explanation_vi": "'不要' (bú yào) dùng trong câu khuyên can hoặc cấm chỉ (đừng mặc quá ít)."},
            {"id": "ut6-q12", "section": "grammar", "prompt": "Cấu trúc biểu thị hành động đang diễn ra tại thời điểm nói:", "choices": ["Chủ ngữ + 正在 + Động từ + (呢)", "Chủ ngữ + 已经 + Động từ + (了)", "Chủ ngữ + 要 + Động từ + (了)", "Chủ ngữ + 曾 + Động từ + (过)"], "correct_index": 0, "explanation_vi": "Cấu trúc tiếp diễn: 正在 + Động từ + (呢)."},
            {"id": "ut6-q13", "section": "grammar", "prompt": "Điền động từ năng nguyện chỉ khả năng do tập luyện mà có: '他学了一年汉语，现在____说一点儿中文。'", "choices": ["会", "要", "想", "爱"], "correct_index": 0, "explanation_vi": "'会' biểu thị năng lực, kỹ năng có được qua học tập."},
            {"id": "ut6-q14", "section": "grammar", "prompt": "Cách diễn đạt mốc thời gian 'sau khi ăn cơm' đúng ngữ pháp là:", "choices": ["吃饭以后", "以后吃饭", "吃以后饭", "饭以后吃"], "correct_index": 0, "explanation_vi": "Cấu trúc: Hành động + 以后 (yǐhòu) -> '吃饭以后' (sau khi ăn cơm)."},

            # 6 Reading
            {"id": "ut6-q15", "section": "reading", "prompt": "Đọc đoạn văn:\n'李明每天早上六点起床，六点半跑步，七点吃早饭。八点他准时去公司上班。下班以后，他喜欢去书店买书，或者和朋友去踢足球。他的生活很健康。'\nHỏi: Lý Minh thức dậy lúc mấy giờ?", "choices": ["6:00 sáng", "6:30 sáng", "7:00 sáng", "8:00 sáng"], "correct_index": 0, "explanation_vi": "'早上六点起床' -> 6 giờ sáng."},
            {"id": "ut6-q16", "section": "reading", "prompt": "Sau khi tan làm, Lý Minh thường làm gì?", "choices": ["Đi hiệu sách mua sách hoặc đá bóng cùng bạn", "Ở lại công ty làm thêm", "Đi ngủ ngay", "Đi xem phim một mình"], "correct_index": 0, "explanation_vi": "'去书店买书，或者和朋友去踢足球' -> Đi hiệu sách mua sách hoặc đá bóng."},
            {"id": "ut6-q17", "section": "reading", "prompt": "Đọc câu: '这台电脑非常贵，要八千块钱，但是质量很好。'\nHỏi: Giá tiền của chiếc máy tính là bao nhiêu?", "choices": ["8.000 tệ", "800 tệ", "18.000 tệ", "80.000 tệ"], "correct_index": 0, "explanation_vi": "'八千块' -> 8.000 tệ."},
            {"id": "ut6-q18", "section": "reading", "prompt": "Đọc câu: '王老师会说汉语、英语和法语三种语言。'\nHỏi: Thầy Vương có thể nói được mấy thứ tiếng?", "choices": ["3 thứ tiếng", "2 thứ tiếng", "4 thứ tiếng", "1 thứ tiếng"], "correct_index": 0, "explanation_vi": "'三种语言' -> 3 thứ tiếng."},
            {"id": "ut6-q19", "section": "reading", "prompt": "Đọc thông báo:\n'明天是元旦假期，学校放假一天。请大家注意安全，祝大家新年快乐！'\nNhận định Đúng hay Sai: Ngày mai học sinh vẫn phải đến trường học bình thường.", "choices": ["Sai", "Đúng"], "correct_index": 0, "explanation_vi": "Trong thông báo: '学校放假一天' (trường nghỉ một ngày) -> Nhận định là Sai."},
            {"id": "ut6-q20", "section": "reading", "prompt": "Đọc câu: '我们已经学完了HSK 1的全部三十两课，现在准备参加模拟考试！'\nHỏi: Học viên đã sẵn sàng cho hoạt động nào tiếp theo?", "choices": ["Tham gia thi thử HSK 1", "Bắt đầu học bảng chữ cái", "Đi nghỉ dưỡng", "Mua giáo trình mới"], "correct_index": 0, "explanation_vi": "'准备参加模拟考试' -> Chuẩn bị tham gia thi thử."}
        ]
    }
]

def main():
    os.makedirs("content/hsk_library/unit_tests", exist_ok=True)
    for cfg in unit_configs:
        uid = cfg["unit_id"]
        fname = f"content/hsk_library/unit_tests/hsk1_unit_test_0{uid}.json"
        data = {
            "id": f"ut-hsk1-0{uid}",
            "slug": f"hsk1-unit-test-0{uid}",
            "unit_id": f"u-hsk1-0{uid}",
            "unit_number": uid,
            "title": cfg["title"],
            "scope_vi": cfg["scope_vi"],
            "duration_minutes": 20,
            "passing_score": 16,
            "total_questions": 20,
            "quality_status": "VERIFIED",
            "lessons_covered": cfg["lessons"],
            "questions": cfg["questions"]
        }
        with open(fname, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Generated {fname} ({len(cfg['questions'])} questions)")

if __name__ == "__main__":
    main()
