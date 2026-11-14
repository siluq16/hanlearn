import json

PRACTICE_ITEMS = {
    "content/hsk_library/hsk1_lesson_07.json": [
        {
            "id": "ex-07-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Từ nào đồng nghĩa với '块' (đồng tiền) trong văn bản chính thức?",
            "correct_answer": "元",
            "options": ["元", "角", "分", "斤"],
            "explanation": "'元' (yuán) là đơn vị tiền tệ chính thức, khẩu ngữ tương đương với '块' (kuài)."
        }
    ],
    "content/hsk_library/hsk1_lesson_09.json": [
        {
            "id": "ex-09-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Từ mang nghĩa 'phía bên này, đằng này' là gì?",
            "correct_answer": "这边",
            "options": ["这边", "那边", "哪边", "前边"],
            "explanation": "'这边' (zhèbiān) nghĩa là phía này, bên này."
        }
    ],
    "content/hsk_library/hsk1_lesson_11.json": [
        {
            "id": "ex-11-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Hiện tượng thời tiết 'trời mưa' trong tiếng Trung là gì?",
            "correct_answer": "下雨",
            "options": ["下雨", "刮风", "下雪", "出太阳"],
            "explanation": "'下雨' (xiàyǔ) nghĩa là trời mưa, đổ mưa."
        }
    ],
    "content/hsk_library/hsk1_lesson_13.json": [
        {
            "id": "ex-13-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Hành động 'đi học' trong tiếng Trung là:",
            "correct_answer": "上学",
            "options": ["上学", "放学", "下课", "上班"],
            "explanation": "'上学' (shàngxué) nghĩa là đến trường, đi học."
        },
        {
            "id": "ex-13-v-extra-02",
            "type": "vocab_mcq",
            "prompt": "Trường tiểu học và trường trung học lần lượt là:",
            "correct_answer": "小学、中学",
            "options": ["小学、中学", "大学、中学", "幼儿园、小学", "高中、大学"],
            "explanation": "'小学' là trường cấp 1 (tiểu học), '中学' là trường trung học (cấp 2 & 3)."
        },
        {
            "id": "ex-13-v-extra-03",
            "type": "vocab_mcq",
            "prompt": "Học sinh tiểu học và học sinh trung học lần lượt là:",
            "correct_answer": "小学生、中学生",
            "options": ["小学生、中学生", "大学生、中学生", "留学生、小学生", "研究生、小学生"],
            "explanation": "'小学生' là học sinh tiểu học, '中学生' là học sinh trung học."
        }
    ],
    "content/hsk_library/hsk1_lesson_15.json": [
        {
            "id": "ex-15-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Từ chỉ 'con trai' (trong quan hệ cha mẹ - con cái) là:",
            "correct_answer": "儿子",
            "options": ["儿子", "女儿", "哥哥", "弟弟"],
            "explanation": "'儿子' (érzi) nghĩa là con trai."
        },
        {
            "id": "ex-15-v-extra-02",
            "type": "vocab_mcq",
            "prompt": "Từ chỉ 'đứa trẻ / con cái' nói chung là:",
            "correct_answer": "孩子",
            "options": ["孩子", "朋友", "同学", "老师"],
            "explanation": "'孩子' (háizi) là đứa trẻ, con cái."
        },
        {
            "id": "ex-15-v-extra-03",
            "type": "vocab_mcq",
            "prompt": "Cách gọi thân mật dành cho các em nhỏ, bạn nhỏ là:",
            "correct_answer": "小朋友",
            "options": ["小朋友", "大朋友", "老朋友", "好朋友"],
            "explanation": "'小朋友' (xiǎopéngyou) nghĩa là bạn nhỏ, em nhỏ."
        }
    ],
    "content/hsk_library/hsk1_lesson_18.json": [
        {
            "id": "ex-18-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Đồ dùng để đựng nước uống (cái cốc, cái ly) là gì?",
            "correct_answer": "杯子",
            "options": ["杯子", "盘子", "碗", "瓶子"],
            "explanation": "'杯子' (bēizi) là cái cốc, cái ly đựng nước."
        },
        {
            "id": "ex-18-v-extra-02",
            "type": "vocab_mcq",
            "prompt": "Món 'trứng gà' trong tiếng Trung là gì?",
            "correct_answer": "鸡蛋",
            "options": ["鸡蛋", "米饭", "面条", "包子"],
            "explanation": "'鸡蛋' (jīdàn) là trứng gà."
        }
    ],
    "content/hsk_library/hsk1_lesson_22.json": [
        {
            "id": "ex-22-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Bạn trai và bạn gái lần lượt là:",
            "correct_answer": "男朋友、女朋友",
            "options": ["男朋友、女朋友", "男老师、女老师", "男学生、女学生", "爸爸、妈妈"],
            "explanation": "'男朋友' (bạn trai) và '女朋友' (bạn gái)."
        }
    ],
    "content/hsk_library/hsk1_lesson_23.json": [
        {
            "id": "ex-23-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Đại từ chỉ 'các bạn' và 'họ (toàn nữ)' là:",
            "correct_answer": "你们、她们",
            "options": ["你们、她们", "我们、他们", "大家、它们", "您、他们"],
            "explanation": "'你们' (các bạn) và '她们' (các cô ấy / họ - phái nữ)."
        }
    ],
    "content/hsk_library/hsk1_lesson_24.json": [
        {
            "id": "ex-24-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Các từ 'những... nào', 'chỗ này', 'cái kia' lần lượt là:",
            "correct_answer": "哪些、这儿、那个",
            "options": ["哪些、这儿、那个", "这些、那儿、这个", "那些、哪儿、哪个", "有的、这里、那个"],
            "explanation": "'哪些' (những cái nào), '这儿' (ở đây, chỗ này), '那个' (cái kia)."
        }
    ],
    "content/hsk_library/hsk1_lesson_26.json": [
        {
            "id": "ex-26-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Từ chỉ 'một nửa (50%)' trong tiếng Trung là:",
            "correct_answer": "一半",
            "options": ["一半", "一点儿", "一下", "一块"],
            "explanation": "'一半' (yíbàn) nghĩa là một nửa."
        }
    ],
    "content/hsk_library/hsk1_lesson_27.json": [
        {
            "id": "ex-27-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Các từ chỉ 'có một số, có những' là:",
            "correct_answer": "有些、有的",
            "options": ["有些、有的", "一些、一点儿", "几个、几只", "多少、多大"],
            "explanation": "'有些' (yǒuxiē) và '有的' (yǒude) dùng để chỉ một phần trong tập hợp."
        }
    ],
    "content/hsk_library/hsk1_lesson_31.json": [
        {
            "id": "ex-31-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Từ đứng trước tính từ biểu thị 'hơi... một chút (không vừa ý)' là:",
            "correct_answer": "有点儿",
            "options": ["有点儿", "一点儿", "非常", "十分"],
            "explanation": "'有点儿' (yǒudiǎnr) + Tính từ (ví dụ: 有点儿累, 有点儿贵)."
        }
    ]
}

def main():
    for filepath, items in PRACTICE_ITEMS.items():
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        stage2 = data["stages"][2]
        if "exercises" not in stage2:
            stage2["exercises"] = []
        
        # Append extra practice items
        stage2["exercises"].extend(items)
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Enriched {filepath} with {len(items)} practice exercises.")

if __name__ == "__main__":
    main()
