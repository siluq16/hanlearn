\set ON_ERROR_STOP on
begin;
\ir fixtures.sql
create function pg_temp.ok(p boolean,label text) returns void language plpgsql as $$
begin if p is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function pg_temp.fails(statement text,code text,label text) returns void language plpgsql as $$
declare got text;
begin
 begin execute statement; exception when others then get stacked diagnostics got=returned_sqlstate; end;
 if got is distinct from code then raise exception 'FAIL: % expected %, got %',label,code,coalesce(got,'success'); end if;
 raise notice 'PASS: %',label;
end $$;
-- All exposed base tables have RLS, no public privileged implementations.
select pg_temp.ok(not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relkind='r' and not c.relrowsecurity),'all exposed tables use RLS');
select pg_temp.ok(not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.prosecdef),'no definer in public schema');
select pg_temp.ok(not has_function_privilege('anon','public.submit_review(uuid,integer,integer,bigint,uuid)','EXECUTE'),'anon cannot execute review');
select pg_temp.ok(not has_function_privilege('authenticated','private.finish_lesson(uuid,uuid)','EXECUTE'),'internal completion helper denied');
select pg_temp.fails($q$update private.quiz_answer_keys set correct_index=1$q$,'55000','published quiz keys immutable');
select pg_temp.fails($q$update public.quiz_questions set prompt='changed'$q$,'55000','published questions immutable');
select pg_temp.fails($q$insert into public.vocabulary(simplified,pinyin_marked,meaning_vi,status) values('bad','bad','bad','published')$q$,'23514','unreviewed publication rejected');
-- Deterministic scheduler vectors run as owner, not exposed RPC.
do $$ declare p jsonb:='{"state":"new","step":0,"interval_days":0,"ease_factor":2.5,"repetitions":0,"lapses":0,"consecutive_successes":0}'; n jsonb;
 ts timestamptz:='2026-01-01T00:00:00Z'; begin
 n:=private.srs_next(p,1,ts);
 perform pg_temp.ok(n->>'state'='learning' and (n->>'due_at')::timestamptz=ts+interval '1 minute' and (n->>'ease_factor')::numeric=1.96,'new Again 1m + ease');
 n:=private.srs_next(p,2,ts);
 perform pg_temp.ok((n->>'due_at')::timestamptz=ts+interval '6 minutes','new Hard 6m');
 n:=private.srs_next(p,3,ts);
 perform pg_temp.ok((n->>'step')::int=1 and (n->>'due_at')::timestamptz=ts+interval '10 minutes','Good learning step');
 n:=private.srs_next(n,3,ts);
 perform pg_temp.ok(n->>'state'='review' and (n->>'interval_days')::int=1,'learning graduation');
 n:=private.srs_next(p,4,ts);
 perform pg_temp.ok(n->>'state'='review' and (n->>'interval_days')::int=4,'Easy graduation 4d');
 p:=p||'{"state":"review","interval_days":10,"consecutive_successes":2}';
 n:=private.srs_next(p,3,ts);
 perform pg_temp.ok((n->>'interval_days')::int=25 and (n->>'consecutive_successes')::int=3,'review Good old EF');
 n:=private.srs_next(p,2,ts);
 perform pg_temp.ok((n->>'interval_days')::int=12 and (n->>'consecutive_successes')::int=0,'review Hard resets successes');
 n:=private.srs_next(p,4,ts);
 perform pg_temp.ok((n->>'interval_days')::int=33,'review Easy ceil');
 n:=private.srs_next(p,1,ts);
 perform pg_temp.ok(n->>'state'='relearning' and (n->>'lapses')::int=1 and (n->>'interval_days')::int=10,'lapse preserves interval');
 n:=private.srs_next(n,3,ts);
 perform pg_temp.ok(n->>'state'='review' and (n->>'interval_days')::int=5,'relearning halves interval');
 n:=private.srs_next(p||'{"interval_days":36500}',4,ts);
 perform pg_temp.ok((n->>'interval_days')::int=36500,'interval cap without overflow');
 n:=private.srs_next(p||'{"ease_factor":1.3}',1,ts);
 perform pg_temp.ok((n->>'ease_factor')::numeric=1.30,'ease lower bound');
 n:=private.srs_next(p||'{"ease_factor":3.0}',4,ts);
 perform pg_temp.ok((n->>'ease_factor')::numeric=3.00,'ease upper bound');
 n:=private.srs_next(p||'{"state":"learning","step":1,"interval_days":0}',2,ts);
 perform pg_temp.ok((n->>'step')::int=1 and (n->>'due_at')::timestamptz=ts+interval '10 minutes','learning Hard keeps step 1');
 n:=private.srs_next(p||'{"state":"relearning"}',2,ts);
 perform pg_temp.ok((n->>'due_at')::timestamptz=ts+interval '15 minutes','relearning Hard 15m');
 n:=private.srs_next(p||'{"state":"relearning"}',4,ts);
 perform pg_temp.ok((n->>'interval_days')::int=8,'relearning Easy ceil 75 percent');
