-- FundBridge — notifications + reviews
-- Run this AFTER schema.sql and 002_core_modules.sql, same way as before
-- (SQL Editor → New query → paste → Run).

-- 1. Notifications ---------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can mark their own notifications read"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id);

-- Auto-notify a founder when their project gets a new bid.
create function public.notify_founder_new_bid()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_founder_id uuid;
  v_title text;
begin
  select s.founder_id, p.title into v_founder_id, v_title
  from public.projects p
  join public.startups s on s.id = p.startup_id
  where p.id = new.project_id;

  insert into public.notifications (user_id, message, link)
  values (v_founder_id, 'New bid on "' || v_title || '"', '/dashboard/founder/projects/' || new.project_id);

  return new;
end;
$$;

create trigger on_bid_created
  after insert on public.bids
  for each row execute procedure public.notify_founder_new_bid();

-- Auto-notify a bidder when their bid is accepted or rejected.
create function public.notify_bidder_bid_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_title text;
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status not in ('accepted', 'rejected') then
    return new;
  end if;

  select title into v_title from public.projects where id = new.project_id;

  insert into public.notifications (user_id, message, link)
  values (
    new.bidder_id,
    'Your bid on "' || v_title || '" was ' || new.status,
    '/dashboard/bidder/projects/' || new.project_id
  );

  return new;
end;
$$;

create trigger on_bid_status_changed
  after update on public.bids
  for each row execute procedure public.notify_bidder_bid_status();

-- Auto-notify a founder when their startup receives an investment.
create function public.notify_founder_new_investment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_founder_id uuid;
  v_name text;
begin
  select founder_id, name into v_founder_id, v_name
  from public.startups where id = new.startup_id;

  insert into public.notifications (user_id, message, link)
  values (
    v_founder_id,
    '$' || new.amount || ' invested in ' || v_name,
    '/dashboard/founder'
  );

  return new;
end;
$$;

create trigger on_investment_created
  after insert on public.investments
  for each row execute procedure public.notify_founder_new_investment();

-- 2. Reviews -----------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  investor_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now(),
  unique (startup_id, investor_id)
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by authenticated users"
  on public.reviews for select to authenticated using (true);

-- Only investors who have actually put money into the startup can review it.
create policy "Investors can review startups they've invested in"
  on public.reviews for insert to authenticated
  with check (
    auth.uid() = investor_id
    and exists (
      select 1 from public.investments i
      where i.startup_id = reviews.startup_id and i.investor_id = auth.uid()
    )
  );
