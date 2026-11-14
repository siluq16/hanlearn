import glob
import json

lesson_files = sorted(glob.glob("content/hsk_library/hsk1_lesson_*.json") + glob.glob("content/hsk_library/hsk1_checkpoint_*.json"))
print(f"Total lesson files: {len(lesson_files)}")

results = []
for lf in lesson_files:
    d = json.load(open(lf, encoding="utf-8"))
    vocab = d["stages"][1].get("vocabulary", [])
    words = [w["simplified"] for w in vocab]
    results.append({
        "file": lf,
        "id": d["id"],
        "slug": d["slug"],
        "title": d["title"],
        "count": len(words),
        "words": words
    })

print(f"{'SLUG':<25} | {'COUNT':<5} | {'SAMPLE WORDS'}")
print("-" * 65)
for r in results:
    print(f"{r['slug']:<25} | {r['count']:<5} | {', '.join(r['words'][:6])}{'...' if len(r['words']) > 6 else ''}")
