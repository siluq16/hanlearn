-- GENERATED from ordered supabase/migrations. Fresh install only; do not apply twice.

-- Migration: 202611120001_catalog.sql
-- Fresh baseline only. Requires Supabase auth.users/auth.uid()/roles.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
alter default privileges in schema private revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from public;
-- Explicitly allow listed UUIDs; never client writable.
create table private.allowed_learners (user_id uuid primary key references auth.users(id) on delete cascade);
create function private.is_learner() returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from private.allowed_learners a join auth.users u on u.id=a.user_id
    where a.user_id=auth.uid() and u.email_confirmed_at is not null)
$$;
revoke all on function private.is_learner() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_learner() to authenticated;
create function private.require_learner() returns uuid language plpgsql stable security definer
set search_path = '' as $$
begin
  if auth.uid() is null or not private.is_learner() then
    raise exception 'learner_required' using errcode='42501';
  end if;
  return auth.uid();
end $$;
revoke all on function private.require_learner() from public, anon, authenticated;

create table public.syllabus_versions (
  id uuid primary key default gen_random_uuid(), code text not null unique,
  display_name text not null, published_on date, effective_on date,
  verified_at timestamptz, official_vocab_totals jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  review_status text not null default 'pending' check (review_status in ('pending','approved')),
  source_uri text, content_license text, reviewed_by text, reviewed_at timestamptz,
  check (status <> 'published' or (review_status = 'approved'
    and nullif(btrim(source_uri),'') is not null and nullif(btrim(content_license),'') is not null
    and nullif(btrim(reviewed_by),'') is not null and reviewed_at is not null)),
  check(status <> 'published' or verified_at is not null)
);
create unique index one_active_syllabus on public.syllabus_versions(is_active) where is_active;
create table public.audio_assets (
  id uuid primary key default gen_random_uuid(), storage_path text not null,
  mime_type text not null check(mime_type in ('audio/mpeg','audio/ogg','audio/wav','audio/mp4')),
  byte_size bigint not null check(byte_size between 1 and 20971520),
  status text not null default 'draft' check (status in ('draft','published')),
  review_status text not null default 'pending' check (review_status in ('pending','approved')),
  source_uri text, content_license text, reviewed_by text, reviewed_at timestamptz,
  check (status <> 'published' or (review_status = 'approved'
    and nullif(btrim(source_uri),'') is not null and nullif(btrim(content_license),'') is not null
    and nullif(btrim(reviewed_by),'') is not null and reviewed_at is not null))
);
create table public.vocabulary (
  id uuid primary key default gen_random_uuid(), simplified text not null, traditional text,
  pinyin_marked text not null, pinyin_numeric text, meaning_vi text not null, part_of_speech text,
  sense_key text not null default '1', example_zh text, example_pinyin text, example_vi text,
  audio_asset_id uuid references public.audio_assets(id),
  status text not null default 'draft' check (status in ('draft','published')),
  review_status text not null default 'pending' check (review_status in ('pending','approved')),
  source_uri text, content_license text, reviewed_by text, reviewed_at timestamptz,
  check (status <> 'published' or (review_status = 'approved'
    and nullif(btrim(source_uri),'') is not null and nullif(btrim(content_license),'') is not null
    and nullif(btrim(reviewed_by),'') is not null and reviewed_at is not null)),
  unique(simplified,pinyin_marked,sense_key)
);
create index vocabulary_simplified_idx on public.vocabulary(simplified);
create table public.grammar_points (
  id uuid primary key default gen_random_uuid(), title text not null, pattern text not null,
  explanation_vi text not null, examples jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','published')),
  review_status text not null default 'pending' check (review_status in ('pending','approved')),
  source_uri text, content_license text, reviewed_by text, reviewed_at timestamptz,
  check (status <> 'published' or (review_status = 'approved'
    and nullif(btrim(source_uri),'') is not null and nullif(btrim(content_license),'') is not null
    and nullif(btrim(reviewed_by),'') is not null and reviewed_at is not null))
);
create table public.syllabus_vocabulary (
  syllabus_id uuid not null references public.syllabus_versions(id),
  vocabulary_id uuid not null references public.vocabulary(id),
  introduced_level smallint not null check(introduced_level between 1 and 9),
  primary key(syllabus_id,vocabulary_id)
);
create index syllabus_vocab_level_idx on public.syllabus_vocabulary(syllabus_id,introduced_level);
create table public.syllabus_grammar (
  syllabus_id uuid not null references public.syllabus_versions(id),
  grammar_id uuid not null references public.grammar_points(id),
  introduced_level smallint not null check(introduced_level between 1 and 9),
  primary key(syllabus_id,grammar_id)
);
create table public.courses (
  id uuid primary key default gen_random_uuid(), syllabus_id uuid not null references public.syllabus_versions(id),
  hsk_level smallint not null check(hsk_level between 1 and 9), title text not null,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  review_status text not null default 'pending' check (review_status in ('pending','approved')),
  source_uri text, content_license text, reviewed_by text, reviewed_at timestamptz,
  check (status <> 'published' or (review_status = 'approved'
    and nullif(btrim(source_uri),'') is not null and nullif(btrim(content_license),'') is not null
    and nullif(btrim(reviewed_by),'') is not null and reviewed_at is not null))
);
create table public.units (
  id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id),
  title text not null, sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  review_status text not null default 'pending' check (review_status in ('pending','approved')),
  source_uri text, content_license text, reviewed_by text, reviewed_at timestamptz,
  check (status <> 'published' or (review_status = 'approved'
    and nullif(btrim(source_uri),'') is not null and nullif(btrim(content_license),'') is not null
    and nullif(btrim(reviewed_by),'') is not null and reviewed_at is not null)),
  unique(course_id,sort_order)
);
create table public.lessons (
  id uuid primary key default gen_random_uuid(), unit_id uuid not null references public.units(id),
  title text not null, objective_vi text, content jsonb not null default '{}'::jsonb,
  estimated_minutes integer not null default 30 check(estimated_minutes>0),
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  review_status text not null default 'pending' check (review_status in ('pending','approved')),
  source_uri text, content_license text, reviewed_by text, reviewed_at timestamptz,
  check (status <> 'published' or (review_status = 'approved'
    and nullif(btrim(source_uri),'') is not null and nullif(btrim(content_license),'') is not null
    and nullif(btrim(reviewed_by),'') is not null and reviewed_at is not null)),
  unique(unit_id,sort_order)
);
create table public.lesson_vocabulary (
  lesson_id uuid not null references public.lessons(id),
  vocabulary_id uuid not null references public.vocabulary(id),
  sort_order integer not null default 0, primary key(lesson_id,vocabulary_id)
);
create table public.lesson_grammar (
  lesson_id uuid not null references public.lessons(id),
  grammar_id uuid not null references public.grammar_points(id),
  sort_order integer not null default 0, primary key(lesson_id,grammar_id)
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade, display_name text,
  timezone text not null default 'Asia/Ho_Chi_Minh' check(timezone='Asia/Ho_Chi_Minh'),
  daily_goal_minutes integer not null default 60 check(daily_goal_minutes=60),
  baseline_hsk_level smallint not null default 0 check(baseline_hsk_level between 0 and 9),
  target_hsk_level smallint not null default 5 check(target_hsk_level between 1 and 9),
  preferred_syllabus_id uuid references public.syllabus_versions(id),
  created_at timestamptz not null default now()
);
create table public.lesson_progress (
  user_id uuid not null references auth.users(id),
  lesson_id uuid not null references public.lessons(id),
  studied_at timestamptz, completed_at timestamptz,
  primary key(user_id,lesson_id), check(completed_at is null or studied_at is not null)
);
-- RLS ancestry follows existing parent policies. No circular dependencies.

