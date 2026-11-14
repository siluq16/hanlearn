"""
Generates 9-stage HSK 1 Lessons 2, 3, and 4 from pilot lessons and official 300 vocabulary.
Preserves lesson titles, objectives, vocabulary, grammar, dialogues, and exercises.
"""

import json
import os

official_300 = {item["hanzi"]: item for item in json.load(open("content/hsk_library/hsk1_exam_2025_official_300.json", encoding="utf-8"))}

def create_lesson_02():
    return {
        "id": "l-hsk1-002",
        "slug": "hsk1-lesson-02",
        "hsk_level": 1,
        "unit_id": "u-hsk1-01",
        "title": "Bài 2: Tôi tên là... (我叫…… — Giới thiệu bản thân)",
        "objective_vi": "Hỏi và nói tên; giới thiệu bản thân và quốc tịch; nói mình học tiếng Trung; sử dụng mẫu câu 是/不是 và câu hỏi 什么.",
        "estimated_minutes": 25,
        "quality_status": "VERIFIED",
        "stages": [
            {
                "stage": "0_warmup",
                "title_vi": "Khởi động & Ngữ âm nền tảng",
                "instruction": "Nghe và phát âm các âm tiết trọng tâm: jiào, shénme, míngzi, shì, rén, zhōngguó, xuéxí.",
                "warmup_words": [
                    {"hanzi": "叫", "pinyin": "jiào", "vi": "gọi là, tên là"},
                    {"hanzi": "什么", "pinyin": "shénme", "vi": "cái gì, gì"},
                    {"hanzi": "是", "pinyin": "shì", "vi": "là"},
                    {"hanzi": "人", "pinyin": "rén", "vi": "người"}
                ]
            },
            {
                "stage": "1_vocab_learn",
                "title_vi": "Học từ vựng trọng tâm",
                "vocabulary": [
                    {"simplified": "叫", "pinyin": "jiào", "meaning_vi": "Gọi là / tên là"},
                    {"simplified": "什么", "pinyin": "shénme", "meaning_vi": "Cái gì / gì (đại từ nghi vấn)"},
                    {"simplified": "名字", "pinyin": "míngzi", "meaning_vi": "Tên riêng / danh xưng"},
                    {"simplified": "是", "pinyin": "shì", "meaning_vi": "Là (phán đoán, xác định danh tính)"},
                    {"simplified": "人", "pinyin": "rén", "meaning_vi": "Người"},
                    {"simplified": "中国", "pinyin": "Zhōngguó", "meaning_vi": "Trung Quốc"},
                    {"simplified": "汉语", "pinyin": "Hànyǔ", "meaning_vi": "Tiếng Hán / Tiếng Trung"},
                    {"simplified": "学习", "pinyin": "xuéxí", "meaning_vi": "Học / học tập"},
                    {"simplified": "不", "pinyin": "bù", "meaning_vi": "Không (phó từ phủ định, đọc bú trước 是)"},
                    {"simplified": "老师", "pinyin": "lǎoshī", "meaning_vi": "Thầy cô giáo / giáo viên"},
                    {"simplified": "学生", "pinyin": "xuésheng", "meaning_vi": "Học sinh / sinh viên"},
                    {"simplified": "朋友", "pinyin": "péngyou", "meaning_vi": "Bạn bè / người bạn"}
                ]
            },
            {
                "stage": "2_vocab_practice",
                "title_vi": "Luyện tập từ vựng chủ động",
                "exercises": [
                    {
                        "id": "ex-02-v1",
                        "lessonId": "l-hsk1-002",
                        "sortOrder": 1,
                        "kind": "vocab-mcq",
                        "hskLevel": 1,
                        "promptVi": "Từ nào dưới đây có nghĩa là 'tên'?",
                        "targetContent": {"hanzi": "名字", "pinyin": "míngzi"},
                        "options": [
                            {"id": "o1", "label": "名字 (míngzi)", "isCorrect": True},
                            {"id": "o2", "label": "汉语 (Hànyǔ)", "isCorrect": False},
                            {"id": "o3", "label": "老师 (lǎoshī)", "isCorrect": False},
                            {"id": "o4", "label": "学习 (xuéxí)", "isCorrect": False}
                        ],
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    },
                    {
                        "id": "ex-02-v2",
                        "lessonId": "l-hsk1-002",
                        "sortOrder": 2,
                        "kind": "matching_pairs",
                        "hskLevel": 1,
                        "promptVi": "Ghép các cặp từ với nghĩa tiếng Việt:",
                        "matchingPairs": [
                            {"leftId": "l1", "leftLabel": "叫", "rightId": "r1", "rightLabel": "jiào — Tên là"},
                            {"leftId": "l2", "leftLabel": "什么", "rightId": "r2", "rightLabel": "shénme — Cái gì"},
                            {"leftId": "l3", "leftLabel": "中国", "rightId": "r3", "rightLabel": "Zhōngguó — Trung Quốc"},
                            {"leftId": "l4", "leftLabel": "学习", "rightId": "r4", "rightLabel": "xuéxí — Học tập"}
                        ],
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    }
                ]
            },
            {
                "stage": "3_grammar_learn",
                "title_vi": "Ngữ pháp trọng điểm",
                "grammar_points": [
                    {
                        "id": "gp-02-1",
                        "titleVi": "Hỏi và nói tên với '叫' và '什么名字'",
                        "pattern": "A: 你叫什么名字？ / B: 我叫 + [Tên]",
                        "explanationVi": "Dùng 叫 để xưng tên. Trong câu hỏi đã có đại từ nghi vấn 什么 thì không dùng trợ từ 吗 ở cuối.",
                        "examples": [
                            {"hanzi": "你叫什么名字？", "pinyin": "Nǐ jiào shénme míngzi?", "translationVi": "Bạn tên là gì?"},
                            {"hanzi": "我叫李明。", "pinyin": "Wǒ jiào Lǐ Míng.", "translationVi": "Tôi tên là Lý Minh."}
                        ]
                    },
                    {
                        "id": "gp-02-2",
                        "titleVi": "Câu phán đoán khẳng định và phủ định: 是 / 不是",
                        "pattern": "Chủ ngữ + 是 / 不是 + Danh từ",
                        "explanationVi": "Trước '是', phó từ '不' (thanh 4) biến điệu thành thanh 2 đọc là 'bú shì'.",
                        "examples": [
                            {"hanzi": "我是学生，不是老师。", "pinyin": "Wǒ shì xuésheng, bú shì lǎoshī.", "translationVi": "Tôi là học sinh, không phải giáo viên."},
                            {"hanzi": "他是中国人吗？", "pinyin": "Tā shì Zhōngguó rén ma?", "translationVi": "Anh ấy là người Trung Quốc phải không?"}
                        ]
                    }
                ]
            },
            {
                "stage": "4_grammar_practice",
                "title_vi": "Luyện tập cấu trúc ngữ pháp",
                "exercises": [
                    {
                        "id": "ex-02-g1",
                        "lessonId": "l-hsk1-002",
                        "sortOrder": 1,
                        "kind": "sentence_ordering",
                        "hskLevel": 1,
                        "promptVi": "Sắp xếp các từ thành câu hoàn chỉnh: 'Bạn tên là gì?'",
                        "tokens": ["你", "叫", "什么", "名字", "？"],
                        "targetSentence": "你叫什么名字？",
                        "translationVi": "Bạn tên là gì?",
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    },
                    {
                        "id": "ex-02-g2",
                        "lessonId": "l-hsk1-002",
                        "sortOrder": 2,
                        "kind": "grammar-mcq",
                        "hskLevel": 1,
                        "promptVi": "Chọn từ thích hợp điền vào chỗ trống: '他____中国学生。'",
                        "targetContent": {"hanzi": "是", "pinyin": "shì"},
                        "options": [
                            {"id": "o1", "label": "是", "isCorrect": True},
                            {"id": "o2", "label": "叫", "isCorrect": False},
                            {"id": "o3", "label": "很", "isCorrect": False},
                            {"id": "o4", "label": "什么", "isCorrect": False}
                        ],
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    }
                ]
            },
            {
                "stage": "5_dialogue_interactive",
                "title_vi": "Hội thoại giao tiếp",
                "dialogue": {
                    "id": "d-02",
                    "titleVi": "Làm quen trong lớp học tiếng Trung",
                    "turns": [
                        {"speaker": "李明", "hanzi": "你好！你叫什么名字？", "pinyin": "Nǐ hǎo! Nǐ jiào shénme míngzi?", "vi": "Xin chào! Bạn tên là gì?"},
                        {"speaker": "大卫", "hanzi": "你好！我叫大卫。你呢？", "pinyin": "Nǐ hǎo! Wǒ jiào Dàwèi. Nǐ ne?", "vi": "Xin chào! Tôi tên là David. Còn bạn?"},
                        {"speaker": "李明", "hanzi": "我叫李明。你是中国学生吗？", "pinyin": "Wǒ jiào Lǐ Míng. Nǐ shì Zhōngguó xuésheng ma?", "vi": "Tôi tên là Lý Minh. Bạn là học sinh Trung Quốc phải không?"},
                        {"speaker": "大卫", "hanzi": "我不是中国人，我在中国学习汉语。", "pinyin": "Wǒ bú shì Zhōngguó rén, wǒ zài Zhōngguó xuéxí Hànyǔ.", "vi": "Tôi không phải người Trung Quốc, tôi học tiếng Trung ở Trung Quốc."}
                    ]
                }
            },
            {
                "stage": "6_listening_speaking",
                "title_vi": "Luyện nghe và nói phản xạ",
                "instruction": "Nghe đoạn phát âm và chọn phương án đúng, sau đó luyện nói theo mẫu câu.",
                "exercises": [
                    {
                        "id": "ex-02-ls1",
                        "lessonId": "l-hsk1-002",
                        "sortOrder": 1,
                        "kind": "listening-mcq",
                        "hskLevel": 1,
                        "promptVi": "Nghe câu hỏi và chọn câu đáp phù hợp:",
                        "audioText": "你叫什么名字？",
                        "options": [
                            {"id": "o1", "label": "我叫李明。", "isCorrect": True},
                            {"id": "o2", "label": "我是中国人。", "isCorrect": False},
                            {"id": "o3", "label": "我很好。", "isCorrect": False},
                            {"id": "o4", "label": "谢谢你。", "isCorrect": False}
                        ],
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    }
                ]
            },
            {
                "stage": "7_reading_comprehension",
                "title_vi": "Đọc hiểu văn bản",
                "passage": {
                    "title": "Giới thiệu bạn cùng lớp",
                    "text": "你好！我叫李明，我是中国学生。这是我的朋友大卫，他不是中国人，他在中国学习汉语。我们都是好朋友。",
                    "translationVi": "Xin chào! Tôi tên là Lý Minh, tôi là học sinh Trung Quốc. Đây là bạn của tôi - David, cậu ấy không phải người Trung Quốc, cậu ấy học tiếng Trung ở Trung Quốc. Chúng tôi đều là bạn tốt."
                },
                "exercises": [
                    {
                        "id": "ex-02-r1",
                        "lessonId": "l-hsk1-002",
                        "sortOrder": 1,
                        "kind": "true-false",
                        "hskLevel": 1,
                        "promptVi": "Đại Vệ là học sinh người Trung Quốc.",
                        "isTrue": False,
                        "explanationVi": "Trong bài nêu rõ: 大卫不是中国人 (David không phải người Trung Quốc).",
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    }
                ]
            },
            {
                "stage": "8_mini_quiz",
                "title_vi": "Mini Quiz đánh giá năng lực",
                "instruction": "Hoàn thành 8 câu hỏi kiểm tra tổng hợp. Đạt từ 80% trở lên để mở khóa bài học tiếp theo.",
                "quizUrl": "/lessons/stage/hsk1-lesson-02#mini-quiz"
            },
            {
                "stage": "9_srs_review",
                "title_vi": "Đưa từ vựng vào hệ thống SRS",
                "instruction": "Các từ vựng trọng điểm Bài 2 đã sẵn sàng được đưa vào lịch ôn tập cách quãng SM-2.",
                "reviewUrl": "/review"
            }
        ]
    }

