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
      prompt: "Từ dùng khi bắt máy nghe điện thoại (Alo) trong tiếng Trung là:",
      choices: ["喂 (wèi)", "好 (hǎo)", "请 (qǐng)", "对 (duì)"],
    },
    {
      id: "70000021-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 2,
      prompt: "Cụm từ 'gọi điện thoại' trong tiếng Trung là:",
      choices: ["打电话 (dǎ diànhuà)", "看电视 (kàn diànshì)", "玩手机 (wán shǒujī)", "写汉字 (xiě hànzì)"],
    },
    {
      id: "70000021-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 3,
      prompt: "Từ 'điện thoại di động' là:",
      choices: ["手机 (shǒujī)", "电话 (diànhuà)", "电脑 (diànnǎo)", "电视 (diànshì)"],
    },
    {
      id: "70000021-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 4,
      prompt: "Khi muốn nhờ vả lịch sự 'Xin hỏi...', người ta dùng từ:",
      choices: ["请问 (qǐngwèn)", "你好 (nǐhǎo)", "再见 (zàijiàn)", "对不起 (duìbuqǐ)"],
    },
    {
      id: "70000021-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 5,
      prompt: "Động từ 'giúp đỡ, tương trợ' là:",
      choices: ["帮助 (bāngzhù)", "认识 (rènshi)", "说话 (shuōhuà)", "听见 (tīngjiàn)"],
    },
    {
      id: "70000021-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 6,
      prompt: "Bạn trai và bạn gái lần lượt là:",
      choices: ["男朋友 (nán péngyou) 和 女朋友 (nǚ péngyou)", "同学 和 老师", "先生 和 女士", "哥哥 和 妹妹"],
    },
    {
      id: "70000021-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 7,
      prompt: "Câu chào lịch sự khi lần đầu gặp gỡ: 'Rất vui được quen biết bạn!' là:",
      choices: ["很高兴认识你！", "谢谢你的帮助！", "明天见！", "你身体好吗？"],
    },
    {
      id: "70000021-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000021",
      sort_order: 8,
      prompt: "Từ xưng hô trang trọng cho nam giới (ông, ngài) và nữ giới (bà, cô) là:",
      choices: ["先生 (xiānsheng) 和 女士 (nǚshì)", "男 和 女", "爸爸 和 妈妈", "朋友 和 同学"],
    },
  ],
  answerKeys: {
    "70000021-0000-4000-8000-000000000001": {
      question_id: "70000021-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "喂 (wèi) là tiếng chào 'Alo' khi nghe điện thoại.",
    },
    "70000021-0000-4000-8000-000000000002": {
      question_id: "70000021-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "打电话 là gọi điện thoại.",
    },
    "70000021-0000-4000-8000-000000000003": {
      question_id: "70000021-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "手机 là điện thoại di động.",
    },
    "70000021-0000-4000-8000-000000000004": {
      question_id: "70000021-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "请问 là cách nói lịch sự 'Xin hỏi...'",
    },
    "70000021-0000-4000-8000-000000000005": {
      question_id: "70000021-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "帮助 là giúp đỡ.",
    },
    "70000021-0000-4000-8000-000000000006": {
      question_id: "70000021-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "男朋友 (bạn trai) và 女朋友 (bạn gái).",
    },
    "70000021-0000-4000-8000-000000000007": {
      question_id: "70000021-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "很高兴认识你！(Rất vui được làm quen với bạn!).",
    },
    "70000021-0000-4000-8000-000000000008": {
      question_id: "70000021-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "先生 (ông/ngài) và 女士 (quý cô/bà).",
    },
  },
};


