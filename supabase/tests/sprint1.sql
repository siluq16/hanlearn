\set ON_ERROR_STOP on
begin;
\ir fixtures.sql
create function pg_temp.ok(p boolean,label text) returns void language plpgsql as $$
begin if p is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function pg_temp.fails(statement text,code text,label text) returns void language plpgsql as $$
declare got text; begin begin execute statement; exception when others then get stacked diagnostics got=returned_sqlstate; end;
if got is distinct from code then raise exception 'FAIL: % expected %, got %',label,code,coalesce(got,'success'); end if; raise notice 'PASS: %',label; end $$;
select pg_temp.ok(not has_function_privilege('anon','public.get_learner_access()','EXECUTE'),'anonymous cannot probe learner access');
select pg_temp.ok(not has_function_privilege('anon','public.search_vocabulary(uuid,text,integer,integer,integer)','EXECUTE'),'anonymous cannot search catalog RPC');
set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000001',true);
select pg_temp.ok(public.get_learner_access(),'allowlisted user with no profile can bootstrap');
select pg_temp.ok(public.get_due_review_count()=1,'due count only owns eligible due card');
select pg_temp.ok((public.search_vocabulary('10000000-0000-0000-0000-000000000001','test',1,0,20)->>'total')::int=1,'search does not expose draft vocabulary');
select pg_temp.ok((public.search_vocabulary('10000000-0000-0000-0000-000000000001','%',null,0,20)->>'total')::int=0,'wildcard treated as literal search text');
select pg_temp.ok((public.search_vocabulary('10000000-0000-0000-0000-000000000001','',null,20,20)->>'total')::int=1,'empty out-of-range page preserves true total');
select pg_temp.ok(jsonb_array_length(public.search_vocabulary('10000000-0000-0000-0000-000000000001','',null,20,20)->'items')=0,'offset pagination respects bounds');
select pg_temp.fails($q$select public.search_vocabulary('10000000-0000-0000-0000-000000000001','',null,0,51)$q$,'22023','search page size bounded');
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000003',true);
select pg_temp.ok(not public.get_learner_access(),'outsider bootstrap denied');
select pg_temp.ok(public.get_due_review_count()=0,'outsider due count cannot bypass RLS');
select pg_temp.ok((public.search_vocabulary('10000000-0000-0000-0000-000000000001','',null,0,20)->>'total')::int=0,'outsider search cannot bypass RLS');
reset role;
rollback;
