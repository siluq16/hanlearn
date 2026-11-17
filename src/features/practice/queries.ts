import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { requireLearner } from "@/features/auth/session";
import { getLearnerCurriculumSnapshot } from "@/features/courses/queries";
import type { PracticeSet, PracticeSkill } from "./types";

interface PracticeBankFile {
  course_id: string;
  version: string;
  total_sets: number;
  skills: PracticeSkill[];
  sets: PracticeSet[];
}

let cachedPracticeBank: PracticeBankFile | null = null;

function loadPracticeBank(): PracticeBankFile {
  if (cachedPracticeBank) return cachedPracticeBank;
  const filePath = path.join(process.cwd(), "content/hsk_library/practice_bank.json");
  if (!fs.existsSync(filePath)) {
    return {
      course_id: "course-hsk1",
      version: "1.0",
      total_sets: 0,
      skills: [],
      sets: [],
    };
  }
  cachedPracticeBank = JSON.parse(fs.readFileSync(filePath, "utf-8")) as PracticeBankFile;
  return cachedPracticeBank;
}

export const getAllPracticeSets = cache(async (): Promise<PracticeSet[]> => {
  const bank = loadPracticeBank();
  return bank.sets;
});

export const getPrebuiltPracticeSets = getAllPracticeSets;

export const getPracticeSetById = cache(
  async (setId: string): Promise<PracticeSet | undefined> => {
    const bank = loadPracticeBank();
    return bank.sets.find((s) => s.practice_set_id === setId);
  }
);

export const getLearnerPracticeHistory = cache(
  async (): Promise<Record<string, { bestScore: number; total: number; completedAt: string }>> => {
    try {
      const [{ user }, snapshot] = await Promise.all([
        requireLearner(),
        getLearnerCurriculumSnapshot(),
      ]);
      const result: Record<string, { bestScore: number; total: number; completedAt: string }> = {};

      // 1. Read from unified curriculum snapshot
      for (const row of snapshot.practiceHistory) {
        result[row.practice_set_id] = {
          bestScore: row.best_score,
          total: row.total_questions,
          completedAt: row.completed_at,
        };
      }

      // 2. Merge user_metadata fallback
      const meta = user.user_metadata || {};
      const metaHistory = (meta["practice_history"] as Record<
        string,
        { bestScore: number; total: number; completedAt: string }
      >) || {};

      for (const [k, v] of Object.entries(metaHistory)) {
        if (!result[k] || v.bestScore > result[k].bestScore) {
          result[k] = v;
        }
      }

      return result;
    } catch {
      return {};
    }
  }
);
