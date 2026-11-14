create table if not exists public.learner_stage_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  current_stage integer not null default 0 check (current_stage between 0 and 9),
  completed_stages integer[] not null default '{}',
  updated_at timestamptz not null default clock_timestamp(),
  primary key (user_id, lesson_id)
);

alter table public.learner_stage_progress enable row level security;
revoke all on public.learner_stage_progress from public, anon, authenticated;
grant select, insert, update on public.learner_stage_progress to authenticated;

create policy learner_stage_progress_read on public.learner_stage_progress
  for select to authenticated
  using ((select private.is_learner()) and user_id = (select auth.uid()));

create policy learner_stage_progress_insert on public.learner_stage_progress
  for insert to authenticated
  with check ((select private.is_learner()) and user_id = (select auth.uid()));

create policy learner_stage_progress_update on public.learner_stage_progress
  for update to authenticated
  using ((select private.is_learner()) and user_id = (select auth.uid()))
  with check ((select private.is_learner()) and user_id = (select auth.uid()));
