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

