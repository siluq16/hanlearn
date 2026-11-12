import "server-only";
import { requireLearner } from "@/features/auth/session";
import { getActiveSyllabus } from "@/features/settings/queries";
import { dataOrThrow, DataError, readAll } from "@/lib/data";
import { vocabularySearchResultSchema } from "./schemas";
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
  if (!wordResult.data) return null;
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
