import json
import os

def create_checkpoint_5():
    warmup_words = [
        {"hanzi": "电话", "pinyin": "diànhuà", "vi": "điện thoại"},
        {"hanzi": "朋友", "pinyin": "péngyou", "vi": "bạn bè"},
        {"hanzi": "大家", "pinyin": "dàjiā", "vi": "mọi người"},
        {"hanzi": "旁边", "pinyin": "pángbiān", "vi": "bên cạnh"}
    ]

    vocabulary = [
        {"simplified": "电话", "pinyin": "diànhuà", "meaning_vi": "điện thoại"},
        {"simplified": "帮助", "pinyin": "bāngzhù", "meaning_vi": "giúp đỡ"},
        {"simplified": "大家", "pinyin": "dàjiā", "meaning_vi": "mọi người"},
        {"simplified": "认识", "pinyin": "rènshi", "meaning_vi": "quen biết"},
        {"simplified": "高兴", "pinyin": "gāoxìng", "meaning_vi": "vui mừng"},
        {"simplified": "这些", "pinyin": "zhèxiē", "meaning_vi": "những cái này"},
        {"simplified": "哪里", "pinyin": "nǎli", "meaning_vi": "ở đâu, đâu"},
        {"simplified": "旁边", "pinyin": "pángbiān", "meaning_vi": "bên cạnh"},
        {"simplified": "前边", "pinyin": "qiánbian", "meaning_vi": "phía trước"},
        {"simplified": "请问", "pinyin": "qǐngwèn", "meaning_vi": "xin hỏi"}
    ]

    grammar_points = [
        {
            "id": "g-cp05-01",
            "titleVi": "Tổng ôn: Đại từ chỉ định và nghi vấn (这 / 那 / 哪)",
            "pattern": "这 / 那 / 哪 + (Lượng từ) + Danh từ",
            "explanationVi": "Dùng '这' (này), '那' (kia), '哪' (nào) để xác định vị trí hoặc đặt câu hỏi về đồ vật, phương hướng.",
            "examples": [
                {"hanzi": "这些人是我的朋友。", "pinyin": "Zhèxiē rén shì wǒ de péngyou.", "vi": "Những người này là bạn của tôi."},
                {"hanzi": "你要哪本书？", "pinyin": "Nǐ yào nǎ běn shū?", "vi": "Bạn muốn cuốn sách nào?"}
            ]
        },
        {
            "id": "g-cp05-02",
            "titleVi": "Tổng ôn: Từ chỉ phương vị (方位词)",
            "pattern": "Danh từ + 上 / 下 / 里 / 外 / 旁边",
            "explanationVi": "Phương vị từ đứng sau danh từ để tạo thành cụm từ chỉ nơi chốn cụ thể.",
            "examples": [
                {"hanzi": "学校在医院旁边。", "pinyin": "Xuéxiào zài yīyuàn pángbiān.", "vi": "Trường học ở bên cạnh bệnh viện."}
            ]
        }
    ]

    dialogue = {
        "title": "Hỏi thăm và chỉ đường",
        "turns": [
            {"speaker": "A", "hanzi": "请问，李先生的办公室在哪里？", "pinyin": "Qǐngwèn, Lǐ xiānsheng de bàngōngshì zài nǎli?", "vi": "Xin hỏi, văn phòng ông Lý ở đâu?"},
            {"speaker": "B", "hanzi": "在学校东边，离这里很近。", "pinyin": "Zài xuéxiào dōngbiān, lí zhèlǐ hěn jìn.", "vi": "Ở phía đông trường học, cách đây rất gần."},
            {"speaker": "A", "hanzi": "太感谢您了！", "pinyin": "Tài gǎnxiè nín le!", "vi": "Cảm ơn ngài rất nhiều!"},
            {"speaker": "B", "hanzi": "不客气，很高兴帮助你。", "pinyin": "Bù kèqi, hěn gāoxìng bāngzhù nǐ.", "vi": "Không có chi, rất vui được giúp bạn."}
        ]
    }

    passage = {
        "title": "我的新朋友",
        "content": "大家好！我认识了一个新朋友，他叫张明。张明的家在医院旁边。昨天他给我打电话，请我去他家玩儿。我们一起说话，非常高兴。",
        "pinyin": "Dàjiā hǎo! Wǒ rènshi le yí gè xīn péngyou, tā jiào Zhāng Míng. Zhāng Míng de jiā zài yīyuàn pángbiān. Zuótiān tā gěi wǒ dǎ diànhuà, qǐng wǒ qù tā jiā wánr. Wǒmen yìqǐ shuōhuà, fēicháng gāoxìng.",
        "translation_vi": "Chào mọi người! Tôi đã quen một người bạn mới tên là Trương Minh. Nhà của Trương Minh ở bên cạnh bệnh viện. Hôm qua cậu ấy gọi điện thoại mời tôi đến nhà chơi. Chúng tôi cùng nhau trò chuyện, rất vui vẻ."
    }

    stages = [
        {"stage": "0_warmup", "title_vi": "Khởi động & Kích hoạt phản xạ Chặng 5", "instruction": "Ôn lại các từ then chốt về giao tiếp, đại từ và không gian trước khi vào bài đánh giá.", "warmup_words": warmup_words},
        {"stage": "1_vocab_learn", "title_vi": "Tổng quan từ vựng trọng tâm Chặng 5 (Bài 21–25)", "vocabulary": vocabulary},
        {
            "stage": "2_vocab_practice",
            "title_vi": "Luyện tập từ vựng tổng hợp",
            "exercises": [
                {
                    "id": "ex-cp5-v01",
                    "type": "vocab_mcq",
                    "prompt": "Từ nào mang nghĩa là 'giúp đỡ'?",
                    "correct_answer": "帮助",
                    "options": ["帮助", "认识", "说话", "看见"],
                    "explanation": "'帮助' (bāngzhù) nghĩa là giúp đỡ."
                },
                {
                    "id": "ex-cp5-v02",
                    "type": "pinyin_mcq",
                    "prompt": "Chọn Pinyin chuẩn xác của '旁边':",
                    "correct_answer": "pángbiān",
                    "options": ["pángbiān", "qiánbiān", "hòubiān", "dōngbiān"],
                    "explanation": "'旁边' có phiên âm chuẩn là pángbiān (bên cạnh)."
                }
            ]
        },
        {"stage": "3_grammar_learn", "title_vi": "Ôn tập các điểm ngữ pháp then chốt Chặng 5", "grammar_points": grammar_points},
        {
            "stage": "4_grammar_practice",
            "title_vi": "Thực hành cấu trúc câu tổng hợp",
            "exercises": [
                {
                    "id": "ex-cp5-g01",
                    "type": "sentence_scramble",
                    "prompt": "Sắp xếp các từ thành câu hoàn chỉnh chỉ vị trí:",
                    "words": ["学校", "在", "旁边", "医院"],
                    "correct_answer": "学校在医院旁边。",
                    "explanation": "Cấu trúc: Địa điểm A + 在 + Địa điểm B + Phương vị từ."
                }
            ]
        },
        {
            "stage": "5_dialogue_interactive",
            "title_vi": "Hội thoại đối đáp Chặng 5",
            "dialogue": dialogue,
            "exercises": [
                {
                    "id": "ex-cp5-d01",
                    "type": "vocab_mcq",
                    "prompt": "Văn phòng ông Lý nằm ở đâu theo lời B?",
                    "correct_answer": "在学校东边",
                    "options": ["在学校东边", "在医院西边", "在商店旁边", "在家里"],
                    "explanation": "B nói: '在学校东边，离这里很近。'"
                }
            ]
        },
        {
            "stage": "6_listening_speaking",
            "title_vi": "Luyện nghe & Nhại âm Chặng 5",
            "exercises": [
                {
                    "id": "ex-cp5-ls01",
                    "type": "listening_hidden_transcript",
                    "prompt": "Nghe đoạn phát âm và chọn nội dung chuẩn xác:",
                    "audio_target": "请问，李先生的办公室在哪里？",
                    "correct_answer": "请问，李先生的办公室在哪里？",
                    "options": [
                        "请问，李先生的办公室在哪里？",
                        "请问，王老师现在在学校吗？",
                        "李先生今天给我打电话了。",
                        "我们都是李先生的朋友。"
                    ],
                    "explanation": "Câu phát âm chuẩn xác là: '请问，李先生的办公室在哪里？'"
                },
                {
                    "id": "ex-cp5-ls02",
                    "type": "speaking_shadowing",
                    "prompt": "Luyện nói nhại âm câu chúc mừng:",
                    "speech_target": "很高兴帮助你。",
                    "pinyin_target": "Hěn gāoxìng bāngzhù nǐ.",
                    "correct_answer": "很高兴帮助你。",
                    "options": ["很高兴帮助你。"],
                    "explanation": "Phát âm diễn cảm, tròn vành rõ chữ."
                }
            ]
        },
        {
            "stage": "7_reading_comprehension",
            "title_vi": "Đọc hiểu Chặng 5",
            "passage": passage,
            "exercises": [
                {
                    "id": "ex-cp5-r01",
                    "type": "reading_true_false",
                    "prompt": "Đúng hay Sai: '张明的家在医院旁边。' (Nhà của Trương Minh ở bên cạnh bệnh viện)?",
                    "correct_answer": "Đúng",
                    "options": ["Đúng", "Sai"],
                    "explanation": "Đoạn văn ghi rõ: '张明的家在医院旁边。'"
                }
            ]
        },
        {"stage": "8_mini_quiz", "title_vi": "Đánh giá Năng lực Chặng 5", "quizUrl": "/quizzes/hsk1-checkpoint-05"},
        {"stage": "9_srs_review", "title_vi": "Ôn tập củng cố Chặng 5 (SRS Review)", "reviewUrl": "/srs"}
    ]

    return {
        "id": "l-hsk1-cp05",
        "slug": "hsk1-checkpoint-05",
        "hsk_level": 1,
        "unit_id": "u-hsk1-05",
        "title": "Chặng 5: Tổng ôn & Đánh giá Năng lực (Bài 21–25)",
        "objective_vi": "Cột mốc đánh giá năng lực Chặng 5 (Bài 21–25). Kiểm tra toàn diện phản xạ giao tiếp, gọi điện, đại từ và chỉ dẫn phương vị.",
        "estimated_minutes": 30,
        "quality_status": "COMMUNITY_AUTHORED_EXPANDED_CURRICULUM",
        "stages": stages
    }

