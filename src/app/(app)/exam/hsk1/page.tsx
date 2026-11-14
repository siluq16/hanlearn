import { Metadata } from "next";
import { getMockExamDefinition } from "@/features/exam/actions";
import { Hsk1MockExamView } from "@/features/exam/components/hsk1-mock-exam-view";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = {
  title: "HanLearn HSK 1 Mock Exam · Đề thi thử (40 câu)",
};

export default async function Hsk1MockExamPage() {
  const exam = await getMockExamDefinition();

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="HanLearn HSK 1 Mock Exam"
        title="Đề thi thử HSK 1 (Mô phỏng định dạng CTI)"
        description="Đề thi thử 40 câu mô phỏng theo cấu trúc đề thi chính thức: 20 câu Nghe hiểu (100 điểm) + 20 câu Đọc hiểu (100 điểm). Thời gian 35 phút. Ngưỡng đạt: từ 120/200 điểm. Phục vụ tự đánh giá và rèn luyện kỹ năng trên HanLearn."
      />

      <Hsk1MockExamView exam={exam} />
    </div>
  );
}
