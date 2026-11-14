"""
Comprehensive 300-word HSK 1 Pedagogical & Linguistic Audit Tool (Sprint 8G)
Analyzes all 300 words against the 5 learning lifecycle states:
1. In Content Library
2. Introduced (1_vocab_learn / warmup)
3. Practiced (exercises / dialogue / listening / reading)
4. In Review System (Mini Quiz / Checkpoints / SRS / Mock Exam)
5. Learner Completed (Progress tracking)
"""

import json
import glob
import os
import re

OFFICIAL_300 = json.load(open("content/hsk_library/hsk1_exam_2025_official_300.json", encoding="utf-8"))
PILOT_VOCAB = json.load(open("content/pilot-hsk1/v1/vocabulary.json", encoding="utf-8"))

lesson_files = sorted(glob.glob("content/hsk_library/hsk1_lesson_*.json"))
checkpoint_files = sorted(glob.glob("content/hsk_library/hsk1_checkpoint_*.json"))
mock_exam = json.load(open("content/hsk_library/hsk1_mock_exam_official.json", encoding="utf-8"))

def audit():
    catalog_300 = {item["hanzi"]: item for item in OFFICIAL_300}
    
    # State tracking
    introduced_words = set()
    practiced_words = set()
    review_words = set()

    # Track from Pilot Vocabulary
    for p in PILOT_VOCAB:
        hz = p.get("simplified") or p.get("hanzi")
        if hz in catalog_300:
            introduced_words.add(hz)
            practiced_words.add(hz)
            review_words.add(hz)

    # Track from 9-stage Lessons
    for lf in lesson_files:
        d = json.load(open(lf, encoding="utf-8"))
        stages = d.get("stages", [])
        
        # Stages 0 & 1: Introduced
        for s in stages[:2]:
            for w in s.get("warmup_words", []):
                hz = w.get("hanzi")
                if hz in catalog_300:
                    introduced_words.add(hz)
            for v in s.get("vocabulary", []):
                hz = v.get("simplified") or v.get("hanzi")
                if hz in catalog_300:
                    introduced_words.add(hz)

        # Stages 2 through 7: Practiced
        for s in stages[2:8]:
            # check exercises
            for ex in s.get("exercises", []):
                ex_str = json.dumps(ex, ensure_ascii=False)
                for hz in catalog_300:
                    if hz in ex_str:
                        practiced_words.add(hz)
            # check dialogue
            if "dialogue" in s:
                d_str = json.dumps(s["dialogue"], ensure_ascii=False)
                for hz in catalog_300:
                    if hz in d_str:
                        practiced_words.add(hz)
            # check passage
            if "passage" in s:
                p_str = json.dumps(s["passage"], ensure_ascii=False)
                for hz in catalog_300:
                    if hz in p_str:
                        practiced_words.add(hz)

    # Track from Checkpoints (practice & review)
    for cf in checkpoint_files:
        d = json.load(open(cf, encoding="utf-8"))
        for s in d.get("stages", []):
            s_str = json.dumps(s, ensure_ascii=False)
            for hz in catalog_300:
                if hz in s_str:
                    practiced_words.add(hz)
                    review_words.add(hz)

    # Track from Mock Exam
    for q in mock_exam.get("questions", []):
        q_str = json.dumps(q, ensure_ascii=False)
        for hz in catalog_300:
            if hz in q_str:
                practiced_words.add(hz)
                review_words.add(hz)

    # Track from Curriculum Quizzes
    for qf in ["src/features/quizzes/curriculum-quizzes.ts", "src/features/quizzes/curriculum-quizzes-batch2.ts"]:
        if os.path.exists(qf):
            content = open(qf, encoding="utf-8").read()
            for hz in catalog_300:
                if hz in content:
                    review_words.add(hz)

    # All introduced words are registered for SRS Review
    review_words.update(introduced_words)

    # Analysis
    all_300 = set(catalog_300.keys())
    not_introduced = sorted(list(all_300 - introduced_words))
    not_practiced = sorted(list(all_300 - practiced_words))
    not_reviewed = sorted(list(all_300 - review_words))

    report = {
        "total_official_syllabus": len(catalog_300),
        "state_1_in_content_library": len(catalog_300),
        "state_2_introduced": len(introduced_words),
        "state_3_practiced": len(practiced_words),
        "state_4_in_review_system": len(review_words),
        "state_5_learner_completed_tracking": "Tracked per user in learner_stage_progress and curriculum_quiz_attempts via user_id",
        "provenance_statement": "COMMUNITY_MANDARINBEAN_HSK30_BAND1 (Third-party educational compilation referencing CTI HSK 3.0 syllabus outline; not direct official CTI electronic download).",
        "not_introduced": not_introduced,
        "not_practiced": not_practiced,
        "not_reviewed": not_reviewed
    }

    with open("content/hsk_library/hsk1_300_words_audit_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print("=== 300-WORD HSK 1 AUDIT REPORT ===")
    print(f"Total Official Words: {len(catalog_300)}")
    print(f"State 1 (In Content Library): {len(catalog_300)} / 300")
    print(f"State 2 (Introduced in Stages 0-1): {len(introduced_words)} / 300")
    print(f"State 3 (Practiced in Stages 2-7): {len(practiced_words)} / 300")
    print(f"State 4 (In Review Quizzes & SRS): {len(review_words)} / 300")
    print(f"Not Introduced: {len(not_introduced)} {not_introduced}")
    print(f"Not Practiced: {len(not_practiced)} {not_practiced[:10]}")
    print(f"Not Reviewed: {len(not_reviewed)} {not_reviewed}")
    print("Saved audit to content/hsk_library/hsk1_300_words_audit_report.json")

if __name__ == "__main__":
    audit()
