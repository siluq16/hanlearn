-- SELECT only. Executed inside explicit READ ONLY transaction by the helper.
select jsonb_build_object(
 'functions',(select coalesce(jsonb_agg(jsonb_build_object(
  'schema',n.nspname,'name',p.proname,'arguments',pg_get_function_identity_arguments(p.oid),
  'result',pg_get_function_result(p.oid),'owner',pg_get_userbyid(p.proowner),
  'definer',p.prosecdef,'config',p.proconfig,'language',l.lanname,'trusted_language',l.lanpltrusted,
  'body',p.prosrc,'definition',pg_get_functiondef(p.oid),
  'anon_execute',has_function_privilege('anon',p.oid,'EXECUTE'),
  'authenticated_execute',has_function_privilege('authenticated',p.oid,'EXECUTE')) order by p.oid),'[]'::jsonb)
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_language l on l.oid=p.prolang
  where n.nspname='public' and p.proname='rls_auto_enable'),
 'event_triggers',(select coalesce(jsonb_agg(jsonb_build_object(
  'name',e.evtname,'event',e.evtevent,'owner',pg_get_userbyid(e.evtowner),
  'enabled',e.evtenabled,'tags',e.evttags,'function_schema',n.nspname,'function_name',p.proname,
  'function_arguments',pg_get_function_identity_arguments(p.oid)) order by e.evtname),'[]'::jsonb)
  from pg_event_trigger e join pg_proc p on p.oid=e.evtfoid join pg_namespace n on n.oid=p.pronamespace),
 'schema_privileges',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'owner',pg_get_userbyid(n.nspowner),
  'role',r.name,'usage',has_schema_privilege(r.name,n.oid,'USAGE'),'create',has_schema_privilege(r.name,n.oid,'CREATE'))
  order by n.nspname,r.name)
  from pg_namespace n cross join (values('anon'),('authenticated')) r(name) where n.nspname in ('public','private')),
 'role_flags',(select jsonb_agg(jsonb_build_object('name',rolname,'superuser',rolsuper,'bypass_rls',rolbypassrls,
  'create_role',rolcreaterole,'create_db',rolcreatedb) order by rolname)
  from pg_roles where rolname in ('anon','authenticated','postgres')),
 'history',(select coalesce(jsonb_agg(jsonb_build_object('version',version,'name',name) order by version),'[]'::jsonb)
  from supabase_migrations.schema_migrations)
) as platform_security;
