-- ============================================================
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. SALONS
create table if not exists salons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null default '',
  logo_url text,
  phone text,
  email text,
  address text,
  is_profile_complete boolean default false,
  created_at timestamptz default now()
);

-- 2. PROFILES
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'owner' check (role in ('owner', 'staff')),
  salon_id uuid,
  created_at timestamptz default now()
);

-- 3. WALK-IN CUSTOMERS
create table if not exists walk_in_customers (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid,
  name text not null,
  phone text not null,
  service_done text,
  staff_id uuid,
  visited_at timestamptz default now(),
  notes text
);

-- 4. Add salon_id to existing tables
alter table staff add column if not exists salon_id uuid;
alter table staff add column if not exists user_id uuid;
alter table customers add column if not exists salon_id uuid;
alter table services add column if not exists salon_id uuid;
alter table appointments add column if not exists salon_id uuid;
alter table inventory add column if not exists salon_id uuid;
alter table campaigns add column if not exists salon_id uuid;
alter table revenue_daily add column if not exists salon_id uuid;

-- 5. Disable RLS on all tables
alter table salons disable row level security;
alter table profiles disable row level security;
alter table walk_in_customers disable row level security;
alter table staff disable row level security;
alter table customers disable row level security;
alter table services disable row level security;
alter table appointments disable row level security;
alter table inventory disable row level security;
alter table campaigns disable row level security;
alter table revenue_daily disable row level security;
alter table branches disable row level security;

-- 6. Auto-create profile + salon stub on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'owner')
  )
  on conflict (id) do nothing;

  if coalesce(new.raw_user_meta_data->>'role', 'owner') = 'owner' then
    insert into public.salons (owner_id)
    values (new.id)
    on conflict (owner_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Backfill profile + salon for existing user (caremachty@gmail.com)
-- This inserts your existing account into profiles and salons
insert into public.profiles (id, full_name, role)
select id, raw_user_meta_data->>'full_name', 'owner'
from auth.users
on conflict (id) do nothing;

insert into public.salons (owner_id)
select id from auth.users
where raw_user_meta_data->>'role' = 'owner' or raw_user_meta_data->>'role' is null
on conflict (owner_id) do nothing;
