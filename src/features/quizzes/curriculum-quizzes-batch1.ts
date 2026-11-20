import type { CurriculumQuizDefinition } from "./curriculum-quizzes";

// LESSON 01 QUIZ
export const LESSON_01_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-001",
  slug: "hsk1-lesson-01",
  quiz: {
    id: "08f2e3a1-e171-5aa6-93b9-ac777b053a41",
    lesson_id: "l-hsk1-001",
    revision: 3,
    title: "Mini Quiz Bài 1: Chào hỏi & Tự giới thiệu",
  },
  lessonTitle: "Bài 1: Chào hỏi & Tự giới thiệu (自我介绍)",
  questions: [
    {
      id: "10000001-0000-4000-8000-000000000001",
      quiz_id: "08f2e3a1-e171-5aa6-93b9-ac777b053a41",
      sort_order: 1,
      prompt: "Cách nói nào có nghĩa là 'Xin chào!' thông dụng nhất?",
      choices: ["再见！","谢谢！","你好！","你好吗？"],
    },
    {
      id: "10000001-0000-4000-8000-000000000002",
      quiz_id: "08f2e3a1-e171-5aa6-93b9-ac777b053a41",
      sort_order: 2,
      prompt: "Muốn hỏi 'Bạn có khỏe không?', chọn câu phù hợp:",
      choices: ["谢谢你！","你好吗？","再见！","我很好。"],
    },
    {
      id: "10000001-0000-4000-8000-000000000003",
      quiz_id: "08f2e3a1-e171-5aa6-93b9-ac777b053a41",
      sort_order: 3,
      prompt: "Khi nói liền '你好', thanh điệu của chữ '你' biến đổi thế nào?",
      choices: ["Giữ nguyên không đổi","Từ thanh 3 biến thành thanh 2 (đọc gần như ní)","Biến thành thanh nhẹ","Biến thành thanh 4"],
    },
    {
      id: "10000001-0000-4000-8000-000000000004",
      quiz_id: "08f2e3a1-e171-5aa6-93b9-ac777b053a41",
      sort_order: 4,
      prompt: "Câu đáp lại lịch sự khi người khác nói '谢谢' (Cảm ơn) là:",
      choices: ["没关系","再见","你好","不客气"],
    },
    {
      id: "10000001-0000-4000-8000-000000000005",
      quiz_id: "08f2e3a1-e171-5aa6-93b9-ac777b053a41",
      sort_order: 5,
      prompt: "Từ '认识' trong '很高兴认识你' có nghĩa là gì?",
      choices: ["Quen biết","Bác sĩ","Tạm biệt","Cảm ơn"],
    },
    {
      id: "10000001-0000-4000-8000-000000000006",
      quiz_id: "08f2e3a1-e171-5aa6-93b9-ac777b053a41",
      sort_order: 6,
      prompt: "Đại từ nhân xưng '您' (nín) khác '你' (nǐ) ở điểm nào?",
      choices: ["Nghĩa là trẻ em","Dùng cho số nhiều","Là dạng trang trọng, kính ngữ thể hiện sự tôn trọng","Dùng cho ngôi thứ ba"],
    },
    {
      id: "10000001-0000-4000-8000-000000000007",
      quiz_id: "08f2e3a1-e171-5aa6-93b9-ac777b053a41",
      sort_order: 7,
      prompt: "Điền từ thích hợp: '我____李明。' (Tôi tên là Lý Minh)",
      choices: ["叫","很","呢","吗"],
    },
    {
      id: "10000001-0000-4000-8000-000000000008",
      quiz_id: "08f2e3a1-e171-5aa6-93b9-ac777b053a41",
      sort_order: 8,
      prompt: "Trợ từ nghi vấn '吗' đọc bằng thanh gì?",
      choices: ["Thanh 3","Thanh 1","Thanh 4","Thanh nhẹ (không dấu)"],
    },
  ],
  answerKeys: {
    "10000001-0000-4000-8000-000000000001": {
      question_id: "10000001-0000-4000-8000-000000000001",
      correct_index: 2,
      explanation_vi: "'你好！' (nǐ hǎo) là lời chào thông dụng nhất.",
    },
    "10000001-0000-4000-8000-000000000002": {
      question_id: "10000001-0000-4000-8000-000000000002",
      correct_index: 1,
      explanation_vi: "'你好吗？' dùng để hỏi thăm sức khỏe/tình hình của đối phương.",
    },
    "10000001-0000-4000-8000-000000000003": {
      question_id: "10000001-0000-4000-8000-000000000003",
      correct_index: 1,
      explanation_vi: "Quy tắc biến điệu hai thanh 3: thanh đầu đọc thành thanh 2 (ní hǎo).",
    },
    "10000001-0000-4000-8000-000000000004": {
      question_id: "10000001-0000-4000-8000-000000000004",
      correct_index: 3,
      explanation_vi: "Đáp lại '谢谢' chuẩn là '不客气' (đừng khách sáo).",
    },
    "10000001-0000-4000-8000-000000000005": {
      question_id: "10000001-0000-4000-8000-000000000005",
      correct_index: 0,
      explanation_vi: "'认识' (rènshi) nghĩa là quen biết, nhận ra.",
    },
    "10000001-0000-4000-8000-000000000006": {
      question_id: "10000001-0000-4000-8000-000000000006",
      correct_index: 2,
      explanation_vi: "'您' là đại từ kính cẩn dành cho người lớn tuổi, thầy cô giáo, khách quý.",
    },
    "10000001-0000-4000-8000-000000000007": {
      question_id: "10000001-0000-4000-8000-000000000007",
      correct_index: 0,
      explanation_vi: "'我叫...' là cấu trúc xưng tên trong tiếng Trung.",
    },
    "10000001-0000-4000-8000-000000000008": {
      question_id: "10000001-0000-4000-8000-000000000008",
      correct_index: 3,
      explanation_vi: "Trợ từ ngữ khí '吗' đứng cuối câu luôn phát âm thanh nhẹ (khinh thanh).",
    },
  },
};

