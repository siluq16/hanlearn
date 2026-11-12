create table public.study_plans (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 syllabus_id uuid not null references public.syllabus_versions(id), created_at timestamptz not null default now(),
 unique(user_id,syllabus_id), unique(id,user_id)
);
create table public.daily_tasks (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 plan_id uuid not null, scheduled_date date not null, task_key text not null,
 task_type text not null check(task_type in ('srs','vocabulary','grammar','hellochinese','quiz')),
 lesson_id uuid references public.lessons(id), estimated_minutes integer not null check(estimated_minutes>0),
 status text not null default 'pending' check(status in ('pending','done','skipped','rescheduled')),
 completed_at timestamptz, rescheduled_from uuid unique references public.daily_tasks(id),
 created_at timestamptz not null default now(), unique(plan_id,scheduled_date,task_key),
 foreign key(plan_id,user_id) references public.study_plans(id,user_id),
 check((status='done')=(completed_at is not null))
);
create index daily_tasks_user_date_idx on public.daily_tasks(user_id,scheduled_date);
create table public.task_events (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 task_id uuid not null references public.daily_tasks(id),
 action text not null check(action in ('done','skipped','rescheduled')),
 occurred_at timestamptz not null default clock_timestamp(), detail jsonb not null default '{}'::jsonb
);
create trigger task_history_append_only before update or delete on public.task_events
 for each row execute function private.reject_history_mutation();
create table public.study_sessions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 source text not null check(source in ('hanlearn','hellochinese_manual','other_manual')),
 evidence text not null check(evidence in ('system_timer','self_reported')),
 started_at timestamptz not null, ended_at timestamptz, capped boolean not null default false,
 idempotency_key uuid not null, request_payload jsonb not null,
 unique(user_id,idempotency_key),
 check((evidence='system_timer' and source='hanlearn') or (evidence='self_reported' and source in ('hellochinese_manual','other_manual'))),
 check(ended_at is null or (ended_at>started_at and ended_at<=started_at+interval '4 hours')),
 check(evidence='system_timer' or ended_at is not null)
);
create unique index one_active_timer on public.study_sessions(user_id) where ended_at is null;
create index study_sessions_user_time_idx on public.study_sessions(user_id,started_at);
do $$ declare t text; begin
 foreach t in array array['study_plans','daily_tasks','task_events','study_sessions'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public,anon,authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
  execute format('create policy %I on public.%I for select to authenticated using ((select private.is_learner()) and user_id=(select auth.uid()))',t||'_read',t);
 end loop;
end $$;

create function private.generate_daily_plan(p_syllabus_id uuid,p_date date) returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.require_learner(); pid uuid; lid uuid; today date:=(clock_timestamp() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
 if p_date is null or p_date<today or p_date>today+13 then raise exception 'date_out_of_window' using errcode='22023'; end if;
 if not exists(select 1 from public.syllabus_versions where id=p_syllabus_id and status='published') then
  raise exception 'syllabus_not_found' using errcode='PT404'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text||p_syllabus_id::text,3));
 insert into public.study_plans(user_id,syllabus_id) values(u,p_syllabus_id)
 on conflict(user_id,syllabus_id) do update set syllabus_id=excluded.syllabus_id returning id into pid;
 select l.id into lid from public.lessons l join public.units un on un.id=l.unit_id join public.courses c on c.id=un.course_id
 where c.syllabus_id=p_syllabus_id and c.status='published' and un.status='published' and l.status='published'
 and c.hsk_level<=coalesce((select p.target_hsk_level from public.profiles p where p.id=u),5)
 and not exists(select 1 from public.lesson_progress p where p.user_id=u and p.lesson_id=l.id and p.completed_at is not null)
 order by c.hsk_level,c.sort_order,c.id,un.sort_order,l.sort_order limit 1;
 insert into public.daily_tasks(user_id,plan_id,scheduled_date,task_key,task_type,lesson_id,estimated_minutes)
 select u,pid,p_date,x.k,case when lid is null and x.kind in ('vocabulary','grammar','quiz') then 'srs' else x.kind end,
  case when x.kind in ('vocabulary','grammar','quiz') then lid else null end,x.minutes
 from (values('review','srs',10),('vocabulary','vocabulary',15),('grammar','grammar',10),
  ('hellochinese','hellochinese',15),('quiz','quiz',10)) x(k,kind,minutes)
 on conflict(plan_id,scheduled_date,task_key) do nothing;
 return pid;
