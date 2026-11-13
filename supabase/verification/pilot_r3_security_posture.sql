-- Supplement to the frozen preflight: metadata aggregates only; no secret values/identities.
-- Not executed on Cloud by the preparation task. Use psql -X -v ON_ERROR_STOP=1
-- with the existing pinned Development/TLS configuration; never lower TLS/log controls.
BEGIN READ ONLY;
SET LOCAL statement_timeout='15s';
SELECT pg_catalog.jsonb_build_object('security_posture',pg_catalog.jsonb_build_object(
  'database',pg_catalog.current_database(),
  'role',current_user,
  'read_only',pg_catalog.current_setting('transaction_read_only'),
  'allowlisted_count',(SELECT count(*) FROM private.allowed_learners),
  'confirmed_allowlisted_count',(SELECT count(*) FROM private.allowed_learners a JOIN auth.users u ON u.id=a.user_id WHERE u.email_confirmed_at IS NOT NULL),
  'missing_or_unconfirmed_allowlisted_count',(SELECT count(*) FROM private.allowed_learners a LEFT JOIN auth.users u ON u.id=a.user_id WHERE u.email_confirmed_at IS NULL),
  'api_schema_role_settings',(SELECT coalesce(pg_catalog.jsonb_agg(setting),'[]'::jsonb) FROM pg_catalog.pg_db_role_setting s CROSS JOIN LATERAL pg_catalog.unnest(s.setconfig) setting WHERE setting LIKE 'pgrst.db_schemas=%'),
  'logging',(SELECT pg_catalog.jsonb_object_agg(name,setting) FROM pg_catalog.pg_settings WHERE name IN ('log_statement','log_min_error_statement','log_parameter_max_length','log_parameter_max_length_on_error','log_error_verbosity','log_min_duration_statement','log_min_duration_sample','log_statement_sample_rate','log_transaction_sample_rate','shared_preload_libraries','session_preload_libraries','local_preload_libraries','auto_explain.log_min_duration','auto_explain.log_parameter_max_length')),
  'pgaudit_parameter_logging',pg_catalog.current_setting('pgaudit.log_parameter',true),
  'pgaudit_extension_present',EXISTS(SELECT 1 FROM pg_catalog.pg_extension WHERE extname='pgaudit'),
  'authenticated_private_keys_select',pg_catalog.has_table_privilege('authenticated','private.quiz_answer_keys','SELECT'),
  'anon_private_keys_select',pg_catalog.has_table_privilege('anon','private.quiz_answer_keys','SELECT')
));
ROLLBACK;
