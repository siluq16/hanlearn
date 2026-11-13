// Node-only public projection. Never opens the private answer store or .env.
import {
  loadPilot,
  syntheticDelivery,
  validateImport,
} from "./pilot-r3-importer.mjs";
import { auditPilot } from "./pilot-r3-preflight.mjs";

export function loadPreview() {
  const pkg = loadPilot();
  validateImport(pkg, syntheticDelivery(pkg));
  const audit = auditPilot();
  const provenance = (row) => ({
    sourceUri: row.source_uri,
    license: row.content_license,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
  });
  const words = pkg.vocabulary.map((w) => ({
    id: w.id,
    hanzi: w.simplified,
    traditional: w.traditional,
    pinyin: w.pinyin_marked,
    meaningVi: w.meaning_vi,
    example: w.example_zh
      ? {
          hanzi: w.example_zh,
          pinyin: w.example_pinyin,
          translationVi: w.example_vi,
        }
      : null,
    provenance: provenance(w),
    audio: { status: "unavailable", reason: "storage_unverified" },
  }));
  const grammar = pkg.grammar.map((g) => ({
    id: g.id,
    title: g.title,
    pattern: g.pattern,
    explanationVi: g.explanation_vi,
    examples: g.examples,
    provenance: provenance(g),
  }));
  function joined(rows, key, catalog, lessonId) {
    return rows
      .filter((r) => r.lesson_id === lessonId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => {
        const item = catalog.find((x) => x.id === r[key]);
        if (!item) throw Error("preview_reference_missing");
        return item;
      });
  }
  return {
    packageId: pkg.manifest.package_id,
    revision: 3,
    manifestHash: audit.manifestHash,
    snapshotHash: audit.snapshotHash,
    vocabularyCount: words.length,
    grammarCount: grammar.length,
    lessons: pkg.lessons.map((l, i) => ({
      id: l.id,
      title: l.title,
      objectiveVi: l.objective_vi,
      estimatedMinutes: l.estimated_minutes,
      newWordCount: pkg.manifest.lessons[i].new_vocabulary_ids.length,
      content: l.content,
      vocabulary: joined(
        pkg.manifest.lesson_vocabulary,
        "vocabulary_id",
        words,
        l.id,
      ),
      grammar: joined(pkg.manifest.lesson_grammar, "grammar_id", grammar, l.id),
    })),
  };
}

export function assertPresentationModules(ids) {
  for (const raw of ids) {
    const id = raw.replaceAll("\\", "/");
    if (
      /\/(?:features\/auth|lib\/supabase|\.local|content\/pilot-hsk1)\//.test(
        id,
      ) ||
      /\/features\/lessons\/(?:actions|queries|study-contract|components\/study-confirmation)\./.test(
        id,
      ) ||
      /(?:@supabase|server-only|next\/)/.test(id)
    )
      throw Error("preview_forbidden_module");
  }
}