alter table public.syllabus_versions enable row level security;
revoke all on public.syllabus_versions from public, anon, authenticated;
grant select on public.syllabus_versions to authenticated;
create policy syllabus_versions_read on public.syllabus_versions for select to authenticated using ((select private.is_learner()) and (status='published'));

alter table public.audio_assets enable row level security;
revoke all on public.audio_assets from public, anon, authenticated;
grant select on public.audio_assets to authenticated;
create policy audio_assets_read on public.audio_assets for select to authenticated using ((select private.is_learner()) and (status='published'));

alter table public.vocabulary enable row level security;
revoke all on public.vocabulary from public, anon, authenticated;
grant select on public.vocabulary to authenticated;
create policy vocabulary_read on public.vocabulary for select to authenticated using ((select private.is_learner()) and (status='published'));

alter table public.grammar_points enable row level security;
revoke all on public.grammar_points from public, anon, authenticated;
grant select on public.grammar_points to authenticated;
create policy grammar_points_read on public.grammar_points for select to authenticated using ((select private.is_learner()) and (status='published'));

alter table public.syllabus_vocabulary enable row level security;
revoke all on public.syllabus_vocabulary from public, anon, authenticated;
grant select on public.syllabus_vocabulary to authenticated;
create policy syllabus_vocabulary_read on public.syllabus_vocabulary for select to authenticated using ((select private.is_learner()) and (exists(select 1 from public.syllabus_versions s where s.id=syllabus_id) and exists(select 1 from public.vocabulary v where v.id=vocabulary_id)));

alter table public.syllabus_grammar enable row level security;
revoke all on public.syllabus_grammar from public, anon, authenticated;
grant select on public.syllabus_grammar to authenticated;
create policy syllabus_grammar_read on public.syllabus_grammar for select to authenticated using ((select private.is_learner()) and (exists(select 1 from public.syllabus_versions s where s.id=syllabus_id) and exists(select 1 from public.grammar_points g where g.id=grammar_id)));

alter table public.courses enable row level security;
revoke all on public.courses from public, anon, authenticated;
grant select on public.courses to authenticated;
create policy courses_read on public.courses for select to authenticated using ((select private.is_learner()) and (status='published' and exists(select 1 from public.syllabus_versions s where s.id=syllabus_id)));

alter table public.units enable row level security;
revoke all on public.units from public, anon, authenticated;
grant select on public.units to authenticated;
create policy units_read on public.units for select to authenticated using ((select private.is_learner()) and (status='published' and exists(select 1 from public.courses c where c.id=course_id)));

alter table public.lessons enable row level security;
revoke all on public.lessons from public, anon, authenticated;
grant select on public.lessons to authenticated;
create policy lessons_read on public.lessons for select to authenticated using ((select private.is_learner()) and (status='published' and exists(select 1 from public.units u where u.id=unit_id)));

