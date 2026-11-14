import "server-only";
import { learningTarget } from "./learning-target";

export function learningEnabled(feature: "study" | "quiz" | "review") {
  return learningTarget(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    feature === "study"
      ? process.env.HANLEARN_LOCAL_STUDY_CONFIRMATION
      : feature === "quiz"
        ? process.env.HANLEARN_LOCAL_MINI_QUIZ
        : process.env.HANLEARN_LOCAL_SRS_REVIEW,
    process.env.HANLEARN_DEVELOPMENT_LEARNING,
    process.env.VERCEL_ENV === "production" ||
      process.env.CONTEXT === "production"
      ? "production"
      : undefined,
  );
}