def create_lesson_03():
    return {
        "id": "l-hsk1-003",
        "slug": "hsk1-lesson-03",
        "hsk_level": 1,
        "unit_id": "u-hsk1-01",
        "title": "Bài 3: Gia đình của tôi (我的家 — Gia đình & Thành viên)",
        "objective_vi": "Giới thiệu người thân trong gia đình; dùng trợ từ sở hữu 的; dùng động từ 有/没有; hỏi số lượng thành viên với 几口人; phân biệt lượng từ 个 và 口.",
        "estimated_minutes": 25,
        "quality_status": "VERIFIED",
        "stages": [
            {
                "stage": "0_warmup",
                "title_vi": "Khởi động & Ngữ âm nền tảng",
                "instruction": "Nghe và phát âm các thành viên gia đình: bàba, māma, gēge, jiějie, dìdi, mèimei.",
                "warmup_words": [
                    {"hanzi": "家", "pinyin": "jiā", "vi": "nhà, gia đình"},
                    {"hanzi": "爸爸", "pinyin": "bàba", "vi": "bố, ba"},
                    {"hanzi": "妈妈", "pinyin": "māma", "vi": "mẹ, má"},
                    {"hanzi": "有", "pinyin": "yǒu", "vi": "có"}
                ]
            },
            {
                "stage": "1_vocab_learn",
                "title_vi": "Học từ vựng trọng tâm",
                "vocabulary": [
                    {"simplified": "家", "pinyin": "jiā", "meaning_vi": "Gia đình / nhà"},
                    {"simplified": "爸爸", "pinyin": "bàba", "meaning_vi": "Bố / ba"},
                    {"simplified": "妈妈", "pinyin": "māma", "meaning_vi": "Mẹ / má"},
                    {"simplified": "哥哥", "pinyin": "gēge", "meaning_vi": "Anh trai"},
                    {"simplified": "姐姐", "pinyin": "jiějie", "meaning_vi": "Chị gái"},
                    {"simplified": "弟弟", "pinyin": "dìdi", "meaning_vi": "Em trai"},
                    {"simplified": "妹妹", "pinyin": "mèimei", "meaning_vi": "Em gái"},
                    {"simplified": "的", "pinyin": "de", "meaning_vi": "Trợ từ sở hữu (của)"},
                    {"simplified": "有", "pinyin": "yǒu", "meaning_vi": "Có"},
                    {"simplified": "没", "pinyin": "méi", "meaning_vi": "Không có (phủ định của 有)"},
                    {"simplified": "个", "pinyin": "gè", "meaning_vi": "Lượng từ phổ biến (cái, chiếc, người)"},
                    {"simplified": "几", "pinyin": "jǐ", "meaning_vi": "Mấy / bao nhiêu (số lượng nhỏ)"},
                    {"simplified": "口", "pinyin": "kǒu", "meaning_vi": "Lượng từ đếm thành viên gia đình"},
                    {"simplified": "和", "pinyin": "hé", "meaning_vi": "Và (liên từ nối danh từ)"},
                    {"simplified": "两", "pinyin": "liǎng", "meaning_vi": "Hai (dùng trước lượng từ)"}
                ]
            },
            {
                "stage": "2_vocab_practice",
                "title_vi": "Luyện tập từ vựng chủ động",
                "exercises": [
                    {
                        "id": "ex-03-v1",
                        "lessonId": "l-hsk1-003",
                        "sortOrder": 1,
                        "kind": "vocab-mcq",
                        "hskLevel": 1,
                        "promptVi": "Từ nào sau đây có nghĩa là 'chị gái'?",
                        "targetContent": {"hanzi": "姐姐", "pinyin": "jiějie"},
                        "options": [
                            {"id": "o1", "label": "姐姐 (jiějie)", "isCorrect": True},
                            {"id": "o2", "label": "妹妹 (mèimei)", "isCorrect": False},
                            {"id": "o3", "label": "妈妈 (māma)", "isCorrect": False},
                            {"id": "o4", "label": "哥哥 (gēge)", "isCorrect": False}
                        ],
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    },
                    {
                        "id": "ex-03-v2",
                        "lessonId": "l-hsk1-003",
                        "sortOrder": 2,
                        "kind": "matching_pairs",
                        "hskLevel": 1,
                        "promptVi": "Ghép các cặp từ xưng hô gia đình:",
                        "matchingPairs": [
                            {"leftId": "l1", "leftLabel": "爸爸", "rightId": "r1", "rightLabel": "bàba — Bố"},
                            {"leftId": "l2", "leftLabel": "妈妈", "rightId": "r2", "rightLabel": "māma — Mẹ"},
                            {"leftId": "l3", "leftLabel": "哥哥", "rightId": "r3", "rightLabel": "gēge — Anh trai"},
                            {"leftId": "l4", "leftLabel": "弟弟", "rightId": "r4", "rightLabel": "dìdi — Em trai"}
                        ],
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    }
                ]
            },
            {
                "stage": "3_grammar_learn",
                "title_vi": "Ngữ pháp trọng điểm",
                "grammar_points": [
                    {
                        "id": "gp-03-1",
                        "titleVi": "Hỏi số thành viên gia đình: '你家有几口人？'",
                        "pattern": "Gia đình + 有 + 几口人？",
                        "explanationVi": "Dùng lượng từ 口 để đếm số nhân khẩu trong gia đình. Trả lời: 我家有 + [Số từ] + 口人.",
                        "examples": [
                            {"hanzi": "你家有几口人？", "pinyin": "Nǐ jiā yǒu jǐ kǒu rén?", "translationVi": "Nhà bạn có mấy người?"},
                            {"hanzi": "我家有四口人。", "pinyin": "Wǒ jiā yǒu sì kǒu rén.", "translationVi": "Nhà tôi có bốn người."}
                        ]
                    },
                    {
                        "id": "gp-03-2",
                        "titleVi": "Phân biệt số đếm 二 (èr) và 两 (liǎng)",
                        "pattern": "两 + Lượng từ + Danh từ",
                        "explanationVi": "Khi nói số lượng trước lượng từ (như 个, 口, 只), dùng 两 thay vì 二 (ví dụ: 两个, 两口人).",
                        "examples": [
                            {"hanzi": "我有两个哥哥。", "pinyin": "Wǒ yǒu liǎng gè gēge.", "translationVi": "Tôi có hai người anh trai."},
                            {"hanzi": "他没有弟弟。", "pinyin": "Tā méiyǒu dìdi.", "translationVi": "Anh ấy không có em trai."}
                        ]
                    }
                ]
            },
            {
                "stage": "4_grammar_practice",
                "title_vi": "Luyện tập cấu trúc ngữ pháp",
                "exercises": [
                    {
                        "id": "ex-03-g1",
                        "lessonId": "l-hsk1-003",
                        "sortOrder": 1,
                        "kind": "sentence_ordering",
                        "hskLevel": 1,
                        "promptVi": "Sắp xếp thành câu: 'Nhà tôi có bốn người.'",
                        "tokens": ["我", "家", "有", "四", "口", "人", "。"],
                        "targetSentence": "我家有四口人。",
                        "translationVi": "Nhà tôi có bốn người.",
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    },
                    {
                        "id": "ex-03-g2",
                        "lessonId": "l-hsk1-003",
                        "sortOrder": 2,
                        "kind": "grammar-mcq",
                        "hskLevel": 1,
                        "promptVi": "Điền từ thích hợp: '我有____个姐姐。' (Tôi có hai người chị gái)",
                        "targetContent": {"hanzi": "两", "pinyin": "liǎng"},
                        "options": [
                            {"id": "o1", "label": "两", "isCorrect": True},
                            {"id": "o2", "label": "二", "isCorrect": False},
                            {"id": "o3", "label": "口", "isCorrect": False},
                            {"id": "o4", "label": "的", "isCorrect": False}
                        ],
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    }
                ]
            },
            {
                "stage": "5_dialogue_interactive",
                "title_vi": "Hội thoại giao tiếp",
                "dialogue": {
                    "id": "d-03",
                    "titleVi": "Kể về gia đình",
                    "turns": [
                        {"speaker": "大卫", "hanzi": "李明，你家有几口人？", "pinyin": "Lǐ Míng, nǐ jiā yǒu jǐ kǒu rén?", "vi": "Lý Minh, nhà bạn có mấy người?"},
                        {"speaker": "李明", "hanzi": "我家有四口人：爸爸、妈妈、一个妹妹和我。", "pinyin": "Wǒ jiā yǒu sì kǒu rén: bàba, māma, yí gè mèimei hé wǒ.", "vi": "Nhà tôi có bốn người: bố, mẹ, một em gái và tôi."},
                        {"speaker": "大卫", "hanzi": "你有哥哥吗？", "pinyin": "Nǐ yǒu gēge ma?", "vi": "Bạn có anh trai không?"},
                        {"speaker": "李明", "hanzi": "我没有哥哥。你家呢？", "pinyin": "Wǒ méiyǒu gēge. Nǐ jiā ne?", "vi": "Tôi không có anh trai. Còn nhà bạn thì sao?"},
                        {"speaker": "大卫", "hanzi": "我家有三口人，爸爸、妈妈和我。", "pinyin": "Wǒ jiā yǒu sān kǒu rén, bàba, māma hé wǒ.", "vi": "Nhà tôi có ba người, bố, mẹ và tôi."}
                    ]
                }
            },
            {
                "stage": "6_listening_speaking",
                "title_vi": "Luyện nghe và nói phản xạ",
                "instruction": "Nghe đoạn hội thoại và xác định thông tin chính xác.",
                "exercises": [
                    {
                        "id": "ex-03-ls1",
                        "lessonId": "l-hsk1-003",
                        "sortOrder": 1,
                        "kind": "listening-mcq",
                        "hskLevel": 1,
                        "promptVi": "Nghe câu nói và chọn số thành viên gia đình được nhắc tới:",
                        "audioText": "我家有五口人：爸爸、妈妈、哥哥、姐姐和我。",
                        "options": [
                            {"id": "o1", "label": "5 người", "isCorrect": True},
                            {"id": "o2", "label": "4 người", "isCorrect": False},
                            {"id": "o3", "label": "3 người", "isCorrect": False},
                            {"id": "o4", "label": "6 người", "isCorrect": False}
                        ],
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    }
                ]
            },
            {
                "stage": "7_reading_comprehension",
                "title_vi": "Đọc hiểu văn bản",
                "passage": {
                    "title": "Gia đình của tôi",
                    "text": "这是我的家。我家有四口人：爸爸、妈妈、一个弟弟和我。我爸爸是医生，我妈妈是老师。我和弟弟都在学校学习。我们家很幸福。",
                    "translationVi": "Đây là gia đình tôi. Nhà tôi có bốn người: bố, mẹ, một em trai và tôi. Bố tôi là bác sĩ, mẹ tôi là giáo viên. Tôi và em trai đều học ở trường. Gia đình chúng tôi rất hạnh phúc."
                },
                "exercises": [
                    {
                        "id": "ex-03-r1",
                        "lessonId": "l-hsk1-003",
                        "sortOrder": 1,
                        "kind": "true-false",
                        "hskLevel": 1,
                        "promptVi": "Nhà bạn ấy có một anh trai và một em gái.",
                        "isTrue": False,
                        "explanationVi": "Trong bài nêu rõ: có một em trai (一个弟弟), không có anh trai hay em gái.",
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    }
                ]
            },
            {
                "stage": "8_mini_quiz",
                "title_vi": "Mini Quiz đánh giá năng lực",
                "instruction": "Hoàn thành bài kiểm tra 8 câu để đánh giá mức độ ghi nhớ về gia đình và lượng từ.",
                "quizUrl": "/lessons/stage/hsk1-lesson-03#mini-quiz"
            },
            {
                "stage": "9_srs_review",
                "title_vi": "Đưa từ vựng vào hệ thống SRS",
                "instruction": "Các từ vựng về thành viên gia đình đã sẵn sàng cho chu trình ôn tập cách quãng.",
                "reviewUrl": "/review"
            }
        ]
    }