alter table public.lesson_vocabulary enable row level security;
revoke all on public.lesson_vocabulary from public, anon, authenticated;
grant select on public.lesson_vocabulary to authenticated;
create policy lesson_vocabulary_read on public.lesson_vocabulary for select to authenticated using ((select private.is_learner()) and (exists(select 1 from public.lessons l where l.id=lesson_id) and exists(select 1 from public.vocabulary v where v.id=vocabulary_id)));

alter table public.lesson_grammar enable row level security;
revoke all on public.lesson_grammar from public, anon, authenticated;
grant select on public.lesson_grammar to authenticated;
create policy lesson_grammar_read on public.lesson_grammar for select to authenticated using ((select private.is_learner()) and (exists(select 1 from public.lessons l where l.id=lesson_id) and exists(select 1 from public.grammar_points g where g.id=grammar_id)));

alter table public.profiles enable row level security;
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
create policy profiles_read on public.profiles for select to authenticated using ((select private.is_learner()) and (id=(select auth.uid())));

alter table public.lesson_progress enable row level security;
revoke all on public.lesson_progress from public, anon, authenticated;
grant select on public.lesson_progress to authenticated;
create policy lesson_progress_read on public.lesson_progress for select to authenticated using ((select private.is_learner()) and (user_id=(select auth.uid())));

grant insert(id,display_name,timezone,daily_goal_minutes,baseline_hsk_level,target_hsk_level,preferred_syllabus_id),
  update(display_name,baseline_hsk_level,target_hsk_level,preferred_syllabus_id) on public.profiles to authenticated;
create policy profiles_insert on public.profiles for insert to authenticated
with check ((select private.is_learner()) and id=(select auth.uid())
  and (preferred_syllabus_id is null or exists(select 1 from public.syllabus_versions s where s.id=preferred_syllabus_id)));
create policy profiles_update on public.profiles for update to authenticated
using ((select private.is_learner()) and id=(select auth.uid()))
with check ((select private.is_learner()) and id=(select auth.uid())
  and (preferred_syllabus_id is null or exists(select 1 from public.syllabus_versions s where s.id=preferred_syllabus_id)));
-- Privileged RPCs bypass RLS: explicitly recheck full ancestry themselves.
create function private.lesson_visible(p_lesson uuid) returns boolean language sql stable
set search_path='' as $$
 select exists(select 1 from public.lessons l join public.units u on u.id=l.unit_id
 join public.courses c on c.id=u.course_id join public.syllabus_versions s on s.id=c.syllabus_id
 where l.id=p_lesson and l.status='published' and u.status='published' and c.status='published' and s.status='published')
$$;
revoke all on function private.lesson_visible(uuid) from public,anon,authenticated;