// LESSON 02 QUIZ
export const LESSON_02_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-002",
  slug: "hsk1-lesson-02",
  quiz: {
    id: "22222222-2222-4222-8222-000000000002",
    lesson_id: "l-hsk1-002",
    revision: 1,
    title: "Mini Quiz Bài 2: Tự giới thiệu bản thân",
  },
  lessonTitle: "Bài 2: Tôi tên là... (我叫…… — Giới thiệu bản thân)",
  questions: [
    {
      id: "20000001-0000-4000-8000-000000000001",
      quiz_id: "22222222-2222-4222-8222-000000000002",
      sort_order: 1,
      prompt: "Để hỏi 'Bạn tên là gì?', câu hỏi chuẩn và đầy đủ là:",
      choices: ["你好吗？","你是谁？","你叫什么名字？","你是中国人吗？"],
    },
    {
      id: "20000001-0000-4000-8000-000000000002",
      quiz_id: "22222222-2222-4222-8222-000000000002",
      sort_order: 2,
      prompt: "Điền từ phủ định: '我____是老师，我是学生。'",
      choices: ["不","也","很","没"],
    },
    {
      id: "20000001-0000-4000-8000-000000000003",
      quiz_id: "22222222-2222-4222-8222-000000000003",
      sort_order: 3,
      prompt: "Trước động từ '是', chữ '不' (thanh 4) biến âm thành thanh mấy?",
      choices: ["Thanh 1","Thanh 2 (đọc bú shì)","Thanh 3","Thanh nhẹ"],
    },
    {
      id: "20000001-0000-4000-8000-000000000004",
      quiz_id: "22222222-2222-4222-8222-000000000004",
      sort_order: 4,
      prompt: "Từ '学习' có nghĩa là gì?",
      choices: ["Làm việc","Đi chơi","Học tập","Nghỉ ngơi"],
    },
    {
      id: "20000001-0000-4000-8000-000000000005",
      quiz_id: "22222222-2222-4222-8222-000000000005",
      sort_order: 5,
      prompt: "Cách giới thiệu 'Tôi là người Việt Nam' chuẩn ngữ pháp:",
      choices: ["我越南人是。","我是人越南。","我叫越南。","我是越南人。"],
    },
    {
      id: "20000001-0000-4000-8000-000000000006",
      quiz_id: "22222222-2222-4222-8222-000000000006",
      sort_order: 6,
      prompt: "Từ '朋友' có nghĩa là:",
      choices: ["Bạn bè","Thầy giáo","Bác sĩ","Học sinh"],
    },
    {
      id: "20000001-0000-4000-8000-000000000007",
      quiz_id: "22222222-2222-4222-8222-000000000007",
      sort_order: 7,
      prompt: "Trong câu hỏi '你叫什么名字？', có cần thêm '吗' ở cuối không?",
      choices: ["Tùy ý","Không, vì đã có đại từ nghi vấn 什么","Chỉ dùng trong văn viết","Có, câu hỏi luôn phải có 吗"],
    },
    {
      id: "20000001-0000-4000-8000-000000000008",
      quiz_id: "22222222-2222-4222-8222-000000000008",
      sort_order: 8,
      prompt: "Đại từ '什么' phát âm Pinyin là:",
      choices: ["shénma","shénmi","shénmo","shénme"],
    },
  ],
  answerKeys: {
    "20000001-0000-4000-8000-000000000001": {
      question_id: "20000001-0000-4000-8000-000000000001",
      correct_index: 2,
      explanation_vi: "'你叫什么名字？' là câu hỏi tên tiêu chuẩn.",
    },
    "20000001-0000-4000-8000-000000000002": {
      question_id: "20000001-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "Phủ định trước 是 dùng '不' (不是).",
    },
    "20000001-0000-4000-8000-000000000003": {
      question_id: "20000001-0000-4000-8000-000000000003",
      correct_index: 1,
      explanation_vi: "Biến điệu chữ 不: đứng trước thanh 4 đọc thành thanh 2 (bú shì).",
    },
    "20000001-0000-4000-8000-000000000004": {
      question_id: "20000001-0000-4000-8000-000000000004",
      correct_index: 2,
      explanation_vi: "'学习' (xuéxí) nghĩa là học tập.",
    },
    "20000001-0000-4000-8000-000000000005": {
      question_id: "20000001-0000-4000-8000-000000000005",
      correct_index: 3,
      explanation_vi: "Cấu trúc quốc gia + 人: 越南人 (người Việt Nam).",
    },
    "20000001-0000-4000-8000-000000000006": {
      question_id: "20000001-0000-4000-8000-000000000006",
      correct_index: 0,
      explanation_vi: "'朋友' (péngyou) nghĩa là bạn bè.",
    },
    "20000001-0000-4000-8000-000000000007": {
      question_id: "20000001-0000-4000-8000-000000000007",
      correct_index: 1,
      explanation_vi: "Câu đã có đại từ nghi vấn (什么, 谁, 哪儿) thì không dùng thêm 吗.",
    },
    "20000001-0000-4000-8000-000000000008": {
      question_id: "20000001-0000-4000-8000-000000000008",
      correct_index: 3,
      explanation_vi: "'什么' có pinyin là shénme.",
    },
  },
};

