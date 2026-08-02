-- FundBridge — core modules: startups, funding, bidding
-- Run this AFTER schema.sql, in the same way (SQL Editor → New query → paste → Run).

-- 1. Virtual investing balance -------------------------------------------
alter table public.profiles
  add column if not exists virtual_balance numeric not null default 100000;

-- 2. Startups --------------------------------------------------------------
create type public.startup_stage as enum ('idea', 'mvp', 'early_revenue', 'growth');

create table public.startups (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  tagline text not null,
  description text not null,
  stage public.startup_stage not null default 'idea',
  funding_goal numeric not null check (funding_goal > 0),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.startups enable row level security;

create policy "Startups are viewable by authenticated users"
  on public.startups for select to authenticated using (true);

create policy "Founders can insert their own startup"
  on public.startups for insert to authenticated
  with check (auth.uid() = founder_id);

create policy "Founders can update their own startup"
  on public.startups for update to authenticated
  using (auth.uid() = founder_id);

create policy "Admins can update any startup"
  on public.startups for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 3. Investments (virtual funding) -----------------------------------------
create table public.investments (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  investor_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now()
);

alter table public.investments enable row level security;

create policy "Investors can view their own investments"
  on public.investments for select to authenticated
  using (auth.uid() = investor_id);

create policy "Founders can view investments in their startup"
  on public.investments for select to authenticated
  using (exists (
    select 1 from public.startups s where s.id = startup_id and s.founder_id = auth.uid()
  ));

create policy "Investors can invest"
  on public.investments for insert to authenticated
  with check (auth.uid() = investor_id);

-- Atomic "invest" operation: checks + deducts virtual_balance and records
-- the investment in a single locked transaction, so two rapid clicks can't
-- double-spend the same balance.
create function public.invest_in_startup(p_startup_id uuid, p_amount numeric)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_balance numeric;
begin
  if p_amount <= 0 then
    raise exception 'Investment amount must be positive';
  end if;

  select virtual_balance into v_balance from public.profiles where id = auth.uid() for update;

  if v_balance is null then
    raise exception 'Profile not found';
  end if;

  if v_balance < p_amount then
    raise exception 'Insufficient virtual balance';
  end if;

  update public.profiles set virtual_balance = virtual_balance - p_amount where id = auth.uid();

  insert into public.investments (startup_id, investor_id, amount)
  values (p_startup_id, auth.uid(), p_amount);
end;
$$;

grant execute on function public.invest_in_startup(uuid, numeric) to authenticated;

-- 4. Projects (bidding module) ----------------------------------------------
create type public.project_status as enum ('open', 'in_progress', 'completed');
create type public.bid_status as enum ('pending', 'accepted', 'rejected');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  title text not null,
  description text not null,
  budget numeric not null check (budget > 0),
  status public.project_status not null default 'open',
  winning_bid_id uuid,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Projects are viewable by authenticated users"
  on public.projects for select to authenticated using (true);

create policy "Founders can insert projects for their startup"
  on public.projects for insert to authenticated
  with check (exists (
    select 1 from public.startups s where s.id = startup_id and s.founder_id = auth.uid()
  ));

create policy "Founders can update their own projects"
  on public.projects for update to authenticated
  using (exists (
    select 1 from public.startups s where s.id = startup_id and s.founder_id = auth.uid()
  ));

-- 5. Bids ---------------------------------------------------------------
create table public.bids (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  bidder_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric not null check (amount > 0),
  proposal text not null,
  status public.bid_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (project_id, bidder_id)
);

alter table public.bids enable row level security;

create policy "Bidders can view their own bids"
  on public.bids for select to authenticated
  using (auth.uid() = bidder_id);

create policy "Founders can view bids on their projects"
  on public.bids for select to authenticated
  using (exists (
    select 1 from public.projects p
    join public.startups s on s.id = p.startup_id
    where p.id = project_id and s.founder_id = auth.uid()
  ));

create policy "Bidders can submit bids"
  on public.bids for insert to authenticated
  with check (auth.uid() = bidder_id);

create policy "Founders can update bid status on their projects"
  on public.bids for update to authenticated
  using (exists (
    select 1 from public.projects p
    join public.startups s on s.id = p.startup_id
    where p.id = project_id and s.founder_id = auth.uid()
  ));

alter table public.projects
  add constraint projects_winning_bid_fkey foreign key (winning_bid_id) references public.bids (id);
