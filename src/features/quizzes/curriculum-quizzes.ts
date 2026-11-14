import "server-only";
import type { Question } from "./contracts";

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
      choices: ["这是我爸爸。", "这是我妈妈。", "我爸爸在这儿。", "这是我的老师。"],
    },
    {
      id: "50000001-0000-4000-8000-000000000002",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 2,
      prompt: "Từ nào dưới đây có nghĩa là 'bác sĩ'?",
      choices: ["老师", "学生", "医生", "朋友"],
    },
    {
      id: "50000001-0000-4000-8000-000000000003",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 3,
      prompt: "Để hỏi 'Nhà bạn có mấy người?', người Trung Quốc thường dùng lượng từ nào đi với 'nhân khẩu'?",
      choices: ["你家有几个人？", "你家有几口人？", "你家有几个口？", "你家有几只人？"],
    },
    {
      id: "50000001-0000-4000-8000-000000000004",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 4,
      prompt: "Chữ '哥哥' có phiên âm pinyin và thanh điệu đúng là gì?",
      choices: ["gēge", "dīdi", "bàba", "jiějie"],
    },
    {
      id: "50000001-0000-4000-8000-000000000005",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 5,
      prompt: "Hoàn thành câu: '他是我妈妈，她______老师。' (Bà ấy là mẹ tôi, bà ấy là giáo viên).",
      choices: ["有", "是", "在", "很"],
    },
    {
      id: "50000001-0000-4000-8000-000000000006",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 6,
      prompt: "'我家有四口人：爸爸、妈妈、一个妹妹和我。' Câu này cho biết gia đình có bao nhiêu người con gái?",
      choices: ["1 người", "2 người", "3 người", "Không có ai"],
    },
    {
      id: "50000001-0000-4000-8000-000000000007",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 7,
      prompt: "Từ '家' (jiā) mang ý nghĩa nào sau đây?",
      choices: ["Trường học", "Bệnh viện", "Gia đình / Nhà", "Công ty"],
    },
    {
      id: "50000001-0000-4000-8000-000000000008",
      quiz_id: "55555555-5555-4555-8555-000000000005",
      sort_order: 8,
      prompt: "Chọn câu có trật tự từ đúng khi nói 'Em trai tôi cũng là học sinh':",
      choices: [
        "我弟弟也是学生。",
        "也是我弟弟学生。",
        "我弟弟是也学生。",
        "学生也是我弟弟。",
      ],
    },
  ],
  answerKeys: {
    "50000001-0000-4000-8000-000000000001": {
      question_id: "50000001-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'这是我爸爸' (Zhè shì wǒ bàba) có nghĩa là 'Đây là bố của tôi'. Trong mối quan hệ thân thuộc ruột thịt, trợ từ 的 (de) thường được lược bỏ.",
    },
    "50000001-0000-4000-8000-000000000002": {
      question_id: "50000001-0000-4000-8000-000000000002",
      correct_index: 2,
      explanation_vi: "'医生' (yīshēng) nghĩa là bác sĩ/thầy thuốc. '老师' là giáo viên, '学生' là học sinh, '朋友' là bạn bè.",
    },
    "50000001-0000-4000-8000-000000000003": {
      question_id: "50000001-0000-4000-8000-000000000003",
      correct_index: 1,
      explanation_vi: "Trong tiếng Trung, lượng từ truyền thống dùng để đếm thành viên trong gia đình (nhân khẩu) là '口' (kǒu): '你家有几口人？' (Nǐ jiā yǒu jǐ kǒu rén?).",
    },
    "50000001-0000-4000-8000-000000000004": {
      question_id: "50000001-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "'哥哥' (gēge) nghĩa là anh trai, âm tiết thứ hai đọc thanh nhẹ. 'dīdi' là cách gõ sai của dìdi (em trai).",
    },
    "50000001-0000-4000-8000-000000000005": {
      question_id: "50000001-0000-4000-8000-000000000005",
      correct_index: 1,
      explanation_vi: "Dùng phán đoán từ '是' (shì) để diễn tả nghề nghiệp, danh tính: '她是老师' (Bà ấy là giáo viên).",
    },
    "50000001-0000-4000-8000-000000000006": {
      question_id: "50000001-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "Gia đình gồm bố, mẹ, 1 em gái (一个妹妹) và tôi. Do đó có 1 người em gái được nhắc đến rõ ràng.",
    },
    "50000001-0000-4000-8000-000000000007": {
      question_id: "50000001-0000-4000-8000-000000000007",
      correct_index: 2,
      explanation_vi: "'家' (jiā) mang nghĩa là nhà hoặc gia đình (ví dụ: 回家 - về nhà, 我家 - nhà tôi/gia đình tôi).",
    },
    "50000001-0000-4000-8000-000000000008": {
      question_id: "50000001-0000-4000-8000-000000000008",
      correct_index: 0,
      explanation_vi: "Phó từ '也' (yě - cũng) luôn đứng trước động từ/tính từ, cụ thể đứng trước '是': '我弟弟也是学生' (Wǒ dìdi yě shì xuésheng).",
    },
  },
};

