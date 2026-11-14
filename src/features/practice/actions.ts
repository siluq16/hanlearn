"use server";

import { revalidatePath } from "next/cache";
import { requireLearner } from "@/features/auth/session";

export async function savePracticeAttempt(
  setId: string,
  score: number,
  total: number
): Promise<{ ok: boolean }> {
  try {
    const { user, supabase } = await requireLearner();
    const meta = user.user_metadata || {};
    const history = (meta["practice_history"] as Record<
      string,
      { bestScore: number; total: number; completedAt: string }
    >) || {};

    const existing = history[setId];
    const bestScore = existing ? Math.max(existing.bestScore, score) : score;

    history[setId] = {
      bestScore,
      total,
      completedAt: new Date().toISOString(),
    };

    await supabase.auth.updateUser({
      data: {
        practice_history: history,
      },
    });

    revalidatePath("/practice");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
