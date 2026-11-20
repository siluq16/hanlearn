import "server-only";
import type { Question } from "./contracts";
import {
  LESSON_01_QUIZ,
  LESSON_02_QUIZ,
  LESSON_03_QUIZ,
  LESSON_04_QUIZ,
} from "./curriculum-quizzes-batch1";
import {
  LESSON_11_QUIZ,
  LESSON_12_QUIZ,
  LESSON_13_QUIZ,
  LESSON_14_QUIZ,
  LESSON_15_QUIZ,
  LESSON_16_QUIZ,
  LESSON_17_QUIZ,
  LESSON_18_QUIZ,
  LESSON_19_QUIZ,
  LESSON_20_QUIZ,
  LESSON_21_QUIZ,
  LESSON_22_QUIZ,
  LESSON_23_QUIZ,
  LESSON_24_QUIZ,
  LESSON_25_QUIZ,
  LESSON_26_QUIZ,
  LESSON_27_QUIZ,
  LESSON_28_QUIZ,
  LESSON_29_QUIZ,
  LESSON_30_QUIZ,
  LESSON_31_QUIZ,
  LESSON_32_QUIZ,
  CHECKPOINT_03_QUIZ,
  CHECKPOINT_04_QUIZ,
  CHECKPOINT_05_QUIZ,
  CHECKPOINT_06_QUIZ,
} from "./curriculum-quizzes-batch2";


export interface CurriculumQuestion extends Question {
  id: string;
  quiz_id: string;
  sort_order: number;
  prompt: string;
  choices: string[];
}

export interface CurriculumAnswerKey {
  question_id: string;
  correct_index: number;
  explanation_vi: string;
}

export interface CurriculumQuizDefinition {
  lessonId: string;
  slug: string;
  quiz: {
    id: string;
    lesson_id: string;
    revision: number;
    title: string;
  };
  lessonTitle: string;
  questions: CurriculumQuestion[];
  answerKeys: Record<string, CurriculumAnswerKey>;
}

// LESSON 05 QUIZ
export const LESSON_05_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-005",
  slug: "hsk1-lesson-05",
  quiz: {
    id: "55555555-5555-4555-8555-000000000005",
    lesson_id: "l-hsk1-005",
    revision: 1,
    title: "Mini Quiz Bài 5: Gia đình & Nghề nghiệp",
  },
  lessonTitle: "Bài 5: Gia đình & Nghề nghiệp của tôi (我的家与职业)",
  questions: [
    {
      id: "50000001-0000-4000-8000-000000000001",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 1,
      prompt: "Muốn giới thiệu 'Đây là bố của tôi', câu nào dưới đây là đúng ngữ pháp?",
      choices: ["这是我爸爸。","我爸爸在这儿。","这是我的老师。","这是我妈妈。"],
    },
    {
      id: "50000001-0000-4000-8000-000000000002",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 2,
      prompt: "Từ nào dưới đây có nghĩa là 'bác sĩ'?",
      choices: ["学生","医生","老师","朋友"],
    },
    {
      id: "50000001-0000-4000-8000-000000000003",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 3,
      prompt: "Lượng từ chuẩn khi hỏi về số thành viên trong gia đình: '你家有几____人？'",
      choices: ["个","位","口","只"],
    },
    {
      id: "50000001-0000-4000-8000-000000000004",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 4,
      prompt: "Từ '哥哥' phát âm Pinyin là gì và có nghĩa là gì?",
      choices: ["dìdi (em trai)","bàba (bố)","gēge (anh trai)","péngyou (bạn bè)"],
    },
    {
      id: "50000001-0000-4000-8000-000000000005",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 5,
      prompt: "Điền từ thích hợp vào chỗ trống: '他____医院工作。' (Anh ấy làm việc ở bệnh viện)",
      choices: ["有","叫","是","在"],
    },
    {
      id: "50000001-0000-4000-8000-000000000006",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 6,
      prompt: "Câu '我妈妈是汉语老师。' có nghĩa là gì?",
      choices: ["Mẹ tôi là giáo viên tiếng Trung.","Mẹ tôi rất thích học tiếng Trung.","Mẹ tôi là bác sĩ ở bệnh viện.","Tôi và mẹ đều là học sinh."],
    },
    {
      id: "50000001-0000-4000-8000-000000000007",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 7,
      prompt: "Khi ai đó hỏi '你家有几口人？', câu trả lời nào phù hợp nhất?",
      choices: ["我家在北京。","我是中国人。","我今年二十岁。","我家有四口人。"],
    },
    {
      id: "50000001-0000-4000-8000-000000000008",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 8,
      prompt: "Trợ từ kết cấu '的' trong '我哥哥的朋友' biểu thị mối quan hệ gì?",
      choices: ["Thời gian","Sở hữu","Nghi vấn","So sánh"],
    },
  ],
  answerKeys: {
    "50000001-0000-4000-8000-000000000001": {
      question_id: "50000001-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'这是我爸爸。' (Zhè shì wǒ bàba.) là cấu trúc chuẩn để giới thiệu người thân.",
    },
    "50000001-0000-4000-8000-000000000002": {
      question_id: "50000001-0000-4000-8000-000000000002",
      correct_index: 1,
      explanation_vi: "'医生' (yīshēng) là bác sĩ. '老师' là giáo viên, '学生' là học sinh.",
    },
    "50000001-0000-4000-8000-000000000003": {
      question_id: "50000001-0000-4000-8000-000000000003",
      correct_index: 2,
      explanation_vi: "Lượng từ '口' (kǒu) dùng chuyên biệt khi đếm thành viên trong một gia đình.",
    },
    "50000001-0000-4000-8000-000000000004": {
      question_id: "50000001-0000-4000-8000-000000000004",
      correct_index: 2,
      explanation_vi: "'哥哥' phiên âm là gēge, nghĩa là anh trai.",
    },
    "50000001-0000-4000-8000-000000000005": {
      question_id: "50000001-0000-4000-8000-000000000005",
      correct_index: 3,
      explanation_vi: "Cấu trúc giới từ chỉ nơi chốn: 在 + Địa điểm + Động từ -> '在医院工作' (làm việc ở bệnh viện).",
    },
    "50000001-0000-4000-8000-000000000006": {
      question_id: "50000001-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'我妈妈是汉语老师。' dịch nghĩa chuẩn xác là 'Mẹ tôi là giáo viên tiếng Trung.'",
    },
    "50000001-0000-4000-8000-000000000007": {
      question_id: "50000001-0000-4000-8000-000000000007",
      correct_index: 3,
      explanation_vi: "Hỏi số người '几口人' phải trả lời bằng số lượng thành viên '四口人'.",
    },
    "50000001-0000-4000-8000-000000000008": {
      question_id: "50000001-0000-4000-8000-000000000008",
      correct_index: 1,
      explanation_vi: "Trợ từ '的' đặt giữa định ngữ và trung tâm ngữ biểu thị quan hệ sở hữu.",
    },
  },
};