end $$;

create function private.update_task(p_task_id uuid,p_status text,p_move_date date default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.require_learner(); t public.daily_tasks; nid uuid;
 today date:=(clock_timestamp() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
 select * into t from public.daily_tasks where id=p_task_id and user_id=u for update;
 if not found then raise exception 'task_not_found' using errcode='PT404'; end if;
 if p_status='rescheduled' then
  if p_move_date is null or p_move_date<=t.scheduled_date or p_move_date<today or p_move_date>today+13 then
   raise exception 'invalid_move_date' using errcode='22023'; end if;
  if t.status='rescheduled' then
   select id into nid from public.daily_tasks where rescheduled_from=t.id and scheduled_date=p_move_date;
   if nid is null then raise exception 'move_conflict' using errcode='PT409'; end if;
   return nid;
  end if;
 elsif p_status not in ('done','skipped') or p_status is null or p_move_date is not null then
  raise exception 'invalid_task_action' using errcode='22023';
 elsif t.status=p_status then return t.id;
 end if;
 if t.status<>'pending' then raise exception 'task_closed' using errcode='PT409'; end if;
 if p_status='rescheduled' then
  insert into public.daily_tasks(user_id,plan_id,scheduled_date,task_key,task_type,lesson_id,estimated_minutes,rescheduled_from)
  values(u,t.plan_id,p_move_date,'move:'||t.id,t.task_type,t.lesson_id,t.estimated_minutes,t.id) returning id into nid;
 else nid:=t.id; end if;
 update public.daily_tasks set status=p_status,completed_at=case when p_status='done' then clock_timestamp() end where id=t.id;
 insert into public.task_events(user_id,task_id,action,detail) values(u,t.id,p_status,jsonb_build_object('newTaskId',nid,'moveDate',p_move_date));
 return nid;
end $$;

create function private.start_timer(p_idempotency_key uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.require_learner(); s public.study_sessions;
begin
 if p_idempotency_key is null then raise exception 'invalid_request' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,4));
 select * into s from public.study_sessions where user_id=u and idempotency_key=p_idempotency_key;
 if found then
  if s.request_payload<>'{"type":"timer"}'::jsonb then raise exception 'idempotency_conflict' using errcode='PT409'; end if;
  return s.id;
 end if;
 if exists(select 1 from public.study_sessions where user_id=u and ended_at is null) then
  raise exception 'timer_already_active' using errcode='PT409'; end if;
 insert into public.study_sessions(user_id,source,evidence,started_at,idempotency_key,request_payload)
 values(u,'hanlearn','system_timer',clock_timestamp(),p_idempotency_key,'{"type":"timer"}') returning * into s;
 return s.id;
end $$;
create function private.stop_timer(p_session_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.require_learner(); s public.study_sessions; ts timestamptz;
begin
 select * into s from public.study_sessions where id=p_session_id and user_id=u for update;
 if not found or s.evidence<>'system_timer' then raise exception 'timer_not_found' using errcode='PT404'; end if;
 if s.ended_at is not null then return s.id; end if;
 ts:=clock_timestamp();
 update public.study_sessions set ended_at=least(greatest(ts,s.started_at+interval '1 microsecond'),s.started_at+interval '4 hours'),
 capped=ts>s.started_at+interval '4 hours' where id=s.id;
 return s.id;
end $$;
create function private.log_manual_session(p_source text,p_started_at timestamptz,p_ended_at timestamptz,p_idempotency_key uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.require_learner(); s public.study_sessions; payload jsonb;
begin
 if p_idempotency_key is null or p_source is null or p_source not in ('hellochinese_manual','other_manual')
 or p_started_at is null or p_ended_at is null or p_ended_at<=p_started_at or p_ended_at>p_started_at+interval '4 hours'
 or p_ended_at>clock_timestamp() then raise exception 'invalid_session' using errcode='22023'; end if;
 payload:=jsonb_build_object('source',p_source,'start',p_started_at at time zone 'UTC','end',p_ended_at at time zone 'UTC');
 perform pg_advisory_xact_lock(hashtextextended(u::text,4));
 select * into s from public.study_sessions where user_id=u and idempotency_key=p_idempotency_key;
 if found then
  if s.request_payload<>payload then raise exception 'idempotency_conflict' using errcode='PT409'; end if;
  return s.id;
 end if;
 insert into public.study_sessions(user_id,source,evidence,started_at,ended_at,idempotency_key,request_payload)
 values(u,p_source,'self_reported',p_started_at,p_ended_at,p_idempotency_key,payload) returning * into s;
 return s.id;
end $$;

-- security_invoker prevents owner-view privilege bypass. Merge intervals before measuring.
create view public.daily_study_metrics with (security_invoker=true) as
with parts as (
 select s.user_id,d::date study_date,s.evidence,
 tstzrange(greatest(s.started_at,d at time zone 'Asia/Ho_Chi_Minh'),
 least(s.ended_at,(d+interval '1 day') at time zone 'Asia/Ho_Chi_Minh'),'[)') r
 from public.study_sessions s cross join lateral generate_series(
 date_trunc('day',s.started_at at time zone 'Asia/Ho_Chi_Minh'),
 date_trunc('day',(s.ended_at-interval '1 microsecond') at time zone 'Asia/Ho_Chi_Minh'),interval '1 day') d
 where s.ended_at is not null
), merged as (
 select user_id,study_date,range_agg(r) all_ranges,
 coalesce(range_agg(r) filter(where evidence='system_timer'),'{}'::tstzmultirange) system_ranges
 from parts group by user_id,study_date
)
select user_id,study_date,
 (select sum(extract(epoch from upper(x)-lower(x)))/60 from unnest(all_ranges) x) actual_minutes,
 (select coalesce(sum(extract(epoch from upper(x)-lower(x)))/60,0) from unnest(system_ranges) x) system_minutes,
 (select coalesce(sum(extract(epoch from upper(x)-lower(x)))/60,0) from unnest(all_ranges-system_ranges) x) self_reported_only_minutes
from merged;
revoke all on public.daily_study_metrics from public,anon,authenticated;
grant select on public.daily_study_metrics to authenticated;

revoke all on function private.generate_daily_plan(uuid,date) from public,anon,authenticated;
grant execute on function private.generate_daily_plan(uuid,date) to authenticated;
create function public.generate_daily_plan(p_syllabus_id uuid,p_date date) returns uuid language sql security invoker set search_path=''
as $$ select private.generate_daily_plan(p_syllabus_id,p_date) $$;
revoke all on function public.generate_daily_plan(uuid,date) from public,anon,authenticated;
grant execute on function public.generate_daily_plan(uuid,date) to authenticated;

revoke all on function private.update_task(uuid,text,date) from public,anon,authenticated;
grant execute on function private.update_task(uuid,text,date) to authenticated;
create function public.update_task(p_task_id uuid,p_status text,p_move_date date default null) returns uuid language sql security invoker set search_path=''
as $$ select private.update_task(p_task_id,p_status,p_move_date) $$;
revoke all on function public.update_task(uuid,text,date) from public,anon,authenticated;
grant execute on function public.update_task(uuid,text,date) to authenticated;

revoke all on function private.start_timer(uuid) from public,anon,authenticated;
grant execute on function private.start_timer(uuid) to authenticated;
create function public.start_timer(p_idempotency_key uuid) returns uuid language sql security invoker set search_path=''
as $$ select private.start_timer(p_idempotency_key) $$;
revoke all on function public.start_timer(uuid) from public,anon,authenticated;
grant execute on function public.start_timer(uuid) to authenticated;

revoke all on function private.stop_timer(uuid) from public,anon,authenticated;
grant execute on function private.stop_timer(uuid) to authenticated;
create function public.stop_timer(p_session_id uuid) returns uuid language sql security invoker set search_path=''
as $$ select private.stop_timer(p_session_id) $$;
revoke all on function public.stop_timer(uuid) from public,anon,authenticated;
grant execute on function public.stop_timer(uuid) to authenticated;

revoke all on function private.log_manual_session(text,timestamptz,timestamptz,uuid) from public,anon,authenticated;
grant execute on function private.log_manual_session(text,timestamptz,timestamptz,uuid) to authenticated;
create function public.log_manual_session(p_source text,p_started_at timestamptz,p_ended_at timestamptz,p_idempotency_key uuid) returns uuid language sql security invoker set search_path=''
as $$ select private.log_manual_session(p_source,p_started_at,p_ended_at,p_idempotency_key) $$;
revoke all on function public.log_manual_session(text,timestamptz,timestamptz,uuid) from public,anon,authenticated;
grant execute on function public.log_manual_session(text,timestamptz,timestamptz,uuid) to authenticated;

