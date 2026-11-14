-- Supported alternative when per-setting verbosity/parameter controls are denied.
-- Only this transaction's server-message threshold changes. No DML/DDL/real keys.
\set ON_ERROR_STOP on
\set VERBOSITY sqlstate
BEGIN READ ONLY;
SET LOCAL statement_timeout='20s';
SET LOCAL search_path=pg_catalog;
SELECT jsonb_build_object('stage','baseline','pid',pg_backend_pid(),'read_only',current_setting('transaction_read_only'),
 'settings',(SELECT jsonb_object_agg(name,setting) FROM pg_settings WHERE name IN
 ('log_statement','log_min_messages','log_min_error_statement','log_error_verbosity',
  'log_parameter_max_length','log_parameter_max_length_on_error','log_min_duration_statement',
  'log_min_duration_sample','log_transaction_sample_rate','auto_explain.log_min_duration',
  'auto_explain.log_parameter_max_length','auto_explain.log_level','pgaudit.log_level','pgaudit.log_client')));
SET LOCAL log_min_messages='panic';
SELECT current_setting('transaction_read_only')='on' AND current_setting('log_min_messages')='panic'
 AND coalesce(current_setting('auto_explain.log_level',true),'log')='log'
 AND coalesce(current_setting('pgaudit.log_client',true),'off')='off' AS logging_guard_pass
\gset
\if :logging_guard_pass
\else
\echo BLOCKED_SESSION_THRESHOLD
\quit 2
\endif
SELECT jsonb_build_object('stage','guard_verified','logging_guard_pass',true,'pid',pg_backend_pid(),
 'read_only',current_setting('transaction_read_only'),'protection','SESSION_MESSAGE_THRESHOLD');
-- Cross the captured 10-second auto_explain threshold with a bound synthetic value.
SELECT jsonb_build_object('stage','bind_canary','bound_text',length($1::text)>0,'pid',pg_backend_pid()) FROM pg_sleep(10.1)
\bind 'HANLEARN_SYNTHETIC_CANARY_NOT_A_KEY_20261114'
\g
SELECT $1::integer
\bind 'HANLEARN_SYNTHETIC_CANARY_NOT_A_KEY_20261114'
\g
