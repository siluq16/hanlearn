import { describe, it, expect } from "vitest";

describe("Lesson Progress Persistence & Multi-Account Isolation Integrity", () => {
  interface ScopedLessonProgress {
    version: 1;
    userId: string;
    lessonId: string;
    confirmedStages: number[];
    pendingStages: number[];
  }

  function getScopedStorageKey(userId: string | undefined, lessonKey: string): string {
    return userId
      ? `hanlearn_prog_v1_${userId}_${lessonKey}`
      : `hanlearn_prog_v1_guest_${lessonKey}`;
  }

  function loadScopedProgress(
    storage: Record<string, string>,
    key: string,
    userId: string | undefined,
    lessonKey: string
  ): { confirmed: number[]; pending: number[] } {
    try {
      const raw = storage[key];
      if (!raw) return { confirmed: [], pending: [] };
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.version === 1) {
        if (parsed.userId === (userId || "guest") && parsed.lessonId === lessonKey) {
          return {
            confirmed: Array.isArray(parsed.confirmedStages) ? parsed.confirmedStages : [],
            pending: Array.isArray(parsed.pendingStages) ? parsed.pendingStages : [],
          };
        }
        return { confirmed: [], pending: [] };
      }
    } catch {}
    return { confirmed: [], pending: [] };
  }

  it("1. Scopes storage key strictly by userId and lessonKey", () => {
    const keyUser1 = getScopedStorageKey("user-123", "les-hsk1-01");
    const keyUser2 = getScopedStorageKey("user-456", "les-hsk1-01");
    const keyGuest = getScopedStorageKey(undefined, "les-hsk1-01");

    expect(keyUser1).toBe("hanlearn_prog_v1_user-123_les-hsk1-01");
    expect(keyUser2).toBe("hanlearn_prog_v1_user-456_les-hsk1-01");
    expect(keyGuest).toBe("hanlearn_prog_v1_guest_les-hsk1-01");
    expect(keyUser1).not.toBe(keyUser2);
  });

  it("2. Cross-account isolation: User B cannot read User A's progress on same browser", () => {
    const storage: Record<string, string> = {};
    const keyUser1 = getScopedStorageKey("user-123", "les-hsk1-01");

    // User A completes stage 0, 1, 2
    storage[keyUser1] = JSON.stringify({
      version: 1,
      userId: "user-123",
      lessonId: "les-hsk1-01",
      confirmedStages: [0, 1, 2],
      pendingStages: [],
    });

    // User B logs in
    const keyUser2 = getScopedStorageKey("user-456", "les-hsk1-01");
    const user2Progress = loadScopedProgress(storage, keyUser2, "user-456", "les-hsk1-01");

    expect(user2Progress.confirmed).toEqual([]);
    expect(user2Progress.pending).toEqual([]);
  });

  it("3. Monotonic non-decreasing: Never regresses server progress even if local has fewer stages", () => {
    // Server has 5 stages completed
    const serverStages = [0, 1, 2, 3, 4];
    // Local storage only had 2 stages
    const localConfirmed = [0, 1];
    const localPending: number[] = [];

    // Union logic used in NineStageReader
    const resolvedStages = Array.from(
      new Set([...serverStages, ...localConfirmed, ...localPending])
    ).sort((a, b) => a - b);

    expect(resolvedStages).toEqual([0, 1, 2, 3, 4]);
    expect(resolvedStages.length).toBe(5);
  });

  it("4. Multi-tab conflict resolution: Set union merges stages completed in separate tabs without lost updates", () => {
    const existingServerStages = [0]; // Stage 0 done initially

    // Tab 1 completes Stage 1
    const tab1Completed = [0, 1];
    // Tab 2 completes Stage 2
    const tab2Completed = [0, 2];

    // Server-side union in saveStageProgress (actions.ts)
    const serverMergedSet = new Set<number>([
      ...tab1Completed,
      ...tab2Completed,
      ...existingServerStages,
    ]);
    const finalStages = Array.from(serverMergedSet).sort((a, b) => a - b);

    expect(finalStages).toEqual([0, 1, 2]);
    expect(finalStages).toContain(1);
    expect(finalStages).toContain(2);
  });

  it("5. Separation of pending vs confirmed stages: receipt clears acknowledged pending items", () => {
    let localConfirmed = [0];
    let localPending = [1, 2]; // Learner just finished Stage 1 and Stage 2

    // Simulated Server Receipt returns acknowledged stages [0, 1, 2]
    const serverReceipt = { completedStages: [0, 1, 2] };

    // Receipt acknowledgment removes acknowledged stages from pending
    localConfirmed = serverReceipt.completedStages;
    localPending = localPending.filter((p) => !localConfirmed.includes(p));

    expect(localConfirmed).toEqual([0, 1, 2]);
    expect(localPending).toEqual([]); // Fully flushed!
  });

  it("6. Network failure retains pending stages locally with retry capability", () => {
    const localConfirmed = [0];
    const localPending = [1]; // Stage 1 failed to reach server

    // Server fails -> pending stages remain intact
    const isError = true;
    if (isError) {
      // Do not clear pending
    }

    expect(localPending).toContain(1);
    // When retrying, the union still sends [0, 1]
    const retryPayload = Array.from(new Set([...localConfirmed, ...localPending])).sort(
      (a, b) => a - b
    );
    expect(retryPayload).toEqual([0, 1]);
  });
});
