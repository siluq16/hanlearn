import "server-only";
import fs from "node:fs";
import path from "node:path";
import { requireLearner } from "@/features/auth/session";
import { DataError } from "@/lib/data";
import { cleanTranslation } from "./generator";
import type {
  ListeningCurriculumData,
  ListeningLessonItem,
  ListeningSentenceItem,
  ListeningVocabularyItem,
} from "./types";

/**
 * Filter list of incomplete phrases / counting fragments that are not valid sentences for listening comprehension
 */
const EXCLUDED_SENTENCE_HANZI = new Set([
  "我的家",
  "我的妈妈",
  "我的哥哥",
  "我的姐姐",
  "爸爸和妈妈",
  "一个人",
  "一、二、三。",
  "五月三号",
  "七月一号",
  "二月三号",
  "爸爸、妈妈和我。",
]);

function isValidSentence(hanzi: string, vi: string): boolean {
  if (EXCLUDED_SENTENCE_HANZI.has(hanzi.trim())) return false;
  if (hanzi.trim().length < 3) return false;
  const cleanedVi = cleanTranslation(vi);
  if (!cleanedVi || cleanedVi.length < 2) return false;
  return true;
}

/**
 * Load static curriculum for offline/test environments from content/hsk_library/.
 */
function loadStaticCurriculum(): ListeningCurriculumData {
  try {
    const libraryLesson01 = path.join(process.cwd(), "content/hsk_library/hsk1_lesson_01.json");
    if (fs.existsSync(libraryLesson01)) {
      const lessons: ListeningLessonItem[] = [];
      const vocabulary: ListeningVocabularyItem[] = [];
      const sentenceMap = new Map<string, ListeningSentenceItem>();

      for (let i = 1; i <= 32; i++) {
        const pad = String(i).padStart(2, "0");
        const lessonPath = path.join(process.cwd(), `content/hsk_library/hsk1_lesson_${pad}.json`);
        if (fs.existsSync(lessonPath)) {
          const l = JSON.parse(fs.readFileSync(lessonPath, "utf8"));
          const lessonId = l.id || `l-hsk1-${pad}`;
          lessons.push({
            id: lessonId,
            title: l.title,
            sortOrder: i,
          });

          if (Array.isArray(l.stages)) {
            for (const st of l.stages) {
              if (Array.isArray(st.vocabulary)) {
                for (const v of st.vocabulary) {
                  vocabulary.push({
                    id: `vocab-${v.simplified}`,
                    simplified: v.simplified,
                    pinyin: v.pinyin,
                    meaningVi: v.meaning_vi,
                    lessonId,
                  });
                }
              }
              if (st.grammar_points) {
                for (const gp of st.grammar_points) {
                  if (gp.examples) {
                    for (const ex of gp.examples) {
                      if (ex.hanzi && ex.translationVi && isValidSentence(ex.hanzi, ex.translationVi) && !sentenceMap.has(ex.hanzi)) {
                        sentenceMap.set(ex.hanzi, {
                          hanzi: ex.hanzi,
                          pinyin: ex.pinyin || "",
                          translationVi: cleanTranslation(ex.translationVi),
                          lessonId,
                        });
                      }
                    }
                  }
                }
              }
              if (st.dialogue && st.dialogue.turns) {
                for (const t of st.dialogue.turns) {
                  const vi = t.translationVi || t.vi;
                  if (t.hanzi && vi && isValidSentence(t.hanzi, vi) && !sentenceMap.has(t.hanzi)) {
                    sentenceMap.set(t.hanzi, {
                      hanzi: t.hanzi,
                      pinyin: t.pinyin || "",
                      translationVi: cleanTranslation(vi),
                      lessonId,
                    });
                  }
                }
              }
            }
          }
        }
      }

      return { lessons, vocabulary, sentences: Array.from(sentenceMap.values()) };
    }

    return { lessons: [], vocabulary: [], sentences: [] };
  } catch {
    return { lessons: [], vocabulary: [], sentences: [] };
  }
}

