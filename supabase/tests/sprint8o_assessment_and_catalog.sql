-- Test suite for Sprint 8O: Assessment Permutation (Migration 0011) & Vocabulary Catalog Sync (Migration 0012)
\set ON_ERROR_STOP on
begin;
set local role postgres;

-- 0. Ensure test learners exist
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

-- 1. Verify Revision 2 balanced answer distribution across all 44 canonical assessment slugs (428 questions)
do $$
declare
  v_total integer;
  v_c0 integer;
  v_c1 integer;
  v_c2 integer;
  v_c3 integer;
  v_v1_c0 integer;
begin
  select
    count(*),
    count(*) filter (where correct_index = 0),
    count(*) filter (where correct_index = 1),
    count(*) filter (where correct_index = 2),
    count(*) filter (where correct_index = 3),
    count(*) filter (where correct_index_v1 = 0)
  into v_total, v_c0, v_c1, v_c2, v_c3, v_v1_c0
  from private.curriculum_quiz_keys
  where quiz_slug ~ '^hsk1-(lesson|checkpoint|unit-test)-[0-9]{2}$';

  if v_total <> 428 then
    raise exception 'FAIL: Expected 428 canonical assessment questions, found %', v_total;
  end if;

  if v_c0 <> 107 or v_c1 <> 107 or v_c2 <> 107 or v_c3 <> 107 then
    raise exception 'FAIL: Expected exact [107, 107, 107, 107] Revision 2 distribution, found [%, %, %, %]', v_c0, v_c1, v_c2, v_c3;
  end if;

  if v_v1_c0 <> 414 then
    raise exception 'FAIL: Expected 414 Revision 1 correct_index_v1=0 baseline preserved, found %', v_v1_c0;
  end if;

  raise notice 'PASS: 428 canonical questions have exact [107, 107, 107, 107] (25%% each) Revision 2 balance and preserved Revision 1 baseline';
end $$;

-- 2. Verify Revision 1 in-flight/historical attempt vs Revision 2 new attempt grading parity
create temp table _sprint8o_key_fixtures as
select
  quiz_slug,
  jsonb_object_agg(question_id, correct_index_v1) as answers_v1,
  jsonb_object_agg(question_id, correct_index) as answers_v2
from private.curriculum_quiz_keys
where quiz_slug in ('hsk1-unit-test-01', 'hsk1-lesson-05')
group by quiz_slug;

grant select on _sprint8o_key_fixtures to authenticated;

-- 2A. Simulate a pre-migration Revision 1 attempt row (key_revision = 1)
select set_config('request.jwt.claim.sub', 'e0000000-0000-0000-0000-000000000001', true);
insert into public.curriculum_quiz_attempts (
  id, user_id, quiz_id, lesson_id, question_count, key_revision
) values (
  'a8000000-0000-4000-8000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  'hsk1-unit-test-01',
  'hsk1-unit-test-01',
  20,
  1
);
-- Force key_revision = 1 as if created prior to migration 0011 cutover
update public.curriculum_quiz_attempts
set key_revision = 1
where id = 'a8000000-0000-4000-8000-000000000001';

set local role authenticated;
select set_config('request.jwt.claim.sub', 'e0000000-0000-0000-0000-000000000001', true);

do $$
declare
  v_ans_v1 jsonb;
  v_ans_v2 jsonb;
  v_res_v1 public.curriculum_quiz_attempts;
  v_res_v2 public.curriculum_quiz_attempts;
  v_res_biased public.curriculum_quiz_attempts;
  v_id_v2 uuid := 'a8000000-0000-4000-8000-000000000002';
  v_id_biased uuid := 'a8000000-0000-4000-8000-000000000003';
