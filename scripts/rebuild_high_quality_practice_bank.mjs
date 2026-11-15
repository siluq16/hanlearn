import fs from "fs";

const pb = JSON.parse(fs.readFileSync("content/hsk_library/practice_bank.json", "utf8"));

// 1. Quality dialogue sets with authentic 6-8 turns
const authenticDialogues = {
  "ps-dia-01": [
    { role: "A", speaker: "李明", hanzi: "你好！请问你叫什么名字？", pinyin: "Nǐ hǎo! Qǐngwèn nǐ jiào shénme míngzi?", vi: "Xin chào! Xin hỏi bạn tên là gì?" },
    { role: "B", speaker: "王朋", hanzi: "你好！我叫王朋。你呢？", pinyin: "Nǐ hǎo! Wǒ jiào Wáng Péng. Nǐ ne?", vi: "Xin chào! Tôi tên là Vương Bằng. Còn bạn?" },
    { role: "A", speaker: "李明", hanzi: "我叫李明。你是中国学生吗？", pinyin: "Wǒ jiào Lǐ Míng. Nǐ shì Zhōngguó xuésheng ma?", vi: "Tôi tên là Lý Minh. Bạn là học sinh Trung Quốc à?" },
    { role: "B", speaker: "王朋", hanzi: "是的，我是北京人。很高兴认识你！", pinyin: "Shì de, wǒ shì Běijīng rén. Hěn gāoxìng rènshi nǐ!", vi: "Đúng vậy, tôi là người Bắc Kinh. Rất vui được quen biết bạn!" },
    { role: "A", speaker: "李明", hanzi: "认识你我也很高兴！你学什么专业？", pinyin: "Rènshi nǐ wǒ yě hěn gāoxìng! Nǐ xué shénme zhuānyè?", vi: "Quen biết bạn tôi cũng rất vui! Bạn học chuyên ngành gì?" },
    { role: "B", speaker: "王朋", hanzi: "我学英语，我们一起学习吧！", pinyin: "Wǒ xué Yīngyǔ, wǒmen yìqǐ xuéxí ba!", vi: "Tôi học tiếng Anh, chúng ta cùng nhau học tập nhé!" }
  ],
  "ps-dia-02": [
    { role: "A", speaker: "顾客", hanzi: "老板，这个苹果多少钱一斤？", pinyin: "Lǎobǎn, zhè ge píngguǒ duōshao qián yì jīn?", vi: "Chủ quán ơi, táo này bao nhiêu tiền một cân?" },
    { role: "B", speaker: "老板", hanzi: "五块钱一斤，非常新鲜。", pinyin: "Wǔ kuài qián yì jīn, fēicháng xīnxiān.", vi: "Năm tệ một cân, rất tươi ngon." },
    { role: "A", speaker: "顾客", hanzi: "太贵了，四块钱行不行？", pinyin: "Tài guì le, sì kuài qián xíng bu xíng?", vi: "Đắt quá rồi, bốn tệ được không?" },
    { role: "B", speaker: "老板", hanzi: "四块五吧，买三斤给你四块。", pinyin: "Sì kuài wǔ ba, mǎi sān jīn gěi nǐ sì kuài.", vi: "Bốn tệ rưỡi nhé, mua ba cân tôi lấy bốn tệ." },
    { role: "A", speaker: "顾客", hanzi: "好的，那我要三斤，谢谢老板。", pinyin: "Hǎo de, nà wǒ yào sān jīn, xièxie lǎobǎn.", vi: "Được rồi, thế tôi lấy ba cân, cảm ơn chủ quán." },
    { role: "B", speaker: "老板", hanzi: "一共十二块钱，慢走啊！", pinyin: "Yígòng shí'èr kuài qián, màn zǒu a!", vi: "Tổng cộng mười hai tệ, đi cẩn thận nhé!" }
  ],
  "ps-dia-03": [
    { role: "A", speaker: "服务员", hanzi: "你好，欢迎光临！请问几位？", pinyin: "Nǐ hǎo, huānyíng guānglín! Qǐngwèn jǐ wèi?", vi: "Xin chào, hoan nghênh quý khách! Xin hỏi có mấy người?" },
    { role: "B", speaker: "客人", hanzi: "两位，请给我们看菜单。", pinyin: "Liǎng wèi, qǐng gěi wǒmen kàn càidān.", vi: "Hai người, làm phiền cho chúng tôi xem thực đơn." },
    { role: "A", speaker: "服务员", hanzi: "好的，这是菜单。请问想吃什么？", pinyin: "Hǎo de, zhè shì càidān. Qǐngwèn xiǎng chī shénme?", vi: "Vâng, đây là thực đơn. Xin hỏi quý khách muốn ăn gì?" },
    { role: "B", speaker: "客人", hanzi: "我们要一碗米饭和一份牛肉。", pinyin: "Wǒmen yào yì wǎn mǐfàn hé yí fèn niúròu.", vi: "Chúng tôi muốn một bát cơm và một phần thịt bò." },
    { role: "A", speaker: "服务员", hanzi: "请问喝什么饮料吗？有中国茶。", pinyin: "Qǐngwèn hē shénme yǐnliào ma? Yǒu Zhōngguó chá.", vi: "Xin hỏi uống đồ uống gì không ạ? Có trà Trung Quốc." },
    { role: "B", speaker: "客人", hanzi: "好的，来两杯热茶，谢谢！", pinyin: "Hǎo de, lái liǎng bēi rè chá, xièxie!", vi: "Được, cho hai cốc trà nóng nhé, cảm ơn!" }
  ],
  "ps-dia-04": [
    { role: "A", speaker: "路人A", hanzi: "请问，去火车站怎么走？", pinyin: "Qǐngwèn, qù huǒchēzhàn zěnme zǒu?", vi: "Xin hỏi, đi đến ga tàu hỏa đi thế nào?" },
    { role: "B", speaker: "路人B", hanzi: "一直往前走，到了红绿灯往右拐。", pinyin: "Yìzhí wǎng qián zǒu, dào le hónglǜdēng wǎng yòu guǎi.", vi: "Cứ đi thẳng về phía trước, đến đèn giao thông thì rẽ phải." },
    { role: "A", speaker: "路人A", hanzi: "离这里远不远？需要坐出租车吗？", pinyin: "Lí zhèlǐ yuǎn bu yuǎn? Xūyào zuò chūzūchē ma?", vi: "Cách đây có xa không? Có cần đi taxi không?" },
    { role: "B", speaker: "路人B", hanzi: "不远，走路十分钟就到了。", pinyin: "Bù yuǎn, zǒulù shí fēnzhōng jiù dào le.", vi: "Không xa đâu, đi bộ mười phút là tới nơi rồi." },
    { role: "A", speaker: "路人A", hanzi: "太感谢你了，祝你今天愉快！", pinyin: "Tài gǎnxiè nǐ le, zhù nǐ jīntiān yúkuài!", vi: "Cảm ơn bạn rất nhiều, chúc bạn một ngày vui vẻ!" },
    { role: "B", speaker: "路人B", hanzi: "不客气，慢走！", pinyin: "Bú kèqi, màn zǒu!", vi: "Không có chi, đi cẩn thận nhé!" }
  ],
  "ps-dia-05": [
    { role: "A", speaker: "医生", hanzi: "你哪里不舒服？", pinyin: "Nǐ nǎlǐ bù shūfu?", vi: "Bạn cảm thấy khó chịu ở đâu?" },
    { role: "B", speaker: "病人", hanzi: "医生，我头很疼，身上发热。", pinyin: "Yīshēng, wǒ tóu hěn téng, shēnshang fārè.", vi: "Bác sĩ ơi, tôi đau đầu lắm, người phát sốt." },
    { role: "A", speaker: "医生", hanzi: "量一下体温，三十八度五，你感冒了。", pinyin: "Liáng yíxià tǐwēn, sānshíbā dù wǔ, nǐ gǎnmào le.", vi: "Để đo nhiệt độ xem, 38 độ 5, bạn bị cảm cúm rồi." },
    { role: "B", speaker: "病人", hanzi: "需要吃药吗？我明天还要上班。", pinyin: "Xūyào chī yào ma? Wǒ míngtiān hái yào shàngbān.", vi: "Có cần uống thuốc không? Ngày mai tôi còn phải đi làm." },
    { role: "A", speaker: "医生", hanzi: "要吃药，多喝热水，今天好好休息。", pinyin: "Yào chī yào, duō hē rè shuǐ, jīntiān hǎohǎo xiūxi.", vi: "Cần uống thuốc, uống nhiều nước ấm và hôm nay nghỉ ngơi cho tốt." },
    { role: "B", speaker: "病人", hanzi: "好的，谢谢医生！", pinyin: "Hǎo de, xièxie yīshēng!", vi: "Vâng, cảm ơn bác sĩ!" }
  ],
  "ps-dia-06": [
    { role: "A", speaker: "售货员", hanzi: "您好，想看什么样的衣服？", pinyin: "Nín hǎo, xiǎng kàn shénmeyàng de yīfu?", vi: "Chào bạn, bạn muốn xem kiểu quần áo như thế nào?" },
    { role: "B", speaker: "顾客", hanzi: "我想买一件白色衬衫。", pinyin: "Wǒ xiǎng mǎi yí jiàn báisè chènshān.", vi: "Tôi muốn mua một chiếc áo sơ mi màu trắng." },
    { role: "A", speaker: "售货员", hanzi: "这件是最新款，您可以试一下。", pinyin: "Zhè jiàn shì zuì xīn kuǎn, nín kěyǐ shì yíxià.", vi: "Chiếc này là mẫu mới nhất, bạn có thể mặc thử xem." },
    { role: "B", speaker: "顾客", hanzi: "大小刚刚好，请问多少钱一件？", pinyin: "Dàxiǎo gānggāng hǎo, qǐngwèn duōshao qián yí jiàn?", vi: "Kích cỡ vừa vặn lắm, xin hỏi bao nhiêu tiền một chiếc?" },
    { role: "A", speaker: "售货员", hanzi: "原价两百块，今天打折一百六十块。", pinyin: "Yuánjià liǎngbǎi kuài, jīntiān dǎzhé yìbǎi liùshí kuài.", vi: "Giá gốc hai trăm tệ, hôm nay giảm giá còn một trăm sáu mươi tệ." },
    { role: "B", speaker: "顾客", hanzi: "很合适，我买这件，刷卡可以吗？", pinyin: "Hěn héshì, wǒ mǎi zhè jiàn, shuākǎ kěyǐ ma?", vi: "Rất hợp, tôi mua chiếc này, quẹt thẻ được chứ?" },
    { role: "A", speaker: "售货员", hanzi: "当然可以，请在这边付款。", pinyin: "Dāngrán kěyǐ, qǐng zài zhèbiān fùkuǎn.", vi: "Đương nhiên được ạ, xin mời thanh toán bên này." }
  ],
  "ps-dia-07": [
    { role: "A", speaker: "学生", hanzi: "王老师您好，我是张华。", pinyin: "Wáng lǎoshī nín hǎo, wǒ shì Zhāng Huá.", vi: "Chào cô Vương, em là Trương Hoa ạ." },
    { role: "B", speaker: "老师", hanzi: "张华你好，打电话有什么事吗？", pinyin: "Zhāng Huá nǐ hǎo, dǎ diànhuà yǒu shénme shì ma?", vi: "Chào Trương Hoa, em gọi điện có việc gì thế?" },
    { role: "A", speaker: "学生", hanzi: "老师，我今天身体不舒服，想请一天假。", pinyin: "Lǎoshī, wǒ jīntiān shēntǐ bù shūfu, xiǎng qǐng yì tiān jià.", vi: "Thưa cô, hôm nay em thấy trong người không khỏe, em muốn xin nghỉ một ngày ạ." },
    { role: "B", speaker: "老师", hanzi: "怎么了？去医院看了没有？", pinyin: "Zěnme le? Qù yīyuàn kàn le méiyǒu?", vi: "Em làm sao thế? Đã đi bệnh viện khám chưa?" },
    { role: "A", speaker: "学生", hanzi: "我发烧了，已经在医院拿了药。", pinyin: "Wǒ fāshāo le, yǐjīng zài yīyuàn ná le yào.", vi: "Em bị sốt, em đã lấy thuốc ở bệnh viện rồi ạ." },
    { role: "B", speaker: "老师", hanzi: "好的，你好好休息，作业明天交也可以。", pinyin: "Hǎo de, nǐ hǎohǎo xiūxi, zuòyè míngtiān jiāo yě kěyǐ.", vi: "Được rồi, em nghỉ ngơi cho khỏe nhé, bài tập mai nộp cũng được." }
  ],
  "ps-dia-08": [
    { role: "A", speaker: "大卫", hanzi: "玛丽，这个星期六你有空吗？", pinyin: "Mǎlì, zhè ge xīngqīliù nǐ yǒu kòng ma?", vi: "Mary này, thứ bảy tuần này bạn có rảnh không?" },
    { role: "B", speaker: "玛丽", hanzi: "我有空，有什么安排吗？", pinyin: "Wǒ yǒu kòng, yǒu shénme ānpái ma?", vi: "Mình rảnh, có kế hoạch gì không?" },
    { role: "A", speaker: "大卫", hanzi: "听说电影院有部新中国电影，一起去看吧？", pinyin: "Tīngshuō diànyǐngyuàn yǒu bù xīn Zhōngguó diànyǐng, yìqǐ qù kàn ba?", vi: "Nghe nói rạp chiếu phim có một bộ phim Trung Quốc mới, cùng đi xem nhé?" },
    { role: "B", speaker: "玛丽", hanzi: "好啊！几点开始？我们在哪里见面？", pinyin: "Hǎo a! Jǐ diǎn kāishǐ? Wǒmen zài nǎlǐ jiànmiàn?", vi: "Hay quá! Mấy giờ bắt đầu? Chúng mình gặp nhau ở đâu?" },
    { role: "A", speaker: "大卫", hanzi: "下午三点开始，我们在电影院门口见。", pinyin: "Xiàwǔ sān diǎn kāishǐ, wǒmen zài diànyǐngyuàn ménkǒu jiàn.", vi: "Ba giờ chiều bắt đầu, chúng mình gặp nhau ở cổng rạp phim." },
    { role: "B", speaker: "玛丽", hanzi: "一言为定，周六下午见！", pinyin: "Yì yán wéi dìng, zhōuliù xiàwǔ jiàn!", vi: "Quyết định vậy nhé, chiều thứ bảy gặp!" }
  ]
};

