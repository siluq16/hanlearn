import os
import re
import json
from pypdf import PdfReader
from opencc import OpenCC
import pypinyin

cc = OpenCC('t2s')
os.makedirs('content/hsk_library', exist_ok=True)

# -------------------------------------------------------------
# 1. PARSE VOCABULARY PDFS (HSK 1 to 5)
# -------------------------------------------------------------
def parse_hsk_pdf(level):
    pdf_path = f'docs/hsk_vocabulary/NEW HSK{level} 3.0.pdf'
    reader = PdfReader(pdf_path)
    full_text = ''
    for page in reader.pages:
        full_text += (page.extract_text() or '') + '\n'

    # Split by item starts: number followed by Hanzi or CJK zero / punctuation
    splits = re.split(r'\n(?=\d+\s+[\u4e00-\u9fff\u3007])', full_text)
    items = []
    
    for raw in splits[1:]:
        raw_str = ' '.join([l.strip() for l in raw.strip().split('\n') if l.strip()])
        # Match STT and Hanzi (including Chinese comma U+3001 and zero U+3007)
        m = re.match(r'^(\d+)\s+([\u4e00-\u9fff\u3007\s\|｜（）\(\)\.\u3001]+?)\s+(.*)', raw_str)
        if not m:
            continue
        stt = int(m.group(1))
        raw_hanzi = m.group(2).strip()
        rest = m.group(3).strip()

        # Clean simplified hanzi (e.g. 爸爸｜爸 -> 爸爸, 白（形） -> 白, 多（形、 代） -> 多)
        clean_hanzi = re.split(r'[（\(]', raw_hanzi)[0].strip()
        clean_hanzi = re.split(r'[\|｜]', clean_hanzi)[0].strip()

        # Split rest into defs and example
        ex_m = re.search(r'([\u4e00-\u9fff].*)', rest)
        if ex_m:
            defs_part = rest[:ex_m.start()].strip()
            raw_example = ex_m.group(1).strip()
        else:
            defs_part = rest.strip()
            raw_example = ''

        # Split example into Hanzi+Pinyin and Vietnamese translation
        ex_parts = re.split(r'\s+[–\-—]\s+', raw_example, maxsplit=1)
        if len(ex_parts) == 2:
            ex_zh_py = ex_parts[0].strip()
            ex_vi = ex_parts[1].strip()
        else:
            ex_zh_py = raw_example
            ex_vi = ''

        # Extract Pinyin from defs_part (letters with tones)
        py_match = re.match(r'^([a-zA-ZāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙÜ\s\(\)\,\:\;\-\'’\|｜\/\.]+?)(?=\s+[a-z]{2,}|\s+[A-Z]|\s+[\(]|\s+[\u00C0-\u1EF9]|\Z)', defs_part)
        
        pinyin = ''
        meanings_part = defs_part
        if py_match:
            pinyin = py_match.group(1).strip()
            meanings_part = defs_part[py_match.end():].strip()

        # Curriculum tiering for HSK 1:
        # Top 300 words align with HSK_EXAM_2025 syllabus; remaining 200 belong to GF0025_2021 standard
        curriculum_version = "HSK_EXAM_2025" if (level == 1 and stt <= 300) else "GF0025_2021"
        is_hsk_2025_core = bool(level == 1 and stt <= 300)

        items.append({
            "stt": stt,
            "raw_hanzi": raw_hanzi,
            "simplified": clean_hanzi,
            "pinyin": pinyin,
            "raw_definition": meanings_part,
            "example_zh_py": ex_zh_py,
            "example_vi": ex_vi,
            "hsk_level": level,
            "curriculum_version": curriculum_version,
            "is_hsk_2025_core": is_hsk_2025_core,
            "source": f"NEW HSK{level} 3.0.pdf",
            "status": "APPROVED_DRAFT",
            "verification_status": "UNVERIFIED_AUTOMATED"
        })

    return items