// LESSON 06 QUIZ
export const LESSON_06_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-006",
  slug: "hsk1-lesson-06",
  quiz: {
    id: "66666666-6666-4666-8666-000000000006",
    lesson_id: "l-hsk1-006",
    revision: 1,
    title: "Mini Quiz Bài 6: Thời gian & Giờ giấc",
  },
  lessonTitle: "Bài 6: Bây giờ là mấy giờ? (现在几点？)",
  questions: [
    {
      id: "60000001-0000-4000-8000-000000000001",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 1,
      prompt: "Mẫu câu hỏi giờ 'Bây giờ là mấy giờ?' trong tiếng Trung là gì?",
      choices: ["现在几点？","今天星期几？","你几岁？","什么时候去？"],
    },
    {
      id: "60000001-0000-4000-8000-000000000002",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 2,
      prompt: "'星期三' trong tiếng Trung là thứ mấy trong tuần của tiếng Việt?",
      choices: ["Thứ năm","Thứ tư","Thứ ba","Thứ sáu"],
    },
    {
      id: "60000001-0000-4000-8000-000000000003",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 3,
      prompt: "Từ '下午' phát âm Pinyin là gì và chỉ khoảng thời gian nào?",
      choices: ["zhōngwǔ (buổi trưa)","shàngwǔ (buổi sáng)","wǎnshang (buổi tối)","xiàwǔ (buổi chiều)"],
    },
    {
      id: "60000001-0000-4000-8000-000000000004",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 4,
      prompt: "Trong tiếng Trung, thứ tự diễn đạt ngày tháng năm là như thế nào?",
      choices: ["Năm -> Tháng -> Ngày","Ngày -> Năm -> Tháng","Tháng -> Ngày -> Năm","Ngày -> Tháng -> Năm"],
    },
    {
      id: "60000001-0000-4000-8000-000000000005",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 5,
      prompt: "'8 giờ 30 phút' trong tiếng Trung được nói là gì?",
      choices: ["七点半","八点三十分","八点十分","九点半"],
    },
    {
      id: "60000001-0000-4000-8000-000000000006",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 6,
      prompt: "Câu '祝你生日快乐！' có nghĩa là gì?",
      choices: ["Hẹn gặp lại bạn vào ngày mai!","Chúc bạn năm mới vui vẻ!","Rất vui được quen biết bạn!","Chúc bạn sinh nhật vui vẻ!"],
    },
    {
      id: "60000001-0000-4000-8000-000000000007",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 7,
      prompt: "Từ nào dưới đây có nghĩa là 'ngày mai'?",
      choices: ["后天","今天","明天","昨天"],
    },
    {
      id: "60000001-0000-4000-8000-000000000008",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 8,
      prompt: "Khi được hỏi '今天几月几号？', câu trả lời đúng mẫu là:",
      choices: ["现在三点。","我二十岁。","今天十月十五号。","今天星期四。"],
    },
  ],
  answerKeys: {
    "60000001-0000-4000-8000-000000000001": {
      question_id: "60000001-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'现在几点？' (Xiànzài jǐ diǎn?) là mẫu câu hỏi giờ chuẩn xác nhất.",
    },
    "60000001-0000-4000-8000-000000000002": {
      question_id: "60000001-0000-4000-8000-000000000002",
      correct_index: 1,
      explanation_vi: "Tiếng Trung tính thứ bằng số: 星期一 (thứ Hai), 星期二 (thứ Ba), 星期三 (thứ Tư).",
    },
    "60000001-0000-4000-8000-000000000003": {
      question_id: "60000001-0000-4000-8000-000000000003",
      correct_index: 3,
      explanation_vi: "'下午' phát âm xiàwǔ, nghĩa là buổi chiều.",
    },
    "60000001-0000-4000-8000-000000000004": {
      question_id: "60000001-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "Tiếng Trung luôn đi từ đơn vị lớn đến đơn vị nhỏ: Năm -> Tháng -> Ngày.",
    },
    "60000001-0000-4000-8000-000000000005": {
      question_id: "60000001-0000-4000-8000-000000000005",
      correct_index: 1,
      explanation_vi: "'八点' là 8 giờ, '三十分' là 30 phút -> '八点三十分'.",
    },
    "60000001-0000-4000-8000-000000000006": {
      question_id: "60000001-0000-4000-8000-000000000006",
      correct_index: 3,
      explanation_vi: "'祝你生日快乐！' nghĩa là Chúc bạn sinh nhật vui vẻ.",
    },
    "60000001-0000-4000-8000-000000000007": {
      question_id: "60000001-0000-4000-8000-000000000007",
      correct_index: 2,
      explanation_vi: "'明天' (míngtiān) là ngày mai. '今天' là hôm nay, '昨天' là hôm qua.",
    },
    "60000001-0000-4000-8000-000000000008": {
      question_id: "60000001-0000-4000-8000-000000000008",
      correct_index: 2,
      explanation_vi: "Hỏi '几月几号' (ngày mấy tháng mấy) thì phải trả lời ngày tháng cụ thể như '十月十五号'.",
    },
  },
};

