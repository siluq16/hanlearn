// Reviewed Sprint 1 public projections, NOT cloud-generated types.
// Replace with CLI-generated public types only after approved cloud migrations.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type Profile = {
  id: string;
  display_name: string | null;
  timezone: string;
  daily_goal_minutes: number;
  baseline_hsk_level: number;
  target_hsk_level: number;
  preferred_syllabus_id: string | null;
  created_at: string;
};
export type Syllabus = {
  id: string;
  code: string;
  display_name: string;
  is_active: boolean;
  status: string;
};
export type Course = {
  id: string;
  syllabus_id: string;
  hsk_level: number;
  title: string;
  sort_order: number;
  status: string;
};
export type Unit = {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  status: string;
};
export type Lesson = {
  id: string;
  unit_id: string;
  title: string;
  objective_vi: string | null;
  estimated_minutes: number;
  sort_order: number;
  status: string;
};
export type Progress = {
  user_id: string;
  lesson_id: string;
  studied_at: string | null;
  completed_at: string | null;
};
export type Vocabulary = {
  id: string;
  simplified: string;
  traditional: string | null;
  pinyin_marked: string;
  pinyin_numeric: string | null;
  meaning_vi: string;
  part_of_speech: string | null;
  example_zh: string | null;
  example_pinyin: string | null;
  example_vi: string | null;
  audio_asset_id: string | null;
  status: string;
  source_uri: string | null;
  content_license: string | null;
};
export type Membership = {
  syllabus_id: string;
  vocabulary_id: string;
  introduced_level: number;
};
export type Card = {
  id: string;
  user_id: string;
  vocabulary_id: string;
  card_type: string;
  archived_at: string | null;
  state: string;
  due_at: string;
  last_reviewed_at: string | null;
  version: number;
  algorithm_version: string;
};
export type Session = {
  id: string;
  user_id: string;
  source: string;
  evidence: string;
  started_at: string;
  ended_at: string | null;
};
export type AudioAsset = {
  id: string;
  storage_path: string;
  mime_type: string;
  byte_size: number;
  status: string;
  source_uri: string | null;
  content_license: string | null;
};
// Additive reviewed SELECT projections for Sprint 2.1; still not CLI-generated.
export type PublicationFields = {
  review_status: string;
  source_uri: string | null;
  content_license: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
};
export type GrammarPoint = PublicationFields & {
  id: string;
  title: string;
  pattern: string;
  explanation_vi: string;
  examples: Json;
  status: string;
};
export type LessonVocabulary = {
  lesson_id: string;
  vocabulary_id: string;
  sort_order: number;
};
export type LessonGrammar = {
  lesson_id: string;
  grammar_id: string;
  sort_order: number;
};
type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};
export type LearnerStageProgress = {
  user_id: string;
  lesson_id: string;
  current_stage: number;
  completed_stages: number[];
  updated_at: string;
};
export type CurriculumQuizAttempt = {
  id: string;
  user_id: string;
  quiz_id: string;
  lesson_id?: string;
  quiz_slug?: string;
  started_at: string;
  submitted_at: string | null;
  correct_count: number | null;
  question_count: number;
  passed: boolean | null;
  answers: Json | null;
  metadata?: Json | null;
  created_at?: string;
};
export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      syllabus_versions: Table<
        Syllabus & PublicationFields & { verified_at: string | null }
      >;
      courses: Table<Course & PublicationFields>;
      units: Table<Unit & PublicationFields>;
      lessons: Table<Lesson & PublicationFields & { content: Json }>;
      lesson_vocabulary: Table<LessonVocabulary>;
      lesson_grammar: Table<LessonGrammar>;
      grammar_points: Table<GrammarPoint>;
      learner_stage_progress: Table<LearnerStageProgress>;
      curriculum_quiz_attempts: Table<CurriculumQuizAttempt>;
      lesson_progress: Table<Progress>;
      vocabulary: Table<Vocabulary & PublicationFields>;
      syllabus_vocabulary: Table<Membership>;
      review_cards: Table<Card>;
      review_events: Table<{
        id: string;
        user_id: string;
        card_id: string;
        idempotency_key: string;
        rating: number;
        reviewed_at: string;
        result: Json;
      }>;
      study_sessions: Table<Session>;
      audio_assets: Table<AudioAsset>;
      lesson_quizzes: Table<
        PublicationFields & {
          id: string;
          lesson_id: string;
          revision: number;
          title: string;
          status: string;
          published_at: string | null;
        }
      >;
      quiz_questions: Table<
        PublicationFields & {
          id: string;
          quiz_id: string;
          sort_order: number;
          prompt: string;
          choices: Json;
          status: string;
        }
      >;
      quiz_attempts: Table<{
        id: string;
        user_id: string;
        quiz_id: string;
        started_at: string;
        submitted_at: string | null;
        correct_count: number | null;
        question_count: number | null;
        passed: boolean | null;
      }>;
      quiz_responses: Table<{
        attempt_id: string;
        user_id: string;
        question_id: string;
        answer_index: number | null;
        is_correct: boolean;
      }>;
    };
    Views: {
      vocabulary_progress: {
        Row: { user_id: string; vocabulary_id: string; mastery_state: string };
        Relationships: [];
      };
    };
    Functions: {
      submit_review: {
        Args: {
          p_card_id: string;
          p_rating: number;
          p_response_ms: number | null;
          p_expected_version: number;
          p_idempotency_key: string;
        };
        Returns: Json;
      };
      upsert_learner_stage_progress: {
        Args: {
          p_lesson_id: string;
          p_completed_stages: number[];
          p_current_stage?: number;
        };
        Returns: LearnerStageProgress;
      };
      mark_lesson_studied: { Args: { p_lesson_id: string }; Returns: Json };
      start_quiz: {
        Args: { p_quiz_id: string; p_idempotency_key: string };
        Returns: Json;
      };
      submit_quiz: {
        Args: { p_attempt_id: string; p_answers: Json };
        Returns: Json;
      };
      get_learner_access: { Args: Record<string, never>; Returns: boolean };
      get_due_review_count: { Args: Record<string, never>; Returns: number };
      search_vocabulary: {
        Args: {
          p_syllabus_id: string;
          p_query: string;
          p_level: number | null;
          p_offset: number;
          p_limit: number;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
