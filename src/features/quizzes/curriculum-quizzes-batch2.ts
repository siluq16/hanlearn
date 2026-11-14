import "server-only";
import type { CurriculumQuizDefinition } from "./curriculum-quizzes";

// BÀI 11: THỜI TIẾT & KHÍ HẬU
export const LESSON_11_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-011",
  slug: "hsk1-lesson-11",
  quiz: {
    id: "77777777-7777-4777-8777-000000000011",
    lesson_id: "l-hsk1-011",
    revision: 1,
    title: "Mini Quiz Bài 11: Thời tiết & Khí hậu",
  },
  lessonTitle: "Bài 11: Thời tiết & Khí hậu",
  questions: [
    {
      id: "70000011-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000011",
      sort_order: 1,
      prompt: "Mẫu câu hỏi 'Hôm nay thời tiết thế nào?' trong tiếng Trung là gì?",
      choices: ["今天天气怎么样？", "今天几月几号？", "今天星期几？", "今天多少钱？"],
    },
    {
      id: "70000011-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000011",
      sort_order: 2,
      prompt: "Từ nào mang nghĩa là 'lạnh'?",
      choices: ["冷 (lěng)", "热 (rè)", "雨 (yǔ)", "晴 (qíng)"],
    },
    {
      id: "70000011-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000011",
      sort_order: 3,
      prompt: "Từ nào mang nghĩa là 'nóng'?",
      choices: ["热 (rè)", "冷 (lěng)", "阴 (yīn)", "雪 (xuě)"],
    },
    {
      id: "70000011-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000011",
      sort_order: 4,
      prompt: "Hiện tượng 'mưa rơi, trời mưa' trong tiếng Trung nói là:",
      choices: ["下雨 (xiàyǔ)", "下雪 (xiàxuě)", "刮风 (guāfēng)", "晴天 (qíngtiān)"],
    },
    {
      id: "70000011-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000011",
      sort_order: 5,
      prompt: "Khi trời nhiều mây râm mát, u ám, người ta dùng từ nào?",
      choices: ["阴 (yīn)", "晴 (qíng)", "热 (rè)", "冷 (lěng)"],
    },
    {
      id: "70000011-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000011",
      sort_order: 6,
      prompt: "Khi trời nắng ráo, quang đãng, từ tương ứng là:",
      choices: ["晴 (qíng)", "阴 (yīn)", "雪 (xuě)", "雨 (yǔ)"],
    },
    {
      id: "70000011-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000011",
      sort_order: 7,
      prompt: "Từ nào mang nghĩa là 'tuyết'?",
      choices: ["雪 (xuě)", "雨 (yǔ)", "水 (shuǐ)", "风 (fēng)"],
    },
    {
      id: "70000011-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000011",
      sort_order: 8,
      prompt: "Dịch câu: 'Ngày mai không mưa, là ngày nắng.' sang tiếng Trung:",
      choices: ["明天不下雨，是晴天。", "明天会下大雪。", "今天天气很热。", "昨天下了大雨。"],
    },
  ],
  answerKeys: {
    "70000011-0000-4000-8000-000000000001": {
      question_id: "70000011-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "天气怎么样 là mẫu câu chuẩn để hỏi tình hình thời tiết.",
    },
    "70000011-0000-4000-8000-000000000002": {
      question_id: "70000011-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "冷 (lěng) nghĩa là lạnh.",
    },
    "70000011-0000-4000-8000-000000000003": {
      question_id: "70000011-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "热 (rè) nghĩa là nóng.",
    },
    "70000011-0000-4000-8000-000000000004": {
      question_id: "70000011-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "下雨 (xià yǔ) là mưa rơi.",
    },
    "70000011-0000-4000-8000-000000000005": {
      question_id: "70000011-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "阴 (yīn) là trời âm u, râm mát.",
    },
    "70000011-0000-4000-8000-000000000006": {
      question_id: "70000011-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "晴 (qíng) nghĩa là trời nắng quang đãng.",
    },
    "70000011-0000-4000-8000-000000000007": {
      question_id: "70000011-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "雪 (xuě) là tuyết.",
    },
    "70000011-0000-4000-8000-000000000008": {
      question_id: "70000011-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "明天 (ngày mai) 不下雨 (không mưa), 是晴天 (là ngày nắng).",
    },
  },
};


// BÀI 12: PHƯƠNG TIỆN & ĐI LẠI
export const LESSON_12_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-012",
  slug: "hsk1-lesson-12",
  quiz: {
    id: "77777777-7777-4777-8777-000000000012",
    lesson_id: "l-hsk1-012",
    revision: 1,
    title: "Mini Quiz Bài 12: Phương tiện & Đi lại",
  },
  lessonTitle: "Bài 12: Phương tiện & Đi lại",
  questions: [
    {
      id: "70000012-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000012",
      sort_order: 1,
      prompt: "Từ nào có nghĩa là 'xe taxi'?",
      choices: ["出租车 (chūzūchē)", "飞机 (fēijī)", "火车 (huǒchē)", "公共汽车 (gōnggòng qìchē)"],
    },
    {
      id: "70000012-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000012",
      sort_order: 2,
      prompt: "Động từ dùng để chỉ việc 'ngồi, đi (xe, tàu, máy bay)' là:",
      choices: ["坐 (zuò)", "开 (kāi)", "走 (zǒu)", "站 (zhàn)"],
    },
    {
      id: "70000012-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000012",
      sort_order: 3,
      prompt: "Từ nào chỉ 'máy bay'?",
      choices: ["飞机 (fēijī)", "火车 (huǒchē)", "出租车 (chūzūchē)", "车站 (chēzhàn)"],
    },
    {
      id: "70000012-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000012",
      sort_order: 4,
      prompt: "Từ nào chỉ 'tàu hỏa'?",
      choices: ["火车 (huǒchē)", "飞机 (fēijī)", "自行车 (zìxíngchē)", "船 (chuán)"],
    },
    {
      id: "70000012-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000012",
      sort_order: 5,
      prompt: "Cụm từ chỉ hành động 'lái xe' là:",
      choices: ["开车 (kāichē)", "坐车 (zuòchē)", "走路 (zǒulù)", "等车 (děngchē)"],
    },
    {
      id: "70000012-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000012",
      sort_order: 6,
      prompt: "Từ nào có nghĩa là 'bến xe, ga tàu'?",
      choices: ["车站 (chēzhàn)", "学校 (xuéxiào)", "医院 (yīyuàn)", "商店 (shāngdiàn)"],
    },
    {
      id: "70000012-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000012",
      sort_order: 7,
      prompt: "Cặp từ trái nghĩa 'xa - gần' trong tiếng Trung là:",
      choices: ["远 (yuǎn) - 近 (jìn)", "大 (dà) - 小 (xiǎo)", "多 (duō) - 少 (shǎo)", "高 (gāo) - 矮 (ǎi)"],
    },
    {
      id: "70000012-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000012",
      sort_order: 8,
      prompt: "Câu nào diễn đạt: 'Tôi đi taxi đến sân bay'?",
      choices: ["我坐出租车去飞机场。", "我开车去火车站。", "我走路去学校。", "他坐火车去北京。"],
    },
  ],
  answerKeys: {
    "70000012-0000-4000-8000-000000000001": {
      question_id: "70000012-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "出租车 là xe taxi.",
    },
    "70000012-0000-4000-8000-000000000002": {
      question_id: "70000012-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "坐 dùng cho việc đi lại bằng phương tiện giao thông.",
    },
    "70000012-0000-4000-8000-000000000003": {
      question_id: "70000012-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "飞机 nghĩa là máy bay.",
    },
    "70000012-0000-4000-8000-000000000004": {
      question_id: "70000012-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "火车 nghĩa là tàu hỏa.",
    },
    "70000012-0000-4000-8000-000000000005": {
      question_id: "70000012-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "开车 là lái xe.",
    },
    "70000012-0000-4000-8000-000000000006": {
      question_id: "70000012-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "车站 là bến xe hoặc nhà ga.",
    },
    "70000012-0000-4000-8000-000000000007": {
      question_id: "70000012-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "远 (xa) và 近 (gần).",
    },
    "70000012-0000-4000-8000-000000000008": {
      question_id: "70000012-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "我坐出租车 (Tôi đi taxi) 去飞机场 (đến sân bay).",
    },
  },
};


// BÀI 13: TRƯỜNG HỌC & GIẢNG ĐƯỜNG
export const LESSON_13_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-013",
  slug: "hsk1-lesson-13",
  quiz: {
    id: "77777777-7777-4777-8777-000000000013",
    lesson_id: "l-hsk1-013",
    revision: 1,
    title: "Mini Quiz Bài 13: Trường học & Giảng đường",
  },
  lessonTitle: "Bài 13: Trường học & Giảng đường",
  questions: [
    {
      id: "70000013-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000013",
      sort_order: 1,
      prompt: "Từ nào có nghĩa là 'sinh viên đại học'?",
      choices: ["大学生 (dàxuéshēng)", "中学生 (zhōngxuéshēng)", "小学生 (xiǎoxuéshēng)", "老师 (lǎoshī)"],
    },
    {
      id: "70000013-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000013",
      sort_order: 2,
      prompt: "Lượng từ dùng cho sách, vở (sách, cuốn sổ) là:",
      choices: ["本 (běn)", "个 (gè)", "件 (jiàn)", "只 (zhī)"],
    },
    {
      id: "70000013-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000013",
      sort_order: 3,
      prompt: "Từ nào có nghĩa là 'tiếng Trung / Hán ngữ'?",
      choices: ["中文 (zhōngwén)", "英文 (yīngwén)", "法文 (fǎwén)", "韩文 (hánwén)"],
    },
    {
      id: "70000013-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000013",
      sort_order: 4,
      prompt: "Từ nào chỉ nơi bán sách (hiệu sách)?",
      choices: ["书店 (shūdiàn)", "饭馆 (fànguǎn)", "学校 (xuéxiào)", "医院 (yīyuàn)"],
    },
    {
      id: "70000013-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000013",
      sort_order: 5,
      prompt: "Từ nào có nghĩa là 'bút viết'?",
      choices: ["笔 (bǐ)", "本子 (běnzi)", "书 (shū)", "桌子 (zhuōzi)"],
    },
    {
      id: "70000013-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000013",
      sort_order: 6,
      prompt: "Từ 'bạn học, bạn cùng lớp' trong tiếng Trung là:",
      choices: ["同学 (tóngxué)", "朋友 (péngyou)", "老师 (lǎoshī)", "先生 (xiānsheng)"],
    },
    {
      id: "70000013-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000013",
      sort_order: 7,
      prompt: "Hành động 'đi học, đến trường đi học' diễn đạt bằng cụm từ:",
      choices: ["上学 (shàngxué)", "上班 (shàngbān)", "下课 (xiàkè)", "考试 (kǎoshì)"],
    },
    {
      id: "70000013-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000013",
      sort_order: 8,
      prompt: "Câu 'Tôi muốn mua hai cuốn sách tiếng Trung' dịch là:",
      choices: ["我想买两本中文书。", "我想看三本书。", "他在书店买笔。", "她是大学生。"],
    },
  ],
  answerKeys: {
    "70000013-0000-4000-8000-000000000001": {
      question_id: "70000013-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "大学生 là sinh viên trường đại học.",
    },
    "70000013-0000-4000-8000-000000000002": {
      question_id: "70000013-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "本 là lượng từ chuyên dụng cho sách vở (一本书, 两本本子).",
    },
    "70000013-0000-4000-8000-000000000003": {
      question_id: "70000013-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "中文 là tiếng Trung.",
    },
    "70000013-0000-4000-8000-000000000004": {
      question_id: "70000013-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "书店 là hiệu sách.",
    },
    "70000013-0000-4000-8000-000000000005": {
      question_id: "70000013-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "笔 là cây bút.",
    },
    "70000013-0000-4000-8000-000000000006": {
      question_id: "70000013-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "同学 là bạn cùng trường lớp.",
    },
    "70000013-0000-4000-8000-000000000007": {
      question_id: "70000013-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "上学 là đi học.",
    },
    "70000013-0000-4000-8000-000000000008": {
      question_id: "70000013-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "我想买 (Tôi muốn mua) 两本中文书 (hai cuốn sách tiếng Trung).",
    },
  },
};