// LESSON 07 QUIZ
export const LESSON_07_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-007",
  slug: "hsk1-lesson-07",
  quiz: {
    id: "77777777-7777-4777-8777-000000000007",
    lesson_id: "l-hsk1-007",
    revision: 1,
    title: "Mini Quiz Bài 7: Mua sắm & Giá cả",
  },
  lessonTitle: "Bài 7: Mua sắm & Giá cả (买东西与多少钱)",
  questions: [
    {
      id: "70000001-0000-4000-8000-000000000001",
      quiz_id: "77777777-7777-4777-8777-000000000007",
      sort_order: 1,
      prompt: "Mẫu câu hỏi giá 'Cái này bao nhiêu tiền?' trong tiếng Trung là gì?",
      choices: ["这个多少钱？", "这个几点？", "这个叫什么？", "这个是谁的？"],
    },
    {
      id: "70000001-0000-4000-8000-000000000002",
      quiz_id: "77777777-7777-4777-8777-000000000007",
      sort_order: 2,
      prompt: "Từ nào dưới đây có nghĩa là 'mua'?",
      choices: ["卖 (mài)","看 (kàn)","吃 (chī)","买 (mǎi)"],
    },
    {
      id: "70000001-0000-4000-8000-000000000003",
      quiz_id: "77777777-7777-4777-8777-000000000007",
      sort_order: 3,
      prompt: "Khi người bán báo giá quá đắt và bạn muốn nói 'Đắt quá rồi!', bạn dùng câu nào?",
      choices: ["太大了！","太贵了！","太好了！","太少了！"],
    },
    {
      id: "70000001-0000-4000-8000-000000000004",
      quiz_id: "77777777-7777-4777-8777-000000000004",
      sort_order: 4,
      prompt: "Đơn vị tiền tệ thường dùng trong văn nói khẩu ngữ hàng ngày của người Trung Quốc là gì?",
      choices: ["个 (gè)","本 (běn)","斤 (jīn)","块 (kuài)"],
    },
    {
      id: "70000001-0000-4000-8000-000000000005",
      quiz_id: "77777777-7777-4777-8777-000000000007",
      sort_order: 5,
      prompt: "'五块钱一斤' có nghĩa là gì?",
      choices: ["Năm giờ ba mươi phút.","Mười đồng hai quả.","Năm đồng một cân.","Năm người một phòng."],
    },
    {
      id: "70000001-0000-4000-8000-000000000006",
      quiz_id: "77777777-7777-4777-8777-000000000007",
      sort_order: 6,
      prompt: "Từ trái nghĩa với '贵' (guì - đắt) là từ nào?",
      choices: ["大 (dà)","便宜 (piányi)","好 (hǎo)","多 (duō)"],
    },
    {
      id: "70000001-0000-4000-8000-000000000007",
      quiz_id: "77777777-7777-4777-8777-000000000007",
      sort_order: 7,
      prompt: "Điền từ thích hợp: '我想____三个苹果。' (Tôi muốn mua 3 quả táo)",
      choices: ["买","在","是","叫"],
    },
    {
      id: "70000001-0000-4000-8000-000000000008",
      quiz_id: "77777777-7777-4777-8777-000000000007",
      sort_order: 8,
      prompt: "'这个东西十块钱。' Câu này có nghĩa là gì?",
      choices: ["Bây giờ là mười giờ.","Tôi mua mười quả táo.","Đồ vật này mười đồng.","Cái này có mười người."],
    },
  ],
  answerKeys: {
    "70000001-0000-4000-8000-000000000001": {
      question_id: "70000001-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'这个多少钱？' (Zhège duōshao qián?) là mẫu câu hỏi giá phổ biến nhất.",
    },
    "70000001-0000-4000-8000-000000000002": {
      question_id: "70000001-0000-4000-8000-000000000002",
      correct_index: 3,
      explanation_vi: "'买' (mǎi - thanh 3) nghĩa là mua. '卖' (mài - thanh 4) nghĩa là bán.",
    },
    "70000001-0000-4000-8000-000000000003": {
      question_id: "70000001-0000-4000-8000-000000000003",
      correct_index: 1,
      explanation_vi: "'太贵了！' (Tài guì le!) biểu thị cảm thán đắt quá.",
    },
    "70000001-0000-4000-8000-000000000004": {
      question_id: "70000001-0000-4000-8000-000000000004",
      correct_index: 3,
      explanation_vi: "Trong khẩu ngữ, '块' (kuài) thay thế cho '元' (yuán) để chỉ đồng/tệ.",
    },
    "70000001-0000-4000-8000-000000000005": {
      question_id: "70000001-0000-4000-8000-000000000005",
      correct_index: 2,
      explanation_vi: "'五块钱' là 5 đồng, '一斤' là một cân (500g).",
    },
    "70000001-0000-4000-8000-000000000006": {
      question_id: "70000001-0000-4000-8000-000000000006",
      correct_index: 1,
      explanation_vi: "'便宜' (piányi) là rẻ, trái nghĩa hoàn toàn với '贵' (guì - đắt).",
    },
    "70000001-0000-4000-8000-000000000007": {
      question_id: "70000001-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "Động từ '买' đứng trước danh từ '三个苹果' -> '我想买三个苹果'.",
    },
    "70000001-0000-4000-8000-000000000008": {
      question_id: "70000001-0000-4000-8000-000000000008",
      correct_index: 2,
      explanation_vi: "'这个东西' là đồ này, '十块钱' là 10 đồng.",
    },
  },
};

