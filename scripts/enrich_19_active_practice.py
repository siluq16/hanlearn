import json

ITEMS_19 = {
    "content/hsk_library/hsk1_lesson_12.json": [
        {
            "id": "ex-12-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Từ nào chỉ phương tiện hàng không 'máy bay'?",
            "correct_answer": "飞机",
            "options": ["飞机", "出租车", "公共汽车", "火车"],
            "explanation": "'飞机' (fēijī) nghĩa là máy bay."
        },
        {
            "id": "ex-12-v-extra-02",
            "type": "vocab_mcq",
            "prompt": "Hành động 'lái xe' trong tiếng Trung là gì?",
            "correct_answer": "开车",
            "options": ["开车", "坐车", "骑车", "走路"],
            "explanation": "'开车' (kāichē) nghĩa là lái xe hơi."
        },
        {
            "id": "ex-12-v-extra-03",
            "type": "vocab_mcq",
            "prompt": "Động từ 'trở về / về (nhà, nước)' là:",
            "correct_answer": "回",
            "options": ["回", "去", "来", "走"],
            "explanation": "'回' (huí) là trở về (ví dụ: 回家 - về nhà)."
        }
    ],
    "content/hsk_library/hsk1_lesson_14.json": [
        {
            "id": "ex-14-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Đồ vật dùng để ngồi (cái ghế) là gì?",
            "correct_answer": "椅子",
            "options": ["椅子", "桌子", "床", "门"],
            "explanation": "'椅子' (yǐzi) nghĩa là cái ghế."
        }
    ],
    "content/hsk_library/hsk1_lesson_15.json": [
        {
            "id": "ex-15-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Từ chỉ 'em gái' trong gia đình là:",
            "correct_answer": "妹妹",
            "options": ["妹妹", "姐姐", "弟弟", "哥哥"],
            "explanation": "'妹妹' (mèimei) là em gái."
        }
    ],
    "content/hsk_library/hsk1_lesson_16.json": [
        {
            "id": "ex-16-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Hành động 'thức dậy / rời khỏi giường' vào buổi sáng là:",
            "correct_answer": "起床",
            "options": ["起床", "睡觉", "洗澡", "刷牙"],
            "explanation": "'起床' (qǐchuáng) nghĩa là thức dậy."
        },
        {
            "id": "ex-16-v-extra-02",
            "type": "vocab_mcq",
            "prompt": "Cụm từ chỉ việc 'đi khám bệnh / khám bác sĩ' là:",
            "correct_answer": "看病",
            "options": ["看病", "吃药", "打针", "休息"],
            "explanation": "'看病' (kànbìng) nghĩa là đi khám bệnh."
        }
    ],
    "content/hsk_library/hsk1_lesson_18.json": [
        {
            "id": "ex-18-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Hoạt động 'nấu cơm / nấu nướng' là:",
            "correct_answer": "做饭",
            "options": ["做饭", "吃饭", "买菜", "喝水"],
            "explanation": "'做饭' (zuòfàn) nghĩa là nấu cơm, làm đồ ăn."
        },
        {
            "id": "ex-18-v-extra-02",
            "type": "vocab_mcq",
            "prompt": "Món ăn 'bánh mì' trong tiếng Trung là:",
            "correct_answer": "面包",
            "options": ["面包", "包子", "米饭", "面条"],
            "explanation": "'面包' (miànbāo) nghĩa là bánh mì."
        },
        {
            "id": "ex-18-v-extra-03",
            "type": "vocab_mcq",
            "prompt": "Tính từ khen món ăn 'ngon miệng' là:",
            "correct_answer": "好吃",
            "options": ["好吃", "好喝", "好看", "好听"],
            "explanation": "'好吃' (hǎochī) nghĩa là ăn ngon."
        }
    ],
    "content/hsk_library/hsk1_lesson_19.json": [
        {
            "id": "ex-19-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Nơi làm việc 'công ty' trong tiếng Trung là:",
            "correct_answer": "公司",
            "options": ["公司", "学校", "医院", "银行"],
            "explanation": "'公司' (gōngsī) nghĩa là công ty."
        },
        {
            "id": "ex-19-v-extra-02",
            "type": "vocab_mcq",
            "prompt": "Địa điểm ăn uống 'nhà hàng / tiệm ăn' là:",
            "correct_answer": "饭店",
            "options": ["饭店", "商店", "书店", "超市"],
            "explanation": "'饭店' (fàndiàn) nghĩa là quán ăn, nhà hàng, khách sạn."
        }
    ],
    "content/hsk_library/hsk1_lesson_21.json": [
        {
            "id": "ex-21-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Cụm từ biểu thị kết quả 'nghe thấy' qua điện thoại là:",
            "correct_answer": "听见",
            "options": ["听见", "看见", "说话", "打电话"],
            "explanation": "'听见' (tīngjiàn) là bổ ngữ kết quả: nghe thấy."
        },
        {
            "id": "ex-21-v-extra-02",
            "type": "vocab_mcq",
            "prompt": "Thiết bị liên lạc di động 'điện thoại di động' là:",
            "correct_answer": "手机",
            "options": ["手机", "电脑", "电视", "收音机"],
            "explanation": "'手机' (shǒujī) nghĩa là điện thoại di động."
        }
    ],
    "content/hsk_library/hsk1_lesson_25.json": [
        {
            "id": "ex-25-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Phương vị từ 'phía bên ngoài / ngoài trời' là:",
            "correct_answer": "外边",
            "options": ["外边", "里边", "前边", "后边"],
            "explanation": "'外边' (wàibian) nghĩa là phía ngoài, bên ngoài."
        }
    ],
    "content/hsk_library/hsk1_lesson_28.json": [
        {
            "id": "ex-28-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Một cách gọi khác trang trọng của 'Chủ nhật' (bên cạnh 星期天) là:",
            "correct_answer": "星期日",
            "options": ["星期日", "星期六", "星期七", "星期八"],
            "explanation": "'星期日' (xīngqīrì) nghĩa là ngày Chủ nhật."
        },
        {
            "id": "ex-28-v-extra-02",
            "type": "vocab_mcq",
            "prompt": "Khoảng thời gian 'buổi tối' trong ngày là:",
            "correct_answer": "晚上",
            "options": ["晚上", "早上", "中午", "下午"],
            "explanation": "'晚上' (wǎnshang) là buổi tối."
        },
        {
            "id": "ex-28-v-extra-03",
            "type": "vocab_mcq",
            "prompt": "Từ chỉ 'ban ngày' (ngược với ban đêm) là:",
            "correct_answer": "白天",
            "options": ["白天", "晚上", "早晨", "深夜"],
            "explanation": "'白天' (báitiān) nghĩa là ban ngày."
        }
    ],
    "content/hsk_library/hsk1_lesson_30.json": [
        {
            "id": "ex-30-v-extra-01",
            "type": "vocab_mcq",
            "prompt": "Động từ 'tìm kiếm (người hoặc đồ vật)' là:",
            "correct_answer": "找",
            "options": ["找", "给", "看", "听"],
            "explanation": "'找' (zhǎo) nghĩa là tìm kiếm."
        }
    ]
}

def main():
    count = 0
    for filepath, items in ITEMS_19.items():
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        data["stages"][2]["exercises"].extend(items)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        count += len(items)
        print(f"Enriched {filepath} with {len(items)} exercises.")
    print(f"Total {count} active exercises added.")

if __name__ == "__main__":
    main()
