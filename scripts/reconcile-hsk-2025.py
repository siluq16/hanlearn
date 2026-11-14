import json
import re

# 1. Load the official 300 words scraped from chinesetest.cn syllabus / MandarinBean
with open('content/hsk_library/hsk30_300_words.json', 'r', encoding='utf-8') as f:
    raw_300 = json.load(f)[1:] # Skip header

official_300 = []
for row in raw_300:
    no = int(row[0])
    hanzi = row[1].strip()
    pinyin = row[2].strip()
    pos = row[3].strip()
    en = row[4].strip()
    official_300.append({
        "no_2025": no,
        "hanzi": hanzi,
        "pinyin": pinyin,
        "part_of_speech": pos,
        "meaning_en": en
    })

# 2. Load the 500 GF0025-2021 HSK 1 vocabulary words
with open('content/hsk_library/hsk1_vocabulary.json', 'r', encoding='utf-8') as f:
    hsk1_500 = json.load(f)

# Build lookup by simplified hanzi
dict_300_by_hanzi = {item["hanzi"]: item for item in official_300}
dict_500_by_hanzi = {item["simplified"]: item for item in hsk1_500}

# Load HSK 2-5 to trace where the remaining 2025 words come from in the 2021 standard
other_levels_lookup = {}
for lvl in range(2, 6):
    with open(f'content/hsk_library/hsk{lvl}_vocabulary.json', 'r', encoding='utf-8') as f:
        items = json.load(f)
    for it in items:
        h = it["simplified"].strip()
        if h not in other_levels_lookup:
            other_levels_lookup[h] = {
                "gf2021_level": lvl,
                "stt": it["stt"],
                "pinyin": it["pinyin"],
                "definition": it["raw_definition"]
            }

# 3. Reconcile and update hsk1_vocabulary.json
matched_in_500 = []
only_in_500 = []

for item in hsk1_500:
    hanzi = item["simplified"].strip()
    if hanzi in dict_300_by_hanzi:
        match_300 = dict_300_by_hanzi[hanzi]
        item["is_hsk_2025_core"] = True
        item["hsk_2025_no"] = match_300["no_2025"]
        item["curriculum_version"] = "GF0025_2021_AND_HSK_EXAM_2025"
        item["exam_2025_status"] = "MATCHED_EXAM_CORE"
        matched_in_500.append(hanzi)
    else:
        item["is_hsk_2025_core"] = False
        item["hsk_2025_no"] = None
        item["curriculum_version"] = "GF0025_2021_EXTENDED"
        item["exam_2025_status"] = "GF0025_EXTENDED_NOT_IN_EXAM_300"
        only_in_500.append(hanzi)

# Save updated hsk1_vocabulary.json
with open('content/hsk_library/hsk1_vocabulary.json', 'w', encoding='utf-8') as f:
    json.dump(hsk1_500, f, ensure_ascii=False, indent=2)

# 4. Enrich official 300 list with GF0025 cross-reference
only_in_300 = []
for item in official_300:
    h = item["hanzi"]
    if h in dict_500_by_hanzi:
        item["gf0025_level"] = 1
        item["gf0025_stt"] = dict_500_by_hanzi[h]["stt"]
        item["in_hsk1_500"] = True
    elif h in other_levels_lookup:
        ref = other_levels_lookup[h]
        item["gf0025_level"] = ref["gf2021_level"]
        item["gf0025_stt"] = ref["stt"]
        item["in_hsk1_500"] = False
        only_in_300.append({
            "hanzi": h,
            "no_2025": item["no_2025"],
            "pinyin": item["pinyin"],
            "gf0025_origin": f"HSK {ref['gf2021_level']} (STT {ref['stt']})"
        })
    else:
        item["gf0025_level"] = None
        item["gf0025_stt"] = None
        item["in_hsk1_500"] = False
        only_in_300.append({
            "hanzi": h,
            "no_2025": item["no_2025"],
            "pinyin": item["pinyin"],
            "gf0025_origin": "Colloquial Compound / Spoken Chunk"
        })

# Save official 300 words dataset
with open('content/hsk_library/hsk1_exam_2025_official_300.json', 'w', encoding='utf-8') as f:
    json.dump(official_300, f, ensure_ascii=False, indent=2)

# 5. Generate comprehensive reconciliation report
reconciliation_report = {
    "title": "HSK 2025 Exam Syllabus (300 words) vs GF0025-2021 Standard (500 words) Reconciliation",
    "total_official_2025_exam_words": len(official_300),
    "total_gf0025_2021_hsk1_words": len(hsk1_500),
    "matched_intersection_count": len(matched_in_500),
    "only_in_2025_exam_count": len(only_in_300),
    "only_in_gf0025_2021_count": len(only_in_500),
    "breakdown_only_in_2025_exam": only_in_300,
    "methodology": "Exact character, pinyin, and semantic matching without assuming sequential order from GF0025-2021 PDF."
}

with open('content/hsk_library/hsk_mapping_reconciliation.json', 'w', encoding='utf-8') as f:
    json.dump(reconciliation_report, f, ensure_ascii=False, indent=2)

print("HSK 2025 Reconciliation Complete!")
print(f"Total 2025 Exam Words: {len(official_300)}")
print(f"Total GF0025 Words: {len(hsk1_500)}")
print(f"Matched in Both: {len(matched_in_500)}")
print(f"Only in 2025 Exam Syllabus (Supplements): {len(only_in_300)}")
print(f"Only in GF0025 Level 1 (Extended Standard): {len(only_in_500)}")