end $$;
set local role anon;
select pg_temp.fails('select * from public.review_cards','42501','anonymous denied personal data');
select pg_temp.fails('select * from public.lessons','42501','anonymous denied catalog');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000003',true);
select pg_temp.ok((select count(*)=0 from public.lessons),'nonallowlisted account sees no catalog');
select pg_temp.fails($q$select public.start_timer(gen_random_uuid())$q$,'42501','nonallowlisted mutation denied');
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000001',true);
select pg_temp.ok((select count(*)=1 from public.review_cards),'A sees only A cards');
select pg_temp.ok((select count(*)=1 from public.lessons),'published lesson under draft course hidden');
select pg_temp.ok((select count(*)=1 from public.lesson_vocabulary),'draft join hidden');
select pg_temp.ok((select count(*)=1 from public.syllabus_vocabulary),'draft membership hidden');
select pg_temp.ok((select count(*)=5 from public.quiz_questions),'read quiz prompts without keys');
select pg_temp.fails('select * from private.quiz_answer_keys','42501','private keys denied');
select pg_temp.fails($q$update public.review_cards set interval_days=999$q$,'42501','direct schedule mutation denied');
select pg_temp.fails($q$insert into public.review_events(user_id) values(auth.uid())$q$,'42501','direct event insert denied');
select pg_temp.fails($q$update public.review_events set rating=4$q$,'42501','direct event update denied');
select pg_temp.fails($q$delete from public.review_events$q$,'42501','direct event delete denied');
select pg_temp.fails($q$delete from public.review_cards$q$,'42501','direct card delete denied');
select pg_temp.fails($q$select public.submit_review('80000000-0000-0000-0000-000000000002',3,null,0,gen_random_uuid())$q$,'PT404','A cannot review B card');
select public.submit_review('80000000-0000-0000-0000-000000000001',3,1000,0,'b0000000-0000-0000-0000-000000000001');
select pg_temp.ok((select count(*)=1 from public.review_events),'review inserts exactly one event');
select pg_temp.ok((select version=1 and state='learning' from public.review_cards where id='80000000-0000-0000-0000-000000000001'),'review updates card');
select pg_temp.ok(
 public.submit_review('80000000-0000-0000-0000-000000000001',3,1000,0,'b0000000-0000-0000-0000-000000000001')
 =(select result from public.review_events limit 1),'duplicate exact stored response');
select pg_temp.fails($q$select public.submit_review('80000000-0000-0000-0000-000000000001',4,1000,0,'b0000000-0000-0000-0000-000000000001')$q$,'PT409','same key different payload conflicts');
select pg_temp.fails($q$select public.submit_review('80000000-0000-0000-0000-000000000001',3,null,0,gen_random_uuid())$q$,'PT409','stale version conflicts');
select pg_temp.fails($q$select public.submit_review('80000000-0000-0000-0000-000000000001',3,null,1,gen_random_uuid())$q$,'PT409','early review denied');
-- Quiz: score is server-owned; 4/5 is exact pass threshold.
select pg_temp.fails($q$update public.quiz_attempts set passed=true$q$,'42501','direct grading denied');
select public.mark_lesson_studied('40000000-0000-0000-0000-000000000001');
do $$ declare a uuid; r jsonb; answers jsonb; begin
 a:=(public.start_quiz('60000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000002')->>'attemptId')::uuid;
 perform pg_temp.ok((select count(*)=0 from public.quiz_responses where attempt_id=a),'no presubmit answer feedback');
 answers:='{"70000000-0000-0000-0000-000000000001":0,"70000000-0000-0000-0000-000000000002":0,"70000000-0000-0000-0000-000000000003":0,"70000000-0000-0000-0000-000000000004":0}';
 r:=public.submit_quiz(a,answers);
 perform pg_temp.ok((r->>'passed')::boolean and (r->>'scorePercent')::numeric=80,'4/5 quiz passes');
 perform pg_temp.ok(public.submit_quiz(a,answers)=r,'quiz retry returns stored result');
 perform pg_temp.fails(format('select public.submit_quiz(%L,%L::jsonb)',a,'{}'),'PT409','quiz changed payload conflicts');
 perform pg_temp.ok((select completed_at is not null from public.lesson_progress where lesson_id='40000000-0000-0000-0000-000000000001'),'study plus pass completes lesson');
 perform pg_temp.ok((select count(*)=2 from public.review_cards),'completion creates two directions only (no audio)');
 perform pg_temp.ok((select mastery_state='learning' from public.vocabulary_progress),'quiz pass is not vocabulary mastery');
 a:=(public.start_quiz('60000000-0000-0000-0000-000000000001',gen_random_uuid())->>'attemptId')::uuid;
 r:=public.submit_quiz(a,'{}');
 perform pg_temp.ok(not (r->>'passed')::boolean,'retake missing answers fails');
 perform pg_temp.ok((select completed_at is not null from public.lesson_progress),'failed retake preserves completion');