// BÀI 22: ĐẠI TỪ & CHỈ ĐỊNH
export const LESSON_22_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-022",
  slug: "hsk1-lesson-22",
  quiz: {
    id: "77777777-7777-4777-8777-000000000022",
    lesson_id: "l-hsk1-022",
    revision: 1,
    title: "Mini Quiz Bài 22: Đại từ & Chỉ định",
  },
  lessonTitle: "Bài 22: Đại từ & Chỉ định",
  questions: [
    {
      id: "70000022-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 1,
      prompt: "Đại từ chỉ 'tất cả mọi người, cả nhà' là:",
      choices: ["大家 (dàjiā)", "他们 (tāmen)", "我们 (wǒmen)", "你们 (nǐmen)"],
    },
    {
      id: "70000022-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 2,
      prompt: "Đại từ ngôi thứ ba số nhiều chỉ nữ giới (họ, các cô ấy) là:",
      choices: ["她们 (tāmen)", "他们 (tāmen)", "它们 (tāmen)", "我们 (wǒmen)"],
    },
    {
      id: "70000022-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 3,
      prompt: "Đại từ ngôi thứ ba chỉ đồ vật, động vật (nó, chúng nó) là:",
      choices: ["它 / 它们 (tā / tāmen)", "他 / 他们", "她 / 她们", "这 / 那"],
    },
    {
      id: "70000022-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 4,
      prompt: "Từ chỉ định cự ly gần 'cái này' và 'những cái này' là:",
      choices: ["这个 (zhè ge) 和 这些 (zhèxiē)", "那个 和 那些", "哪个 和 哪些", "这里 和 那里"],
    },
    {
      id: "70000022-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 5,
      prompt: "Từ chỉ định cự ly xa 'cái kia' và 'những cái kia' là:",
      choices: ["那个 (nà ge) 和 那些 (nàxiē)", "这个 和 这些", "哪里 和 哪里", "谁 和 怎么样"],
    },
    {
      id: "70000022-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 6,
      prompt: "Từ để hỏi 'ở đâu, chỗ nào' là:",
      choices: ["哪里 / 哪儿 (nǎlǐ / nǎr)", "这里 (zhèlǐ)", "那里 (nàlǐ)", "什么 (shénme)"],
    },
    {
      id: "70000022-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 7,
      prompt: "Hậu tố dùng để tạo số nhiều cho đại từ nhân xưng là:",
      choices: ["们 (men)", "个 (ge)", "些 (xiē)", "的 (de)"],
    },
    {
      id: "70000022-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000022",
      sort_order: 8,
      prompt: "Câu nào diễn đạt: 'Chúng tôi đều là sinh viên'?",
      choices: ["我们都是大学生。", "他们都是老师。", "大家都在家。", "你们是朋友吗？"],
    },
  ],
  answerKeys: {
    "70000022-0000-4000-8000-000000000001": {
      question_id: "70000022-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "大家 là mọi người, cả lớp, cả nhà.",
    },
    "70000022-0000-4000-8000-000000000002": {
      question_id: "70000022-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "她们 là các cô ấy/chị ấy (bộ nữ  nữ).",
    },
    "70000022-0000-4000-8000-000000000003": {
      question_id: "70000022-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "它 dùng cho vật và con vật.",
    },
    "70000022-0000-4000-8000-000000000004": {
      question_id: "70000022-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "这个 (cái này) và 这些 (những cái này).",
    },
    "70000022-0000-4000-8000-000000000005": {
      question_id: "70000022-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "那个 (cái kia) và 那些 (những cái kia).",
    },
    "70000022-0000-4000-8000-000000000006": {
      question_id: "70000022-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "哪里 / 哪儿 là đại từ nghi vấn ở đâu.",
    },
    "70000022-0000-4000-8000-000000000007": {
      question_id: "70000022-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "们 (chúng tôi 我们, các bạn 你们, họ 他们).",
    },
    "70000022-0000-4000-8000-000000000008": {
      question_id: "70000022-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "我们都是大学生 (Chúng tôi đều là sinh viên).",
    },
  },
};