// BÀI 14: LỚP HỌC & BÀI TẬP
export const LESSON_14_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-014",
  slug: "hsk1-lesson-14",
  quiz: {
    id: "77777777-7777-4777-8777-000000000014",
    lesson_id: "l-hsk1-014",
    revision: 1,
    title: "Mini Quiz Bài 14: Lớp học & Bài tập",
  },
  lessonTitle: "Bài 14: Lớp học & Bài tập",
  questions: [
    {
      id: "70000014-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000014",
      sort_order: 1,
      prompt: "Từ nào mang nghĩa là 'phòng học, lớp học'?",
      choices: ["教室 (jiàoshì)", "书店 (shūdiàn)", "饭馆 (fànguǎn)", "房间 (fángjiān)"],
    },
    {
      id: "70000014-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000014",
      sort_order: 2,
      prompt: "Cặp cụm từ 'vào lớp - tan học' là:",
      choices: ["上课 (shàngkè) - 下课 (xiàkè)", "上班 - 下班", "上学 - 放学", "买 - 卖"],
    },
    {
      id: "70000014-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000014",
      sort_order: 3,
      prompt: "Từ nào mang nghĩa là 'máy vi tính'?",
      choices: ["电脑 (diànnǎo)", "电视 (diànshì)", "电话 (diànhuà)", "手机 (shǒujī)"],
    },
    {
      id: "70000014-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000014",
      sort_order: 4,
      prompt: "Đồ vật dùng để đựng sách vở mang đi học là:",
      choices: ["书包 (shūbāo)", "桌子 (zhuōzi)", "椅子 (yǐzi)", "本子 (běnzi)"],
    },
    {
      id: "70000014-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000014",
      sort_order: 5,
      prompt: "Từ 'vấn đề, câu hỏi thắc mắc' trong tiếng Trung là:",
      choices: ["问题 (wèntí)", "学习 (xuéxí)", "考试 (kǎoshì)", "汉字 (hànzì)"],
    },
    {
      id: "70000014-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000014",
      sort_order: 6,
      prompt: "Từ nào chỉ 'kỳ thi, thi cử'?",
      choices: ["考试 (kǎoshì)", "练习 (liànxí)", "做题 (zuòtí)", "读书 (dúshū)"],
    },
    {
      id: "70000014-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000014",
      sort_order: 7,
      prompt: "Bàn và ghế trong lớp học lần lượt là:",
      choices: ["桌子 (zhuōzi) 和 椅子 (yǐzi)", "书包 和 电脑", "笔 和 本子", "教室 和 房间"],
    },
    {
      id: "70000014-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000014",
      sort_order: 8,
      prompt: "Khi muốn nói: 'Thầy ơi, em có một câu hỏi', học sinh nói:",
      choices: ["老师，我有一个问题。", "老师，我去考试了。", "老师，我们下课吧。", "老师，我想买电脑。"],
    },
  ],
  answerKeys: {
    "70000014-0000-4000-8000-000000000001": {
      question_id: "70000014-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "教室 là phòng học.",
    },
    "70000014-0000-4000-8000-000000000002": {
      question_id: "70000014-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "上课 là vào học, 下课 là tan học.",
    },
    "70000014-0000-4000-8000-000000000003": {
      question_id: "70000014-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "电脑 (điện não) là máy tính vi tính.",
    },
    "70000014-0000-4000-8000-000000000004": {
      question_id: "70000014-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "书包 là cặp sách, ba lô đi học.",
    },
    "70000014-0000-4000-8000-000000000005": {
      question_id: "70000014-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "问题 là vấn đề hoặc câu hỏi.",
    },
    "70000014-0000-4000-8000-000000000006": {
      question_id: "70000014-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "考试 là thi cử, kỳ thi.",
    },
    "70000014-0000-4000-8000-000000000007": {
      question_id: "70000014-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "桌子 (bàn) và 椅子 (ghế).",
    },
    "70000014-0000-4000-8000-000000000008": {
      question_id: "70000014-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "老师，我有一个问题 (Thầy ơi, em có một câu hỏi).",
    },
  },
};


// BÀI 15: GIA ĐÌNH & THÚ CƯNG
export const LESSON_15_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-015",
  slug: "hsk1-lesson-15",
  quiz: {
    id: "77777777-7777-4777-8777-000000000015",
    lesson_id: "l-hsk1-015",
    revision: 1,
    title: "Mini Quiz Bài 15: Gia đình & Thú cưng",
  },
  lessonTitle: "Bài 15: Gia đình & Thú cưng",
  questions: [
    {
      id: "70000015-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000015",
      sort_order: 1,
      prompt: "Từ nào có nghĩa là 'người nhà, gia đình'?",
      choices: ["家人 (jiārén)", "朋友 (péngyou)", "同学 (tóngxué)", "医生 (yīshēng)"],
    },
    {
      id: "70000015-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000015",
      sort_order: 2,
      prompt: "Em trai và em gái trong tiếng Trung lần lượt là:",
      choices: ["弟弟 (dìdi) 和 妹妹 (mèimei)", "哥哥 和 姐姐", "儿子 和 女儿", "爸爸 和 妈妈"],
    },
    {
      id: "70000015-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000015",
      sort_order: 3,
      prompt: "Con trai và con gái lần lượt là:",
      choices: ["儿子 (érzi) 和 女儿 (nǚ'ér)", "弟弟 和 妹妹", "男 和 女", "孩子 和 小朋友"],
    },
    {
      id: "70000015-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000015",
      sort_order: 4,
      prompt: "Động từ 'ở, cư trú' trong tiếng Trung là:",
      choices: ["住 (zhù)", "在 (zài)", "去 (qù)", "来 (lái)"],
    },
    {
      id: "70000015-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000015",
      sort_order: 5,
      prompt: "Từ nào mang nghĩa là 'căn phòng'?",
      choices: ["房间 (fángjiān)", "教室 (jiàoshì)", "饭馆 (fànguǎn)", "商店 (shāngdiàn)"],
    },
    {
      id: "70000015-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000015",
      sort_order: 6,
      prompt: "Con mèo và con chó lần lượt là:",
      choices: ["猫 (māo) 和 狗 (gǒu)", "只 和 条", "鱼 和 鸟", "鸡 和 鸭"],
    },
    {
      id: "70000015-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000015",
      sort_order: 7,
      prompt: "Lượng từ phù hợp cho mèo và chó là:",
      choices: ["只 (zhī)", "本 (běn)", "个 (gè)", "张 (zhāng)"],
    },
    {
      id: "70000015-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000015",
      sort_order: 8,
      prompt: "Câu nào có nghĩa: 'Gia đình tôi sống ở Bắc Kinh'?",
      choices: ["我和家人住在北京。", "我朋友在北京工作。", "这是我女儿的房间。", "我家有一只小狗。"],
    },
  ],
  answerKeys: {
    "70000015-0000-4000-8000-000000000001": {
      question_id: "70000015-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "家人 là người trong gia đình.",
    },
    "70000015-0000-4000-8000-000000000002": {
      question_id: "70000015-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "弟弟 (em trai) và 妹妹 (em gái).",
    },
    "70000015-0000-4000-8000-000000000003": {
      question_id: "70000015-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "儿子 (con trai) và 女儿 (con gái).",
    },
    "70000015-0000-4000-8000-000000000004": {
      question_id: "70000015-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "住 (zhù) nghĩa là cư trú, sinh sống.",
    },
    "70000015-0000-4000-8000-000000000005": {
      question_id: "70000015-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "房间 là căn phòng.",
    },
    "70000015-0000-4000-8000-000000000006": {
      question_id: "70000015-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "猫 là mèo, 狗 là chó.",
    },
    "70000015-0000-4000-8000-000000000007": {
      question_id: "70000015-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "只 là lượng từ thông dụng cho động vật như chó mèo.",
    },
    "70000015-0000-4000-8000-000000000008": {
      question_id: "70000015-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "我和家人住在北京 (Tôi và người nhà sống ở Bắc Kinh).",
    },
  },
};


// BÀI 16: SỨC KHỎE & THỂ THAO
export const LESSON_16_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-016",
  slug: "hsk1-lesson-16",
  quiz: {
    id: "77777777-7777-4777-8777-000000000016",
    lesson_id: "l-hsk1-016",
    revision: 1,
    title: "Mini Quiz Bài 16: Sức khỏe & Thể thao",
  },
  lessonTitle: "Bài 16: Sức khỏe & Thể thao",
  questions: [
    {
      id: "70000016-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000016",
      sort_order: 1,
      prompt: "Từ 'thân thể, sức khỏe' trong tiếng Trung là:",
      choices: ["身体 (shēntǐ)", "生病 (shēngbìng)", "看病 (kànbìng)", "吃药 (chīyào)"],
    },
    {
      id: "70000016-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000016",
      sort_order: 2,
      prompt: "Cụm từ chỉ hành động 'đi khám bệnh, gặp bác sĩ' là:",
      choices: ["看病 (kànbìng)", "生病 (shēngbìng)", "吃药 (chīyào)", "睡觉 (shuìjiào)"],
    },
    {
      id: "70000016-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000016",
      sort_order: 3,
      prompt: "Từ nào mang nghĩa là 'thuốc'?",
      choices: ["药 (yào)", "茶 (chá)", "水 (shuǐ)", "饭 (fàn)"],
    },
    {
      id: "70000016-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000016",
      sort_order: 4,
      prompt: "Động từ 'thức dậy' và 'đi ngủ' lần lượt là:",
      choices: ["起床 (qǐchuáng) 和 睡觉 (shuìjiào)", "跑步 和 游泳", "工作 和 休息", "洗 和 穿"],
    },
    {
      id: "70000016-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000016",
      sort_order: 5,
      prompt: "Từ 'nghỉ ngơi' trong tiếng Trung là:",
      choices: ["休息 (xiūxi)", "生病 (shēngbìng)", "跑步 (pǎobù)", "做饭 (zuòfàn)"],
    },
    {
      id: "70000016-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000016",
      sort_order: 6,
      prompt: "Môn thể thao 'đá bóng' là:",
      choices: ["踢足球 (tī zúqiú)", "跑步 (pǎobù)", "游泳 (yóuyǒng)", "打球 (dǎqiú)"],
    },
    {
      id: "70000016-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000016",
      sort_order: 7,
      prompt: "Từ nào có nghĩa là 'bơi lội'?",
      choices: ["游泳 (yóuyǒng)", "跑步 (pǎobù)", "跳舞 (tiàowǔ)", "踢球 (tīqiú)"],
    },
    {
      id: "70000016-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000016",
      sort_order: 8,
      prompt: "Khi cảm thấy mệt mỏi thể xác, người ta dùng tính từ nào?",
      choices: ["累 (lèi)", "冷 (lěng)", "热 (rè)", "忙 (máng)"],
    },
  ],
  answerKeys: {
    "70000016-0000-4000-8000-000000000001": {
      question_id: "70000016-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "身体 nghĩa là thân thể, sức khỏe.",
    },
    "70000016-0000-4000-8000-000000000002": {
      question_id: "70000016-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "看病 là đi khám bệnh.",
    },
    "70000016-0000-4000-8000-000000000003": {
      question_id: "70000016-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "药 là thuốc chữa bệnh.",
    },
    "70000016-0000-4000-8000-000000000004": {
      question_id: "70000016-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "起床 là thức dậy, 睡觉 là đi ngủ.",
    },
    "70000016-0000-4000-8000-000000000005": {
      question_id: "70000016-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "休息 là nghỉ ngơi.",
    },
    "70000016-0000-4000-8000-000000000006": {
      question_id: "70000016-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "踢足球 là đá bóng.",
    },
    "70000016-0000-4000-8000-000000000007": {
      question_id: "70000016-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "游泳 là bơi lội.",
    },
    "70000016-0000-4000-8000-000000000008": {
      question_id: "70000016-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "累 (lèi) nghĩa là mệt mỏi.",
    },
  },
};


// BÀI 17: TRANG PHỤC & MUA SẮM
export const LESSON_17_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-017",
  slug: "hsk1-lesson-17",
  quiz: {
    id: "77777777-7777-4777-8777-000000000017",
    lesson_id: "l-hsk1-017",
    revision: 1,
    title: "Mini Quiz Bài 17: Trang phục & Mua sắm",
  },
  lessonTitle: "Bài 17: Trang phục & Mua sắm",
  questions: [
    {
      id: "70000017-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000017",
      sort_order: 1,
      prompt: "Từ nào có nghĩa là 'quần áo, trang phục'?",
      choices: ["衣服 (yīfu)", "颜色 (yánsè)", "东西 (dōngxi)", "本子 (běnzi)"],
    },
    {
      id: "70000017-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000017",
      sort_order: 2,
      prompt: "Lượng từ dùng cho quần áo (chiếc áo, bộ đồ) là:",
      choices: ["件 (jiàn)", "本 (běn)", "只 (zhī)", "个 (gè)"],
    },
    {
      id: "70000017-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000017",
      sort_order: 3,
      prompt: "Động từ 'mặc' quần áo trong tiếng Trung là:",
      choices: ["穿 (chuān)", "看 (kàn)", "买 (mǎi)", "卖 (mài)"],
    },
    {
      id: "70000017-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000017",
      sort_order: 4,
      prompt: "Cặp màu sắc 'đỏ - trắng' là:",
      choices: ["红 (hóng) - 白 (bái)", "黑 (hēi) - 蓝 (lán)", "绿 (lǜ) - 黄 (huáng)", "新 (xīn) - 旧 (jiù)"],
    },
    {
      id: "70000017-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000017",
      sort_order: 5,
      prompt: "Màu sắc của bầu trời quang đãng (màu xanh lam) là:",
      choices: ["蓝 (lán)", "绿 (lǜ)", "红 (hóng)", "黑 (hēi)"],
    },
    {
      id: "70000017-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000017",
      sort_order: 6,
      prompt: "Tính từ 'xinh đẹp, đẹp đẽ' trong tiếng Trung là:",
      choices: ["漂亮 (piàoliang)", "好看 (hǎokàn)", "好吃 (hǎochī)", "高兴 (gāoxìng)"],
    },
    {
      id: "70000017-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000017",
      sort_order: 7,
      prompt: "Cặp từ 'mới - cũ' là:",
      choices: ["新 (xīn) - 旧 (jiù)", "长 (cháng) - 短 (duǎn)", "大 (dà) - 小 (xiǎo)", "多 (duō) - 少 (shǎo)"],
    },
    {
      id: "70000017-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000017",
      sort_order: 8,
      prompt: "Từ nào mang nghĩa là 'bán' (trái với 买 - mua)?",
      choices: ["卖 (mài)", "买 (mǎi)", "给 (gěi)", "找 (zhǎo)"],
    },
  ],
  answerKeys: {
    "70000017-0000-4000-8000-000000000001": {
      question_id: "70000017-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "衣服 là quần áo.",
    },
    "70000017-0000-4000-8000-000000000002": {
      question_id: "70000017-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "件 là lượng từ chuẩn cho áo quần.",
    },
    "70000017-0000-4000-8000-000000000003": {
      question_id: "70000017-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "穿 (chuān) nghĩa là mặc quần áo, đi giày.",
    },
    "70000017-0000-4000-8000-000000000004": {
      question_id: "70000017-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "红 là đỏ, 白 là trắng.",
    },
    "70000017-0000-4000-8000-000000000005": {
      question_id: "70000017-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "蓝 là màu xanh lam.",
    },
    "70000017-0000-4000-8000-000000000006": {
      question_id: "70000017-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "漂亮 là xinh đẹp.",
    },
    "70000017-0000-4000-8000-000000000007": {
      question_id: "70000017-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "新 (mới) và 旧 (cũ).",
    },
    "70000017-0000-4000-8000-000000000008": {
      question_id: "70000017-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "卖 (mài - thanh 4) là bán, 买 (mǎi - thanh 3) là mua.",
    },
  },
};


