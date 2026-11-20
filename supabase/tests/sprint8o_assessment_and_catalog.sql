-- Test suite for Sprint 8O: Assessment Permutation (Migration 0011), Vocabulary Catalog Sync (Migration 0012) & Full Cloud-Equivalent Rehearsal
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

-- 1. Verify Revision 2 balanced answer distribution across all 44 canonical assessment slugs (428 questions, 1,284 key rows)
do $$
declare
  v_total_canonical integer;
  v_total_all_rows integer;
  v_c0 integer;
  v_c1 integer;
  v_c2 integer;
  v_c3 integer;
  v_v1_c0 integer;
  v_bad_8q integer;
  v_bad_ut integer;
begin
  select count(*) into v_total_all_rows from private.curriculum_quiz_keys;
  if v_total_all_rows <> 1284 then
    raise exception 'FAIL: Expected 1,284 total rows in private.curriculum_quiz_keys, found %', v_total_all_rows;
  end if;

  select
    count(*),
    count(*) filter (where correct_index = 0),
    count(*) filter (where correct_index = 1),
    count(*) filter (where correct_index = 2),
    count(*) filter (where correct_index = 3),
    count(*) filter (where correct_index_v1 = 0)
  into v_total_canonical, v_c0, v_c1, v_c2, v_c3, v_v1_c0
  from private.curriculum_quiz_keys
  where quiz_slug ~ '^hsk1-(lesson|checkpoint|unit-test)-[0-9]{2}$';

  if v_total_canonical <> 428 then
    raise exception 'FAIL: Expected 428 canonical assessment questions, found %', v_total_canonical;
  end if;

  if v_c0 <> 107 or v_c1 <> 107 or v_c2 <> 107 or v_c3 <> 107 then
    raise exception 'FAIL: Expected exact [107, 107, 107, 107] Revision 2 distribution, found [%, %, %, %]', v_c0, v_c1, v_c2, v_c3;
  end if;

  if v_v1_c0 <> 414 then
    raise exception 'FAIL: Expected 414 Revision 1 correct_index_v1=0 baseline preserved, found %', v_v1_c0;
  end if;

  -- Check every 8-question quiz (36 quizzes) has exact [2, 2, 2, 2]
  select count(*) into v_bad_8q
  from (
    select
      quiz_slug,
      count(*) as q_cnt,
      count(*) filter (where correct_index = 0) as a_cnt,
      count(*) filter (where correct_index = 1) as b_cnt,
      count(*) filter (where correct_index = 2) as c_cnt,
      count(*) filter (where correct_index = 3) as d_cnt
    from private.curriculum_quiz_keys
    where quiz_slug ~ '^hsk1-(lesson|checkpoint)-[0-9]{2}$'
    group by quiz_slug
  ) s
  where s.q_cnt = 8 and (s.a_cnt <> 2 or s.b_cnt <> 2 or s.c_cnt <> 2 or s.d_cnt <> 2);

  if v_bad_8q <> 0 then
    raise exception 'FAIL: Found % 8-question quizzes without exact [2,2,2,2] distribution', v_bad_8q;
  end if;

  -- Check every 20-question Unit Test (6 unit tests) has exact [5, 5, 5, 5]
  select count(*) into v_bad_ut
  from (
    select
      quiz_slug,
      count(*) as q_cnt,
      count(*) filter (where correct_index = 0) as a_cnt,
      count(*) filter (where correct_index = 1) as b_cnt,
      count(*) filter (where correct_index = 2) as c_cnt,
      count(*) filter (where correct_index = 3) as d_cnt
    from private.curriculum_quiz_keys
    where quiz_slug ~ '^hsk1-unit-test-[0-9]{2}$'
    group by quiz_slug
  ) s
  where s.q_cnt <> 20 or s.a_cnt <> 5 or s.b_cnt <> 5 or s.c_cnt <> 5 or s.d_cnt <> 5;

  if v_bad_ut <> 0 then
    raise exception 'FAIL: Found % Unit Tests without exact [5,5,5,5] distribution', v_bad_ut;
  end if;

  raise notice 'PASS: 1,284 key rows / 428 canonical questions have exact [107, 107, 107, 107] balance and per-quiz [2,2,2,2] / [5,5,5,5] balance';
end $$;

-- 2. Rehearse 33 Cloud-Equivalent Quiz Attempts (20 submitted + 13 unfinished) & 4-State Version Skew (States C & D + In-Flight)
create temp table _sprint8o_key_fixtures as
select
  quiz_slug,
  jsonb_object_agg(question_id, correct_index_v1) as answers_v1,
  jsonb_object_agg(question_id, correct_index) as answers_v2
from private.curriculum_quiz_keys
where quiz_slug in ('hsk1-unit-test-01', 'hsk1-lesson-05')
group by quiz_slug;

grant select on _sprint8o_key_fixtures to authenticated;

select set_config('request.jwt.claim.sub', 'e0000000-0000-0000-0000-000000000001', true);

-- Seed 33 historical curriculum_quiz_attempts rows (20 submitted + 13 unfinished, all key_revision = 1)
do $$
declare
  v_ans_v1 jsonb;
  i integer;
  v_att_id uuid;