// BÀI 23: VỊ TRÍ & PHƯƠNG HƯỚNG
export const LESSON_23_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-023",
  slug: "hsk1-lesson-23",
  quiz: {
    id: "77777777-7777-4777-8777-000000000023",
    lesson_id: "l-hsk1-023",
    revision: 1,
    title: "Mini Quiz Bài 23: Vị trí & Phương hướng",
  },
  lessonTitle: "Bài 23: Vị trí & Phương hướng",
  questions: [
    {
      id: "70000023-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 1,
      prompt: "Cặp từ 'trên - dưới' là:",
      choices: ["上 (shàng) - 下 (xià)", "里 (lǐ) - 外 (wài)", "前 (qián) - 后 (hòu)", "左 (zuǒ) - 右 (yòu)"],
    },
    {
      id: "70000023-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 2,
      prompt: "Cặp từ 'trong - ngoài' là:",
      choices: ["里 (lǐ) - 外 (wài)", "东 (dōng) - 西 (xī)", "南 (nán) - 北 (běi)", "旁 (páng) - 边 (biān)"],
    },
    {
      id: "70000023-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 3,
      prompt: "Từ nào mang nghĩa là 'bên cạnh'?",
      choices: ["旁边 (pángbiān)", "前边 (qiánbiān)", "后边 (hòubiān)", "里边 (lǐbiān)"],
    },
    {
      id: "70000023-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 4,
      prompt: "Bốn hướng địa lý cơ bản (Đông, Tây, Nam, Bắc) trong tiếng Trung là:",
      choices: ["东、西、南、北 (dōng, xī, nán, běi)", "上、下、左、右", "前、后、左、右", "里、外、中、间"],
    },
    {
      id: "70000023-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 5,
      prompt: "Phía trước và phía sau lần lượt là:",
      choices: ["前边 (qiánbiān) 和 后边 (hòubiān)", "左边 和 右边", "里边 和 外边", "东边 和 西边"],
    },
    {
      id: "70000023-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 6,
      prompt: "Câu 'Chú mèo con ở dưới gầm bàn' dịch là:",
      choices: ["小猫在桌子下面。", "小猫在桌子上面。", "小猫在椅子旁边。", "小猫在门外边。"],
    },
    {
      id: "70000023-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 7,
      prompt: "Câu 'Bệnh viện ở ngay bên cạnh trường học' dịch là:",
      choices: ["医院在学校旁边。", "学校在医院后面。", "商店在学校里面。", "火车站就在东边。"],
    },
    {
      id: "70000023-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000023",
      sort_order: 8,
      prompt: "Động từ 'đến, tới nơi' trong chỉ đường là:",
      choices: ["到 (dào)", "去 (qù)", "来 (lái)", "走 (zǒu)"],
    },
  ],
  answerKeys: {
    "70000023-0000-4000-8000-000000000001": {
      question_id: "70000023-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "上 (trên) và 下 (dưới).",
    },
    "70000023-0000-4000-8000-000000000002": {
      question_id: "70000023-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "里 (trong) và 外 (ngoài).",
    },
    "70000023-0000-4000-8000-000000000003": {
      question_id: "70000023-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "旁边 là bên cạnh.",
    },
    "70000023-0000-4000-8000-000000000004": {
      question_id: "70000023-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "东 (Đông), 西 (Tây), 南 (Nam), 北 (Bắc).",
    },
    "70000023-0000-4000-8000-000000000005": {
      question_id: "70000023-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "前边 (phía trước) và 后边 (phía sau).",
    },
    "70000023-0000-4000-8000-000000000006": {
      question_id: "70000023-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "小猫在桌子下面 (Mèo ở dưới bàn).",
    },
    "70000023-0000-4000-8000-000000000007": {
      question_id: "70000023-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "医院在学校旁边 (Bệnh viện ở cạnh trường học).",
    },
    "70000023-0000-4000-8000-000000000008": {
      question_id: "70000023-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "到 nghĩa là tới đích đến.",
    },
  },
};