vocab_by_level = {}
all_words_seen = {}
for lvl in range(1, 6):
    items = parse_hsk_pdf(lvl)
    vocab_by_level[lvl] = items
    with open(f'content/hsk_library/hsk{lvl}_vocabulary.json', 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print(f"Parsed HSK {lvl}: {len(items)} items saved to content/hsk_library/hsk{lvl}_vocabulary.json")
    for w in items:
        word = w["simplified"]
        if word not in all_words_seen:
            all_words_seen[word] = []
        all_words_seen[word].append(lvl)

# -------------------------------------------------------------
# 2. PARSE DIALOGUES (1000 CAU GIAO TIEP)
# -------------------------------------------------------------
dialogue_pdf_path = 'docs/hsk_vocabulary/1000 CAU GIAO TIEP TIENG HOA- PHON THE.pdf'
d_reader = PdfReader(dialogue_pdf_path)
dialogues = []

# Pages 5 to 104 are Lessons 1 to 100
for p_idx in range(4, 104):
    page_num = p_idx + 1
    page_text = d_reader.pages[p_idx].extract_text() or ''
    
    # Match Lesson header
    m_head = re.search(r'第([一二三四五六七八九十百\d]+)課\s+([^\n\d]+?)(?=\s+Lesson|\n)', page_text)
    if not m_head:
        continue
    lesson_zh_num = m_head.group(1).strip()
    lesson_title_trad = m_head.group(2).strip()
    lesson_title_simp = cc.convert(lesson_title_trad)

    # Match English title
    m_en = re.search(r'Lesson\s+\d+\s+([^\n]+)', page_text)
    lesson_title_en = m_en.group(1).strip() if m_en else ""

    # Extract dialogue section
    # Dialogue lines have speaker prefix like 王： or 方： or 李先生： or 王太太：
    turn_matches = re.findall(r'([^\n：:]{1,6})[：:]([^\n]+)', page_text)
    turns = []
    
    for spk, line in turn_matches:
        spk = spk.strip()
        line = line.strip()
        # Filter out explanatory text that had colons
        if any(keyword in spk for keyword in ['說明', '例句', '練習', 'Lesson', 'Page']):
            continue
        if len(line) < 2:
            continue
        
        simp_line = cc.convert(line)
        simp_spk = cc.convert(spk)
        
        # Generate accurate Pinyin for Chinese text
        py_list = [x[0] for x in pypinyin.pinyin(simp_line, style=pypinyin.Style.TONE)]
        py_str = ' '.join(py_list)

        turns.append({
            "speaker": simp_spk,
            "hanzi_traditional": line,
            "hanzi_simplified": simp_line,
            "pinyin": py_str,
            "meaning_vi": "" # Mark for human verification
        })

    # Difficulty classification based on lesson number and vocabulary length
    lesson_int = p_idx - 3 # Lesson 1 is at page 5 (4 - 3 = 1)
    if lesson_int <= 20:
        suggested_level = 1
    elif lesson_int <= 45:
        suggested_level = 2
    elif lesson_int <= 70:
        suggested_level = 3
    elif lesson_int <= 90:
        suggested_level = 4
    else:
        suggested_level = 5

    dialogues.append({
        "id": f"dlg-lesson-{lesson_int:03d}",
        "lesson_number": lesson_int,
        "title_traditional": lesson_title_trad,
        "title_simplified": lesson_title_simp,
        "title_en": lesson_title_en,
        "turns_count": len(turns),
        "turns": turns,
        "suggested_hsk_level": suggested_level,
        "source": "1000 CAU GIAO TIEP TIENG HOA- PHON THE.pdf (OCAC 2009)",
        "license": "RESTRICTED_EDUCATIONAL_NEEDS_REVIEW",
        "quality_status": "DRAFT_RESTRICTED",
        "client_bundling": "SERVER_DRAFT_ONLY",
        "verification_status": "UNVERIFIED_AUTOMATED",
        "notes": "Chưa có bản dịch tiếng Việt được kiểm định bởi con người. Giữ ở trạng thái draft nội bộ, không đưa vào client bundle hoặc website công khai."
    })

with open('content/hsk_library/dialogues.json', 'w', encoding='utf-8') as f:
    json.dump(dialogues, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(dialogues)} dialogues (total {sum(d['turns_count'] for d in dialogues)} dialogue turns) to content/hsk_library/dialogues.json")

# -------------------------------------------------------------
# 3. MODULE 0 PINYIN & PHONETICS FOUNDATION
# -------------------------------------------------------------
module0 = {
    "id": "module-0-pinyin-foundation",
    "title": "Module 0: Ngữ âm và Phát âm Pinyin Tiếng Trung Nền tảng",
    "description": "Hệ thống toàn diện về Thanh mẫu (Initials), Vận mẫu (Finals), 4 Thanh điệu và quy tắc biến điệu quan trọng cho người mới bắt đầu.",
    "hsk_level": 1,
    "sections": [
        {
            "id": "initials",
            "title": "21 Thanh mẫu (Phụ âm đầu - Shengmu)",
            "groups": [
                {"name": "Âm môi", "initials": ["b", "p", "m", "f"], "description": "b (pô), p (bật hơi), m (mô), f (phô)"},
                {"name": "Âm đầu lưỡi", "initials": ["d", "t", "n", "l"], "description": "d (tơ), t (thờ bật hơi), n (nơ), l (lơ)"},
                {"name": "Âm gốc lưỡi", "initials": ["g", "k", "h"], "description": "g (cơ), k (khờ bật hơi), h (hơ/khờ nhẹ)"},
                {"name": "Âm mặt lưỡi", "initials": ["j", "q", "x"], "description": "j (chi), q (si bật hơi), x (xi nhẹ)"},
                {"name": "Âm đầu lưỡi trước", "initials": ["z", "c", "s"], "description": "z (chơ thẳng lưỡi), c (bật hơi xì), s (xơ)"},
                {"name": "Âm uốn lưỡi (cuốn lưỡi)", "initials": ["zh", "ch", "sh", "r"], "description": "zh (trưa), ch (trưa bật hơi), sh (sưa), r (rơ)"}
            ]
        },
        {
            "id": "finals",
            "title": "36 Vận mẫu (Nguyên âm & Vần - Yunmu)",
            "groups": [
                {"name": "Vận mẫu đơn", "finals": ["a", "o", "e", "i", "u", "ü"]},
                {"name": "Vận mẫu kép", "finals": ["ai", "ei", "ui", "ao", "ou", "iu", "ie", "üe", "er"]},
                {"name": "Vận mẫu mũi trước (-n)", "finals": ["an", "en", "in", "un", "ün"]},
                {"name": "Vận mẫu mũi sau (-ng)", "finals": ["ang", "eng", "ing", "ong"]}
            ]
        },
        {
            "id": "tones",
            "title": "4 Thanh điệu chuẩn & Thanh nhẹ (Shengdiao)",
            "tones": [
                {"tone": 1, "symbol": "¯ (55)", "name": "Thanh 1 (Âm Bình)", "description": "Độ cao 5-5, cao và ngân đều phẳng (mā)", "pitch": "Cao phẳng"},
                {"tone": 2, "symbol": "ˊ (35)", "name": "Thanh 2 (Dương Bình)", "description": "Độ cao 3-5, vút lên như dấu sắc tiếng Việt (má)", "pitch": "Lên cao"},
                {"tone": 3, "symbol": "ˇ (214)", "name": "Thanh 3 (Thượng Thanh)", "description": "Độ cao 2-1-4, hạ xuống thấp rồi hơi vút lên (mǎ)", "pitch": "Xuống rồi lên"},
                {"tone": 4, "symbol": "ˋ (51)", "name": "Thanh 4 (Khứ Thanh)", "description": "Độ cao 5-1, dứt khoát hạ nhanh từ đỉnh xuống đáy (mà)", "pitch": "Rơi mạnh"},
                {"tone": 0, "symbol": "Không dấu", "name": "Thanh nhẹ (Khinh thanh)", "description": "Phát âm nhẹ, ngắn, nhanh (ma, ba, de)", "pitch": "Nhẹ, ngắn"}
            ]
        },
        {
            "id": "tone_sandhi",
            "title": "Các quy tắc biến điệu bắt buộc (Tone Sandhi)",
            "rules": [
                {
                    "name": "Biến điệu hai thanh 3 đi liền nhau",
                    "rule": "3 + 3 -> 2 + 3",
                    "example": "nǐ + hǎo -> ní hǎo (你好), měi + hǎo -> méi hǎo (美好)"
                },
                {
                    "name": "Biến điệu chữ '不' (bù)",
                    "rule": "bù + thanh 4 -> bú + thanh 4; giữ bù trước thanh 1, 2, 3",
                    "example": "bù + shì -> bú shì (不是), bù + yào -> bú yào (不要)"
                },
                {
                    "name": "Biến điệu chữ '一' (yī)",
                    "rule": "yī + thanh 4 -> yí + thanh 4; yī + thanh 1,2,3 -> yì + thanh 1,2,3; đứng một mình đọc yī",
                    "example": "yī + gè -> yí gè (一个), yī + tiān -> yì tiān (一天)"
                }
            ]
        }
    ]
}

with open('content/hsk_library/module0_pinyin.json', 'w', encoding='utf-8') as f:
    json.dump(module0, f, ensure_ascii=False, indent=2)

print("Generated Module 0 Pinyin Foundation into content/hsk_library/module0_pinyin.json")

# -------------------------------------------------------------
# 4. SUMMARY REPORT
# -------------------------------------------------------------
report = {
    "total_unique_words": len(all_words_seen),
    "breakdown": {
        "hsk1": len(vocab_by_level[1]),
        "hsk2": len(vocab_by_level[2]),
        "hsk3": len(vocab_by_level[3]),
        "hsk4": len(vocab_by_level[4]),
        "hsk5": len(vocab_by_level[5])
    },
    "hsk1_curriculum_breakdown": {
        "hsk_2025_exam_core": len([w for w in vocab_by_level[1] if w.get("is_hsk_2025_core")]),
        "gf0025_2021_extended": len([w for w in vocab_by_level[1] if not w.get("is_hsk_2025_core")]),
        "total": len(vocab_by_level[1])
    },
    "cross_level_duplicates_count": len([w for w, lvls in all_words_seen.items() if len(lvls) > 1]),
    "dialogues_summary": {
        "total_lessons": len(dialogues),
        "total_turns": sum(d['turns_count'] for d in dialogues),
        "by_suggested_level": {
            "hsk1": len([d for d in dialogues if d['suggested_hsk_level'] == 1]),
            "hsk2": len([d for d in dialogues if d['suggested_hsk_level'] == 2]),
            "hsk3": len([d for d in dialogues if d['suggested_hsk_level'] == 3]),
            "hsk4": len([d for d in dialogues if d['suggested_hsk_level'] == 4]),
            "hsk5": len([d for d in dialogues if d['suggested_hsk_level'] == 5])
        },
        "policy_status": "DRAFT_RESTRICTED_SERVER_ONLY"
    }
}

with open('content/hsk_library/report.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print("Saved report.json:")
print(json.dumps(report, indent=2))