// BÀI 18: ĂN UỐNG & MÓN NGON
export const LESSON_18_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-018",
  slug: "hsk1-lesson-18",
  quiz: {
    id: "77777777-7777-4777-8777-000000000018",
    lesson_id: "l-hsk1-018",
    revision: 1,
    title: "Mini Quiz Bài 18: Ăn uống & Món ngon",
  },
  lessonTitle: "Bài 18: Ăn uống & Món ngon",
  questions: [
    {
      id: "70000018-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000018",
      sort_order: 1,
      prompt: "Ba bữa ăn trong ngày (sáng, trưa, tối) lần lượt là:",
      choices: ["早饭、午饭、晚饭", "米饭、包子、面条", "苹果、西瓜、鸡蛋", "茶、牛奶、咖啡"],
    },
    {
      id: "70000018-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000018",
      sort_order: 2,
      prompt: "Món ăn truyền thống 'sủi cảo, bánh chẻo' là:",
      choices: ["饺子 (jiǎozi)", "包子 (bāozi)", "面包 (miànbāo)", "米饭 (mǐfàn)"],
    },
    {
      id: "70000018-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000018",
      sort_order: 3,
      prompt: "Từ nào chỉ 'quả táo'?",
      choices: ["苹果 (píngguǒ)", "西瓜 (xīguā)", "水果 (shuǐguǒ)", "鸡蛋 (jīdàn)"],
    },
    {
      id: "70000018-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000018",
      sort_order: 4,
      prompt: "Từ nào chỉ 'quả dưa hấu'?",
      choices: ["西瓜 (xīguā)", "苹果 (píngguǒ)", "包子 (bāozi)", "面包 (miànbāo)"],
    },
    {
      id: "70000018-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000018",
      sort_order: 5,
      prompt: "Từ 'trứng gà' trong tiếng Trung là:",
      choices: ["鸡蛋 (jīdàn)", "牛奶 (niúnǎi)", "咖啡 (kāfēi)", "包子 (bāozi)"],
    },
    {
      id: "70000018-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000018",
      sort_order: 6,
      prompt: "Đồ uống 'sữa bò' và 'cà phê' lần lượt là:",
      choices: ["牛奶 (niúnǎi) 和 咖啡 (kāfēi)", "茶 和 水", "果汁 和 可乐", "啤酒 和 汤"],
    },
    {
      id: "70000018-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000018",
      sort_order: 7,
      prompt: "Cảm giác thèm ăn khi bụng rỗng (đói) là:",
      choices: ["饿 (è)", "渴 (kě)", "甜 (tián)", "累 (lèi)"],
    },
    {
      id: "70000018-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000018",
      sort_order: 8,
      prompt: "Vị ngọt trong tiếng Trung là:",
      choices: ["甜 (tián)", "苦 (kǔ)", "辣 (là)", "酸 (suān)"],
    },
  ],
  answerKeys: {
    "70000018-0000-4000-8000-000000000001": {
      question_id: "70000018-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "早饭 (bữa sáng), 午饭 (bữa trưa), 晚饭 (bữa tối).",
    },
    "70000018-0000-4000-8000-000000000002": {
      question_id: "70000018-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "饺子 là bánh sủi cảo/chẻo.",
    },
    "70000018-0000-4000-8000-000000000003": {
      question_id: "70000018-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "苹果 là quả táo.",
    },
    "70000018-0000-4000-8000-000000000004": {
      question_id: "70000018-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "西瓜 là dưa hấu.",
    },
    "70000018-0000-4000-8000-000000000005": {
      question_id: "70000018-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "鸡蛋 là trứng gà.",
    },
    "70000018-0000-4000-8000-000000000006": {
      question_id: "70000018-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "牛奶 là sữa bò, 咖啡 là cà phê.",
    },
    "70000018-0000-4000-8000-000000000007": {
      question_id: "70000018-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "饿 (è) nghĩa là đói bụng.",
    },
    "70000018-0000-4000-8000-000000000008": {
      question_id: "70000018-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "甜 (tián) nghĩa là ngọt.",
    },
  },
};


// BÀI 19: SIÊU THỊ & NƠI LÀM VIỆC
export const LESSON_19_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-019",
  slug: "hsk1-lesson-19",
  quiz: {
    id: "77777777-7777-4777-8777-000000000019",
    lesson_id: "l-hsk1-019",
    revision: 1,
    title: "Mini Quiz Bài 19: Siêu thị & Nơi làm việc",
  },
  lessonTitle: "Bài 19: Siêu thị & Nơi làm việc",
  questions: [
    {
      id: "70000019-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000019",
      sort_order: 1,
      prompt: "Từ nào có nghĩa là 'siêu thị'?",
      choices: ["超市 (chāoshì)", "饭馆 (fànguǎn)", "公司 (gōngsī)", "书店 (shūdiàn)"],
    },
    {
      id: "70000019-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000019",
      sort_order: 2,
      prompt: "Quán ăn nhỏ và nhà hàng/khách sạn lớn là:",
      choices: ["饭馆 (fànguǎn) 和 饭店 (fàndiàn)", "超市 和 商店", "公司 和 车站", "学校 和 医院"],
    },
    {
      id: "70000019-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000019",
      sort_order: 3,
      prompt: "Từ nào chỉ 'công ty'?",
      choices: ["公司 (gōngsī)", "工厂 (gōngchǎng)", "学校 (xuéxiào)", "商店 (shāngdiàn)"],
    },
    {
      id: "70000019-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000019",
      sort_order: 4,
      prompt: "Cặp từ 'đi làm - tan ca/tan sở' là:",
      choices: ["上班 (shàngbān) - 下班 (xiàbān)", "上学 - 下课", "买 - 卖", "来 - 去"],
    },
    {
      id: "70000019-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000019",
      sort_order: 5,
      prompt: "Tính từ chỉ tình trạng có nhiều việc phải làm, không rảnh rỗi là:",
      choices: ["忙 (máng)", "累 (lèi)", "闲 (xián)", "冷 (lěng)"],
    },
    {
      id: "70000019-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000019",
      sort_order: 6,
      prompt: "Cụm từ mang nghĩa 'không sao cả, không có việc gì bận' là:",
      choices: ["没事 (méishì)", "有事 (yǒushì)", "工作 (gōngzuò)", "对不起 (duìbuqǐ)"],
    },
    {
      id: "70000019-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000019",
      sort_order: 7,
      prompt: "Câu nào diễn đạt: 'Bố tôi làm việc ở công ty máy tính'?",
      choices: ["我爸爸在电脑公司工作。", "我妈妈在医院当医生。", "哥哥是大学生。", "他在商店买东西。"],
    },
    {
      id: "70000019-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000019",
      sort_order: 8,
      prompt: "Dịch câu: 'Hôm nay bạn có bận không?' sang tiếng Trung:",
      choices: ["你今天忙不忙？", "你今天几点下班？", "你在哪儿工作？", "你喜欢去超市吗？"],
    },
  ],
  answerKeys: {
    "70000019-0000-4000-8000-000000000001": {
      question_id: "70000019-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "超市 là siêu thị.",
    },
    "70000019-0000-4000-8000-000000000002": {
      question_id: "70000019-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "饭馆 (quán ăn nhỏ) và 饭店 (nhà hàng lớn/khách sạn).",
    },
    "70000019-0000-4000-8000-000000000003": {
      question_id: "70000019-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "公司 là công ty.",
    },
    "70000019-0000-4000-8000-000000000004": {
      question_id: "70000019-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "上班 (đi làm) và 下班 (tan ca).",
    },
    "70000019-0000-4000-8000-000000000005": {
      question_id: "70000019-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "忙 là bận rộn.",
    },
    "70000019-0000-4000-8000-000000000006": {
      question_id: "70000019-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "没事 là không có việc gì / không sao.",
    },
    "70000019-0000-4000-8000-000000000007": {
      question_id: "70000019-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "我爸爸在电脑公司工作 (Bố tôi làm việc ở công ty máy tính).",
    },
    "70000019-0000-4000-8000-000000000008": {
      question_id: "70000019-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "你今天忙不忙？(Hôm nay bạn có bận không?).",
    },
  },
};


// BÀI 20: GIẢI TRÍ & SỞ THÍCH
export const LESSON_20_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-020",
  slug: "hsk1-lesson-20",
  quiz: {
    id: "77777777-7777-4777-8777-000000000020",
    lesson_id: "l-hsk1-020",
    revision: 1,
    title: "Mini Quiz Bài 20: Giải trí & Sở thích",
  },
  lessonTitle: "Bài 20: Giải trí & Sở thích",
  questions: [
    {
      id: "70000020-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000020",
      sort_order: 1,
      prompt: "Từ nào có nghĩa là 'rạp chiếu phim'?",
      choices: ["电影院 (diànyǐngyuàn)", "电影 (diànyǐng)", "电视 (diànshì)", "剧场 (jùchǎng)"],
    },
    {
      id: "70000020-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000020",
      sort_order: 2,
      prompt: "Cụm từ chỉ hành động 'ca hát' là:",
      choices: ["唱歌 (chànggē)", "跳舞 (tiàowǔ)", "看书 (kànshū)", "玩儿 (wánr)"],
    },
    {
      id: "70000020-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000020",
      sort_order: 3,
      prompt: "Cụm từ chỉ hành động 'khiêu vũ, nhảy múa' là:",
      choices: ["跳舞 (tiàowǔ)", "唱歌 (chànggē)", "跑步 (pǎobù)", "踢球 (tīqiú)"],
    },
    {
      id: "70000020-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000020",
      sort_order: 4,
      prompt: "Từ 'âm nhạc' trong tiếng Trung là:",
      choices: ["音乐 (yīnyuè)", "电影 (diànyǐng)", "电视 (diànshì)", "歌 (gē)"],
    },
    {
      id: "70000020-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000020",
      sort_order: 5,
      prompt: "Khi một bộ phim hay hoặc một cuốn sách đẹp mắt, người ta khen là:",
      choices: ["好看 (hǎokàn)", "好听 (hǎotīng)", "好吃 (hǎochī)", "好喝 (hǎohē)"],
    },
    {
      id: "70000020-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000020",
      sort_order: 6,
      prompt: "Khi một bài hát hay hoặc giai điệu êm ái, người ta khen là:",
      choices: ["好听 (hǎotīng)", "好看 (hǎokàn)", "好玩儿 (hǎowánr)", "好吃 (hǎochī)"],
    },
    {
      id: "70000020-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000020",
      sort_order: 7,
      prompt: "Tính từ chỉ trò chơi vui vẻ, thú vị là:",
      choices: ["好玩儿 (hǎowánr)", "好看 (hǎokàn)", "好听 (hǎotīng)", "好吃 (hǎochī)"],
    },
    {
      id: "70000020-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000020",
      sort_order: 8,
      prompt: "Câu nào có nghĩa: 'Tối nay chúng ta cùng đi xem phim nhé!'?",
      choices: ["今天晚上我们一起去看电影吧！", "今天下午我去唱歌。", "他在家里看电视。", "周末我和朋友跳舞。"],
    },
  ],
  answerKeys: {
    "70000020-0000-4000-8000-000000000001": {
      question_id: "70000020-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "电影院 là rạp chiếu phim.",
    },
    "70000020-0000-4000-8000-000000000002": {
      question_id: "70000020-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "唱歌 là hát, ca hát.",
    },
    "70000020-0000-4000-8000-000000000003": {
      question_id: "70000020-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "跳舞 là khiêu vũ, nhảy múa.",
    },
    "70000020-0000-4000-8000-000000000004": {
      question_id: "70000020-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "音乐 là âm nhạc.",
    },
    "70000020-0000-4000-8000-000000000005": {
      question_id: "70000020-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "好看 dùng để khen cái gì nhìn đẹp, xem hay.",
    },
    "70000020-0000-4000-8000-000000000006": {
      question_id: "70000020-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "好听 dùng để khen âm thanh nghe hay.",
    },
    "70000020-0000-4000-8000-000000000007": {
      question_id: "70000020-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "好玩儿 là vui, thú vị.",
    },
    "70000020-0000-4000-8000-000000000008": {
      question_id: "70000020-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "今天晚上我们一起去看电影吧！",
    },
  },
};