// LESSON 08 QUIZ
export const LESSON_08_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-008",
  slug: "hsk1-lesson-08",
  quiz: {
    id: "88888888-8888-4888-8888-000000000008",
    lesson_id: "l-hsk1-008",
    revision: 1,
    title: "Mini Quiz Bài 8: Ăn uống & Gọi món",
  },
  lessonTitle: "Bài 8: Ăn uống & Gọi món (吃饭与喝水)",
  questions: [
    {
      id: "80000001-0000-4000-8000-000000000001",
      quiz_id: "88888888-8888-4888-8888-000000000008",
      sort_order: 1,
      prompt: "Từ nào dưới đây có nghĩa là 'uống' trong tiếng Trung?",
      choices: ["喝 (hē)", "吃 (chī)", "买 (mǎi)", "做 (zuò)"],
    },
    {
      id: "80000001-0000-4000-8000-000000000002",
      quiz_id: "88888888-8888-4888-8888-000000000002",
      sort_order: 2,
      prompt: "Muốn nói 'Tôi muốn ăn cơm trắng', câu nào đúng?",
      choices: ["我想喝米饭。","我不喜欢米饭。","米饭很好喝。","我想吃米饭。"],
    },
    {
      id: "80000001-0000-4000-8000-000000000003",
      quiz_id: "88888888-8888-4888-8888-000000000003",
      sort_order: 3,
      prompt: "Từ '茶' phát âm Pinyin là gì và có nghĩa là gì?",
      choices: ["chá (trà)","cài (món ăn)","shuǐ (nước)","fàn (cơm)"],
    },
    {
      id: "80000001-0000-4000-8000-000000000004",
      quiz_id: "88888888-8888-4888-8888-000000000004",
      sort_order: 4,
      prompt: "Trợ động từ nào dùng để diễn đạt ý muốn hoặc dự định 'muốn làm gì'?",
      choices: ["在 (zài)","想 (xiǎng)","吗 (ma)","很 (hěn)"],
    },
    {
      id: "80000001-0000-4000-8000-000000000005",
      quiz_id: "88888888-8888-4888-8888-000000000005",
      sort_order: 5,
      prompt: "Điền từ thích hợp: '我不喜欢____中国茶，我喜欢喝水。'",
      choices: ["看","买","喝","吃"],
    },
    {
      id: "80000001-0000-4000-8000-000000000006",
      quiz_id: "88888888-8888-4888-8888-000000000006",
      sort_order: 6,
      prompt: "'中国菜很好吃。' Câu này có nghĩa là gì?",
      choices: ["Món ăn Trung Quốc rất đắt.","Tôi không thích ăn món Trung Quốc.","Món ăn Trung Quốc rất ngon.","Người Trung Quốc rất thích ăn rau."],
    },
    {
      id: "80000001-0000-4000-8000-000000000007",
      quiz_id: "88888888-8888-4888-8888-000000000007",
      sort_order: 7,
      prompt: "Khi phục vụ hỏi '你想吃什么？', bạn muốn gọi mì sợi thì đáp thế nào?",
      choices: ["今天星期三。","我在医院工作。","我想喝茶。","我想吃面条儿。"],
    },
    {
      id: "80000001-0000-4000-8000-000000000008",
      quiz_id: "88888888-8888-4888-8888-000000000008",
      sort_order: 8,
      prompt: "Phủ định của '我想吃' khi không muốn ăn là gì?",
      choices: ["我不吃想","我不想吃","我不要吃","我没想吃"],
    },
  ],
  answerKeys: {
    "80000001-0000-4000-8000-000000000001": {
      question_id: "80000001-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'喝' (hē) là uống. '吃' (chī) là ăn.",
    },
    "80000001-0000-4000-8000-000000000002": {
      question_id: "80000001-0000-4000-8000-000000000002",
      correct_index: 3,
      explanation_vi: "'我想吃米饭。' (Wǒ xiǎng chī mǐfàn.) dịch chuẩn là 'Tôi muốn ăn cơm trắng.'",
    },
    "80000001-0000-4000-8000-000000000003": {
      question_id: "80000001-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "'茶' phiên âm là chá, nghĩa là trà.",
    },
    "80000001-0000-4000-8000-000000000004": {
      question_id: "80000001-0000-4000-8000-000000000004",
      correct_index: 1,
      explanation_vi: "'想' (xiǎng) đứng trước động từ thể hiện mong muốn.",
    },
    "80000001-0000-4000-8000-000000000005": {
      question_id: "80000001-0000-4000-8000-000000000005",
      correct_index: 2,
      explanation_vi: "Đồ uống như trà (茶) đi kèm với động từ '喝' (hē).",
    },
    "80000001-0000-4000-8000-000000000006": {
      question_id: "80000001-0000-4000-8000-000000000006",
      correct_index: 2,
      explanation_vi: "'好吃' (hǎochī) là ngon miệng khi ăn thức ăn.",
    },
    "80000001-0000-4000-8000-000000000007": {
      question_id: "80000001-0000-4000-8000-000000000007",
      correct_index: 3,
      explanation_vi: "Mì sợi là '面条儿' (miàntiáor), đi với động từ '吃' -> '我想吃面条儿'.",
    },
    "80000001-0000-4000-8000-000000000008": {
      question_id: "80000001-0000-4000-8000-000000000008",
      correct_index: 1,
      explanation_vi: "Phủ định của trợ động từ '想' là '不想'.",
    },
  },
};

// LESSON 09 QUIZ
export const LESSON_09_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-009",
  slug: "hsk1-lesson-09",
  quiz: {
    id: "99999999-9999-4999-8999-000000000009",
    lesson_id: "l-hsk1-009",
    revision: 1,
    title: "Mini Quiz Bài 9: Vị trí & Phương hướng",
  },
  lessonTitle: "Bài 9: Vị trí, Phương hướng & Nơi chốn (在哪儿与怎么去)",
  questions: [
    {
      id: "90000001-0000-4000-8000-000000000001",
      quiz_id: "99999999-9999-4999-8999-000000000009",
      sort_order: 1,
      prompt: "Đại từ nghi vấn nào dùng để hỏi 'ở đâu / chỗ nào'?",
      choices: ["哪儿 (nǎr)", "什么 (shénme)", "谁 (shéi)", "几 (jǐ)"],
    },
    {
      id: "90000001-0000-4000-8000-000000000002",
      quiz_id: "99999999-9999-4999-8999-000000000009",
      sort_order: 2,
      prompt: "Câu hỏi 'Xin hỏi, bệnh viện ở đâu?' viết thế nào?",
      choices: ["请问，商店几点开？","请问，医院在哪儿？","请问，这是谁的医院？","请问，学校在哪儿？"],
    },
    {
      id: "90000001-0000-4000-8000-000000000003",
      quiz_id: "99999999-9999-4999-8999-000000000009",
      sort_order: 3,
      prompt: "Trong cụm từ '学校前', từ '前' nằm ở vị trí nào và có nghĩa là gì?",
      choices: ["Đứng trước danh từ, có nghĩa là phía sau","Đứng sau danh từ địa điểm, có nghĩa là phía trước trường học","Đứng cuối câu làm trợ từ","Đứng đầu câu làm trạng từ"],
    },
    {
      id: "90000001-0000-4000-8000-000000000004",
      quiz_id: "99999999-9999-4999-8999-000000000009",
      sort_order: 4,
      prompt: "Từ nào có nghĩa là 'cửa hàng' trong tiếng Trung?",
      choices: ["医院 (yīyuàn)","学校 (xuéxiào)","饭馆 (fànguǎn)","商店 (shāngdiàn)"],
    },
    {
      id: "90000001-0000-4000-8000-000000000005",
      quiz_id: "99999999-9999-4999-8999-000000000009",
      sort_order: 5,
      prompt: "Điền giới từ thích hợp: '李老师____学校。' (Cô Lý ở trường học)",
      choices: ["有","是","在","去"],
    },
    {
      id: "90000001-0000-4000-8000-000000000006",
      quiz_id: "99999999-9999-4999-8999-000000000006",
      sort_order: 6,
      prompt: "Động từ '去' (qù) có nghĩa là gì?",
      choices: ["Đến từ","Ở tại","Xem nhìn","Đi đến"],
    },
    {
      id: "90000001-0000-4000-8000-000000000007",
      quiz_id: "99999999-9999-4999-8999-000000000009",
      sort_order: 7,
      prompt: "'医院在商店后面。' Nghĩa tiếng Việt chính xác là gì?",
      choices: ["Bệnh viện ở phía sau cửa hàng.","Tôi đi đến bệnh viện mua đồ.","Bệnh viện ở trước trường học.","Cửa hàng ở phía sau bệnh viện."],
    },
    {
      id: "90000001-0000-4000-8000-000000000008",
      quiz_id: "99999999-9999-4999-8999-000000000009",
      sort_order: 8,
      prompt: "Khi chỉ vị trí 'ở bên này / lối này', ta dùng từ nào?",
      choices: ["那边 (nàbiān)","哪儿 (nǎr)","这边 (zhèbiān)","前边 (qiánbian)"],
    },
  ],
  answerKeys: {
    "90000001-0000-4000-8000-000000000001": {
      question_id: "90000001-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'哪儿' (nǎr) là đại từ nghi vấn hỏi nơi chốn (ở đâu).",
    },
    "90000001-0000-4000-8000-000000000002": {
      question_id: "90000001-0000-4000-8000-000000000002",
      correct_index: 1,
      explanation_vi: "'请问，医院在哪儿？' là câu hỏi đường lịch sự đến bệnh viện.",
    },
    "90000001-0000-4000-8000-000000000003": {
      question_id: "90000001-0000-4000-8000-000000000003",
      correct_index: 1,
      explanation_vi: "Trong tiếng Trung, phương vị từ đứng sau danh từ chỉ nơi chốn (学校前).",
    },
    "90000001-0000-4000-8000-000000000004": {
      question_id: "90000001-0000-4000-8000-000000000004",
      correct_index: 3,
      explanation_vi: "'商店' (shāngdiàn) nghĩa là cửa hàng.",
    },
    "90000001-0000-4000-8000-000000000005": {
      question_id: "90000001-0000-4000-8000-000000000005",
      correct_index: 2,
      explanation_vi: "Giới từ '在' chỉ vị trí ở tại một nơi nào đó.",
    },
    "90000001-0000-4000-8000-000000000006": {
      question_id: "90000001-0000-4000-8000-000000000006",
      correct_index: 3,
      explanation_vi: "'去' (qù) nghĩa là đi (từ nơi người nói đến địa điểm khác).",
    },
    "90000001-0000-4000-8000-000000000007": {
      question_id: "90000001-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "'医院' (bệnh viện) + 在 + '商店后面' (sau cửa hàng).",
    },
    "90000001-0000-4000-8000-000000000008": {
      question_id: "90000001-0000-4000-8000-000000000008",
      correct_index: 2,
      explanation_vi: "'这边' (zhèbiān) chỉ vị trí bên này, gần người nói.",
    },
  },
};

