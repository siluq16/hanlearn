import { requireLearner } from "@/features/auth/session";
import { getAllPracticeSets, getLearnerPracticeHistory } from "@/features/practice/queries";
import { PracticeCenter } from "@/features/practice/components/practice-center";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trung tâm Luyện tập Đa Kỹ năng" };

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string; unit?: string }>;
}) {
  await requireLearner();
  const { skill, unit } = await searchParams;
  const practiceSets = await getAllPracticeSets();
  const learnerHistory = await getLearnerPracticeHistory();

  return (
    <PracticeCenter
      initialSkill={skill}
      initialUnit={unit}
      practiceSets={practiceSets}
      learnerHistory={learnerHistory}
    />
  );
}
