-- Synthetic disposable native/Auth-shim test only; no pilot content or real keys.
\set ON_ERROR_STOP on
begin;
\ir fixtures.sql
create function pg_temp.ok(p boolean,label text) returns void language plpgsql as $$
begin if p is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function pg_temp.fails(statement text,code text,label text) returns void language plpgsql as $$
declare got text; begin begin execute statement; exception when others then get stacked diagnostics got=returned_sqlstate; end;
if got is distinct from code then raise exception 'FAIL: % expected %, got %',label,code,coalesce(got,'success'); end if; raise notice 'PASS: %',label; end $$;
set local role anon;
select pg_temp.fails($q$select public.start_quiz('60000000-0000-0000-0000-000000000001',gen_random_uuid())$q$,'42501','anon quiz start denied');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000003',true);
select pg_temp.fails($q$select public.start_quiz('60000000-0000-0000-0000-000000000001',gen_random_uuid())$q$,'42501','outsider start denied');
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000001',true);
select pg_temp.fails($q$select public.start_quiz('ffffffff-ffff-4fff-8fff-ffffffffffff',gen_random_uuid())$q$,'PT404','unknown quiz denied');
select pg_temp.fails($q$select * from private.quiz_answer_keys$q$,'42501','raw keys denied before attempt');
select pg_temp.fails($q$select submission_payload from public.quiz_attempts$q$,'42501','attempt internal payload column denied');
do $$ declare a uuid; b uuid; key uuid:=gen_random_uuid(); answers jsonb; r jsonb; begin
 a:=(public.start_quiz('60000000-0000-0000-0000-000000000001',key)->>'attemptId')::uuid;
 perform pg_temp.ok((public.start_quiz('60000000-0000-0000-0000-000000000001',key)->>'attemptId')::uuid=a,'start retry preserves attempt');
 perform pg_temp.ok((select count(*)=1 from public.quiz_attempts),'only one start row');
 perform pg_temp.ok((select count(*)=0 from public.quiz_responses),'no feedback before submit');
 perform pg_temp.fails(format('select public.submit_quiz(%L,%L::jsonb)',a,'{"ffffffff-ffff-4fff-8fff-ffffffffffff":0}'),'22023','foreign question rejects atomically');
 select jsonb_object_agg(id::text,6) into answers from public.quiz_questions;
 perform pg_temp.fails(format('select public.submit_quiz(%L,%L::jsonb)',a,answers),'22023','out of range choice rejected');
 select jsonb_object_agg(id::text,0.5) into answers from public.quiz_questions;
 perform pg_temp.fails(format('select public.submit_quiz(%L,%L::jsonb)',a,answers),'22023','fractional choice rejected');
 perform pg_temp.ok((select submitted_at is null from public.quiz_attempts where id=a),'invalid submission leaves attempt unsubmitted');
 perform pg_temp.ok((select count(*)=0 from public.quiz_responses),'invalid submission creates no responses');
 select jsonb_object_agg(id::text,0) into answers from (select id from public.quiz_questions order by id limit 3) q;
 r:=public.submit_quiz(a,answers);
 perform pg_temp.ok(not (r->>'passed')::boolean and (r->>'correctCount')::int=3,'3 of 5 fails and blanks count incorrect');
 perform pg_temp.ok(public.submit_quiz(a,answers)=r,'duplicate submit replays exact receipt');
 perform pg_temp.fails(format('select public.submit_quiz(%L,%L::jsonb)',a,'{}'),'PT409','changed retry conflicts');
 perform pg_temp.ok((select count(*)=5 from public.quiz_responses where attempt_id=a),'one response per question after retry');
 b:=(public.start_quiz('60000000-0000-0000-0000-000000000001',gen_random_uuid())->>'attemptId')::uuid;
 perform pg_temp.ok(b<>a,'explicit retake creates new attempt');
 select jsonb_object_agg(id::text,0) into answers from (select id from public.quiz_questions order by id limit 4) q;
 r:=public.submit_quiz(b,answers);
 perform pg_temp.ok((r->>'passed')::boolean and (r->>'scorePercent')::numeric=80,'4 of 5 exactly passes in backend');
 perform pg_temp.ok((select count(*)=0 from public.lesson_progress),'quiz-first does not invent studied state');
 perform pg_temp.ok((select count(*)=5 from public.quiz_responses where attempt_id=b),'own submitted response feedback available');
end $$;
select pg_temp.fails($q$select * from private.quiz_answer_keys$q$,'42501','raw keys remain denied after submit');
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000002',true);
select pg_temp.ok((select count(*)=0 from public.quiz_attempts),'B cannot read A attempts');
select pg_temp.ok((select count(*)=0 from public.quiz_responses),'B cannot read A response feedback');
select pg_temp.fails($q$select public.submit_quiz('ffffffff-ffff-4fff-8fff-ffffffffffff','{}')$q$,'PT404','unknown or foreign attempt hidden');
-- Force failure late in completion: responses/attempt/progress must all roll back.
select public.mark_lesson_studied('40000000-0000-0000-0000-000000000001');
reset role;
create function pg_temp.fail_quiz_card() returns trigger language plpgsql as $$begin raise exception 'synthetic completion rollback';end $$;
create trigger test_quiz_rollback before insert on public.review_cards for each row execute function pg_temp.fail_quiz_card();
set local role authenticated;
do $$ declare a uuid; answers jsonb; begin
 a:=(public.start_quiz('60000000-0000-0000-0000-000000000001',gen_random_uuid())->>'attemptId')::uuid;
 select jsonb_object_agg(id::text,0) into answers from public.quiz_questions;
 perform pg_temp.fails(format('select public.submit_quiz(%L,%L::jsonb)',a,answers),'P0001','completion failure rolls back submission');
 perform pg_temp.ok((select submitted_at is null from public.quiz_attempts where id=a),'attempt rolled back after late failure');
 perform pg_temp.ok((select count(*)=0 from public.quiz_responses),'responses rolled back after late failure');
 perform pg_temp.ok((select studied_at is not null and completed_at is null from public.lesson_progress),'study evidence retained without optimistic completion');
end $$;
reset role;
drop trigger test_quiz_rollback on public.review_cards;
rollback;