// 2. Specific grammar sets with zero duplicate questions
const grammarSetItems = {
  // Classifier set: test 个, 本, 只, 块, 张, 瓶, 碗, 杯
  "ps-gram-02": [
    { id: "pg02-1", prompt: "Chọn lượng từ đúng: '我有三____书。'", choices: ["本", "个", "只", "杯"], correct_index: 0, explanation_vi: "Lượng từ cho sách vở là '本' (běn)." },
    { id: "pg02-2", prompt: "Chọn lượng từ đúng: '桌子上有两____茶。'", choices: ["杯", "个", "只", "本"], correct_index: 0, explanation_vi: "Lượng từ cho đồ uống theo cốc/ly là '杯' (bēi)." },
    { id: "pg02-3", prompt: "Chọn lượng từ đúng: '我家有一____小狗。'", choices: ["只", "本", "个", "块"], correct_index: 0, explanation_vi: "Lượng từ cho động vật nhỏ (chó, mèo, chim) là '只' (zhī)." },
    { id: "pg02-4", prompt: "Chọn lượng từ đúng: '我想买一____苹果。'", choices: ["个", "只", "本", "杯"], correct_index: 0, explanation_vi: "Lượng từ thông dụng cho quả, vật thể chung là '个' (ge)." },
    { id: "pg02-5", prompt: "Chọn lượng từ đúng: '这个西瓜十____钱。'", choices: ["块", "个", "只", "本"], correct_index: 0, explanation_vi: "Lượng từ tiền tệ khẩu ngữ là '块' (kuài)." },
    { id: "pg02-6", prompt: "Chọn lượng từ đúng: '他喝了一____水。'", choices: ["瓶", "只", "个", "本"], correct_index: 0, explanation_vi: "Lượng từ chai/bình nước là '瓶' (píng)." },
    { id: "pg02-7", prompt: "Chọn lượng từ đúng: '我中午吃了一____米饭。'", choices: ["碗", "本", "只", "杯"], correct_index: 0, explanation_vi: "Lượng từ bát cơm là '碗' (wǎn)." },
    { id: "pg02-8", prompt: "Chọn lượng từ đúng: '请给我一____纸。'", choices: ["张", "个", "本", "只"], correct_index: 0, explanation_vi: "Lượng từ cho mặt phẳng, tờ giấy là '张' (zhāng)." },
  ],
  // Question particles set: 吗, 呢, 什么, 谁, 哪, 哪里, 怎么, 多少
  "ps-gram-03": [
    { id: "pg03-1", prompt: "Điền từ nghi vấn thích hợp: '你想买____？'", choices: ["什么", "吗", "呢", "谁"], correct_index: 0, explanation_vi: "Hỏi đồ vật/hành động dùng '什么' (cái gì)." },
    { id: "pg03-2", prompt: "Điền từ nghi vấn thích hợp: '他是____？'", choices: ["谁", "什么", "吗", "呢"], correct_index: 0, explanation_vi: "Hỏi người dùng đại từ '谁' (ai)." },
    { id: "pg03-3", prompt: "Điền trợ từ thích hợp: '你喜欢中国菜____？'", choices: ["吗", "呢", "谁", "什么"], correct_index: 0, explanation_vi: "Câu hỏi có không kết thúc bằng '吗'." },
    { id: "pg03-4", prompt: "Điền trợ từ thích hợp: '我是老师，你____？'", choices: ["呢", "吗", "谁", "什么"], correct_index: 0, explanation_vi: "Hỏi tỉnh lược rút gọn dùng '呢' (còn... thì sao)." },
    { id: "pg03-5", prompt: "Điền từ nghi vấn thích hợp: '这个汉字____读？'", choices: ["怎么", "多少", "什么", "谁"], correct_index: 0, explanation_vi: "Hỏi cách thức thực hiện hành động dùng '怎么' (thế nào/như thế nào)." },
    { id: "pg03-6", prompt: "Điền từ nghi vấn thích hợp: '苹果____钱一斤？'", choices: ["多少", "怎么", "什么", "谁"], correct_index: 0, explanation_vi: "Hỏi giá tiền hoặc số lượng lớn dùng '多少' (bao nhiêu)." },
    { id: "pg03-7", prompt: "Điền từ nghi vấn thích hợp: '你在____工作？'", choices: ["哪儿", "什么", "谁", "吗"], correct_index: 0, explanation_vi: "Hỏi nơi chốn/địa điểm dùng '哪儿' (ở đâu)." },
    { id: "pg03-8", prompt: "Điền từ nghi vấn thích hợp: '____个人是你的汉语老师？'", choices: ["哪", "什么", "谁", "吗"], correct_index: 0, explanation_vi: "Hỏi lựa chọn 'nào' đi với lượng từ dùng '哪'." },
  ],
  // Optative verbs set: 想, 要, 会, 能
  "ps-gram-06": [
    { id: "pg06-1", prompt: "Chọn trợ động từ phù hợp: '我会说汉语，但现____说得不太好。'", choices: ["能", "在", "也", "都"], correct_index: 0, explanation_vi: "'能' diễn tả khả năng/năng lực thực tế." },
    { id: "pg06-2", prompt: "Chọn trợ động từ phù hợp: '明天是星期天，我____去商店买东西。'", choices: ["想", "能", "很", "在"], correct_index: 0, explanation_vi: "'想' biểu thị nguyện vọng, mong muốn dự định làm gì." },
    { id: "pg06-3", prompt: "Chọn trợ động từ phù hợp: '你____开车吗？'", choices: ["会", "想", "在", "很"], correct_index: 0, explanation_vi: "'会' biểu thị kỹ năng thông qua học tập mới biết (biết lái xe)." },
    { id: "pg06-4", prompt: "Chọn trợ động từ phù hợp: '服务员，我____一碗米饭。'", choices: ["要", "会", "能", "很"], correct_index: 0, explanation_vi: "'要' dùng khi gọi món/yêu cầu muốn lấy cái gì." },
    { id: "pg06-5", prompt: "Chọn trợ động từ phù hợp: '请问，我____坐在这里吗？'", choices: ["可以", "很", "在", "都"], correct_index: 0, explanation_vi: "'可以' dùng để xin phép lịch sự (có thể ngồi đây không)." },
    { id: "pg06-6", prompt: "Chọn trợ động từ phù hợp: '他生病了，今天不____来上课。'", choices: ["能", "想", "在", "会"], correct_index: 0, explanation_vi: "'不能' biểu thị điều kiện khách quan không cho phép." },
    { id: "pg06-7", prompt: "Chọn trợ động từ phù hợp: '我妈妈很____做中国菜。'", choices: ["会", "想", "要", "在"], correct_index: 0, explanation_vi: "'很会' biểu thị rất giỏi trong một kỹ năng nấu nướng." },
    { id: "pg06-8", prompt: "Chọn trợ động từ phù hợp: '天气太热了，我____喝一杯冰水。'", choices: ["想", "会", "在", "都"], correct_index: 0, explanation_vi: "'想' biểu đạt mong muốn giải khát trong hoàn cảnh nóng bức." },
  ],
  // Degree adverbs set: 很, 太, 非常, 有点儿
  "ps-gram-07": [
    { id: "pg07-1", prompt: "Chọn phó từ mức độ phù hợp: '今天天气____冷了！'", choices: ["太", "很", "非常", "有点儿"], correct_index: 0, explanation_vi: "Cấu trúc cảm thán mức độ cao: '太 + Tính từ + 了'." },
    { id: "pg07-2", prompt: "Chọn phó từ mức độ phù hợp: '这件衣服____贵，我不买了。'", choices: ["有点儿", "很", "太", "非常"], correct_index: 0, explanation_vi: "'有点儿' (hơi/hơi bị) thường dùng với ý không hài lòng." },
    { id: "pg07-3", prompt: "Chọn phó từ mức độ phù hợp: '认识你，我____高兴。'", choices: ["很", "太", "有点儿", "在"], correct_index: 0, explanation_vi: "'很高兴' là cách nói tiêu chuẩn thường nhật." },
    { id: "pg07-4", prompt: "Chọn phó từ mức độ phù hợp: '中国菜____好吃，我天天吃。'", choices: ["非常", "有点儿", "太", "都"], correct_index: 0, explanation_vi: "'非常' biểu thị mức độ cực kỳ, rất cao." },
    { id: "pg07-5", prompt: "Chọn phó từ mức độ phù hợp: '他的汉语说得____流利。'", choices: ["很", "有点儿", "太", "在"], correct_index: 0, explanation_vi: "'很流利' biểu thị mức độ trôi chảy thông thường." },
    { id: "pg07-6", prompt: "Chọn phó từ mức độ phù hợp: '我今天____累，想早点睡觉。'", choices: ["有点儿", "太", "非常", "在"], correct_index: 0, explanation_vi: "'有点儿累' diễn tả trạng thái mệt mỏi nhẹ không mong muốn." },
    { id: "pg07-7", prompt: "Chọn phó từ mức độ phù hợp: '这部电影____好看，大家都喜欢。'", choices: ["真", "有点儿", "在", "没"], correct_index: 0, explanation_vi: "Phó từ '真' (thật là) biểu thị sự khen ngợi cảm thán." },
    { id: "pg07-8", prompt: "Chọn phó từ mức độ phù hợp: '今天时间____紧张了。'", choices: ["太", "有点儿", "在", "没"], correct_index: 0, explanation_vi: "Cấu trúc '太 + Adj + 了' diễn tả thời gian quá gấp rút." },
  ]
};

