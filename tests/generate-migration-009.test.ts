import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ALL_CURRICULUM_QUIZZES } from "@/features/quizzes/curriculum-quizzes";

describe("Generate and verify complete migration 009", () => {
  it("builds migration 009 with all curriculum quizzes and unit tests", () => {
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

    // 1. All 38 Curriculum Quizzes
    for (const q of ALL_CURRICULUM_QUIZZES) {
      for (const item of q.questions) {
        const key = q.answerKeys[item.id];
        expect(key).toBeDefined();
        if (key) {
          addKey(q.lessonId, item.id, key.correct_index);
          addKey(q.slug, item.id, key.correct_index);
          addKey(q.quiz.id, item.id, key.correct_index);
        }
      }
    }

    // 2. All 6 Unit Tests
    const unitTestDir = "content/hsk_library/unit_tests";
    const unitFiles = fs.readdirSync(unitTestDir).filter((f) => f.endsWith(".json")).sort();
    expect(unitFiles.length).toBe(6);

    for (const f of unitFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(unitTestDir, f), "utf-8"));
      for (const item of data.questions) {
        addKey(data.slug, item.id, item.correct_index);
        addKey(data.id, item.id, item.correct_index);
        addKey(`l-hsk1-ut0${data.unit_number}`, item.id, item.correct_index);
      }
    }

    expect(keys.length).toBeGreaterThanOrEqual(424);

    let sql = `-- Migration: 202611150009_curriculum_quiz_server_grading.sql
-- Description: Enforce server clock started_at and server-side authoritative grading in PostgreSQL

-- 1. DROP the legacy 5-argument functions to prevent function overloading retention
drop function if exists public.submit_curriculum_quiz_attempt(uuid, integer, integer, boolean, jsonb);
drop function if exists private.submit_curriculum_quiz_attempt(uuid, integer, integer, boolean, jsonb);

-- 2. Table for authoritative private answer keys
create table if not exists private.curriculum_quiz_keys (
  quiz_slug text not null,
  question_id text not null,
  correct_index integer not null,
  primary key (quiz_slug, question_id)
);
revoke all on private.curriculum_quiz_keys from public, anon, authenticated;

-- 3. Populate answer keys for all 38 Curriculum Quizzes and 6 Unit Tests
insert into private.curriculum_quiz_keys (quiz_slug, question_id, correct_index) values
`;

    const valueRows = keys.map((k) => `  ('${k.slug}', '${k.qId}', ${k.correctIndex})`).join(",\n");
    sql +=
      valueRows +
      `
on conflict (quiz_slug, question_id) do update set correct_index = excluded.correct_index;

-- 4. Trigger: Strictly enforce server clock started_at and clear any client-supplied scores on INSERT
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

-- 5. Server-Authoritative submit RPC: grades answers inside PostgreSQL, checks deadline, single-submission
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

  -- Deadline check: 30 minutes + 90s grace period = 1890s
  if clock_timestamp() > v_attempt.started_at + interval '1890 seconds' then
    raise exception 'EXAM_DEADLINE_EXCEEDED' using errcode = '22023';
  end if;

  -- Grade answers against authoritative private keys
  select count(*), count(*) filter (where (p_answers->>k.question_id)::integer = k.correct_index)
  into v_total, v_correct
  from private.curriculum_quiz_keys k
  where k.quiz_slug = v_attempt.lesson_id;

  if v_total is null or v_total = 0 then
    -- Also try matching by quiz_id
    select count(*), count(*) filter (where (p_answers->>k.question_id)::integer = k.correct_index)
    into v_total, v_correct
    from private.curriculum_quiz_keys k
    where k.quiz_slug = v_attempt.quiz_id;
  end if;

  if v_total is null or v_total = 0 then
    raise exception 'QUIZ_KEYS_NOT_FOUND' using errcode = 'PT404';
  end if;

  v_passed := (v_correct * 100 >= v_total * 80);

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

    fs.writeFileSync("supabase/migrations/202611150009_curriculum_quiz_server_grading.sql", sql, "utf-8");
    expect(fs.existsSync("supabase/migrations/202611150009_curriculum_quiz_server_grading.sql")).toBe(true);
  });
});
