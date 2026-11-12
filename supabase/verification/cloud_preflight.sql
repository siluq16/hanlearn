-- One read-only statement: compatible with CLI prepared queries AND psql.
-- No row content, answer keys, passwords, function bodies or arbitrary GUC values.
with expected_relations(schema_name,object_name) as (values
 ('private','allowed_learners'),('private','quiz_answer_keys'),
 ('public','syllabus_versions'),('public','audio_assets'),('public','vocabulary'),('public','grammar_points'),
 ('public','syllabus_vocabulary'),('public','syllabus_grammar'),('public','courses'),('public','units'),
 ('public','lessons'),('public','lesson_vocabulary'),('public','lesson_grammar'),('public','profiles'),
 ('public','lesson_progress'),('public','review_cards'),('public','review_events'),('public','card_lifecycle_events'),
 ('public','lesson_quizzes'),('public','quiz_questions'),('public','quiz_attempts'),('public','quiz_responses'),
 ('public','study_plans'),('public','daily_tasks'),('public','task_events'),('public','study_sessions'),
 ('public','vocabulary_progress'),('public','daily_study_metrics')
), app_function_names(name) as (values
 ('is_learner'),('require_learner'),('lesson_visible'),('reject_history_mutation'),('srs_next'),
 ('submit_review'),('set_card_status'),('freeze_quiz'),('finish_lesson'),('mark_lesson_studied'),
 ('start_quiz'),('submit_quiz'),('generate_daily_plan'),('update_task'),('start_timer'),('stop_timer'),
 ('log_manual_session'),('get_learner_access'),('get_due_review_count'),('search_vocabulary')
)
select jsonb_build_object(
 'identity',jsonb_build_object('database',current_database(),'current_user',current_user,'session_user',session_user,
  'server_version',version(),'server_version_num',current_setting('server_version_num')::integer,
  'transaction_read_only',current_setting('transaction_read_only'),
  'project_ref_setting',nullif(current_setting('supabase.project_ref',true),''),
  'ssl',(select ssl from pg_stat_ssl where pid=pg_backend_pid())),
 'prerequisites',jsonb_build_object(
  'auth_users',to_regclass('auth.users') is not null,'auth_uid',to_regprocedure('auth.uid()') is not null,
  'email_confirmed_at',exists(select 1 from information_schema.columns where table_schema='auth' and table_name='users' and column_name='email_confirmed_at'),
  'roles',not exists(select 1 from (values('postgres'),('anon'),('authenticated')) r(name) where not exists(select 1 from pg_roles p where p.rolname=r.name)),
  'gen_random_uuid',to_regprocedure('pg_catalog.gen_random_uuid()') is not null,
  'sha256',to_regprocedure('pg_catalog.sha256(bytea)') is not null,
  'plpgsql',exists(select 1 from pg_language where lanname='plpgsql'),
  'create_schema',has_database_privilege(current_database(),'CREATE'),
  'auth_references',case when to_regclass('auth.users') is null then false else has_table_privilege('auth.users','REFERENCES') end),
 'schemas',(select coalesce(jsonb_agg(nspname order by nspname),'[]'::jsonb) from pg_namespace where nspname in ('public','private','auth','storage','supabase_migrations')),
 'private_schema_manageable',coalesce((select pg_has_role(current_user,n.nspowner,'USAGE') from pg_namespace n where n.nspname='private'),true),
 'extensions',(select coalesce(jsonb_agg(jsonb_build_object('name',extname,'version',extversion) order by extname),'[]'::jsonb) from pg_extension),
 'public_tables',(select coalesce(jsonb_agg(jsonb_build_object('name',c.relname,'rls',c.relrowsecurity) order by c.relname),'[]'::jsonb)
  from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p')),
 'functions',(select coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'signature',pg_get_function_identity_arguments(p.oid),
  'security_definer',p.prosecdef,'search_path',(select x from unnest(p.proconfig) x where x like 'search_path=%' limit 1)) order by n.nspname,p.proname),'[]'::jsonb)
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private')),
 'grants',(select coalesce(jsonb_agg(jsonb_build_object('schema',table_schema,'table',table_name,'role',grantee,'privilege',privilege_type)),'[]'::jsonb)
  from information_schema.role_table_grants where table_schema in ('public','private') and grantee in ('anon','authenticated','PUBLIC')),
 'review_event_constraints',(select coalesce(jsonb_agg(jsonb_build_object('name',conname,'definition',pg_get_constraintdef(oid))),'[]'::jsonb) from pg_constraint where conrelid=to_regclass('public.review_events')),
 'migration_history_present',to_regclass('supabase_migrations.schema_migrations') is not null,
 'relation_conflicts',(select coalesce(jsonb_agg(schema_name||'.'||object_name),'[]'::jsonb) from expected_relations where to_regclass(format('%I.%I',schema_name,object_name)) is not null),
 'function_conflicts',(select coalesce(jsonb_agg(n.nspname||'.'||p.proname),'[]'::jsonb) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') and p.proname in (select name from app_function_names)),
 'private_objects',(select coalesce(jsonb_agg(c.relname),'[]'::jsonb) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='private' and c.relkind in ('r','p','v','m','S'))
) as preflight;
