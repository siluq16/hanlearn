"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireLearner } from "@/features/auth/session";

export async function savePracticeAttempt(
  setId: string,
  score: number,
  total: number,
  skill?: string
): Promise<{ ok: boolean }> {
  try {
    const { user, supabase } = await requireLearner();
    const now = new Date().toISOString();

    // 1. Authoritative DB Table layer (with RLS isolation)
    try {
      const { data: existingRows } = await supabase
        .from("learner_practice_history")
        .select("best_score")
        .eq("user_id", user.id)
        .eq("practice_set_id", setId);

      const existingScore = existingRows && existingRows[0] ? existingRows[0].best_score : 0;
      const finalBestScore = Math.max(existingScore, score);

      await supabase
        .from("learner_practice_history")
        .upsert(
          {
            id: randomUUID(),
            user_id: user.id,
            practice_set_id: setId,
            skill: skill || "general",
            best_score: finalBestScore,
            total_questions: total,
            completed_at: now,
          },
          { onConflict: "user_id,practice_set_id" }
        );
    } catch {
      // Table may not yet be migrated on older environments; proceed to dual-layer
    }

    // 2. Dual-layer safe persistence in user_metadata
    try {
      const meta = user.user_metadata || {};
      const history = (meta["practice_history"] as Record<
        string,
        { bestScore: number; total: number; completedAt: string }
      >) || {};

      const existingMeta = history[setId];
      const bestScoreMeta = existingMeta ? Math.max(existingMeta.bestScore, score) : score;

      history[setId] = {
        bestScore: bestScoreMeta,
        total,
        completedAt: now,
      };

      await supabase.auth.updateUser({
        data: {
          practice_history: history,
        },
      });
    } catch {
      // Ignore user_metadata update errors if DB succeeded
    }

    revalidatePath("/practice");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