begin
  select answers_v1 into v_ans_v1 from _sprint8o_key_fixtures where quiz_slug = 'hsk1-unit-test-01';

  -- Insert 20 historical submitted attempts (key_revision = 1)
  for i in 1..20 loop
    v_att_id := ('a8000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid;
    insert into public.curriculum_quiz_attempts (
      id, user_id, quiz_id, lesson_id, started_at, submitted_at, correct_count, question_count, passed, answers, key_revision
    ) values (
      v_att_id,
      'e0000000-0000-0000-0000-000000000001'::uuid,
      'hsk1-unit-test-01',
      'hsk1-unit-test-01',
      clock_timestamp() - interval '2 days',
      clock_timestamp() - interval '2 days' + interval '5 minutes',
      20,
      20,
      true,
      v_ans_v1,
      1
    );
    -- Restore submitted state (since BEFORE INSERT trigger stamps new rows as unsubmitted)
    update public.curriculum_quiz_attempts
    set
      started_at = clock_timestamp() - interval '2 days',
      submitted_at = clock_timestamp() - interval '2 days' + interval '5 minutes',
      correct_count = 20,
      passed = true,
      answers = v_ans_v1,
      key_revision = 1
    where id = v_att_id;
  end loop;

  -- Insert 13 historical unfinished attempts (key_revision = 1, submitted_at = null)
  for i in 21..33 loop
    v_att_id := ('a8000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid;
    insert into public.curriculum_quiz_attempts (
      id, user_id, quiz_id, lesson_id, question_count, key_revision
    ) values (
      v_att_id,
      'e0000000-0000-0000-0000-000000000001'::uuid,
      'hsk1-unit-test-01',
      'hsk1-unit-test-01',
      20,
      1
    );
    update public.curriculum_quiz_attempts
    set
      user_id = 'e0000000-0000-0000-0000-000000000001'::uuid,
      key_revision = 1
    where id = v_att_id;
  end loop;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', 'e0000000-0000-0000-0000-000000000001', true);

do $$
declare
  v_ans_v1 jsonb;
  v_ans_v2 jsonb;
  v_res_inflight public.curriculum_quiz_attempts;
  v_res_old_app_new_db public.curriculum_quiz_attempts;
  v_res_new_app_new_db public.curriculum_quiz_attempts;
  v_res_biased public.curriculum_quiz_attempts;
  v_id_old_app uuid := 'a8000000-0000-4000-8000-000000000101';
  v_id_new_app uuid := 'a8000000-0000-4000-8000-000000000102';
  v_id_biased uuid := 'a8000000-0000-4000-8000-000000000103';
  v_total_33 integer;
  v_unfinished_13 integer;
begin
  select count(*), count(*) filter (where submitted_at is null)
  into v_total_33, v_unfinished_13
  from public.curriculum_quiz_attempts
  where id::text like 'a8000000-0000-4000-8000-0000000000%';

  if v_total_33 <> 33 or v_unfinished_13 <> 13 then
    raise exception 'FAIL: Expected 33 seeded attempts (13 unfinished), found total=% unfinished=%', v_total_33, v_unfinished_13;
  end if;

  select answers_v1, answers_v2 into v_ans_v1, v_ans_v2
  from _sprint8o_key_fixtures
  where quiz_slug = 'hsk1-unit-test-01';

  -- 2A. In-Flight Transition: Submit one of the 13 unfinished Revision 1 attempts (#33) after Migration 0011 -> must score 20/20
  v_res_inflight := public.submit_curriculum_quiz_attempt(
    'a8000000-0000-4000-8000-000000000033'::uuid,
    v_ans_v1
  );
  if v_res_inflight.correct_count <> 20 or v_res_inflight.passed is not true or v_res_inflight.key_revision <> 1 then
    raise exception 'FAIL: In-flight Revision 1 attempt (#33) grading failed: %', v_res_inflight;
  end if;

  -- 2B. State C (Old App + New DB): Old App inserts attempt WITHOUT key_revision column -> must default to key_revision = 1 and grade against correct_index_v1!
  insert into public.curriculum_quiz_attempts (
    id, user_id, quiz_id, lesson_id, question_count
  ) values (
    v_id_old_app, 'e0000000-0000-0000-0000-000000000001', 'hsk1-unit-test-01', 'hsk1-unit-test-01', 20
  );

  v_res_old_app_new_db := public.submit_curriculum_quiz_attempt(v_id_old_app, v_ans_v1);
  if v_res_old_app_new_db.key_revision <> 1 or v_res_old_app_new_db.correct_count <> 20 or v_res_old_app_new_db.passed is not true then
    raise exception 'FAIL: State C (Old App + New DB) attempt should default to key_revision=1 and score 20/20, got %', v_res_old_app_new_db;
  end if;
  raise notice 'PASS: State C (Old App + New DB) pins default key_revision=1 and grades Revision 1 answers 20/20';

  -- 2C. State D (New App + New DB): New App explicitly inserts key_revision = 2 -> grades against Revision 2 correct_index (20/20)
  insert into public.curriculum_quiz_attempts (
    id, user_id, quiz_id, lesson_id, question_count, key_revision
  ) values (
    v_id_new_app, 'e0000000-0000-0000-0000-000000000001', 'hsk1-unit-test-01', 'hsk1-unit-test-01', 20, 2
  );

  v_res_new_app_new_db := public.submit_curriculum_quiz_attempt(v_id_new_app, v_ans_v2);
  if v_res_new_app_new_db.key_revision <> 2 or v_res_new_app_new_db.correct_count <> 20 or v_res_new_app_new_db.passed is not true then
    raise exception 'FAIL: State D (New App + New DB) attempt should have key_revision=2 and score 20/20, got %', v_res_new_app_new_db;
  end if;
  raise notice 'PASS: State D (New App + New DB) pins key_revision=2 and grades Revision 2 answers 20/20';

  -- 2D. Submitting all-A (Revision 1 answers) to a Revision 2 attempt must only score 5/20 (25%) and FAIL!
  insert into public.curriculum_quiz_attempts (
    id, user_id, quiz_id, lesson_id, question_count, key_revision
  ) values (
    v_id_biased, 'e0000000-0000-0000-0000-000000000001', 'hsk1-unit-test-01', 'hsk1-unit-test-01', 20, 2
  );

  v_res_biased := public.submit_curriculum_quiz_attempt(v_id_biased, v_ans_v1);
  if v_res_biased.correct_count <> 5 or v_res_biased.passed is not false then
    raise exception 'FAIL: All-A submission on Revision 2 should score 5/20 (failed), got %', v_res_biased.correct_count;
  end if;
  raise notice 'PASS: All-A blind guessing on Revision 2 scores only 5/20 (25%%) and fails';
end $$;

-- 3. Full Cloud-Equivalent Rehearsal for Migration 0012:
--    44 Pilot vocabulary rows (43 HSK1 + 1 越南), 43 syllabus_vocabulary, 44 review_cards, 79 review_events
set local role postgres;

-- Isolate catalog rehearsal from earlier contract fixture rows while keeping schema intact
set local hanlearn.account_erasure = 'on';
delete from public.card_lifecycle_events;
delete from public.review_events;
delete from public.review_cards;
delete from public.lesson_vocabulary;
delete from public.syllabus_vocabulary;
delete from public.vocabulary;
set local hanlearn.account_erasure = 'off';

insert into public.syllabus_versions (
  id, code, display_name, verified_at, status, review_status, source_uri, content_license, reviewed_by, reviewed_at
) values (
  '8b8b06ff-5563-5a67-9197-9ffc9b25a8f9',
  'HSK-2025-11-HANLEARN-PILOT-V1',
  'HSK 1 Pilot Syllabus',
  '2026-11-13T11:17:00.9254753+07:00'::timestamptz,
  'published',
  'approved',
  'urn:hanlearn:pilot-hsk1:v1:syllabus',
  'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.',
  'Owner — experimental personal-use acceptance (identity retained in existing private record)',
  '2026-11-13T11:17:00.9254753+07:00'::timestamptz
) on conflict (id) do nothing;

-- Seed all 44 Pilot v1 vocabulary rows (exact IDs and pre-migration Pilot definitions)
insert into public.vocabulary (
  id, simplified, pinyin_marked, meaning_vi, part_of_speech, sense_key, example_zh, example_pinyin, example_vi, status, review_status, source_uri, content_license, reviewed_by, reviewed_at
) values
  ('04c5a876-74d3-5b7d-9cde-416352dcd276'::uuid, '你', 'nǐ', 'bạn; cậu (đại từ ngôi hai)', 'đại từ', 'pilot-beginner-1', '你好！', 'Nǐ hǎo!', 'Xin chào!', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:你', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('897e5fd5-e644-5a70-ac8c-07c42afbbc8f'::uuid, '好', 'hǎo', 'tốt; khỏe; ổn (nghĩa dùng trong lời hỏi thăm)', 'tính từ', 'pilot-beginner-1', '我很好。', 'Wǒ hěn hǎo.', 'Tôi khỏe.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:好', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('cce00807-ca0f-59fe-acbe-81d6744583c0'::uuid, '吗', 'ma', 'trợ từ cuối câu hỏi có/không', 'trợ từ', 'pilot-beginner-1', '你好吗？', 'Nǐ hǎo ma?', 'Bạn có khỏe không?', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:吗', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('fb146dc3-9976-50a8-93dd-b0789c7256e1'::uuid, '很', 'hěn', 'rất; trong câu tính từ đơn giản có thể không nhấn mạnh mức độ', 'phó từ', 'pilot-beginner-1', '我很好。', 'Wǒ hěn hǎo.', 'Tôi khỏe.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:很', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('8ae98d4e-69f1-54c1-ba0b-bc28c69f903b'::uuid, '我', 'wǒ', 'tôi; mình', 'đại từ', 'pilot-beginner-1', '我很好。', 'Wǒ hěn hǎo.', 'Tôi khỏe.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:我', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('29771f36-43ad-5f67-bf22-a8fc61f82896'::uuid, '谢谢', 'xièxie', 'cảm ơn', 'động từ', 'pilot-beginner-1', '谢谢你！', 'Xièxie nǐ!', 'Cảm ơn bạn!', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:谢谢', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('4b0c6509-4af7-53e6-92bb-51b68cc8285b'::uuid, '再见', 'zàijiàn', 'tạm biệt; hẹn gặp lại', 'lời chào', 'pilot-beginner-1', '再见！', 'Zàijiàn!', 'Tạm biệt!', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:再见', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('bccefc87-a163-5bde-b48a-438de4aa4986'::uuid, '呢', 'ne', 'trợ từ dùng trong mẫu hỏi tiếp ''còn ... thì sao?''', 'trợ từ', 'pilot-beginner-1', '我很好，你呢？', 'Wǒ hěn hǎo, nǐ ne?', 'Tôi khỏe, còn bạn?', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:呢', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('169b7623-b96a-5447-940b-f54efd6e2547'::uuid, '叫', 'jiào', 'mang tên; dùng trong mẫu giới thiệu tên 我叫…', 'động từ', 'pilot-beginner-1', '我叫小明。', 'Wǒ jiào Xiǎomíng.', 'Tôi tên là Tiểu Minh (nhân vật hư cấu).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:叫', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('f49235d6-fdb0-58cf-89cf-b7af56a5a44b'::uuid, '什么', 'shénme', 'gì; cái gì', 'đại từ nghi vấn', 'pilot-beginner-1', '你叫什么名字？', 'Nǐ jiào shénme míngzi?', 'Bạn tên là gì?', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:什么', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('eb4ddeb1-4d84-52d7-a951-9837dea7bb44'::uuid, '名字', 'míngzi', 'tên', 'danh từ', 'pilot-beginner-1', '你叫什么名字？', 'Nǐ jiào shénme míngzi?', 'Bạn tên là gì?', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:名字', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('ce52e655-b0aa-5915-b790-63712a3180bd'::uuid, '是', 'shì', 'là (xác định danh tính hoặc loại)', 'động từ', 'pilot-beginner-1', '我是越南人。', 'Wǒ shì Yuènán rén.', 'Tôi là người Việt Nam.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:是', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('ce2949af-3761-5a54-8a8b-8dbf2275bbd4'::uuid, '人', 'rén', 'người', 'danh từ', 'pilot-beginner-1', '我是中国人。', 'Wǒ shì Zhōngguó rén.', 'Tôi là người Trung Quốc.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:人', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('d610982b-750e-5c68-b58e-4ae39f8badaf'::uuid, '中国', 'Zhōngguó', 'Trung Quốc', 'danh từ riêng', 'pilot-beginner-1', '我不是中国人。', 'Wǒ bú shì Zhōngguó rén.', 'Tôi không phải người Trung Quốc.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:中国', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('aa4a8f04-c772-54ef-a296-a7fd0a6d37c3'::uuid, '越南', 'Yuènán', 'Việt Nam (tên quốc gia bổ trợ trong bài)', 'danh từ riêng bổ trợ', 'pilot-beginner-1', '我是越南人。', 'Wǒ shì Yuènán rén.', 'Tôi là người Việt Nam.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:越南', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('d3550460-986b-55cf-8138-fe4a18985944'::uuid, '汉语', 'Hànyǔ', 'tiếng Hán; tiếng Trung', 'danh từ', 'pilot-beginner-1', '我学习汉语。', 'Wǒ xuéxí Hànyǔ.', 'Tôi học tiếng Trung.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:汉语', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('3c264a8e-b7c4-5840-a799-f465fcd4fa6f'::uuid, '学习', 'xuéxí', 'học; học tập', 'động từ', 'pilot-beginner-1', '我学习汉语。', 'Wǒ xuéxí Hànyǔ.', 'Tôi học tiếng Trung.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:学习', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('df6876e3-e013-584d-b584-64c5d6f29048'::uuid, '不', 'bù', 'không; trong bài dùng để phủ định 是', 'phó từ', 'pilot-beginner-1', '我不是中国人。', 'Wǒ bú shì Zhōngguó rén.', 'Tôi không phải người Trung Quốc.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:不', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('81ce53a0-5394-5278-81fe-c67961c8c34d'::uuid, '家', 'jiā', 'gia đình (nghĩa dùng trong bài); còn có nghĩa nhà, tùy ngữ cảnh', 'danh từ', 'pilot-beginner-1', '我的家', 'Wǒ de jiā', 'Gia đình của tôi (cụm danh từ).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:家', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('a6c5e400-0154-5884-9810-f8245adfce8e'::uuid, '的', 'de', 'trợ từ nối người sở hữu với danh từ', 'trợ từ', 'pilot-beginner-1', '我的妈妈', 'Wǒ de māma', 'Mẹ của tôi (cụm danh từ).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:的', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('8d613286-431b-5f14-8ed7-e45ca0178168'::uuid, '有', 'yǒu', 'có', 'động từ', 'pilot-beginner-1', '我有一个哥哥。', 'Wǒ yǒu yí ge gēge.', 'Tôi có một anh trai.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:有', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('a5b9ce23-a21a-59e7-9975-0a9c973d63ad'::uuid, '几', 'jǐ', 'mấy; bao nhiêu (thường hỏi số lượng nhỏ)', 'đại từ nghi vấn', 'pilot-beginner-1', '你家有几口人？', 'Nǐ jiā yǒu jǐ kǒu rén?', 'Gia đình bạn có mấy người?', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:几', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('7dec5724-9256-5404-8938-647c52f6f504'::uuid, '口', 'kǒu', 'lượng từ đếm người trong gia đình, ở cách dùng của bài', 'lượng từ', 'pilot-beginner-1', '我家有三口人。', 'Wǒ jiā yǒu sān kǒu rén.', 'Gia đình tôi có ba người.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:口', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('a1c65d77-b773-5f55-a5ed-c44dc908e6c0'::uuid, '爸爸', 'bàba', 'bố; ba', 'danh từ', 'pilot-beginner-1', '我爸爸很好。', 'Wǒ bàba hěn hǎo.', 'Bố tôi khỏe.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:爸爸', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('29784008-ba30-53e7-9f9d-04c98583dc51'::uuid, '妈妈', 'māma', 'mẹ; má', 'danh từ', 'pilot-beginner-1', '我妈妈很好。', 'Wǒ māma hěn hǎo.', 'Mẹ tôi khỏe.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:妈妈', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('ed41c330-70ca-5535-8bdb-8b19b661bd11'::uuid, '哥哥', 'gēge', 'anh trai (lớn tuổi hơn mình)', 'danh từ', 'pilot-beginner-1', '我的哥哥', 'Wǒ de gēge', 'Anh trai của tôi (cụm danh từ).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:哥哥', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('09dc1b31-fa1c-5727-8eb5-79cbd86b5a89'::uuid, '姐姐', 'jiějie', 'chị gái (lớn tuổi hơn mình)', 'danh từ', 'pilot-beginner-1', '我的姐姐', 'Wǒ de jiějie', 'Chị gái của tôi (cụm danh từ).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:姐姐', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('2aa17a86-f44e-5af2-87e3-32eb104bf7f5'::uuid, '和', 'hé', 'và (nối danh từ/cụm danh từ trong bài)', 'liên từ', 'pilot-beginner-1', '爸爸和妈妈', 'Bàba hé māma', 'Bố và mẹ (cụm danh từ).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:和', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('0ed1f027-db68-53f8-b6db-53bb833bdbbb'::uuid, '一', 'yī', 'một; trong 一个 đọc biến điệu yí ge', 'số từ', 'pilot-beginner-1', '一个人', 'Yí ge rén', 'Một người (cụm danh từ).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:一', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('ed5ea8de-bd9e-5674-adfe-03c941ac6326'::uuid, '二', 'èr', 'hai khi đếm hoặc đọc số; phân biệt với 两 trước lượng từ', 'số từ', 'pilot-beginner-1', '一、二、三。', 'Yī, èr, sān.', 'Một, hai, ba (đếm số).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:二', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('a925741e-b594-59dc-8a10-ee8600a4caad'::uuid, '三', 'sān', 'ba', 'số từ', 'pilot-beginner-1', '我有三个姐姐。', 'Wǒ yǒu sān ge jiějie.', 'Tôi có ba chị gái (tình huống giả định độc lập).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:三', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('cdf09665-aaf2-5aad-8697-073a91f5ddaa'::uuid, '个', 'gè', 'lượng từ thông dụng; thường đọc nhẹ ge trong ví dụ của bài', 'lượng từ', 'pilot-beginner-1', '我有一个姐姐。', 'Wǒ yǒu yí ge jiějie.', 'Tôi có một chị gái.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:个', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('30dd26d7-593c-5002-b3de-e1fd35b87562'::uuid, '两', 'liǎng', 'hai, dùng trước lượng từ ở các mẫu được học', 'số từ', 'pilot-beginner-1', '我有两个姐姐。', 'Wǒ yǒu liǎng ge jiějie.', 'Tôi có hai chị gái.', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:两', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('14303981-2984-5515-8609-95898457dd7c'::uuid, '今天', 'jīntiān', 'hôm nay', 'danh từ thời gian', 'pilot-beginner-1', '今天星期三。', 'Jīntiān xīngqīsān.', 'Hôm nay là thứ Tư (tình huống giả định).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:今天', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('0f23d9ef-ed12-5186-a65a-8bc3a350f4b0'::uuid, '星期', 'xīngqī', 'tuần; dùng để nói thứ trong tuần', 'danh từ', 'pilot-beginner-1', '今天星期几？', 'Jīntiān xīngqī jǐ?', 'Hôm nay là thứ mấy?', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:星期', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('ad545a62-ac16-5d78-ac42-377f56bc4716'::uuid, '四', 'sì', 'bốn', 'số từ', 'pilot-beginner-1', '现在四点。', 'Xiànzài sì diǎn.', 'Bây giờ là bốn giờ (tình huống giả định).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:四', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('0253f3c8-fe61-55ac-9cb1-16fc9666484a'::uuid, '五', 'wǔ', 'năm', 'số từ', 'pilot-beginner-1', '五月三号', 'Wǔ yuè sān hào', 'Ngày ba tháng năm (cụm chỉ ngày).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:五', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('92bb88c4-2ec0-5692-8c10-cfd92fdd7236'::uuid, '六', 'liù', 'sáu', 'số từ', 'pilot-beginner-1', '今天星期六。', 'Jīntiān xīngqīliù.', 'Hôm nay là thứ Bảy (tình huống giả định).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:六', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('1c06f13a-f7a7-578d-97fe-fa27691960e3'::uuid, '七', 'qī', 'bảy; không dùng 星期七 để nói Chủ nhật', 'số từ', 'pilot-beginner-1', '七月一号', 'Qī yuè yī hào', 'Ngày một tháng bảy (cụm chỉ ngày).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:七', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('d2e5ae40-9d1c-5436-99a4-0403d8a7a4fc'::uuid, '月', 'yuè', 'tháng (trong cách nói ngày tháng)', 'danh từ/chỉ thời gian', 'pilot-beginner-1', '二月三号', 'Èr yuè sān hào', 'Ngày ba tháng hai (cụm chỉ ngày).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:月', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('e1833506-f5f1-50bd-9fd2-db12b5116daf'::uuid, '号', 'hào', 'ngày trong tháng, cách nói thông dụng', 'lượng từ thời gian', 'pilot-beginner-1', '今天几月几号？', 'Jīntiān jǐ yuè jǐ hào?', 'Hôm nay là ngày mấy tháng mấy?', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:号', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('868d7848-c3ba-5927-bd3b-d2e5a9cca96e'::uuid, '现在', 'xiànzài', 'bây giờ; hiện tại', 'danh từ thời gian', 'pilot-beginner-1', '现在几点？', 'Xiànzài jǐ diǎn?', 'Bây giờ là mấy giờ?', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:现在', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('a0c51256-1682-5c09-9736-7996bd8293f2'::uuid, '点', 'diǎn', 'giờ; đơn vị chỉ giờ ở các mẫu thời gian của bài', 'lượng từ thời gian', 'pilot-beginner-1', '现在两点。', 'Xiànzài liǎng diǎn.', 'Bây giờ là hai giờ (tình huống giả định).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:点', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz),
  ('c390f103-ab57-531b-808b-e1c734509c22'::uuid, '天', 'tiān', 'ngày; trong cụm 星期天, cả cụm chỉ Chủ nhật, không dịch tách từng chữ', 'danh từ/chỉ thời gian', 'pilot-beginner-1', '今天星期天。', 'Jīntiān xīngqītiān.', 'Hôm nay là Chủ nhật (tình huống giả định).', 'published', 'approved', 'urn:hanlearn:pilot-hsk1:v1:word:天', 'PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.', 'Owner — experimental personal-use acceptance (identity retained in existing private record)', '2026-11-13T11:17:00.9254753+07:00'::timestamptz)
on conflict (id) do nothing;

-- Seed 43 Pilot syllabus_vocabulary rows (excluding supplementary 越南)
insert into public.syllabus_vocabulary (syllabus_id, vocabulary_id, introduced_level)
values
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '04c5a876-74d3-5b7d-9cde-416352dcd276'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '897e5fd5-e644-5a70-ac8c-07c42afbbc8f'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'cce00807-ca0f-59fe-acbe-81d6744583c0'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'fb146dc3-9976-50a8-93dd-b0789c7256e1'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '8ae98d4e-69f1-54c1-ba0b-bc28c69f903b'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '29771f36-43ad-5f67-bf22-a8fc61f82896'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '4b0c6509-4af7-53e6-92bb-51b68cc8285b'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'bccefc87-a163-5bde-b48a-438de4aa4986'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '169b7623-b96a-5447-940b-f54efd6e2547'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'f49235d6-fdb0-58cf-89cf-b7af56a5a44b'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'eb4ddeb1-4d84-52d7-a951-9837dea7bb44'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'ce52e655-b0aa-5915-b790-63712a3180bd'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'ce2949af-3761-5a54-8a8b-8dbf2275bbd4'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'd610982b-750e-5c68-b58e-4ae39f8badaf'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'd3550460-986b-55cf-8138-fe4a18985944'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '3c264a8e-b7c4-5840-a799-f465fcd4fa6f'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'df6876e3-e013-584d-b584-64c5d6f29048'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '81ce53a0-5394-5278-81fe-c67961c8c34d'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'a6c5e400-0154-5884-9810-f8245adfce8e'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '8d613286-431b-5f14-8ed7-e45ca0178168'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'a5b9ce23-a21a-59e7-9975-0a9c973d63ad'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '7dec5724-9256-5404-8938-647c52f6f504'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'a1c65d77-b773-5f55-a5ed-c44dc908e6c0'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '29784008-ba30-53e7-9f9d-04c98583dc51'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'ed41c330-70ca-5535-8bdb-8b19b661bd11'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '09dc1b31-fa1c-5727-8eb5-79cbd86b5a89'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '2aa17a86-f44e-5af2-87e3-32eb104bf7f5'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '0ed1f027-db68-53f8-b6db-53bb833bdbbb'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'ed5ea8de-bd9e-5674-adfe-03c941ac6326'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'a925741e-b594-59dc-8a10-ee8600a4caad'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'cdf09665-aaf2-5aad-8697-073a91f5ddaa'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '30dd26d7-593c-5002-b3de-e1fd35b87562'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '14303981-2984-5515-8609-95898457dd7c'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '0f23d9ef-ed12-5186-a65a-8bc3a350f4b0'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'ad545a62-ac16-5d78-ac42-377f56bc4716'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '0253f3c8-fe61-55ac-9cb1-16fc9666484a'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '92bb88c4-2ec0-5692-8c10-cfd92fdd7236'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '1c06f13a-f7a7-578d-97fe-fa27691960e3'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'd2e5ae40-9d1c-5436-99a4-0403d8a7a4fc'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'e1833506-f5f1-50bd-9fd2-db12b5116daf'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, '868d7848-c3ba-5927-bd3b-d2e5a9cca96e'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'a0c51256-1682-5c09-9736-7996bd8293f2'::uuid, 1),
  ('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid, 'c390f103-ab57-531b-808b-e1c734509c22'::uuid, 1)
on conflict do nothing;

-- Seed 44 review_cards (22 Pilot words x 2 card types)
insert into public.review_cards (
  id, user_id, vocabulary_id, card_type, state, step, interval_days, ease_factor, repetitions, lapses, consecutive_successes, version, last_reviewed_at, due_at
) values
  ('c8000000-0000-4000-8000-000000000001'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '04c5a876-74d3-5b7d-9cde-416352dcd276'::uuid, 'hanzi_to_vi', 'review', 0, 25, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000002'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '04c5a876-74d3-5b7d-9cde-416352dcd276'::uuid, 'vi_to_hanzi', 'review', 0, 25, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000003'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '897e5fd5-e644-5a70-ac8c-07c42afbbc8f'::uuid, 'hanzi_to_vi', 'review', 0, 26, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000004'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '897e5fd5-e644-5a70-ac8c-07c42afbbc8f'::uuid, 'vi_to_hanzi', 'review', 0, 26, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000005'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'cce00807-ca0f-59fe-acbe-81d6744583c0'::uuid, 'hanzi_to_vi', 'review', 0, 27, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000006'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'cce00807-ca0f-59fe-acbe-81d6744583c0'::uuid, 'vi_to_hanzi', 'review', 0, 27, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000007'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'fb146dc3-9976-50a8-93dd-b0789c7256e1'::uuid, 'hanzi_to_vi', 'review', 0, 28, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000008'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'fb146dc3-9976-50a8-93dd-b0789c7256e1'::uuid, 'vi_to_hanzi', 'review', 0, 28, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000009'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '8ae98d4e-69f1-54c1-ba0b-bc28c69f903b'::uuid, 'hanzi_to_vi', 'review', 0, 29, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000010'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '8ae98d4e-69f1-54c1-ba0b-bc28c69f903b'::uuid, 'vi_to_hanzi', 'review', 0, 29, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000011'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '29771f36-43ad-5f67-bf22-a8fc61f82896'::uuid, 'hanzi_to_vi', 'review', 0, 30, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000012'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '29771f36-43ad-5f67-bf22-a8fc61f82896'::uuid, 'vi_to_hanzi', 'review', 0, 30, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000013'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '4b0c6509-4af7-53e6-92bb-51b68cc8285b'::uuid, 'hanzi_to_vi', 'review', 0, 31, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000014'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '4b0c6509-4af7-53e6-92bb-51b68cc8285b'::uuid, 'vi_to_hanzi', 'review', 0, 31, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000015'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'bccefc87-a163-5bde-b48a-438de4aa4986'::uuid, 'hanzi_to_vi', 'review', 0, 32, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000016'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'bccefc87-a163-5bde-b48a-438de4aa4986'::uuid, 'vi_to_hanzi', 'review', 0, 32, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000017'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '169b7623-b96a-5447-940b-f54efd6e2547'::uuid, 'hanzi_to_vi', 'review', 0, 33, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000018'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '169b7623-b96a-5447-940b-f54efd6e2547'::uuid, 'vi_to_hanzi', 'review', 0, 33, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000019'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'f49235d6-fdb0-58cf-89cf-b7af56a5a44b'::uuid, 'hanzi_to_vi', 'review', 0, 34, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000020'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'f49235d6-fdb0-58cf-89cf-b7af56a5a44b'::uuid, 'vi_to_hanzi', 'review', 0, 34, 2.50, 5, 0, 4, 5, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000021'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'eb4ddeb1-4d84-52d7-a951-9837dea7bb44'::uuid, 'hanzi_to_vi', 'review', 0, 17, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000022'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'eb4ddeb1-4d84-52d7-a951-9837dea7bb44'::uuid, 'vi_to_hanzi', 'review', 0, 17, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000023'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'ce52e655-b0aa-5915-b790-63712a3180bd'::uuid, 'hanzi_to_vi', 'review', 0, 18, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000024'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'ce52e655-b0aa-5915-b790-63712a3180bd'::uuid, 'vi_to_hanzi', 'review', 0, 18, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000025'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'ce2949af-3761-5a54-8a8b-8dbf2275bbd4'::uuid, 'hanzi_to_vi', 'review', 0, 19, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000026'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'ce2949af-3761-5a54-8a8b-8dbf2275bbd4'::uuid, 'vi_to_hanzi', 'review', 0, 19, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000027'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'd610982b-750e-5c68-b58e-4ae39f8badaf'::uuid, 'hanzi_to_vi', 'review', 0, 20, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000028'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'd610982b-750e-5c68-b58e-4ae39f8badaf'::uuid, 'vi_to_hanzi', 'review', 0, 20, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000029'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'd3550460-986b-55cf-8138-fe4a18985944'::uuid, 'hanzi_to_vi', 'review', 0, 21, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000030'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'd3550460-986b-55cf-8138-fe4a18985944'::uuid, 'vi_to_hanzi', 'review', 0, 21, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000031'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '3c264a8e-b7c4-5840-a799-f465fcd4fa6f'::uuid, 'hanzi_to_vi', 'review', 0, 22, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000032'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '3c264a8e-b7c4-5840-a799-f465fcd4fa6f'::uuid, 'vi_to_hanzi', 'review', 0, 22, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000033'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'df6876e3-e013-584d-b584-64c5d6f29048'::uuid, 'hanzi_to_vi', 'review', 0, 23, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000034'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'df6876e3-e013-584d-b584-64c5d6f29048'::uuid, 'vi_to_hanzi', 'review', 0, 23, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000035'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '81ce53a0-5394-5278-81fe-c67961c8c34d'::uuid, 'hanzi_to_vi', 'review', 0, 24, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000036'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '81ce53a0-5394-5278-81fe-c67961c8c34d'::uuid, 'vi_to_hanzi', 'review', 0, 24, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000037'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'a6c5e400-0154-5884-9810-f8245adfce8e'::uuid, 'hanzi_to_vi', 'learning', 1, 0, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000038'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'a6c5e400-0154-5884-9810-f8245adfce8e'::uuid, 'vi_to_hanzi', 'learning', 1, 0, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000039'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '8d613286-431b-5f14-8ed7-e45ca0178168'::uuid, 'hanzi_to_vi', 'learning', 1, 0, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000040'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '8d613286-431b-5f14-8ed7-e45ca0178168'::uuid, 'vi_to_hanzi', 'learning', 1, 0, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000041'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'a5b9ce23-a21a-59e7-9975-0a9c973d63ad'::uuid, 'hanzi_to_vi', 'learning', 1, 0, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000042'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'a5b9ce23-a21a-59e7-9975-0a9c973d63ad'::uuid, 'vi_to_hanzi', 'learning', 1, 0, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000043'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '7dec5724-9256-5404-8938-647c52f6f504'::uuid, 'hanzi_to_vi', 'learning', 1, 0, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz),
  ('c8000000-0000-4000-8000-000000000044'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, '7dec5724-9256-5404-8938-647c52f6f504'::uuid, 'vi_to_hanzi', 'learning', 1, 0, 2.50, 2, 0, 2, 2, '2026-11-15T10:00:00Z'::timestamptz, '2026-11-25T10:00:00Z'::timestamptz)
on conflict (id) do nothing;

-- Seed 79 review_events referencing the 44 review_cards
insert into public.review_events (
  id, user_id, card_id, idempotency_key, request_fingerprint, request_payload, rating, response_ms, reviewed_at, algorithm_version, previous_state, next_state, result
) values
  ('e8000000-0000-4000-8000-000000000001'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000001'::uuid, 'f8000000-0000-4000-8000-000000000001'::uuid, 'fp-rehearsal-1', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000002'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000002'::uuid, 'f8000000-0000-4000-8000-000000000002'::uuid, 'fp-rehearsal-2', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000003'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000003'::uuid, 'f8000000-0000-4000-8000-000000000003'::uuid, 'fp-rehearsal-3', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000004'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000004'::uuid, 'f8000000-0000-4000-8000-000000000004'::uuid, 'fp-rehearsal-4', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000005'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000005'::uuid, 'f8000000-0000-4000-8000-000000000005'::uuid, 'fp-rehearsal-5', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000006'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000006'::uuid, 'f8000000-0000-4000-8000-000000000006'::uuid, 'fp-rehearsal-6', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000007'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000007'::uuid, 'f8000000-0000-4000-8000-000000000007'::uuid, 'fp-rehearsal-7', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000008'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000008'::uuid, 'f8000000-0000-4000-8000-000000000008'::uuid, 'fp-rehearsal-8', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000009'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000009'::uuid, 'f8000000-0000-4000-8000-000000000009'::uuid, 'fp-rehearsal-9', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000010'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000010'::uuid, 'f8000000-0000-4000-8000-000000000010'::uuid, 'fp-rehearsal-10', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000011'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000011'::uuid, 'f8000000-0000-4000-8000-000000000011'::uuid, 'fp-rehearsal-11', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000012'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000012'::uuid, 'f8000000-0000-4000-8000-000000000012'::uuid, 'fp-rehearsal-12', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000013'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000013'::uuid, 'f8000000-0000-4000-8000-000000000013'::uuid, 'fp-rehearsal-13', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000014'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000014'::uuid, 'f8000000-0000-4000-8000-000000000014'::uuid, 'fp-rehearsal-14', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000015'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000015'::uuid, 'f8000000-0000-4000-8000-000000000015'::uuid, 'fp-rehearsal-15', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000016'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000016'::uuid, 'f8000000-0000-4000-8000-000000000016'::uuid, 'fp-rehearsal-16', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000017'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000017'::uuid, 'f8000000-0000-4000-8000-000000000017'::uuid, 'fp-rehearsal-17', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000018'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000018'::uuid, 'f8000000-0000-4000-8000-000000000018'::uuid, 'fp-rehearsal-18', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000019'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000019'::uuid, 'f8000000-0000-4000-8000-000000000019'::uuid, 'fp-rehearsal-19', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000020'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000020'::uuid, 'f8000000-0000-4000-8000-000000000020'::uuid, 'fp-rehearsal-20', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000021'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000021'::uuid, 'f8000000-0000-4000-8000-000000000021'::uuid, 'fp-rehearsal-21', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000022'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000022'::uuid, 'f8000000-0000-4000-8000-000000000022'::uuid, 'fp-rehearsal-22', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000023'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000023'::uuid, 'f8000000-0000-4000-8000-000000000023'::uuid, 'fp-rehearsal-23', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000024'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000024'::uuid, 'f8000000-0000-4000-8000-000000000024'::uuid, 'fp-rehearsal-24', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000025'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000025'::uuid, 'f8000000-0000-4000-8000-000000000025'::uuid, 'fp-rehearsal-25', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000026'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000026'::uuid, 'f8000000-0000-4000-8000-000000000026'::uuid, 'fp-rehearsal-26', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000027'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000027'::uuid, 'f8000000-0000-4000-8000-000000000027'::uuid, 'fp-rehearsal-27', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000028'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000028'::uuid, 'f8000000-0000-4000-8000-000000000028'::uuid, 'fp-rehearsal-28', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000029'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000029'::uuid, 'f8000000-0000-4000-8000-000000000029'::uuid, 'fp-rehearsal-29', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000030'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000030'::uuid, 'f8000000-0000-4000-8000-000000000030'::uuid, 'fp-rehearsal-30', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000031'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000031'::uuid, 'f8000000-0000-4000-8000-000000000031'::uuid, 'fp-rehearsal-31', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000032'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000032'::uuid, 'f8000000-0000-4000-8000-000000000032'::uuid, 'fp-rehearsal-32', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000033'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000033'::uuid, 'f8000000-0000-4000-8000-000000000033'::uuid, 'fp-rehearsal-33', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000034'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000034'::uuid, 'f8000000-0000-4000-8000-000000000034'::uuid, 'fp-rehearsal-34', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000035'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000035'::uuid, 'f8000000-0000-4000-8000-000000000035'::uuid, 'fp-rehearsal-35', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000036'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000036'::uuid, 'f8000000-0000-4000-8000-000000000036'::uuid, 'fp-rehearsal-36', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000037'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000037'::uuid, 'f8000000-0000-4000-8000-000000000037'::uuid, 'fp-rehearsal-37', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000038'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000038'::uuid, 'f8000000-0000-4000-8000-000000000038'::uuid, 'fp-rehearsal-38', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000039'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000039'::uuid, 'f8000000-0000-4000-8000-000000000039'::uuid, 'fp-rehearsal-39', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000040'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000040'::uuid, 'f8000000-0000-4000-8000-000000000040'::uuid, 'fp-rehearsal-40', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000041'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000041'::uuid, 'f8000000-0000-4000-8000-000000000041'::uuid, 'fp-rehearsal-41', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000042'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000042'::uuid, 'f8000000-0000-4000-8000-000000000042'::uuid, 'fp-rehearsal-42', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000043'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000043'::uuid, 'f8000000-0000-4000-8000-000000000043'::uuid, 'fp-rehearsal-43', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000044'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000044'::uuid, 'f8000000-0000-4000-8000-000000000044'::uuid, 'fp-rehearsal-44', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000045'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000001'::uuid, 'f8000000-0000-4000-8000-000000000045'::uuid, 'fp-rehearsal-45', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000046'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000002'::uuid, 'f8000000-0000-4000-8000-000000000046'::uuid, 'fp-rehearsal-46', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000047'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000003'::uuid, 'f8000000-0000-4000-8000-000000000047'::uuid, 'fp-rehearsal-47', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000048'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000004'::uuid, 'f8000000-0000-4000-8000-000000000048'::uuid, 'fp-rehearsal-48', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000049'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000005'::uuid, 'f8000000-0000-4000-8000-000000000049'::uuid, 'fp-rehearsal-49', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000050'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000006'::uuid, 'f8000000-0000-4000-8000-000000000050'::uuid, 'fp-rehearsal-50', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000051'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000007'::uuid, 'f8000000-0000-4000-8000-000000000051'::uuid, 'fp-rehearsal-51', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000052'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000008'::uuid, 'f8000000-0000-4000-8000-000000000052'::uuid, 'fp-rehearsal-52', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000053'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000009'::uuid, 'f8000000-0000-4000-8000-000000000053'::uuid, 'fp-rehearsal-53', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000054'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000010'::uuid, 'f8000000-0000-4000-8000-000000000054'::uuid, 'fp-rehearsal-54', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000055'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000011'::uuid, 'f8000000-0000-4000-8000-000000000055'::uuid, 'fp-rehearsal-55', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000056'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000012'::uuid, 'f8000000-0000-4000-8000-000000000056'::uuid, 'fp-rehearsal-56', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000057'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000013'::uuid, 'f8000000-0000-4000-8000-000000000057'::uuid, 'fp-rehearsal-57', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000058'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000014'::uuid, 'f8000000-0000-4000-8000-000000000058'::uuid, 'fp-rehearsal-58', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000059'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000015'::uuid, 'f8000000-0000-4000-8000-000000000059'::uuid, 'fp-rehearsal-59', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000060'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000016'::uuid, 'f8000000-0000-4000-8000-000000000060'::uuid, 'fp-rehearsal-60', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000061'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000017'::uuid, 'f8000000-0000-4000-8000-000000000061'::uuid, 'fp-rehearsal-61', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000062'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000018'::uuid, 'f8000000-0000-4000-8000-000000000062'::uuid, 'fp-rehearsal-62', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000063'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000019'::uuid, 'f8000000-0000-4000-8000-000000000063'::uuid, 'fp-rehearsal-63', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000064'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000020'::uuid, 'f8000000-0000-4000-8000-000000000064'::uuid, 'fp-rehearsal-64', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000065'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000021'::uuid, 'f8000000-0000-4000-8000-000000000065'::uuid, 'fp-rehearsal-65', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000066'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000022'::uuid, 'f8000000-0000-4000-8000-000000000066'::uuid, 'fp-rehearsal-66', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000067'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000023'::uuid, 'f8000000-0000-4000-8000-000000000067'::uuid, 'fp-rehearsal-67', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000068'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000024'::uuid, 'f8000000-0000-4000-8000-000000000068'::uuid, 'fp-rehearsal-68', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000069'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000025'::uuid, 'f8000000-0000-4000-8000-000000000069'::uuid, 'fp-rehearsal-69', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000070'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000026'::uuid, 'f8000000-0000-4000-8000-000000000070'::uuid, 'fp-rehearsal-70', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000071'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000027'::uuid, 'f8000000-0000-4000-8000-000000000071'::uuid, 'fp-rehearsal-71', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000072'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000028'::uuid, 'f8000000-0000-4000-8000-000000000072'::uuid, 'fp-rehearsal-72', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000073'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000029'::uuid, 'f8000000-0000-4000-8000-000000000073'::uuid, 'fp-rehearsal-73', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000074'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000030'::uuid, 'f8000000-0000-4000-8000-000000000074'::uuid, 'fp-rehearsal-74', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000075'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000031'::uuid, 'f8000000-0000-4000-8000-000000000075'::uuid, 'fp-rehearsal-75', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000076'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000032'::uuid, 'f8000000-0000-4000-8000-000000000076'::uuid, 'fp-rehearsal-76', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000077'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000033'::uuid, 'f8000000-0000-4000-8000-000000000077'::uuid, 'fp-rehearsal-77', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000078'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000034'::uuid, 'f8000000-0000-4000-8000-000000000078'::uuid, 'fp-rehearsal-78', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb),
  ('e8000000-0000-4000-8000-000000000079'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'c8000000-0000-4000-8000-000000000035'::uuid, 'f8000000-0000-4000-8000-000000000079'::uuid, 'fp-rehearsal-79', '{}'::jsonb, 3, 1500, '2026-11-15T09:00:00Z'::timestamptz, 'hl-sm2-v1', '{"state":"review"}'::jsonb, '{"state":"review"}'::jsonb, '{"ok":true}'::jsonb)
on conflict (id) do nothing;

do $$
declare
  v_pre_vocab_cnt integer;
  v_pre_sv_cnt integer;
  v_pre_rc_cnt integer;
  v_pre_re_cnt integer;
  v_pre_vp_cnt integer;
  v_pre_rc_hash text;
  v_pre_re_hash text;
  v_pre_vp_hash text;
  v_run1 jsonb;
  v_run2 jsonb;
  v_post_vocab_cnt integer;
  v_post_sv_cnt integer;
  v_post_rc_cnt integer;
  v_post_re_cnt integer;
  v_post_vp_cnt integer;
  v_post_rc_hash text;
  v_post_re_hash text;
  v_post_vp_hash text;
  v_dup_semantic integer;
  v_dup_simplified integer;
  v_bad_policy integer;
  v_bu_meaning text;
  v_zhi_meaning text;
  v_yuenan_in_sv integer;
begin
  -- Snapshot before running Migration 0012 sync function
  select count(*) into v_pre_vocab_cnt from public.vocabulary;
  select count(*) into v_pre_sv_cnt from public.syllabus_vocabulary where syllabus_id = '8b8b06ff-5563-5a67-9197-9ffc9b25a8f9';
  select count(*) into v_pre_rc_cnt from public.review_cards;
  select count(*) into v_pre_re_cnt from public.review_events;
  select count(*) into v_pre_vp_cnt from public.vocabulary_progress;

  if v_pre_vocab_cnt <> 44 or v_pre_sv_cnt <> 43 or v_pre_rc_cnt <> 44 or v_pre_re_cnt <> 79 or v_pre_vp_cnt <> 22 then
    raise exception 'FAIL: Pre-migration rehearsal baseline mismatch: vocab=% sv=% rc=% re=% vp=%',
      v_pre_vocab_cnt, v_pre_sv_cnt, v_pre_rc_cnt, v_pre_re_cnt, v_pre_vp_cnt;
  end if;

  select md5(string_agg(id::text || ':' || vocabulary_id::text || ':' || card_type || ':' || state || ':' || step::text || ':' || interval_days::text || ':' || ease_factor::text || ':' || repetitions::text || ':' || lapses::text || ':' || consecutive_successes::text || ':' || version::text || ':' || due_at::text, '|' order by id))
  into v_pre_rc_hash from public.review_cards;

  select md5(string_agg(id::text || ':' || card_id::text || ':' || idempotency_key::text || ':' || rating::text || ':' || request_fingerprint, '|' order by id))
  into v_pre_re_hash from public.review_events;

  select md5(string_agg(user_id::text || ':' || vocabulary_id::text || ':' || mastery_state, '|' order by vocabulary_id))
  into v_pre_vp_hash from public.vocabulary_progress;

  -- Execute Migration 0012 catalog sync twice (idempotency verification)
  v_run1 := private.sync_hsk1_canonical_vocabulary_catalog('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid);
  v_run2 := private.sync_hsk1_canonical_vocabulary_catalog('8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'::uuid);

  if (v_run1->>'updated_pilot_count')::integer <> 43 or (v_run1->>'upserted_new_count')::integer <> 257 then
    raise exception 'FAIL: Expected updated_pilot_count=43 and upserted_new_count=257, got %', v_run1;
  end if;

  if v_run1 <> v_run2 then
    raise exception 'FAIL: Migration 0012 catalog sync is not idempotent: run1=% vs run2=%', v_run1, v_run2;
  end if;

  -- Verify post-migration counts
  select count(*) into v_post_vocab_cnt from public.vocabulary;
  select count(*) into v_post_sv_cnt from public.syllabus_vocabulary where syllabus_id = '8b8b06ff-5563-5a67-9197-9ffc9b25a8f9';
  select count(*) into v_post_rc_cnt from public.review_cards;
  select count(*) into v_post_re_cnt from public.review_events;
  select count(*) into v_post_vp_cnt from public.vocabulary_progress;

  if v_post_vocab_cnt <> 301 or v_post_sv_cnt <> 300 or v_post_rc_cnt <> 44 or v_post_re_cnt <> 79 or v_post_vp_cnt <> 22 then
    raise exception 'FAIL: Post-migration rehearsal counts mismatch: vocab=% (expected 301), sv=% (expected 300), rc=% (expected 44), re=% (expected 79), vp=% (expected 22)',
      v_post_vocab_cnt, v_post_sv_cnt, v_post_rc_cnt, v_post_re_cnt, v_post_vp_cnt;
  end if;

  -- Verify 100% bit-for-bit hash invariance of review_cards, review_events, and vocabulary_progress
  select md5(string_agg(id::text || ':' || vocabulary_id::text || ':' || card_type || ':' || state || ':' || step::text || ':' || interval_days::text || ':' || ease_factor::text || ':' || repetitions::text || ':' || lapses::text || ':' || consecutive_successes::text || ':' || version::text || ':' || due_at::text, '|' order by id))
  into v_post_rc_hash from public.review_cards;

  select md5(string_agg(id::text || ':' || card_id::text || ':' || idempotency_key::text || ':' || rating::text || ':' || request_fingerprint, '|' order by id))
  into v_post_re_hash from public.review_events;

  select md5(string_agg(user_id::text || ':' || vocabulary_id::text || ':' || mastery_state, '|' order by vocabulary_id))
  into v_post_vp_hash from public.vocabulary_progress;

  if v_post_rc_hash <> v_pre_rc_hash then
    raise exception 'FAIL: review_cards state hash changed during catalog migration!';
  end if;
  if v_post_re_hash <> v_pre_re_hash then
    raise exception 'FAIL: review_events hash changed during catalog migration!';
  end if;
  if v_post_vp_hash <> v_pre_vp_hash then
    raise exception 'FAIL: vocabulary_progress hash changed during catalog migration!';
  end if;

  -- Verify 0 duplicate semantic entries and 0 duplicate simplified headwords across the 301 rows
  select count(*) into v_dup_semantic from (
    select simplified, pinyin_marked, sense_key from public.vocabulary group by 1, 2, 3 having count(*) > 1
  ) d;
  select count(*) into v_dup_simplified from (
    select simplified from public.vocabulary group by 1 having count(*) > 1
  ) d;

  if v_dup_semantic <> 0 or v_dup_simplified <> 0 then
    raise exception 'FAIL: Duplicate vocabulary entries detected: semantic=% simplified=%', v_dup_semantic, v_dup_simplified;
  end if;

  -- Verify supplementary word 越南 is preserved in public.vocabulary but NOT in syllabus_vocabulary (300 HSK 1 list)
  select count(*) into v_yuenan_in_sv
  from public.syllabus_vocabulary
  where vocabulary_id = 'aa4a8f04-c772-54ef-a296-a7fd0a6d37c3';

  if v_yuenan_in_sv <> 0 then
    raise exception 'FAIL: Supplementary Pilot word 越南 should not be in HSK 1 300 syllabus_vocabulary';
  end if;

  -- Verify PRIVATE_INVITE_ONLY policy compliance on all 301 published vocabulary rows
  select count(*) into v_bad_policy
  from public.vocabulary
  where status <> 'published'
     or review_status <> 'approved'
     or content_license not like 'PRIVATE_INVITE_ONLY;%'
     or reviewed_by is null
     or reviewed_at is null;

  if v_bad_policy <> 0 then
    raise exception 'FAIL: Found % vocabulary rows violating PRIVATE_INVITE_ONLY publication metadata policy', v_bad_policy;
  end if;

  -- Verify canonical meaning_vi updates for 不 (Pilot UUID) and 只 (polyphone new UUID)
  select meaning_vi into v_bu_meaning from public.vocabulary where id = 'df6876e3-e013-584d-b584-64c5d6f29048';
  select meaning_vi into v_zhi_meaning from public.vocabulary where simplified = '只' and pinyin_marked = 'zhī';

  if v_bu_meaning <> 'Không (phó từ phủ định); đọc biến điệu là bú trước thanh 4' then
    raise exception 'FAIL: Pilot UUID 不 meaning mismatch: %', v_bu_meaning;
  end if;
  if v_zhi_meaning <> 'con, chiếc (lượng từ cho động vật); phân biệt với phó từ zhǐ (chỉ)' then
    raise exception 'FAIL: Polyphone 只 (zhī) meaning mismatch: %', v_zhi_meaning;
  end if;

  raise notice 'PASS: Full Cloud-Equivalent Rehearsal (33 attempts, 44 Pilot vocab, 44 review_cards, 79 review_events -> 301 vocab, 300 syllabus_vocabulary, 100%% hash invariance)';
end $$;

rollback;
