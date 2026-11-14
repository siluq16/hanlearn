import { createRoot } from "react-dom/client";
import "@/app/globals.css";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-sc/400.css";
import { SpeakingPlayer } from "@/features/speaking/components/speaking-player";
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
  ],
  sentences: [
    { hanzi: "你好！你好吗？", pinyin: "Nǐ hǎo! Nǐ hǎo ma?", translationVi: "Chào bạn! Bạn có khỏe không?", lessonId: "lesson-1" },
    { hanzi: "我是越南人。", pinyin: "Wǒ shì Yuènán rén.", translationVi: "Tôi là người Việt Nam.", lessonId: "lesson-2" },
  ],
};

function App() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <SpeakingPlayer curriculum={mockCurriculum} />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);