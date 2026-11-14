import { notFound } from "next/navigation";
import { requireLearner } from "@/features/auth/session";
import { getPracticeSetById } from "@/features/practice/queries";
import { PracticePlayer } from "@/features/practice/components/practice-player";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const set = await getPracticeSetById(setId);
  return {
    title: set ? `${set.title} · Luyện tập` : "Luyện tập",
  };
}

export default async function PracticeSetPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  await requireLearner();
  const { setId } = await params;
  const practiceSet = await getPracticeSetById(setId);

  if (!practiceSet) {
    notFound();
  }

  return <PracticePlayer practiceSet={practiceSet} />;
}
