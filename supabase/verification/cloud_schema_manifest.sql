-- Catalog-only structural manifest for the six approved migrations. One SELECT.
with relations as (
 select c.*,n.nspname from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname in ('public','private') and c.relkind in ('r','p','v','m')
), functions as (
 select p.*,n.nspname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname in ('public','private')
)
select jsonb_build_object(
 'relations',(select coalesce(jsonb_agg(jsonb_build_object('schema',r.nspname,'name',r.relname,'kind',r.relkind,
  'owner',pg_get_userbyid(r.relowner),'rls',r.relrowsecurity,'force_rls',r.relforcerowsecurity,'options',r.reloptions) order by r.nspname,r.relname),'[]'::jsonb) from relations r),
 'columns',(select coalesce(jsonb_agg(jsonb_build_object('schema',r.nspname,'table',r.relname,'name',a.attname,'position',a.attnum,
  'type',format_type(a.atttypid,a.atttypmod),'not_null',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid)) order by r.nspname,r.relname,a.attnum),'[]'::jsonb)
  from relations r join pg_attribute a on a.attrelid=r.oid and a.attnum>0 and not a.attisdropped
  left join pg_attrdef d on d.adrelid=r.oid and d.adnum=a.attnum),
 'constraints',(select coalesce(jsonb_agg(jsonb_build_object('schema',r.nspname,'table',r.relname,'name',c.conname,'type',c.contype,
  'validated',c.convalidated,'definition',pg_get_constraintdef(c.oid)) order by r.nspname,r.relname,c.conname),'[]'::jsonb)
  from relations r join pg_constraint c on c.conrelid=r.oid where c.contype<>'n'),
 'indexes',(select coalesce(jsonb_agg(jsonb_build_object('schema',r.nspname,'table',r.relname,'name',ic.relname,
  'valid',i.indisvalid,'ready',i.indisready,'definition',pg_get_indexdef(i.indexrelid)) order by r.nspname,r.relname,ic.relname),'[]'::jsonb)
  from relations r join pg_index i on i.indrelid=r.oid join pg_class ic on ic.oid=i.indexrelid),
 'policies',(select coalesce(jsonb_agg(jsonb_build_object('schema',r.nspname,'table',r.relname,'name',p.polname,'command',p.polcmd,
  'permissive',p.polpermissive,'roles',(select array_agg(case when role_oid=0 then 'PUBLIC' else pg_get_userbyid(role_oid) end order by role_oid) from unnest(p.polroles) role_oid),
  'using',pg_get_expr(p.polqual,p.polrelid),'check',pg_get_expr(p.polwithcheck,p.polrelid)) order by r.nspname,r.relname,p.polname),'[]'::jsonb)
  from relations r join pg_policy p on p.polrelid=r.oid),
 'triggers',(select coalesce(jsonb_agg(jsonb_build_object('schema',r.nspname,'table',r.relname,'name',t.tgname,'enabled',t.tgenabled,
  'definition',pg_get_triggerdef(t.oid)) order by r.nspname,r.relname,t.tgname),'[]'::jsonb)
  from relations r join pg_trigger t on t.tgrelid=r.oid and not t.tgisinternal),
 'table_privileges',(select coalesce(jsonb_agg(jsonb_build_object('schema',r.nspname,'table',r.relname,'role',x.role_name,
  'select',has_table_privilege(x.role_name,r.oid,'SELECT'),'insert',has_table_privilege(x.role_name,r.oid,'INSERT'),
  'update',has_table_privilege(x.role_name,r.oid,'UPDATE'),'delete',has_table_privilege(x.role_name,r.oid,'DELETE'),
  'truncate',has_table_privilege(x.role_name,r.oid,'TRUNCATE'),'references',has_table_privilege(x.role_name,r.oid,'REFERENCES'),
  'trigger',has_table_privilege(x.role_name,r.oid,'TRIGGER')) order by r.nspname,r.relname,x.role_name),'[]'::jsonb)
  from relations r cross join (values('anon'),('authenticated')) x(role_name)),
 'column_privileges',(select coalesce(jsonb_agg(jsonb_build_object('schema',r.nspname,'table',r.relname,'column',a.attname,'role',x.role_name,
  'select',has_column_privilege(x.role_name,r.oid,a.attnum,'SELECT'),'insert',has_column_privilege(x.role_name,r.oid,a.attnum,'INSERT'),
  'update',has_column_privilege(x.role_name,r.oid,a.attnum,'UPDATE'),'references',has_column_privilege(x.role_name,r.oid,a.attnum,'REFERENCES'))
  order by r.nspname,r.relname,a.attnum,x.role_name),'[]'::jsonb)
  from relations r join pg_attribute a on a.attrelid=r.oid and a.attnum>0 and not a.attisdropped cross join (values('anon'),('authenticated')) x(role_name)),
 'functions',(select coalesce(jsonb_agg(jsonb_build_object('schema',p.nspname,'name',p.proname,'arguments',pg_get_function_identity_arguments(p.oid),
  'result',pg_get_function_result(p.oid),'owner',pg_get_userbyid(p.proowner),'definer',p.prosecdef,'config',p.proconfig,
  'anon_execute',has_function_privilege('anon',p.oid,'EXECUTE'),'authenticated_execute',has_function_privilege('authenticated',p.oid,'EXECUTE'),
  'public_execute',exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) acl where acl.grantee=0 and acl.privilege_type='EXECUTE'))
  order by p.nspname,p.proname,pg_get_function_identity_arguments(p.oid)),'[]'::jsonb) from functions p)
) as schema_manifest;