// BÀI 21: GIAO TIẾP & ĐIỆN THOẠI
// BÀI 21: GIAO TIẾP QUA ĐIỆN THOẠI
export const LESSON_21_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-021",
  slug: "hsk1-lesson-21",
  quiz: {
    id: "77777777-7777-4777-8777-000000000021",
    lesson_id: "l-hsk1-021",
    revision: 1,
    title: "Mini Quiz Bài 21: Giao tiếp & Điện thoại",
  },
  lessonTitle: "Bài 21: Giao tiếp & Điện thoại",
  questions: [
    {
      id: "70000021-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 1,
      prompt: "Từ dùng khi bắt máy nghe điện thoại (Alo) trong tiếng Trung là gì?",
      choices: ["喂 (wèi)", "好 (hǎo)", "请 (qǐng)", "对 (duì)"],
    },
    {
      id: "70000021-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 2,
      prompt: "Cụm động tân mang nghĩa 'gọi điện thoại' là gì?",
      choices: ["打电话 (dǎ diànhuà)", "看电视 (kàn diànshì)", "玩手机 (wán shǒujī)", "买电脑 (mǎi diànnǎo)"],
    },
    {
      id: "70000021-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 3,
      prompt: "Từ chỉ 'điện thoại di động' là gì?",
      choices: ["手机 (shǒujī)", "电话 (diànhuà)", "电影 (diànyǐng)", "电视 (diànshì)"],
    },
    {
      id: "70000021-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 4,
      prompt: "Khi muốn hỏi thăm lịch sự người nghe điện thoại, người ta dùng từ nào?",
      choices: ["请问 (qǐngwèn)", "喂问 (wèiwèn)", "说问 (shuōwèn)", "看见 (kànjiàn)"],
    },
    {
      id: "70000021-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 5,
      prompt: "Từ nào mang nghĩa là 'nói chuyện'?",
      choices: ["说话 (shuōhuà)", "听见 (tīngjiàn)", "请坐 (qǐngzuò)", "打电话 (dǎ diànhuà)"],
    },
    {
      id: "70000021-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 6,
      prompt: "Cụm 'nghe thấy' trong tiếng Trung là gì?",
      choices: ["听见 (tīngjiàn)", "看见 (kànjiàn)", "听写 (tīngxiě)", "看书 (kànshū)"],
    },
    {
      id: "70000021-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 7,
      prompt: "Từ '看见' (kànjiàn) có nghĩa là gì?",
      choices: ["Nhìn thấy", "Nghe thấy", "Nói chuyện", "Gặp gỡ"],
    },
    {
      id: "70000021-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 8,
      prompt: "Trong câu '请你说慢一点儿。', từ '请' đóng vai trò gì?",
      choices: ["Kính từ biểu thị lịch sự (Xin mời / Làm ơn)", "Đại từ nhân xưng", "Trợ từ thời thái", "Lượng từ chỉ người"],
    },
  ],
  answerKeys: {
    "70000021-0000-4000-8000-000000000001": {
      question_id: "70000021-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'喂' (wèi) là thói quen chào mở đầu khi nghe máy điện thoại.",
    },
    "70000021-0000-4000-8000-000000000002": {
      question_id: "70000021-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "Động từ '打' kết hợp với danh từ '电话' tạo thành cụm '打电话' (gọi điện thoại).",
    },
    "70000021-0000-4000-8000-000000000003": {
      question_id: "70000021-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'手机' (shǒujī) nghĩa là điện thoại di động (thủ cơ).",
    },
    "70000021-0000-4000-8000-000000000004": {
      question_id: "70000021-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'请问' (qǐngwèn) có nghĩa là 'xin hỏi' dùng rất lịch sự.",
    },
    "70000021-0000-4000-8000-000000000005": {
      question_id: "70000021-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'说话' (shuōhuà) nghĩa là nói chuyện, phát biểu lời nói.",
    },
    "70000021-0000-4000-8000-000000000006": {
      question_id: "70000021-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'听见' (tīngjiàn) là bổ ngữ kết quả biểu thị đã nghe thấy âm thanh.",
    },
    "70000021-0000-4000-8000-000000000007": {
      question_id: "70000021-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "'看见' (kànjiàn) là nhìn thấy, thấy được hình ảnh của đối tượng.",
    },
    "70000021-0000-4000-8000-000000000008": {
      question_id: "70000021-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "'请' (qǐng) đặt đầu câu thể hiện lời thỉnh cầu, nhờ vả lịch sự.",
    },
  },
};

// BÀI 22: BẠN BÈ & GIÚP ĐỠ
export const LESSON_22_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-022",
  slug: "hsk1-lesson-22",
  quiz: {
    id: "77777777-7777-4777-8777-000000000022",
    lesson_id: "l-hsk1-022",
    revision: 1,
    title: "Mini Quiz Bài 22: Bạn bè & Giúp đỡ",
  },
  lessonTitle: "Bài 22: Bạn bè & Giúp đỡ",
  questions: [
    {
      id: "70000022-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 1,
      prompt: "Từ nào mang nghĩa là 'bạn bè' trong tiếng Trung?",
      choices: ["朋友 (péngyou)", "同学 (tóngxué)", "老师 (lǎoshī)", "医生 (yīshēng)"],
    },
    {
      id: "70000022-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 2,
      prompt: "Cụm từ 'bạn trai' trong tiếng Trung là gì?",
      choices: ["男朋友 (nánpéngyou)", "女朋友 (nǚpéngyou)", "男学生 (nánxuésheng)", "好朋友 (hǎopéngyou)"],
    },
    {
      id: "70000022-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 3,
      prompt: "Từ 'quen biết' có phiên âm chuẩn xác là gì?",
      choices: ["认识 (rènshi)", "知道 (zhīdào)", "觉得 (juéde)", "高兴 (gāoxìng)"],
    },
    {
      id: "70000022-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 4,
      prompt: "Câu giao tiếp kinh điển 'Rất vui được quen biết bạn!' nói thế nào?",
      choices: ["很高兴认识你！", "我很喜欢你！", "你可以帮我吗？", "请问你是谁？"],
    },
    {
      id: "70000022-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 5,
      prompt: "Từ nào mang nghĩa là 'giúp đỡ'?",
      choices: ["帮助 (bāngzhù)", "说话 (shuōhuà)", "工作 (gōngzuò)", "学习 (xuéxí)"],
    },
    {
      id: "70000022-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 6,
      prompt: "Động từ 'hỏi' trong tiếng Trung là gì?",
      choices: ["问 (wèn)", "帮 (bāng)", "见 (jiàn)", "说 (shuō)"],
    },
    {
      id: "70000022-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 7,
      prompt: "Xưng hô lịch sự đối với nam giới (ông, ngài, anh) là:",
      choices: ["先生 (xiānsheng)", "女士 (nǚshì)", "小姐 (xiǎojiě)", "朋友 (péngyou)"],
    },
    {
      id: "70000022-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 8,
      prompt: "Xưng hô lịch sự đối với nữ giới (bà, cô) là:",
      choices: ["女士 (nǚshì)", "先生 (xiānsheng)", "妈妈 (māma)", "老师 (lǎoshī)"],
    },
  ],
  answerKeys: {
    "70000022-0000-4000-8000-000000000001": {
      question_id: "70000022-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'朋友' (péngyou) nghĩa là bạn bè.",
    },
    "70000022-0000-4000-8000-000000000002": {
      question_id: "70000022-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "'男朋友' (nánpéngyou) là bạn trai (người yêu nam).",
    },
    "70000022-0000-4000-8000-000000000003": {
      question_id: "70000022-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'认识' có phiên âm chuẩn là rènshi (chữ shi đọc thanh nhẹ).",
    },
    "70000022-0000-4000-8000-000000000004": {
      question_id: "70000022-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'很高兴认识你！' (Hěn gāoxìng rènshi nǐ!) là câu chào làm quen lịch thiệp.",
    },
    "70000022-0000-4000-8000-000000000005": {
      question_id: "70000022-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'帮助' (bāngzhù) nghĩa là giúp đỡ, tương trợ.",
    },
    "70000022-0000-4000-8000-000000000006": {
      question_id: "70000022-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'问' (wèn) là động từ hỏi.",
    },
    "70000022-0000-4000-8000-000000000007": {
      question_id: "70000022-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "'先生' (xiānsheng) là kính từ xưng hô với nam giới.",
    },
    "70000022-0000-4000-8000-000000000008": {
      question_id: "70000022-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "'女士' (nǚshì) là danh từ xưng hô tôn trọng đối với phái nữ.",
    },
  },
};

// BÀI 23: ĐẠI TỪ NHÂN XƯNG & SỐ NHIỀU
export const LESSON_23_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-023",
  slug: "hsk1-lesson-23",
  quiz: {
    id: "77777777-7777-4777-8777-000000000023",
    lesson_id: "l-hsk1-023",
    revision: 1,
    title: "Mini Quiz Bài 23: Đại từ nhân xưng & Số nhiều",
  },
  lessonTitle: "Bài 23: Đại từ nhân xưng & Số nhiều",
  questions: [
    {
      id: "70000023-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 1,
      prompt: "Đại từ chỉ 'chúng tôi / chúng ta' là gì?",
      choices: ["我们 (wǒmen)", "你们 (nǐmen)", "他们 (tāmen)", "大家 (dàjiā)"],
    },
    {
      id: "70000023-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 2,
      prompt: "Đại từ chỉ 'các bạn' là gì?",
      choices: ["你们 (nǐmen)", "我们 (wǒmen)", "她们 (tāmen)", "先生们 (xiānshengmen)"],
    },
    {
      id: "70000023-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 3,
      prompt: "Chữ 'tā' nào dùng để chỉ đồ vật hoặc động vật (nó)?",
      choices: ["它 (tā)", "他 (tā)", "她 (tā)", "你 (nǐ)"],
    },
    {
      id: "70000023-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 4,
      prompt: "Khi nói về nhóm toàn nữ giới (các cô ấy), chữ Hán nào đúng?",
      choices: ["她们 (tāmen)", "他们 (tāmen)", "它们 (tāmen)", "大家 (dàjiā)"],
    },
    {
      id: "70000023-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 5,
      prompt: "Để thể hiện sự kính trọng đối với người đối thoại (ngài / ông), dùng đại từ nào?",
      choices: ["您 (nín)", "你 (nǐ)", "他 (tā)", "大家 (dàjiā)"],
    },
    {
      id: "70000023-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 6,
      prompt: "Từ mang nghĩa 'mọi người / cả nhà' là gì?",
      choices: ["大家 (dàjiā)", "我们 (wǒmen)", "他们 (tāmen)", "朋友 (péngyou)"],
    },
    {
      id: "70000023-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 7,
      prompt: "Hậu tố nào đứng sau đại từ nhân xưng hoặc danh từ chỉ người để tạo số nhiều?",
      choices: ["们 (men)", "个 (ge)", "些 (xiē)", "点 (diǎn)"],
    },
    {
      id: "70000023-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 8,
      prompt: "Thanh điệu chuẩn xác của hậu tố '们' khi đứng sau đại từ là gì?",
      choices: ["Thanh nhẹ (khinh thanh)", "Thanh 1 (mēn)", "Thanh 2 (mén)", "Thanh 4 (mèn)"],
    },
  ],
  answerKeys: {
    "70000023-0000-4000-8000-000000000001": {
      question_id: "70000023-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'我们' (wǒmen) là đại từ ngôi thứ nhất số nhiều.",
    },
    "70000023-0000-4000-8000-000000000002": {
      question_id: "70000023-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "'你们' (nǐmen) là đại từ ngôi thứ hai số nhiều.",
    },
    "70000023-0000-4000-8000-000000000003": {
      question_id: "70000023-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'它' (bộ miên) dùng để chỉ loài vật hoặc đồ vật vô tri vô giác.",
    },
    "70000023-0000-4000-8000-000000000004": {
      question_id: "70000023-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'她们' mang bộ nữ (女) biểu thị nhóm người toàn là phụ nữ.",
    },
    "70000023-0000-4000-8000-000000000005": {
      question_id: "70000023-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'您' (nín) mang bộ tâm (心) ở dưới biểu thị lòng kính trọng.",
    },
    "70000023-0000-4000-8000-000000000006": {
      question_id: "70000023-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'大家' (dàjiā) nghĩa là mọi người, tất cả mọi người.",
    },
    "70000023-0000-4000-8000-000000000007": {
      question_id: "70000023-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "Hậu tố '们' thêm sau đại từ/danh từ chỉ người để biến thành số nhiều.",
    },
    "70000023-0000-4000-8000-000000000008": {
      question_id: "70000023-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "Hậu tố '们' luôn được phát âm thanh nhẹ (neutral tone).",
    },
  },
};

// BÀI 24: ĐẠI TỪ CHỈ ĐỊNH & NGHI VẤN
export const LESSON_24_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-024",
  slug: "hsk1-lesson-24",
  quiz: {
    id: "77777777-7777-4777-8777-000000000024",
    lesson_id: "l-hsk1-024",
    revision: 1,
    title: "Mini Quiz Bài 24: Đại từ chỉ định & Nghi vấn",
  },
  lessonTitle: "Bài 24: Đại từ chỉ định & Nghi vấn",
  questions: [
    {
      id: "70000024-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 1,
      prompt: "Từ mang nghĩa 'những cái này' trong tiếng Trung là gì?",
      choices: ["这些 (zhèxiē)", "那些 (nàxiē)", "哪些 (nǎxiē)", "这个 (zhè ge)"],
    },
    {
      id: "70000024-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 2,
      prompt: "Từ mang nghĩa 'ở đây / chỗ này' là gì?",
      choices: ["这儿 / 这里 (zhèr / zhèlǐ)", "那儿 / 那里 (nàr / nàlǐ)", "哪儿 / 哪里 (nǎr / nǎlǐ)", "怎么 (zěnme)"],
    },
    {
      id: "70000024-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 3,
      prompt: "Đại từ chỉ định cự ly xa 'kia, đó' là chữ nào?",
      choices: ["那 (nà)", "这 (zhè)", "哪 (nǎ)", "谁 (shéi)"],
    },
    {
      id: "70000024-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 4,
      prompt: "Từ nào mang nghĩa 'những cái kia'?",
      choices: ["那些 (nàxiē)", "这些 (zhèxiē)", "哪些 (nǎxiē)", "那个 (nà ge)"],
    },
    {
      id: "70000024-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 5,
      prompt: "Từ dùng để hỏi 'ở đâu / chỗ nào' là:",
      choices: ["哪里 / 哪儿 (nǎli / nǎr)", "这里 / 这儿 (zhèlǐ / zhèr)", "那里 / 那儿 (nàlǐ / nàr)", "什么 (shénme)"],
    },
    {
      id: "70000024-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 6,
      prompt: "Từ dùng để hỏi 'cái nào' là:",
      choices: ["哪个 (nǎ ge)", "这个 (zhè ge)", "那个 (nà ge)", "几个人 (jǐ gè rén)"],
    },
    {
      id: "70000024-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 7,
      prompt: "Từ mang nghĩa 'những... nào' (hỏi số nhiều) là:",
      choices: ["哪些 (nǎxiē)", "那些 (nàxiē)", "这些 (zhèxiē)", "有些 (yǒuxiē)"],
    },
    {
      id: "70000024-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 8,
      prompt: "Điểm khác biệt rõ rệt về thanh điệu giữa '那' (kia) và '哪' (nào) là gì?",
      choices: ["'那' mang thanh 4 (nà), còn '哪' mang thanh 3 (nǎ)", "'那' mang thanh 1, '哪' mang thanh 2", "Cả hai đều mang thanh 4", "Không có sự khác nhau về thanh điệu"],
    },
  ],
  answerKeys: {
    "70000024-0000-4000-8000-000000000001": {
      question_id: "70000024-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'这些' (zhèxiē) kết hợp 这 với lượng từ số nhiều 些 chỉ những cái này.",
    },
    "70000024-0000-4000-8000-000000000002": {
      question_id: "70000024-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "'这儿' và '这里' là hai cách nói đồng nghĩa chỉ vị trí gần người nói.",
    },
    "70000024-0000-4000-8000-000000000003": {
      question_id: "70000024-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'那' (nà) là đại từ chỉ định cự ly xa (kia, đó).",
    },
    "70000024-0000-4000-8000-000000000004": {
      question_id: "70000024-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'那些' (nàxiē) nghĩa là những cái kia, những người kia.",
    },
    "70000024-0000-4000-8000-000000000005": {
      question_id: "70000024-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'哪里' hoặc '哪儿' là đại từ nghi vấn dùng để hỏi địa điểm, nơi chốn.",
    },
    "70000024-0000-4000-8000-000000000006": {
      question_id: "70000024-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'哪个' (nǎ ge) dùng để hỏi lựa chọn đơn lẻ (cái nào / người nào).",
    },
    "70000024-0000-4000-8000-000000000007": {
      question_id: "70000024-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "'哪些' (nǎxiē) dùng để hỏi về tập hợp nhiều đối tượng.",
    },
    "70000024-0000-4000-8000-000000000008": {
      question_id: "70000024-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "'那' đọc thanh 4 dứt khoát (nà), còn '哪' có bộ khẩu đọc thanh 3 luyến (nǎ).",
    },
  },
};