def create_checkpoint_6():
    warmup_words = [
        {"hanzi": "时间", "pinyin": "shíjiān", "vi": "thời gian"},
        {"hanzi": "喜欢", "pinyin": "xǐhuan", "vi": "thích"},
        {"hanzi": "非常", "pinyin": "fēicháng", "vi": "vô cùng, rất"},
        {"hanzi": "怎么样", "pinyin": "zěnmeyàng", "vi": "như thế nào"}
    ]

    vocabulary = [
        {"simplified": "千", "pinyin": "qiān", "meaning_vi": "nghìn"},
        {"simplified": "一点儿", "pinyin": "yìdiǎnr", "meaning_vi": "một chút, một ít"},
        {"simplified": "星期", "pinyin": "xīngqī", "meaning_vi": "tuần, thứ"},
        {"simplified": "时间", "pinyin": "shíjiān", "meaning_vi": "thời gian"},
        {"simplified": "觉得", "pinyin": "juéde", "meaning_vi": "cảm thấy, nghĩ rằng"},
        {"simplified": "希望", "pinyin": "xīwàng", "meaning_vi": "hy vọng"},
        {"simplified": "可以", "pinyin": "kěyǐ", "meaning_vi": "có thể, được"},
        {"simplified": "非常", "pinyin": "fēicháng", "meaning_vi": "vô cùng, rất"},
        {"simplified": "正在", "pinyin": "zhèngzài", "meaning_vi": "đang"},
        {"simplified": "怎么样", "pinyin": "zěnmeyàng", "meaning_vi": "như thế nào"}
    ]

    grammar_points = [
        {
            "id": "g-cp06-01",
            "titleVi": "Tổng ôn: Động từ năng nguyện (想 / 能 / 会 / 可以)",
            "pattern": "Chủ ngữ + (想 / 能 / 会 / 可以) + Động từ",
            "explanationVi": "Diễn đạt mong muốn, khả năng, sự cho phép hoặc kỹ năng đã học được.",
            "examples": [
                {"hanzi": "我可以帮你吗？", "pinyin": "Wǒ kěyǐ bāng nǐ ma?", "vi": "Tôi có thể giúp bạn không?"},
                {"hanzi": "他会说汉语。", "pinyin": "Tā huì shuō Hànyǔ.", "vi": "Anh ấy biết nói tiếng Trung."}
            ]
        },
        {
            "id": "g-cp06-02",
            "titleVi": "Tổng ôn: Phó từ chỉ mức độ và thời thái (非常 / 太 / 正在 / 了)",
            "pattern": "Chủ ngữ + (非常 / 太 / 正在) + Tính từ / Động từ (+ 了)",
            "explanationVi": "Bổ sung mức độ cao hoặc diễn đạt trạng thái đang diễn ra hay đã hoàn thành.",
            "examples": [
                {"hanzi": "我正在学汉语呢。", "pinyin": "Wǒ zhèngzài xué Hànyǔ ne.", "vi": "Tôi đang học tiếng Trung đây."},
                {"hanzi": "太好了！", "pinyin": "Tài hǎo le!", "vi": "Tốt quá rồi!"}
            ]
        }
    ]

    dialogue = {
        "title": "Kế hoạch cuối tuần và ôn tập HSK 1",
        "turns": [
            {"speaker": "A", "hanzi": "这个星期天你有时间吗？", "pinyin": "Zhè gè xīngqītiān nǐ yǒu shíjiān ma?", "vi": "Chủ nhật này bạn có thời gian rảnh không?"},
            {"speaker": "B", "hanzi": "有时间，我想去图书馆看书，你呢？", "pinyin": "Yǒu shíjiān, wǒ xiǎng qù túshūguǎn kàn shū, nǐ ne?", "vi": "Có thời gian, tôi muốn đến thư viện đọc sách, còn bạn thì sao?"},
            {"speaker": "A", "hanzi": "我也想去，我们一起去吧！", "pinyin": "Wǒ yě xiǎng qù, wǒmen yìqǐ qù ba!", "vi": "Tôi cũng muốn đi, chúng ta cùng đi nhé!"},
            {"speaker": "B", "hanzi": "太好了！星期天早上见！", "pinyin": "Tài hǎo le! Xīngqītiān zǎoshang jiàn!", "vi": "Tốt quá rồi! Hẹn gặp sáng chủ nhật nhé!"}
        ]
    }

    passage = {
        "title": "我的汉语学习总结",
        "content": "我已经学了三百个汉字，我觉得学汉语非常有意思。每天早上我听半个小时录音，晚上复习生词。希望今年我能通过HSK 1考试。",
        "pinyin": "Wǒ yǐjīng xué le sānbǎi gè hànzì, wǒ juéde xué Hànyǔ fēicháng yǒu yìsi. Měitiān zǎoshang wǒ tīng bàn gè xiǎoshí lùyīn, wǎnshang fùxí shēngcí. Xīwàng jīnnián wǒ néng tōngguò HSK 1 kǎoshì.",
        "translation_vi": "Tôi đã học được 300 chữ Hán, tôi cảm thấy học tiếng Trung rất thú vị. Mỗi sáng tôi nghe ghi âm nửa tiếng, buổi tối ôn tập từ mới. Hy vọng năm nay tôi có thể thi đỗ HSK 1."
    }

    stages = [
        {"stage": "0_warmup", "title_vi": "Khởi động & Kích hoạt phản xạ Chặng 6", "instruction": "Ôn lại các từ then chốt về số lượng, thời gian, tâm lý và hư từ trước khi hoàn tất chương trình HSK 1.", "warmup_words": warmup_words},
        {"stage": "1_vocab_learn", "title_vi": "Tổng quan từ vựng trọng tâm Chặng 6 (Bài 26–32)", "vocabulary": vocabulary},
        {
            "stage": "2_vocab_practice",
            "title_vi": "Luyện tập từ vựng tổng hợp HSK 1",
            "exercises": [
                {
                    "id": "ex-cp6-v01",
                    "type": "vocab_mcq",
                    "prompt": "Từ nào biểu thị nghĩa 'rất, vô cùng'?",
                    "correct_answer": "非常",
                    "options": ["非常", "觉得", "希望", "正在"],
                    "explanation": "'非常' (fēicháng) là phó từ chỉ mức độ cao (vô cùng, rất)."
                },
                {
                    "id": "ex-cp6-v02",
                    "type": "pinyin_mcq",
                    "prompt": "Chọn Pinyin chuẩn xác của đại từ '怎么样':",
                    "correct_answer": "zěnmeyàng",
                    "options": ["zěnmeyàng", "zěnme", "shénme", "nǎli"],
                    "explanation": "'怎么样' có phiên âm chuẩn là zěnmeyàng (thế nào, ra sao)."
                }
            ]
        },
        {"stage": "3_grammar_learn", "title_vi": "Ôn tập các cấu trúc ngữ pháp nâng cao Chặng 6", "grammar_points": grammar_points},
        {
            "stage": "4_grammar_practice",
            "title_vi": "Thực hành cấu trúc câu hoàn chỉnh",
            "exercises": [
                {
                    "id": "ex-cp6-g01",
                    "type": "sentence_scramble",
                    "prompt": "Sắp xếp câu diễn đạt trạng thái đang diễn ra:",
                    "words": ["正在", "学", "我", "汉语"],
                    "correct_answer": "我正在学汉语。",
                    "explanation": "Cấu trúc: Chủ ngữ + 正在 + Động từ + Tân ngữ."
                }
            ]
        },
        {
            "stage": "5_dialogue_interactive",
            "title_vi": "Hội thoại đối đáp Chặng 6",
            "dialogue": dialogue,
            "exercises": [
                {
                    "id": "ex-cp6-d01",
                    "type": "vocab_mcq",
                    "prompt": "Nhân vật A đề xuất điều gì trong đoạn hội thoại?",
                    "correct_answer": "我们一起去吧！",
                    "options": ["我们一起去吧！", "我不去图书馆。", "今天星期几？", "你喜欢吃什么？"],
                    "explanation": "A rủ: '我也想去，我们一起去吧！'"
                }
            ]
        },
        {
            "stage": "6_listening_speaking",
            "title_vi": "Luyện nghe & Nhại âm Chặng 6",
            "exercises": [
                {
                    "id": "ex-cp6-ls01",
                    "type": "listening_hidden_transcript",
                    "prompt": "Nghe đoạn phát âm và chọn nội dung chuẩn xác:",
                    "audio_target": "这个星期天你有时间吗？",
                    "correct_answer": "这个星期天你有时间吗？",
                    "options": [
                        "这个星期天你有时间吗？",
                        "你明天去不去学校？",
                        "我们什么时候见面？",
                        "他会说汉语吗？"
                    ],
                    "explanation": "Câu phát âm chuẩn xác là: '这个星期天你有时间吗？'"
                },
                {
                    "id": "ex-cp6-ls02",
                    "type": "speaking_shadowing",
                    "prompt": "Luyện nói câu biểu cảm hoàn thành:",
                    "speech_target": "太好了！",
                    "pinyin_target": "Tài hǎo le!",
                    "correct_answer": "太好了！",
                    "options": ["太好了！"],
                    "explanation": "Phát âm rõ ràng, ngữ điệu vui tươi hào hứng."
                }
            ]
        },
        {
            "stage": "7_reading_comprehension",
            "title_vi": "Đọc hiểu Tổng kết HSK 1",
            "passage": passage,
            "exercises": [
                {
                    "id": "ex-cp6-r01",
                    "type": "reading_true_false",
                    "prompt": "Đúng hay Sai: Người viết cảm thấy học tiếng Trung rất thú vị (非常有意思)?",
                    "correct_answer": "Đúng",
                    "options": ["Đúng", "Sai"],
                    "explanation": "Đoạn văn viết: '我觉得学汉语非常有意思。'"
                }
            ]
        },
        {"stage": "8_mini_quiz", "title_vi": "Đánh giá Năng lực Chặng 6 (Tổng kết HSK 1)", "quizUrl": "/quizzes/hsk1-checkpoint-06"},
        {"stage": "9_srs_review", "title_vi": "Ôn tập củng cố Chặng 6 (SRS Review)", "reviewUrl": "/srs"}
    ]

    return {
        "id": "l-hsk1-cp06",
        "slug": "hsk1-checkpoint-06",
        "hsk_level": 1,
        "unit_id": "u-hsk1-06",
        "title": "Chặng 6: Tổng ôn & Đánh giá Hoàn thiện HSK 1 (Bài 26–32)",
        "objective_vi": "Cột mốc đánh giá năng lực Chặng 6 (Bài 26–32). Hoàn thành 100% mục tiêu kiến thức và sẵn sàng bước vào đề thi thử HSK 1.",
        "estimated_minutes": 30,
        "quality_status": "COMMUNITY_AUTHORED_EXPANDED_CURRICULUM",
        "stages": stages
    }

def main():
    cp5 = create_checkpoint_5()
    with open("content/hsk_library/hsk1_checkpoint_05.json", "w", encoding="utf-8") as f:
        json.dump(cp5, f, ensure_ascii=False, indent=2)
    print("Updated content/hsk_library/hsk1_checkpoint_05.json")

    cp6 = create_checkpoint_6()
    with open("content/hsk_library/hsk1_checkpoint_06.json", "w", encoding="utf-8") as f:
        json.dump(cp6, f, ensure_ascii=False, indent=2)
    print("Created content/hsk_library/hsk1_checkpoint_06.json")

if __name__ == "__main__":
    main()
