create table if not exists public.learner_stage_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  current_stage integer not null default 0 check (current_stage between 0 and 9),
  completed_stages integer[] not null default '{}',
  updated_at timestamptz not null default clock_timestamp(),
  primary key (user_id, lesson_id)
);

alter table public.learner_stage_progress enable row level security;
revoke all on public.learner_stage_progress from public, anon, authenticated;
grant select, insert, update on public.learner_stage_progress to authenticated;

create policy learner_stage_progress_read on public.learner_stage_progress
  for select to authenticated
  using ((select private.is_learner()) and user_id = (select auth.uid()));

create policy learner_stage_progress_insert on public.learner_stage_progress
  for insert to authenticated
  with check ((select private.is_learner()) and user_id = (select auth.uid()));

create policy learner_stage_progress_update on public.learner_stage_progress
  for update to authenticated
  using ((select private.is_learner()) and user_id = (select auth.uid()))
  with check ((select private.is_learner()) and user_id = (select auth.uid()));

-- Atomic stage progress upsert preventing lost updates under concurrent modifications
create or replace function private.upsert_learner_stage_progress(
  p_lesson_id text,
  p_completed_stages integer[],
  p_current_stage integer default 0
)
returns public.learner_stage_progress
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_result public.learner_stage_progress;
begin
  v_user_id := (select auth.uid());
  if v_user_id is null or not (select private.is_learner()) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  insert into public.learner_stage_progress (
    user_id,
    lesson_id,
    current_stage,
    completed_stages,
    updated_at
  )
  values (
    v_user_id,
    p_lesson_id,
    p_current_stage,
    p_completed_stages,
    clock_timestamp()
  )
  on conflict (user_id, lesson_id) do update set
    completed_stages = array(
      select distinct s from unnest(public.learner_stage_progress.completed_stages || excluded.completed_stages) s order by s
    ),
    current_stage = case
      when excluded.current_stage > public.learner_stage_progress.current_stage then excluded.current_stage
      else public.learner_stage_progress.current_stage
    end,
    updated_at = clock_timestamp()
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function private.upsert_learner_stage_progress(text, integer[], integer) from public, anon;
grant execute on function private.upsert_learner_stage_progress(text, integer[], integer) to authenticated;

-- Public wrapper function: SECURITY INVOKER
create or replace function public.upsert_learner_stage_progress(
  p_lesson_id text,
  p_completed_stages integer[],
  p_current_stage integer default 0
)
returns public.learner_stage_progress
language sql
security invoker
as $$
  select private.upsert_learner_stage_progress(p_lesson_id, p_completed_stages, p_current_stage);
$$;

revoke all on function public.upsert_learner_stage_progress(text, integer[], integer) from public, anon;
grant execute on function public.upsert_learner_stage_progress(text, integer[], integer) to authenticated;

-- Table for Curriculum quiz attempts (Lessons 5, 6, 7+ and Review Checkpoints)
create table if not exists public.curriculum_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null,
  lesson_id text not null,
  started_at timestamptz not null default clock_timestamp(),
  submitted_at timestamptz,
  correct_count integer,
  question_count integer not null,
  passed boolean,
  answers jsonb,
  created_at timestamptz not null default clock_timestamp()
);

alter table public.curriculum_quiz_attempts enable row level security;
revoke all on public.curriculum_quiz_attempts from public, anon, authenticated;
grant select, insert on public.curriculum_quiz_attempts to authenticated;

create policy curriculum_quiz_attempts_read on public.curriculum_quiz_attempts
  for select to authenticated
  using ((select private.is_learner()) and user_id = (select auth.uid()));

-- Learners can only insert an unstarted attempt; scores cannot be forged on insert
create policy curriculum_quiz_attempts_insert on public.curriculum_quiz_attempts
  for insert to authenticated
  with check (
    (select private.is_learner())
    and user_id = (select auth.uid())
    and correct_count is null
    and passed is null
    and submitted_at is null
  );

-- Atomic submission function: records result securely under row lock and validates single-submission
create or replace function private.submit_curriculum_quiz_attempt(
  p_attempt_id uuid,
  p_correct_count integer,
  p_question_count integer,
  p_passed boolean,
  p_answers jsonb
)
returns public.curriculum_quiz_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_attempt public.curriculum_quiz_attempts;
begin
  v_user_id := (select auth.uid());
  if v_user_id is null or not (select private.is_learner()) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select * into v_attempt
  from public.curriculum_quiz_attempts
  where id = p_attempt_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'ATTEMPT_NOT_FOUND' using errcode = 'PT404';
  end if;

  if v_attempt.submitted_at is not null then
    raise exception 'ALREADY_SUBMITTED' using errcode = 'PT409';
  end if;

  update public.curriculum_quiz_attempts set
    submitted_at = clock_timestamp(),
    correct_count = p_correct_count,
    question_count = p_question_count,
    passed = p_passed,
    answers = p_answers
  where id = p_attempt_id and user_id = v_user_id
  returning * into v_attempt;

  return v_attempt;
end;
$$;

revoke all on function private.submit_curriculum_quiz_attempt(uuid, integer, integer, boolean, jsonb) from public, anon;
grant execute on function private.submit_curriculum_quiz_attempt(uuid, integer, integer, boolean, jsonb) to authenticated;

-- Public wrapper: SECURITY INVOKER
create or replace function public.submit_curriculum_quiz_attempt(
  p_attempt_id uuid,
  p_correct_count integer,
  p_question_count integer,
  p_passed boolean,
  p_answers jsonb
)
returns public.curriculum_quiz_attempts
language sql
security invoker
as $$
  select private.submit_curriculum_quiz_attempt(p_attempt_id, p_correct_count, p_question_count, p_passed, p_answers);
$$;

revoke all on function public.submit_curriculum_quiz_attempt(uuid, integer, integer, boolean, jsonb) from public, anon;
grant execute on function public.submit_curriculum_quiz_attempt(uuid, integer, integer, boolean, jsonb) to authenticated;