// BÀI 25: KHÔNG GIAN & PHƯƠNG HƯỚNG
export const LESSON_25_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-025",
  slug: "hsk1-lesson-25",
  quiz: {
    id: "77777777-7777-4777-8777-000000000025",
    lesson_id: "l-hsk1-025",
    revision: 1,
    title: "Mini Quiz Bài 25: Không gian & Phương hướng",
  },
  lessonTitle: "Bài 25: Không gian & Phương hướng",
  questions: [
    {
      id: "70000025-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 1,
      prompt: "Từ mang nghĩa 'bên cạnh' trong tiếng Trung là gì?",
      choices: ["旁边 (pángbiān)", "前边 (qiánbian)", "后边 (hòubian)", "里边 (lǐbian)"],
    },
    {
      id: "70000025-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 2,
      prompt: "Cặp từ trái nghĩa 'trên' và 'dưới' là gì?",
      choices: ["上 - 下 (shàng - xià)", "前 - 后 (qián - hòu)", "左 - 右 (zuǒ - yòu)", "里 - 外 (lǐ - wài)"],
    },
    {
      id: "70000025-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 3,
      prompt: "Cặp từ trái nghĩa 'trong' và 'ngoài' là gì?",
      choices: ["里 - 外 (lǐ - wài)", "东 - 西 (dōng - xī)", "南 - 北 (nán - běi)", "上 - 下 (shàng - xià)"],
    },
    {
      id: "70000025-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 4,
      prompt: "Bốn hướng chính 'Đông, Tây, Nam, Bắc' trong tiếng Trung đọc là:",
      choices: ["东、西、南、北 (dōng, xī, nán, běi)", "前、后、左、右 (qián, hòu, zuǒ, yòu)", "上、下、里、外 (shàng, xià, lǐ, wài)", "大、小、多、少 (dà, xiǎo, duō, shǎo)"],
    },
    {
      id: "70000025-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 5,
      prompt: "Từ 'phía trước' trong tiếng Trung là gì?",
      choices: ["前边 (qiánbian)", "后边 (hòubian)", "左边 (zuǒbian)", "右边 (yòubian)"],
    },
    {
      id: "70000025-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 6,
      prompt: "Từ 'phía sau' trong tiếng Trung là gì?",
      choices: ["后边 (hòubian)", "前边 (qiánbian)", "里边 (lǐbian)", "外边 (wàibian)"],
    },
    {
      id: "70000025-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 7,
      prompt: "Câu 'Sách ở trên bàn.' dịch chuẩn ngữ pháp là gì?",
      choices: ["书在桌子上。", "桌子在书上。", "书在上桌子。", "在上桌子有书。"],
    },
    {
      id: "70000025-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 8,
      prompt: "Vị trí của phương vị từ trong cụm từ chỉ địa điểm tiếng Trung như thế nào?",
      choices: ["Đứng sau danh từ (Danh từ + Phương vị từ)", "Đứng trước danh từ", "Đứng ở cuối câu", "Đứng trước chủ ngữ"],
    },
  ],
  answerKeys: {
    "70000025-0000-4000-8000-000000000001": {
      question_id: "70000025-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'旁边' (pángbiān) là phương vị từ chỉ vị trí bên cạnh.",
    },
    "70000025-0000-4000-8000-000000000002": {
      question_id: "70000025-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "'上' (trên) và '下' (dưới) là cặp phương vị từ cơ bản.",
    },
    "70000025-0000-4000-8000-000000000003": {
      question_id: "70000025-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'里' (trong) và '外' (ngoài) chỉ không gian bên trong hay ngoài.",
    },
    "70000025-0000-4000-8000-000000000004": {
      question_id: "70000025-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "Bốn hướng: 东 (Đông), 西 (Tây), 南 (Nam), 北 (Bắc).",
    },
    "70000025-0000-4000-8000-000000000005": {
      question_id: "70000025-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'前边' (qiánbian) là phía trước.",
    },
    "70000025-0000-4000-8000-000000000006": {
      question_id: "70000025-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'后边' (hòubian) là phía sau.",
    },
    "70000025-0000-4000-8000-000000000007": {
      question_id: "70000025-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "Cấu trúc: Vật + 在 + Nơi chốn + Phương vị từ: '书在桌子上。'",
    },
    "70000025-0000-4000-8000-000000000008": {
      question_id: "70000025-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "Trong tiếng Trung, phương vị từ luôn đứng SAU danh từ chỉ vị trí (Ví dụ: 学校里, 医院旁边).",
    },
  },
};