-- Migration: 202611120002_srs.sql
create table public.review_cards (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 vocabulary_id uuid not null references public.vocabulary(id),
 card_type text not null check(card_type in ('hanzi_to_vi','vi_to_hanzi','audio_to_hanzi')),
 algorithm_version text not null default 'hl-sm2-v1' check(algorithm_version='hl-sm2-v1'),
 state text not null default 'new' check(state in ('new','learning','review','relearning','suspended')),
 step integer not null default 0 check(step between 0 and 1),
 due_at timestamptz not null default now(), interval_days integer not null default 0 check(interval_days between 0 and 36500),
 ease_factor numeric(5,2) not null default 2.50 check(ease_factor between 1.30 and 3.00),
 repetitions integer not null default 0 check(repetitions>=0), lapses integer not null default 0 check(lapses>=0),
 consecutive_successes integer not null default 0 check(consecutive_successes>=0),
 last_reviewed_at timestamptz, version bigint not null default 0 check(version>=0),
 archived_at timestamptz, suspended_snapshot jsonb,
 unique(user_id,vocabulary_id,card_type), unique(id,user_id),
 check(archived_at is null or state='suspended')
);
create index review_cards_due_idx on public.review_cards(user_id,due_at) where archived_at is null and state<>'suspended';
create table public.review_events (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 card_id uuid not null, idempotency_key uuid not null, request_fingerprint text not null,
 request_payload jsonb not null, rating smallint not null check(rating between 1 and 4),
 response_ms integer check(response_ms between 0 and 3600000),
 reviewed_at timestamptz not null, algorithm_version text not null,
 previous_state jsonb not null, next_state jsonb not null, result jsonb not null,
 unique(user_id,idempotency_key),
 foreign key(card_id,user_id) references public.review_cards(id,user_id) on delete restrict
);
create index review_events_history_idx on public.review_events(user_id,reviewed_at desc);
create table public.card_lifecycle_events (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 card_id uuid not null, action text not null check(action in ('suspend','resume','archive')),
 occurred_at timestamptz not null default now(), previous_state jsonb not null, next_state jsonb not null,
 foreign key(card_id,user_id) references public.review_cards(id,user_id) on delete restrict
);
do $$ declare t text; begin
 foreach t in array array['review_cards','review_events','card_lifecycle_events'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public,anon,authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
  execute format('create policy %I on public.%I for select to authenticated using ((select private.is_learner()) and user_id=(select auth.uid()))',t||'_read',t);
 end loop;
end $$;
create function private.reject_history_mutation() returns trigger language plpgsql set search_path='' as $$
begin
 -- Only an operator-led account-erasure transaction can remove history.
 if TG_OP='DELETE' and current_user='postgres'
    and current_setting('hanlearn.account_erasure',true)='on' then return old; end if;
 raise exception 'append_only_history' using errcode='42501';
end $$;
revoke all on function private.reject_history_mutation() from public,anon,authenticated;
create trigger review_events_append_only before update or delete on public.review_events
 for each row execute function private.reject_history_mutation();
create trigger lifecycle_append_only before update or delete on public.card_lifecycle_events
 for each row execute function private.reject_history_mutation();

-- Pure deterministic transition; no wall-clock read or database writes.
create function private.srs_next(p jsonb, rating integer, at_time timestamptz) returns jsonb
language plpgsql immutable set search_path='' as $$
declare
 st text:=p->>'state'; k integer:=(p->>'step')::integer;
 i integer:=(p->>'interval_days')::integer; old_e numeric:=(p->>'ease_factor')::numeric;
 e numeric; q integer; delay_seconds integer; successes integer:=(p->>'consecutive_successes')::integer;
 reps integer:=(p->>'repetitions')::integer; lapses integer:=(p->>'lapses')::integer;
begin
 if rating is null or rating not between 1 and 4 or at_time is null
   or st not in ('new','learning','review','relearning') then
   raise exception 'invalid_transition' using errcode='22023';
 end if;
 q:=case rating when 1 then 1 when 2 then 3 when 3 then 4 else 5 end;
 e:=greatest(1.30,least(3.00,round(old_e + (0.1-(5-q)*(0.08+(5-q)*0.02)),2)));
 if st='review' then
  if rating=1 then st:='relearning'; k:=0; delay_seconds:=600; lapses:=lapses+1; successes:=0;
  else
   i:=least(36500,greatest(i+1,ceil(i*case rating when 2 then 1.2 when 3 then old_e else old_e*1.3 end)::integer));
   delay_seconds:=null; -- days use interval arithmetic below
   successes:=case when rating>=3 then successes+1 else 0 end;
  end if;
 elsif st='relearning' then
  successes:=0;
  if rating=1 then delay_seconds:=600;
  elsif rating=2 then delay_seconds:=900;
  else st:='review'; k:=0; i:=greatest(case rating when 3 then 1 else 2 end,ceil(i*case rating when 3 then 0.5 else 0.75 end)::integer);
   delay_seconds:=null;
  end if;
 else
  successes:=0; st:='learning'; i:=0;
  if rating=1 then k:=0; delay_seconds:=60;
  elsif rating=2 then delay_seconds:=case k when 0 then 360 else 600 end;
  elsif rating=3 and k=0 then k:=1; delay_seconds:=600;
  else st:='review'; k:=0; i:=case rating when 4 then 4 else 1 end; delay_seconds:=null;
  end if;
 end if;
 return jsonb_build_object('state',st,'step',k,'interval_days',i,'ease_factor',e,
  'repetitions',reps+1,'lapses',lapses,'consecutive_successes',successes,
  'last_reviewed_at',at_time,'due_at',at_time +
    case when st='review' then i*interval '24 hours' else delay_seconds*interval '1 second' end);
end $$;
revoke all on function private.srs_next(jsonb,integer,timestamptz) from public,anon,authenticated;

create function private.submit_review(p_card_id uuid,p_rating integer,p_response_ms integer,
 p_expected_version bigint,p_idempotency_key uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 u uuid:=private.require_learner(); c public.review_cards; ev public.review_events;
 payload jsonb; fp text; nxt jsonb; res jsonb; ts timestamptz;
begin
 if p_card_id is null or p_idempotency_key is null or p_expected_version is null or p_expected_version<0
  or p_rating is null or p_rating not between 1 and 4
  or (p_response_ms is not null and p_response_ms not between 0 and 3600000) then
  raise exception 'invalid_request' using errcode='22023';
 end if;
 payload:=jsonb_build_object('cardId',p_card_id,'rating',p_rating,'responseMs',p_response_ms,'expectedVersion',p_expected_version);
 fp:=encode(sha256(convert_to(payload::text,'UTF8')),'hex');
 -- Serialize the identity first, even if a conflicting payload names another card.
 perform pg_advisory_xact_lock(hashtextextended(u::text||p_idempotency_key::text,0));
 select * into ev from public.review_events where user_id=u and idempotency_key=p_idempotency_key;
 if found then
  if ev.request_fingerprint<>fp or ev.request_payload<>payload then
   raise exception 'idempotency_conflict' using errcode='PT409';
  end if;
  return ev.result; -- replay precedes due/version/archive checks
 end if;
 select * into c from public.review_cards where id=p_card_id and user_id=u for update;
 if not found then raise exception 'card_not_found' using errcode='PT404'; end if;
 if c.version<>p_expected_version then raise exception 'stale_card_version' using errcode='PT409'; end if;
 if c.archived_at is not null or c.state='suspended' then raise exception 'card_inactive' using errcode='PT409'; end if;
 if not exists(select 1 from public.vocabulary v where v.id=c.vocabulary_id and v.status='published'
  and (c.card_type<>'audio_to_hanzi' or exists(select 1 from public.audio_assets a where a.id=v.audio_asset_id and a.status='published'))) then
  raise exception 'content_unavailable' using errcode='PT409';
 end if;
 ts:=clock_timestamp(); -- after waiting for lock; client never supplies review time
 if c.due_at>ts then raise exception 'card_not_due' using errcode='PT409'; end if;
 nxt:=private.srs_next(to_jsonb(c),p_rating,ts);
 update public.review_cards set state=nxt->>'state',step=(nxt->>'step')::integer,
  due_at=(nxt->>'due_at')::timestamptz,interval_days=(nxt->>'interval_days')::integer,
  ease_factor=(nxt->>'ease_factor')::numeric,repetitions=(nxt->>'repetitions')::integer,
  lapses=(nxt->>'lapses')::integer,consecutive_successes=(nxt->>'consecutive_successes')::integer,
  last_reviewed_at=ts,version=c.version+1 where id=c.id;
 res:=jsonb_build_object('status','ok','cardId',c.id,'version',c.version+1,'nextDueAt',nxt->'due_at',
  'intervalDays',nxt->'interval_days','newState',nxt->'state','reviewedAt',ts,'algorithmVersion',c.algorithm_version);
 insert into public.review_events(user_id,card_id,idempotency_key,request_fingerprint,request_payload,
  rating,response_ms,reviewed_at,algorithm_version,previous_state,next_state,result)
 values(u,c.id,p_idempotency_key,fp,payload,p_rating,p_response_ms,ts,c.algorithm_version,to_jsonb(c),
  to_jsonb(c)||nxt||jsonb_build_object('version',c.version+1),res);
 return res;
end $$;
revoke all on function private.submit_review(uuid,integer,integer,bigint,uuid) from public,anon,authenticated;
grant execute on function private.submit_review(uuid,integer,integer,bigint,uuid) to authenticated;
create function public.submit_review(p_card_id uuid,p_rating integer,p_response_ms integer,
 p_expected_version bigint,p_idempotency_key uuid) returns jsonb language sql security invoker set search_path=''
as $$ select private.submit_review(p_card_id,p_rating,p_response_ms,p_expected_version,p_idempotency_key) $$;
revoke all on function public.submit_review(uuid,integer,integer,bigint,uuid) from public,anon,authenticated;
grant execute on function public.submit_review(uuid,integer,integer,bigint,uuid) to authenticated;

create function private.set_card_status(p_card_id uuid,p_action text,p_expected_version bigint) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.require_learner(); c public.review_cards; updated public.review_cards;
begin
 select * into c from public.review_cards where id=p_card_id and user_id=u for update;
 if not found then raise exception 'card_not_found' using errcode='PT404'; end if;
 if p_expected_version is null or c.version<>p_expected_version or c.archived_at is not null then
  raise exception 'stale_or_archived' using errcode='PT409'; end if;
 if p_action in ('suspend','archive') then
  update public.review_cards set suspended_snapshot=case when state<>'suspended' then to_jsonb(c) else suspended_snapshot end,
   state='suspended', archived_at=case when p_action='archive' then clock_timestamp() else null end,
   version=version+1 where id=c.id returning * into updated;
 elsif p_action='resume' and c.state='suspended' and c.suspended_snapshot is not null then
  update public.review_cards set state=c.suspended_snapshot->>'state',
   due_at=greatest(clock_timestamp(),(c.suspended_snapshot->>'due_at')::timestamptz),
   suspended_snapshot=null,version=version+1 where id=c.id returning * into updated;
 else raise exception 'invalid_action' using errcode='22023'; end if;
 insert into public.card_lifecycle_events(user_id,card_id,action,previous_state,next_state)
 values(u,c.id,p_action,to_jsonb(c),to_jsonb(updated));
 return to_jsonb(updated);
end $$;
revoke all on function private.set_card_status(uuid,text,bigint) from public,anon,authenticated;
grant execute on function private.set_card_status(uuid,text,bigint) to authenticated;
create function public.set_card_status(p_card_id uuid,p_action text,p_expected_version bigint) returns jsonb
language sql security invoker set search_path='' as $$ select private.set_card_status(p_card_id,p_action,p_expected_version) $$;
revoke all on function public.set_card_status(uuid,text,bigint) from public,anon,authenticated;
grant execute on function public.set_card_status(uuid,text,bigint) to authenticated;

-- Computed, never client-writable. Audio not required for MVP lexical mastery.
create view public.vocabulary_progress with (security_invoker=true) as
 select user_id,vocabulary_id,
 case when count(*) filter(where card_type in ('hanzi_to_vi','vi_to_hanzi') and state='review'
   and archived_at is null and interval_days>=21 and consecutive_successes>=3)=2 then 'mastered'
 when bool_or(last_reviewed_at is not null) then 'learning' else 'introduced' end as mastery_state
 from public.review_cards group by user_id,vocabulary_id;
revoke all on public.vocabulary_progress from public,anon,authenticated;
grant select on public.vocabulary_progress to authenticated;

-- Migration: 202611120003_quiz.sql
create table public.lesson_quizzes (
 id uuid primary key default gen_random_uuid(), lesson_id uuid not null unique references public.lessons(id),
 revision integer not null default 1 check(revision>0), title text not null,
 published_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published')),
  review_status text not null default 'pending' check (review_status in ('pending','approved')),
  source_uri text, content_license text, reviewed_by text, reviewed_at timestamptz,
  check (status <> 'published' or (review_status = 'approved'
    and nullif(btrim(source_uri),'') is not null and nullif(btrim(content_license),'') is not null
    and nullif(btrim(reviewed_by),'') is not null and reviewed_at is not null))
);
create table public.quiz_questions (
 id uuid primary key default gen_random_uuid(), quiz_id uuid not null references public.lesson_quizzes(id),
 sort_order integer not null, prompt text not null,
 choices jsonb not null check(jsonb_typeof(choices)='array' and jsonb_array_length(choices) between 2 and 6),
 
  status text not null default 'draft' check (status in ('draft','published')),
  review_status text not null default 'pending' check (review_status in ('pending','approved')),
  source_uri text, content_license text, reviewed_by text, reviewed_at timestamptz,
  check (status <> 'published' or (review_status = 'approved'
    and nullif(btrim(source_uri),'') is not null and nullif(btrim(content_license),'') is not null
    and nullif(btrim(reviewed_by),'') is not null and reviewed_at is not null)), unique(quiz_id,sort_order), unique(id,quiz_id)
);
create table private.quiz_answer_keys (
 question_id uuid primary key references public.quiz_questions(id),
 correct_index integer not null check(correct_index between 0 and 5), explanation_vi text
);
create table public.quiz_attempts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 quiz_id uuid not null references public.lesson_quizzes(id), start_key uuid not null,
 started_at timestamptz not null default clock_timestamp(), submitted_at timestamptz,
 correct_count integer, question_count integer, passed boolean,
 submission_payload jsonb, submission_fingerprint text, result jsonb,
 unique(user_id,start_key), unique(id,user_id),
 check((submitted_at is null and correct_count is null and question_count is null and passed is null and result is null)
 or (submitted_at is not null and correct_count between 0 and question_count and question_count between 5 and 10 and passed is not null and result is not null))
);
create table public.quiz_responses (
 attempt_id uuid not null, user_id uuid not null,
 question_id uuid not null references public.quiz_questions(id),
 answer_index integer, is_correct boolean not null,
 primary key(attempt_id,question_id),
 foreign key(attempt_id,user_id) references public.quiz_attempts(id,user_id)
);
revoke all on private.quiz_answer_keys from public,anon,authenticated;
alter table private.quiz_answer_keys enable row level security;
alter table public.lesson_quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_responses enable row level security;
revoke all on public.lesson_quizzes,public.quiz_questions,public.quiz_attempts,public.quiz_responses from public,anon,authenticated;
grant select on public.lesson_quizzes,public.quiz_questions to authenticated;
-- Never expose fingerprints/payload/result internals via table reads.
grant select(id,user_id,quiz_id,started_at,submitted_at,correct_count,question_count,passed) on public.quiz_attempts to authenticated;
grant select on public.quiz_responses to authenticated;
create policy quizzes_read on public.lesson_quizzes for select to authenticated
 using ((select private.is_learner()) and status='published' and exists(select 1 from public.lessons l where l.id=lesson_id));
create policy quiz_questions_read on public.quiz_questions for select to authenticated
 using ((select private.is_learner()) and status='published' and exists(select 1 from public.lesson_quizzes q where q.id=quiz_id));
create policy quiz_attempts_read on public.quiz_attempts for select to authenticated
 using ((select private.is_learner()) and user_id=(select auth.uid()));
create policy quiz_responses_read on public.quiz_responses for select to authenticated
 using ((select private.is_learner()) and user_id=(select auth.uid())
 and exists(select 1 from public.quiz_attempts a where a.id=attempt_id and a.submitted_at is not null));

-- A published quiz revision and its keys/questions never change. Create a new lesson revision for content corrections in MVP.
create function private.freeze_quiz() returns trigger language plpgsql security definer set search_path='' as $$
declare qid uuid; sealed timestamptz; n integer;
begin
 if TG_TABLE_NAME='lesson_quizzes' then
  if TG_OP<>'INSERT' and old.published_at is not null then
   raise exception 'published_quiz_immutable' using errcode='55000';
  end if;
  if TG_OP='DELETE' then return old; end if;
  if new.status='published' then
   select count(*) into n from public.quiz_questions q join private.quiz_answer_keys k on k.question_id=q.id
   where q.quiz_id=new.id and q.status='published' and k.correct_index<jsonb_array_length(q.choices);
   if n not between 5 and 10 or n<>(select count(*) from public.quiz_questions where quiz_id=new.id) then
    raise exception 'quiz_requires_5_to_10_reviewed_keyed_questions' using errcode='23514';
   end if;
   new.published_at:=clock_timestamp();
  elsif new.published_at is not null then
   raise exception 'cannot_forge_published_at' using errcode='23514';
  end if;
  return new;
 end if;
 if TG_TABLE_NAME='quiz_questions' then
  if TG_OP<>'INSERT' then
   select published_at into sealed from public.lesson_quizzes where id=old.quiz_id;
   if sealed is not null then raise exception 'published_quiz_immutable' using errcode='55000'; end if;
  end if;
  if TG_OP<>'DELETE' then qid:=new.quiz_id; end if;
 else
  if TG_OP<>'INSERT' then
   select z.published_at into sealed from public.quiz_questions q join public.lesson_quizzes z on z.id=q.quiz_id where q.id=old.question_id;
   if sealed is not null then raise exception 'published_quiz_immutable' using errcode='55000'; end if;
  end if;
  if TG_OP<>'DELETE' then select quiz_id into qid from public.quiz_questions where id=new.question_id; end if;
 end if;
 select published_at into sealed from public.lesson_quizzes where id=qid;
 if sealed is not null then raise exception 'published_quiz_immutable' using errcode='55000'; end if;
 if TG_OP='DELETE' then return old; end if;
 return new;
end $$;
revoke all on function private.freeze_quiz() from public,anon,authenticated;
create trigger seal_quiz before insert or update or delete on public.lesson_quizzes for each row execute function private.freeze_quiz();
create trigger seal_questions before insert or update or delete on public.quiz_questions for each row execute function private.freeze_quiz();
create trigger seal_keys before insert or update or delete on private.quiz_answer_keys for each row execute function private.freeze_quiz();

create function private.finish_lesson(p_user uuid,p_lesson uuid) returns boolean
language plpgsql set search_path='' as $$
declare completed boolean;
begin
 -- Caller must hold the per-user/lesson lock and have checked visibility.
 update public.lesson_progress p set completed_at=coalesce(p.completed_at,clock_timestamp())
 where p.user_id=p_user and p.lesson_id=p_lesson and p.studied_at is not null
 and exists(select 1 from public.quiz_attempts a join public.lesson_quizzes q on q.id=a.quiz_id
  where a.user_id=p_user and q.lesson_id=p_lesson and a.passed=true);
 completed:=found;
 if completed then
  insert into public.review_cards(user_id,vocabulary_id,card_type)
  select p_user,v.id,d.direction from public.lesson_vocabulary lv join public.vocabulary v on v.id=lv.vocabulary_id
  cross join (values('hanzi_to_vi'),('vi_to_hanzi'),('audio_to_hanzi')) d(direction)
  where lv.lesson_id=p_lesson and v.status='published'
  and (d.direction<>'audio_to_hanzi' or exists(select 1 from public.audio_assets a where a.id=v.audio_asset_id and a.status='published'))
  order by v.id,d.direction
  on conflict(user_id,vocabulary_id,card_type) do nothing;
 end if;
 return completed;
end $$;
revoke all on function private.finish_lesson(uuid,uuid) from public,anon,authenticated;

create function private.mark_lesson_studied(p_lesson_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.require_learner(); done boolean;
begin
 if not private.lesson_visible(p_lesson_id) then raise exception 'lesson_not_found' using errcode='PT404'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text||p_lesson_id::text,1));
 insert into public.lesson_progress(user_id,lesson_id,studied_at) values(u,p_lesson_id,clock_timestamp())
 on conflict(user_id,lesson_id) do update set studied_at=coalesce(public.lesson_progress.studied_at,excluded.studied_at);
 done:=private.finish_lesson(u,p_lesson_id);
 return jsonb_build_object('completed',done);