// BÀI 24: SỐ ĐẾM LỚN & LƯỢNG TỪ
export const LESSON_24_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-024",
  slug: "hsk1-lesson-24",
  quiz: {
    id: "77777777-7777-4777-8777-000000000024",
    lesson_id: "l-hsk1-024",
    revision: 1,
    title: "Mini Quiz Bài 24: Số đếm lớn & Lượng từ",
  },
  lessonTitle: "Bài 24: Số đếm lớn & Lượng từ",
  questions: [
    {
      id: "70000024-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 1,
      prompt: "Số không (0) trong tiếng Trung viết là:",
      choices: ["零 (líng)", "一 (yī)", "十 (shí)", "百 (bǎi)"],
    },
    {
      id: "70000024-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 2,
      prompt: "Số 8 và số 9 lần lượt là:",
      choices: ["八 (bā) 和 九 (jiǔ)", "六 和 七", "九 和 八", "十 和 百"],
    },
    {
      id: "70000024-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 3,
      prompt: "Các đơn vị số đếm hàng 'trăm, nghìn, vạn (mười nghìn)' là:",
      choices: ["百 (bǎi)、千 (qiān)、万 (wàn)", "十、百、千", "元、角、分", "斤、两、钱"],
    },
    {
      id: "70000024-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 4,
      prompt: "Phân số 'một nửa' trong tiếng Trung nói là:",
      choices: ["一半 (yíbàn)", "一些 (yìxiē)", "一点儿 (yìdiǎnr)", "一下 (yíxià)"],
    },
    {
      id: "70000024-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 5,
      prompt: "Tiền tố dùng để tạo số thứ tự (thứ nhất, thứ hai...) là:",
      choices: ["第 (dì)", "个 (ge)", "本 (běn)", "些 (xiē)"],
    },
    {
      id: "70000024-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 6,
      prompt: "Từ dùng sau động từ để biểu thị hành động diễn ra nhanh hoặc thử làm một lát:",
      choices: ["一下 (yíxià)", "一点儿 (yìdiǎnr)", "一半 (yíbàn)", "一些 (yìxiē)"],
    },
    {
      id: "70000024-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 7,
      prompt: "Cặp từ 'nhiều - ít' là:",
      choices: ["多 (duō) - 少 (shǎo)", "大 (dà) - 小 (xiǎo)", "长 (cháng) - 短 (duǎn)", "远 (yuǎn) - 近 (jìn)"],
    },
    {
      id: "70000024-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000024",
      sort_order: 8,
      prompt: "Câu nào biểu đạt: 'Xin hãy đợi tôi một lát'?",
      choices: ["请等我一下。", "请喝一点儿水。", "这是第一课。", "他有两只小狗。"],
    },
  ],
  answerKeys: {
    "70000024-0000-4000-8000-000000000001": {
      question_id: "70000024-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "零 (líng) là số 0.",
    },
    "70000024-0000-4000-8000-000000000002": {
      question_id: "70000024-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "八 là 8, 九 là 9.",
    },
    "70000024-0000-4000-8000-000000000003": {
      question_id: "70000024-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "百 (trăm), 千 (nghìn), 万 (vạn - 10.000).",
    },
    "70000024-0000-4000-8000-000000000004": {
      question_id: "70000024-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "一半 là một nửa (1/2).",
    },
    "70000024-0000-4000-8000-000000000005": {
      question_id: "70000024-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "第 (第一 thứ nhất, 第二 thứ hai).",
    },
    "70000024-0000-4000-8000-000000000006": {
      question_id: "70000024-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "一下 (Ví dụ: 等一下 đợi một lát, 看一下 xem thử một lát).",
    },
    "70000024-0000-4000-8000-000000000007": {
      question_id: "70000024-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "多 (nhiều) và 少 (ít).",
    },
    "70000024-0000-4000-8000-000000000008": {
      question_id: "70000024-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "请等我一下 (Xin đợi tôi một lát).",
    },
  },
};


// BÀI 25: LỊCH TRÌNH & MỐC THỜI GIAN
export const LESSON_25_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-025",
  slug: "hsk1-lesson-25",
  quiz: {
    id: "77777777-7777-4777-8777-000000000025",
    lesson_id: "l-hsk1-025",
    revision: 1,
    title: "Mini Quiz Bài 25: Lịch trình & Mốc thời gian",
  },
  lessonTitle: "Bài 25: Lịch trình & Mốc thời gian",
  questions: [
    {
      id: "70000025-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 1,
      prompt: "Trật tự thời gian chuẩn trong tiếng Trung là:",
      choices: ["Năm -> Tháng -> Ngày -> Giờ -> Phút", "Phút -> Giờ -> Ngày -> Tháng -> Năm", "Ngày -> Tháng -> Năm", "Giờ -> Phút -> Ngày"],
    },
    {
      id: "70000025-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 2,
      prompt: "Năm ngoái, năm nay và năm sau lần lượt là:",
      choices: ["去年、今年、明年", "昨天、今天、明天", "前年、今年、后年", "上个月、这个月、下个月"],
    },
    {
      id: "70000025-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 3,
      prompt: "Hôm qua và ngày mai là:",
      choices: ["昨天 (zuótiān) 和 明天 (míngtiān)", "今天 和 后天", "前天 和 昨天", "早上 和 晚上"],
    },
    {
      id: "70000025-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 4,
      prompt: "Hai cách gọi Chủ nhật trong tiếng Trung là:",
      choices: ["星期天 和 星期日", "星期六 和 星期七", "礼拜六 和 周六", "周末 和 假期"],
    },
    {
      id: "70000025-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 5,
      prompt: "Khoảng thời gian 'tiếng đồng hồ' và 'phút' là:",
      choices: ["小时 (xiǎoshí) 和 分钟 (fēnzhōng)", "点 和 分", "年 和 月", "日 和 号"],
    },
    {
      id: "70000025-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 6,
      prompt: "Cặp từ mốc thời gian 'trước đây - sau này / trước khi - sau khi' là:",
      choices: ["以前 (yǐqián) - 以后 (yǐhòu)", "前边 - 后边", "早上 - 晚上", "昨天 - 明天"],
    },
    {
      id: "70000025-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 7,
      prompt: "Các buổi trong ngày (sáng, trưa, tối) lần lượt là:",
      choices: ["早上、中午、晚上", "上午、下午、夜里", "白天、黑夜、清晨", "早饭、午饭、晚饭"],
    },
    {
      id: "70000025-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000025",
      sort_order: 8,
      prompt: "Câu nào có nghĩa: 'Trước khi ăn cơm phải rửa tay'?",
      choices: ["吃饭以前要洗手。", "下课以后去书店。", "明天上午九点见。", "去年他在北京读书。"],
    },
  ],
  answerKeys: {
    "70000025-0000-4000-8000-000000000001": {
      question_id: "70000025-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "Tiếng Trung luôn đi từ đơn vị thời gian lớn nhất đến nhỏ nhất.",
    },
    "70000025-0000-4000-8000-000000000002": {
      question_id: "70000025-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "去年 (năm ngoái), 今年 (năm nay), 明年 (năm sau).",
    },
    "70000025-0000-4000-8000-000000000003": {
      question_id: "70000025-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "昨天 (hôm qua) và 明天 (ngày mai).",
    },
    "70000025-0000-4000-8000-000000000004": {
      question_id: "70000025-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "星期天 và 星期日 đều là Chủ nhật.",
    },
    "70000025-0000-4000-8000-000000000005": {
      question_id: "70000025-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "小时 (tiếng đồng hồ) và 分钟 (phút).",
    },
    "70000025-0000-4000-8000-000000000006": {
      question_id: "70000025-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "以前 (trước khi) và 以后 (sau khi).",
    },
    "70000025-0000-4000-8000-000000000007": {
      question_id: "70000025-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "早上 (buổi sáng), 中午 (buổi trưa), 晚上 (buổi tối).",
    },
    "70000025-0000-4000-8000-000000000008": {
      question_id: "70000025-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "吃饭以前 (trước khi ăn cơm) 要洗手 (phải rửa tay).",
    },
  },
};