// BÀI 26: SỐ ĐẾM LỚN & PHÂN SỐ
export const LESSON_26_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-026",
  slug: "hsk1-lesson-26",
  quiz: {
    id: "77777777-7777-4777-8777-000000000026",
    lesson_id: "l-hsk1-026",
    revision: 1,
    title: "Mini Quiz Bài 26: Số đếm lớn & Phân số",
  },
  lessonTitle: "Bài 26: Số đếm lớn & Phân số",
  questions: [
    {
      id: "70000026-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 1,
      prompt: "Chữ Hán nào chỉ số 0 trong tiếng Trung?",
      choices: ["零 (líng)", "十 (shí)", "百 (bǎi)", "千 (qiān)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 2,
      prompt: "Các hàng đơn vị 'trăm, nghìn, vạn' lần lượt là:",
      choices: ["百、千、万 (bǎi, qiān, wàn)", "十、百、千 (shí, bǎi, qiān)", "个、十、百 (gè, shí, bǎi)", "千、万、亿 (qiān, wàn, yì)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 3,
      prompt: "Khi nói số lượng '2 người', từ nào đúng quy tắc?",
      choices: ["两个人 (liǎng gè rén)", "二个人 (èr gè rén)", "双个人 (shuāng gè rén)", "两只人 (liǎng zhī rén)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 4,
      prompt: "Từ chỉ 'một nửa' trong tiếng Trung là gì?",
      choices: ["一半 (yíbàn)", "一点儿 (yìdiǎnr)", "一下 (yíxià)", "一块 (yíkuài)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 5,
      prompt: "Số 8.000 đọc trong tiếng Trung là gì?",
      choices: ["八千 (bāqiān)", "八百 (bābǎi)", "八万 (bāwàn)", "八十 (bāshí)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 6,
      prompt: "Số 10.000 (mười nghìn) trong tiếng Trung viết là:",
      choices: ["一万 (yíwàn)", "十千 (shíqiān)", "一百百 (yìbǎibǎi)", "一千 (yìqiān)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 7,
      prompt: "Quy tắc đọc số 105 trong tiếng Trung là gì?",
      choices: ["一百零五 (yìbǎi líng wǔ)", "一百五 (yìbǎi wǔ)", "一零五 (yī líng wǔ)", "十百五 (shíbǎi wǔ)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 8,
      prompt: "Khi nói 'nửa giờ' (30 phút), ta dùng cụm nào?",
      choices: ["半个小时 (bàn gè xiǎoshí)", "一半小时 (yíbàn xiǎoshí)", "两小时 (liǎng xiǎoshí)", "半点 (bàndiǎn)"],
    },
  ],
  answerKeys: {
    "70000026-0000-4000-8000-000000000001": {
      question_id: "70000026-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'零' (líng) là chữ Hán chỉ số 0.",
    },
    "70000026-0000-4000-8000-000000000002": {
      question_id: "70000026-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "百 (trăm), 千 (nghìn), 万 (vạn = 10.000).",
    },
    "70000026-0000-4000-8000-000000000003": {
      question_id: "70000026-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "Trước lượng từ, dùng '两' (liǎng) thay vì '二' (èr) để biểu thị số lượng.",
    },
    "70000026-0000-4000-8000-000000000004": {
      question_id: "70000026-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'一半' (yíbàn) nghĩa là một nửa (50%).",
    },
    "70000026-0000-4000-8000-000000000005": {
      question_id: "70000026-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "8000 là '八千' (bāqiān).",
    },
    "70000026-0000-4000-8000-000000000006": {
      question_id: "70000026-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "10.000 trong tiếng Trung có đơn vị riêng là '一万' (yíwàn).",
    },
    "70000026-0000-4000-8000-000000000007": {
      question_id: "70000026-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "Số 0 ở hàng chục bắt buộc phải đọc là '零' (líng): 一百零五.",
    },
    "70000026-0000-4000-8000-000000000008": {
      question_id: "70000026-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "Cấu trúc: 半 + Lượng từ + Danh từ: '半个小时' (nửa tiếng).",
    },
  },
};

// BÀI 27: LƯỢNG TỪ, TUỔI TÁC & ƯỚC LƯỢNG
export const LESSON_27_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-027",
  slug: "hsk1-lesson-27",
  quiz: {
    id: "77777777-7777-4777-8777-000000000027",
    lesson_id: "l-hsk1-027",
    revision: 1,
    title: "Mini Quiz Bài 27: Lượng từ & Tuổi tác",
  },
  lessonTitle: "Bài 27: Lượng từ & Tuổi tác",
  questions: [
    {
      id: "70000027-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000027",
      sort_order: 1,
      prompt: "Từ nào mang nghĩa là 'một vài, một ít'?",
      choices: ["一些 (yìxiē)", "一点儿 (yìdiǎnr)", "一下 (yíxià)", "有些 (yǒuxiē)"],
    },
    {
      id: "70000027-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000027",
      sort_order: 2,
      prompt: "Từ dùng để hỏi số lượng nhỏ (dưới 10) là:",
      choices: ["几 (jǐ)", "多少 (duōshao)", "多 (duō)", "少 (shǎo)"],
    },
    {
      id: "70000027-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000027",
      sort_order: 3,
      prompt: "Lượng từ dùng cho con vật (như mèo, chim) là chữ nào?",
      choices: ["只 (zhī)", "个 (ge)", "本 (běn)", "张 (zhāng)"],
    },
    {
      id: "70000027-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000027",
      sort_order: 4,
      prompt: "Từ chỉ 'tuổi' trong tiếng Trung là gì?",
      choices: ["岁 (suì)", "年 (nián)", "月 (yuè)", "日 (rì)"],
    },
    {
      id: "70000027-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000027",
      sort_order: 5,
      prompt: "Tiền tố tạo số thứ tự (ví dụ: thứ nhất, thứ hai) là chữ nào?",
      choices: ["第 (dì)", "头 (tóu)", "初 (chū)", "前 (qián)"],
    },
    {
      id: "70000027-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000027",
      sort_order: 6,
      prompt: "Cặp từ trái nghĩa 'nhiều' và 'ít' là gì?",
      choices: ["多 - 少 (duō - shǎo)", "大 - 小 (dà - xiǎo)", "快 - 慢 (kuài - màn)", "高 - 矮 (gāo - ǎi)"],
    },
    {
      id: "70000027-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000027",
      sort_order: 7,
      prompt: "Cụm '一点儿' (yìdiǎnr) thường đứng ở vị trí nào trong câu?",
      choices: ["Trước danh từ hoặc sau tính từ biểu thị số lượng/mức độ nhỏ", "Luôn đứng đầu câu", "Chỉ đứng sau động từ năng nguyện", "Không thể đi với danh từ"],
    },
    {
      id: "70000027-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000027",
      sort_order: 8,
      prompt: "Cụm '一下' (yíxià) đứng sau động từ biểu thị điều gì?",
      choices: ["Hành động diễn ra trong thời gian ngắn, thử làm điều gì", "Hành động đã hoàn thành trong quá khứ", "Hành động bị cấm đoán", "Biểu thị sự việc xảy ra rất lâu"],
    },
  ],
  answerKeys: {
    "70000027-0000-4000-8000-000000000001": {
      question_id: "70000027-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'一些' (yìxiē) mang nghĩa là một số, một vài.",
    },
    "70000027-0000-4000-8000-000000000002": {
      question_id: "70000027-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "'几' (jǐ) dùng để hỏi số lượng ước tính nhỏ hơn 10.",
    },
    "70000027-0000-4000-8000-000000000003": {
      question_id: "70000027-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'只' (zhī) là lượng từ chuyên dùng cho động vật nhỏ: 一只猫 (một con mèo).",
    },
    "70000027-0000-4000-8000-000000000004": {
      question_id: "70000027-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'岁' (suì) là từ chỉ đơn vị tuổi tác.",
    },
    "70000027-0000-4000-8000-000000000005": {
      question_id: "70000027-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'第' đặt trước con số để tạo số thứ tự: 第一 (thứ nhất).",
    },
    "70000027-0000-4000-8000-000000000006": {
      question_id: "70000027-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'多' (nhiều) và '少' (ít) là cặp tính từ đối lập.",
    },
    "70000027-0000-4000-8000-000000000007": {
      question_id: "70000027-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "'一点儿' bổ nghĩa cho danh từ (喝一点儿水) hoặc đứng sau tính từ (大一点儿).",
    },
    "70000027-0000-4000-8000-000000000008": {
      question_id: "70000027-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "Động từ + 一下 (ví dụ: 看一下, 等一下) làm cho ngữ điệu nhẹ nhàng và biểu thị thử làm trong chốc lát.",
    },
  },
};

// BÀI 28: LỊCH TRÌNH, NGÀY THÁNG & CÁC BUỔI
export const LESSON_28_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-028",
  slug: "hsk1-lesson-28",
  quiz: {
    id: "77777777-7777-4777-8777-000000000028",
    lesson_id: "l-hsk1-028",
    revision: 1,
    title: "Mini Quiz Bài 28: Lịch trình & Ngày tháng",
  },
  lessonTitle: "Bài 28: Lịch trình & Ngày tháng",
  questions: [
    {
      id: "70000028-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000028",
      sort_order: 1,
      prompt: "Trật tự thời gian chuẩn trong tiếng Trung là gì?",
      choices: ["Năm -> Tháng -> Ngày -> Buổi -> Giờ", "Giờ -> Buổi -> Ngày -> Tháng -> Năm", "Ngày -> Tháng -> Năm", "Tháng -> Ngày -> Năm"],
    },
    {
      id: "70000028-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000028",
      sort_order: 2,
      prompt: "Từ 'Chủ nhật' trong tiếng Trung có hai cách nói là:",
      choices: ["星期天 / 星期日 (xīngqītiān / xīngqīrì)", "星期六 / 星期七 (xīngqīliù / xīngqīqī)", "星期八 / 星期九 (xīngqībā / xīngqījiǔ)", "星期一 / 星期二 (xīngqīyī / xīngqī'èr)"],
    },
    {
      id: "70000028-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000028",
      sort_order: 3,
      prompt: "Từ mang nghĩa 'buổi sáng sớm / sáng' là:",
      choices: ["早上 (zǎoshang)", "中午 (zhōngwǔ)", "晚上 (wǎnshang)", "白天 (báitiān)"],
    },
    {
      id: "70000028-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000028",
      sort_order: 4,
      prompt: "Từ mang nghĩa 'buổi trưa' là gì?",
      choices: ["中午 (zhōngwǔ)", "早上 (zǎoshang)", "晚上 (wǎnshang)", "上午 (shàngwǔ)"],
    },
    {
      id: "70000028-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000028",
      sort_order: 5,
      prompt: "Từ mang nghĩa 'buổi tối' là gì?",
      choices: ["晚上 (wǎnshang)", "中午 (zhōngwǔ)", "白天 (báitiān)", "早晨 (zǎochén)"],
    },
    {
      id: "70000028-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000028",
      sort_order: 6,
      prompt: "Cặp từ trái nghĩa 'sớm' và 'muộn / trễ' là:",
      choices: ["早 - 晚 (zǎo - wǎn)", "快 - 慢 (kuài - màn)", "前 - 后 (qián - hòu)", "大 - 小 (dà - xiǎo)"],
    },
    {
      id: "70000028-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000028",
      sort_order: 7,
      prompt: "Trong văn nói hàng ngày, người ta thường dùng chữ nào để chỉ ngày trong tháng?",
      choices: ["号 (hào)", "日 (rì)", "月 (yuè)", "年 (nián)"],
    },
    {
      id: "70000028-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000028",
      sort_order: 8,
      prompt: "Từ chỉ 'ban ngày' (trái nghĩa với ban đêm) là gì?",
      choices: ["白天 (báitiān)", "晚上 (wǎnshang)", "中午 (zhōngwǔ)", "太阳 (tàiyáng)"],
    },
  ],
  answerKeys: {
    "70000028-0000-4000-8000-000000000001": {
      question_id: "70000028-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "Tiếng Trung đi từ đơn vị thời gian lớn nhất đến nhỏ nhất: Năm -> Tháng -> Ngày -> Giờ.",
    },
    "70000028-0000-4000-8000-000000000002": {
      question_id: "70000028-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "Chủ nhật trong tiếng Trung không dùng số 7 mà nói '星期天' hoặc '星期日'.",
    },
    "70000028-0000-4000-8000-000000000003": {
      question_id: "70000028-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'早上' (zǎoshang) là buổi sáng sớm.",
    },
    "70000028-0000-4000-8000-000000000004": {
      question_id: "70000028-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'中午' (zhōngwǔ) là buổi trưa (khoảng 11h - 13h).",
    },
    "70000028-0000-4000-8000-000000000005": {
      question_id: "70000028-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'晚上' (wǎnshang) là buổi tối.",
    },
    "70000028-0000-4000-8000-000000000006": {
      question_id: "70000028-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'早' (zǎo) là sớm, '晚' (wǎn) là muộn.",
    },
    "70000028-0000-4000-8000-000000000007": {
      question_id: "70000028-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "Khẩu ngữ thường dùng '号' (hào), văn viết trang trọng dùng '日' (rì).",
    },
    "70000028-0000-4000-8000-000000000008": {
      question_id: "70000028-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "'白天' (báitiān) nghĩa là ban ngày.",
    },
  },
};

// BÀI 29: KHOẢNG THỜI GIAN & TRƯỚC SAU
export const LESSON_29_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-029",
  slug: "hsk1-lesson-29",
  quiz: {
    id: "77777777-7777-4777-8777-000000000029",
    lesson_id: "l-hsk1-029",
    revision: 1,
    title: "Mini Quiz Bài 29: Khoảng thời gian & Trước sau",
  },
  lessonTitle: "Bài 29: Khoảng thời gian & Trước sau",
  questions: [
    {
      id: "70000029-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000029",
      sort_order: 1,
      prompt: "Từ chỉ khoảng thời gian 'tiếng đồng hồ' là gì?",
      choices: ["小时 (xiǎoshí)", "点 (diǎn)", "分钟 (fēnzhōng)", "时候 (shíhou)"],
    },
    {
      id: "70000029-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000029",
      sort_order: 2,
      prompt: "Từ chỉ khoảng thời gian 'phút' trong tiếng Trung là gì?",
      choices: ["分钟 (fēnzhōng)", "分 (fēn)", "秒 (miǎo)", "点 (diǎn)"],
    },
    {
      id: "70000029-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000029",
      sort_order: 3,
      prompt: "Từ 'thời gian' (danh từ) trong tiếng Trung là gì?",
      choices: ["时间 (shíjiān)", "时候 (shíhou)", "小时 (xiǎoshí)", "分钟 (fēnzhōng)"],
    },
    {
      id: "70000029-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000029",
      sort_order: 4,
      prompt: "Cấu trúc '...的时候' (... de shíhou) mang ý nghĩa gì?",
      choices: ["Khi... / Lúc đang làm việc gì...", "Sau khi làm gì...", "Trước khi làm gì...", "Khoảng bao nhiêu tiếng"],
    },
    {
      id: "70000029-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000029",
      sort_order: 5,
      prompt: "Hôm qua và ngày mai lần lượt là:",
      choices: ["昨天、明天 (zuótiān, míngtiān)", "今天、明天 (jīntiān, míngtiān)", "前天、后天 (qiántiān, hòutiān)", "去年、明年 (qùnián, míngnián)"],
    },
    {
      id: "70000029-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000029",
      sort_order: 6,
      prompt: "Năm ngoái, năm nay và năm sau lần lượt là:",
      choices: ["去年、今年、明年 (qùnián, jīnnián, míngnián)", "前年、今年、后年 (qiánnián, jīnnián, hòunián)", "昨天、今天、明天 (zuótiān, jīntiān, míngtiān)", "上年、今年、下年 (shàngnián, jīnnián, xiànián)"],
    },
    {
      id: "70000029-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000029",
      sort_order: 7,
      prompt: "Cặp từ 'trước đây / trước khi' và 'sau này / sau khi' là:",
      choices: ["以前 - 以后 (yǐqián - yǐhòu)", "前边 - 后边 (qiánbian - hòubian)", "早上 - 晚上 (zǎoshang - wǎnshang)", "过去 - 未来 (guòqù - wèilái)"],
    },
    {
      id: "70000029-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000029",
      sort_order: 8,
      prompt: "Câu 'Sau khi ăn cơm tôi đi học.' nói thế nào?",
      choices: ["吃饭以后我去上学。", "以前吃饭我去上学。", "吃以后饭我去上学。", "我去上学吃以后饭。"],
    },
  ],
  answerKeys: {
    "70000029-0000-4000-8000-000000000001": {
      question_id: "70000029-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'小时' (xiǎoshí) chỉ thời lượng tiếng đồng hồ (ví dụ: 一个小时).",
    },
    "70000029-0000-4000-8000-000000000002": {
      question_id: "70000029-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "'分钟' (fēnzhōng) là đơn vị chỉ thời lượng số phút.",
    },
    "70000029-0000-4000-8000-000000000003": {
      question_id: "70000029-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'时间' (shíjiān) là danh từ thời gian (ví dụ: 没有时间).",
    },
    "70000029-0000-4000-8000-000000000004": {
      question_id: "70000029-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "Mẫu câu: Cụm hành động + 的时候 mang nghĩa 'khi / vào lúc làm gì'.",
    },
    "70000029-0000-4000-8000-000000000005": {
      question_id: "70000029-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'昨天' là hôm qua, '明天' là ngày mai.",
    },
    "70000029-0000-4000-8000-000000000006": {
      question_id: "70000029-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "Năm ngoái là 去年, năm nay là 今年, năm sau là 明年.",
    },
    "70000029-0000-4000-8000-000000000007": {
      question_id: "70000029-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "'以前' (trước khi), '以后' (sau khi) là cặp từ chỉ mốc thời gian đối lập.",
    },
    "70000029-0000-4000-8000-000000000008": {
      question_id: "70000029-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "Cấu trúc: Hành động + 以后: '吃饭以后我去上学。'",
    },
  },
};

// BÀI 30: ĐỘNG TỪ TÂM LÝ & NĂNG NGUYỆN
export const LESSON_30_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-030",
  slug: "hsk1-lesson-30",
  quiz: {
    id: "77777777-7777-4777-8777-000000000030",
    lesson_id: "l-hsk1-030",
    revision: 1,
    title: "Mini Quiz Bài 30: Tâm lý & Năng nguyện",
  },
  lessonTitle: "Bài 30: Tâm lý & Năng nguyện",
  questions: [
    {
      id: "70000030-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000030",
      sort_order: 1,
      prompt: "Từ nào mang nghĩa là 'yêu / thích sâu sắc'?",
      choices: ["爱 (ài)", "看 (kàn)", "去 (qù)", "说 (shuō)"],
    },
    {
      id: "70000030-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000030",
      sort_order: 2,
      prompt: "Từ mang nghĩa 'cảm thấy / cho rằng' là gì?",
      choices: ["觉得 (juéde)", "喜欢 (xǐhuan)", "知道 (zhīdào)", "希望 (xīwàng)"],
    },
    {
      id: "70000030-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000030",
      sort_order: 3,
      prompt: "Từ mang nghĩa 'hy vọng' trong tiếng Trung là gì?",
      choices: ["希望 (xīwàng)", "想 (xiǎng)", "要 (yào)", "可以 (kěyǐ)"],
    },
    {
      id: "70000030-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000030",
      sort_order: 4,
      prompt: "Động từ năng nguyện biểu thị kỹ năng thông qua học tập mà biết làm là:",
      choices: ["会 (huì)", "能 (néng)", "可以 (kěyǐ)", "要 (yào)"],
    },
    {
      id: "70000030-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000030",
      sort_order: 5,
      prompt: "Động từ năng nguyện biểu thị sự cho phép (được phép, có thể) là:",
      choices: ["可以 (kěyǐ)", "会 (huì)", "爱 (ài)", "觉得 (juéde)"],
    },
    {
      id: "70000030-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000030",
      sort_order: 6,
      prompt: "Từ nào mang nghĩa là 'cho / tặng' hoặc làm giới từ 'cho ai'?",
      choices: ["给 (gěi)", "找 (zhǎo)", "要 (yào)", "帮 (bāng)"],
    },
    {
      id: "70000030-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000030",
      sort_order: 7,
      prompt: "Động từ 'tìm kiếm' trong tiếng Trung là gì?",
      choices: ["找 (zhǎo)", "给 (gěi)", "问 (wèn)", "看 (kàn)"],
    },
    {
      id: "70000030-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000030",
      sort_order: 8,
      prompt: "Dạng phủ định của '会说汉语' là gì?",
      choices: ["不会说汉语", "没会说汉语", "会不说汉语", "不要说汉语"],
    },
  ],
  answerKeys: {
    "70000030-0000-4000-8000-000000000001": {
      question_id: "70000030-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'爱' (ài) nghĩa là yêu, thích sâu đậm.",
    },
    "70000030-0000-4000-8000-000000000002": {
      question_id: "70000030-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "'觉得' (juéde) dùng để bày tỏ cảm nhận, nhận định chủ quan.",
    },
    "70000030-0000-4000-8000-000000000003": {
      question_id: "70000030-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'希望' (xīwàng) nghĩa là hy vọng, mong ước.",
    },
    "70000030-0000-4000-8000-000000000004": {
      question_id: "70000030-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'会' (huì) biểu thị khả năng đạt được qua quá trình học hỏi rèn luyện.",
    },
    "70000030-0000-4000-8000-000000000005": {
      question_id: "70000030-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'可以' (kěyǐ) chỉ sự cho phép hoặc tính khả thi.",
    },
    "70000030-0000-4000-8000-000000000006": {
      question_id: "70000030-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'给' (gěi) có thể làm động từ (cho) hoặc giới từ (给+người+làm gì).",
    },
    "70000030-0000-4000-8000-000000000007": {
      question_id: "70000030-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "'找' (zhǎo) nghĩa là tìm kiếm (tìm người, tìm đồ vật).",
    },
    "70000030-0000-4000-8000-000000000008": {
      question_id: "70000030-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "Phủ định của động từ năng nguyện luôn dùng '不' đặt ngay phía trước: 不会.",
    },
  },
};

// BÀI 31: PHÓ TỪ MỨC ĐỘ & THỜI THÁI
export const LESSON_31_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-031",
  slug: "hsk1-lesson-31",
  quiz: {
    id: "77777777-7777-4777-8777-000000000031",
    lesson_id: "l-hsk1-031",
    revision: 1,
    title: "Mini Quiz Bài 31: Phó từ mức độ & Thời thái",
  },
  lessonTitle: "Bài 31: Phó từ mức độ & Thời thái",
  questions: [
    {
      id: "70000031-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000031",
      sort_order: 1,
      prompt: "Từ dùng để khuyên can hoặc ngăn cấm 'đừng / chớ' là:",
      choices: ["别 / 不要 (bié / bú yào)", "不能 (bù néng)", "不会 (bú huì)", "不是 (bú shì)"],
    },
    {
      id: "70000031-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000031",
      sort_order: 2,
      prompt: "Phó từ chỉ mức độ cực kỳ cao 'vô cùng, rất' là chữ nào?",
      choices: ["非常 (fēicháng)", "有点儿 (yǒudiǎnr)", "还 (hái)", "也 (yě)"],
    },
    {
      id: "70000031-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000031",
      sort_order: 3,
      prompt: "Phó từ chỉ mức độ cao nhất (nhất) là chữ nào?",
      choices: ["最 (zuì)", "太 (tài)", "真 (zhēn)", "很 (hěn)"],
    },
    {
      id: "70000031-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000031",
      sort_order: 4,
      prompt: "Phó từ mang nghĩa 'thật là, quả thực' là chữ nào?",
      choices: ["真 (zhēn)", "还 (hái)", "都 (dōu)", "再 (zài)"],
    },
    {
      id: "70000031-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000031",
      sort_order: 5,
      prompt: "Từ chỉ hành động đang diễn ra tại thời điểm nói là:",
      choices: ["正在 (zhèngzài)", "已经 (yǐjīng)", "再 (zài)", "还 (hái)"],
    },
    {
      id: "70000031-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000031",
      sort_order: 6,
      prompt: "Từ chỉ hành động đã xảy ra xong xuôi là:",
      choices: ["已经 (yǐjīng)", "正在 (zhèngzài)", "不要 (bú yào)", "有点儿 (yǒudiǎnr)"],
    },
    {
      id: "70000031-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000031",
      sort_order: 7,
      prompt: "Cụm '有点儿' (yǒudiǎnr) thường đứng trước tính từ để biểu thị điều gì?",
      choices: ["Biểu thị ý không hài lòng, hơi... một chút", "Biểu thị khen ngợi hết lời", "Biểu thị hành động đã hoàn tất", "Biểu thị sự cấm đoán gay gắt"],
    },
    {
      id: "70000031-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000031",
      sort_order: 8,
      prompt: "Từ '再' (zài) trong '再见' hoặc '请再说一次' mang ý nghĩa gì?",
      choices: ["Lại, một lần nữa trong tương lai", "Đã từng xảy ra trong quá khứ", "Đang diễn ra", "Không bao giờ xảy ra"],
    },
  ],
  answerKeys: {
    "70000031-0000-4000-8000-000000000001": {
      question_id: "70000031-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'别' hoặc '不要' đặt trước động từ có chức năng ngăn cấm.",
    },
    "70000031-0000-4000-8000-000000000002": {
      question_id: "70000031-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "'非常' (fēicháng) là phó từ mức độ rất cao.",
    },
    "70000031-0000-4000-8000-000000000003": {
      question_id: "70000031-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'最' (zuì) biểu thị cấp độ cao nhất: 最好 (tốt nhất).",
    },
    "70000031-0000-4000-8000-000000000004": {
      question_id: "70000031-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'真' (zhēn) mang ý nghĩa cảm thán: 真好 (thật tốt).",
    },
    "70000031-0000-4000-8000-000000000005": {
      question_id: "70000031-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'正在' (zhèngzài) đứng trước động từ thể hiện hành động đang tiếp diễn.",
    },
    "70000031-0000-4000-8000-000000000006": {
      question_id: "70000031-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'已经' (yǐjīng) biểu thị sự việc đã hoàn thành hoặc đạt trạng thái.",
    },
    "70000031-0000-4000-8000-000000000007": {
      question_id: "70000031-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "'有点儿' + Tính từ (như 有点儿贵, 有点儿累) mang sắc thái hơi tiêu cực.",
    },
    "70000031-0000-4000-8000-000000000008": {
      question_id: "70000031-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "'再' (zài) biểu thị hành động lặp lại chưa xảy ra (trong tương lai).",
    },
  },
};

// BÀI 32: TRỢ TỪ NGỮ KHÍ & TỔNG HỢP HSK 1
export const LESSON_32_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-032",
  slug: "hsk1-lesson-32",
  quiz: {
    id: "77777777-7777-4777-8777-000000000032",
    lesson_id: "l-hsk1-032",
    revision: 1,
    title: "Mini Quiz Bài 32: Trợ từ ngữ khí & Tổng hợp HSK 1",
  },
  lessonTitle: "Bài 32: Trợ từ ngữ khí & Tổng hợp HSK 1",
  questions: [
    {
      id: "70000032-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000032",
      sort_order: 1,
      prompt: "Trợ từ ngữ khí đặt cuối câu để đề nghị, rủ rê (nhé, đi) là chữ nào?",
      choices: ["吧 (ba)", "呢 (ne)", "了 (le)", "吗 (ma)"],
    },
    {
      id: "70000032-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000032",
      sort_order: 2,
      prompt: "Câu hỏi 'Còn bạn thì sao?' sử dụng trợ từ ngữ khí nào?",
      choices: ["你呢？ (Nǐ ne?)", "你吧？ (Nǐ ba?)", "你了？ (Nǐ le?)", "你吗？ (Nǐ ma?)"],
    },
    {
      id: "70000032-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000032",
      sort_order: 3,
      prompt: "Trợ từ '了' đặt cuối câu biểu thị điều gì?",
      choices: ["Sự việc đã xảy ra hoặc có sự thay đổi trạng thái mới", "Đề nghị ai đó làm gì", "Phủ định một hành động", "Hỏi thăm sức khỏe"],
    },
    {
      id: "70000032-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000032",
      sort_order: 4,
      prompt: "Để hỏi 'như thế nào / ra sao' về tình hình hay ý kiến, ta dùng đại từ nào?",
      choices: ["怎么样 (zěnmeyàng)", "怎么 (zěnme)", "什么 (shénme)", "哪里 (nǎli)"],
    },
    {
      id: "70000032-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000032",
      sort_order: 5,
      prompt: "Cặp từ trái nghĩa 'đúng' và 'sai' trong tiếng Trung là:",
      choices: ["对 - 错 (duì - cuò)", "好 - 坏 (hǎo - huài)", "大 - 小 (dà - xiǎo)", "多 - 少 (duō - shǎo)"],
    },
    {
      id: "70000032-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000032",
      sort_order: 6,
      prompt: "Để phủ định hành động xảy ra trong quá khứ hoặc sở hữu (không có / chưa), dùng từ:",
      choices: ["没有 (méiyǒu)", "不 (bù)", "别 (bié)", "不要 (bú yào)"],
    },
    {
      id: "70000032-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000032",
      sort_order: 7,
      prompt: "Từ mang nghĩa 'quốc gia / đất nước' là chữ nào?",
      choices: ["国 (guó)", "人 (rén)", "家 (jiā)", "城 (chéng)"],
    },
    {
      id: "70000032-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000032",
      sort_order: 8,
      prompt: "Cặp chữ chỉ giới tính 'nam' và 'nữ' là gì?",
      choices: ["男 - 女 (nán - nǚ)", "大 - 小 (dà - xiǎo)", "前 - 后 (qián - hòu)", "他 - 她 (tā - tā)"],
    },
  ],
  answerKeys: {
    "70000032-0000-4000-8000-000000000001": {
      question_id: "70000032-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'吧' (ba) đặt cuối câu tạo ngữ khí đề xuất, rủ rê thân thiện.",
    },
    "70000032-0000-4000-8000-000000000002": {
      question_id: "70000032-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "'呢' (ne) dùng trong câu hỏi tỉnh lược (Ví dụ: 我学汉语，你呢？).",
    },
    "70000032-0000-4000-8000-000000000003": {
      question_id: "70000032-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'了' đặt cuối câu biểu thị sự thay đổi trạng thái hoặc khẳng định sự việc.",
    },
    "70000032-0000-4000-8000-000000000004": {
      question_id: "70000032-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'怎么样' (zěnmeyàng) dùng để hỏi tính chất, tình hình hoặc lấy ý kiến đối phương.",
    },
    "70000032-0000-4000-8000-000000000005": {
      question_id: "70000032-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'对' là đúng, '错' là sai.",
    },
    "70000032-0000-4000-8000-000000000006": {
      question_id: "70000032-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "Phủ định quá khứ hoặc sở hữu luôn dùng '没有'.",
    },
    "70000032-0000-4000-8000-000000000007": {
      question_id: "70000032-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "'国' (guó) là quốc gia (như 中国, 越南).",
    },
    "70000032-0000-4000-8000-000000000008": {
      question_id: "70000032-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "'男' (nán) là nam giới, '女' (nǚ) là nữ giới.",
    },
  },
};

