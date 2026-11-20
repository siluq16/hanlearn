-- Test suite for Migration 009: Curriculum Quiz & Unit Test Server-Authoritative Grading
begin;
set local role postgres;

-- 0. Ensure test learners exist and are allowed in the test fixture
insert into auth.users (id, email, email_confirmed_at)
values
  ('e0000000-0000-0000-0000-000000000001', 'test_learner_1@local.invalid', clock_timestamp()),
  ('e0000000-0000-0000-0000-000000000002', 'test_learner_2@local.invalid', clock_timestamp())
on conflict (id) do update set email_confirmed_at = excluded.email_confirmed_at;

insert into private.allowed_learners (user_id)
values
  ('e0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000002')
on conflict (user_id) do nothing;

-- Helper to simulate time passage on an attempt during test (rolled back at end)
create or replace function public._test_backdate_attempt(p_id uuid, p_seconds integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.curriculum_quiz_attempts
  set started_at = clock_timestamp() - (p_seconds * interval '1 second')
  where id = p_id;
$$;
grant execute on function public._test_backdate_attempt to authenticated;

-- 1. Check legacy 5-argument overloads are completely removed
do $$
declare
  legacy_count integer;
begin
  select count(*) into legacy_count
  from pg_proc
  where proname = 'submit_curriculum_quiz_attempt' and pronargs = 5;

  if legacy_count <> 0 then
    raise exception 'SECURITY FAIL: Legacy 5-argument submit_curriculum_quiz_attempt still exists in pg_proc!';
  end if;
  raise notice 'PASS: legacy 5-arg RPC overload completely removed';
end $$;

-- 2. Check new 2-argument function signatures exist (1 in private, 1 in public)
do $$
declare
  new_count integer;
begin
  select count(*) into new_count
  from pg_proc
  where proname = 'submit_curriculum_quiz_attempt' and pronargs = 2;

  if new_count <> 2 then
    raise exception 'FAIL: Expected 2 overloads (private and public), found %', new_count;
  end if;
  raise notice 'PASS: new 2-arg RPC signature present in private and public';
end $$;

-- 3. Verify private.curriculum_quiz_keys has keys populated
do $$
declare
  key_count integer;
  def_count integer;
begin
  select count(*) into key_count from private.curriculum_quiz_keys;
  if key_count < 400 then
    raise exception 'FAIL: Expected at least 400 answer key mappings, found %', key_count;
  end if;
  raise notice 'PASS: private.curriculum_quiz_keys has % mappings', key_count;

  select count(*) into def_count from private.curriculum_quiz_definitions;
  if def_count < 40 then
    raise exception 'FAIL: Expected at least 40 quiz definitions, found %', def_count;
  end if;
  raise notice 'PASS: private.curriculum_quiz_definitions has % definitions', def_count;
end $$;

-- 4. Test authenticated learner execution
set local role authenticated;
select set_config('request.jwt.claim.sub', 'e0000000-0000-0000-0000-000000000001', true);

-- 4A. Verify authenticated cannot read private.curriculum_quiz_keys
do $$
begin
  begin
    perform count(*) from private.curriculum_quiz_keys;
    raise exception 'SECURITY FAIL: Authenticated role could read private.curriculum_quiz_keys!';
  exception when insufficient_privilege then
    raise notice 'PASS: authenticated blocked from reading private.curriculum_quiz_keys';
  end;
end $$;

-- 4B. Verify authenticated cannot read private.curriculum_quiz_definitions
do $$
begin
  begin
    perform count(*) from private.curriculum_quiz_definitions;
    raise exception 'SECURITY FAIL: Authenticated role could read private.curriculum_quiz_definitions!';
  exception when insufficient_privilege then
    raise notice 'PASS: authenticated blocked from reading private.curriculum_quiz_definitions';
  end;
end $$;

-- 4C. Test trigger forces clock_timestamp() even if client provides fake started_at
do $$
declare
  v_id uuid := 'a0000000-0000-4000-8000-000000000001';
  v_stored_started_at timestamptz;
  v_fake_future timestamptz := clock_timestamp() + interval '10 hours';
begin
  insert into public.curriculum_quiz_attempts (
    id, user_id, quiz_id, lesson_id, question_count, started_at
  ) values (
    v_id, 'e0000000-0000-0000-0000-000000000001', 'hsk1-unit-test-01', 'hsk1-unit-test-01', 20, v_fake_future
  );

  select started_at into v_stored_started_at
  from public.curriculum_quiz_attempts
  where id = v_id;

  -- The stored timestamp MUST NOT be the fake future timestamp!
  if v_stored_started_at >= v_fake_future then
    raise exception 'SECURITY FAIL: started_at forgery succeeded!';
  end if;
  raise notice 'PASS: trigger forced server clock started_at and ignored fake future date';
end $$;

-- 4D. Test on-time submission with server grading
-- As postgres, create a temp table with the fixture answers for testing grading
set local role postgres;
drop table if exists _fixture_answers;
create temp table _fixture_answers (answers jsonb);
insert into _fixture_answers
select jsonb_object_agg(question_id, coalesce(correct_index_v1, correct_index))
from private.curriculum_quiz_keys
where quiz_slug = 'hsk1-unit-test-01';
grant select on _fixture_answers to authenticated;

set local role authenticated;
select set_config('request.jwt.claim.sub', 'e0000000-0000-0000-0000-000000000001', true);

do $$
declare
  v_id uuid := 'a0000000-0000-4000-8000-000000000001';
  v_res public.curriculum_quiz_attempts;
  v_answers jsonb;
begin
  select answers into v_answers from _fixture_answers;

  v_res := public.submit_curriculum_quiz_attempt(v_id, v_answers);

  if v_res.correct_count <> 20 or v_res.passed <> true then
    raise exception 'FAIL: Server grading mismatch! Got % / %', v_res.correct_count, v_res.question_count;
  end if;
  raise notice 'PASS: on-time submission server-graded to 20/20 and passed=true';
end $$;

-- 4E. Test Anti-Replay: duplicate submission of an already finished attempt
do $$
declare
  v_id uuid := 'a0000000-0000-4000-8000-000000000001';
begin
  begin
    perform public.submit_curriculum_quiz_attempt(v_id, '{}'::jsonb);
    raise exception 'SECURITY FAIL: Duplicate submission succeeded!';
  exception when sqlstate 'PT409' then
    raise notice 'PASS: duplicate submission rejected with ALREADY_SUBMITTED (PT409)';
  end;
end $$;

-- 4F. Test Deadline enforcement: attempt past 20 minutes + 90s grace (1290s)
do $$
declare
  v_id uuid := 'a0000000-0000-4000-8000-000000000002';
begin
  -- Create attempt
  insert into public.curriculum_quiz_attempts (
    id, user_id, quiz_id, lesson_id, question_count
  ) values (
    v_id, 'e0000000-0000-0000-0000-000000000001', 'hsk1-unit-test-01', 'hsk1-unit-test-01', 20
  );

  -- Manually simulate expired time on the server via security definer helper
  perform public._test_backdate_attempt(v_id, 1300);

  begin
    perform public.submit_curriculum_quiz_attempt(v_id, '{}'::jsonb);
    raise exception 'SECURITY FAIL: Expired attempt was accepted!';
  exception when sqlstate '22023' then
    raise notice 'PASS: expired attempt (>1290s) rejected with EXAM_DEADLINE_EXCEEDED (22023)';
  end;
end $$;

-- 4G. Test Cross-User Isolation: User B cannot submit User A's attempt
do $$
declare
  v_id uuid := 'a0000000-0000-4000-8000-000000000003';
begin
  -- User A creates attempt
  insert into public.curriculum_quiz_attempts (
    id, user_id, quiz_id, lesson_id, question_count
  ) values (
    v_id, 'e0000000-0000-0000-0000-000000000001', 'hsk1-unit-test-01', 'hsk1-unit-test-01', 20
  );
end $$;

-- Switch to User B
set local role authenticated;
select set_config('request.jwt.claim.sub', 'e0000000-0000-0000-0000-000000000002', true);

do $$
declare
  v_id uuid := 'a0000000-0000-4000-8000-000000000003';
begin
  begin
    perform public.submit_curriculum_quiz_attempt(v_id, '{}'::jsonb);
    raise exception 'SECURITY FAIL: User B could submit User A attempt!';
  exception when sqlstate 'PT404' then
    raise notice 'PASS: User B blocked from User A attempt with ATTEMPT_NOT_FOUND (PT404)';
  end;
end $$;

rollback;
