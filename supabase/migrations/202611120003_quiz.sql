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

