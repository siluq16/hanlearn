-- READ ONLY. Inspect target project in Dashboard first. Never proves identity by itself.
select current_database(), current_user, version();
select nspname from pg_namespace where nspname in ('public','private','auth','storage','supabase_migrations');
select extname,extversion from pg_extension order by extname;
select to_regclass('auth.users') is not null as auth_users_present,
 to_regprocedure('auth.uid()') is not null as auth_uid_present;
select c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relkind='r' order by c.relname;
select n.nspname,p.proname,p.prosecdef,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname in ('public','private') order by n.nspname,p.proname;
select table_schema,table_name,grantee,privilege_type from information_schema.role_table_grants
 where table_schema in ('public','private') and grantee in ('anon','authenticated','PUBLIC') order by table_schema,table_name,grantee;
select conname,pg_get_constraintdef(oid) from pg_constraint
 where conrelid=to_regclass('public.review_events');
