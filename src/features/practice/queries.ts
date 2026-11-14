import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { requireLearner } from "@/features/auth/session";
import type { PracticeSet, PracticeSkill } from "./types";

interface PracticeBankFile {
  course_id: string;
  version: string;
  total_sets: number;
  skills: PracticeSkill[];
  sets: PracticeSet[];
}

function loadPracticeBank(): PracticeBankFile {
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
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as PracticeBankFile;
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
      const { user } = await requireLearner();
      const meta = user.user_metadata || {};
      const history = (meta["practice_history"] as Record<
        string,
        { bestScore: number; total: number; completedAt: string }
      >) || {};
      return history;
    } catch {
      return {};
    }
  }
);