// LESSON 10 QUIZ
export const LESSON_10_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-010",
  slug: "hsk1-lesson-10",
  quiz: {
    id: "10101010-1010-4010-8010-000000000010",
    lesson_id: "l-hsk1-010",
    revision: 1,
    title: "Mini Quiz Bài 10: Thói quen & Kỹ năng",
  },
  lessonTitle: "Bài 10: Thói quen & Kỹ năng hàng ngày (日常与做事情)",
  questions: [
    {
      id: "10000001-0000-4000-8000-000000000001",
      quiz_id: "10101010-1010-4010-8010-000000000010",
      sort_order: 1,
      prompt: "Năng nguyện động từ '会' (huì) dùng để biểu thị điều gì?",
      choices: [
        "Khả năng làm được việc gì nhờ học tập rèn luyện",
        "Ý định muốn làm việc gì",
        "Hành động đang diễn ra",
        "Mối quan hệ sở hữu",
      ],
    },
    {
      id: "10000001-0000-4000-8000-000000000002",
      quiz_id: "10101010-1010-4010-8010-000000000010",
      sort_order: 2,
      prompt: "Muốn hỏi 'Bạn biết viết chữ Hán không?', câu nào đúng?",
      choices: [
        "你会写汉字吗？",
        "你想写汉字吗？",
        "你在写汉字吗？",
        "你是汉字吗？",
      ],
    },
    {
      id: "10000001-0000-4000-8000-000000000003",
      quiz_id: "10101010-1010-4010-8010-000000000010",
      sort_order: 3,
      prompt: "Từ nào có nghĩa là 'đọc'?",
      choices: ["听 (tīng)","读 (dú)","做 (zuò)","写 (xiě)"],
    },
    {
      id: "10000001-0000-4000-8000-000000000004",
      quiz_id: "10101010-1010-4010-8010-000000000010",
      sort_order: 4,
      prompt: "Từ '听' (tīng) có nghĩa là gì?",
      choices: ["Viết","Nói","Đọc","Nghe"],
    },
    {
      id: "10000001-0000-4000-8000-000000000005",
      quiz_id: "10101010-1010-4010-8010-000000000010",
      sort_order: 5,
      prompt: "Phân biệt '会' và '能': Khi nói 'Hôm nay tôi ốm rồi, không thể đi học', ta dùng từ nào?",
      choices: ["不会 (bù huì)","不是 (bù shì)","不能 (bù néng)","不想 (bù xiǎng)"],
    },
    {
      id: "10000001-0000-4000-8000-000000000006",
      quiz_id: "10101010-1010-4010-8010-000000000010",
      sort_order: 6,
      prompt: "'大卫会说汉语。' Câu này có nghĩa là gì?",
      choices: ["Đại Vĩ là người Trung Quốc.","Đại Vĩ muốn đi Trung Quốc.","Đại Vĩ thích học tiếng Trung.","Đại Vĩ biết nói tiếng Trung."],
    },
    {
      id: "10000001-0000-4000-8000-000000000007",
      quiz_id: "10101010-1010-4010-8010-000000000010",
      sort_order: 7,
      prompt: "Điền từ thích hợp: '我每天____书、学汉语。' (Mỗi ngày tôi đọc sách, học tiếng Trung)",
      choices: ["在","看","买","去"],
    },
    {
      id: "10000001-0000-4000-8000-000000000008",
      quiz_id: "10101010-1010-4010-8010-000000000010",
      sort_order: 8,
      prompt: "Chữ Hán '汉字' phát âm Pinyin là gì?",
      choices: ["Zìdiǎn","Míngzi","Hànzì","Hànyǔ"],
    },
  ],
  answerKeys: {
    "10000001-0000-4000-8000-000000000001": {
      question_id: "10000001-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'会' diễn tả kỹ năng thu được qua quá trình học tập rèn luyện.",
    },
    "10000001-0000-4000-8000-000000000002": {
      question_id: "10000001-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "'你会写汉字吗？' là câu hỏi khả năng viết chữ Hán.",
    },
    "10000001-0000-4000-8000-000000000003": {
      question_id: "10000001-0000-4000-8000-000000000003",
      correct_index: 1,
      explanation_vi: "'读' (dú) nghĩa là đọc.",
    },
    "10000001-0000-4000-8000-000000000004": {
      question_id: "10000001-0000-4000-8000-000000000004",
      correct_index: 3,
      explanation_vi: "'听' (tīng) nghĩa là nghe.",
    },
    "10000001-0000-4000-8000-000000000005": {
      question_id: "10000001-0000-4000-8000-000000000005",
      correct_index: 2,
      explanation_vi: "Khi bị cản trở bởi điều kiện khách quan (bệnh tật, thời tiết), ta dùng '不能'.",
    },
    "10000001-0000-4000-8000-000000000006": {
      question_id: "10000001-0000-4000-8000-000000000006",
      correct_index: 3,
      explanation_vi: "'会说汉语' nghĩa là biết nói tiếng Trung.",
    },
    "10000001-0000-4000-8000-000000000007": {
      question_id: "10000001-0000-4000-8000-000000000007",
      correct_index: 1,
      explanation_vi: "Cụm '看书' (kàn shū) nghĩa là xem sách / đọc sách.",
    },
    "10000001-0000-4000-8000-000000000008": {
      question_id: "10000001-0000-4000-8000-000000000008",
      correct_index: 2,
      explanation_vi: "'汉字' phiên âm chuẩn là Hànzì.",
    },
  },
};

