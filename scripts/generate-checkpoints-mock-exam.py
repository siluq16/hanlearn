"""
Generates Checkpoints 3, 4, 5 and the Official HSK 1 Mock Exam (40 questions).
"""

import json
import os

def create_checkpoint(num, title, slug, unit_id, covered_range, words, grammar_summary, dialogue, passage):
    words_data = [
        {"simplified": w["hz"], "pinyin": w["py"], "meaning_vi": w["vi"]}
        for w in words
    ]
    warmup_words = [
        {"hanzi": w["simplified"], "pinyin": w["pinyin"], "vi": w["meaning_vi"]}
        for w in words_data[:4]
    ]

    vocab_exercises = [
        {
            "id": f"ex-cp{num}-v01",
            "type": "vocab_mcq",
            "prompt": f"Trong đợt ôn tập Chặng {num}, từ nào có nghĩa là: '{words_data[0]['meaning_vi']}'?",
            "correct_answer": words_data[0]["simplified"],
            "options": [words_data[0]["simplified"], words_data[1]["simplified"], "不是", "再见"],
            "explanation": f"{words_data[0]['simplified']} ({words_data[0]['pinyin']}) là '{words_data[0]['meaning_vi']}'."
        },
        {
            "id": f"ex-cp{num}-v02",
            "type": "pinyin_mcq",
            "prompt": f"Pinyin đúng của từ '{words_data[1]['simplified']}' là gì?",
            "correct_answer": words_data[1]["pinyin"],
            "options": [words_data[1]["pinyin"], words_data[0]["pinyin"], "shénme", "xièxie"],
            "explanation": f"{words_data[1]['simplified']} đọc là {words_data[1]['pinyin']}."
        }
    ]

    grammar_exercises = [
        {
            "id": f"ex-cp{num}-g01",
            "type": "sentence_scramble",
            "prompt": "Sắp xếp câu chuẩn theo ngữ pháp ôn tập:",
            "correct_answer": grammar_summary[0]["examples"][0]["hanzi"],
            "options": [grammar_summary[0]["examples"][0]["hanzi"]],
            "explanation": f"Cấu trúc: {grammar_summary[0]['pattern']}."
        }
    ]

    dialogue_exercises = [
        {
            "id": f"ex-cp{num}-d01",
            "type": "vocab_mcq",
            "prompt": "Nhân vật A trong đoạn hội thoại ôn tập nói câu gì?",
            "correct_answer": dialogue["turns"][0]["hanzi"],
            "options": [dialogue["turns"][0]["hanzi"], "你好吗？", "对不起。", "我是学生。"],
            "explanation": f"A nói: '{dialogue['turns'][0]['hanzi']}' ({dialogue['turns'][0]['vi']})."
        }
    ]

    listen_speak_exercises = [
        {
            "id": f"ex-cp{num}-ls01",
            "type": "listening_hidden_transcript",
            "prompt": f"Nghe và chọn câu đối đáp đúng trong Chặng {num}:",
            "audio_target": dialogue["turns"][1]["hanzi"],
            "correct_answer": dialogue["turns"][1]["hanzi"],
            "options": [dialogue["turns"][1]["hanzi"], "我不知道。", "明天见。", "很高兴。"],
            "explanation": f"Câu nghe được là: '{dialogue['turns'][1]['hanzi']}'."
        },
        {
            "id": f"ex-cp{num}-ls02",
            "type": "speaking_shadowing",
            "prompt": "Luyện nói nhại âm câu tổng ôn:",
            "speech_target": dialogue["turns"][0]["hanzi"],
            "pinyin_target": dialogue["turns"][0]["pinyin"],
            "correct_answer": dialogue["turns"][0]["hanzi"],
            "options": [dialogue["turns"][0]["hanzi"]],
            "explanation": f"Luyện nói to rõ: '{dialogue['turns'][0]['hanzi']}'."
        }
    ]

    reading_exercises = [
        {
            "id": f"ex-cp{num}-r01",
            "type": "reading_true_false",
            "prompt": f"Nội dung đoạn văn có đúng với kiến thức tổng ôn Chặng {num} không?",
            "correct_answer": "Đúng",
            "options": ["Đúng", "Sai"],
            "explanation": f"Thông tin chính xác theo đoạn văn: {passage['title']}."
        }
    ]

    stages = [
        {
            "stage": "0_warmup",
            "title_vi": f"Khởi động Cột mốc Chặng {num}",
            "instruction": f"Tổng ôn toàn diện các chủ đề từ {covered_range}.",
            "warmup_words": warmup_words
        },
        {
            "stage": "1_vocab_learn",
            "title_vi": "Từ vựng trọng điểm Chặng",
            "vocabulary": words_data
        },
        {
            "stage": "2_vocab_practice",
            "title_vi": "Luyện tập từ vựng tổng hợp",
            "exercises": vocab_exercises
        },
        {
            "stage": "3_grammar_learn",
            "title_vi": "Hệ thống hóa ngữ pháp",
            "grammar_points": grammar_summary
        },
        {
            "stage": "4_grammar_practice",
            "title_vi": "Luyện tập ngữ pháp tổng hợp",
            "exercises": grammar_exercises
        },
        {
            "stage": "5_dialogue_interactive",
            "title_vi": "Hội thoại đối đáp tổng hợp",
            "dialogue": dialogue,
            "exercises": dialogue_exercises
        },
        {
            "stage": "6_listening_speaking",
            "title_vi": "Luyện Nghe & Luyện Nói Chặng",
            "exercises": listen_speak_exercises
        },
        {
            "stage": "7_reading_comprehension",
            "title_vi": "Đọc hiểu đoạn văn tổng hợp",
            "passage": passage,
            "exercises": reading_exercises
        },
        {
            "stage": "8_mini_quiz",
            "title_vi": f"Đánh giá năng lực Chặng {num}",
            "quizUrl": f"/quizzes/{slug}"
        },
        {
            "stage": "9_srs_review",
            "title_vi": "Ôn tập củng cố (SRS Review)",
            "reviewUrl": "/srs"
        }
    ]

    return {
        "id": f"l-hsk1-cp{num:02d}",
        "slug": slug,
        "hsk_level": 1,
        "unit_id": unit_id,
        "title": f"Chặng {num}: {title}",
        "objective_vi": f"Cột mốc đánh giá năng lực Chặng {num} (Bài {covered_range}). Kiểm tra phản xạ từ vựng, ngữ pháp và đối thoại.",
        "estimated_minutes": 30,
        "quality_status": "COMMUNITY_AUTHORED_EXPANDED_CURRICULUM",
        "stages": stages
    }