// BÀI 26: TÂM LÝ & TRỢ TỪ NGỮ KHÍ
export const LESSON_26_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-026",
  slug: "hsk1-lesson-26",
  quiz: {
    id: "77777777-7777-4777-8777-000000000026",
    lesson_id: "l-hsk1-026",
    revision: 1,
    title: "Mini Quiz Bài 26: Tâm lý & Trợ từ ngữ khí",
  },
  lessonTitle: "Bài 26: Tâm lý & Trợ từ ngữ khí",
  questions: [
    {
      id: "70000026-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 1,
      prompt: "Động từ biểu thị tình cảm sâu sắc 'yêu' trong tiếng Trung là:",
      choices: ["爱 (ài)", "喜欢 (xǐhuan)", "想 (xiǎng)", "看 (kàn)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 2,
      prompt: "Động từ 'cảm thấy, cho rằng' là:",
      choices: ["觉得 (juéde)", "知道 (zhīdào)", "希望 (xīwàng)", "想 (xiǎng)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 3,
      prompt: "Động từ 'biết' thông tin hoặc sự việc là:",
      choices: ["知道 (zhīdào)", "认识 (rènshi)", "会 (huì)", "懂 (dǒng)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 4,
      prompt: "Phân biệt động từ năng nguyện: 'có thể (được phép, cho phép)' là:",
      choices: ["可以 (kěyǐ)", "会 (huì)", "想 (xiǎng)", "要 (yào)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 5,
      prompt: "Động từ năng nguyện biểu thị kỹ năng có được qua rèn luyện học tập là:",
      choices: ["会 (huì)", "能 (néng)", "可以 (kěyǐ)", "要 (yào)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 6,
      prompt: "Trợ từ ngữ khí đứng cuối câu mang tính chất rủ rê, gợi ý, đề nghị nhẹ nhàng là:",
      choices: ["吧 (ba)", "呢 (ne)", "了 (le)", "吗 (ma)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 7,
      prompt: "Trợ từ ngữ khí chỉ hành động đang diễn ra hoặc nhấn mạnh ngữ khí tiếp diễn là:",
      choices: ["呢 (ne)", "了 (le)", "吧 (ba)", "吗 (ma)"],
    },
    {
      id: "70000026-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000026",
      sort_order: 8,
      prompt: "Dịch câu: 'Tất cả chúng tôi đều rất thích học tiếng Trung' sang tiếng Trung:",
      choices: ["我们大家都非常喜欢学中文！", "他们都在北京大学读书。", "今天天气真好啊。", "请问您找谁？"],
    },
  ],
  answerKeys: {
    "70000026-0000-4000-8000-000000000001": {
      question_id: "70000026-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "爱 (ài) nghĩa là yêu thương.",
    },
    "70000026-0000-4000-8000-000000000002": {
      question_id: "70000026-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "觉得 là cảm thấy, nhận thấy.",
    },
    "70000026-0000-4000-8000-000000000003": {
      question_id: "70000026-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "知道 là biết thông tin.",
    },
    "70000026-0000-4000-8000-000000000004": {
      question_id: "70000026-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "可以 biểu thị sự cho phép hoặc khả năng được làm.",
    },
    "70000026-0000-4000-8000-000000000005": {
      question_id: "70000026-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "会 chỉ kỹ năng học được (như 会说汉语, 会游泳).",
    },
    "70000026-0000-4000-8000-000000000006": {
      question_id: "70000026-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "吧 đặt cuối câu gợi ý (Chúng ta đi thôi 走吧).",
    },
    "70000026-0000-4000-8000-000000000007": {
      question_id: "70000026-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "呢 (Ví dụ: 他看书呢 - Anh ấy đang đọc sách đấy).",
    },
    "70000026-0000-4000-8000-000000000008": {
      question_id: "70000026-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "我们大家都非常喜欢学中文！",
    },
  },
};


// CHẶNG 3: TỔNG ÔN & ĐÁNH GIÁ NĂNG LỰC (BÀI 9–14)
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
export const CHECKPOINT_05_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-cp05",
  slug: "hsk1-checkpoint-05",
  quiz: {
    id: "77777777-7777-4777-8777-000000000005",
    lesson_id: "l-hsk1-cp05",
    revision: 1,
    title: "Mini Quiz Chặng 5: Tổng ôn Toàn diện HSK 1 (Bài 21–26)",
  },
  lessonTitle: "Chặng 5: Tổng ôn Toàn diện HSK 1 (Bài 21–26)",
  questions: [
    {
      id: "70000005-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 1,
      prompt: "Từ chào 'Alo' khi nghe điện thoại là:",
      choices: ["喂", "好", "请", "问"],
    },
    {
      id: "70000005-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 2,
      prompt: "Cụm từ 'gọi điện thoại' là:",
      choices: ["打电话", "看电视", "发短信", "写字"],
    },
    {
      id: "70000005-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 3,
      prompt: "Đại từ chỉ 'tất cả mọi người' là:",
      choices: ["大家", "他们", "我们", "你们"],
    },
    {
      id: "70000005-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 4,
      prompt: "Từ chỉ vị trí 'bên cạnh' là:",
      choices: ["旁边", "前边", "后边", "里边"],
    },
    {
      id: "70000005-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 5,
      prompt: "Đơn vị số đếm hàng 'nghìn' (1.000) là:",
      choices: ["千", "百", "万", "十"],
    },
    {
      id: "70000005-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 6,
      prompt: "Khoảng thời gian 'tiếng đồng hồ' là:",
      choices: ["小时", "分钟", "点", "分"],
    },
    {
      id: "70000005-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 7,
      prompt: "Động từ 'cảm thấy, nhận thấy' là:",
      choices: ["觉得", "知道", "喜欢", "想"],
    },
    {
      id: "70000005-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000005",
      sort_order: 8,
      prompt: "Trợ từ gợi ý nhẹ nhàng ở cuối câu là:",
      choices: ["吧", "呢", "了", "吗"],
    },
  ],
  answerKeys: {
    "70000005-0000-4000-8000-000000000001": {
      question_id: "70000005-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "喂 (wèi) là Alo.",
    },
    "70000005-0000-4000-8000-000000000002": {
      question_id: "70000005-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "打电话 là gọi điện.",
    },
    "70000005-0000-4000-8000-000000000003": {
      question_id: "70000005-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "大家 là mọi người.",
    },
    "70000005-0000-4000-8000-000000000004": {
      question_id: "70000005-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "旁边 là bên cạnh.",
    },
    "70000005-0000-4000-8000-000000000005": {
      question_id: "70000005-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "千 (qiān) là nghìn.",
    },
    "70000005-0000-4000-8000-000000000006": {
      question_id: "70000005-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "小时 là tiếng đồng hồ.",
    },
    "70000005-0000-4000-8000-000000000007": {
      question_id: "70000005-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "觉得 là cảm thấy.",
    },
    "70000005-0000-4000-8000-000000000008": {
      question_id: "70000005-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "吧 biểu thị sự gợi ý/rủ rê.",
    },
  },
};
