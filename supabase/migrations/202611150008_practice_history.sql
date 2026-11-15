-- Migration: 202611150008_practice_history.sql
-- Description: Learner practice history table with user isolation and RLS

create table if not exists public.learner_practice_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  practice_set_id text not null,
  skill text not null default 'general',
  best_score integer not null,
  total_questions integer not null,
  completed_at timestamptz not null default clock_timestamp(),
  metadata jsonb,
  unique (user_id, practice_set_id)
);

alter table public.learner_practice_history enable row level security;
revoke all on public.learner_practice_history from public, anon, authenticated;
grant select, insert, update on public.learner_practice_history to authenticated;

create policy learner_practice_history_read on public.learner_practice_history
  for select to authenticated
  using ((select private.is_learner()) and user_id = (select auth.uid()));

create policy learner_practice_history_write on public.learner_practice_history
  for insert to authenticated
  with check ((select private.is_learner()) and user_id = (select auth.uid()));

create policy learner_practice_history_update on public.learner_practice_history
  for update to authenticated
  using ((select private.is_learner()) and user_id = (select auth.uid()))
  with check ((select private.is_learner()) and user_id = (select auth.uid()));