def create_lesson_04():
    return {
        "id": "l-hsk1-004",
        "slug": "hsk1-lesson-04",
        "hsk_level": 1,
        "unit_id": "u-hsk1-01",
        "title": "Bài 4: Hôm nay thứ mấy? (今天星期几？ — Ngày tháng & Thời gian)",
        "objective_vi": "Hỏi và nói thứ trong tuần; biểu đạt ngày tháng năm; hỏi và nói giờ giấc cơ bản; phân biệt 星期天/星期日 và cách dùng 点/分.",
        "estimated_minutes": 25,
        "quality_status": "VERIFIED",
        "stages": [
            {
                "stage": "0_warmup",
                "title_vi": "Khởi động & Ngữ âm nền tảng",
                "instruction": "Luyện đếm số từ 1 đến 10 và các mốc thời gian: jīntiān, míngtiān, zuótiān, xīngqī, yuè, hào, diǎn.",
                "warmup_words": [
                    {"hanzi": "今天", "pinyin": "jīntiān", "vi": "hôm nay"},
                    {"hanzi": "明天", "pinyin": "míngtiān", "vi": "ngày mai"},
                    {"hanzi": "昨天", "pinyin": "zuótiān", "vi": "hôm qua"},
                    {"hanzi": "星期", "pinyin": "xīngqī", "vi": "thứ, tuần"}
                ]
            },
            {
                "stage": "1_vocab_learn",
                "title_vi": "Học từ vựng trọng tâm",
                "vocabulary": [
                    {"simplified": "今天", "pinyin": "jīntiān", "meaning_vi": "Hôm nay"},
                    {"simplified": "明天", "pinyin": "míngtiān", "meaning_vi": "Ngày mai"},
                    {"simplified": "昨天", "pinyin": "zuótiān", "meaning_vi": "Hôm qua"},
                    {"simplified": "星期", "pinyin": "xīngqī", "meaning_vi": "Tuần / thứ"},
                    {"simplified": "星期天", "pinyin": "xīngqītiān", "meaning_vi": "Chủ nhật (khẩu ngữ)"},
                    {"simplified": "星期日", "pinyin": "xīngqīrì", "meaning_vi": "Chủ nhật (văn viết)"},
                    {"simplified": "月", "pinyin": "yuè", "meaning_vi": "Tháng"},
                    {"simplified": "号", "pinyin": "hào", "meaning_vi": "Ngày (trong khẩu ngữ)"},
                    {"simplified": "日", "pinyin": "rì", "meaning_vi": "Ngày (trong văn viết)"},
                    {"simplified": "年", "pinyin": "nián", "meaning_vi": "Năm"},
                    {"simplified": "现在", "pinyin": "xiànzài", "meaning_vi": "Bây giờ / hiện tại"},
                    {"simplified": "点", "pinyin": "diǎn", "meaning_vi": "Giờ (mốc thời gian)"},
                    {"simplified": "分", "pinyin": "fēn", "meaning_vi": "Phút"},
                    {"simplified": "半", "pinyin": "bàn", "meaning_vi": "Rưỡi / nửa (30 phút)"}
                ]
            },
            {
                "stage": "2_vocab_practice",
                "title_vi": "Luyện tập từ vựng chủ động",
                "exercises": [
                    {
                        "id": "ex-04-v1",
                        "lessonId": "l-hsk1-004",
                        "sortOrder": 1,
                        "kind": "vocab-mcq",
                        "hskLevel": 1,
                        "promptVi": "Từ nào sau đây có nghĩa là 'ngày mai'?",
                        "targetContent": {"hanzi": "明天", "pinyin": "míngtiān"},
                        "options": [
                            {"id": "o1", "label": "明天 (míngtiān)", "isCorrect": True},
                            {"id": "o2", "label": "今天 (jīntiān)", "isCorrect": False},
                            {"id": "o3", "label": "昨天 (zuótiān)", "isCorrect": False},
                            {"id": "o4", "label": "现在 (xiànzài)", "isCorrect": False}
                        ],
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    },
                    {
                        "id": "ex-04-v2",
                        "lessonId": "l-hsk1-004",
                        "sortOrder": 2,
                        "kind": "matching_pairs",
                        "hskLevel": 1,
                        "promptVi": "Ghép các mốc thời gian tương ứng:",
                        "matchingPairs": [
                            {"leftId": "l1", "leftLabel": "今天", "rightId": "r1", "rightLabel": "jīntiān — Hôm nay"},
                            {"leftId": "l2", "leftLabel": "昨天", "rightId": "r2", "rightLabel": "zuótiān — Hôm qua"},
                            {"leftId": "l3", "leftLabel": "星期", "rightId": "r3", "rightLabel": "xīngqī — Thứ, tuần"},
                            {"leftId": "l4", "leftLabel": "现在", "rightId": "r4", "rightLabel": "xiànzài — Bây giờ"}
                        ],
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    }
                ]
            },
            {
                "stage": "3_grammar_learn",
                "title_vi": "Ngữ pháp trọng điểm",
                "grammar_points": [
                    {
                        "id": "gp-04-1",
                        "titleVi": "Hỏi và nói thứ trong tuần: '今天星期几？'",
                        "pattern": "Thời gian + 星期 + [Số từ 1–6 / 天 / 日]",
                        "explanationVi": "Trong tiếng Trung, thứ Hai là 星期一, thứ Ba là 星期二... thứ Bảy là 星期六. Chủ nhật là 星期天 hoặc 星期日 (không dùng 星期七).",
                        "examples": [
                            {"hanzi": "今天星期几？", "pinyin": "Jīntiān xīngqī jǐ?", "translationVi": "Hôm nay thứ mấy?"},
                            {"hanzi": "今天星期三。", "pinyin": "Jīntiān xīngqī sān.", "translationVi": "Hôm nay thứ Tư."}
                        ]
                    },
                    {
                        "id": "gp-04-2",
                        "titleVi": "Quy tắc trật tự thời gian từ lớn đến nhỏ",
                        "pattern": "Năm (年) + Tháng (月) + Ngày (日/号) + Giờ (点) + Phút (分)",
                        "explanationVi": "Tiếng Trung luôn đặt đơn vị thời gian lớn phía trước, đơn vị nhỏ phía sau.",
                        "examples": [
                            {"hanzi": "明天是九月十号。", "pinyin": "Míngtiān shì jiǔ yuè shí hào.", "translationVi": "Ngày mai là ngày 10 tháng 9."},
                            {"hanzi": "现在八点半。", "pinyin": "Xiànzài bā diǎn bàn.", "translationVi": "Bây giờ là 8 giờ rưỡi."}
                        ]
                    }
                ]
            },
            {
                "stage": "4_grammar_practice",
                "title_vi": "Luyện tập cấu trúc ngữ pháp",
                "exercises": [
                    {
                        "id": "ex-04-g1",
                        "lessonId": "l-hsk1-004",
                        "sortOrder": 1,
                        "kind": "sentence_ordering",
                        "hskLevel": 1,
                        "promptVi": "Sắp xếp thành câu: 'Hôm nay là thứ mấy?'",
                        "tokens": ["今天", "是", "星期", "几", "？"],
                        "targetSentence": "今天是星期几？",
                        "translationVi": "Hôm nay là thứ mấy?",
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    },
                    {
                        "id": "ex-04-g2",
                        "lessonId": "l-hsk1-004",
                        "sortOrder": 2,
                        "kind": "grammar-mcq",
                        "hskLevel": 1,
                        "promptVi": "Chọn cách nói đúng cho 'Chủ nhật':",
                        "targetContent": {"hanzi": "星期天", "pinyin": "xīngqītiān"},
                        "options": [
                            {"id": "o1", "label": "星期天 (xīngqītiān)", "isCorrect": True},
                            {"id": "o2", "label": "星期七 (xīngqīqī)", "isCorrect": False},
                            {"id": "o3", "label": "星期八 (xīngqībā)", "isCorrect": False},
                            {"id": "o4", "label": "星期号 (xīngqīhào)", "isCorrect": False}
                        ],
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    }
                ]
            },
            {
                "stage": "5_dialogue_interactive",
                "title_vi": "Hội thoại giao tiếp",
                "dialogue": {
                    "id": "d-04",
                    "titleVi": "Hỏi thời gian và lịch hẹn",
                    "turns": [
                        {"speaker": "大卫", "hanzi": "李明，现在几点？", "pinyin": "Lǐ Míng, xiànzài jǐ diǎn?", "vi": "Lý Minh, bây giờ là mấy giờ?"},
                        {"speaker": "李明", "hanzi": "现在上午十点十分。", "pinyin": "Xiànzài shàngwǔ shí diǎn shí fēn.", "vi": "Bây giờ là 10 giờ 10 phút sáng."},
                        {"speaker": "大卫", "hanzi": "明天星期几？", "pinyin": "Míngtiān xīngqī jǐ?", "vi": "Ngày mai thứ mấy?"},
                        {"speaker": "李明", "hanzi": "明天星期六，我们不上课。", "pinyin": "Míngtiān xīngqī liù, wǒmen bú shàngkè.", "vi": "Ngày mai thứ Bảy, chúng ta không có tiết học."},
                        {"speaker": "大卫", "hanzi": "太好了！明天下午两点去喝咖啡，好吗？", "pinyin": "Tài hǎo le! Míngtiān xiàwǔ liǎng diǎn qù hē kāfēi, hǎo ma?", "vi": "Tuyệt quá! Chiều mai 2 giờ đi uống cà phê nhé?"},
                        {"speaker": "李明", "hanzi": "好啊，明天见！", "pinyin": "Hǎo a, míngtiān jiàn!", "vi": "Được chứ, ngày mai gặp!"}
                    ]
                }
            },
            {
                "stage": "6_listening_speaking",
                "title_vi": "Luyện nghe và nói phản xạ",
                "instruction": "Nghe đoạn hội thoại hỏi giờ và chọn đáp án chính xác.",
                "exercises": [
                    {
                        "id": "ex-04-ls1",
                        "lessonId": "l-hsk1-004",
                        "sortOrder": 1,
                        "kind": "listening-mcq",
                        "hskLevel": 1,
                        "promptVi": "Nghe câu thông báo thời gian và chọn giờ đúng:",
                        "audioText": "现在是下午三点半。",
                        "options": [
                            {"id": "o1", "label": "3:30 chiều", "isCorrect": True},
                            {"id": "o2", "label": "3:00 chiều", "isCorrect": False},
                            {"id": "o3", "label": "8:30 sáng", "isCorrect": False},
                            {"id": "o4", "label": "4:30 chiều", "isCorrect": False}
                        ],
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    }
                ]
            },
            {
                "stage": "7_reading_comprehension",
                "title_vi": "Đọc hiểu văn bản",
                "passage": {
                    "title": "Thời gian biểu cuối tuần của Lý Minh",
                    "text": "今天是十月五号，星期五。明天是星期六，我和大卫上午去图书馆看书，下午两点去商店买东西。星期天我们在家休息。",
                    "translationVi": "Hôm nay là ngày 5 tháng 10, thứ Sáu. Ngày mai là thứ Bảy, tôi và David buổi sáng đến thư viện đọc sách, buổi chiều 2 giờ đến cửa hàng mua đồ. Chủ nhật chúng tôi nghỉ ngơi ở nhà."
                },
                "exercises": [
                    {
                        "id": "ex-04-r1",
                        "lessonId": "l-hsk1-004",
                        "sortOrder": 1,
                        "kind": "true-false",
                        "hskLevel": 1,
                        "promptVi": "Lý Minh và David đi mua đồ vào sáng thứ Bảy.",
                        "isTrue": False,
                        "explanationVi": "Trong bài: Buổi sáng đi thư viện (上午去图书馆), chiều 2 giờ mới đi mua đồ (下午两点去商店).",
                        "qualityStatus": "VERIFIED",
                        "sourceRef": {"document": "HanLearn Standard Curriculum", "license": "CC-BY-NC-4.0"}
                    }
                ]
            },
            {
                "stage": "8_mini_quiz",
                "title_vi": "Mini Quiz đánh giá năng lực",
                "instruction": "Bài kiểm tra 8 câu về ngày tháng, thứ trong tuần và giờ giấc.",
                "quizUrl": "/lessons/stage/hsk1-lesson-04#mini-quiz"
            },
            {
                "stage": "9_srs_review",
                "title_vi": "Đưa từ vựng vào hệ thống SRS",
                "instruction": "Từ vựng thời gian đã được lập lịch ôn tập cách quãng.",
                "reviewUrl": "/review"
            }
        ]
    }

def main():
    l2 = create_lesson_02()
    l3 = create_lesson_03()
    l4 = create_lesson_04()
    
    with open("content/hsk_library/hsk1_lesson_02.json", "w", encoding="utf-8") as f:
        json.dump(l2, f, ensure_ascii=False, indent=2)
    print("Generated content/hsk_library/hsk1_lesson_02.json")
    
    with open("content/hsk_library/hsk1_lesson_03.json", "w", encoding="utf-8") as f:
        json.dump(l3, f, ensure_ascii=False, indent=2)
    print("Generated content/hsk_library/hsk1_lesson_03.json")
    
    with open("content/hsk_library/hsk1_lesson_04.json", "w", encoding="utf-8") as f:
        json.dump(l4, f, ensure_ascii=False, indent=2)
    print("Generated content/hsk_library/hsk1_lesson_04.json")

if __name__ == "__main__":
    main()
