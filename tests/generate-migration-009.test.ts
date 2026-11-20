import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ALL_CURRICULUM_QUIZZES } from "@/features/quizzes/curriculum-quizzes";
import { getV1CorrectIndex } from "@/features/quizzes/quiz-revisions";

describe("Generate and verify complete migration 009", () => {
  it("verifies immutable migration 009 matches Revision 1 baseline keys for all curriculum quizzes and unit tests", () => {
    expect(ALL_CURRICULUM_QUIZZES.length).toBe(38);

    const keys: Array<{ slug: string; qId: string; correctIndex: number }> = [];
    const seen = new Set<string>();

    function addKey(slug: string, qId: string, correctIndex: number) {
      const composite = `${slug}:::${qId}`;
      if (!seen.has(composite)) {
        seen.add(composite);
        keys.push({ slug, qId, correctIndex });
      }
    }

    // 1. All 38 Curriculum Quizzes (Revision 1 baseline keys)
    for (const q of ALL_CURRICULUM_QUIZZES) {
      for (const item of q.questions) {
        const key = q.answerKeys[item.id];
        expect(key).toBeDefined();
        if (key) {
          const v1Idx = getV1CorrectIndex(q.slug, item.id) ?? key.correct_index;
          addKey(q.lessonId, item.id, v1Idx);
          addKey(q.slug, item.id, v1Idx);
          addKey(q.quiz.id, item.id, v1Idx);
        }
      }
    }

    // 2. All 6 Unit Tests
    const unitTestDir = "content/hsk_library/unit_tests";
    const unitFiles = fs.readdirSync(unitTestDir).filter((f) => f.endsWith(".json")).sort();
    expect(unitFiles.length).toBe(6);

    const definitions: Array<{ slug: string; duration: number; passingPercent: number }> = [];
    const seenDef = new Set<string>();

    function addDef(slug: string, duration: number, passingPercent = 80) {
      if (!seenDef.has(slug)) {
        seenDef.add(slug);
        definitions.push({ slug, duration, passingPercent });
      }
    }

    // Curriculum quiz definitions: 15 minutes, 80% passing
    for (const q of ALL_CURRICULUM_QUIZZES) {
      addDef(q.lessonId, 15, 80);
      addDef(q.slug, 15, 80);
      addDef(q.quiz.id, 15, 80);
    }

    // Unit test definitions: 20 minutes (1200s + 90s grace = 1290s), 80% passing
    for (const f of unitFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(unitTestDir, f), "utf-8"));
      addDef(data.slug, data.duration_minutes, 80);
      addDef(data.id, data.duration_minutes, 80);
      addDef(`l-hsk1-ut0${data.unit_number}`, data.duration_minutes, 80);

      for (const item of data.questions) {
        const v1Idx = getV1CorrectIndex(data.slug, item.id) ?? item.correct_index;
        addKey(data.slug, item.id, v1Idx);
        addKey(data.id, item.id, v1Idx);
        addKey(`l-hsk1-ut0${data.unit_number}`, item.id, v1Idx);
      }
    }

    expect(keys.length).toBeGreaterThanOrEqual(424);

    let sql = `-- Migration: 202611150009_curriculum_quiz_server_grading.sql
-- Description: Enforce server clock started_at and server-side authoritative grading in PostgreSQL

-- 1. DROP the legacy 5-argument functions to prevent function overloading retention
drop function if exists public.submit_curriculum_quiz_attempt(uuid, integer, integer, boolean, jsonb);
drop function if exists private.submit_curriculum_quiz_attempt(uuid, integer, integer, boolean, jsonb);

-- 2. Table for authoritative private quiz definitions (authoritative duration and passing thresholds)
create table if not exists private.curriculum_quiz_definitions (
  quiz_slug text primary key,
  duration_minutes integer not null,
  passing_score_percent integer not null default 80
);
revoke all on private.curriculum_quiz_definitions from public, anon, authenticated;

-- Populate definitions
insert into private.curriculum_quiz_definitions (quiz_slug, duration_minutes, passing_score_percent) values
`;

    const defRows = definitions.map((d) => `  ('${d.slug}', ${d.duration}, ${d.passingPercent})`).join(",\n");
    sql +=
      defRows +
      `
on conflict (quiz_slug) do update set
  duration_minutes = excluded.duration_minutes,
  passing_score_percent = excluded.passing_score_percent;

-- 3. Table for authoritative private answer keys
create table if not exists private.curriculum_quiz_keys (
  quiz_slug text not null,
  question_id text not null,
  correct_index integer not null check (correct_index between 0 and 5),
  primary key (quiz_slug, question_id)
);
revoke all on private.curriculum_quiz_keys from public, anon, authenticated;

-- 4. Populate answer keys for all 38 Curriculum Quizzes and 6 Unit Tests
insert into private.curriculum_quiz_keys (quiz_slug, question_id, correct_index) values
`;

    const valueRows = keys.map((k) => `  ('${k.slug}', '${k.qId}', ${k.correctIndex})`).join(",\n");
    sql +=
      valueRows +
      `
on conflict (quiz_slug, question_id) do update set correct_index = excluded.correct_index;

-- 5. Trigger: Strictly enforce server clock started_at and clear any client-supplied scores on INSERT
create or replace function private.curriculum_quiz_attempts_stamp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.started_at := clock_timestamp();
  new.user_id := (select auth.uid());
  new.submitted_at := null;
  new.correct_count := null;
  new.passed := null;
  return new;
end;
$$;

drop trigger if exists trg_curriculum_quiz_attempts_stamp on public.curriculum_quiz_attempts;
create trigger trg_curriculum_quiz_attempts_stamp
  before insert on public.curriculum_quiz_attempts
  for each row execute function private.curriculum_quiz_attempts_stamp();

-- 6. Server-Authoritative submit RPC: grades answers inside PostgreSQL, checks deadline, single-submission
create or replace function private.submit_curriculum_quiz_attempt(
  p_attempt_id uuid,
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
  v_matched_slug text;
  v_duration_minutes integer;
  v_passing_percent integer;
  v_max_duration_sec integer;
  v_total integer;
  v_correct integer;
  v_passed boolean;
begin
  v_user_id := (select auth.uid());
  if v_user_id is null or not (select private.is_learner()) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'INVALID_ANSWERS' using errcode = '22023';
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

  -- 1. Determine authoritative quiz duration and passing rubric
  select duration_minutes, passing_score_percent
  into v_duration_minutes, v_passing_percent
  from private.curriculum_quiz_definitions
  where quiz_slug = v_attempt.lesson_id;

  if v_duration_minutes is null then
    select duration_minutes, passing_score_percent
    into v_duration_minutes, v_passing_percent
    from private.curriculum_quiz_definitions
    where quiz_slug = v_attempt.quiz_id;
  end if;

  -- Authoritative duration: Unit test is 20m (1200s), grace period is 90s -> 1290s
  v_duration_minutes := coalesce(v_duration_minutes, 20);
  v_passing_percent := coalesce(v_passing_percent, 80);
  v_max_duration_sec := v_duration_minutes * 60 + 90;

  if clock_timestamp() > v_attempt.started_at + (v_max_duration_sec * interval '1 second') then
    raise exception 'EXAM_DEADLINE_EXCEEDED' using errcode = '22023';
  end if;

  -- 2. Determine which slug matches the answer keys
  if exists (select 1 from private.curriculum_quiz_keys where quiz_slug = v_attempt.lesson_id) then
    v_matched_slug := v_attempt.lesson_id;
  elsif exists (select 1 from private.curriculum_quiz_keys where quiz_slug = v_attempt.quiz_id) then
    v_matched_slug := v_attempt.quiz_id;
  else
    raise exception 'QUIZ_KEYS_NOT_FOUND' using errcode = 'PT404';
  end if;

  -- 3. Authoritative server-side grading against private answer keys
  select count(*), count(*) filter (where (p_answers->>k.question_id)::integer = k.correct_index)
  into v_total, v_correct
  from private.curriculum_quiz_keys k
  where k.quiz_slug = v_matched_slug;

  if v_total is null or v_total = 0 then
    raise exception 'QUIZ_KEYS_NOT_FOUND' using errcode = 'PT404';
  end if;

  v_passed := (v_correct * 100 >= v_total * v_passing_percent);

  update public.curriculum_quiz_attempts set
    submitted_at = clock_timestamp(),
    correct_count = v_correct,
    question_count = v_total,
    passed = v_passed,
    answers = p_answers
  where id = p_attempt_id and user_id = v_user_id
  returning * into v_attempt;

  return v_attempt;
end;
$$;

revoke all on function private.submit_curriculum_quiz_attempt(uuid, jsonb) from public, anon;
grant execute on function private.submit_curriculum_quiz_attempt(uuid, jsonb) to authenticated;

-- Public wrapper: SECURITY INVOKER
create or replace function public.submit_curriculum_quiz_attempt(
  p_attempt_id uuid,
  p_answers jsonb
)
returns public.curriculum_quiz_attempts
language sql
security invoker
set search_path = ''
as $$
  select private.submit_curriculum_quiz_attempt(p_attempt_id, p_answers);
$$;

revoke all on function public.submit_curriculum_quiz_attempt(uuid, jsonb) from public, anon;
grant execute on function public.submit_curriculum_quiz_attempt(uuid, jsonb) to authenticated;
`;

    const existingSql = fs
      .readFileSync("supabase/migrations/202611150009_curriculum_quiz_server_grading.sql", "utf-8")
      .replace(/\r\n/g, "\n");
    expect(existingSql).toBe(sql.replace(/\r\n/g, "\n"));
  });
});