// CHẶNG 5: TỔNG ÔN & ĐÁNH GIÁ NĂNG LỰC CHẶNG 5 (BÀI 21–25)
export const CHECKPOINT_05_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-cp05",
  slug: "hsk1-checkpoint-05",
  quiz: {
    id: "77777777-7777-4777-8777-000000000005",
    lesson_id: "l-hsk1-cp05",
    revision: 1,
    title: "Mini Quiz Chặng 5: Đánh giá Năng lực (Bài 21–25)",
  },
  lessonTitle: "Chặng 5: Tổng ôn & Đánh giá Năng lực (Bài 21–25)",
  questions: [
    {
      id: "70000005-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 1,
      prompt: "Từ dùng khi bắt máy điện thoại là gì?",
      choices: ["喂 (wèi)", "好 (hǎo)", "请 (qǐng)", "对 (duì)"],
    },
    {
      id: "70000005-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 2,
      prompt: "Từ nào mang nghĩa là 'giúp đỡ'?",
      choices: ["帮助 (bāngzhù)", "认识 (rènshi)", "说话 (shuōhuà)", "看见 (kànjiàn)"],
    },
    {
      id: "70000005-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 3,
      prompt: "Từ '高兴' (gāoxìng) có nghĩa là gì?",
      choices: ["Vui vẻ, vui mừng", "Buồn bã", "Tức giận", "Mệt mỏi"],
    },
    {
      id: "70000005-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 4,
      prompt: "Để thể hiện lòng tôn kính đối với đối phương, thay vì dùng '你' ta dùng:",
      choices: ["您 (nín)", "他 (tā)", "大家 (dàjiā)", "们 (men)"],
    },
    {
      id: "70000005-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 5,
      prompt: "Từ nào mang nghĩa 'những cái này'?",
      choices: ["这些 (zhèxiē)", "那些 (nàxiē)", "哪些 (nǎxiē)", "这个 (zhè ge)"],
    },
    {
      id: "70000005-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 6,
      prompt: "Từ nào dùng để hỏi 'ở đâu / chỗ nào'?",
      choices: ["哪里 / 哪儿 (nǎli / nǎr)", "这里 / 这儿 (zhèlǐ / zhèr)", "那里 / 那儿 (nàlǐ / nàr)", "怎么 (zěnme)"],
    },
    {
      id: "70000005-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 7,
      prompt: "Từ chỉ vị trí 'bên cạnh' là gì?",
      choices: ["旁边 (pángbiān)", "前边 (qiánbian)", "后边 (hòubian)", "里边 (lǐbian)"],
    },
    {
      id: "70000005-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 8,
      prompt: "Phương vị từ 'phía trước' là:",
      choices: ["前边 (qiánbian)", "后边 (hòubian)", "左边 (zuǒbian)", "东边 (dōngbiān)"],
    },
    {
      id: "70000005-0000-4000-8000-000000000009",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 9,
      prompt: "Xưng hô lịch sự đối với một người đàn ông là:",
      choices: ["先生 (xiānsheng)", "女士 (nǚshì)", "朋友 (péngyou)", "同学 (tóngxué)"],
    },
    {
      id: "70000005-0000-4000-8000-000000000010",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 10,
      prompt: "Vị trí chuẩn xác của phương vị từ '旁边' trong cụm 'bên cạnh bệnh viện' là:",
      choices: ["医院旁边 (yīyuàn pángbiān)", "旁边医院 (pángbiān yīyuàn)", "在旁边医院 (zài pángbiān yīyuàn)", "旁边在医院 (pángbiān zài yīyuàn)"],
    },
  ],
  answerKeys: {
    "70000005-0000-4000-8000-000000000001": {
      question_id: "70000005-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'喂' (wèi) là từ dùng khi bắt máy nghe điện thoại.",
    },
    "70000005-0000-4000-8000-000000000002": {
      question_id: "70000005-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "'帮助' (bāngzhù) mang nghĩa giúp đỡ người khác.",
    },
    "70000005-0000-4000-8000-000000000003": {
      question_id: "70000005-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'高兴' (gāoxìng) là tính từ chỉ tâm trạng vui tươi.",
    },
    "70000005-0000-4000-8000-000000000004": {
      question_id: "70000005-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'您' (nín) thể hiện sự tôn kính cao hơn 你.",
    },
    "70000005-0000-4000-8000-000000000005": {
      question_id: "70000005-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'这些' (zhèxiē) chỉ những cái này.",
    },
    "70000005-0000-4000-8000-000000000006": {
      question_id: "70000005-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'哪里' / '哪儿' là đại từ nghi vấn hỏi nơi chốn.",
    },
    "70000005-0000-4000-8000-000000000007": {
      question_id: "70000005-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "'旁边' (pángbiān) nghĩa là bên cạnh.",
    },
    "70000005-0000-4000-8000-000000000008": {
      question_id: "70000005-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "'前边' (qiánbian) là phía trước.",
    },
    "70000005-0000-4000-8000-000000000009": {
      question_id: "70000005-0000-4000-8000-000000000009",
      correct_index: 0,
      explanation_vi: "'先生' (xiānsheng) là ông, ngài, anh.",
    },
    "70000005-0000-4000-8000-000000000010": {
      question_id: "70000005-0000-4000-8000-000000000010",
      correct_index: 0,
      explanation_vi: "Phương vị từ luôn đi sau danh từ: 医院 + 旁边.",
    },
  },
};