end $$;

create function private.start_quiz(p_quiz_id uuid,p_idempotency_key uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.require_learner(); a public.quiz_attempts; lid uuid;
begin
 if p_idempotency_key is null then raise exception 'invalid_request' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text||p_idempotency_key::text,2));
 select * into a from public.quiz_attempts where user_id=u and start_key=p_idempotency_key;
 if found then
  if a.quiz_id is distinct from p_quiz_id then raise exception 'idempotency_conflict' using errcode='PT409'; end if;
  return jsonb_build_object('attemptId',a.id,'quizId',a.quiz_id);
 end if;
 select lesson_id into lid from public.lesson_quizzes where id=p_quiz_id and status='published';
 if lid is null or not private.lesson_visible(lid) then raise exception 'quiz_not_found' using errcode='PT404'; end if;
 insert into public.quiz_attempts(user_id,quiz_id,start_key) values(u,p_quiz_id,p_idempotency_key) returning * into a;
 return jsonb_build_object('attemptId',a.id,'quizId',a.quiz_id);
end $$;

create function private.submit_quiz(p_attempt_id uuid,p_answers jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.require_learner(); a public.quiz_attempts; lid uuid; fp text; n integer; correct integer; res jsonb;
begin
 if p_answers is null or jsonb_typeof(p_answers)<>'object' then raise exception 'invalid_answers' using errcode='22023'; end if;
 fp:=encode(sha256(convert_to(p_answers::text,'UTF8')),'hex');
 select * into a from public.quiz_attempts where id=p_attempt_id and user_id=u for update;
 if not found then raise exception 'attempt_not_found' using errcode='PT404'; end if;
 if a.submitted_at is not null then
  if a.submission_fingerprint<>fp or a.submission_payload<>p_answers then raise exception 'submission_conflict' using errcode='PT409'; end if;
  return a.result;
 end if;
 select lesson_id into lid from public.lesson_quizzes where id=a.quiz_id and status='published';
 if lid is null or not private.lesson_visible(lid) then raise exception 'quiz_unavailable' using errcode='PT409'; end if;
 if exists(select 1 from jsonb_each(p_answers) x where not exists(
  select 1 from public.quiz_questions q where q.quiz_id=a.quiz_id and q.id::text=x.key
  and jsonb_typeof(x.value)='number' and x.value::text ~ '^[0-5]$'
  and (x.value::text)::integer<jsonb_array_length(q.choices))) then
  raise exception 'invalid_answer_index_or_question' using errcode='22023';
 end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text||lid::text,1));
 insert into public.quiz_responses(attempt_id,user_id,question_id,answer_index,is_correct)
 select a.id,u,q.id,(p_answers->>q.id::text)::integer,
  coalesce((p_answers->>q.id::text)::integer=k.correct_index,false)
 from public.quiz_questions q join private.quiz_answer_keys k on k.question_id=q.id where q.quiz_id=a.quiz_id;
 select count(*),count(*) filter(where is_correct) into n,correct from public.quiz_responses where attempt_id=a.id;
 if n not between 5 and 10 then raise exception 'invalid_quiz' using errcode='23514'; end if;
 res:=jsonb_build_object('attemptId',a.id,'correctCount',correct,'questionCount',n,
  'scorePercent',round(100.0*correct/n,2),'passed',correct*100>=n*80);
 update public.quiz_attempts set submitted_at=clock_timestamp(),correct_count=correct,question_count=n,
  passed=correct*100>=n*80,submission_payload=p_answers,submission_fingerprint=fp,result=res where id=a.id;
 perform private.finish_lesson(u,lid);
 return res;
