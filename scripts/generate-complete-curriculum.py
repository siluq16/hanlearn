import json
import os

os.makedirs('content/hsk_library', exist_ok=True)

# -------------------------------------------------------------
# LESSON 1: Chào hỏi & Tự giới thiệu (HSK 1 - Lesson 1)
# -------------------------------------------------------------
lesson1 = {
    "id": "l-hsk1-001",
    "slug": "hsk1-lesson-01",
    "hsk_level": 1,
    "unit_id": "u-hsk1-01",
    "title": "Bài 1: Chào hỏi & Tự giới thiệu (自我介绍)",
    "objective_vi": "Làm quen với chào hỏi lịch sự (您好), tự giới thiệu họ tên (姓/叫), hỏi thăm danh tính bằng 谁, và các dạng bài tập tương tác.",
    "estimated_minutes": 25,
    "quality_status": "VERIFIED",
    "stages": [
        {
            "stage": "0_warmup",
            "title_vi": "Khởi động & Ngữ âm nền tảng",
            "instruction": "Nghe và phát âm các âm tiết cơ bản trong bài học: nǐ, hǎo, wǒ, shì, shéi.",
            "warmup_words": [
                {"hanzi": "你", "pinyin": "nǐ", "vi": "bạn"},
                {"hanzi": "好", "pinyin": "hǎo", "vi": "tốt, khỏe"},
                {"hanzi": "我", "pinyin": "wǒ", "vi": "tôi"},
                {"hanzi": "是", "pinyin": "shì", "vi": "là"}
            ]
        },
        {
            "stage": "1_vocab_learn",
            "title_vi": "Học từ vựng trọng tâm",
            "vocabulary": [
                {"simplified": "你好", "pinyin": "nǐhǎo", "meaning_vi": "Xin chào (thông dụng)"},
                {"simplified": "您好", "pinyin": "nínhǎo", "meaning_vi": "Chào ngài / ông / bà (trang trọng, kính ngữ)"},
                {"simplified": "姓", "pinyin": "xìng", "meaning_vi": "Họ / mang họ"},
                {"simplified": "叫", "pinyin": "jiào", "meaning_vi": "Gọi là / tên là"},
                {"simplified": "名字", "pinyin": "míngzi", "meaning_vi": "Tên riêng / danh xưng"},
                {"simplified": "谁", "pinyin": "shéi", "meaning_vi": "Ai / người nào"},
                {"simplified": "认识", "pinyin": "rènshi", "meaning_vi": "Quen biết / nhận biết"},
                {"simplified": "很高兴", "pinyin": "hěn gāoxìng", "meaning_vi": "Rất vui mừng"}
            ]
        },
        {
            "stage": "2_vocab_practice",
            "title_vi": "Luyện tập từ vựng đa dạng",
            "exercises": [
                {
                    "id": "ex-01-v1",
                    "lessonId": "l-hsk1-001",
                    "sortOrder": 1,
                    "kind": "vocab-mcq",
                    "hskLevel": 1,
                    "promptVi": "Chọn nghĩa tiếng Việt chính xác của từ: '认识' (rènshi)",
                    "targetContent": {"hanzi": "认识", "pinyin": "rènshi"},
                    "options": [
                        {"id": "o1", "label": "Quen biết", "isCorrect": True},
                        {"id": "o2", "label": "Tạm biệt", "isCorrect": False},
                        {"id": "o3", "label": "Cảm ơn", "isCorrect": False},
                        {"id": "o4", "label": "Bác sĩ", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-01-v2",
                    "lessonId": "l-hsk1-001",
                    "sortOrder": 2,
                    "kind": "matching_pairs",
                    "hskLevel": 1,
                    "promptVi": "Ghép các cặp Hán tự và nghĩa tiếng Việt tương ứng:",
                    "matchingPairs": [
                        {"leftId": "l1", "leftLabel": "您好", "rightId": "r1", "rightLabel": "nínhǎo — Chào ngài"},
                        {"leftId": "l2", "leftLabel": "名字", "rightId": "r2", "rightLabel": "míngzi — Tên gọi"},
                        {"leftId": "l3", "leftLabel": "谁", "rightId": "r3", "rightLabel": "shéi — Ai"},
                        {"leftId": "l4", "leftLabel": "认识", "rightId": "r4", "rightLabel": "rènshi — Quen biết"}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "3_grammar_learn",
            "title_vi": "Học cấu trúc ngữ pháp",
            "grammar_points": [
                {
                    "id": "g-01-1",
                    "titleVi": "1. Giới thiệu họ tên: 我姓 [Họ]，叫 [Tên]",
                    "pattern": "S + 姓 + Họ, 叫 + Tên",
                    "explanationVi": "Trong giao tiếp lịch sự, người Trung Quốc thường tách rõ họ (姓) và tên gọi (叫) để xưng hô chuẩn xác.",
                    "examples": [
                        {"hanzi": "我姓方，叫大伟。", "pinyin": "Wǒ xìng Fāng, jiào Dàwěi.", "translationVi": "Tôi họ Phương, tên gọi là Đại Vĩ."}
                    ]
                },
                {
                    "id": "g-01-2",
                    "titleVi": "2. Câu hỏi danh tính với '谁' (shéi)",
                    "pattern": "Đại từ / Danh từ + 是 + 谁？",
                    "explanationVi": "Dùng để hỏi về danh tính của một người. Vị trí của '谁' đứng ngay ở vị trí vị ngữ.",
                    "examples": [
                        {"hanzi": "那位老师是谁？", "pinyin": "Nà wèi lǎoshī shì shéi?", "translationVi": "Vị giáo viên kia là ai?"}
                    ]
                }
            ]
        },
        {
            "stage": "4_grammar_practice",
            "title_vi": "Luyện tập ngữ pháp tương tác",
            "exercises": [
                {
                    "id": "ex-01-g1",
                    "lessonId": "l-hsk1-001",
                    "sortOrder": 3,
                    "kind": "grammar-choice",
                    "hskLevel": 1,
                    "promptVi": "Chọn từ thích hợp điền vào chỗ trống: '他____方大伟。' (Anh ấy tên là Phương Đại Vĩ.)",
                    "options": [
                        {"id": "o1", "label": "叫 (jiào)", "isCorrect": True, "explanationVi": "Dùng '叫' đứng trước họ tên đầy đủ hoặc tên riêng."},
                        {"id": "o2", "label": "姓 (xìng)", "isCorrect": False, "explanationVi": "'姓' chỉ đi kèm họ đơn, không đi cùng tên riêng ghép."},
                        {"id": "o3", "label": "谁 (shéi)", "isCorrect": False},
                        {"id": "o4", "label": "好 (hǎo)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-01-g2",
                    "lessonId": "l-hsk1-001",
                    "sortOrder": 4,
                    "kind": "sentence-order",
                    "hskLevel": 1,
                    "promptVi": "Sắp xếp các từ thành câu hoàn chỉnh: 'Rất vui được quen biết bạn.'",
                    "orderTokens": [
                        {"id": "t1", "text": "很高兴", "correctIndex": 0},
                        {"id": "t2", "text": "认识", "correctIndex": 1},
                        {"id": "t3", "text": "你", "correctIndex": 2},
                        {"id": "t4", "text": "。", "correctIndex": 3}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "5_dialogue_interactive",
            "title_vi": "Hội thoại đối đáp & Đóng vai",
            "dialogue": {
                "id": "dlg-01",
                "titleVi": "Chào hỏi tại công ty mới",
                "turns": [
                    {"speaker": "A (Vương Minh Hoa)", "hanzi": "您好！请问您贵姓？", "pinyin": "Nín hǎo! Qǐngwèn nín guìxìng?", "translationVi": "Chào ngài! Xin hỏi quý danh của ngài là gì?"},
                    {"speaker": "B (Phương Đại Vĩ)", "hanzi": "您好，我姓方，叫方大伟。", "pinyin": "Nín hǎo, wǒ xìng Fāng, jiào Fāng Dàwěi.", "translationVi": "Chào ngài, tôi họ Phương, tên là Phương Đại Vĩ."},
                    {"speaker": "A (Vương Minh Hoa)", "hanzi": "方先生，很高兴认识您！", "pinyin": "Fāng xiānsheng, hěn gāoxìng rènshi nín!", "translationVi": "Thầy Phương, rất vui được làm quen với ngài!"},
                    {"speaker": "B (Phương Đại Vĩ)", "hanzi": "认识您我也很高兴。", "pinyin": "Rènshi nín wǒ yě hěn gāoxìng.", "translationVi": "Quen biết ngài tôi cũng rất vui mừng."}
                ]
            },
            "exercises": [
                {
                    "id": "ex-01-d1",
                    "lessonId": "l-hsk1-001",
                    "sortOrder": 5,
                    "kind": "dialogue_roleplay",
                    "hskLevel": 1,
                    "promptVi": "Đóng vai B: Khi người đối diện nói '方先生，很高兴认识您！', bạn đáp lại thế nào?",
                    "options": [
                        {"id": "r1", "label": "认识您我也很高兴。(Quen biết ngài tôi cũng rất vui.)", "isCorrect": True},
                        {"id": "r2", "label": "对不起，没关系。(Xin lỗi, không có chi.)", "isCorrect": False},
                        {"id": "r3", "label": "他是谁？(Anh ấy là ai?)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "6_listening_speaking",
            "title_vi": "Luyện Nghe & Luyện Nói tương tác",
            "exercises": [
                {
                    "id": "ex-01-l1",
                    "lessonId": "l-hsk1-001",
                    "sortOrder": 6,
                    "kind": "listening_cloze",
                    "hskLevel": 1,
                    "promptVi": "Bấm nghe câu thoại và chọn từ còn thiếu để hoàn thiện câu:",
                    "targetContent": {
                        "hanzi": "很高兴认识你。",
                        "pinyin": "Hěn gāoxìng rènshi nǐ.",
                        "audioText": "很高兴认识你。",
                        "translationVi": "Rất vui được quen biết bạn."
                    },
                    "options": [
                        {"id": "c1", "label": "认识 (rènshi)", "isCorrect": True},
                        {"id": "c2", "label": "叫 (jiào)", "isCorrect": False},
                        {"id": "c3", "label": "姓 (xìng)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-01-s1",
                    "lessonId": "l-hsk1-001",
                    "sortOrder": 7,
                    "kind": "sentence_shadowing",
                    "hskLevel": 1,
                    "promptVi": "Nghe mẫu và nhại âm theo câu sau (Bật micro hoặc dùng Chế độ luyện thủ công):",
                    "targetContent": {
                        "hanzi": "您好，我姓方。",
                        "pinyin": "Nín hǎo, wǒ xìng Fāng.",
                        "translationVi": "Chào ngài, tôi họ Phương."
                    },
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "7_reading_comprehension",
            "title_vi": "Đọc hiểu đoạn văn & Trả lời câu hỏi",
            "passage": {
                "title": "自我介绍 (Lời tự giới thiệu của Phương Đại Vĩ)",
                "text": "大家好！我叫方大伟。我是汉语学生。很高兴认识大家。那位老师姓王，她是我的中国老师。",
                "translationVi": "Chào mọi người! Tôi tên là Phương Đại Vĩ. Tôi là học sinh tiếng Trung. Rất vui được quen biết mọi người. Vị giáo viên kia họ Vương, cô ấy là giáo viên Trung Quốc của tôi."
            },
            "exercises": [
                {
                    "id": "ex-01-r1",
                    "lessonId": "l-hsk1-001",
                    "sortOrder": 8,
                    "kind": "reading_true_false",
                    "hskLevel": 1,
                    "promptVi": "Đọc đoạn văn trên và đánh giá tính Đúng / Sai của câu sau:",
                    "readingPassage": {
                        "title": "自我介绍",
                        "text": "大家好！我叫方大伟。我是汉语学生。很高兴认识大家。那位老师姓王，她是我的中国老师。"
                    },
                    "trueFalseStatement": {
                        "statement": "方大伟是汉语老师。(Phương Đại Vĩ là giáo viên tiếng Trung.)",
                        "isTrue": False,
                        "explanationVi": "Sai! Đoạn văn nêu rõ: 方大伟是汉语学生 (Phương Đại Vĩ là học sinh tiếng Trung), còn cô giáo là giáo viên họ Vương."
                    },
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "8_mini_quiz",
            "title_vi": "Đánh giá cuối bài (Mini Quiz)",
            "quizUrl": "/lessons/639665c9-952d-5714-a276-537a3568b463/quiz"
        },
        {
            "stage": "9_srs_review",
            "title_vi": "Ôn tập củng cố (SRS Review)",
            "reviewUrl": "/review"
        }
    ]
}

# -------------------------------------------------------------
# LESSON 5: Gia đình & Nghề nghiệp (HSK 1 - Lesson 5)
# -------------------------------------------------------------
lesson5 = {
    "id": "l-hsk1-005",
    "slug": "hsk1-lesson-05",
    "hsk_level": 1,
    "unit_id": "u-hsk1-02",
    "title": "Bài 5: Gia đình & Nghề nghiệp của tôi (我的家与职业)",
    "objective_vi": "Học từ vựng về thành viên gia đình (爸爸, 妈妈, 哥哥...), nghề nghiệp (老师, 医生), mẫu câu sở hữu 的 và cấu trúc hỏi số lượng 口/个.",
    "estimated_minutes": 25,
    "quality_status": "VERIFIED",
    "stages": [
        {
            "stage": "0_warmup",
            "title_vi": "Khởi động & Nhận diện âm thanh",
            "instruction": "Luyện nghe phát âm thanh nhẹ (轻声) trong các danh từ xưng hô gia đình lặp lại: bàba, māma, gēge, jiějie.",
            "warmup_words": [
                {"hanzi": "爸爸", "pinyin": "bàba", "vi": "bố/cha"},
                {"hanzi": "妈妈", "pinyin": "māma", "vi": "mẹ"},
                {"hanzi": "家", "pinyin": "jiā", "vi": "nhà/gia đình"}
            ]
        },
        {
            "stage": "1_vocab_learn",
            "title_vi": "Học từ vựng mới",
            "vocabulary": [
                {"simplified": "家", "pinyin": "jiā", "meaning_vi": "Gia đình / nhà"},
                {"simplified": "爸爸", "pinyin": "bàba", "meaning_vi": "Bố / ba"},
                {"simplified": "妈妈", "pinyin": "māma", "meaning_vi": "Mẹ / má"},
                {"simplified": "哥哥", "pinyin": "gēge", "meaning_vi": "Anh trai"},
                {"simplified": "姐姐", "pinyin": "jiějie", "meaning_vi": "Chị gái"},
                {"simplified": "老师", "pinyin": "lǎoshī", "meaning_vi": "Thầy giáo / cô giáo"},
                {"simplified": "医生", "pinyin": "yīshēng", "meaning_vi": "Bác sĩ / thầy thuốc"},
                {"simplified": "工作", "pinyin": "gōngzuò", "meaning_vi": "Làm việc / công tác"}
            ]
        },
        {
            "stage": "2_vocab_practice",
            "title_vi": "Luyện tập từ vựng tương tác",
            "exercises": [
                {
                    "id": "ex-05-v1",
                    "lessonId": "l-hsk1-005",
                    "sortOrder": 1,
                    "kind": "vocab-mcq",
                    "hskLevel": 1,
                    "promptVi": "Chọn nghĩa tiếng Việt của từ: '医生' (yīshēng)",
                    "targetContent": {"hanzi": "医生", "pinyin": "yīshēng"},
                    "options": [
                        {"id": "o1", "label": "Bác sĩ", "isCorrect": True},
                        {"id": "o2", "label": "Giáo viên", "isCorrect": False},
                        {"id": "o3", "label": "Học sinh", "isCorrect": False},
                        {"id": "o4", "label": "Anh trai", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-05-v2",
                    "lessonId": "l-hsk1-005",
                    "sortOrder": 2,
                    "kind": "matching_pairs",
                    "hskLevel": 1,
                    "promptVi": "Ghép các từ vựng gia đình với nghĩa tương ứng:",
                    "matchingPairs": [
                        {"leftId": "l1", "leftLabel": "爸爸", "rightId": "r1", "rightLabel": "bàba — Bố"},
                        {"leftId": "l2", "leftLabel": "妈妈", "rightId": "r2", "rightLabel": "māma — Mẹ"},
                        {"leftId": "l3", "leftLabel": "老师", "rightId": "r3", "rightLabel": "lǎoshī — Giáo viên"},
                        {"leftId": "l4", "leftLabel": "工作", "rightId": "r4", "rightLabel": "gōngzuò — Làm việc"}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "3_grammar_learn",
            "title_vi": "Học cấu trúc ngữ pháp",
            "grammar_points": [
                {
                    "id": "g-05-1",
                    "titleVi": "1. Trợ từ kết cấu biểu thị sở hữu: 的 (de)",
                    "pattern": "Định ngữ + 的 + Trung tâm ngữ",
                    "explanationVi": "'的' kết nối chủ sở hữu với người hoặc vật được sở hữu. Khi quan hệ thân thuộc gia đình gần gũi, '的' có thể lược bỏ (ví dụ: 我妈妈).",
                    "examples": [
                        {"hanzi": "我爸爸是医生。", "pinyin": "Wǒ bàba shì yīshēng.", "translationVi": "Bố tôi là bác sĩ."}
                    ]
                },
                {
                    "id": "g-05-2",
                    "titleVi": "2. Hỏi số lượng thành viên trong gia đình: 几口人",
                    "pattern": "你家有几口人？",
                    "explanationVi": "'口' (kǒu) là lượng từ chuyên dụng khi đếm nhân khẩu trong gia đình.",
                    "examples": [
                        {"hanzi": "我家有四口人。", "pinyin": "Wǒ jiā yǒu sì kǒu rén.", "translationVi": "Nhà tôi có bốn người."}
                    ]
                }
            ]
        },
        {
            "stage": "4_grammar_practice",
            "title_vi": "Luyện tập ngữ pháp tương tác",
            "exercises": [
                {
                    "id": "ex-05-g1",
                    "lessonId": "l-hsk1-005",
                    "sortOrder": 3,
                    "kind": "grammar-choice",
                    "hskLevel": 1,
                    "promptVi": "Chọn lượng từ thích hợp: '你家有几____人？' (Nhà bạn có mấy người?)",
                    "options": [
                        {"id": "o1", "label": "口 (kǒu)", "isCorrect": True, "explanationVi": "Dùng '口' khi đếm thành viên trong một gia đình."},
                        {"id": "o2", "label": "个 (gè)", "isCorrect": False},
                        {"id": "o3", "label": "本 (běn)", "isCorrect": False},
                        {"id": "o4", "label": "只 (zhī)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-05-g2",
                    "lessonId": "l-hsk1-005",
                    "sortOrder": 4,
                    "kind": "sentence-order",
                    "hskLevel": 1,
                    "promptVi": "Sắp xếp câu: 'Mẹ tôi là giáo viên tiếng Trung.'",
                    "orderTokens": [
                        {"id": "t1", "text": "我妈妈", "correctIndex": 0},
                        {"id": "t2", "text": "是", "correctIndex": 1},
                        {"id": "t3", "text": "汉语", "correctIndex": 2},
                        {"id": "t4", "text": "老师", "correctIndex": 3},
                        {"id": "t5", "text": "。", "correctIndex": 4}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "5_dialogue_interactive",
            "title_vi": "Hội thoại đối đáp & Đóng vai",
            "dialogue": {
                "id": "dlg-05",
                "titleVi": "Hỏi về gia đình và nghề nghiệp",
                "turns": [
                    {"speaker": "A", "hanzi": "你家有几口人？", "pinyin": "Nǐ jiā yǒu jǐ kǒu rén?", "translationVi": "Nhà bạn có mấy người?"},
                    {"speaker": "B", "hanzi": "我家有三口人：爸爸、妈妈和我。", "pinyin": "Wǒ jiā yǒu sān kǒu rén: bàba, māma hé wǒ.", "translationVi": "Nhà tôi có 3 người: bố, mẹ và tôi."},
                    {"speaker": "A", "hanzi": "你爸爸做什​​么工作？", "pinyin": "Nǐ bàba zuò shénme gōngzuò?", "translationVi": "Bố bạn làm công việc gì?"},
                    {"speaker": "B", "hanzi": "我爸爸是医生，他在医院工作。", "pinyin": "Wǒ bàba shì yīshēng, tā zài yīyuàn gōngzuò.", "translationVi": "Bố tôi là bác sĩ, ông làm việc ở bệnh viện."}
                ]
            },
            "exercises": [
                {
                    "id": "ex-05-d1",
                    "lessonId": "l-hsk1-005",
                    "sortOrder": 5,
                    "kind": "dialogue_roleplay",
                    "hskLevel": 1,
                    "promptVi": "Đóng vai B: Khi bạn A hỏi '你家有几口人？', bạn đáp thế nào?",
                    "options": [
                        {"id": "r1", "label": "我家有三口人：爸爸、妈妈和我。(Nhà tôi có 3 người: bố, mẹ và tôi.)", "isCorrect": True},
                        {"id": "r2", "label": "我是汉语老师。(Tôi là giáo viên tiếng Trung.)", "isCorrect": False},
                        {"id": "r3", "label": "我很好，谢谢。(Tôi khỏe, cảm ơn.)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "6_listening_speaking",
            "title_vi": "Luyện Nghe & Luyện Nói",
            "exercises": [
                {
                    "id": "ex-05-l1",
                    "lessonId": "l-hsk1-005",
                    "sortOrder": 6,
                    "kind": "listening_dictation",
                    "hskLevel": 1,
                    "promptVi": "Nghe đoạn âm thanh và nhập chữ Hán hoặc Pinyin bạn nghe được:",
                    "targetContent": {
                        "hanzi": "我爸爸是医生",
                        "pinyin": "wǒ bàba shì yīshēng",
                        "audioText": "我爸爸是医生",
                        "translationVi": "Bố tôi là bác sĩ"
                    },
                    "expectedAnswer": "我爸爸是医生",
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-05-s1",
                    "lessonId": "l-hsk1-005",
                    "sortOrder": 7,
                    "kind": "sentence_shadowing",
                    "hskLevel": 1,
                    "promptVi": "Nghe và phát âm theo câu: '我家有四口人。'",
                    "targetContent": {
                        "hanzi": "我家有四口人。",
                        "pinyin": "Wǒ jiā yǒu sì kǒu rén.",
                        "translationVi": "Nhà tôi có 4 người."
                    },
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "7_reading_comprehension",
            "title_vi": "Đọc hiểu đoạn văn",
            "passage": {
                "title": "我的家 (Gia đình tôi)",
                "text": "我家在北京。我家有四口人：爸爸、妈妈、哥哥和我。我爸爸是医生，妈妈是老师。我哥哥也是学生。我们都很爱我们的家。",
                "translationVi": "Nhà tôi ở Bắc Kinh. Nhà tôi có 4 người: bố, mẹ, anh trai và tôi. Bố tôi là bác sĩ, mẹ là giáo viên. Anh trai tôi cũng là học sinh. Chúng tôi đều rất yêu gia đình mình."
            },
            "exercises": [
                {
                    "id": "ex-05-r1",
                    "lessonId": "l-hsk1-005",
                    "sortOrder": 8,
                    "kind": "reading_true_false",
                    "hskLevel": 1,
                    "promptVi": "Đánh giá tính Đúng / Sai của câu sau dựa vào đoạn văn:",
                    "readingPassage": {
                        "title": "我的家",
                        "text": "我家在北京。我家有四口人：爸爸、妈妈、哥哥和我。我爸爸是医生，妈妈是老师。我哥哥也是学生。我们都很爱我们的家。"
                    },
                    "trueFalseStatement": {
                        "statement": "妈妈是医生，爸爸是老师。(Mẹ là bác sĩ, bố là giáo viên.)",
                        "isTrue": False,
                        "explanationVi": "Sai! Đoạn văn ghi rõ: 我爸爸是医生，妈妈是老师 (Bố là bác sĩ, mẹ là giáo viên)."
                    },
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "8_mini_quiz",
            "title_vi": "Mini Quiz cuối bài",
            "quizUrl": "/lessons/l-hsk1-005/quiz"
        },
        {
            "stage": "9_srs_review",
            "title_vi": "Ôn tập củng cố (SRS Review)",
            "reviewUrl": "/review"
        }
    ]
}

# -------------------------------------------------------------
# LESSON 6: Thời gian & Lịch trình (HSK 1 - Lesson 6)
# -------------------------------------------------------------
lesson6 = {
    "id": "l-hsk1-006",
    "slug": "hsk1-lesson-06",
    "hsk_level": 1,
    "unit_id": "u-hsk1-02",
    "title": "Bài 6: Bây giờ là mấy giờ? (现在几点？)",
    "objective_vi": "Hỏi và nói giờ giấc (点, 分), các buổi trong ngày (上午, 下午), các thứ trong tuần (星期一..), và diễn đạt lịch sinh hoạt thường ngày.",
    "estimated_minutes": 25,
    "quality_status": "VERIFIED",
    "stages": [
        {
            "stage": "0_warmup",
            "title_vi": "Khởi động & Ôn tập số đếm",
            "instruction": "Ôn lại các số từ 1 đến 12 để chuẩn bị đọc giờ trong tiếng Trung: yī, èr, sān, sì, wǔ, liù, qī, bā, jiǔ, shí.",
            "warmup_words": [
                {"hanzi": "一", "pinyin": "yī", "vi": "một"},
                {"hanzi": "二", "pinyin": "èr", "vi": "hai"},
                {"hanzi": "两", "pinyin": "liǎng", "vi": "hai (dùng trước lượng từ)"},
                {"hanzi": "点", "pinyin": "diǎn", "vi": "giờ (điểm)"}
            ]
        },
        {
            "stage": "1_vocab_learn",
            "title_vi": "Học từ vựng mới",
            "vocabulary": [
                {"simplified": "现在", "pinyin": "xiànzài", "meaning_vi": "Bây giờ / hiện tại"},
                {"simplified": "点", "pinyin": "diǎn", "meaning_vi": "Giờ (thời điểm)"},
                {"simplified": "分", "pinyin": "fēn", "meaning_vi": "Phút"},
                {"simplified": "上午", "pinyin": "shàngwǔ", "meaning_vi": "Buổi sáng"},
                {"simplified": "下午", "pinyin": "xiàwǔ", "meaning_vi": "Buổi chiều"},
                {"simplified": "今天", "pinyin": "jīntiān", "meaning_vi": "Hôm nay"},
                {"simplified": "明天", "pinyin": "míngtiān", "meaning_vi": "Ngày mai"},
                {"simplified": "星期", "pinyin": "xīngqī", "meaning_vi": "Tuần / thứ"}
            ]
        },
        {
            "stage": "2_vocab_practice",
            "title_vi": "Luyện tập từ vựng tương tác",
            "exercises": [
                {
                    "id": "ex-06-v1",
                    "lessonId": "l-hsk1-006",
                    "sortOrder": 1,
                    "kind": "vocab-mcq",
                    "hskLevel": 1,
                    "promptVi": "Chọn nghĩa tiếng Việt của từ: '现在' (xiànzài)",
                    "targetContent": {"hanzi": "现在", "pinyin": "xiànzài"},
                    "options": [
                        {"id": "o1", "label": "Bây giờ", "isCorrect": True},
                        {"id": "o2", "label": "Ngày mai", "isCorrect": False},
                        {"id": "o3", "label": "Hôm qua", "isCorrect": False},
                        {"id": "o4", "label": "Buổi tối", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-06-v2",
                    "lessonId": "l-hsk1-006",
                    "sortOrder": 2,
                    "kind": "matching_pairs",
                    "hskLevel": 1,
                    "promptVi": "Ghép các mốc thời gian với nghĩa tiếng Việt tương ứng:",
                    "matchingPairs": [
                        {"leftId": "l1", "leftLabel": "今天", "rightId": "r1", "rightLabel": "jīntiān — Hôm nay"},
                        {"leftId": "l2", "leftLabel": "明天", "rightId": "r2", "rightLabel": "míngtiān — Ngày mai"},
                        {"leftId": "l3", "leftLabel": "上午", "rightId": "r3", "rightLabel": "shàngwǔ — Buổi sáng"},
                        {"leftId": "l4", "leftLabel": "下午", "rightId": "r4", "rightLabel": "xiàwǔ — Buổi chiều"}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "3_grammar_learn",
            "title_vi": "Học cấu trúc ngữ pháp",
            "grammar_points": [
                {
                    "id": "g-06-1",
                    "titleVi": "1. Cách nói giờ: [Số] + 点 + [Số] + 分",
                    "pattern": "现在 + [Số] 点 + [Số] 分",
                    "explanationVi": "Lưu ý đặc biệt: Khi nói 2 giờ, dùng '两点' (liǎng diǎn) chứ không dùng '二点'.",
                    "examples": [
                        {"hanzi": "现在八点十分。", "pinyin": "Xiànzài bā diǎn shí fēn.", "translationVi": "Bây giờ là 8 giờ 10 phút."}
                    ]
                },
                {
                    "id": "g-06-2",
                    "titleVi": "2. Trạng từ chỉ thời gian đứng trước động từ",
                    "pattern": "Chủ ngữ + Thời gian + Động từ + Tân ngữ",
                    "explanationVi": "Khác với tiếng Việt (Tôi đi ăn lúc 12 giờ), tiếng Trung đặt mốc thời gian trước hành động (我十二点去吃饭).",
                    "examples": [
                        {"hanzi": "我们下午两点开会。", "pinyin": "Wǒmen xiàwǔ liǎng diǎn kāihuì.", "translationVi": "Chúng tôi họp lúc 2 giờ chiều."}
                    ]
                }
            ]
        },
        {
            "stage": "4_grammar_practice",
            "title_vi": "Luyện tập ngữ pháp tương tác",
            "exercises": [
                {
                    "id": "ex-06-g1",
                    "lessonId": "l-hsk1-006",
                    "sortOrder": 3,
                    "kind": "grammar-choice",
                    "hskLevel": 1,
                    "promptVi": "Cách nói '2 giờ chiều' đúng chuẩn trong tiếng Trung là gì?",
                    "options": [
                        {"id": "o1", "label": "下午两点 (xiàwǔ liǎng diǎn)", "isCorrect": True, "explanationVi": "Thời điểm lớn (buổi chiều) đứng trước, và 2 giờ dùng '两点'."},
                        {"id": "o2", "label": "两点下午", "isCorrect": False},
                        {"id": "o3", "label": "下午二点", "isCorrect": False, "explanationVi": "Không dùng '二点' khi nói giờ giấc."},
                        {"id": "o4", "label": "二点", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-06-g2",
                    "lessonId": "l-hsk1-006",
                    "sortOrder": 4,
                    "kind": "sentence-order",
                    "hskLevel": 1,
                    "promptVi": "Sắp xếp trật tự câu: 'Bây giờ là mấy giờ rồi?'",
                    "orderTokens": [
                        {"id": "t1", "text": "现在", "correctIndex": 0},
                        {"id": "t2", "text": "几点", "correctIndex": 1},
                        {"id": "t3", "text": "了", "correctIndex": 2},
                        {"id": "t4", "text": "？", "correctIndex": 3}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "5_dialogue_interactive",
            "title_vi": "Hội thoại đối đáp & Đóng vai",
            "dialogue": {
                "id": "dlg-06",
                "titleVi": "Hỏi giờ và hẹn bạn",
                "turns": [
                    {"speaker": "A", "hanzi": "请问，现在几点了？", "pinyin": "Qǐngwèn, xiànzài jǐ diǎn le?", "translationVi": "Xin hỏi, bây giờ là mấy giờ rồi?"},
                    {"speaker": "B", "hanzi": "现在上午十点十分。", "pinyin": "Xiànzài shàngwǔ shí diǎn shí fēn.", "translationVi": "Bây giờ là 10 giờ 10 phút sáng."},
                    {"speaker": "A", "hanzi": "你今天下午有空吗？", "pinyin": "Nǐ jīntiān xiàwǔ yǒu kòng ma?", "translationVi": "Chiều nay bạn có rảnh không?"},
                    {"speaker": "B", "hanzi": "有空，我们下午三点见。", "pinyin": "Yǒu kòng, wǒmen xiàwǔ sān diǎn jiàn.", "translationVi": "Có rảnh, chúng ta gặp nhau lúc 3 giờ chiều nhé."}
                ]
            },
            "exercises": [
                {
                    "id": "ex-06-d1",
                    "lessonId": "l-hsk1-006",
                    "sortOrder": 5,
                    "kind": "dialogue_roleplay",
                    "hskLevel": 1,
                    "promptVi": "Đóng vai B: Khi bạn A hỏi '请问，现在几点了？', bạn đáp thế nào?",
                    "options": [
                        {"id": "r1", "label": "现在上午十点十分。(Bây giờ là 10 giờ 10 phút sáng.)", "isCorrect": True},
                        {"id": "r2", "label": "我姓王。(Tôi họ Vương.)", "isCorrect": False},
                        {"id": "r3", "label": "再见！(Tạm biệt!)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "6_listening_speaking",
            "title_vi": "Luyện Nghe & Luyện Nói",
            "exercises": [
                {
                    "id": "ex-06-l1",
                    "lessonId": "l-hsk1-006",
                    "sortOrder": 6,
                    "kind": "listening_cloze",
                    "hskLevel": 1,
                    "promptVi": "Bấm nghe câu thoại và chọn từ còn thiếu để hoàn tất câu:",
                    "targetContent": {
                        "hanzi": "我们下午三点见。",
                        "pinyin": "Wǒmen xiàwǔ sān diǎn jiàn.",
                        "audioText": "我们下午三点见。",
                        "translationVi": "Chúng ta hẹn gặp lúc 3 giờ chiều."
                    },
                    "options": [
                        {"id": "c1", "label": "下午 (xiàwǔ)", "isCorrect": True},
                        {"id": "c2", "label": "上午 (shàngwǔ)", "isCorrect": False},
                        {"id": "c3", "label": "昨天 (zuótiān)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-06-s1",
                    "lessonId": "l-hsk1-006",
                    "sortOrder": 7,
                    "kind": "sentence_shadowing",
                    "hskLevel": 1,
                    "promptVi": "Luyện phát âm theo câu: '现在几点了？'",
                    "targetContent": {
                        "hanzi": "现在几点了？",
                        "pinyin": "Xiànzài jǐ diǎn le?",
                        "translationVi": "Bây giờ là mấy giờ rồi?"
                    },
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "7_reading_comprehension",
            "title_vi": "Đọc hiểu đoạn văn",
            "passage": {
                "title": "今天的时间表 (Thời gian biểu hôm nay)",
                "text": "今天是星期一。我上午八点去学校学习汉语。中午十二点我和同学吃午饭。下午两点我们有汉语课。晚上八点我回家看书。",
                "translationVi": "Hôm nay là thứ Hai. 8 giờ sáng tôi đến trường học tiếng Trung. 12 giờ trưa tôi và bạn cùng lớp ăn trưa. 2 giờ chiều chúng tôi có tiết tiếng Trung. 8 giờ tối tôi về nhà đọc sách."
            },
            "exercises": [
                {
                    "id": "ex-06-r1",
                    "lessonId": "l-hsk1-006",
                    "sortOrder": 8,
                    "kind": "reading_true_false",
                    "hskLevel": 1,
                    "promptVi": "Đánh giá tính Đúng / Sai của câu sau theo đoạn văn:",
                    "readingPassage": {
                        "title": "今天的时间表",
                        "text": "今天是星期一。我上午八点去学校学习汉语。中午十二点我和同学吃午饭。下午两点我们有汉语课。晚上八点我回家看书。"
                    },
                    "trueFalseStatement": {
                        "statement": "下午两点有汉语课。(2 giờ chiều có tiết tiếng Trung.)",
                        "isTrue": True,
                        "explanationVi": "Đúng! Đoạn văn ghi: 下午两点我们有汉语课 (2 giờ chiều chúng tôi có tiết tiếng Trung)."
                    },
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "8_mini_quiz",
            "title_vi": "Mini Quiz cuối bài",
            "quizUrl": "/lessons/l-hsk1-006/quiz"
        },
        {
            "stage": "9_srs_review",
            "title_vi": "Ôn tập củng cố (SRS Review)",
            "reviewUrl": "/review"
        }
    ]
}

# Save files
with open("content/hsk_library/hsk1_lesson_01.json", "w", encoding="utf-8") as f:
    json.dump(lesson1, f, ensure_ascii=False, indent=2)

with open("content/hsk_library/hsk1_lesson_05.json", "w", encoding="utf-8") as f:
    json.dump(lesson5, f, ensure_ascii=False, indent=2)

with open("content/hsk_library/hsk1_lesson_06.json", "w", encoding="utf-8") as f:
    json.dump(lesson6, f, ensure_ascii=False, indent=2)

print("Generated HSK 1 Lessons 01, 05, 06 successfully with complete 9 stages and all exercise types!")
