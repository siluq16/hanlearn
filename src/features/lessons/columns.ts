// Explicit projections, reviewed against the captured Development PostgreSQL catalog.
export const LESSON_COLUMNS =
  "id,unit_id,title,objective_vi,estimated_minutes,content,status,review_status,source_uri,content_license,reviewed_by,reviewed_at" as const;
export const UNIT_COLUMNS =
  "id,course_id,title,status,review_status,source_uri,content_license,reviewed_by,reviewed_at" as const;
export const COURSE_COLUMNS =
  "id,syllabus_id,title,hsk_level,status,review_status,source_uri,content_license,reviewed_by,reviewed_at" as const;
export const SYLLABUS_COLUMNS =
  "id,code,display_name,verified_at,status,review_status,source_uri,content_license,reviewed_by,reviewed_at" as const;
export const WORD_COLUMNS =
  "id,simplified,traditional,pinyin_marked,meaning_vi,example_zh,example_pinyin,example_vi,status,review_status,source_uri,content_license,reviewed_by,reviewed_at" as const;
export const GRAMMAR_COLUMNS =
  "id,title,pattern,explanation_vi,examples,status,review_status,source_uri,content_license,reviewed_by,reviewed_at" as const;
export const WORD_LINK_COLUMNS = "lesson_id,vocabulary_id,sort_order" as const;
export const GRAMMAR_LINK_COLUMNS = "lesson_id,grammar_id,sort_order" as const;
export const PROGRESS_COLUMNS =
  "user_id,lesson_id,studied_at,completed_at" as const;