// CHECKPOINT 01 QUIZ
export const CHECKPOINT_01_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-cp01",
  slug: "hsk1-checkpoint-01",
  quiz: {
    id: "11111111-1111-4111-8111-000000000001",
    lesson_id: "l-hsk1-cp01",
    revision: 1,
    title: "Đánh giá Năng lực Chặng 1 (Bài 1–4)",
  },
  lessonTitle: "Chặng 1: Tổng ôn & Đánh giá Nền tảng (Bài 1–4)",
  questions: [
    {
      id: "11000001-0000-4000-8000-000000000001",
      quiz_id: "11111111-1111-4111-8111-000000000001",
      sort_order: 1,
      prompt: "Khi người khác nói '谢谢！', bạn nên lịch sự đáp lại câu nào?",
      choices: ["你会写汉字吗？","你想写汉字吗？","你是汉字吗？","你在写汉字吗？"],
    },
    {
      id: "11000001-0000-4000-8000-000000000002",
      quiz_id: "11111111-1111-4111-8111-000000000001",
      sort_order: 2,
      prompt: "Khi làm phiền người khác và nói '对不起！', người kia thường đáp lại câu nào?",
      choices: ["没关系！", "不客气！", "很高兴！", "你好！"],
    },
    {
      id: "11000001-0000-4000-8000-000000000003",
      quiz_id: "11111111-1111-4111-8111-000000000001",
      sort_order: 3,
      prompt: "Từ '美国人' có nghĩa là gì?",
      choices: ["Người Việt Nam","Giáo viên","Người Trung Quốc","Người Mỹ"],
    },
    {
      id: "11000001-0000-4000-8000-000000000004",
      quiz_id: "11111111-1111-4111-8111-000000000001",
      sort_order: 4,
      prompt: "Số '88' trong tiếng Trung đọc là gì?",
      choices: ["八十八 (bāshíbā)","十八 (shíbā)","八八 (bābā)","八十 (bāshí)"],
    },
    {
      id: "11000001-0000-4000-8000-000000000005",
      quiz_id: "11111111-1111-4111-8111-000000000001",
      sort_order: 5,
      prompt: "Muốn hỏi tuổi một người bạn đồng trang lứa, câu nào thông dụng nhất?",
      choices: ["你是谁？","你多大了？","你好吗？","你叫什么？"],
    },
    {
      id: "11000001-0000-4000-8000-000000000006",
      quiz_id: "11111111-1111-4111-8111-000000000001",
      sort_order: 6,
      prompt: "Hai thanh 3 đi liền nhau như '你好' (nǐ hǎo) sẽ biến điệu thế nào khi phát âm?",
      choices: ["Giữ nguyên không đổi","Thanh thứ nhất biến thành thanh 2: ní hǎo","Cả hai cùng đổi sang thanh 4","Thanh thứ hai biến thành thanh 1: nǐ hāo"],
    },
    {
      id: "11000001-0000-4000-8000-000000000007",
      quiz_id: "11111111-1111-4111-8111-000000000001",
      sort_order: 7,
      prompt: "Chữ '不' (bù) khi đứng trước âm mang thanh 4 (như 不是) sẽ biến điệu thành gì?",
      choices: ["Đọc thành thanh 3: bǔ shì","Đọc thành thanh 1: bū shì","Giữ nguyên bù shì","Đọc thành thanh 2: bú shì"],
    },
    {
      id: "11000001-0000-4000-8000-000000000008",
      quiz_id: "11111111-1111-4111-8111-000000000001",
      sort_order: 8,
      prompt: "Câu hỏi '你是学生吗？' có nghĩa là gì?",
      choices: ["Bạn là học sinh phải không?","Bạn đi học ở đâu?","Bạn tên là gì?","Bạn có bao nhiêu học sinh?"],
    },
  ],
  answerKeys: {
    "11000001-0000-4000-8000-000000000001": {
      question_id: "11000001-0000-4000-8000-000000000001",
      correct_index: 2,
      explanation_vi: "Đáp lễ '谢谢' bằng '不客气' (Đừng khách sáo).",
    },
    "11000001-0000-4000-8000-000000000002": {
      question_id: "11000001-0000-4000-8000-000000000002",
      correct_index: 2,
      explanation_vi: "Đáp lại lời xin lỗi '对不起' bằng '没关系' (Không sao đâu).",
    },
    "11000001-0000-4000-8000-000000000003": {
      question_id: "11000001-0000-4000-8000-000000000003",
      correct_index: 3,
      explanation_vi: "'美国人' nghĩa là người Mỹ.",
    },
    "11000001-0000-4000-8000-000000000004": {
      question_id: "11000001-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "Số 88 ghép từ 八 (8) + 十 (10) + 八 (8) -> 八十八.",
    },
    "11000001-0000-4000-8000-000000000005": {
      question_id: "11000001-0000-4000-8000-000000000005",
      correct_index: 1,
      explanation_vi: "'你多大了？' là câu hỏi tuổi thông dụng cho người lớn/bạn bè.",
    },
    "11000001-0000-4000-8000-000000000006": {
      question_id: "11000001-0000-4000-8000-000000000006",
      correct_index: 1,
      explanation_vi: "Quy tắc 3 + 3 -> 2 + 3: nǐ hǎo đọc thành ní hǎo.",
    },
    "11000001-0000-4000-8000-000000000007": {
      question_id: "11000001-0000-4000-8000-000000000007",
      correct_index: 3,
      explanation_vi: "'不' đứng trước thanh 4 biến thành thanh 2: bú shì.",
    },
    "11000001-0000-4000-8000-000000000008": {
      question_id: "11000001-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "Câu hỏi nghi vấn Đúng/Sai với '吗': '你是学生吗？'.",
    },
  },
};

