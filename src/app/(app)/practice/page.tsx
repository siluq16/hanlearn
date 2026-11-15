import { requireLearner } from "@/features/auth/session";
import { getAllPracticeSets, getLearnerPracticeHistory } from "@/features/practice/queries";
import { PracticeCenter } from "@/features/practice/components/practice-center";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trung tâm Luyện tập Đa Kỹ năng" };

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string; unit?: string; diff?: string; q?: string }>;
}) {
  await requireLearner();
  const [{ skill, unit, diff, q }, practiceSets, learnerHistory] = await Promise.all([
    searchParams,
    getAllPracticeSets(),
    getLearnerPracticeHistory(),
  ]);

  return (
    <PracticeCenter
      initialSkill={skill}
      initialUnit={unit}
      initialDiff={diff}
      initialQuery={q}
      practiceSets={practiceSets}
      learnerHistory={learnerHistory}
    />
  );
}