// CHẶNG 6: TỔNG ÔN & HOÀN TẤT GIÁO TRÌNH HSK 1 (BÀI 26–32)
export const CHECKPOINT_06_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-cp06",
  slug: "hsk1-checkpoint-06",
  quiz: {
    id: "77777777-7777-4777-8777-000000000006",
    lesson_id: "l-hsk1-cp06",
    revision: 1,
    title: "Mini Quiz Chặng 6: Hoàn tất Giáo trình HSK 1 (Bài 26–32)",
  },
  lessonTitle: "Chặng 6: Hoàn tất Giáo trình HSK 1 (Bài 26–32)",
  questions: [
    {
      id: "70000006-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000006",
      sort_order: 1,
      prompt: "Số 1.000 trong tiếng Trung đọc là gì?",
      choices: ["千 (qiān)", "百 (bǎi)", "万 (wàn)", "十 (shí)"],
    },
    {
      id: "70000006-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000006",
      sort_order: 2,
      prompt: "Từ mang nghĩa 'một chút, một ít' là gì?",
      choices: ["一点儿 (yìdiǎnr)", "一下 (yíxià)", "一块 (yíkuài)", "一些 (yìxiē)"],
    },
    {
      id: "70000006-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000006",
      sort_order: 3,
      prompt: "Từ 'thời gian' (danh từ) trong tiếng Trung là gì?",
      choices: ["时间 (shíjiān)", "时候 (shíhou)", "小时 (xiǎoshí)", "分钟 (fēnzhōng)"],
    },
    {
      id: "70000006-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000006",
      sort_order: 4,
      prompt: "Từ mang nghĩa 'cảm thấy / nghĩ rằng' là gì?",
      choices: ["觉得 (juéde)", "喜欢 (xǐhuan)", "希望 (xīwàng)", "知道 (zhīdào)"],
    },
    {
      id: "70000006-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000006",
      sort_order: 5,
      prompt: "Động từ năng nguyện biểu thị sự cho phép (được phép, có thể) là:",
      choices: ["可以 (kěyǐ)", "会 (huì)", "想 (xiǎng)", "要 (yào)"],
    },
    {
      id: "70000006-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000006",
      sort_order: 6,
      prompt: "Phó từ chỉ mức độ cao 'vô cùng, rất' là chữ nào?",
      choices: ["非常 (fēicháng)", "还 (hái)", "也 (yě)", "都 (dōu)"],
    },
    {
      id: "70000006-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000006",
      sort_order: 7,
      prompt: "Từ chỉ hành động đang diễn ra tại thời điểm nói là:",
      choices: ["正在 (zhèngzài)", "已经 (yǐjīng)", "再 (zài)", "别 (bié)"],
    },
    {
      id: "70000006-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000006",
      sort_order: 8,
      prompt: "Trợ từ ngữ khí mang tính đề xuất 'nhé, đi' là chữ nào?",
      choices: ["吧 (ba)", "呢 (ne)", "了 (le)", "吗 (ma)"],
    },
    {
      id: "70000006-0000-4000-8000-000000000009",
      quiz_id: "77777777-7777-4777-8777-000000000006",
      sort_order: 9,
      prompt: "Đại từ dùng để hỏi 'như thế nào / ra sao' là:",
      choices: ["怎么样 (zěnmeyàng)", "怎么 (zěnme)", "什么 (shénme)", "哪里 (nǎli)"],
    },
    {
      id: "70000006-0000-4000-8000-000000000010",
      quiz_id: "77777777-7777-4777-8777-000000000006",
      sort_order: 10,
      prompt: "Để phủ định hành động đã xảy ra trong quá khứ hoặc chưa hoàn thành, dùng từ nào?",
      choices: ["没有 (méiyǒu)", "不 (bù)", "别 (bié)", "不要 (bú yào)"],
    },
  ],
  answerKeys: {
    "70000006-0000-4000-8000-000000000001": {
      question_id: "70000006-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'千' (qiān) là một nghìn (1.000).",
    },
    "70000006-0000-4000-8000-000000000002": {
      question_id: "70000006-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "'一点儿' (yìdiǎnr) mang nghĩa một chút, một ít.",
    },
    "70000006-0000-4000-8000-000000000003": {
      question_id: "70000006-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'时间' (shíjiān) là danh từ chỉ thời gian.",
    },
    "70000006-0000-4000-8000-000000000004": {
      question_id: "70000006-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'觉得' (juéde) dùng để bày tỏ cảm nghĩ hoặc quan điểm.",
    },
    "70000006-0000-4000-8000-000000000005": {
      question_id: "70000006-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'可以' (kěyǐ) chỉ sự cho phép hoặc khả năng.",
    },
    "70000006-0000-4000-8000-000000000006": {
      question_id: "70000006-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'非常' (fēicháng) là phó từ chỉ mức độ rất cao.",
    },
    "70000006-0000-4000-8000-000000000007": {
      question_id: "70000006-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "'正在' (zhèngzài) chỉ hành động đang diễn ra tại thời điểm nói.",
    },
    "70000006-0000-4000-8000-000000000008": {
      question_id: "70000006-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "'吧' (ba) đặt cuối câu mang ý rủ rê, đề xuất.",
    },
    "70000006-0000-4000-8000-000000000009": {
      question_id: "70000006-0000-4000-8000-000000000009",
      correct_index: 0,
      explanation_vi: "'怎么样' (zěnmeyàng) dùng để hỏi tình hình hoặc ý kiến.",
    },
    "70000006-0000-4000-8000-000000000010": {
      question_id: "70000006-0000-4000-8000-000000000010",
      correct_index: 0,
      explanation_vi: "Phủ định quá khứ luôn dùng '没有' (méiyǒu).",
    },
  },
};

export const CHECKPOINT_03_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-cp03",
  slug: "hsk1-checkpoint-03",
  quiz: {
    id: "77777777-7777-4777-8777-000000000003",
    lesson_id: "l-hsk1-cp03",
    revision: 1,
    title: "Mini Quiz Chặng 3: Tổng ôn & Đánh giá Năng lực (Bài 9–14)",
  },
  lessonTitle: "Chặng 3: Tổng ôn & Đánh giá Năng lực (Bài 9–14)",
  questions: [
    {
      id: "70000003-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000003",
      sort_order: 1,
      prompt: "Khi muốn hỏi 'Hôm nay trời nóng hay lạnh?', bạn hỏi câu nào?",
      choices: ["今天天气冷不冷？", "今天几点上课？", "这个多少钱？", "你是哪国人？"],
    },
    {
      id: "70000003-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000003",
      sort_order: 2,
      prompt: "Từ nào chỉ phương tiện 'xe taxi'?",
      choices: ["出租车", "火车", "飞机", "自行车"],
    },
    {
      id: "70000003-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000003",
      sort_order: 3,
      prompt: "Hành động 'lái xe' là:",
      choices: ["开车", "坐车", "走路", "下车"],
    },
    {
      id: "70000003-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000003",
      sort_order: 4,
      prompt: "Từ chỉ 'sinh viên đại học' là:",
      choices: ["大学生", "中学生", "小学生", "老师"],
    },
    {
      id: "70000003-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000003",
      sort_order: 5,
      prompt: "Lượng từ dùng cho sách vở là:",
      choices: ["本", "个", "件", "张"],
    },
    {
      id: "70000003-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000003",
      sort_order: 6,
      prompt: "Từ chỉ 'phòng học, lớp học' là:",
      choices: ["教室", "书店", "医院", "饭馆"],
    },
    {
      id: "70000003-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000003",
      sort_order: 7,
      prompt: "Cụm từ 'vào lớp' và 'tan học' là:",
      choices: ["上课 和 下课", "上班 和 下班", "上学 和 放学", "买 和 卖"],
    },
    {
      id: "70000003-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000003",
      sort_order: 8,
      prompt: "Từ 'máy vi tính' trong tiếng Trung là:",
      choices: ["电脑", "电视", "电话", "手机"],
    },
  ],
  answerKeys: {
    "70000003-0000-4000-8000-000000000001": {
      question_id: "70000003-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "Hỏi thời tiết: 今天天气冷不冷？",
    },
    "70000003-0000-4000-8000-000000000002": {
      question_id: "70000003-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "出租车 là taxi.",
    },
    "70000003-0000-4000-8000-000000000003": {
      question_id: "70000003-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "开车 là lái xe.",
    },
    "70000003-0000-4000-8000-000000000004": {
      question_id: "70000003-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "大学生 là sinh viên.",
    },
    "70000003-0000-4000-8000-000000000005": {
      question_id: "70000003-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "本 dùng cho sách vở.",
    },
    "70000003-0000-4000-8000-000000000006": {
      question_id: "70000003-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "教室 là phòng học.",
    },
    "70000003-0000-4000-8000-000000000007": {
      question_id: "70000003-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "上课 có nghĩa là vào lớp và 下课 có nghĩa là tan học.",
    },
    "70000003-0000-4000-8000-000000000008": {
      question_id: "70000003-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "电脑 là máy vi tính.",
    },
  },
};


// CHẶNG 4: TỔNG ÔN & ĐÁNH GIÁ NĂNG LỰC (BÀI 15–20)
export const CHECKPOINT_04_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-cp04",
  slug: "hsk1-checkpoint-04",
  quiz: {
    id: "77777777-7777-4777-8777-000000000004",
    lesson_id: "l-hsk1-cp04",
    revision: 1,
    title: "Mini Quiz Chặng 4: Tổng ôn & Đánh giá Năng lực (Bài 15–20)",
  },
  lessonTitle: "Chặng 4: Tổng ôn & Đánh giá Năng lực (Bài 15–20)",
  questions: [
    {
      id: "70000004-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000004",
      sort_order: 1,
      prompt: "Từ 'người nhà, gia đình' trong tiếng Trung là:",
      choices: ["家人", "朋友", "同学", "先生"],
    },
    {
      id: "70000004-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000004",
      sort_order: 2,
      prompt: "Từ chỉ 'sức khỏe, thân thể' là:",
      choices: ["身体", "生病", "看病", "吃药"],
    },
    {
      id: "70000004-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000004",
      sort_order: 3,
      prompt: "Cụm từ 'đi khám bệnh' là:",
      choices: ["看病", "吃药", "睡觉", "休息"],
    },
    {
      id: "70000004-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000004",
      sort_order: 4,
      prompt: "Lượng từ của quần áo là:",
      choices: ["件", "本", "只", "个"],
    },
    {
      id: "70000004-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000004",
      sort_order: 5,
      prompt: "Món ăn truyền thống 'bánh sủi cảo' là:",
      choices: ["饺子", "包子", "米饭", "面包"],
    },
    {
      id: "70000004-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000004",
      sort_order: 6,
      prompt: "Nơi bán nhiều đồ dùng, thực phẩm là:",
      choices: ["超市", "饭馆", "电影院", "学校"],
    },
    {
      id: "70000004-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000004",
      sort_order: 7,
      prompt: "Nơi chiếu phim màn ảnh lớn là:",
      choices: ["电影院", "电视", "公司", "医院"],
    },
    {
      id: "70000004-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000004",
      sort_order: 8,
      prompt: "Cụm từ mang nghĩa 'không sao, không có việc gì' là:",
      choices: ["没事", "工作", "上班", "下班"],
    },
  ],
  answerKeys: {
    "70000004-0000-4000-8000-000000000001": {
      question_id: "70000004-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "家人 là người nhà.",
    },
    "70000004-0000-4000-8000-000000000002": {
      question_id: "70000004-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "身体 là sức khỏe.",
    },
    "70000004-0000-4000-8000-000000000003": {
      question_id: "70000004-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "看病 là khám bệnh.",
    },
    "70000004-0000-4000-8000-000000000004": {
      question_id: "70000004-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "件 dùng cho quần áo.",
    },
    "70000004-0000-4000-8000-000000000005": {
      question_id: "70000004-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "饺子 là sủi cảo.",
    },
    "70000004-0000-4000-8000-000000000006": {
      question_id: "70000004-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "超市 là siêu thị.",
    },
    "70000004-0000-4000-8000-000000000007": {
      question_id: "70000004-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "电影院 là rạp chiếu phim.",
    },
    "70000004-0000-4000-8000-000000000008": {
      question_id: "70000004-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "没事 là không sao cả.",
    },
  },
};


// CHẶNG 5: TỔNG ÔN TOÀN DIỆN HSK 1 (BÀI 21–26)
