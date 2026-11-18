import { requireLearner } from "@/features/auth/session";
import { PageHeading } from "@/components/page-heading";
import { getOfficial300VocabItems } from "@/features/vocabulary/hsk1-library-vocab";
import { getWordUnit } from "@/features/vocabulary/unit-mapping";
import {
  getLearnerCurriculumProgress,
  getLearnerCurriculumSnapshot,
} from "@/features/courses/queries";
import {
  VocabularyView,
  type VocabularyViewItem,
} from "@/features/vocabulary/components/vocabulary-view";
import pilotVocab from "../../../../content/pilot-hsk1/v1/vocabulary.json";

const PILOT_ID_TO_SIMPLIFIED = new Map<string, string>(
  (pilotVocab as Array<{ id: string; simplified: string }>).map((w) => [
    w.id,
    w.simplified,
  ]),
);

export const dynamic = "force-dynamic";
export const metadata = { title: "Từ vựng HSK 1" };

export default async function VocabularyPage() {
  await requireLearner();

  const [prog, snapshot] = await Promise.all([
    getLearnerCurriculumProgress(),
    getLearnerCurriculumSnapshot(),
  ]);

  const vocabProgressMap = new Map<
    string,
    "not_introduced" | "introduced" | "learning" | "mastered"
  >();
  for (const row of snapshot.vocabularyProgress) {
    if (row.vocabulary_id && row.mastery_state) {
      const state = row.mastery_state as
        | "not_introduced"
        | "introduced"
        | "learning"
        | "mastered";
      vocabProgressMap.set(row.vocabulary_id, state);
      const pilotSimplified = PILOT_ID_TO_SIMPLIFIED.get(row.vocabulary_id);
      if (pilotSimplified) {
        vocabProgressMap.set(pilotSimplified, state);
      }
    }
  }

  const all300 = getOfficial300VocabItems();
  const items: VocabularyViewItem[] = all300.map((v) => {
    const unitNum = getWordUnit(v.simplified);
    const mastery =
      vocabProgressMap.get(v.id) ||
      vocabProgressMap.get(v.simplified) ||
      "not_introduced";
    return {
      id: v.id,
      simplified: v.simplified,
      traditional: v.traditional,
      pinyin_marked: v.pinyin_marked,
      meaning_vi: v.meaning_vi,
      unitNumber: unitNum,
      mastery,
    };
  });

  const dueCount = snapshot.dueCount;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <PageHeading
        eyebrow="Kho tàng 300 từ vựng cốt lõi"
        title="Từ vựng HSK 1"
        description="Tra cứu chữ Hán, Pinyin, nghe phát âm và tự kiểm tra trí nhớ theo từng Unit từ 1 đến 6."
      />

      <VocabularyView
        items={items}
        stats={{
          totalWords: 300,
          learnedCount: prog.vocabularyLearnedCount,
          dueCount,
        }}
      />
    </div>
  );
}
