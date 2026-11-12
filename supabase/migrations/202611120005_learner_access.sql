-- Sprint 1 Auth bootstrap: distinguish an authorized learner without a profile
-- from an authenticated outsider without exposing private through PostgREST.
-- Read-only; reuses the existing verified-UUID allowlist predicate unchanged.
create function public.get_learner_access() returns boolean
language sql stable security invoker set search_path=''
as $$ select private.is_learner() $$;
revoke all on function public.get_learner_access() from public,anon,authenticated;
grant execute on function public.get_learner_access() to authenticated;