end $$;

revoke all on function private.mark_lesson_studied(uuid) from public,anon,authenticated;
grant execute on function private.mark_lesson_studied(uuid) to authenticated;
create function public.mark_lesson_studied(p_lesson_id uuid) returns jsonb language sql security invoker set search_path=''
 as $$ select private.mark_lesson_studied(p_lesson_id) $$;
revoke all on function public.mark_lesson_studied(uuid) from public,anon,authenticated;
grant execute on function public.mark_lesson_studied(uuid) to authenticated;

revoke all on function private.start_quiz(uuid,uuid) from public,anon,authenticated;
grant execute on function private.start_quiz(uuid,uuid) to authenticated;
create function public.start_quiz(p_quiz_id uuid,p_idempotency_key uuid) returns jsonb language sql security invoker set search_path=''
 as $$ select private.start_quiz(p_quiz_id,p_idempotency_key) $$;
revoke all on function public.start_quiz(uuid,uuid) from public,anon,authenticated;
grant execute on function public.start_quiz(uuid,uuid) to authenticated;

revoke all on function private.submit_quiz(uuid,jsonb) from public,anon,authenticated;
grant execute on function private.submit_quiz(uuid,jsonb) to authenticated;
create function public.submit_quiz(p_attempt_id uuid,p_answers jsonb) returns jsonb language sql security invoker set search_path=''
 as $$ select private.submit_quiz(p_attempt_id,p_answers) $$;
