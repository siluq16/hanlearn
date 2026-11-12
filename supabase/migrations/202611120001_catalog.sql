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