// CHECKPOINT 02 QUIZ
export const CHECKPOINT_02_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-cp02",
  slug: "hsk1-checkpoint-02",
  quiz: {
    id: "22222222-2222-4222-8222-000000000002",
    lesson_id: "l-hsk1-cp02",
    revision: 1,
    title: "Đánh giá Năng lực Chặng 2 (Bài 5–8)",
  },
  lessonTitle: "Chặng 2: Tổng ôn & Đánh giá Đời sống & Mua sắm (Bài 5–8)",
  questions: [
    {
      id: "22000001-0000-4000-8000-000000000001",
      quiz_id: "22222222-2222-4222-8222-000000000002",
      sort_order: 1,
      prompt: "Lượng từ thích hợp khi đếm số thành viên trong gia đình '你家有几____人？' là gì?",
      choices: ["你好！","不客气！","没关系！","很高兴！"],
    },
    {
      id: "22000001-0000-4000-8000-000000000002",
      quiz_id: "22222222-2222-4222-8222-000000000002",
      sort_order: 2,
      prompt: "'现在几点？' dùng để hỏi điều gì?",
      choices: [
        "Bây giờ là mấy giờ?",
        "Hôm nay thứ mấy?",
        "Bao nhiêu tiền một cân?",
        "Bạn muốn ăn gì?",
      ],
    },
    {
      id: "22000001-0000-4000-8000-000000000003",
      quiz_id: "22222222-2222-4222-8222-000000000002",
      sort_order: 3,
      prompt: "Cách nói '8 giờ 30 phút' trong tiếng Trung là gì?",
      choices: ["八点三十分 (hoặc 八点半)","九点半","七点三十分","八点十分"],
    },
    {
      id: "22000001-0000-4000-8000-000000000004",
      quiz_id: "22222222-2222-4222-8222-000000000002",
      sort_order: 4,
      prompt: "Khi đi chợ muốn hỏi 'Táo bao nhiêu tiền một cân?', câu chuẩn là gì?",
      choices: ["苹果好吃吗？","苹果几点了？","苹果在哪儿？","苹果多少钱一斤？"],
    },
    {
      id: "22000001-0000-4000-8000-000000000005",
      quiz_id: "22222222-2222-4222-8222-000000000002",
      sort_order: 5,
      prompt: "Mẫu câu cảm thán 'Đắt quá rồi!' là gì?",
      choices: ["太好了！","太少了！","太贵了！","太大了！"],
    },
    {
      id: "22000001-0000-4000-8000-000000000006",
      quiz_id: "22222222-2222-4222-8222-000000000002",
      sort_order: 6,
      prompt: "Từ '医生' có nghĩa là gì và làm việc ở đâu?",
      choices: ["Giáo viên, làm việc ở 学校 (trường học)","Bác sĩ, làm việc ở 医院 (bệnh viện)","Bán hàng, làm việc ở 饭馆 (quán ăn)","Học sinh, học ở 商店 (cửa hàng)"],
    },
    {
      id: "22000001-0000-4000-8000-000000000007",
      quiz_id: "22222222-2222-4222-8222-000000000002",
      sort_order: 7,
      prompt: "'中午我想去吃中国菜。' Nghĩa là gì?",
      choices: ["Buổi trưa tôi ở nhà nấu cơm.","Buổi chiều tôi muốn đi mua táo.","Buổi trưa tôi muốn đi ăn món Trung Quốc.","Buổi sáng tôi muốn uống trà Trung Quốc."],
    },
    {
      id: "22000001-0000-4000-8000-000000000008",
      quiz_id: "22222222-2222-4222-8222-000000000002",
      sort_order: 8,
      prompt: "'星期天' là thứ mấy trong tuần?",
      choices: ["Chủ nhật","Thứ bảy","Thứ sáu","Thứ hai"],
    },
  ],
  answerKeys: {
    "22000001-0000-4000-8000-000000000001": {
      question_id: "22000001-0000-4000-8000-000000000001",
      correct_index: 1,
      explanation_vi: "Lượng từ đếm thành viên gia đình là '口'.",
    },
    "22000001-0000-4000-8000-000000000002": {
      question_id: "22000001-0000-4000-8000-000000000002",
      correct_index: 3,
      explanation_vi: "'现在几点？' hỏi giờ hiện tại.",
    },
    "22000001-0000-4000-8000-000000000003": {
      question_id: "22000001-0000-4000-8000-000000000003",
      correct_index: 0,
      explanation_vi: "8h30 là 八点三十分 hoặc 八点半.",
    },
    "22000001-0000-4000-8000-000000000004": {
      question_id: "22000001-0000-4000-8000-000000000004",
      correct_index: 3,
      explanation_vi: "Hỏi giá hoa quả: 苹果多少钱一斤？",
    },
    "22000001-0000-4000-8000-000000000005": {
      question_id: "22000001-0000-4000-8000-000000000005",
      correct_index: 2,
      explanation_vi: "Cảm thán mức độ quá: 太贵了！",
    },
    "22000001-0000-4000-8000-000000000006": {
      question_id: "22000001-0000-4000-8000-000000000006",
      correct_index: 1,
      explanation_vi: "Bác sĩ là 医生, làm việc ở 医院 (bệnh viện).",
    },
    "22000001-0000-4000-8000-000000000007": {
      question_id: "22000001-0000-4000-8000-000000000007",
      correct_index: 2,
      explanation_vi: "Chỉ mong muốn ăn trưa món Trung Quốc.",
    },
    "22000001-0000-4000-8000-000000000008": {
      question_id: "22000001-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "星期天 (hoặc 星期日) là Chủ nhật.",
    },
  },
};

export const ALL_CURRICULUM_QUIZZES: CurriculumQuizDefinition[] = [
  LESSON_01_QUIZ,
  LESSON_02_QUIZ,
  LESSON_03_QUIZ,
  LESSON_04_QUIZ,
  LESSON_05_QUIZ,
  LESSON_06_QUIZ,
  LESSON_07_QUIZ,
  LESSON_08_QUIZ,
  LESSON_09_QUIZ,
  LESSON_10_QUIZ,
  LESSON_11_QUIZ,
  LESSON_12_QUIZ,
  LESSON_13_QUIZ,
  LESSON_14_QUIZ,
  LESSON_15_QUIZ,
  LESSON_16_QUIZ,
  LESSON_17_QUIZ,
  LESSON_18_QUIZ,
  LESSON_19_QUIZ,
  LESSON_20_QUIZ,
  LESSON_21_QUIZ,
  LESSON_22_QUIZ,
  LESSON_23_QUIZ,
  LESSON_24_QUIZ,
  LESSON_25_QUIZ,
  LESSON_26_QUIZ,
  LESSON_27_QUIZ,
  LESSON_28_QUIZ,
  LESSON_29_QUIZ,
  LESSON_30_QUIZ,
  LESSON_31_QUIZ,
  LESSON_32_QUIZ,
  CHECKPOINT_01_QUIZ,
  CHECKPOINT_02_QUIZ,
  CHECKPOINT_03_QUIZ,
  CHECKPOINT_04_QUIZ,
  CHECKPOINT_05_QUIZ,
  CHECKPOINT_06_QUIZ,
];

