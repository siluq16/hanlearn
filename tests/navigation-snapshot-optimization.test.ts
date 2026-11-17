import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";

vi.mock("@/features/auth/session", () => ({
  requireLearner: vi.fn(),
}));

import { requireLearner } from "@/features/auth/session";
import {
  getLearnerCurriculumSnapshot,
  getLearnerCurriculumProgress,
  invalidateLearnerSnapshot,
} from "@/features/courses/queries";

describe("Single-Roundtrip Snapshot RPC & Navigation Prewarming Optimization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateLearnerSnapshot();
  });

  it("enforces strict SECURITY INVOKER and RLS isolation in migration 202611160010", () => {
    const sql = fs.readFileSync(
      "supabase/migrations/202611160010_learner_snapshot_rpc.sql",
      "utf-8"
    );
    expect(sql).toContain("create or replace function public.get_learner_curriculum_snapshot()");
    expect(sql).toContain("create or replace function public.get_learner_dashboard_snapshot()");
    expect(sql).toContain("security invoker");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("where s.user_id = (select auth.uid())");
    expect(sql).toContain("where vp.user_id = (select auth.uid())");
    expect(sql).toContain("where ph.user_id = (select auth.uid())");
    expect(sql).toContain(
      "revoke all on function public.get_learner_curriculum_snapshot() from public, anon, authenticated;"
    );
    expect(sql).toContain(
      "grant execute on function public.get_learner_curriculum_snapshot() to authenticated;"
    );
  });

  it("executes a single database RPC roundtrip without calling .from() when RPC succeeds", async () => {
    const fromMock = vi.fn();
    const rpcMock = vi.fn().mockResolvedValue({
      data: {
        stage_progress: [
          {
            lesson_id: "hsk1-lesson-01",
            current_stage: 9,
            completed_stages: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          },
        ],
        quiz_attempts: [
          {
            lesson_id: "hsk1-unit-test-01",
            quiz_id: "hsk1-unit-test-01",
            correct_count: 18,
            question_count: 20,
            passed: true,
            submitted_at: "2026-11-16T00:00:00Z",
          },
        ],
        vocabulary_progress: [
          { vocabulary_id: "v-1", mastery_state: "learning" },
          { vocabulary_id: "v-2", mastery_state: "mastered" },
        ],
        practice_history: [
          {
            practice_set_id: "pset-1",
            best_score: 9,
            total_questions: 10,
            completed_at: "2026-11-16T00:00:00Z",
          },
        ],
        due_count: 7,
      },
      error: null,
    });

    vi.mocked(requireLearner).mockResolvedValue({
      user: { id: "user-fast-1", user_metadata: {} },
      supabase: {
        rpc: rpcMock,
        from: fromMock,
      },
    } as unknown as Awaited<ReturnType<typeof requireLearner>>);

    const snapshot = await getLearnerCurriculumSnapshot();
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith("get_learner_curriculum_snapshot");
    expect(fromMock).not.toHaveBeenCalled();
    expect(snapshot.dueCount).toBe(7);
    expect(snapshot.stageProgress).toHaveLength(1);
    expect(snapshot.practiceHistory).toHaveLength(1);

    const progress = await getLearnerCurriculumProgress();
    expect(progress.completedLessonsCount).toBe(1);
    expect(progress.passedUnitTestsCount).toBe(1);
  });

  it("includes Pointer Intent Prefetch and Idle Prewarming in AppShell", () => {
    const shellCode = fs.readFileSync("src/components/app-shell.tsx", "utf-8");
    expect(shellCode).toContain("handleIntentPrefetch");
    expect(shellCode).toContain("onMouseEnter={() => handleIntentPrefetch(href)}");
    expect(shellCode).toContain("onTouchStart={() => handleIntentPrefetch(href)}");
    expect(shellCode).toContain("requestIdleCallback");
    expect(shellCode).toContain("PREWARM_PRIORITY_ROUTES");
  });
});