end $$;
-- Archive retains events and replay receipt.
select public.set_card_status('80000000-0000-0000-0000-000000000001','archive',1);
select pg_temp.ok((select count(*)=1 from public.review_events),'archive retains history');
select pg_temp.ok(public.submit_review('80000000-0000-0000-0000-000000000001',3,1000,0,'b0000000-0000-0000-0000-000000000001')=(select result from public.review_events limit 1),'review replay after archive');
select pg_temp.fails($q$select public.submit_review('80000000-0000-0000-0000-000000000001',3,null,2,gen_random_uuid())$q$,'PT409','archived card rejects new review');
select public.mark_lesson_studied('40000000-0000-0000-0000-000000000001');
select pg_temp.ok((select archived_at is not null from public.review_cards where id='80000000-0000-0000-0000-000000000001'),'completion never resurrects archived card');
-- Plan generation, task movement and timer/manual overlap.
do $$ declare pid uuid; tid uuid; moved uuid; d date:=(clock_timestamp() at time zone 'Asia/Ho_Chi_Minh')::date; begin
 pid:=public.generate_daily_plan('10000000-0000-0000-0000-000000000001',d);
 perform pg_temp.ok(public.generate_daily_plan('10000000-0000-0000-0000-000000000001',d)=pid,'plan generation idempotent');
 perform pg_temp.ok((select count(*)=5 and sum(estimated_minutes)=60 from public.daily_tasks where plan_id=pid),'five baseline tasks total 60');
 select id into tid from public.daily_tasks where plan_id=pid order by task_key limit 1;
 moved:=public.update_task(tid,'rescheduled',d+1);
 perform pg_temp.ok(public.update_task(tid,'rescheduled',d+1)=moved,'move retry idempotent');
 perform pg_temp.ok((select status='rescheduled' from public.daily_tasks where id=tid),'original task retained');
 perform pg_temp.ok((select rescheduled_from=tid from public.daily_tasks where id=moved),'move child lineage retained');
end $$;
reset role;
-- Fixed historical intervals avoid changing expected values with wall-clock date.
insert into public.study_sessions(user_id,source,evidence,started_at,ended_at,idempotency_key,request_payload) values
 ('a0000000-0000-0000-0000-000000000001','hanlearn','system_timer','2026-01-01T02:00Z','2026-01-01T02:30Z',gen_random_uuid(),'{}'),
 ('a0000000-0000-0000-0000-000000000001','hellochinese_manual','self_reported','2026-01-01T02:15Z','2026-01-01T02:45Z',gen_random_uuid(),'{}');
select pg_temp.ok((select actual_minutes=45 and system_minutes=30 and self_reported_only_minutes=15 from public.daily_study_metrics where study_date='2026-01-01'),'union removes timer/manual double count');
-- Fail event insertion AFTER card UPDATE and prove rollback.
create function pg_temp.fail_event() returns trigger language plpgsql as $$ begin
 if new.response_ms=4242 then raise exception 'injected failure' using errcode='P0001'; end if; return new; end $$;
