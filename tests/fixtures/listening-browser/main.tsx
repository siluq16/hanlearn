import { createRoot } from "react-dom/client";
import "@/app/globals.css";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-sc/400.css";
import { ListeningPlayer } from "@/features/listening/components/listening-player";
import type { ListeningCurriculumData } from "@/features/listening/types";

const mockCurriculum: ListeningCurriculumData = {
  lessons: [
    { id: "lesson-1", title: "Bài 1: Chào hỏi", sortOrder: 1 },
    { id: "lesson-2", title: "Bài 2: Giới thiệu bản thân", sortOrder: 2 },
  ],
  vocabulary: [
    { id: "v1", simplified: "你好", pinyin: "nǐ hǎo", meaningVi: "xin chào", lessonId: "lesson-1" },
    { id: "v2", simplified: "谢谢", pinyin: "xièxie", meaningVi: "cảm ơn", lessonId: "lesson-1" },
    { id: "v3", simplified: "再见", pinyin: "zàijiàn", meaningVi: "tạm biệt", lessonId: "lesson-1" },
    { id: "v4", simplified: "学生", pinyin: "xuésheng", meaningVi: "học sinh", lessonId: "lesson-2" },
    { id: "v5", simplified: "老师", pinyin: "lǎoshī", meaningVi: "giáo viên", lessonId: "lesson-2" },
    { id: "v6", simplified: "朋友", pinyin: "péngyou", meaningVi: "bạn bè", lessonId: "lesson-2" },
    { id: "v7", simplified: "中国", pinyin: "Zhōngguó", meaningVi: "Trung Quốc", lessonId: "lesson-2" },
    { id: "v8", simplified: "越南", pinyin: "Yuènán", meaningVi: "Việt Nam", lessonId: "lesson-2" },
  ],
  sentences: [
    { hanzi: "你好！你好吗？", pinyin: "Nǐ hǎo! Nǐ hǎo ma?", translationVi: "Chào bạn! Bạn có khỏe không?", lessonId: "lesson-1" },
    { hanzi: "我很好，谢谢你！", pinyin: "Wǒ hěn hǎo, xièxie nǐ!", translationVi: "Tôi rất khỏe, cảm ơn bạn!", lessonId: "lesson-1" },
    { hanzi: "我是越南人。", pinyin: "Wǒ shì Yuènán rén.", translationVi: "Tôi là người Việt Nam.", lessonId: "lesson-2" },
    { hanzi: "他不是老师，他是学生。", pinyin: "Tā bù shì lǎoshī, tā shì xuésheng.", translationVi: "Thầy ấy không phải giáo viên, thầy ấy là học sinh.", lessonId: "lesson-2" },
  ],
};

function App() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <ListeningPlayer curriculum={mockCurriculum} />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