export const LESSON_06_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-006",
  slug: "hsk1-lesson-06",
  quiz: {
    id: "66666666-6666-4666-8666-000000000006",
    lesson_id: "l-hsk1-006",
    revision: 1,
    title: "Mini Quiz Bài 6: Thời gian, Ngày tháng & Sinh nhật",
  },
  lessonTitle: "Bài 6: Thời gian, Ngày tháng & Sinh nhật (时间、日期与生日)",
  questions: [
    {
      id: "60000001-0000-4000-8000-000000000001",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 1,
      prompt: "Trong tiếng Trung, thứ tự sắp xếp thời gian ngày tháng tuân theo quy tắc nào?",
      choices: [
        "Nhỏ đến lớn: ngày -> tháng -> năm",
        "Lớn đến nhỏ: năm -> tháng -> ngày",
        "Tùy ý không theo thứ tự",
        "Ngày và tháng đổi chỗ cho nhau",
      ],
    },
    {
      id: "60000001-0000-4000-8000-000000000002",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 2,
      prompt: "Hôm nay là Thứ Tư, trong tiếng Trung nói là:",
      choices: ["星期二", "星期三", "星期四", "星期五"],
    },
    {
      id: "60000001-0000-4000-8000-000000000003",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 3,
      prompt: "Cách diễn đạt nào đúng cho 'Chủ nhật' trong văn nói giao tiếp hàng ngày?",
      choices: ["星期七", "星期天 / 星期日", "星期八", "星期零"],
    },
    {
      id: "60000001-0000-4000-8000-000000000004",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 4,
      prompt: "Muốn hỏi 'Hôm nay là ngày mấy tháng mấy?', câu hỏi chuẩn là:",
      choices: ["今天几月几号？", "今天几号几月？", "今天什么时候月？", "今天多少星期？"],
    },
    {
      id: "60000001-0000-4000-8000-000000000005",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 5,
      prompt: "'现在八点三十分' có nghĩa là mấy giờ?",
      choices: ["8 giờ đúng", "8 giờ 13 phút", "8 giờ 30 phút (8 rưỡi)", "7 giờ 30 phút"],
    },
    {
      id: "60000001-0000-4000-8000-000000000006",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 6,
      prompt: "Câu chúc mừng sinh nhật chuẩn trong tiếng Trung là:",
      choices: ["祝你新年好！", "祝你生日快乐！", "祝你身体健康！", "再见！"],
    },
    {
      id: "60000001-0000-4000-8000-000000000007",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 7,
      prompt: "Nếu '昨天' là hôm qua, '今天' là hôm nay, thì 'ngày mai' là gì?",
      choices: ["后天", "前天", "明天", "大前天"],
    },
    {
      id: "60000001-0000-4000-8000-000000000008",
      quiz_id: "66666666-6666-4666-8666-000000000006",
      sort_order: 8,
      prompt: "Hoàn chỉnh hội thoại: A: '你的生日是几月几号？' – B: '我的生日是______。'",
      choices: ["星期五", "十月十五号", "北京人", "很好"],
    },
  ],
  answerKeys: {
    "60000001-0000-4000-8000-000000000001": {
      question_id: "60000001-0000-4000-8000-000000000001",
      correct_index: 1,
      explanation_vi: "Quy tắc thời gian trong tiếng Trung luôn từ đơn vị lớn đến đơn vị nhỏ: Năm (年) -> Tháng (月) -> Ngày (日/号) -> Buổi -> Giờ (点) -> Phút (分).",
    },
    "60000001-0000-4000-8000-000000000002": {
      question_id: "60000001-0000-4000-8000-000000000002",
      correct_index: 1,
      explanation_vi: "Thứ Hai là 星期一, Thứ Ba là 星期二, Thứ Tư là 星期三 (xīngqīsān), Thứ Năm là 星期四. Vì vậy Thứ Tư là '星期三'.",
    },
    "60000001-0000-4000-8000-000000000003": {
      question_id: "60000001-0000-4000-8000-000000000003",
      correct_index: 1,
      explanation_vi: "Chủ nhật trong tiếng Trung không dùng số 7 mà dùng '星期天' (xīngqītiān - khẩu ngữ) hoặc '星期日' (xīngqīrì - văn viết).",
    },
    "60000001-0000-4000-8000-000000000004": {
      question_id: "60000001-0000-4000-8000-000000000004",
      correct_index: 0,
      explanation_vi: "Theo thứ tự lớn trước nhỏ sau: tháng trước ngày sau -> '几月几号？' (Jǐ yuè jǐ hào?).",
    },
    "60000001-0000-4000-8000-000000000005": {
      question_id: "60000001-0000-4000-8000-000000000005",
      correct_index: 2,
      explanation_vi: "'八点' (bā diǎn) là 8 giờ, '三十分' (sānshí fēn) là 30 phút. Hoặc có thể nói '八点半'.",
    },
    "60000001-0000-4000-8000-000000000006": {
      question_id: "60000001-0000-4000-8000-000000000006",
      correct_index: 1,
      explanation_vi: "'祝你生日快乐！' (Zhù nǐ shēngrì kuàilè!) nghĩa là Chúc bạn sinh nhật vui vẻ.",
    },
    "60000001-0000-4000-8000-000000000007": {
      question_id: "60000001-0000-4000-8000-000000000007",
      correct_index: 2,
      explanation_vi: "'明天' (míngtiān) là ngày mai. '后天' là ngày kia, '前天' là hôm kia.",
    },
    "60000001-0000-4000-8000-000000000008": {
      question_id: "60000001-0000-4000-8000-000000000008",
      correct_index: 1,
      explanation_vi: "Câu hỏi hỏi ngày tháng ('几月几号'), nên câu trả lời phải là ngày tháng cụ thể như '十月十五号' (ngày 15 tháng 10).",
    },
  },
};

export const CURRICULUM_QUIZZES: Record<string, CurriculumQuizDefinition> = {
  "l-hsk1-005": LESSON_05_QUIZ,
  "hsk1-lesson-05": LESSON_05_QUIZ,
  "l-hsk1-006": LESSON_06_QUIZ,
  "hsk1-lesson-06": LESSON_06_QUIZ,
};

export function findCurriculumQuiz(lessonIdOrSlug: string): CurriculumQuizDefinition | undefined {
  return CURRICULUM_QUIZZES[lessonIdOrSlug];
}
