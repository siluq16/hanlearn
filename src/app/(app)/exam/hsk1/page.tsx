import { Metadata } from "next";
import { getMockExamDefinition } from "@/features/exam/actions";
import { Hsk1MockExamView } from "@/features/exam/components/hsk1-mock-exam-view";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = {
  title: "Đề thi thử HSK 1 Chuẩn Quốc tế (40 câu)",
};

export default async function Hsk1MockExamPage() {
  const exam = await getMockExamDefinition();

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="HSK 1 Mock Examination"
        title="Đề thi thử HSK 1 Chuẩn Quốc tế CTI"
        description="Đề thi toàn diện 40 câu theo chuẩn Đề cương HSK 2025: 20 câu Nghe hiểu (100 điểm) + 20 câu Đọc hiểu (100 điểm). Thời gian làm bài 35 phút. Điểm đạt: từ 120/200 điểm."
      />

      <Hsk1MockExamView exam={exam} />
    </div>
  );
}
