import "server-only";
import { requireLearner } from "@/features/auth/session";
import { getActiveSyllabus } from "@/features/settings/queries";
import { dataOrThrow, DataError, readAll } from "@/lib/data";
import { vocabularySearchResultSchema } from "./schemas";
import { getOfficial300VocabItems } from "./hsk1-library-vocab";
export async function searchVocabulary(filters: {
  q: string;
  level?: number | "";
  page: number;
}) {
  const { user, supabase } = await requireLearner();
  const syllabus = await getActiveSyllabus();
  if (!syllabus) return { items: [], total: 0, syllabus: null };
  const result = await supabase.rpc("search_vocabulary", {
    p_syllabus_id: syllabus.id,
    p_query: filters.q.normalize("NFKC"),
    p_level: typeof filters.level === "number" ? filters.level : null,
    p_offset: (filters.page - 1) * 20,
    p_limit: 20,
  });
  const parsed = vocabularySearchResultSchema.safeParse(dataOrThrow(result));
  if (!parsed.success) throw new DataError();

  // If database only has pilot items (<= 44 items) and searching HSK 1, use official 300 words library
  if (parsed.data.total <= 44 && (filters.level === 1 || filters.level === "" || filters.level === undefined)) {
    const all300 = getOfficial300VocabItems();
    const query = filters.q.toLowerCase().trim();
    const filtered = all300.filter((w) => {
      if (!query) return true;
      return (
        w.simplified.includes(query) ||
        w.pinyin_marked.toLowerCase().includes(query) ||
        w.meaning_vi.toLowerCase().includes(query)
      );
    });
    const pageSize = 20;
    const offset = (filters.page - 1) * pageSize;
    const pageItems = filtered.slice(offset, offset + pageSize);
    return {
      total: filtered.length,
      items: pageItems.map((v) => ({
        ...v,
        mastery: "not_introduced" as const,
      })),
      syllabus,
    };
  }
  const progress = parsed.data.items.length
    ? dataOrThrow(
        await supabase
          .from("vocabulary_progress")
          .select("vocabulary_id,mastery_state")
          .eq("user_id", user.id)
          .in(
            "vocabulary_id",
            parsed.data.items.map((v) => v.id),
          ),
      )
    : [];
  return {
    ...parsed.data,
    items: parsed.data.items.map((v) => ({
      ...v,
      mastery:
        progress.find((p) => p.vocabulary_id === v.id)?.mastery_state ??
        "not_introduced",
    })),
    syllabus,
  };
}
export async function getVocabulary(id: string) {
  const { user, supabase } = await requireLearner();
  const [wordResult, members, syllabuses, masteryResult] = await Promise.all([
    supabase
      .from("vocabulary")
      .select(
        "id,simplified,traditional,pinyin_marked,pinyin_numeric,meaning_vi,part_of_speech,example_zh,example_pinyin,example_vi,audio_asset_id,status,source_uri,content_license",
      )
      .eq("id", id)
      .maybeSingle(),
    readAll((f, t) =>
      supabase
        .from("syllabus_vocabulary")
        .select("syllabus_id,vocabulary_id,introduced_level")
        .eq("vocabulary_id", id)
        .order("syllabus_id")
        .range(f, t),
    ),
    readAll((f, t) =>
      supabase
        .from("syllabus_versions")
        .select("id,code,display_name,is_active,status")
        .order("id")
        .range(f, t),
    ),
    supabase
      .from("vocabulary_progress")
      .select("mastery_state")
      .eq("user_id", user.id)
      .eq("vocabulary_id", id)
      .maybeSingle(),
  ]);
  if (wordResult.error || masteryResult.error) throw new DataError();
  if (!wordResult.data) {
    const fallback = getOfficial300VocabItems().find((w) => w.id === id || w.simplified === id);
    if (!fallback) return null;
    return {
      word: {
        id: fallback.id,
        simplified: fallback.simplified,
        traditional: null,
        pinyin_marked: fallback.pinyin_marked,
        pinyin_numeric: null,
        meaning_vi: fallback.meaning_vi,
        part_of_speech: "Từ vựng HSK 1",
        example_zh: fallback.example_zh || null,
        example_pinyin: fallback.example_pinyin || null,
        example_vi: fallback.example_vi || null,
        audio_asset_id: null,
        status: "published",
        source_uri: "urn:hanlearn:curriculum:hsk1",
        content_license: "CC-BY-NC-4.0",
      },
      members: [
        {
          syllabus_id: "00000000-0000-0000-0000-000000000001",
          vocabulary_id: fallback.id,
          introduced_level: 1,
          syllabus: { id: "1", code: "HSK_2025", display_name: "HSK 2025", is_active: true, status: "active" },
        },
      ],
      mastery: "not_introduced",
      hasAudio: false,
    };
  }
  let hasAudio = false;
  if (wordResult.data.audio_asset_id) {
    const asset = await supabase
      .from("audio_assets")
      .select("id")
      .eq("id", wordResult.data.audio_asset_id)
      .maybeSingle();
    if (asset.error) throw new DataError();
    hasAudio = !!asset.data;
  }
  return {
    word: wordResult.data,
    members: members.map((m) => ({
      ...m,
      syllabus: syllabuses.find((s) => s.id === m.syllabus_id),
    })),
    mastery: masteryResult.data?.mastery_state ?? "not_introduced",
    hasAudio,
  };
}
