-- FundBridge — auth + role foundation
-- Run this in the Supabase SQL editor for your project
-- (Project → SQL Editor → New query → paste → Run).

-- 1. Role enum -----------------------------------------------------------
create type public.user_role as enum ('founder', 'investor', 'bidder', 'admin');

-- 2. Profiles table -------------------------------------------------------
-- Supabase's built-in auth.users table holds email/password only. We keep
-- app-specific fields (role, display name) in a separate `profiles` table
-- that mirrors it 1-to-1, which is the standard Supabase pattern.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'founder',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone signed in can read profiles (needed for e.g. showing a founder's
-- name on their startup page later). Tighten this later if you add
-- private fields.
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- A user can only edit their own profile row.
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 3. Auto-create a profile row whenever someone signs up ------------------
-- The role and full name are passed in from the sign-up form as
-- `options.data` and land in `raw_user_meta_data`.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'founder')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
