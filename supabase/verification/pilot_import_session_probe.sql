-- Read-only permission/bind probe. No real keys, DML, DDL or persistent settings.
\set ON_ERROR_STOP on
\set VERBOSITY sqlstate
BEGIN READ ONLY;
SET LOCAL statement_timeout='15s';
SET LOCAL lock_timeout='3s';
SET LOCAL search_path=pg_catalog;
SELECT jsonb_build_object('stage','baseline','read_only',current_setting('transaction_read_only'),
 'pid',pg_backend_pid(),'settings',(SELECT jsonb_object_agg(name,setting) FROM pg_settings WHERE name IN
 ('log_statement','log_min_messages','log_min_error_statement','log_error_verbosity',
  'log_parameter_max_length','log_parameter_max_length_on_error','log_min_duration_statement',
  'log_min_duration_sample','log_transaction_sample_rate','auto_explain.log_min_duration',
  'auto_explain.log_parameter_max_length','pgaudit.log_parameter')));
SELECT jsonb_build_object('stage','log_min_messages');
SET LOCAL log_min_messages='panic';
SELECT jsonb_build_object('stage','log_error_verbosity');
SET LOCAL log_error_verbosity='terse';
SELECT jsonb_build_object('stage','log_min_error_statement');
SET LOCAL log_min_error_statement='panic';
SELECT jsonb_build_object('stage','log_parameter_max_length');
SET LOCAL log_parameter_max_length=0;
SELECT jsonb_build_object('stage','log_parameter_max_length_on_error');
SET LOCAL log_parameter_max_length_on_error=0;
SELECT jsonb_build_object('stage','log_min_duration_statement');
SET LOCAL log_min_duration_statement=-1;
SELECT jsonb_build_object('stage','log_min_duration_sample');
SET LOCAL log_min_duration_sample=-1;
SELECT jsonb_build_object('stage','log_transaction_sample_rate');
SET LOCAL log_transaction_sample_rate=0;
SELECT jsonb_build_object('stage','auto_explain.log_min_duration');
SET LOCAL auto_explain.log_min_duration=-1;
SELECT jsonb_build_object('stage','auto_explain.log_parameter_max_length');
SET LOCAL auto_explain.log_parameter_max_length=0;
SELECT jsonb_build_object('stage','pgaudit.log_parameter');
SET LOCAL pgaudit.log_parameter=off;
-- DML-only import has no DDL. ddl is acceptable; mod/all are not.
SELECT current_setting('log_statement') IN ('none','ddl')
 AND current_setting('transaction_read_only')='on'
 AND current_setting('log_min_messages')='panic'
 AND current_setting('log_error_verbosity')='terse'
 AND current_setting('log_min_error_statement')='panic'
 AND current_setting('log_parameter_max_length')='0'
 AND current_setting('log_parameter_max_length_on_error')='0'
 AND current_setting('log_min_duration_statement')='-1'
 AND current_setting('log_min_duration_sample')='-1'
 AND current_setting('log_transaction_sample_rate')='0'
 AND current_setting('auto_explain.log_min_duration')='-1'
 AND current_setting('auto_explain.log_parameter_max_length')='0'
 AND current_setting('pgaudit.log_parameter')='off' AS logging_guard_pass
\gset
\if :logging_guard_pass
\else
\echo BLOCKED_SESSION_SETTINGS
\quit 2
\endif
SELECT jsonb_build_object('stage','guard_verified','logging_guard_pass',true,'pid',pg_backend_pid(),
 'read_only',current_setting('transaction_read_only'));
SELECT jsonb_build_object('stage','bind_canary','bound_text',length($1::text)>0,'pid',pg_backend_pid())
\bind 'HANLEARN_SYNTHETIC_CANARY_NOT_A_KEY_20261114'
\g
-- Expected 22P02, only after verified safeguards; ON_ERROR_STOP exits immediately.
-- Disconnect aborts this read-only transaction and restores every SET LOCAL.
SELECT $1::integer
\bind 'HANLEARN_SYNTHETIC_CANARY_NOT_A_KEY_20261114'
\g
