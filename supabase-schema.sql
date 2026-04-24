-- ============================================================
-- MANE MAGIC — Supabase Schema
-- ============================================================

-- ROLES
create type user_role as enum ('owner', 'staff');

-- PROFILES
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role user_role not null default 'owner',
  full_name text,
  created_at timestamptz default now()
);

-- SALONS
create table if not exists salons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  logo_url text,
  phone text,
  email text,
  address text,
  is_profile_complete boolean default false,
  created_at timestamptz default now()
);

-- BRANCHES (linked to Salon)
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  name text not null,
  city text not null,
  staff_count int default 0,
  mtd_revenue numeric(10,2) default 0,
  growth_pct text default '+0%',
  created_at timestamptz default now()
);

-- STAFF (linked to Auth and Salon)
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  salon_id uuid references salons(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  name text not null,
  role text not null,
  img_url text,
  rating numeric(3,1) default 5.0,
  jobs_count int default 0,
  mtd_earnings numeric(10,2) default 0,
  commission_pct int default 35,
  created_at timestamptz default now()
);

-- CUSTOMERS
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  visits int default 0,
  last_visit_at timestamptz,
  lifetime_spend numeric(10,2) default 0,
  tag text default 'Regular' check (tag in ('VIP','Regular','At risk')),
  created_at timestamptz default now()
);

-- SERVICES
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  name text not null,
  duration_min int not null,
  price numeric(10,2) not null,
  description text,
  is_product boolean default false,
  created_at timestamptz default now()
);

-- APPOINTMENTS
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  customer_id uuid references customers(id) on delete set null,
  staff_id uuid references staff(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  scheduled_at timestamptz not null,
  status text default 'confirmed' check (status in ('confirmed','pending','cancelled','completed')),
  total_price numeric(10,2),
  is_walk_in boolean default false,
  created_at timestamptz default now()
);

-- INVENTORY
create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  sku text not null,
  name text not null,
  stock int default 0,
  par_level int default 1,
  unit_cost numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- CAMPAIGNS
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  name text not null,
  channel text not null,
  audience_count int default 0,
  status text default 'Scheduled' check (status in ('Active','Scheduled','Completed')),
  open_rate text default '—',
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- REVENUE
create table if not exists revenue_daily (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  date date not null,
  amount numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table salons enable row level security;
alter table branches enable row level security;
alter table staff enable row level security;
alter table customers enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;
alter table inventory enable row level security;
alter table campaigns enable row level security;
alter table revenue_daily enable row level security;

-- 1. Profiles: Users can read their own profile
create policy "Users can read their own profile" on profiles for select using (auth.uid() = id);

-- 2. Salons: 
-- Owners can read/update their own salon
create policy "Owners can read their salon" on salons for select using (auth.uid() = owner_id);
create policy "Owners can update their salon" on salons for update using (auth.uid() = owner_id);
-- Staff can read their salon
create policy "Staff can read their salon" on salons for select using (
  exists (select 1 from staff where staff.user_id = auth.uid() and staff.salon_id = salons.id)
);
-- Public can read salon info for booking
create policy "Public can read salon info" on salons for select using (true);

-- 3. RBAC for other tables (Branches, Staff, Customers, etc.)
-- Owners have full access to their salon's data
create policy "Owners have full access" on branches for all using (exists (select 1 from salons where salons.id = branches.salon_id and salons.owner_id = auth.uid()));
create policy "Owners have full access" on staff for all using (exists (select 1 from salons where salons.id = staff.salon_id and salons.owner_id = auth.uid()));
create policy "Owners have full access" on customers for all using (exists (select 1 from salons where salons.id = customers.salon_id and salons.owner_id = auth.uid()));
create policy "Owners have full access" on services for all using (exists (select 1 from salons where salons.id = services.salon_id and salons.owner_id = auth.uid()));
create policy "Owners have full access" on appointments for all using (exists (select 1 from salons where salons.id = appointments.salon_id and salons.owner_id = auth.uid()));
create policy "Owners have full access" on inventory for all using (exists (select 1 from salons where salons.id = inventory.salon_id and salons.owner_id = auth.uid()));
create policy "Owners have full access" on campaigns for all using (exists (select 1 from salons where salons.id = campaigns.salon_id and salons.owner_id = auth.uid()));
create policy "Owners have full access" on revenue_daily for all using (exists (select 1 from salons where salons.id = revenue_daily.salon_id and salons.owner_id = auth.uid()));

-- Staff have read/update access to certain salon data
create policy "Staff can read salon data" on customers for select using (exists (select 1 from staff where staff.user_id = auth.uid() and staff.salon_id = customers.salon_id));
create policy "Staff can read salon data" on appointments for all using (exists (select 1 from staff where staff.user_id = auth.uid() and staff.salon_id = appointments.salon_id));
create policy "Staff can read salon data" on services for select using (exists (select 1 from staff where staff.user_id = auth.uid() and staff.salon_id = services.salon_id));

-- Public can read services and create appointments
create policy "Public can read services" on services for select using (true);
create policy "Public can create appointments" on appointments for insert with check (true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
