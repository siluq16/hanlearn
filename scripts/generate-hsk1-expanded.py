import json

# Lesson 07: Mua sắm & Giá cả (买东西与多少钱)
lesson07 = {
    "id": "l-hsk1-007",
    "slug": "hsk1-lesson-07",
    "hsk_level": 1,
    "unit_id": "u-hsk1-02",
    "title": "Bài 7: Mua sắm & Giá cả (买东西与多少钱)",
    "objective_vi": "Biết cách hỏi giá cả (...多少钱), diễn đạt số tiền với 块 / 元, và sử dụng mẫu câu cảm thán 太...了.",
    "estimated_minutes": 25,
    "quality_status": "VERIFIED",
    "stages": [
        {
            "stage": "0_warmup",
            "title_vi": "Khởi động & Ngữ âm nền tảng",
            "instruction": "Nghe và phát âm các âm tiết trọng tâm: mǎi, qián, duō, shao, kuài, tài, guì.",
            "warmup_words": [
                {"hanzi": "买", "pinyin": "mǎi", "vi": "mua"},
                {"hanzi": "钱", "pinyin": "qián", "vi": "tiền"},
                {"hanzi": "多少", "pinyin": "duōshao", "vi": "bao nhiêu"},
                {"hanzi": "太", "pinyin": "tài", "vi": "quá, lắm"}
            ]
        },
        {
            "stage": "1_vocab_learn",
            "title_vi": "Học từ vựng trọng tâm",
            "vocabulary": [
                {"simplified": "买", "pinyin": "mǎi", "meaning_vi": "Mua (động từ)"},
                {"simplified": "多少", "pinyin": "duōshao", "meaning_vi": "Bao nhiêu (đại từ nghi vấn)"},
                {"simplified": "钱", "pinyin": "qián", "meaning_vi": "Tiền (danh từ)"},
                {"simplified": "块", "pinyin": "kuài", "meaning_vi": "Đồng / tệ (lượng từ tiền tệ, khẩu ngữ)"},
                {"simplified": "元", "pinyin": "yuán", "meaning_vi": "Đồng / tệ (đơn vị tiền tệ chính thức, văn viết)"},
                {"simplified": "太", "pinyin": "tài", "meaning_vi": "Quá / lắm (phó từ mức độ)"},
                {"simplified": "贵", "pinyin": "guì", "meaning_vi": "Đắt / quý giá (tính từ)"},
                {"simplified": "便宜", "pinyin": "piányi", "meaning_vi": "Rẻ / giá mềm (tính từ)"},
                {"simplified": "苹果", "pinyin": "píngguǒ", "meaning_vi": "Quả táo (danh từ)"},
                {"simplified": "东西", "pinyin": "dōngxi", "meaning_vi": "Đồ vật / thứ / hàng hóa (danh từ)"}
            ]
        },
        {
            "stage": "2_vocab_practice",
            "title_vi": "Luyện tập từ vựng tương tác",
            "exercises": [
                {
                    "id": "ex-07-v1",
                    "lessonId": "l-hsk1-007",
                    "sortOrder": 1,
                    "kind": "vocab-mcq",
                    "hskLevel": 1,
                    "promptVi": "Chọn nghĩa tiếng Việt đúng của từ '多少钱' (duōshao qián):",
                    "targetContent": {"hanzi": "多少钱", "pinyin": "duōshao qián"},
                    "options": [
                        {"id": "o1", "label": "Bao nhiêu tiền", "isCorrect": True},
                        {"id": "o2", "label": "Mấy giờ rồi", "isCorrect": False},
                        {"id": "o3", "label": "Bao nhiêu người", "isCorrect": False},
                        {"id": "o4", "label": "Đắt quá rồi", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-07-v2",
                    "lessonId": "l-hsk1-007",
                    "sortOrder": 2,
                    "kind": "matching_pairs",
                    "hskLevel": 1,
                    "promptVi": "Ghép cặp từ tiếng Trung và nghĩa tiếng Việt tương ứng:",
                    "pairs": [
                        {"id": "p1", "left": "买 (mǎi)", "right": "Mua"},
                        {"id": "p2", "left": "贵 (guì)", "right": "Đắt"},
                        {"id": "p3", "left": "便宜 (piányi)", "right": "Rẻ"},
                        {"id": "p4", "left": "苹果 (píngguǒ)", "right": "Quả táo"}
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
                    "id": "g-07-1",
                    "titleVi": "1. Mẫu câu hỏi giá: [Đồ vật] + 多少钱？",
                    "pattern": "Danh từ + 多少钱？",
                    "explanationVi": "Dùng để hỏi giá của đồ vật hoặc dịch vụ. Khi trả lời, nêu trực tiếp số lượng + 块 (hoặc 元).",
                    "examples": [
                        {"hanzi": "这个苹果多少钱？", "pinyin": "Zhège píngguǒ duōshao qián?", "translationVi": "Quả táo này bao nhiêu tiền?"},
                        {"hanzi": "五块钱一斤。", "pinyin": "Wǔ kuài qián yī jīn.", "translationVi": "Năm đồng một cân."}
                    ]
                },
                {
                    "id": "g-07-2",
                    "titleVi": "2. Cấu trúc cảm thán / mức độ cao: 太 + Tính từ + 了",
                    "pattern": "太 + Adj + 了",
                    "explanationVi": "Biểu thị mức độ rất cao hoặc vượt quá mức bình thường. Thường dùng trong mặc cả hoặc khen ngợi.",
                    "examples": [
                        {"hanzi": "太贵了，便宜一点儿吧！", "pinyin": "Tài guì le, piányi yīdiǎnr ba!", "translationVi": "Đắt quá, rẻ một chút đi!"},
                        {"hanzi": "太好了！", "pinyin": "Tài hǎo le!", "translationVi": "Tốt quá rồi!"}
                    ]
                }
            ]
        },
        {
            "stage": "4_grammar_practice",
            "title_vi": "Luyện tập ngữ pháp tương tác",
            "exercises": [
                {
                    "id": "ex-07-g1",
                    "lessonId": "l-hsk1-007",
                    "sortOrder": 3,
                    "kind": "grammar-choice",
                    "hskLevel": 1,
                    "promptVi": "Điền từ thích hợp vào chỗ trống: '这个东西____贵了！' (Đồ này đắt quá rồi!)",
                    "options": [
                        {"id": "o1", "label": "太 (tài)", "isCorrect": True, "explanationVi": "Cấu trúc cảm thán: 太 + Tính từ + 了."},
                        {"id": "o2", "label": "很 (hěn)", "isCorrect": False},
                        {"id": "o3", "label": "不 (bù)", "isCorrect": False},
                        {"id": "o4", "label": "几 (jǐ)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-07-g2",
                    "lessonId": "l-hsk1-007",
                    "sortOrder": 4,
                    "kind": "sentence-order",
                    "hskLevel": 1,
                    "promptVi": "Sắp xếp các từ thành câu: 'Quả táo này bao nhiêu tiền một cân?'",
                    "orderTokens": [
                        {"id": "t1", "text": "这个", "correctIndex": 0},
                        {"id": "t2", "text": "苹果", "correctIndex": 1},
                        {"id": "t3", "text": "一斤", "correctIndex": 2},
                        {"id": "t4", "text": "多少钱", "correctIndex": 3},
                        {"id": "t5", "text": "？", "correctIndex": 4}
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
                "id": "dlg-07",
                "titleVi": "Mua táo ở chợ hoa quả",
                "turns": [
                    {"speaker": "A", "hanzi": "你好，你想买什么？", "pinyin": "Nǐ hǎo, nǐ xiǎng mǎi shénme?", "translationVi": "Xin chào, bạn muốn mua gì?"},
                    {"speaker": "B", "hanzi": "我想买苹果。这个苹果多少钱一斤？", "pinyin": "Wǒ xiǎng mǎi píngguǒ. Zhège píngguǒ duōshao qián yī jīn?", "translationVi": "Tôi muốn mua táo. Táo này bao nhiêu tiền một cân?"},
                    {"speaker": "A", "hanzi": "六块钱一斤。", "pinyin": "Liù kuài qián yī jīn.", "translationVi": "Sáu đồng một cân."},
                    {"speaker": "B", "hanzi": "太贵了，五块钱可以吗？", "pinyin": "Tài guì le, wǔ kuài qián kěyǐ ma?", "translationVi": "Đắt quá, năm đồng được không?"},
                    {"speaker": "A", "hanzi": "可以，给你。", "pinyin": "Kěyǐ, gěi nǐ.", "translationVi": "Được, đưa cho bạn này."}
                ]
            },
            "exercises": [
                {
                    "id": "ex-07-d1",
                    "lessonId": "l-hsk1-007",
                    "sortOrder": 5,
                    "kind": "dialogue_roleplay",
                    "hskLevel": 1,
                    "promptVi": "Đóng vai B: Khi người bán hàng báo giá '六块钱一斤', bạn muốn mặc cả thì nói câu nào?",
                    "options": [
                        {"id": "r1", "label": "太贵了，五块钱可以吗？ (Đắt quá, năm đồng được không?)", "isCorrect": True},
                        {"id": "r2", "label": "我很喜欢吃米饭。 (Tôi rất thích ăn cơm.)", "isCorrect": False},
                        {"id": "r3", "label": "明天星期几？ (Ngày mai thứ mấy?)", "isCorrect": False}
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
                    "id": "ex-07-l1",
                    "lessonId": "l-hsk1-007",
                    "sortOrder": 6,
                    "kind": "listening_dictation",
                    "hskLevel": 1,
                    "promptVi": "Nghe đoạn âm thanh và nhập chữ Hán hoặc Pinyin bạn nghe được:",
                    "targetContent": {
                        "hanzi": "苹果太贵了",
                        "pinyin": "píngguǒ tài guì le",
                        "audioText": "苹果太贵了",
                        "translationVi": "Táo đắt quá rồi"
                    },
                    "expectedAnswer": "苹果太贵了",
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-07-s1",
                    "lessonId": "l-hsk1-007",
                    "sortOrder": 7,
                    "kind": "sentence_shadowing",
                    "hskLevel": 1,
                    "promptVi": "Nghe và luyện đọc theo câu: '这个多少钱？'",
                    "targetContent": {
                        "hanzi": "这个多少钱？",
                        "pinyin": "Zhège duōshao qián?",
                        "translationVi": "Cái này bao nhiêu tiền?"
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
                "title": "去商店买水果 (Đi cửa hàng mua hoa quả)",
                "text": "今天下午我去商店买东西。商店里的苹果很便宜，三块钱一斤。我买了三斤苹果，一共九块钱。我很喜欢吃苹果。",
                "translationVi": "Chiều hôm nay tôi đến cửa hàng mua đồ. Táo ở trong cửa hàng rất rẻ, 3 đồng một cân. Tôi đã mua 3 cân táo, tổng cộng 9 đồng. Tôi rất thích ăn táo."
            },
            "exercises": [
                {
                    "id": "ex-07-r1",
                    "lessonId": "l-hsk1-007",
                    "sortOrder": 8,
                    "kind": "reading_true_false",
                    "hskLevel": 1,
                    "promptVi": "Đánh giá tính Đúng / Sai của nhận định sau dựa vào đoạn văn:",
                    "readingPassage": {
                        "title": "去商店买水果",
                        "text": "今天下午我去商店买东西。商店里的苹果很便宜，三块钱一斤。我买了三斤苹果，一共九块钱。我很喜欢吃苹果。"
                    },
                    "trueFalseStatement": {
                        "statement": "商店里的苹果很贵，十块钱一斤。(Táo trong cửa hàng rất đắt, 10 đồng 1 cân.)",
                        "isTrue": False,
                        "explanationVi": "Sai! Đoạn văn viết: 商店里的苹果很便宜，三块钱一斤 (Táo rất rẻ, 3 đồng 1 cân)."
                    },
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "8_mini_quiz",
            "title_vi": "Mini Quiz cuối bài",
            "quizUrl": "/lessons/l-hsk1-007/quiz"
        },
        {
            "stage": "9_srs_review",
            "title_vi": "Ôn tập củng cố (SRS Review)",
            "reviewUrl": "/review"
        }
    ]
}

# Lesson 08: Ăn uống & Gọi món (吃饭与喝水)
lesson08 = {
    "id": "l-hsk1-008",
    "slug": "hsk1-lesson-08",
    "hsk_level": 1,
    "unit_id": "u-hsk1-02",
    "title": "Bài 8: Ăn uống & Gọi món (吃饭与喝水)",
    "objective_vi": "Học cách bày tỏ mong muốn với trợ động từ 想 (xiǎng), diễn đạt sở thích với 喜欢 (xǐhuan), và gọi món ăn thức uống cơ bản.",
    "estimated_minutes": 25,
    "quality_status": "VERIFIED",
    "stages": [
        {
            "stage": "0_warmup",
            "title_vi": "Khởi động & Ngữ âm nền tảng",
            "instruction": "Luyện phát âm các từ chỉ hành động ăn uống: chī, hē, cài, fàn, shuǐ, chá, xiǎng.",
            "warmup_words": [
                {"hanzi": "吃", "pinyin": "chī", "vi": "ăn"},
                {"hanzi": "喝", "pinyin": "hē", "vi": "uống"},
                {"hanzi": "水", "pinyin": "shuǐ", "vi": "nước"},
                {"hanzi": "想", "pinyin": "xiǎng", "vi": "muốn"}
            ]
        },
        {
            "stage": "1_vocab_learn",
            "title_vi": "Học từ vựng trọng tâm",
            "vocabulary": [
                {"simplified": "吃", "pinyin": "chī", "meaning_vi": "Ăn (động từ)"},
                {"simplified": "喝", "pinyin": "hē", "meaning_vi": "Uống (động từ)"},
                {"simplified": "菜", "pinyin": "cài", "meaning_vi": "Món ăn / thức ăn / rau (danh từ)"},
                {"simplified": "米饭", "pinyin": "mǐfàn", "meaning_vi": "Cơm trắng (danh từ)"},
                {"simplified": "面条儿", "pinyin": "miàntiáor", "meaning_vi": "Mì sợi (danh từ)"},
                {"simplified": "水", "pinyin": "shuǐ", "meaning_vi": "Nước (danh từ)"},
                {"simplified": "茶", "pinyin": "chá", "meaning_vi": "Trà (danh từ)"},
                {"simplified": "想", "pinyin": "xiǎng", "meaning_vi": "Muốn / nhớ / nghĩ (trợ động từ)"},
                {"simplified": "喜欢", "pinyin": "xǐhuan", "meaning_vi": "Thích (động từ tâm lý)"}
            ]
        },
        {
            "stage": "2_vocab_practice",
            "title_vi": "Luyện tập từ vựng tương tác",
            "exercises": [
                {
                    "id": "ex-08-v1",
                    "lessonId": "l-hsk1-008",
                    "sortOrder": 1,
                    "kind": "vocab-mcq",
                    "hskLevel": 1,
                    "promptVi": "Chọn từ tiếng Trung có nghĩa là 'uống trà':",
                    "targetContent": {"hanzi": "喝茶", "pinyin": "hē chá"},
                    "options": [
                        {"id": "o1", "label": "喝茶 (hē chá)", "isCorrect": True},
                        {"id": "o2", "label": "吃菜 (chī cài)", "isCorrect": False},
                        {"id": "o3", "label": "买米饭 (mǎi mǐfàn)", "isCorrect": False},
                        {"id": "o4", "label": "喝水 (hē shuǐ)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-08-v2",
                    "lessonId": "l-hsk1-008",
                    "sortOrder": 2,
                    "kind": "matching_pairs",
                    "hskLevel": 1,
                    "promptVi": "Nối cặp từ đồ ăn đồ uống với nghĩa tiếng Việt:",
                    "pairs": [
                        {"id": "p1", "left": "米饭 (mǐfàn)", "right": "Cơm trắng"},
                        {"id": "p2", "left": "面条儿 (miàntiáor)", "right": "Mì sợi"},
                        {"id": "p3", "left": "茶 (chá)", "right": "Trà"},
                        {"id": "p4", "left": "中国菜 (Zhōngguó cài)", "right": "Món ăn Trung Quốc"}
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
                    "id": "g-08-1",
                    "titleVi": "1. Trợ động từ biểu thị ý muốn: 想 (xiǎng) + Động từ",
                    "pattern": "Chủ ngữ + 想 + V + Tân ngữ",
                    "explanationVi": "'想' đặt trước động từ biểu thị ý định, mong muốn làm việc gì. Thể phủ định là '不想'.",
                    "examples": [
                        {"hanzi": "我想吃中国菜。", "pinyin": "Wǒ xiǎng chī Zhōngguó cài.", "translationVi": "Tôi muốn ăn món Trung Quốc."},
                        {"hanzi": "你想要喝什么？", "pinyin": "Nǐ xiǎng yào hē shénme?", "translationVi": "Bạn muốn uống cái gì?"}
                    ]
                },
                {
                    "id": "g-08-2",
                    "titleVi": "2. Cấu trúc diễn đạt sở thích: 喜欢 (xǐhuan) + N / V",
                    "pattern": "Chủ ngữ + 喜欢 + Danh từ / Động từ",
                    "explanationVi": "Dùng để diễn tả sự yêu thích đối với đồ vật, món ăn hoặc hành động cụ thể. Phủ định là '不喜欢'.",
                    "examples": [
                        {"hanzi": "我喜欢喝中国茶。", "pinyin": "Wǒ xǐhuan hē Zhōngguó chá.", "translationVi": "Tôi thích uống trà Trung Quốc."},
                        {"hanzi": "他不喜欢吃面条儿。", "pinyin": "Tā bù xǐhuan chī miàntiáor.", "translationVi": "Anh ấy không thích ăn mì sợi."}
                    ]
                }
            ]
        },
        {
            "stage": "4_grammar_practice",
            "title_vi": "Luyện tập ngữ pháp tương tác",
            "exercises": [
                {
                    "id": "ex-08-g1",
                    "lessonId": "l-hsk1-008",
                    "sortOrder": 3,
                    "kind": "grammar-choice",
                    "hskLevel": 1,
                    "promptVi": "Chọn câu đúng biểu thị 'Tôi muốn uống nước':",
                    "options": [
                        {"id": "o1", "label": "我想喝水。(Wǒ xiǎng hē shuǐ.)", "isCorrect": True},
                        {"id": "o2", "label": "我想吃水。(Wǒ xiǎng chī shuǐ.)", "isCorrect": False},
                        {"id": "o3", "label": "我喜欢水喝。(Wǒ xǐhuan shuǐ hē.)", "isCorrect": False},
                        {"id": "o4", "label": "我水想喝。(Wǒ shuǐ xiǎng hē.)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-08-g2",
                    "lessonId": "l-hsk1-008",
                    "sortOrder": 4,
                    "kind": "sentence-order",
                    "hskLevel": 1,
                    "promptVi": "Sắp xếp các từ thành câu: 'Trưa nay bạn muốn ăn gì?'",
                    "orderTokens": [
                        {"id": "t1", "text": "中午", "correctIndex": 0},
                        {"id": "t2", "text": "你想", "correctIndex": 1},
                        {"id": "t3", "text": "吃", "correctIndex": 2},
                        {"id": "t4", "text": "什么", "correctIndex": 3},
                        {"id": "t5", "text": "？", "correctIndex": 4}
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
                "id": "dlg-08",
                "titleVi": "Gọi món trong quán ăn",
                "turns": [
                    {"speaker": "A", "hanzi": "中午你想吃什么？", "pinyin": "Zhōngwǔ nǐ xiǎng chī shénme?", "translationVi": "Buổi trưa bạn muốn ăn gì?"},
                    {"speaker": "B", "hanzi": "我想吃米饭和中国菜。", "pinyin": "Wǒ xiǎng chī mǐfàn hé Zhōngguó cài.", "translationVi": "Tôi muốn ăn cơm trắng và món Trung Quốc."},
                    {"speaker": "A", "hanzi": "你想喝什么？", "pinyin": "Nǐ xiǎng hē shénme?", "translationVi": "Bạn muốn uống gì?"},
                    {"speaker": "B", "hanzi": "我想喝茶，你呢？", "pinyin": "Wǒ xiǎng hē chá, nǐ ne?", "translationVi": "Tôi muốn uống trà, còn bạn?"},
                    {"speaker": "A", "hanzi": "我也喜欢喝茶。", "pinyin": "Wǒ yě xǐhuan hē chá.", "translationVi": "Tôi cũng thích uống trà."}
                ]
            },
            "exercises": [
                {
                    "id": "ex-08-d1",
                    "lessonId": "l-hsk1-008",
                    "sortOrder": 5,
                    "kind": "dialogue_roleplay",
                    "hskLevel": 1,
                    "promptVi": "Đóng vai B: Khi bạn A hỏi '你想喝什么？' (Bạn muốn uống gì?), bạn đáp thế nào?",
                    "options": [
                        {"id": "r1", "label": "我想喝茶。(Tôi muốn uống trà.)", "isCorrect": True},
                        {"id": "r2", "label": "我想买衣服。(Tôi muốn mua quần áo.)", "isCorrect": False},
                        {"id": "r3", "label": "我是学生。(Tôi là học sinh.)", "isCorrect": False}
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
                    "id": "ex-08-l1",
                    "lessonId": "l-hsk1-008",
                    "sortOrder": 6,
                    "kind": "listening_dictation",
                    "hskLevel": 1,
                    "promptVi": "Nghe âm thanh và viết lại câu bạn nghe được:",
                    "targetContent": {
                        "hanzi": "我想吃米饭",
                        "pinyin": "wǒ xiǎng chī mǐfàn",
                        "audioText": "我想吃米饭",
                        "translationVi": "Tôi muốn ăn cơm"
                    },
                    "expectedAnswer": "我想吃米饭",
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-08-s1",
                    "lessonId": "l-hsk1-008",
                    "sortOrder": 7,
                    "kind": "sentence_shadowing",
                    "hskLevel": 1,
                    "promptVi": "Nghe và phát âm theo câu: '我很喜欢吃中国菜。'",
                    "targetContent": {
                        "hanzi": "我很喜欢吃中国菜。",
                        "pinyin": "Wǒ hěn xǐhuan chī Zhōngguó cài.",
                        "translationVi": "Tôi rất thích ăn món Trung Quốc."
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
                "title": "大卫的午饭 (Bữa trưa của Đại Vĩ)",
                "text": "今天中午大卫去中国朋友家吃饭。朋友做了很多中国菜。大卫很喜欢吃米饭和中国菜。大卫不喝茶，他喜欢喝水。他们都很高兴。",
                "translationVi": "Trưa hôm nay Đại Vĩ đến nhà một người bạn Trung Quốc ăn cơm. Người bạn đã nấu rất nhiều món ăn Trung Quốc. Đại Vĩ rất thích ăn cơm và món Trung Quốc. Đại Vĩ không uống trà, cậu ấy thích uống nước. Họ đều rất vui mừng."
            },
            "exercises": [
                {
                    "id": "ex-08-r1",
                    "lessonId": "l-hsk1-008",
                    "sortOrder": 8,
                    "kind": "reading_true_false",
                    "hskLevel": 1,
                    "promptVi": "Đánh giá Đúng / Sai theo nội dung đoạn văn:",
                    "readingPassage": {
                        "title": "大卫的午饭",
                        "text": "今天中午大卫去中国朋友家吃饭。朋友做了很多中国菜。大卫很喜欢吃米饭和中国菜。大卫不喝茶，他喜欢喝水。他们都很高兴。"
                    },
                    "trueFalseStatement": {
                        "statement": "大卫喜欢喝茶，不喜欢喝水。(Đại Vĩ thích uống trà, không thích uống nước.)",
                        "isTrue": False,
                        "explanationVi": "Sai! Đoạn văn viết rõ: 大卫不喝茶，他喜欢喝水 (Đại Vĩ không uống trà, cậu ấy thích uống nước)."
                    },
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "8_mini_quiz",
            "title_vi": "Mini Quiz cuối bài",
            "quizUrl": "/lessons/l-hsk1-008/quiz"
        },
        {
            "stage": "9_srs_review",
            "title_vi": "Ôn tập củng cố (SRS Review)",
            "reviewUrl": "/review"
        }
    ]
}

# Lesson 09: Vị trí, Phương hướng & Nơi chốn (在哪儿与怎么去)
lesson09 = {
    "id": "l-hsk1-009",
    "slug": "hsk1-lesson-09",
    "hsk_level": 1,
    "unit_id": "u-hsk1-03",
    "title": "Bài 9: Vị trí, Phương hướng & Nơi chốn (在哪儿与怎么去)",
    "objective_vi": "Biết hỏi và chỉ phương hướng, vị trí với giới từ 在 (zài), đại từ nghi vấn 哪儿 (nǎr), và các từ chỉ nơi chốn (学校, 商店, 医院).",
    "estimated_minutes": 25,
    "quality_status": "VERIFIED",
    "stages": [
        {
            "stage": "0_warmup",
            "title_vi": "Khởi động & Ngữ âm nền tảng",
            "instruction": "Nghe và phát âm âm uốn lưỡi '哪儿' (nǎr) và các âm tiết chỉ phương vị: zài, qián, hòu, qù.",
            "warmup_words": [
                {"hanzi": "在", "pinyin": "zài", "vi": "ở, tại"},
                {"hanzi": "哪儿", "pinyin": "nǎr", "vi": "ở đâu"},
                {"hanzi": "前", "pinyin": "qián", "vi": "trước"},
                {"hanzi": "去", "pinyin": "qù", "vi": "đi"}
            ]
        },
        {
            "stage": "1_vocab_learn",
            "title_vi": "Học từ vựng trọng tâm",
            "vocabulary": [
                {"simplified": "在", "pinyin": "zài", "meaning_vi": "Ở / tại (giới từ / động từ)"},
                {"simplified": "哪儿", "pinyin": "nǎr", "meaning_vi": "Ở đâu (đại từ nghi vấn địa điểm)"},
                {"simplified": "前", "pinyin": "qián", "meaning_vi": "Phía trước / trước (phương vị từ)"},
                {"simplified": "后", "pinyin": "hòu", "meaning_vi": "Phía sau / sau (phương vị từ)"},
                {"simplified": "这边", "pinyin": "zhèbiān", "meaning_vi": "Bên này / phía này (đại từ chỉ vị trí)"},
                {"simplified": "那边", "pinyin": "nàbiān", "meaning_vi": "Bên kia / phía kia (đại từ chỉ vị trí)"},
                {"simplified": "学校", "pinyin": "xuéxiào", "meaning_vi": "Trường học (danh từ)"},
                {"simplified": "商店", "pinyin": "shāngdiàn", "meaning_vi": "Cửa hàng (danh từ)"},
                {"simplified": "医院", "pinyin": "yīyuàn", "meaning_vi": "Bệnh viện (danh từ)"},
                {"simplified": "去", "pinyin": "qù", "meaning_vi": "Đi đến (động từ)"}
            ]
        },
        {
            "stage": "2_vocab_practice",
            "title_vi": "Luyện tập từ vựng tương tác",
            "exercises": [
                {
                    "id": "ex-09-v1",
                    "lessonId": "l-hsk1-009",
                    "sortOrder": 1,
                    "kind": "vocab-mcq",
                    "hskLevel": 1,
                    "promptVi": "Chọn từ có nghĩa là 'trường học':",
                    "targetContent": {"hanzi": "学校", "pinyin": "xuéxiào"},
                    "options": [
                        {"id": "o1", "label": "学校 (xuéxiào)", "isCorrect": True},
                        {"id": "o2", "label": "商店 (shāngdiàn)", "isCorrect": False},
                        {"id": "o3", "label": "医院 (yīyuàn)", "isCorrect": False},
                        {"id": "o4", "label": "北京 (Běijīng)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-09-v2",
                    "lessonId": "l-hsk1-009",
                    "sortOrder": 2,
                    "kind": "matching_pairs",
                    "hskLevel": 1,
                    "promptVi": "Ghép các địa điểm và phương vị với nghĩa tiếng Việt:",
                    "pairs": [
                        {"id": "p1", "left": "医院 (yīyuàn)", "right": "Bệnh viện"},
                        {"id": "p2", "left": "商店 (shāngdiàn)", "right": "Cửa hàng"},
                        {"id": "p3", "left": "前 (qián)", "right": "Phía trước"},
                        {"id": "p4", "left": "后 (hòu)", "right": "Phía sau"}
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
                    "id": "g-09-1",
                    "titleVi": "1. Mẫu câu hỏi địa điểm: [Đối tượng] + 在哪儿？",
                    "pattern": "Chủ ngữ + 在哪儿？",
                    "explanationVi": "Dùng để hỏi vị trí của người hoặc địa điểm cụ thể.",
                    "examples": [
                        {"hanzi": "请问，李老师在哪儿？", "pinyin": "Qǐngwèn, Lǐ lǎoshī zài nǎr?", "translationVi": "Xin hỏi, cô Lý ở đâu?"},
                        {"hanzi": "他在学校。", "pinyin": "Tā zài xuéxiào.", "translationVi": "Cô ấy ở trường học."}
                    ]
                },
                {
                    "id": "g-09-2",
                    "titleVi": "2. Cấu trúc vị trí kết hợp phương vị: [Nơi chốn] + 前 / 后",
                    "pattern": "Nơi chốn / Vật thể + 前 / 后",
                    "explanationVi": "Trong tiếng Trung, phương vị từ đứng sau danh từ chỉ nơi chốn (ví dụ: 学校前 = trước trường học).",
                    "examples": [
                        {"hanzi": "医院在商店后面。", "pinyin": "Yīyuàn zài shāngdiàn hòumian.", "translationVi": "Bệnh viện ở phía sau cửa hàng."},
                        {"hanzi": "他在学校前等你。", "pinyin": "Tā zài xuéxiào qián děng nǐ.", "translationVi": "Anh ấy ở phía trước trường đợi bạn."}
                    ]
                }
            ]
        },
        {
            "stage": "4_grammar_practice",
            "title_vi": "Luyện tập ngữ pháp tương tác",
            "exercises": [
                {
                    "id": "ex-09-g1",
                    "lessonId": "l-hsk1-009",
                    "sortOrder": 3,
                    "kind": "grammar-choice",
                    "hskLevel": 1,
                    "promptVi": "Chọn câu hỏi địa điểm chính xác: 'Cửa hàng ở đâu?'",
                    "options": [
                        {"id": "o1", "label": "商店在哪儿？(Shāngdiàn zài nǎr?)", "isCorrect": True},
                        {"id": "o2", "label": "商店在什么？(Shāngdiàn zài shénme?)", "isCorrect": False},
                        {"id": "o3", "label": "在哪儿商店？(Zài nǎr shāngdiàn?)", "isCorrect": False},
                        {"id": "o4", "label": "商店几点？(Shāngdiàn jǐ diǎn?)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-09-g2",
                    "lessonId": "l-hsk1-009",
                    "sortOrder": 4,
                    "kind": "sentence-order",
                    "hskLevel": 1,
                    "promptVi": "Sắp xếp thành câu: 'Bệnh viện ở phía sau trường học.'",
                    "orderTokens": [
                        {"id": "t1", "text": "医院", "correctIndex": 0},
                        {"id": "t2", "text": "在", "correctIndex": 1},
                        {"id": "t3", "text": "学校", "correctIndex": 2},
                        {"id": "t4", "text": "后", "correctIndex": 3},
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
                "id": "dlg-09",
                "titleVi": "Hỏi đường đi bệnh viện",
                "turns": [
                    {"speaker": "A", "hanzi": "请问，医院在哪儿？", "pinyin": "Qǐngwèn, yīyuàn zài nǎr?", "translationVi": "Xin hỏi, bệnh viện ở đâu vậy?"},
                    {"speaker": "B", "hanzi": "医院在那边，在学校后面。", "pinyin": "Yīyuàn zài nàbiān, zài xuéxiào hòumian.", "translationVi": "Bệnh viện ở phía bên kia, ở đằng sau trường học."},
                    {"speaker": "A", "hanzi": "我也想去商店，商店远吗？", "pinyin": "Wǒ yě xiǎng qù shāngdiàn, shāngdiàn yuǎn ma?", "translationVi": "Tôi cũng muốn đến cửa hàng, cửa hàng có xa không?"},
                    {"speaker": "B", "hanzi": "不远，商店就在学校前。", "pinyin": "Bù yuǎn, shāngdiàn jiù zài xuéxiào qián.", "translationVi": "Không xa, cửa hàng ở ngay phía trước trường học."},
                    {"speaker": "A", "hanzi": "太好了，谢谢你！", "pinyin": "Tài hǎo le, xièxie nǐ!", "translationVi": "Tốt quá rồi, cảm ơn bạn!"}
                ]
            },
            "exercises": [
                {
                    "id": "ex-09-d1",
                    "lessonId": "l-hsk1-009",
                    "sortOrder": 5,
                    "kind": "dialogue_roleplay",
                    "hskLevel": 1,
                    "promptVi": "Đóng vai B: Khi người hỏi đường hỏi '医院在哪儿？', bạn chỉ đường thế nào?",
                    "options": [
                        {"id": "r1", "label": "医院在那边，在学校后面。(Bệnh viện ở bên kia, sau trường học.)", "isCorrect": True},
                        {"id": "r2", "label": "我不去医院。(Tôi không đi bệnh viện.)", "isCorrect": False},
                        {"id": "r3", "label": "苹果三块钱一斤。(Táo 3 đồng 1 cân.)", "isCorrect": False}
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
                    "id": "ex-09-l1",
                    "lessonId": "l-hsk1-009",
                    "sortOrder": 6,
                    "kind": "listening_dictation",
                    "hskLevel": 1,
                    "promptVi": "Lắng nghe câu thoại và nhập lại bằng tiếng Trung:",
                    "targetContent": {
                        "hanzi": "李老师在学校",
                        "pinyin": "lǐ lǎoshī zài xuéxiào",
                        "audioText": "李老师在学校",
                        "translationVi": "Cô Lý ở trường học"
                    },
                    "expectedAnswer": "李老师在学校",
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-09-s1",
                    "lessonId": "l-hsk1-009",
                    "sortOrder": 7,
                    "kind": "sentence_shadowing",
                    "hskLevel": 1,
                    "promptVi": "Nghe và phát âm theo câu hỏi đường: '请问，医院在哪儿？'",
                    "targetContent": {
                        "hanzi": "请问，医院在哪儿？",
                        "pinyin": "Qǐngwèn, yīyuàn zài nǎr?",
                        "translationVi": "Xin hỏi, bệnh viện ở đâu?"
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
                "title": "我的学校 (Trường học của tôi)",
                "text": "这是我的学校。学校很大，也很漂亮。学校前有一个大商店，我们在那儿买东西。学校后是一家大医院。我爸爸在那家医院工作。",
                "translationVi": "Đây là trường học của tôi. Trường rất to và cũng rất đẹp. Phía trước trường có một cửa hàng lớn, chúng tôi mua đồ ở đó. Phía sau trường là một bệnh viện lớn. Bố tôi làm việc ở bệnh viện đó."
            },
            "exercises": [
                {
                    "id": "ex-09-r1",
                    "lessonId": "l-hsk1-009",
                    "sortOrder": 8,
                    "kind": "reading_true_false",
                    "hskLevel": 1,
                    "promptVi": "Đánh giá Đúng / Sai theo đoạn văn:",
                    "readingPassage": {
                        "title": "我的学校",
                        "text": "这是我的学校。学校很大，也很漂亮。学校前有一个大商店，我们在那儿买东西。学校后是一家大医院。我爸爸在那家医院工作。"
                    },
                    "trueFalseStatement": {
                        "statement": "学校后面是商店，学校前面是医院。(Phía sau trường là cửa hàng, phía trước là bệnh viện.)",
                        "isTrue": False,
                        "explanationVi": "Sai! Đoạn văn ghi: 学校前有一个大商店 (Trước trường có cửa hàng), 学校后是一家大医院 (Sau trường là bệnh viện)."
                    },
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "8_mini_quiz",
            "title_vi": "Mini Quiz cuối bài",
            "quizUrl": "/lessons/l-hsk1-009/quiz"
        },
        {
            "stage": "9_srs_review",
            "title_vi": "Ôn tập củng cố (SRS Review)",
            "reviewUrl": "/review"
        }
    ]
}

# Lesson 10: Thói quen & Kỹ năng hàng ngày (日常与做事情)
lesson10 = {
    "id": "l-hsk1-010",
    "slug": "hsk1-lesson-10",
    "hsk_level": 1,
    "unit_id": "u-hsk1-03",
    "title": "Bài 10: Thói quen & Kỹ năng hàng ngày (日常与做事情)",
    "objective_vi": "Nắm vững năng nguyện động từ 会 (huì) và 能 (néng), diễn đạt kỹ năng nói tiếng Trung, viết chữ Hán và các thói quen học tập hàng ngày.",
    "estimated_minutes": 25,
    "quality_status": "VERIFIED",
    "stages": [
        {
            "stage": "0_warmup",
            "title_vi": "Khởi động & Ngữ âm nền tảng",
            "instruction": "Luyện các động từ chỉ giác quan và kỹ năng ngôn ngữ: zuò, kàn, xiě, dú, tīng, huì, néng.",
            "warmup_words": [
                {"hanzi": "看", "pinyin": "kàn", "vi": "nhìn, xem"},
                {"hanzi": "写", "pinyin": "xiě", "vi": "viết"},
                {"hanzi": "会", "pinyin": "huì", "vi": "biết (kỹ năng)"},
                {"hanzi": "能", "pinyin": "néng", "vi": "có thể"}
            ]
        },
        {
            "stage": "1_vocab_learn",
            "title_vi": "Học từ vựng trọng tâm",
            "vocabulary": [
                {"simplified": "做", "pinyin": "zuò", "meaning_vi": "Làm (động từ)"},
                {"simplified": "看", "pinyin": "kàn", "meaning_vi": "Xem / nhìn / đọc sách (động từ)"},
                {"simplified": "写", "pinyin": "xiě", "meaning_vi": "Viết (động từ)"},
                {"simplified": "汉字", "pinyin": "Hànzì", "meaning_vi": "Chữ Hán (danh từ)"},
                {"simplified": "读", "pinyin": "dú", "meaning_vi": "Đọc (động từ)"},
                {"simplified": "听", "pinyin": "tīng", "meaning_vi": "Nghe (động từ)"},
                {"simplified": "会", "pinyin": "huì", "meaning_vi": "Biết (làm được nhờ học tập rèn luyện)"},
                {"simplified": "能", "pinyin": "néng", "meaning_vi": "Có thể (có năng lực / điều kiện cho phép)"}
            ]
        },
        {
            "stage": "2_vocab_practice",
            "title_vi": "Luyện tập từ vựng tương tác",
            "exercises": [
                {
                    "id": "ex-10-v1",
                    "lessonId": "l-hsk1-010",
                    "sortOrder": 1,
                    "kind": "vocab-mcq",
                    "hskLevel": 1,
                    "promptVi": "Chọn từ đúng với nghĩa 'viết chữ Hán':",
                    "targetContent": {"hanzi": "写汉字", "pinyin": "xiě Hànzì"},
                    "options": [
                        {"id": "o1", "label": "写汉字 (xiě Hànzì)", "isCorrect": True},
                        {"id": "o2", "label": "读汉字 (dú Hànzì)", "isCorrect": False},
                        {"id": "o3", "label": "听汉字 (tīng Hànzì)", "isCorrect": False},
                        {"id": "o4", "label": "做汉字 (zuò Hànzì)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-10-v2",
                    "lessonId": "l-hsk1-010",
                    "sortOrder": 2,
                    "kind": "matching_pairs",
                    "hskLevel": 1,
                    "promptVi": "Ghép các động từ kỹ năng với nghĩa tương ứng:",
                    "pairs": [
                        {"id": "p1", "left": "听 (tīng)", "right": "Nghe"},
                        {"id": "p2", "left": "读 (dú)", "right": "Đọc"},
                        {"id": "p3", "left": "写 (xiě)", "right": "Viết"},
                        {"id": "p4", "left": "看 (kàn)", "right": "Xem / Nhìn"}
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
                    "id": "g-10-1",
                    "titleVi": "1. Năng nguyện động từ: 会 (huì) + V",
                    "pattern": "Chủ ngữ + 会 + Động từ + Tân ngữ",
                    "explanationVi": "'会' biểu thị khả năng làm được một việc gì đó thông qua học tập, rèn luyện (như biết nói tiếng Trung, biết bơi, biết nấu ăn). Phủ định là '不会'.",
                    "examples": [
                        {"hanzi": "我会说汉语。", "pinyin": "Wǒ huì shuō Hànyǔ.", "translationVi": "Tôi biết nói tiếng Trung."},
                        {"hanzi": "你会写汉字吗？", "pinyin": "Nǐ huì xiě Hànzì ma?", "translationVi": "Bạn biết viết chữ Hán không?"}
                    ]
                },
                {
                    "id": "g-10-2",
                    "titleVi": "2. Phân biệt 会 (huì) và 能 (néng)",
                    "pattern": "会 (học mà biết) vs 能 (điều kiện/thời cơ cho phép)",
                    "explanationVi": "'会' nhấn mạnh kỹ năng có được do học tập. '能' nhấn mạnh năng lực tự nhiên hoặc điều kiện khách quan cho phép thực hiện hành động.",
                    "examples": [
                        {"hanzi": "我今天生病了，不能去上学。", "pinyin": "Wǒ jīntiān shēngbìng le, bù néng qù shàngxué.", "translationVi": "Hôm nay tôi ốm rồi, không thể đi học được."},
                        {"hanzi": "你能来我家吗？", "pinyin": "Nǐ néng lái wǒ jiā ma?", "translationVi": "Bạn có thể đến nhà tôi không?"}
                    ]
                }
            ]
        },
        {
            "stage": "4_grammar_practice",
            "title_vi": "Luyện tập ngữ pháp tương tác",
            "exercises": [
                {
                    "id": "ex-10-g1",
                    "lessonId": "l-hsk1-010",
                    "sortOrder": 3,
                    "kind": "grammar-choice",
                    "hskLevel": 1,
                    "promptVi": "Điền từ thích hợp: '我学习了一年，我____说汉语。' (Tôi học 1 năm rồi, tôi biết nói tiếng Trung.)",
                    "options": [
                        {"id": "o1", "label": "会 (huì)", "isCorrect": True, "explanationVi": "Kỹ năng ngôn ngữ có được qua học tập dùng '会'."},
                        {"id": "o2", "label": "想 (xiǎng)", "isCorrect": False},
                        {"id": "o3", "label": "在 (zài)", "isCorrect": False},
                        {"id": "o4", "label": "很 (hěn)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-10-g2",
                    "lessonId": "l-hsk1-010",
                    "sortOrder": 4,
                    "kind": "sentence-order",
                    "hskLevel": 1,
                    "promptVi": "Sắp xếp thành câu hoàn chỉnh: 'Bạn biết viết chữ Hán này không?'",
                    "orderTokens": [
                        {"id": "t1", "text": "你会", "correctIndex": 0},
                        {"id": "t2", "text": "写", "correctIndex": 1},
                        {"id": "t3", "text": "这个", "correctIndex": 2},
                        {"id": "t4", "text": "汉字", "correctIndex": 3},
                        {"id": "t5", "text": "吗？", "correctIndex": 4}
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
                "id": "dlg-10",
                "titleVi": "Nói chuyện về học tiếng Trung",
                "turns": [
                    {"speaker": "A", "hanzi": "你会说汉语吗？", "pinyin": "Nǐ huì shuō Hànyǔ ma?", "translationVi": "Bạn biết nói tiếng Trung không?"},
                    {"speaker": "B", "hanzi": "我会说一点儿汉语。", "pinyin": "Wǒ huì shuō yīdiǎnr Hànyǔ.", "translationVi": "Tôi biết nói một chút tiếng Trung."},
                    {"speaker": "A", "hanzi": "你会写汉字吗？", "pinyin": "Nǐ huì xiě Hànzì ma?", "translationVi": "Bạn biết viết chữ Hán không?"},
                    {"speaker": "B", "hanzi": "我会读，但不会写。汉字太难了！", "pinyin": "Wǒ huì dú, dàn bù huì xiě. Hànzì tài nán le!", "translationVi": "Tôi biết đọc, nhưng không biết viết. Chữ Hán khó quá!"},
                    {"speaker": "A", "hanzi": "没关系，我能教你。", "pinyin": "Méi guānxi, wǒ néng jiāo nǐ.", "translationVi": "Không sao đâu, tôi có thể dạy bạn."}
                ]
            },
            "exercises": [
                {
                    "id": "ex-10-d1",
                    "lessonId": "l-hsk1-010",
                    "sortOrder": 5,
                    "kind": "dialogue_roleplay",
                    "hskLevel": 1,
                    "promptVi": "Đóng vai B: Khi bạn A hỏi '你会说汉语吗？', bạn khiêm tốn trả lời thế nào?",
                    "options": [
                        {"id": "r1", "label": "我会说一点儿汉语。(Tôi biết nói một chút tiếng Trung.)", "isCorrect": True},
                        {"id": "r2", "label": "我不喜欢吃米饭。(Tôi không thích ăn cơm.)", "isCorrect": False},
                        {"id": "r3", "label": "我在医院工作。(Tôi làm việc ở bệnh viện.)", "isCorrect": False}
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
                    "id": "ex-10-l1",
                    "lessonId": "l-hsk1-010",
                    "sortOrder": 6,
                    "kind": "listening_dictation",
                    "hskLevel": 1,
                    "promptVi": "Nghe đoạn âm thanh và nhập chữ Hán hoặc Pinyin bạn nghe được:",
                    "targetContent": {
                        "hanzi": "我会写汉字",
                        "pinyin": "wǒ huì xiě Hànzì",
                        "audioText": "我会写汉字",
                        "translationVi": "Tôi biết viết chữ Hán"
                    },
                    "expectedAnswer": "我会写汉字",
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-10-s1",
                    "lessonId": "l-hsk1-010",
                    "sortOrder": 7,
                    "kind": "sentence_shadowing",
                    "hskLevel": 1,
                    "promptVi": "Nghe và phát âm theo câu: '我会说汉语。'",
                    "targetContent": {
                        "hanzi": "我会说汉语。",
                        "pinyin": "Wǒ huì shuō Hànyǔ.",
                        "translationVi": "Tôi biết nói tiếng Trung."
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
                "title": "学习汉语 (Học tiếng Trung)",
                "text": "大卫是美国人。他在北京学习汉语。他的老师是中国人，非常好。大卫每天看书、写汉字、听中文歌。现在他会说汉语，也会写很多汉字。",
                "translationVi": "Đại Vĩ là người Mỹ. Cậu ấy học tiếng Trung ở Bắc Kinh. Thầy giáo của cậu ấy là người Trung Quốc, rất tốt. Đại Vĩ mỗi ngày đều đọc sách, viết chữ Hán, nghe bài hát tiếng Trung. Bây giờ cậu ấy biết nói tiếng Trung, cũng biết viết rất nhiều chữ Hán."
            },
            "exercises": [
                {
                    "id": "ex-10-r1",
                    "lessonId": "l-hsk1-010",
                    "sortOrder": 8,
                    "kind": "reading_true_false",
                    "hskLevel": 1,
                    "promptVi": "Đánh giá Đúng / Sai theo đoạn văn:",
                    "readingPassage": {
                        "title": "学习汉语",
                        "text": "大卫是美国人。他在北京学习汉语。他的老师是中国人，非常好。大卫每天看书、写汉字、听中文歌。现在他会说汉语，也会写很多汉字。"
                    },
                    "trueFalseStatement": {
                        "statement": "大卫不会说汉语，也不会写汉字。(Đại Vĩ không biết nói tiếng Trung cũng không biết viết chữ Hán.)",
                        "isTrue": False,
                        "explanationVi": "Sai! Đoạn văn viết rõ: 现在他会说汉语，也会写很多汉字 (Bây giờ cậu ấy biết nói tiếng Trung và cũng biết viết rất nhiều chữ Hán)."
                    },
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "8_mini_quiz",
            "title_vi": "Mini Quiz cuối bài",
            "quizUrl": "/lessons/l-hsk1-010/quiz"
        },
        {
            "stage": "9_srs_review",
            "title_vi": "Ôn tập củng cố (SRS Review)",
            "reviewUrl": "/review"
        }
    ]
}

# Unit 1 Checkpoint: Tổng ôn & Đánh giá Chặng 1 (Unit 1 Review Checkpoint)
checkpoint01 = {
    "id": "l-hsk1-cp01",
    "slug": "hsk1-checkpoint-01",
    "hsk_level": 1,
    "unit_id": "u-hsk1-01",
    "title": "Chặng 1: Tổng ôn & Đánh giá Nền tảng (Bài 1–4)",
    "objective_vi": "Củng cố toàn bộ kiến thức Chặng 1: Chào hỏi, xưng hô họ tên, quốc tịch, con số 0–100, tuổi tác và các mẫu câu 是/不是, 吗, 谁.",
    "estimated_minutes": 30,
    "quality_status": "VERIFIED",
    "stages": [
        {
            "stage": "0_warmup",
            "title_vi": "Khởi động & Ôn tập Ngữ âm Chặng 1",
            "instruction": "Ôn tập quy tắc biến điệu hai thanh 3 (你好 -> ní hǎo) và biến điệu của chữ '不' (不是 -> bú shì).",
            "warmup_words": [
                {"hanzi": "你好", "pinyin": "nǐhǎo", "vi": "xin chào (đọc ní hǎo)"},
                {"hanzi": "不是", "pinyin": "bùshì", "vi": "không phải (đọc bú shì)"},
                {"hanzi": "谢谢", "pinyin": "xièxie", "vi": "cảm ơn"},
                {"hanzi": "再见", "pinyin": "zàijiàn", "vi": "tạm biệt"}
            ]
        },
        {
            "stage": "1_vocab_learn",
            "title_vi": "Tổng kết từ vựng trọng điểm Chặng 1",
            "vocabulary": [
                {"simplified": "你好", "pinyin": "nǐhǎo", "meaning_vi": "Xin chào"},
                {"simplified": "谢谢", "pinyin": "xièxie", "meaning_vi": "Cảm ơn"},
                {"simplified": "不客气", "pinyin": "bù kèqi", "meaning_vi": "Đừng khách sáo / không có chi"},
                {"simplified": "对不起", "pinyin": "duìbuqǐ", "meaning_vi": "Xin lỗi"},
                {"simplified": "没关系", "pinyin": "méi guānxi", "meaning_vi": "Không sao đâu"},
                {"simplified": "再见", "pinyin": "zàijiàn", "meaning_vi": "Tạm biệt"},
                {"simplified": "中国", "pinyin": "Zhōngguó", "meaning_vi": "Trung Quốc"},
                {"simplified": "美国", "pinyin": "Měiguó", "meaning_vi": "Mỹ"},
                {"simplified": "老师", "pinyin": "lǎoshī", "meaning_vi": "Thầy cô giáo"},
                {"simplified": "学生", "pinyin": "xuésheng", "meaning_vi": "Học sinh / sinh viên"}
            ]
        },
        {
            "stage": "2_vocab_practice",
            "title_vi": "Luyện tập nối cặp tổng hợp Chặng 1",
            "exercises": [
                {
                    "id": "ex-cp1-v1",
                    "lessonId": "l-hsk1-cp01",
                    "sortOrder": 1,
                    "kind": "matching_pairs",
                    "hskLevel": 1,
                    "promptVi": "Ghép cặp câu chào / đáp lễ tương ứng:",
                    "pairs": [
                        {"id": "p1", "left": "谢谢 (xièxie)", "right": "不客气 (bù kèqi)"},
                        {"id": "p2", "left": "对不起 (duìbuqǐ)", "right": "没关系 (méi guānxi)"},
                        {"id": "p3", "left": "你好 (nǐhǎo)", "right": "你好 (nǐhǎo)"},
                        {"id": "p4", "left": "再见 (zàijiàn)", "right": "再见 (zàijiàn)"}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "3_grammar_learn",
            "title_vi": "Hệ thống hóa ngữ pháp cốt lõi Chặng 1",
            "grammar_points": [
                {
                    "id": "g-cp1-1",
                    "titleVi": "1. Mẫu câu phán đoán: S + 是 / 不是 + O",
                    "pattern": "Chủ ngữ + 是/不是 + Danh từ",
                    "explanationVi": "Dùng '是' khẳng định danh tính hoặc quốc tịch, phủ định bằng '不是'.",
                    "examples": [
                        {"hanzi": "我是学生，不是老师。", "pinyin": "Wǒ shì xuésheng, bú shì lǎoshī.", "translationVi": "Tôi là học sinh, không phải giáo viên."}
                    ]
                },
                {
                    "id": "g-cp1-2",
                    "titleVi": "2. Câu hỏi nghi vấn có / không với '吗' (ma)",
                    "pattern": "Câu khẳng định + 吗？",
                    "explanationVi": "Thêm trợ từ '吗' vào cuối câu trần thuật để biến thành câu hỏi Đúng / Sai.",
                    "examples": [
                        {"hanzi": "你是中国人吗？", "pinyin": "Nǐ shì Zhōngguó rén ma?", "translationVi": "Bạn là người Trung Quốc phải không?"}
                    ]
                }
            ]
        },
        {
            "stage": "4_grammar_practice",
            "title_vi": "Luyện tập ngữ pháp Chặng 1",
            "exercises": [
                {
                    "id": "ex-cp1-g1",
                    "lessonId": "l-hsk1-cp01",
                    "sortOrder": 2,
                    "kind": "sentence-order",
                    "hskLevel": 1,
                    "promptVi": "Sắp xếp thành câu hỏi: 'Bạn có phải là giáo viên tiếng Trung không?'",
                    "orderTokens": [
                        {"id": "t1", "text": "你是", "correctIndex": 0},
                        {"id": "t2", "text": "汉语", "correctIndex": 1},
                        {"id": "t3", "text": "老师", "correctIndex": 2},
                        {"id": "t4", "text": "吗", "correctIndex": 3},
                        {"id": "t5", "text": "？", "correctIndex": 4}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "5_dialogue_interactive",
            "title_vi": "Hội thoại đối đáp tổng hợp",
            "dialogue": {
                "id": "dlg-cp01",
                "titleVi": "Gặp gỡ và làm quen tại lớp học",
                "turns": [
                    {"speaker": "A", "hanzi": "你好！请问你叫什么名字？", "pinyin": "Nǐ hǎo! Qǐngwèn nǐ jiào shénme míngzi?", "translationVi": "Xin chào! Xin hỏi bạn tên là gì?"},
                    {"speaker": "B", "hanzi": "你好！我叫大卫。你是中国人吗？", "pinyin": "Nǐ hǎo! Wǒ jiào Dàwěi. Nǐ shì Zhōngguó rén ma?", "translationVi": "Xin chào! Tôi tên là Đại Vĩ. Bạn là người Trung Quốc phải không?"},
                    {"speaker": "A", "hanzi": "不是，我是越南人。我是学生，你呢？", "pinyin": "Bú shì, wǒ shì Yuènán rén. Wǒ shì xuésheng, nǐ ne?", "translationVi": "Không phải, tôi là người Việt Nam. Tôi là học sinh, còn bạn?"},
                    {"speaker": "B", "hanzi": "我也是学生。很高兴认识你！", "pinyin": "Wǒ yě shì xuésheng. Hěn gāoxìng rènshi nǐ!", "translationVi": "Tôi cũng là học sinh. Rất vui được quen biết bạn!"}
                ]
            },
            "exercises": [
                {
                    "id": "ex-cp1-d1",
                    "lessonId": "l-hsk1-cp01",
                    "sortOrder": 3,
                    "kind": "dialogue_roleplay",
                    "hskLevel": 1,
                    "promptVi": "Đóng vai B: Khi nghe '很高兴认识你！', bạn đáp lại thế nào?",
                    "options": [
                        {"id": "r1", "label": "我也很高兴认识你！(Tôi cũng rất vui được quen bạn!)", "isCorrect": True},
                        {"id": "r2", "label": "对不起！(Xin lỗi!)", "isCorrect": False},
                        {"id": "r3", "label": "五块钱一斤。(Năm đồng 1 cân.)", "isCorrect": False}
                    ],
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "6_listening_speaking",
            "title_vi": "Luyện Nghe & Nói Chặng 1",
            "exercises": [
                {
                    "id": "ex-cp1-l1",
                    "lessonId": "l-hsk1-cp01",
                    "sortOrder": 4,
                    "kind": "listening_dictation",
                    "hskLevel": 1,
                    "promptVi": "Nghe và nhập câu chào quen thuộc:",
                    "targetContent": {
                        "hanzi": "很高兴认识你",
                        "pinyin": "hěn gāoxìng rènshi nǐ",
                        "audioText": "很高兴认识你",
                        "translationVi": "Rất vui được quen biết bạn"
                    },
                    "expectedAnswer": "很高兴认识你",
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                },
                {
                    "id": "ex-cp1-s1",
                    "lessonId": "l-hsk1-cp01",
                    "sortOrder": 5,
                    "kind": "sentence_shadowing",
                    "hskLevel": 1,
                    "promptVi": "Luyện phát âm câu: '我是学生。'",
                    "targetContent": {
                        "hanzi": "我是学生。",
                        "pinyin": "Wǒ shì xuésheng.",
                        "translationVi": "Tôi là học sinh."
                    },
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "7_reading_comprehension",
            "title_vi": "Đọc hiểu Chặng 1",
            "passage": {
                "title": "自我介绍 (Tự giới thiệu bản thân)",
                "text": "大家好！我叫王朋，我是中国人。我是汉语老师。我今年二十八岁。很高兴在学校认识大家。",
                "translationVi": "Chào mọi người! Tôi tên là Vương Bằng, tôi là người Trung Quốc. Tôi là giáo viên tiếng Trung. Năm nay tôi 28 tuổi. Rất vui được gặp gỡ mọi người tại trường học."
            },
            "exercises": [
                {
                    "id": "ex-cp1-r1",
                    "lessonId": "l-hsk1-cp01",
                    "sortOrder": 6,
                    "kind": "reading_true_false",
                    "hskLevel": 1,
                    "promptVi": "Đánh giá Đúng / Sai theo đoạn văn:",
                    "readingPassage": {
                        "title": "自我介绍",
                        "text": "大家好！我叫王朋，我是中国人。我是汉语老师。我今年二十八岁。很高兴在学校认识大家。"
                    },
                    "trueFalseStatement": {
                        "statement": "王朋是学生，不是老师。(Vương Bằng là học sinh, không phải giáo viên.)",
                        "isTrue": False,
                        "explanationVi": "Sai! Đoạn văn ghi rõ: 我是汉语老师 (Tôi là giáo viên tiếng Trung)."
                    },
                    "qualityStatus": "VERIFIED",
                    "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                }
            ]
        },
        {
            "stage": "8_mini_quiz",
            "title_vi": "Đánh giá Năng lực Chặng 1",
            "quizUrl": "/lessons/l-hsk1-cp01/quiz"
        },
        {
            "stage": "9_srs_review",
            "title_vi": "Ôn tập SRS Chặng 1",
            "reviewUrl": "/review"
        }
    ]
}

# Write files to content/hsk_library
files = [
    ("content/hsk_library/hsk1_lesson_07.json", lesson07),
    ("content/hsk_library/hsk1_lesson_08.json", lesson08),
    ("content/hsk_library/hsk1_lesson_09.json", lesson09),
    ("content/hsk_library/hsk1_lesson_10.json", lesson10),
    ("content/hsk_library/hsk1_checkpoint_01.json", checkpoint01),
]

for path, data in files:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Wrote", path)
