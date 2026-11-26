-- Wallofolio database schema for Supabase.
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Then change the email on the last line to your own and run that line too.

create extension if not exists pgcrypto;

-- 1. Portfolios ---------------------------------------------------------------
create table if not exists public.portfolios (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null check (char_length(name) between 2 and 80),
  title         text not null check (char_length(title) between 2 and 80),
  company       text check (char_length(company) <= 80),
  industry      text check (char_length(industry) <= 60),
  country       text check (char_length(country) <= 60),
  years         int  not null default 0 check (years between 0 and 50),
  domains       text[] not null check (
                  cardinality(domains) between 1 and 3
                  and domains <@ array['sales','marketing','founders-office','chief-of-staff',
                                       'finance','consulting','supply-chain','hr','others']
                ),
  url           text not null check (url ~* '^https://[^ ]+$' and char_length(url) <= 300),
  open_to_work  boolean not null default false,
  status        text not null default 'pending' check (status in ('pending','approved','rejected'))
);

create index if not exists portfolios_status_created_idx on public.portfolios (status, created_at desc);

-- 2. Admins (who may approve submissions) -------------------------------------
-- No policies on this table, so the website can never read or change it.
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 3. Row level security on portfolios ------------------------------------------
alter table public.portfolios enable row level security;

drop policy if exists "Public reads approved portfolios" on public.portfolios;
create policy "Public reads approved portfolios"
  on public.portfolios for select
  to anon, authenticated
  using (status = 'approved' or public.is_admin());

drop policy if exists "Anyone can submit a pending portfolio" on public.portfolios;
create policy "Anyone can submit a pending portfolio"
  on public.portfolios for insert
  to anon, authenticated
  with check (status = 'pending');

drop policy if exists "Admins update portfolios" on public.portfolios;
create policy "Admins update portfolios"
  on public.portfolios for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete portfolios" on public.portfolios;
create policy "Admins delete portfolios"
  on public.portfolios for delete
  to authenticated
  using (public.is_admin());

-- 4. API access (needed if "Grant API access to new tables automatically" was off) --
grant usage on schema public to anon, authenticated;
grant select, insert on public.portfolios to anon, authenticated;
grant update, delete on public.portfolios to authenticated;
revoke all on public.admins from anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- 5. Make yourself an admin (change the email, then run) -----------------------
insert into public.admins (email) values ('you@example.com')
on conflict do nothing;
