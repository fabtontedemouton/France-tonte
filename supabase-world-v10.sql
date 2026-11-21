-- Shearing France WORLD V10 — source submission and human review queue
-- Run in Supabase SQL Editor before enabling the WORLD intake.
create table if not exists public.world_import_queue (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references auth.users(id) on delete cascade,
  source_name text not null,
  country text,
  source_url text,
  notes text,
  records jsonb not null default '[]'::jsonb,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  imported_count integer not null default 0,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);
create index if not exists world_import_queue_status_created_idx
  on public.world_import_queue(status, created_at desc);
create index if not exists world_import_queue_submitter_idx
  on public.world_import_queue(submitted_by, created_at desc);
alter table public.world_import_queue enable row level security;

drop policy if exists "world queue submit own" on public.world_import_queue;
create policy "world queue submit own" on public.world_import_queue
  for insert to authenticated
  with check (auth.uid() = submitted_by);

drop policy if exists "world queue read own or admin" on public.world_import_queue;
create policy "world queue read own or admin" on public.world_import_queue
  for select to authenticated
  using (auth.uid() = submitted_by or public.is_sf_admin());

drop policy if exists "world queue review admin" on public.world_import_queue;
create policy "world queue review admin" on public.world_import_queue
  for update to authenticated
  using (public.is_sf_admin())
  with check (public.is_sf_admin());
