import { z } from "zod";
import type { LessonBundle } from "./types";
export const studyInputSchema = z.object({ lessonId: z.uuid() }).strict();
export type StudyProgress = LessonBundle["progress"];
export type StudyResult =
  | { ok: true; progress: StudyProgress }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        retryable: boolean;
        outcomeUnknown: boolean;
      };
    };

// Server authorization repeats this check. An opt-in can never authorize a Cloud host.
export function localStudyTarget(
  url: string | undefined,
  enabled: string | undefined,
) {
  if (enabled !== "1" || !url) return false;
  try {
    const target = new URL(url);
    return (
      target.protocol === "https:" &&
      ["127.0.0.1", "[::1]"].includes(target.hostname) &&
      !target.username &&
      !target.password &&
      !target.search &&
      !target.hash &&
      target.pathname === "/"
    );
  } catch {
    return false;
  }
}
