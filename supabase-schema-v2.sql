-- ============================================================
-- MANE MAGIC — Schema Additions (run in Supabase SQL Editor)
-- ============================================================

-- SALONS table
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

-- PROFILES table (mirrors auth.users metadata)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'owner' check (role in ('owner', 'staff')),
  salon_id uuid references salons(id) on delete set null,
  created_at timestamptz default now()
);

-- WALK-IN CUSTOMERS (staff registers after service)
create table if not exists walk_in_customers (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  name text not null,
  phone text not null,
  service_done text,
  staff_id uuid references staff(id) on delete set null,
  visited_at timestamptz default now(),
  notes text
);

-- Add salon_id to existing tables (safe — won't fail if column exists)
alter table staff add column if not exists salon_id uuid references salons(id) on delete cascade;
alter table staff add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table staff add column if not exists email text;
alter table staff add column if not exists password_hash text;
alter table customers add column if not exists salon_id uuid references salons(id) on delete cascade;
alter table services add column if not exists salon_id uuid references salons(id) on delete cascade;
alter table appointments add column if not exists salon_id uuid references salons(id) on delete cascade;
alter table inventory add column if not exists salon_id uuid references salons(id) on delete cascade;
alter table campaigns add column if not exists salon_id uuid references salons(id) on delete cascade;
alter table revenue_daily add column if not exists salon_id uuid references salons(id) on delete cascade;

-- Add staff_id and customer_id FKs to appointments (required for billing → stylist history)
alter table appointments add column if not exists staff_id uuid references staff(id) on delete set null;
alter table appointments add column if not exists customer_id uuid references customers(id) on delete set null;
alter table appointments add column if not exists notes text;

-- Indexes for fast lookup by staff and customer
create index if not exists appointments_staff_id_idx on appointments(staff_id);
create index if not exists appointments_customer_id_idx on appointments(customer_id);

-- Auto-create profile on signup
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

  -- Auto-create salon stub for owners
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

-- Disable RLS on all tables for now
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

-- Storage bucket for salon logos (run separately if needed)
-- insert into storage.buckets (id, name, public) values ('salon-assets', 'salon-assets', true);