// LESSON 03 QUIZ
export const LESSON_03_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-003",
  slug: "hsk1-lesson-03",
  quiz: {
    id: "33333333-3333-4333-8333-000000000003",
    lesson_id: "l-hsk1-003",
    revision: 1,
    title: "Mini Quiz Bài 3: Gia đình của tôi",
  },
  lessonTitle: "Bài 3: Gia đình của tôi (我的家 — Gia đình & Thành viên)",
  questions: [
    {
      id: "30000001-0000-4000-8000-000000000001",
      quiz_id: "33333333-3333-4333-8333-000000000003",
      sort_order: 1,
      prompt: "Trong cụm '我的家', chữ '的' giữ vai trò ngữ pháp gì?",
      choices: ["Trợ từ nối người sở hữu với danh từ","Chỉ thời gian","Chỉ câu hỏi","Động từ chính"],
    },
    {
      id: "30000001-0000-4000-8000-000000000002",
      quiz_id: "33333333-3333-4333-8333-000000000002",
      sort_order: 2,
      prompt: "Lượng từ phù hợp khi hỏi số thành viên gia đình: '你家有几____人？'",
      choices: ["口","只","个","本"],
    },
    {
      id: "30000001-0000-4000-8000-000000000003",
      quiz_id: "33333333-3333-4333-8333-000000000003",
      sort_order: 3,
      prompt: "Phân biệt số 2: Trước lượng từ 個/口, ta dùng:",
      choices: ["双 (shuāng)","二 (èr)","两 (liǎng)","对 (duì)"],
    },
    {
      id: "30000001-0000-4000-8000-000000000004",
      quiz_id: "33333333-3333-4333-8333-000000000004",
      sort_order: 4,
      prompt: "Từ nào có nghĩa là 'chị gái'?",
      choices: ["妈妈","姐姐","妹妹","哥哥"],
    },
    {
      id: "30000001-0000-4000-8000-000000000005",
      quiz_id: "33333333-3333-4333-8333-000000000005",
      sort_order: 5,
      prompt: "Phủ định của động từ '有' là:",
      choices: ["别有","没是","没有","不有"],
    },
    {
      id: "30000001-0000-4000-8000-000000000006",
      quiz_id: "33333333-3333-4333-8333-000000000006",
      sort_order: 6,
      prompt: "Liên từ '和' dùng để nối:",
      choices: ["Tính từ với động từ","Các danh từ hoặc cụm danh từ","Phó từ","Hai mệnh đề câu phức"],
    },
    {
      id: "30000001-0000-4000-8000-000000000007",
      quiz_id: "33333333-3333-4333-8333-000000000007",
      sort_order: 7,
      prompt: "Câu '我家有四口人：爸爸、妈妈、哥哥和我。' có bao nhiêu người?",
      choices: ["3 người","2 người","5 người","4 người"],
    },
    {
      id: "30000001-0000-4000-8000-000000000008",
      quiz_id: "33333333-3333-4333-8333-000000000008",
      sort_order: 8,
      prompt: "Từ '哥哥' phát âm chuẩn là:",
      choices: ["kēke","gége","gèigei","gēge"],
    },
  ],
  answerKeys: {
    "30000001-0000-4000-8000-000000000001": {
      question_id: "30000001-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "Trợ từ 的 biểu thị quan hệ sở hữu.",
    },
    "30000001-0000-4000-8000-000000000002": {
      question_id: "30000001-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "Lượng từ đếm số người trong gia đình là 口.",
    },
    "30000001-0000-4000-8000-000000000003": {
      question_id: "30000001-0000-4000-8000-000000000003",
      correct_index: 2,
      explanation_vi: "Trước lượng từ dùng 两 thay cho 二.",
    },
    "30000001-0000-4000-8000-000000000004": {
      question_id: "30000001-0000-4000-8000-000000000004",
      correct_index: 1,
      explanation_vi: "'姐姐' (jiějie) là chị gái.",
    },
    "30000001-0000-4000-8000-000000000005": {
      question_id: "30000001-0000-4000-8000-000000000005",
      correct_index: 2,
      explanation_vi: "Động từ 有 chỉ được phủ định bằng 没有.",
    },
    "30000001-0000-4000-8000-000000000006": {
      question_id: "30000001-0000-4000-8000-000000000006",
      correct_index: 1,
      explanation_vi: "'和' dùng nối từ/cụm từ đẳng lập (như 爸爸和妈妈).",
    },
    "30000001-0000-4000-8000-000000000007": {
      question_id: "30000001-0000-4000-8000-000000000007",
      correct_index: 3,
      explanation_vi: "'四口人' là 4 người.",
    },
    "30000001-0000-4000-8000-000000000008": {
      question_id: "30000001-0000-4000-8000-000000000008",
      correct_index: 3,
      explanation_vi: "'哥哥' có pinyin là gēge.",
    },
  },
};

