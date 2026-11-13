import type { ReaderContent } from "../../src/features/lessons/components/reader-types";
export type PreviewDataset = {
  packageId: string;
  revision: number;
  manifestHash: string;
  snapshotHash: string;
  vocabularyCount: number;
  grammarCount: number;
  lessons: (ReaderContent & {
    id: string;
    title: string;
    objectiveVi: string;
    estimatedMinutes: number;
    newWordCount: number;
  })[];
};
