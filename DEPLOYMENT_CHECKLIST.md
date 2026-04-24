# Salon OS — Pre-Deployment Checklist

## ✅ Code Status
- TypeScript: **0 errors**
- Production build: **Success** (635 kB gzipped)
- All routes: **Registered**
- All imports: **Resolved**

---

## 🗄️ Required Supabase SQL Migrations

Run these in **Supabase SQL Editor** before deploying:

```sql
-- 1. Add staff_id, customer_id, notes to appointments
alter table appointments add column if not exists staff_id uuid references staff(id) on delete set null;
alter table appointments add column if not exists customer_id uuid references customers(id) on delete set null;
alter table appointments add column if not exists notes text;
create index if not exists appointments_staff_id_idx on appointments(staff_id);
create index if not exists appointments_customer_id_idx on appointments(customer_id);

-- 2. Add email and password_hash to staff (for staff login without Supabase Auth)
alter table staff add column if not exists email text;
alter table staff add column if not exists password_hash text;

-- 3. Add loyalty_points to customers
alter table customers add column if not exists loyalty_points int not null default 0;

-- 4. Add loyalty_points to services and packages
alter table services add column if not exists loyalty_points int not null default 0;
alter table packages add column if not exists loyalty_points int not null default 0;

-- 5. Create packages table
create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  name text not null,
  price numeric not null,
  sessions_total int not null default 1,
  service_names text not null default '',
  loyalty_points int not null default 0,
  created_at timestamptz default now()
);
alter table packages disable row level security;

-- 6. Create customer_packages table (for package redemption tracking)
create table if not exists customer_packages (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  package_id uuid references packages(id) on delete cascade,
  sessions_used int not null default 0,
  sessions_total int not null default 1,
  created_at timestamptz default now()
);
alter table customer_packages disable row level security;

-- 7. Create demo_requests table (for landing page demo popup)
create table if not exists demo_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  salon_name text not null,
  phone text not null,
  email text,
  created_at timestamptz default now()
);
alter table demo_requests disable row level security;
```

---

## ⚙️ Configuration Updates

### 1. Update WhatsApp Number
Edit `src/lib/constants.ts`:
```ts
export const WHATSAPP_NUMBER = "91XXXXXXXXXX"; // ← Your actual number
```

### 2. Environment Variables
Verify `.env` has:
```
VITE_SUPABASE_URL=https://fjatrqrmwskwmlkkvitr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 Features Implemented

### Core Features
- ✅ **Billing & POS** — Services, products, packages, loyalty points redemption, invoice PDF + WhatsApp
- ✅ **Appointments** — Customer booking, admin calendar, auto-remove past appointments
- ✅ **Staff Management** — Login portal, customer history, earnings tracking
- ✅ **Customers** — History drawer (pending + completed), loyalty points, delete
- ✅ **Inventory** — Stock tracking, low-stock alerts, auto-decrement on sale
- ✅ **History** — All completed transactions with date filter
- ✅ **Analytics** — Revenue charts, retention, staff leaderboard
- ✅ **AI Recommendations** — Stylist matching based on customer history
- ✅ **Packages & Loyalty** — Bundle deals, points system (10 pts = ₹1)
- ✅ **Hairstyle Studio** — Camera/upload + face detection (face-api.js)

### Access Control
- ✅ Owner login via Supabase Auth
- ✅ Staff login via staff table (no emails sent)
- ✅ Protected routes for both roles

### Landing Pages
- ✅ Hero, Features, Pricing (no prices shown), Testimonials, CTA
- ✅ Demo popup (3s delay, sessionStorage)
- ✅ About, Careers, Press, Privacy, Terms, Security pages
- ✅ All "Request access" buttons → WhatsApp

---

## ⚠️ Known Limitations

1. **WhatsApp sending** — Uses `wa.me` click-to-chat (staff must press Send manually). For fully automated sending, you'd need WhatsApp Business API (paid).

2. **Hairstyle Studio** — Uses face detection + basic overlays. For photorealistic AI rendering, integrate Replicate/Stable Diffusion API (~$0.01/image).

3. **Automated reminders** — Marketing page exists but no scheduled triggers. Would need a cron job or Supabase Edge Function.

4. **Real-time sync** — Appointments have real-time subscription. Other tables don't — manual refresh needed.

---

## 🧪 Pre-Deploy Test Checklist

- [ ] Run all SQL migrations above in Supabase
- [ ] Update WhatsApp number in `src/lib/constants.ts`
- [ ] Test owner login → dashboard → billing flow
- [ ] Test staff creation → staff login → staff dashboard
- [ ] Test customer booking from `/book`
- [ ] Test billing with loyalty points redemption
- [ ] Test invoice PDF download + WhatsApp share
- [ ] Test demo popup appears after 3 seconds on landing page
- [ ] Verify all "Request access" buttons open WhatsApp correctly

---

## 📦 Deploy Command

```bash
npm run build
# Upload dist/ folder to your hosting (Vercel/Netlify/etc.)
```

---

## 🔗 Important URLs After Deploy

- Landing: `https://yourdomain.com/`
- Owner login: `https://yourdomain.com/login`
- Staff login: `https://yourdomain.com/staff/login`
- Customer booking: `https://yourdomain.com/book`
- Hairstyle Studio: `https://yourdomain.com/hairstyle-studio`

---

**Status: Ready to deploy** ✅