export const CURRICULUM_QUIZZES: Record<string, CurriculumQuizDefinition> = {
  "l-hsk1-001": LESSON_01_QUIZ,
  "hsk1-lesson-01": LESSON_01_QUIZ,
  "639665c9-952d-5714-a276-537a3568b463": LESSON_01_QUIZ,
  "l-hsk1-002": LESSON_02_QUIZ,
  "hsk1-lesson-02": LESSON_02_QUIZ,
  "022f2393-6cff-54f0-b24f-03ee7cfc3cfe": LESSON_02_QUIZ,
  "l-hsk1-003": LESSON_03_QUIZ,
  "hsk1-lesson-03": LESSON_03_QUIZ,
  "321e1ed9-a427-57b3-817e-5acbb1b9bab8": LESSON_03_QUIZ,
  "l-hsk1-004": LESSON_04_QUIZ,
  "hsk1-lesson-04": LESSON_04_QUIZ,
  "47097e01-9557-5f82-a84b-fba132cfca05": LESSON_04_QUIZ,
  "l-hsk1-005": LESSON_05_QUIZ,
  "hsk1-lesson-05": LESSON_05_QUIZ,
  "l-hsk1-006": LESSON_06_QUIZ,
  "hsk1-lesson-06": LESSON_06_QUIZ,
  "l-hsk1-007": LESSON_07_QUIZ,
  "hsk1-lesson-07": LESSON_07_QUIZ,
  "l-hsk1-008": LESSON_08_QUIZ,
  "hsk1-lesson-08": LESSON_08_QUIZ,
  "l-hsk1-009": LESSON_09_QUIZ,
  "hsk1-lesson-09": LESSON_09_QUIZ,
  "l-hsk1-010": LESSON_10_QUIZ,
  "hsk1-lesson-10": LESSON_10_QUIZ,
  "l-hsk1-cp01": CHECKPOINT_01_QUIZ,
  "hsk1-checkpoint-01": CHECKPOINT_01_QUIZ,
  "l-hsk1-cp02": CHECKPOINT_02_QUIZ,
  "hsk1-checkpoint-02": CHECKPOINT_02_QUIZ,
  "l-hsk1-011": LESSON_11_QUIZ,
  "hsk1-lesson-11": LESSON_11_QUIZ,
  "l-hsk1-012": LESSON_12_QUIZ,
  "hsk1-lesson-12": LESSON_12_QUIZ,
  "l-hsk1-013": LESSON_13_QUIZ,
  "hsk1-lesson-13": LESSON_13_QUIZ,
  "l-hsk1-014": LESSON_14_QUIZ,
  "hsk1-lesson-14": LESSON_14_QUIZ,
  "l-hsk1-015": LESSON_15_QUIZ,
  "hsk1-lesson-15": LESSON_15_QUIZ,
  "l-hsk1-016": LESSON_16_QUIZ,
  "hsk1-lesson-16": LESSON_16_QUIZ,
  "l-hsk1-017": LESSON_17_QUIZ,
  "hsk1-lesson-17": LESSON_17_QUIZ,
  "l-hsk1-018": LESSON_18_QUIZ,
  "hsk1-lesson-18": LESSON_18_QUIZ,
  "l-hsk1-019": LESSON_19_QUIZ,
  "hsk1-lesson-19": LESSON_19_QUIZ,
  "l-hsk1-020": LESSON_20_QUIZ,
  "hsk1-lesson-20": LESSON_20_QUIZ,
  "l-hsk1-021": LESSON_21_QUIZ,
  "hsk1-lesson-21": LESSON_21_QUIZ,
  "l-hsk1-022": LESSON_22_QUIZ,
  "hsk1-lesson-22": LESSON_22_QUIZ,
  "l-hsk1-023": LESSON_23_QUIZ,
  "hsk1-lesson-23": LESSON_23_QUIZ,
  "l-hsk1-024": LESSON_24_QUIZ,
  "hsk1-lesson-24": LESSON_24_QUIZ,
  "l-hsk1-025": LESSON_25_QUIZ,
  "hsk1-lesson-25": LESSON_25_QUIZ,
  "l-hsk1-026": LESSON_26_QUIZ,
  "hsk1-lesson-26": LESSON_26_QUIZ,
  "l-hsk1-027": LESSON_27_QUIZ,
  "hsk1-lesson-27": LESSON_27_QUIZ,
  "l-hsk1-028": LESSON_28_QUIZ,
  "hsk1-lesson-28": LESSON_28_QUIZ,
  "l-hsk1-029": LESSON_29_QUIZ,
  "hsk1-lesson-29": LESSON_29_QUIZ,
  "l-hsk1-030": LESSON_30_QUIZ,
  "hsk1-lesson-30": LESSON_30_QUIZ,
  "l-hsk1-031": LESSON_31_QUIZ,
  "hsk1-lesson-31": LESSON_31_QUIZ,
  "l-hsk1-032": LESSON_32_QUIZ,
  "hsk1-lesson-32": LESSON_32_QUIZ,
  "l-hsk1-cp03": CHECKPOINT_03_QUIZ,
  "hsk1-checkpoint-03": CHECKPOINT_03_QUIZ,
  "l-hsk1-cp04": CHECKPOINT_04_QUIZ,
  "hsk1-checkpoint-04": CHECKPOINT_04_QUIZ,
  "l-hsk1-cp05": CHECKPOINT_05_QUIZ,
  "hsk1-checkpoint-05": CHECKPOINT_05_QUIZ,
  "l-hsk1-cp06": CHECKPOINT_06_QUIZ,
  "hsk1-checkpoint-06": CHECKPOINT_06_QUIZ,
};

export function findCurriculumQuiz(lessonIdOrSlug: string): CurriculumQuizDefinition | undefined {
  return CURRICULUM_QUIZZES[lessonIdOrSlug];
}
