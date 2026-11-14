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
 * Load static pilot curriculum for offline/test environments only
 */
function loadStaticCurriculum(): ListeningCurriculumData {
  try {
    const vocabPath = path.join(process.cwd(), "content/pilot-hsk1/v1/vocabulary.json");
    const rawVocab = JSON.parse(fs.readFileSync(vocabPath, "utf8")) as Array<{
      id: string;
      simplified: string;
      pinyin_marked: string;
      meaning_vi: string;
      example_zh?: string | null;
      example_pinyin?: string | null;
      example_vi?: string | null;
    }>;

    const lessons: ListeningLessonItem[] = [];
    const lessonFiles = ["lesson-01.json", "lesson-02.json", "lesson-03.json", "lesson-04.json"];
    const vocabLessonMap = new Map<string, string>();
    const sentenceMap = new Map<string, ListeningSentenceItem>();

    for (let i = 0; i < lessonFiles.length; i++) {
      const lessonPath = path.join(process.cwd(), "content/pilot-hsk1/v1/lessons", lessonFiles[i]);
      if (fs.existsSync(lessonPath)) {
        const rawLesson = JSON.parse(fs.readFileSync(lessonPath, "utf8"));
        lessons.push({
          id: rawLesson.id,
          title: rawLesson.title,
          sortOrder: rawLesson.sort_order ?? i + 1,
        });

        if (rawLesson.content?.sections) {
          for (const sec of rawLesson.content.sections) {
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
    }

    const vocabulary: ListeningVocabularyItem[] = rawVocab.map((v) => {
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
