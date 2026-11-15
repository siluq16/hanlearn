import { requireLearner } from "@/features/auth/session";
import { PageHeading } from "@/components/page-heading";
import { getOfficial300VocabItems } from "@/features/vocabulary/hsk1-library-vocab";
import { getWordUnit } from "@/features/vocabulary/unit-mapping";
import { getLearnerCurriculumProgress } from "@/features/courses/queries";
import { getReviewView } from "@/features/review/queries";
import {
  VocabularyView,
  type VocabularyViewItem,
} from "@/features/vocabulary/components/vocabulary-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Từ vựng HSK 1" };

export default async function VocabularyPage() {
  const { user, supabase } = await requireLearner();

  const [prog, vocabProgRes, reviewView] = await Promise.all([
    getLearnerCurriculumProgress(),
    supabase
      .from("vocabulary_progress")
      .select("vocabulary_id, mastery_state")
      .eq("user_id", user.id),
    getReviewView().catch(() => null),
  ]);

  const vocabProgressMap = new Map<string, "not_introduced" | "introduced" | "learning" | "mastered">();
  if (vocabProgRes.data) {
    for (const row of vocabProgRes.data) {
      if (row.vocabulary_id && row.mastery_state) {
        vocabProgressMap.set(row.vocabulary_id, row.mastery_state as "not_introduced" | "introduced" | "learning" | "mastered");
      }
    }
  }

  const all300 = getOfficial300VocabItems();
  const items: VocabularyViewItem[] = all300.map((v) => {
    const unitNum = getWordUnit(v.simplified);
    const mastery = vocabProgressMap.get(v.id) || "not_introduced";
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

  const dueCount = reviewView?.dueCount || 0;

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