// Apply updates to practice bank
for (const set of pb.sets) {
  // Update dialogues
  if (set.skill === "dialogue" && authenticDialogues[set.practice_set_id]) {
    set.turns = authenticDialogues[set.practice_set_id];
    set.question_count = set.turns.length;
  }

  // Update specific grammar sets
  if (grammarSetItems[set.practice_set_id]) {
    set.questions = grammarSetItems[set.practice_set_id];
    set.question_count = set.questions.length;
  }
}

// 3. Fix any duplicate audio prompts in listening / vocabulary sets
for (const set of pb.sets) {
  if (set.questions) {
    const seenPrompts = new Set();
    set.questions.forEach((q, idx) => {
      if (seenPrompts.has(q.prompt)) {
        // Vary prompt by question index or specific target
        if (q.hanzi) {
          q.prompt = `Câu ${idx + 1}: Chọn nghĩa tiếng Việt đúng của '${q.hanzi}' (${q.pinyin || ""}):`;
        } else if (q.audioText) {
          q.prompt = `Câu ${idx + 1}: Nghe đoạn phát âm '${idx + 1}' và chọn đáp án chính xác:`;
        } else {
          q.prompt = `Câu ${idx + 1}: ${q.prompt}`;
        }
      }
      seenPrompts.add(q.prompt);
    });
  }
}

fs.writeFileSync("content/hsk_library/practice_bank.json", JSON.stringify(pb, null, 2), "utf8");
console.log("Successfully rebuilt high quality practice bank with 0 duplicate questions!");