// LESSON 04 QUIZ
export const LESSON_04_QUIZ: CurriculumQuizDefinition = {
  lessonId: "l-hsk1-004",
  slug: "hsk1-lesson-04",
  quiz: {
    id: "44444444-4444-4444-8444-000000000004",
    lesson_id: "l-hsk1-004",
    revision: 1,
    title: "Mini Quiz Bài 4: Ngày tháng & Thời gian",
  },
  lessonTitle: "Bài 4: Hôm nay thứ mấy? (今天星期几？ — Ngày tháng & Thời gian)",
  questions: [
    {
      id: "40000001-0000-4000-8000-000000000001",
      quiz_id: "44444444-4444-4444-8444-000000000004",
      sort_order: 1,
      prompt: "'星期一' tương ứng với ngày nào trong tuần?",
      choices: ["Thứ Hai","Thứ Bảy","Thứ Ba","Chủ nhật"],
    },
    {
      id: "40000001-0000-4000-8000-000000000002",
      quiz_id: "44444444-4444-4444-8444-000000000002",
      sort_order: 2,
      prompt: "Cách nói 'Chủ nhật' được dạy trong bài là:",
      choices: ["星期天 (hoặc 星期日)","星期八","星期九","星期七"],
    },
    {
      id: "40000001-0000-4000-8000-000000000003",
      quiz_id: "44444444-4444-4444-8444-000000000003",
      sort_order: 3,
      prompt: "Trật tự thời gian tiếng Trung tuân theo quy tắc nào?",
      choices: ["Giống tiếng Việt","Từ đơn vị lớn đến đơn vị nhỏ (Năm -> Tháng -> Ngày -> Giờ)","Tùy ý","Từ đơn vị nhỏ đến lớn"],
    },
    {
      id: "40000001-0000-4000-8000-000000000004",
      quiz_id: "44444444-4444-4444-8444-000000000004",
      sort_order: 4,
      prompt: "Từ '现在' có nghĩa là:",
      choices: ["Hôm qua","Ngày mai","Bây giờ / hiện tại","Hôm nay"],
    },
    {
      id: "40000001-0000-4000-8000-000000000005",
      quiz_id: "44444444-4444-4444-8444-000000000005",
      sort_order: 5,
      prompt: "Cách nói '2 giờ' đúng là:",
      choices: ["两小时点","二点","两点","二钟点"],
    },
    {
      id: "40000001-0000-4000-8000-000000000006",
      quiz_id: "44444444-4444-4444-8444-000000000006",
      sort_order: 6,
      prompt: "Trong khẩu ngữ, người ta thường dùng chữ nào cho 'ngày trong tháng'?",
      choices: ["天 (tiān)","期 (qī)","日 (rì)","号 (hào)"],
    },
    {
      id: "40000001-0000-4000-8000-000000000007",
      quiz_id: "44444444-4444-4444-8444-000000000007",
      sort_order: 7,
      prompt: "'昨天' có nghĩa là:",
      choices: ["Ngày kia","Ngày mai","Hôm nay","Hôm qua"],
    },
    {
      id: "40000001-0000-4000-8000-000000000008",
      quiz_id: "44444444-4444-4444-8444-000000000008",
      sort_order: 8,
      prompt: "Từ '半' trong '八点半' có nghĩa là gì?",
      choices: ["Kém 15 phút","Rưỡi (30 phút)","Đúng giờ","10 phút"],
    },
  ],
  answerKeys: {
    "40000001-0000-4000-8000-000000000001": {
      question_id: "40000001-0000-4000-8000-000000000001",
      correct_index: 0,
      explanation_vi: "'星期一' là thứ Hai.",
    },
    "40000001-0000-4000-8000-000000000002": {
      question_id: "40000001-0000-4000-8000-000000000002",
      correct_index: 0,
      explanation_vi: "Chủ nhật là 星期天 hoặc 星期日, không có 星期七.",
    },
    "40000001-0000-4000-8000-000000000003": {
      question_id: "40000001-0000-4000-8000-000000000003",
      correct_index: 1,
      explanation_vi: "Quy tắc thời gian tiếng Trung luôn đi từ lớn đến nhỏ.",
    },
    "40000001-0000-4000-8000-000000000004": {
      question_id: "40000001-0000-4000-8000-000000000004",
      correct_index: 2,
      explanation_vi: "'现在' (xiànzài) là bây giờ.",
    },
    "40000001-0000-4000-8000-000000000005": {
      question_id: "40000001-0000-4000-8000-000000000005",
      correct_index: 2,
      explanation_vi: "Nói 2 giờ dùng '两点' (liǎng diǎn).",
    },
    "40000001-0000-4000-8000-000000000006": {
      question_id: "40000001-0000-4000-8000-000000000006",
      correct_index: 3,
      explanation_vi: "Khẩu ngữ dùng '号', văn viết dùng '日'.",
    },
    "40000001-0000-4000-8000-000000000007": {
      question_id: "40000001-0000-4000-8000-000000000007",
      correct_index: 3,
      explanation_vi: "'昨天' (zuótiān) là hôm qua.",
    },
    "40000001-0000-4000-8000-000000000008": {
      question_id: "40000001-0000-4000-8000-000000000008",
      correct_index: 1,
      explanation_vi: "'半' biểu thị nửa giờ / 30 phút.",
    },
  },
};
