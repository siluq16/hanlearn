import { getReviewView } from "@/features/review/queries";
import { submitReview, refreshReview } from "@/features/review/actions";
import { ReviewPlayer } from "@/features/review/components/review-player";
import { learningEnabled } from "@/lib/learning";
export const dynamic = "force-dynamic";
export const metadata = { title: "Ôn tập" };
export default async function ReviewPage() {
  const view = await getReviewView();
  return (
    <ReviewPlayer
      key={view.scope}
      initial={view}
      enabled={learningEnabled("review")}
      submit={submitReview}
      refresh={refreshReview}
    />
  );
}