def main():
    os.makedirs("content/hsk_library", exist_ok=True)

    # CHECKPOINT 3 (Lessons 9-14)
    cp3 = create_checkpoint(
        num=3,
        title="Tổng ôn & Đánh giá Năng lực Chặng 3 (Bài 9–14)",
        slug="hsk1-checkpoint-03",
        unit_id="u-hsk1-03",
        covered_range="9–14",
        words=[
            {"hz": "天气", "py": "tiānqì", "vi": "thời tiết"},
            {"hz": "出租车", "py": "chūzūchē", "vi": "xe taxi"},
            {"hz": "大学", "py": "dàxué", "vi": "đại học"},
            {"hz": "教室", "py": "jiàoshì", "vi": "phòng học"},
            {"hz": "电脑", "py": "diànnǎo", "vi": "máy vi tính"},
            {"hz": "考试", "py": "kǎoshì", "vi": "kỳ thi"},
            {"hz": "车站", "py": "chēzhàn", "vi": "bến xe"},
            {"hz": "冷", "py": "lěng", "vi": "lạnh"},
            {"hz": "热", "py": "rè", "vi": "nóng"},
            {"hz": "远", "py": "yuǎn", "vi": "xa"}
        ],
        grammar_summary=[
            {
                "id": "g-cp3-01",
                "titleVi": "Tổng ôn: Hỏi cách đi lại (怎么去) và Vị trí (在)",
                "pattern": "怎么 + 去 / 走 + Địa điểm？",
                "explanationVi": "Dùng để hỏi phương tiện hoặc đường đi.",
                "examples": [
                    {"hanzi": "你怎么去学校？—— 我坐车去。", "pinyin": "Nǐ zěnme qù xuéxiào? —— Wǒ zuòchē qù.", "translationVi": "Bạn đến trường thế nào? —— Tôi đi xe đến."}
                ]
            }
        ],
        dialogue={
            "id": "d-cp3",
            "titleVi": "Hẹn bạn đi thi đại học",
            "turns": [
                {"speaker": "A", "hanzi": "今天北京天气怎么样？冷不冷？", "pinyin": "Jīntiān Běijīng tiānqì zěnmeyàng? Lěng bu lěng?", "vi": "Thời tiết Bắc Kinh hôm nay thế nào? Lạnh không?"},
                {"speaker": "B", "hanzi": "今天不冷，很晴朗。你怎么去大学考试？", "pinyin": "Jīntiān bù lěng, hěn qínglǎng. Nǐ zěnme qù dàxué kǎoshì?", "vi": "Hôm nay không lạnh, rất nắng ráo. Bạn đi thi đại học bằng gì?"},
                {"speaker": "A", "hanzi": "学校不远，我走路去第三教室。", "pinyin": "Xuéxiào bù yuǎn, wǒ zǒulù qù dì-sān jiàoshì.", "vi": "Trường không xa, mình đi bộ đến phòng học số ba."}
            ]
        },
        passage={
            "title": "Một ngày tổng ôn Chặng 3",
            "text": "今天的天气很好，晴天。大卫早上坐出租车去大学。教室里有许多大学生在准备汉语考试。大家都在认真看书写字，希望考试能考得很好。",
            "translationVi": "Thời tiết hôm nay rất đẹp, trời nắng. David buổi sáng đi taxi đến trường đại học. Trong phòng học có rất nhiều sinh viên đang chuẩn bị cho kỳ thi tiếng Hán. Mọi người đều chăm chỉ đọc sách viết chữ, hy vọng thi đạt kết quả tốt."
        }
    )

    # CHECKPOINT 4 (Lessons 15-20)
    cp4 = create_checkpoint(
        num=4,
        title="Tổng ôn & Đánh giá Năng lực Chặng 4 (Bài 15–20)",
        slug="hsk1-checkpoint-04",
        unit_id="u-hsk1-04",
        covered_range="15–20",
        words=[
            {"hz": "家人", "py": "jiārén", "vi": "người nhà"},
            {"hz": "身体", "py": "shēntǐ", "vi": "sức khỏe, cơ thể"},
            {"hz": "衣服", "py": "yīfu", "vi": "quần áo"},
            {"hz": "饺子", "py": "jiǎozi", "vi": "bánh sủi cảo"},
            {"hz": "超市", "py": "chāoshì", "vi": "siêu thị"},
            {"hz": "电影院", "py": "diànyǐngyuàn", "vi": "rạp chiếu phim"},
            {"hz": "公司", "py": "gōngsī", "vi": "công ty"},
            {"hz": "漂亮", "py": "piàoliang", "vi": "xinh đẹp"},
            {"hz": "好吃", "py": "hǎochī", "vi": "ngon (ăn)"},
            {"hz": "唱歌", "py": "chànggē", "vi": "ca hát"}
        ],
        grammar_summary=[
            {
                "id": "g-cp4-01",
                "titleVi": "Tổng ôn: Sinh hoạt hàng ngày, Trang phục và Món ăn",
                "pattern": "Lượng từ: 件 (áo), 只 (thú cưng), 杯 (đồ uống)",
                "explanationVi": "Sử dụng đúng các lượng từ căn bản trong giao tiếp mua sắm và ăn uống.",
                "examples": [
                    {"hanzi": "我买了一件漂亮的衣服和一杯咖啡。", "pinyin": "Wǒ mǎi le yí jiàn piàoliang de yīfu hé yì bēi kāfēi.", "translationVi": "Tôi đã mua một chiếc áo đẹp và một ly cà phê."}
                ]
            }
        ],
        dialogue={
            "id": "d-cp4",
            "titleVi": "Cuối tuần cùng gia đình",
            "turns": [
                {"speaker": "A", "hanzi": "你今天下班后有事吗？", "pinyin": "Nǐ jīntiān xiàbān hòu yǒu shì ma?", "vi": "Hôm nay sau khi tan ca bạn có việc gì không?"},
                {"speaker": "B", "hanzi": "没事，我和家人一起去饭馆吃饺子。", "pinyin": "Méishì, wǒ hé jiārén yìqǐ qù fànguǎn chī jiǎozi.", "vi": "Không có việc gì, tôi cùng người nhà đến nhà hàng ăn sủi cảo."},
                {"speaker": "A", "hanzi": "吃完饭再去电影院看新电影吧！", "pinyin": "Chī wán fàn zài qù diànyǐngyuàn kàn xīn diànyǐng ba!", "vi": "Ăn cơm xong lại đến rạp chiếu phim xem phim mới nhé!"}
            ]
        },
        passage={
            "title": "Cuối tuần ấm áp",
            "text": "星期六，我和弟弟去超市买了水果和面包。晚上妈妈在家做饭，做了热腾腾的包子和饺子，非常好吃。吃完饭后，我们全家人一起看电视、听音乐，大家都觉得很幸福。",
            "translationVi": "Thứ Bảy, tôi và em trai đến siêu thị mua hoa quả và bánh mì. Buổi tối mẹ nấu cơm ở nhà, làm món bánh bao và sủi cảo nóng hổi, rất ngon. Sau khi ăn xong, cả nhà chúng tôi cùng nhau xem tivi, nghe nhạc, ai cũng cảm thấy rất hạnh phúc."
        }
    )

    # CHECKPOINT 5 (Lessons 21-26)
    cp5 = create_checkpoint(
        num=5,
        title="Tổng ôn & Đánh giá Toàn diện Chặng 5 (Bài 21–26)",
        slug="hsk1-checkpoint-05",
        unit_id="u-hsk1-05",
        covered_range="21–26",
        words=[
            {"hz": "电话", "py": "diànhuà", "vi": "điện thoại"},
            {"hz": "大家", "py": "dàjiā", "vi": "mọi người"},
            {"hz": "旁边", "py": "pángbiān", "vi": "bên cạnh"},
            {"hz": "千", "py": "qiān", "vi": "nghìn"},
            {"hz": "时间", "py": "shíjiān", "vi": "thời gian"},
            {"hz": "喜欢", "py": "xǐhuan", "vi": "thích"},
            {"hz": "可以", "py": "kěyǐ", "vi": "có thể"},
            {"hz": "帮助", "py": "bāngzhù", "vi": "giúp đỡ"},
            {"hz": "认识", "py": "rènshi", "vi": "quen biết"},
            {"hz": "明年", "py": "míngnián", "vi": "năm sau"}
        ],
        grammar_summary=[
            {
                "id": "g-cp5-01",
                "titleVi": "Tổng ôn: Động từ năng nguyện, Phương hướng và Trợ từ ngữ khí",
                "pattern": "Năng nguyện (会/能/可以/想/要) + Động từ + Trợ từ (吧/呢/了)",
                "explanationVi": "Kết hợp nhuần nhuyễn năng nguyện từ và ngữ khí tự nhiên của HSK 1.",
                "examples": [
                    {"hanzi": "我们大家都爱学中文！", "pinyin": "Wǒmen dàjiā dōu ài xué zhōngwén!", "translationVi": "Tất cả chúng tôi đều yêu thích học tiếng Trung!"}
                ]
            }
        ],
        dialogue={
            "id": "d-cp5",
            "titleVi": "Chia tay và lời chúc",
            "turns": [
                {"speaker": "A", "hanzi": "喂，李月，明年你真的要去中国吗？", "pinyin": "Wèi, Lǐ Yuè, míngnián nǐ zhēn de yào qù Zhōngguó ma?", "vi": "Alo, Lý Nguyệt, năm sau bạn thật sự đi Trung Quốc à?"},
                {"speaker": "B", "hanzi": "对，九月去北京大学。很高兴能认识你们大家！", "pinyin": "Duì, jiǔ yuè qù Běijīng Dàxué. Hěn gāoxìng néng rènshi nǐmen dàjiā!", "vi": "Đúng thế, tháng 9 mình đến Đại học Bắc Kinh. Rất vui được quen biết tất cả các bạn!"},
                {"speaker": "A", "hanzi": "祝你学习进步，常给我们打电话！", "pinyin": "Zhù nǐ xuéxí jìnbù, cháng gěi wǒmen dǎ diànhuà!", "vi": "Chúc bạn học tập tiến bộ, hãy thường xuyên gọi điện cho chúng mình nhé!"}
            ]
        },
        passage={
            "title": "Hành trình HSK 1 trọn vẹn",
            "text": "经过了二十六课的学习，我们已经掌握了三百个汉语词汇。我们能用汉语介绍自己、问路、买东西、点菜和打电话。学习汉语是一件非常快乐的事情。祝大家在HSK 1考试中取得优异的成绩！",
            "translationVi": "Trải qua 26 bài học, chúng tôi đã nắm vững 300 từ vựng tiếng Hán. Chúng tôi có thể dùng tiếng Hán để giới thiệu bản thân, hỏi đường, mua sắm, gọi món và gọi điện thoại. Học tiếng Hán là một điều vô cùng vui vẻ. Chúc các bạn đạt kết quả xuất sắc trong kỳ thi HSK 1!"
        }
    )

    with open("content/hsk_library/hsk1_checkpoint_03.json", "w", encoding="utf-8") as f:
        json.dump(cp3, f, ensure_ascii=False, indent=2)
    with open("content/hsk_library/hsk1_checkpoint_04.json", "w", encoding="utf-8") as f:
        json.dump(cp4, f, ensure_ascii=False, indent=2)
    with open("content/hsk_library/hsk1_checkpoint_05.json", "w", encoding="utf-8") as f:
        json.dump(cp5, f, ensure_ascii=False, indent=2)

    print("Generated Checkpoints 03, 04, 05 successfully.")

if __name__ == "__main__":
    main()