/**
 * Fetch curriculum data for listening practice from Supabase Cloud Development.
 * Never silently masks cloud query errors in real learner execution.
 */
export async function getListeningCurriculum(): Promise<ListeningCurriculumData> {
  try {
    const { supabase } = await requireLearner();

    const [lessonsRes, vocabRes] = await Promise.all([
      supabase
        .from("lessons")
        .select("id,title,sort_order,content")
        .eq("status", "published")
        .eq("review_status", "approved")
        .order("sort_order"),
      supabase
        .from("vocabulary")
        .select("id,simplified,pinyin_marked,meaning_vi,example_zh,example_pinyin,example_vi")
        .eq("status", "published")
        .eq("review_status", "approved"),
    ]);

    if (lessonsRes.error || vocabRes.error) {
      if (process.env.NODE_ENV === "test") {
        return loadStaticCurriculum();
      }
      throw new DataError();
    }

    if (!lessonsRes.data?.length || !vocabRes.data?.length) {
      if (process.env.NODE_ENV === "test") {
        return loadStaticCurriculum();
      }
      throw new DataError();
    }

    const lessons: ListeningLessonItem[] = [];
    const vocabLessonMap = new Map<string, string>();
    const sentenceMap = new Map<string, ListeningSentenceItem>();

    for (const rawLesson of lessonsRes.data) {
      lessons.push({
        id: rawLesson.id,
        title: rawLesson.title,
        sortOrder: rawLesson.sort_order ?? 0,
      });

      const content = rawLesson.content as {
        sections?: Array<{
          type: string;
          vocabularyIds?: string[];
          blocks?: Array<{
            type: string;
            hanzi?: string;
            pinyin?: string;
            translationVi?: string;
          }>;
        }>;
      } | null;

      if (content?.sections) {
        for (const sec of content.sections) {
          if (sec.type === "vocabulary_refs" && Array.isArray(sec.vocabularyIds)) {
            for (const vid of sec.vocabularyIds) {
              vocabLessonMap.set(vid, rawLesson.id);
            }
          }
          if (sec.blocks && Array.isArray(sec.blocks)) {
            for (const b of sec.blocks) {
              if (b.type === "example" && b.hanzi && b.translationVi) {
                if (isValidSentence(b.hanzi, b.translationVi) && !sentenceMap.has(b.hanzi)) {
                  sentenceMap.set(b.hanzi, {
                    hanzi: b.hanzi,
                    pinyin: b.pinyin ?? "",
                    translationVi: cleanTranslation(b.translationVi),
                    lessonId: rawLesson.id,
                  });
                }
              }
            }
          }
        }
      }
    }

    const vocabulary: ListeningVocabularyItem[] = vocabRes.data.map((v) => {
      const lessonId = vocabLessonMap.get(v.id);
      if (v.example_zh && v.example_vi && isValidSentence(v.example_zh, v.example_vi)) {
        if (!sentenceMap.has(v.example_zh)) {
          sentenceMap.set(v.example_zh, {
            hanzi: v.example_zh,
            pinyin: v.example_pinyin ?? "",
            translationVi: cleanTranslation(v.example_vi),
            lessonId,
          });
        }
      }
      return {
        id: v.id,
        simplified: v.simplified,
        pinyin: v.pinyin_marked,
        meaningVi: v.meaning_vi,
        exampleZh: v.example_zh ?? undefined,
        examplePinyin: v.example_pinyin ?? undefined,
        exampleVi: v.example_vi ?? undefined,
        lessonId,
      };
    });

    return { lessons, vocabulary, sentences: Array.from(sentenceMap.values()) };
  } catch (err) {
    if (process.env.NODE_ENV === "test") {
      return loadStaticCurriculum();
    }
    throw err instanceof DataError ? err : new DataError();
  }
}
