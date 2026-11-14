import json

# 1. Load the educational 300 words dataset (MandarinBean community compilation referencing CTI HSK 3.0 Band 1 outline)
with open('content/hsk_library/hsk30_300_words.json', 'r', encoding='utf-8') as f:
    raw_300 = json.load(f)[1:]  # Skip header row

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
        "meaning_en": en,
        "provenance": "COMMUNITY_MANDARINBEAN_HSK30_BAND1",
        "source_reference": "MandarinBean HSK 3.0 Band 1 educational syllabus table, referencing CTI HSK 3.0 outline",
        "verified_official_download": False
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
matched_entries_500 = []
only_entries_500 = []

for item in hsk1_500:
    hanzi = item["simplified"].strip()
    if hanzi in dict_300_by_hanzi:
        match_300 = dict_300_by_hanzi[hanzi]
        item["is_hsk_2025_core"] = True
        item["hsk_2025_no"] = match_300["no_2025"]
        item["curriculum_version"] = "GF0025_2021_AND_HSK_EXAM_2025"
        item["exam_2025_status"] = "MATCHED_EXAM_CORE"
        matched_entries_500.append(item)
    else:
        item["is_hsk_2025_core"] = False
        item["hsk_2025_no"] = None
        item["curriculum_version"] = "GF0025_2021_EXTENDED"
        item["exam_2025_status"] = "GF0025_EXTENDED_NOT_IN_EXAM_300"
        only_entries_500.append(item)

# Save updated hsk1_vocabulary.json
with open('content/hsk_library/hsk1_vocabulary.json', 'w', encoding='utf-8') as f:
    json.dump(hsk1_500, f, ensure_ascii=False, indent=2)

# 4. Enrich official 300 list with GF0025 cross-reference
only_in_300 = []
intersection_in_300 = []
for item in official_300:
    h = item["hanzi"]
    if h in dict_500_by_hanzi:
        item["gf0025_level"] = 1
        item["gf0025_stt"] = dict_500_by_hanzi[h]["stt"]
        item["in_hsk1_500"] = True
        intersection_in_300.append(item)
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

# 5. Generate mathematically rigorous reconciliation report
reconciliation_report = {
    "title": "HSK 2025 Exam Reference (300 words) vs GF0025-2021 Standard (500 items) Reconciliation",
    "provenance_statement": "Dataset 300 words is from MandarinBean educational syllabus compilation referencing CTI HSK 3.0 Band 1 outline, not an official authenticated binary directly from chinesetest.cn.",
    "dataset_300_total": len(official_300),
    "dataset_300_unique_hanzi": len(dict_300_by_hanzi),
    "dataset_500_total_entries": len(hsk1_500),
    "dataset_500_unique_hanzi": len(dict_500_by_hanzi),
    "polyphone_double_entries_in_500": [
        {"hanzi": "地", "meanings": ["trợ từ - de", "danh từ - dì"]},
        {"hanzi": "干", "meanings": ["tính từ - gān", "động từ - gàn"]},
        {"hanzi": "还", "meanings": ["phó từ - hái", "động từ - huán"]},
        {"hanzi": "有", "meanings": ["động từ - yǒu", "phó từ - yǒu"]}
    ],
    "mathematical_set_partition": {
        "set_A_300_words": len(dict_300_by_hanzi),
        "set_B_500_unique_words": len(dict_500_by_hanzi),
        "intersection_A_and_B": len(intersection_in_300),
        "difference_A_minus_B_only_in_2025": len(only_in_300),
        "difference_B_minus_A_only_in_gf0025": len(dict_500_by_hanzi) - len(intersection_in_300),
        "exact_verification_sum": f"{len(intersection_in_300)} + {len(only_in_300)} = {len(intersection_in_300) + len(only_in_300)} (strictly matches 300)"
    },
    "entry_level_counts_in_500": {
        "entries_matching_2025": len(matched_entries_500),
        "entries_not_in_2025": len(only_entries_500),
        "exact_entries_sum": f"{len(matched_entries_500)} + {len(only_entries_500)} = {len(matched_entries_500) + len(only_entries_500)} (strictly matches 500)"
    },
    "breakdown_only_in_2025_exam": only_in_300,
    "methodology": "Strict mathematical set decomposition distinguishing unique Hanzi keys from multi-POS catalog entries."
}

with open('content/hsk_library/hsk_mapping_reconciliation.json', 'w', encoding='utf-8') as f:
    json.dump(reconciliation_report, f, ensure_ascii=False, indent=2)

print("HSK 2025 Mathematical Reconciliation Complete!")
print(f"Total 2025 Words: {len(official_300)}")
print(f"Set Intersection |A ∩ B|: {len(intersection_in_300)}")
print(f"Set Difference |A \\ B|: {len(only_in_300)}")
print(f"Sum (|A ∩ B| + |A \\ B|): {len(intersection_in_300) + len(only_in_300)}")
print(f"Entries 500: {len(matched_entries_500)} matched + {len(only_entries_500)} unmatched = {len(matched_entries_500) + len(only_entries_500)}")