begin
  select answers_v1, answers_v2 into v_ans_v1, v_ans_v2
  from _sprint8o_key_fixtures
  where quiz_slug = 'hsk1-unit-test-01';

  -- Submit Revision 1 attempt with Revision 1 answers -> must score 20/20
  v_res_v1 := public.submit_curriculum_quiz_attempt(
    'a8000000-0000-4000-8000-000000000001'::uuid,
    v_ans_v1
  );
  if v_res_v1.correct_count <> 20 or v_res_v1.passed is not true or v_res_v1.key_revision <> 1 then
    raise exception 'FAIL: Revision 1 in-flight attempt grading failed: %', v_res_v1;
  end if;
  raise notice 'PASS: Revision 1 attempt graded accurately against correct_index_v1 (20/20)';

  -- Create and submit Revision 2 attempt with Revision 2 answers -> must score 20/20
  insert into public.curriculum_quiz_attempts (
    id, user_id, quiz_id, lesson_id, question_count
  ) values (
    v_id_v2, 'e0000000-0000-0000-0000-000000000001', 'hsk1-unit-test-01', 'hsk1-unit-test-01', 20
  );

  v_res_v2 := public.submit_curriculum_quiz_attempt(v_id_v2, v_ans_v2);
  if v_res_v2.correct_count <> 20 or v_res_v2.passed is not true or v_res_v2.key_revision <> 2 then
    raise exception 'FAIL: Revision 2 attempt grading failed: %', v_res_v2;
  end if;
  raise notice 'PASS: Revision 2 attempt graded accurately against permuted correct_index (20/20)';

  -- Submitting all-A (Revision 1 answers) to a Revision 2 attempt must only score 5/20 (25%) and FAIL!
  insert into public.curriculum_quiz_attempts (
    id, user_id, quiz_id, lesson_id, question_count
  ) values (
    v_id_biased, 'e0000000-0000-0000-0000-000000000001', 'hsk1-unit-test-01', 'hsk1-unit-test-01', 20
  );

  v_res_biased := public.submit_curriculum_quiz_attempt(v_id_biased, v_ans_v1);
  if v_res_biased.correct_count <> 5 or v_res_biased.passed is not false then
    raise exception 'FAIL: All-A submission on Revision 2 should score 5/20 (failed), got %', v_res_biased.correct_count;
  end if;
  raise notice 'PASS: All-A blind guessing on Revision 2 scores only 5/20 (25%%) and fails';
end $$;

-- 3. Test Vocabulary Catalog Sync (Migration 0012): Pilot ID preservation, 300-word completion, SRS FK integrity & Idempotency
set local role postgres;

insert into public.syllabus_versions (
  id, code, display_name, verified_at, status, review_status, source_uri, content_license, reviewed_by, reviewed_at
) values (
  '8b8b06ff-5563-5a67-9197-9ffc9b25a8f9',
  'HSK-2025-11-HANLEARN-PILOT-V1',
  'HSK 1 Pilot Syllabus',
  clock_timestamp(),
  'published',
  'approved',
  'urn:hanlearn:pilot-hsk1:v1',
  'private-invite-only',
  'owner',
  clock_timestamp()
) on conflict (id) do nothing;

-- Seed 3 representative Pilot v1 rows: '不' (with stale meaning), '好', and supplementary '越南' (not in 300)
insert into public.vocabulary (
  id, simplified, pinyin_marked, meaning_vi, part_of_speech, sense_key, status, review_status, source_uri, content_license, reviewed_by, reviewed_at
) values
  ('df6876e3-e013-584d-b584-64c5d6f29048', '不', 'bù', 'không; trong bài dùng để phủ định 是', 'phó từ', 'pilot-beginner-1', 'published', 'approved', 'urn:hanlearn:pilot:bu', 'private-invite-only', 'owner', clock_timestamp()),
  ('897e5fd5-e644-5a70-ac8c-07c42afbbc8f', '好', 'hǎo', 'tốt; khỏe', 'tính từ', 'pilot-beginner-1', 'published', 'approved', 'urn:hanlearn:pilot:hao', 'private-invite-only', 'owner', clock_timestamp()),
  ('aa4a8f04-c772-54ef-a296-a7fd0a6d37c3', '越南', 'Yuènán', 'Việt Nam (tên quốc gia bổ trợ trong bài)', 'danh từ riêng', 'pilot-beginner-1', 'published', 'approved', 'urn:hanlearn:pilot:yuenan', 'private-invite-only', 'owner', clock_timestamp())
on conflict (id) do nothing;

