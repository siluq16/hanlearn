-- Disposable native PostgreSQL only; synthetic Auth shim rows, never Cloud users/content.
\set ON_ERROR_STOP on
begin;
\ir fixtures.sql
create function pg_temp.ok(p boolean,label text) returns void language plpgsql as $$
begin if p is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function pg_temp.fails(statement text,code text,label text) returns void language plpgsql as $$
declare got text; begin
 begin execute statement; exception when others then get stacked diagnostics got=returned_sqlstate; end;
 if got is distinct from code then raise exception 'FAIL: % expected %, got %',label,code,coalesce(got,'success'); end if;
 raise notice 'PASS: %',label;
end $$;
set local role anon;
select pg_temp.fails($q$select public.mark_lesson_studied('40000000-0000-0000-0000-000000000001')$q$,'42501','anonymous study denied');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000003',true);
select pg_temp.fails($q$select public.mark_lesson_studied('40000000-0000-0000-0000-000000000001')$q$,'42501','outsider study denied');
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000001',true);
select pg_temp.fails($q$select public.mark_lesson_studied('ffffffff-ffff-4fff-8fff-ffffffffffff')$q$,'PT404','missing lesson study denied');
select pg_temp.fails($q$select public.mark_lesson_studied('40000000-0000-0000-0000-000000000002')$q$,'PT404','draft ancestry study denied');
select pg_temp.fails($q$insert into public.lesson_progress(user_id,lesson_id,studied_at) values(auth.uid(),'40000000-0000-0000-0000-000000000001',now())$q$,'42501','direct progress INSERT denied');
select pg_temp.fails($q$update public.lesson_progress set studied_at=now()$q$,'42501','direct progress UPDATE denied');
-- Pass first, then study. Only synthetic fixed-choice test questions, not pilot keys.
do $$ declare attempt uuid; answers jsonb; ts timestamptz; ct timestamptz; cid uuid; begin
 attempt:=(public.start_quiz('60000000-0000-0000-0000-000000000001',gen_random_uuid())->>'attemptId')::uuid;
 select jsonb_object_agg(id::text,0) into answers from public.quiz_questions;
 perform public.submit_quiz(attempt,answers);
 perform pg_temp.ok((select count(*)=0 from public.lesson_progress),'pass first does not manufacture studied progress');
 perform pg_temp.ok((public.mark_lesson_studied('40000000-0000-0000-0000-000000000001')->>'completed')::boolean,'pass first plus study completes');
 select studied_at,completed_at into ts,ct from public.lesson_progress;
 perform pg_temp.ok(ts is not null and ct is not null,'both persisted timestamps exist');
 perform pg_temp.ok((select count(*)=2 from public.review_cards),'completion creates only two non-audio directions');
 perform public.mark_lesson_studied('40000000-0000-0000-0000-000000000001');
 perform pg_temp.ok((select studied_at=ts and completed_at=ct from public.lesson_progress),'retry preserves first timestamps');
 perform pg_temp.ok((select count(*)=1 from public.lesson_progress),'retry preserves unique progress');
 perform pg_temp.ok((select count(*)=2 and max(version)=0 from public.review_cards),'retry does not duplicate or reset cards');
 select id into cid from public.review_cards where card_type='vi_to_hanzi';
 perform public.set_card_status(cid,'archive',0);
 perform public.mark_lesson_studied('40000000-0000-0000-0000-000000000001');
 perform pg_temp.ok((select archived_at is not null and version=1 from public.review_cards where id=cid),'study retry never resurrects or resets archived card');
end $$;
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000002',true);
select pg_temp.ok((select count(*)=0 from public.lesson_progress),'other learner cannot read first learner progress');
-- Study first, then pass. The seeded card is retained, not evidence of completion.
do $$ declare attempt uuid; answers jsonb; ts timestamptz; begin
 perform pg_temp.ok(not (public.mark_lesson_studied('40000000-0000-0000-0000-000000000001')->>'completed')::boolean,'study only returns incomplete');
 select studied_at into ts from public.lesson_progress;
 perform pg_temp.ok((select studied_at is not null and completed_at is null from public.lesson_progress),'study only stores study timestamp without completion');
 perform pg_temp.ok((select count(*)=1 from public.review_cards),'study only creates no additional card');
 perform public.mark_lesson_studied('40000000-0000-0000-0000-000000000001');
 perform pg_temp.ok((select studied_at=ts and completed_at is null from public.lesson_progress),'study-only retry keeps first timestamp');
 attempt:=(public.start_quiz('60000000-0000-0000-0000-000000000001',gen_random_uuid())->>'attemptId')::uuid;
 select jsonb_object_agg(id::text,0) into answers from public.quiz_questions;
 perform public.submit_quiz(attempt,answers);
 perform pg_temp.ok((select studied_at=ts and completed_at is not null from public.lesson_progress),'study first then quiz pass completes without resetting study');
 perform pg_temp.ok((select count(*)=2 from public.review_cards),'study-first completion creates no duplicates');
 perform pg_temp.ok((select count(*)=1 from public.lesson_progress),'own progress filter hides other learner after completion');
end $$;
reset role;
rollback;