create trigger test_fail_event before insert on public.review_events for each row execute function pg_temp.fail_event();
set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000002',true);
select pg_temp.fails($q$select public.submit_review('80000000-0000-0000-0000-000000000002',3,4242,0,gen_random_uuid())$q$,'P0001','injected event failure rolls back');
select pg_temp.ok((select version=0 and repetitions=0 from public.review_cards),'card unchanged after rollback');
select pg_temp.ok((select count(*)=0 from public.review_events),'no event after rollback and B cannot read A history');
select pg_temp.ok((select count(*)=0 from public.lesson_progress),'B cannot read A lesson progress');
select pg_temp.ok((select count(*)=0 from public.quiz_attempts),'B cannot read A quiz history');
reset role;
-- Persisted evidence can only be changed by constrained operations.
set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000001',true);
select pg_temp.fails($q$select public.submit_review('80000000-0000-0000-0000-000000000001',3,null,-1,gen_random_uuid())$q$,'22023','negative expected version invalid');
select pg_temp.fails($q$select public.mark_lesson_studied('40000000-0000-0000-0000-000000000002')$q$,'PT404','RPC also checks draft ancestry');
select pg_temp.fails($q$select private.finish_lesson(auth.uid(),'40000000-0000-0000-0000-000000000001')$q$,'42501','client cannot call internal completion');
do $$ declare sid uuid; key uuid:=gen_random_uuid(); begin
 sid:=public.start_timer(key);
 perform pg_temp.ok(public.start_timer(key)=sid,'timer start retry returns same session');
 perform pg_temp.fails('select public.start_timer(gen_random_uuid())','PT409','second active timer rejected');
 perform pg_temp.ok(public.stop_timer(sid)=sid and public.stop_timer(sid)=sid,'timer stop retry idempotent');
 key:=gen_random_uuid();
 sid:=public.log_manual_session('hellochinese_manual','2026-01-02T02:00Z','2026-01-02T02:30Z',key);
 perform pg_temp.ok(public.log_manual_session('hellochinese_manual','2026-01-02T02:00Z','2026-01-02T02:30Z',key)=sid,'manual retry idempotent');
 perform pg_temp.fails(format('select public.log_manual_session(%L,%L,%L,%L)','other_manual','2026-01-02T02:00Z','2026-01-02T02:30Z',key),'PT409','manual changed payload conflict');
end $$;
reset role;
-- Mastery is derived and reversible, not a quiz-derived writable counter.
update public.review_cards set state='review',archived_at=null,interval_days=21,consecutive_successes=3
 where user_id='a0000000-0000-0000-0000-000000000001';
set local role authenticated;
select pg_temp.ok((select mastery_state='mastered' from public.vocabulary_progress),'two mature directions produce mastery');
reset role;
update public.review_cards set state='relearning' where id='80000000-0000-0000-0000-000000000001';
set local role authenticated;
select pg_temp.ok((select mastery_state='learning' from public.vocabulary_progress),'lapse removes current mastery');
reset role;
-- Audio metadata can enable creation but revocation blocks new reviews.
insert into public.audio_assets(id,storage_path,mime_type,byte_size,status,review_status,source_uri,content_license,reviewed_by,reviewed_at)
 values('90000000-0000-0000-0000-000000000001','synthetic-do-not-play.mp3','audio/mpeg',100,'published','approved','urn:hanlearn:test','self-authored','test',now());
update public.vocabulary set audio_asset_id='90000000-0000-0000-0000-000000000001' where id='50000000-0000-0000-0000-000000000001';
set local role authenticated;
select public.mark_lesson_studied('40000000-0000-0000-0000-000000000001');
select pg_temp.ok((select count(*)=1 from public.review_cards where card_type='audio_to_hanzi'),'approved audio metadata enables audio direction');
reset role;
update public.audio_assets set status='draft';
set local role authenticated;
do $$ declare cid uuid; begin
 select id into cid from public.review_cards where card_type='audio_to_hanzi';
 perform pg_temp.fails(format('select public.submit_review(%L,3,null,0,gen_random_uuid())',cid),'PT409','revoked audio rejects review');
end $$;
reset role;
insert into public.study_sessions(user_id,source,evidence,started_at,ended_at,idempotency_key,request_payload)
 values('a0000000-0000-0000-0000-000000000001','other_manual','self_reported','2026-01-03T16:30Z','2026-01-03T17:30Z',gen_random_uuid(),'{}');
select pg_temp.ok((select count(*)=2 and min(actual_minutes)=30 and max(actual_minutes)=30 from public.daily_study_metrics where study_date in ('2026-01-03','2026-01-04')),'interval splits at local midnight');
-- A published lesson under a draft unit also stays inaccessible.
update public.units set status='draft' where id='30000000-0000-0000-0000-000000000001';
set local role authenticated;
select pg_temp.ok((select count(*)=0 from public.lessons),'draft unit hides published lesson');
select pg_temp.ok((select count(*)=0 from public.quiz_questions),'draft ancestry hides quiz prompts');
reset role;
select pg_temp.fails($q$update public.review_events set rating=1$q$,'42501','append-only trigger blocks owner update');
rollback;

