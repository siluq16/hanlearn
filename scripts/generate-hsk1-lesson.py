import json

lesson1 = {
    "id": "lesson-hsk1-01",
    "hsk_level": 1,
    "unit_id": "unit-hsk1-01",
    "title": "Bài 1: Chào hỏi & Tự giới thiệu (自我介绍)",
    "objective_vi": "Biết cách chào hỏi lịch sự, tự giới thiệu họ tên, và hỏi thăm người khác trong tiếng Trung.",
    "estimated_minutes": 25,
    "stages": [
        {
            "stage": "0_warmup",
            "title_vi": "Khởi động & Ôn tập ngữ âm",
            "content": {
                "instruction": "Lắng nghe và nhắc lại các thanh mẫu âm đầu lưỡi và 4 thanh điệu cơ bản.",
                "warmup_words": ["nǐ", "hǎo", "wǒ", "shì"]
            }
        },
        {
            "stage": "1_vocab_learn",
            "title_vi": "Học từ vựng mới",
            "vocabulary": [
                {"simplified": "您好", "pinyin": "nínhǎo", "meaning_vi": "Chào ngài/ông/bà (trang trọng)"},
                {"simplified": "姓", "pinyin": "xìng", "meaning_vi": "Họ / mang họ"},
                {"simplified": "贵姓", "pinyin": "guìxìng", "meaning_vi": "Quý danh / họ của ngài"},
                {"simplified": "名字", "pinyin": "míngzi", "meaning_vi": "Tên / họ tên"},
                {"simplified": "叫", "pinyin": "jiào", "meaning_vi": "Gọi là / tên là"},
                {"simplified": "认识", "pinyin": "rènshi", "meaning_vi": "Quen biết / nhận biết"},
                {"simplified": "很高兴", "pinyin": "hěn gāoxìng", "meaning_vi": "Rất vui mừng"},
                {"simplified": "先生", "pinyin": "xiānsheng", "meaning_vi": "Tiên sinh / ông / thầy"},
                {"simplified": "谁", "pinyin": "shéi", "meaning_vi": "Ai / người nào"}
            ]
        },
        {
            "stage": "2_vocab_practice",
            "title_vi": "Luyện tập từ vựng tương tác",
            "exercises": [
                {
                    "id": "ex-hsk1-01-01",
                    "kind": "vocab-mcq",
                    "prompt_vi": "Chọn nghĩa tiếng Việt chính xác của từ: '认识' (rènshi)",
                    "target_content": {"hanzi": "认识", "pinyin": "rènshi"},
                    "options": [
                        {"id": "o1", "label": "Quen biết", "is_correct": True},
                        {"id": "o2", "label": "Tạm biệt", "is_correct": False},
                        {"id": "o3", "label": "Cảm ơn", "is_correct": False},
                        {"id": "o4", "label": "Bác sĩ", "is_correct": False}
                    ]
                },
                {
                    "id": "ex-hsk1-01-02",
                    "kind": "sentence-order",
                    "prompt_vi": "Sắp xếp các từ sau thành câu hoàn chỉnh: 'Tôi tên là Phương Đại Vĩ.'",
                    "order_tokens": [
                        {"id": "t1", "text": "我", "correct_index": 0},
                        {"id": "t2", "text": "叫", "correct_index": 1},
                        {"id": "t3", "text": "方大伟", "correct_index": 2},
                        {"id": "t4", "text": "。", "correct_index": 3}
                    ]
                }
            ]
        },
        {
            "stage": "3_grammar_learn",
            "title_vi": "Học ngữ pháp trọng điểm",
            "grammar_points": [
                {
                    "title": "1. Giới thiệu họ tên: 我姓 [Họ]，名字叫 [Tên]",
                    "pattern": "S + 姓 + Họ, 叫 + Tên",
                    "explanation_vi": "Người Trung Quốc thường tách họ và tên khi giới thiệu trang trọng để người đối diện nắm rõ cả họ lẫn tên riêng.",
                    "examples": [
                        {"hanzi": "我姓方，名字叫大伟。", "pinyin": "Wǒ xìng Fāng, míngzi jiào Dàwěi.", "vi": "Tôi họ Phương, tên gọi là Đại Vĩ."}
                    ]
                },
                {
                    "title": "2. Câu hỏi danh tính với '谁' (shéi - ai)",
                    "pattern": "Đại từ/Danh từ + 是 + 谁？",
                    "explanation_vi": "Dùng để hỏi về thân phận hoặc quan hệ của một người nào đó.",
                    "examples": [
                        {"hanzi": "那位小姐是谁？", "pinyin": "Nà wèi xiǎojie shì shéi?", "vi": "Vị tiểu thư/cô gái kia là ai?"}
                    ]
                }
            ]
        },
        {
            "stage": "4_grammar_practice",
            "title_vi": "Luyện tập ngữ pháp",
            "exercises": [
                {
                    "id": "ex-hsk1-01-03",
                    "kind": "grammar-choice",
                    "prompt_vi": "Điền từ thích hợp vào câu: '那位先生是____？' (Vị tiên sinh kia là ai?)",
                    "options": [
                        {"id": "g1", "label": "谁 (shéi)", "is_correct": True},
                        {"id": "g2", "label": "什么 (shénme)", "is_correct": False},
                        {"id": "g3", "label": "哪 (nǎ)", "is_correct": False},
                        {"id": "g4", "label": "吗 (ma)", "is_correct": False}
                    ]
                }
            ]
        },
        {
            "stage": "5_dialogue_interactive",
            "title_vi": "Hội thoại thực tế (Đối thoại 1: Tự giới thiệu)",
            "dialogue": {
                "id": "dlg-hsk1-01",
                "title_zh": "自我介绍",
                "title_vi": "Tự giới thiệu bản thân",
                "turns": [
                    {"speaker": "王明华", "hanzi": "您好，我是王明华。请问贵姓大名？", "pinyin": "Nín hǎo, wǒ shì Wáng Mínghuá. Qǐngwèn guìxìng dàmíng?", "vi": "Chào ngài, tôi là Vương Minh Hoa. Xin hỏi quý danh của ngài là gì?"},
                    {"speaker": "方大伟", "hanzi": "您好，我姓方，名字叫大伟。", "pinyin": "Nín hǎo, wǒ xìng Fāng, míngzi jiào Dàwěi.", "vi": "Chào ngài, tôi họ Phương, tên gọi là Đại Vĩ."},
                    {"speaker": "王明华", "hanzi": "方先生，很高兴认识您。", "pinyin": "Fāng xiānsheng, hěn gāoxìng rènshi nín.", "vi": "Thầy/Ông Phương, rất vui được làm quen với ngài."},
                    {"speaker": "方大伟", "hanzi": "我也是。那位小姐是谁？", "pinyin": "Wǒ yě shì. Nà wèi xiǎojie shì shéi?", "vi": "Tôi cũng vậy. Vị tiểu thư đằng kia là ai thế?"},
                    {"speaker": "王明华", "hanzi": "她叫赵小梅，是我的同事。", "pinyin": "Tā jiào Zhào Xiǎoméi, shì wǒ de tóngshì.", "vi": "Cô ấy tên Triệu Tiểu Mai, là đồng nghiệp của tôi."}
                ]
            }
        },
        {
            "stage": "6_listening_speaking",
            "title_vi": "Luyện nghe & Luyện nói",
            "listening_ref": "/listening?lesson=lesson-hsk1-01",
            "speaking_ref": "/speaking?lesson=lesson-hsk1-01"
        },
        {
            "stage": "7_reading_comprehension",
            "title_vi": "Đọc hiểu đoạn văn",
            "passage": {
                "title": "自我介绍 (Lời tự giới thiệu của Vương Minh Hoa)",
                "content": "大家好！我是王明华。我是中国人，也是汉语老师。很高兴认识大家。他是我的朋友方大伟。",
                "questions": [
                    {
                        "prompt_vi": "Vương Minh Hoa là người nước nào?",
                        "options": [
                            {"label": "Người Trung Quốc", "is_correct": True},
                            {"label": "Người Mỹ", "is_correct": False},
                            {"label": "Người Anh", "is_correct": False}
                        ]
                    }
                ]
            }
        },
        {
            "stage": "8_mini_quiz",
            "title_vi": "Mini Quiz cuối bài",
            "quiz_ref": "/lessons/lesson-hsk1-01/quiz"
        },
        {
            "stage": "9_srs_review",
            "title_vi": "Ôn tập ngắt quãng SRS",
            "review_ref": "/review"
        }
    ]
}

with open("content/hsk_library/hsk1_lesson_01.json", "w", encoding="utf-8") as f:
    json.dump(lesson1, f, ensure_ascii=False, indent=2)

print("Generated content/hsk_library/hsk1_lesson_01.json successfully")