revoke all on function public.submit_quiz(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.submit_quiz(uuid,jsonb) to authenticated;

-- Migration: 202611120004_plans_sessions.sql
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

-- Migration: 202611120005_learner_access.sql
-- Sprint 1 Auth bootstrap: distinguish an authorized learner without a profile
-- from an authenticated outsider without exposing private through PostgREST.
-- Read-only; reuses the existing verified-UUID allowlist predicate unchanged.
create function public.get_learner_access() returns boolean
language sql stable security invoker set search_path=''
as $$ select private.is_learner() $$;
revoke all on function public.get_learner_access() from public,anon,authenticated;
grant execute on function public.get_learner_access() to authenticated;

-- Migration: 202611120006_catalog_queries.sql
-- Read-only Sprint 1 query RPCs. SECURITY INVOKER preserves all existing RLS.
-- No content/answers/private rows are exposed and no domain transitions change.
create function public.get_due_review_count() returns bigint
language sql stable security invoker set search_path='' as $$
 select count(*) from public.review_cards c
 join public.vocabulary v on v.id=c.vocabulary_id
 where c.user_id=auth.uid() and c.archived_at is null and c.state<>'suspended'
 and c.due_at<=now() and v.status='published'
 and (c.card_type<>'audio_to_hanzi' or exists(
   select 1 from public.audio_assets a where a.id=v.audio_asset_id and a.status='published'))
$$;
revoke all on function public.get_due_review_count() from public,anon,authenticated;
grant execute on function public.get_due_review_count() to authenticated;

create function public.search_vocabulary(p_syllabus_id uuid,p_query text default '',
 p_level integer default null,p_offset integer default 0,p_limit integer default 20)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 if p_query is null or length(p_query)>100 or p_offset is null or p_offset<0 or p_offset>100000
 or p_limit is null or p_limit not between 1 and 50
 or (p_level is not null and p_level not between 1 and 9) then
  raise exception 'invalid_search' using errcode='22023';
 end if;
 -- Literal substring matching: user text is a SQL parameter, never filter syntax.
 with filtered as (
  select v.id,v.simplified,v.pinyin_marked,v.meaning_vi,sv.introduced_level,s.code syllabus_code
  from public.vocabulary v join public.syllabus_vocabulary sv on sv.vocabulary_id=v.id
  join public.syllabus_versions s on s.id=sv.syllabus_id
  where sv.syllabus_id=p_syllabus_id and (p_level is null or sv.introduced_level=p_level)
   and strpos(lower(concat_ws(' ',v.simplified,v.traditional,v.pinyin_marked,v.pinyin_numeric,v.meaning_vi)),lower(btrim(p_query)))>0
 ), page as (select * from filtered order by simplified,pinyin_marked,id offset p_offset limit p_limit)
 select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(p)) from page p),'[]'::jsonb),
  'total',(select count(*) from filtered)) into result;
 return result;
end $$;
revoke all on function public.search_vocabulary(uuid,text,integer,integer,integer) from public,anon,authenticated;
grant execute on function public.search_vocabulary(uuid,text,integer,integer,integer) to authenticated;
