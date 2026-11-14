import { notFound } from "next/navigation";
import { requireLearner } from "@/features/auth/session";
import { getUnitTestDefinition } from "@/features/exam/unit-test-actions";
import { UnitTestView } from "@/features/exam/components/unit-test-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  return {
    title: `Unit Test ${unitId} · Kiểm tra Đánh giá Năng lực`,
  };
}

export default async function UnitTestPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  await requireLearner();
  const { unitId } = await params;
  const num = parseInt(unitId, 10);

  if (isNaN(num) || num < 1 || num > 6) {
    notFound();
  }

  let unitTest;
  try {
    unitTest = await getUnitTestDefinition(num);
  } catch {
    notFound();
  }

  return <UnitTestView unitTest={unitTest} />;
}