-- Seed SRS review_cards and review_events referencing Pilot UUID 'df6876e3-e013-584d-b584-64c5d6f29048' ('不')
insert into public.review_cards (
  id, user_id, vocabulary_id, card_type, state, step, interval_days, ease_factor, repetitions, lapses, consecutive_successes, version, last_reviewed_at
) values
  ('c8000000-0000-4000-8000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'df6876e3-e013-584d-b584-64c5d6f29048', 'hanzi_to_vi', 'review', 0, 25, 2.60, 5, 0, 4, 5, clock_timestamp()),
  ('c8000000-0000-4000-8000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'df6876e3-e013-584d-b584-64c5d6f29048', 'vi_to_hanzi', 'review', 0, 25, 2.60, 5, 0, 4, 5, clock_timestamp())
on conflict (id) do nothing;

do $$
declare
  v_run1 jsonb;
  v_run2 jsonb;
  v_bu_meaning text;
  v_zhi_meaning text;
  v_yuenan_count integer;
  v_bu_count integer;
  v_mastery text;
  v_card_interval integer;
begin
  -- Run catalog sync twice to verify idempotency
  v_run1 := private.sync_hsk1_canonical_vocabulary_catalog('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid);
  v_run2 := private.sync_hsk1_canonical_vocabulary_catalog('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid);

  if (v_run1->>'upserted_new_count')::integer <> 257 or (v_run2->>'upserted_new_count')::integer <> 257 then
    raise exception 'FAIL: Expected 257 new HSK 1 words upserted, got run1=% run2=%', v_run1, v_run2;
  end if;

  if (v_run1->>'total_vocabulary_count')::integer <> (v_run2->>'total_vocabulary_count')::integer then
    raise exception 'FAIL: Catalog sync is not idempotent! run1=% run2=%', v_run1, v_run2;
  end if;

  -- Check Pilot UUID for '不' kept its ID and updated its meaning_vi to Sprint 8N/8O canonical definition
  select meaning_vi into v_bu_meaning
  from public.vocabulary
  where id = 'df6876e3-e013-584d-b584-64c5d6f29048';

  if v_bu_meaning <> 'Không (phó từ phủ định); đọc biến điệu là bú trước thanh 4' then
    raise exception 'FAIL: Pilot row 不 meaning was not updated: %', v_bu_meaning;
  end if;

  -- Check no duplicate row was created for '不'
  select count(*) into v_bu_count from public.vocabulary where simplified = '不';
  if v_bu_count <> 1 then
    raise exception 'FAIL: Duplicate rows found for 不: %', v_bu_count;
  end if;

  -- Check '只 (zhī)' was inserted with polyphone disambiguation note
  select meaning_vi into v_zhi_meaning from public.vocabulary where simplified = '只' and pinyin_marked = 'zhī';
  if v_zhi_meaning <> 'con, chiếc (lượng từ cho động vật); phân biệt với phó từ zhǐ (chỉ)' then
    raise exception 'FAIL: Canonical row 只 (zhī) meaning mismatch: %', v_zhi_meaning;
  end if;

  -- Check supplementary Pilot word '越南' was preserved
  select count(*) into v_yuenan_count from public.vocabulary where id = 'aa4a8f04-c772-54ef-a296-a7fd0a6d37c3' and simplified = '越南';
  if v_yuenan_count <> 1 then
    raise exception 'FAIL: Supplementary Pilot row 越南 was not preserved';
  end if;

  -- Check SRS review_cards intervals and vocabulary_progress mastery_state for '不' are 100% preserved
  select interval_days into v_card_interval
  from public.review_cards
  where id = 'c8000000-0000-4000-8000-000000000001';

  if v_card_interval <> 25 then
    raise exception 'FAIL: SRS review_card interval was altered: %', v_card_interval;
  end if;

  select mastery_state into v_mastery
  from public.vocabulary_progress
  where user_id = 'e0000000-0000-0000-0000-000000000001'
    and vocabulary_id = 'df6876e3-e013-584d-b584-64c5d6f29048';

  if v_mastery <> 'mastered' then
    raise exception 'FAIL: vocabulary_progress mastery_state for Pilot UUID 不 was broken: %', v_mastery;
  end if;

  raise notice 'PASS: Catalog sync is idempotent, preserves Pilot UUIDs, updates meanings, inserts 257 new words, and keeps SRS cards/mastery intact';
end $$;

rollback;
