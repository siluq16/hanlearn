-- Migration: 202611160010_learner_snapshot_rpc.sql
-- Description: Read-only single-roundtrip learner snapshot RPCs for high-performance navigation.
-- SECURITY INVOKER preserves all existing RLS policies and user isolation invariants.

create or replace function public.get_learner_curriculum_snapshot()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'stage_progress', coalesce((
      select jsonb_agg(jsonb_build_object(
        'lesson_id', s.lesson_id,
        'current_stage', s.current_stage,
        'completed_stages', s.completed_stages
      ))
      from public.learner_stage_progress s
      where s.user_id = (select auth.uid())
    ), '[]'::jsonb),
    'quiz_attempts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'lesson_id', q.lesson_id,
        'quiz_id', q.quiz_id,
        'correct_count', q.correct_count,
        'question_count', q.question_count,
        'passed', q.passed,
        'submitted_at', q.submitted_at,
        'answers', q.answers
      ))
      from (
        select lesson_id, quiz_id, correct_count, question_count, passed, submitted_at, answers
        from public.curriculum_quiz_attempts
        where user_id = (select auth.uid())
        order by submitted_at desc nulls last
      ) q
    ), '[]'::jsonb),
    'vocabulary_progress', coalesce((
      select jsonb_agg(jsonb_build_object(
        'vocabulary_id', vp.vocabulary_id,
        'mastery_state', vp.mastery_state
      ))
      from public.vocabulary_progress vp
      where vp.user_id = (select auth.uid())
    ), '[]'::jsonb),
    'practice_history', coalesce((
      select jsonb_agg(jsonb_build_object(
        'practice_set_id', ph.practice_set_id,
        'best_score', ph.best_score,
        'total_questions', ph.total_questions,
        'completed_at', ph.completed_at
      ))
      from public.learner_practice_history ph
      where ph.user_id = (select auth.uid())
    ), '[]'::jsonb),
    'due_count', coalesce((select public.get_due_review_count()), 0)
  );
$$;

revoke all on function public.get_learner_curriculum_snapshot() from public, anon, authenticated;
grant execute on function public.get_learner_curriculum_snapshot() to authenticated;

create or replace function public.get_learner_dashboard_snapshot()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'profile', (
      select jsonb_build_object(
        'id', p.id,
        'display_name', p.display_name,
        'timezone', p.timezone,
        'daily_goal_minutes', p.daily_goal_minutes,
        'baseline_hsk_level', p.baseline_hsk_level,
        'target_hsk_level', p.target_hsk_level,
        'preferred_syllabus_id', p.preferred_syllabus_id,
        'created_at', p.created_at
      )
      from public.profiles p
      where p.id = (select auth.uid())
    ),
    'lesson_progress', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', lp.user_id,
        'lesson_id', lp.lesson_id,
        'studied_at', lp.studied_at,
        'completed_at', lp.completed_at
      ) order by lp.lesson_id)
      from public.lesson_progress lp
      where lp.user_id = (select auth.uid())
    ), '[]'::jsonb),
    'review_cards', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', rc.id,
        'vocabulary_id', rc.vocabulary_id
      ) order by rc.id)
      from public.review_cards rc
      where rc.user_id = (select auth.uid())
        and rc.archived_at is null
    ), '[]'::jsonb),
    'due_count', coalesce((select public.get_due_review_count()), 0),
    'study_sessions', coalesce((
      select jsonb_agg(to_jsonb(ss))
      from (
        select id, user_id, source, evidence, started_at, ended_at
        from public.study_sessions
        where user_id = (select auth.uid())
        order by started_at desc
        limit 5
      ) ss
    ), '[]'::jsonb),
    'quiz_attempts', coalesce((
      select jsonb_agg(to_jsonb(qa))
      from (
        select id, quiz_id, started_at, submitted_at, correct_count, question_count, passed
        from public.quiz_attempts
        where user_id = (select auth.uid())
          and submitted_at is not null
        order by submitted_at desc
        limit 5
      ) qa
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.get_learner_dashboard_snapshot() from public, anon, authenticated;
grant execute on function public.get_learner_dashboard_snapshot() to authenticated;
