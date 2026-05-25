# Medical Store SaaS — Professional Development Plan

**Stack:** Next.js 15 (App Router) · Supabase (PostgreSQL, Auth, Storage, Realtime) · TypeScript · Tailwind CSS · shadcn/ui
**Development Method:** Vibe coding with Claude Code
**Budget:** Zero (Supabase Free Tier + Vercel Free Tier)
**Deployment Target:** Multi-tenant SaaS (each pharmacy = one tenant)

---

## Table of Contents

1. [Product Vision & Goals](#1-product-vision--goals)
2. [Core Features](#2-core-features)
3. [Tech Stack Justification](#3-tech-stack-justification)
4. [System Architecture](#4-system-architecture)
5. [Database Schema](#5-database-schema)
6. [Multi-Tenancy & Security (RLS)](#6-multi-tenancy--security-rls)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Project Structure](#8-project-structure)
9. [Development Phases (Milestones)](#9-development-phases-milestones)
10. [Working with Claude Code](#10-working-with-claude-code-vibe-coding-best-practices)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment & DevOps](#12-deployment--devops)
13. [Free-Tier Limits & Scaling Plan](#13-free-tier-limits--scaling-plan)
14. [Legal & Compliance](#14-legal--compliance)
15. [Monetization & Go-to-Market](#15-monetization--go-to-market)
16. [Risks & Mitigations](#16-risks--mitigations)
17. [Appendix: Useful Resources](#17-appendix-useful-resources)

---

## 1. Product Vision & Goals

### Vision
A cloud-based pharmacy management system that lets a medical store owner manage inventory, sales, suppliers, prescriptions, and finances from any device — with multi-pharmacy support for chains.

### Target Users
- **Independent pharmacies** (1 owner, 1–3 staff)
- **Small chains** (2–5 branches)
- **Pharmacy staff roles:** Owner / Manager / Cashier / Pharmacist

### Success Criteria (MVP)
- A pharmacy can sign up, add medicines, sell to customers, and view reports — all in under 5 minutes
- Data is fully isolated between pharmacies (zero cross-tenant data leakage)
- Works on desktop and mobile browsers
- Handles 1,000+ medicines and 100+ sales/day per pharmacy

---

## 2. Core Features

### Module 1: Authentication & Onboarding
- Email/password signup with email verification
- Pharmacy registration (creates the tenant)
- Role-based access: Owner, Manager, Pharmacist, Cashier
- Invite team members via email
- Password reset flow

### Module 2: Medicine Inventory (CRUD)
- Add / edit / delete medicines
- Fields: name, generic name, category, manufacturer, batch number, expiry date, purchase price, sale price, stock quantity, reorder level, prescription required (yes/no)
- Barcode support (scan + lookup)
- Bulk import via CSV
- Expiry alerts (medicines expiring within 30 / 60 / 90 days)
- Low-stock alerts (auto-triggered at reorder level)
- Search & filter (by name, category, expiry, stock status)

### Module 3: Supplier Management
- Add / edit / delete suppliers
- Track contact info, GST/NTN number, payment terms
- View purchase history per supplier
- Outstanding balance tracking

### Module 4: Purchase Orders (Stock In)
- Create purchase invoice (from supplier)
- Auto-update stock on receipt
- Track paid / unpaid / partially paid status
- Print purchase invoice (PDF)

### Module 5: Point of Sale (POS) — Sales (Stock Out)
- Quick-search by name or barcode
- Add multiple items to cart
- Apply discount (item-level or invoice-level)
- Calculate GST/tax
- Multiple payment methods: cash, card, online
- Print receipt (PDF / thermal printer)
- Auto-decrement stock on sale
- Hold and resume sales (for walk-ins)

### Module 6: Customer Management (Optional but valuable)
- Customer database (name, phone, address)
- Purchase history per customer
- Loyalty points or credit balance
- Prescription tracking per customer

### Module 7: Prescription Management
- Upload prescription image (Supabase Storage)
- Link prescription to sale
- Doctor information
- Required for controlled substances

### Module 8: Reports & Analytics
- Daily / weekly / monthly sales report
- Top-selling medicines
- Profit margin per medicine
- Expired / about-to-expire stock report
- Low-stock report
- Supplier-wise purchase report
- Cashier-wise sales report
- Export to CSV / PDF

### Module 9: Settings
- Pharmacy profile (name, logo, address, GST number)
- Tax settings (GST rates)
- Receipt template customization
- Currency & timezone
- Backup / export all data

### Module 10: Notifications
- In-app: expiry warnings, low stock, new team member joined
- Email: daily sales summary (optional)

---

## 3. Tech Stack Justification

| Layer | Tool | Why |
|-------|------|-----|
| Framework | **Next.js 15 (App Router)** | Server components reduce client JS; built-in API routes; great Vercel deployment |
| Language | **TypeScript** | Type safety catches bugs early; essential when vibe coding (Claude writes better TS than JS) |
| Database | **Supabase (Postgres)** | Free tier: 500 MB DB, 50K monthly active users, unlimited API requests |
| Auth | **Supabase Auth** | Email/password, magic links, OAuth — all free and integrated |
| Storage | **Supabase Storage** | 1 GB free — perfect for prescription images and pharmacy logos |
| Realtime | **Supabase Realtime** | Live stock updates across devices (e.g., two cashiers at once) |
| UI Library | **shadcn/ui + Tailwind** | Copy-paste components, full control, no runtime cost |
| Forms | **react-hook-form + zod** | Type-safe validation, minimal re-renders |
| Tables | **TanStack Table** | Headless, fast, supports thousands of rows |
| Charts | **Recharts** | Simple API, good defaults for reports |
| PDF Generation | **react-pdf** or **pdfme** | Receipts and invoices |
| Hosting | **Vercel (free tier)** | 100 GB bandwidth, automatic HTTPS, instant deploys from GitHub |
| Version Control | **GitHub** | Free private repos |

---

## 4. System Architecture

```
┌────────────────────┐
│  User's Browser    │  (Pharmacy staff on desktop / mobile)
│  Next.js Frontend  │
└──────────┬─────────┘
           │ HTTPS
           ▼
┌────────────────────┐
│  Next.js Server    │  (Vercel — serverless functions)
│  - Server actions  │
│  - API routes      │
│  - SSR pages       │
└──────────┬─────────┘
           │ Postgres protocol + REST
           ▼
┌────────────────────┐
│  Supabase          │
│  - Postgres DB     │  ← Row-Level Security enforces tenant isolation
│  - Auth (JWT)      │
│  - Storage         │  ← Prescription images, logos
│  - Realtime        │  ← Live updates via WebSockets
└────────────────────┘
```

### Request Flow Example: A cashier scans a barcode and sells a medicine
1. Cashier scans barcode → React component calls a Server Action
2. Server Action validates input with zod
3. Server Action calls Supabase with the user's JWT
4. Postgres checks Row-Level Security: "Does this user belong to the pharmacy that owns this medicine?"
5. If yes → decrement stock, insert sale row, return success
6. UI updates instantly; other devices see the update via Realtime subscription

---

## 5. Database Schema

### Core Tables (simplified)

```sql
-- Tenants (pharmacies)
pharmacies (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  logo_url        text,
  address         text,
  gst_number      text,
  phone           text,
  currency        text default 'PKR',
  timezone        text default 'Asia/Karachi',
  created_at      timestamptz default now()
)

-- Users (linked to Supabase auth.users)
profiles (
  id              uuid primary key references auth.users(id),
  pharmacy_id     uuid references pharmacies(id) on delete cascade,
  full_name       text,
  role            text check (role in ('owner','manager','pharmacist','cashier')),
  created_at      timestamptz default now()
)

-- Categories
categories (
  id              uuid primary key default gen_random_uuid(),
  pharmacy_id     uuid not null references pharmacies(id) on delete cascade,
  name            text not null
)

-- Medicines
medicines (
  id                  uuid primary key default gen_random_uuid(),
  pharmacy_id         uuid not null references pharmacies(id) on delete cascade,
  name                text not null,
  generic_name        text,
  category_id         uuid references categories(id),
  manufacturer        text,
  barcode             text,
  batch_number        text,
  expiry_date         date,
  purchase_price      numeric(10,2),
  sale_price          numeric(10,2) not null,
  stock_quantity      integer default 0,
  reorder_level       integer default 10,
  prescription_required boolean default false,
  unit                text default 'tablet',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
)

-- Suppliers
suppliers (
  id              uuid primary key default gen_random_uuid(),
  pharmacy_id     uuid not null references pharmacies(id) on delete cascade,
  name            text not null,
  contact_person  text,
  phone           text,
  email           text,
  address         text,
  gst_number      text
)

-- Customers
customers (
  id              uuid primary key default gen_random_uuid(),
  pharmacy_id     uuid not null references pharmacies(id) on delete cascade,
  name            text not null,
  phone           text,
  address         text,
  created_at      timestamptz default now()
)

-- Purchase invoices (stock in)
purchases (
  id              uuid primary key default gen_random_uuid(),
  pharmacy_id     uuid not null references pharmacies(id) on delete cascade,
  supplier_id     uuid references suppliers(id),
  invoice_number  text,
  invoice_date    date not null,
  total_amount    numeric(10,2),
  paid_amount     numeric(10,2) default 0,
  payment_status  text default 'unpaid',
  created_by      uuid references profiles(id),
  created_at      timestamptz default now()
)

purchase_items (
  id              uuid primary key default gen_random_uuid(),
  purchase_id     uuid not null references purchases(id) on delete cascade,
  medicine_id     uuid not null references medicines(id),
  quantity        integer not null,
  unit_cost       numeric(10,2) not null,
  total_cost      numeric(10,2) not null
)

-- Sales (stock out)
sales (
  id              uuid primary key default gen_random_uuid(),
  pharmacy_id     uuid not null references pharmacies(id) on delete cascade,
  customer_id     uuid references customers(id),
  invoice_number  text,
  sale_date       timestamptz default now(),
  subtotal        numeric(10,2),
  discount        numeric(10,2) default 0,
  tax             numeric(10,2) default 0,
  total           numeric(10,2),
  payment_method  text,
  cashier_id      uuid references profiles(id),
  prescription_url text
)

sale_items (
  id              uuid primary key default gen_random_uuid(),
  sale_id         uuid not null references sales(id) on delete cascade,
  medicine_id     uuid not null references medicines(id),
  quantity        integer not null,
  unit_price      numeric(10,2) not null,
  discount        numeric(10,2) default 0,
  total           numeric(10,2) not null
)

-- Audit log
audit_logs (
  id              uuid primary key default gen_random_uuid(),
  pharmacy_id     uuid not null references pharmacies(id) on delete cascade,
  user_id         uuid references profiles(id),
  action          text,
  table_name      text,
  record_id       uuid,
  changes         jsonb,
  created_at      timestamptz default now()
)
```

### Indexes (critical for performance)

```sql
create index idx_medicines_pharmacy on medicines(pharmacy_id);
create index idx_medicines_barcode on medicines(pharmacy_id, barcode);
create index idx_medicines_expiry on medicines(pharmacy_id, expiry_date);
create index idx_sales_pharmacy_date on sales(pharmacy_id, sale_date desc);
create index idx_sale_items_medicine on sale_items(medicine_id);
```

---

## 6. Multi-Tenancy & Security (RLS)

This is the most important section. **Get this wrong and pharmacies see each other's data.**

### Strategy: Shared database, Row-Level Security (RLS)

Every table has a `pharmacy_id` column. RLS policies enforce:
> A user can only read/write rows where `pharmacy_id` matches their profile's `pharmacy_id`.

### Helper function

```sql
create or replace function public.get_user_pharmacy_id()
returns uuid
language sql security definer stable
as $$
  select pharmacy_id from public.profiles where id = auth.uid();
$$;
```

### Example RLS policies (apply to every tenant-scoped table)

```sql
alter table medicines enable row level security;

-- Read
create policy "users see own pharmacy medicines"
on medicines for select
using (pharmacy_id = public.get_user_pharmacy_id());

-- Insert
create policy "users insert into own pharmacy"
on medicines for insert
with check (pharmacy_id = public.get_user_pharmacy_id());

-- Update
create policy "users update own pharmacy medicines"
on medicines for update
using (pharmacy_id = public.get_user_pharmacy_id())
with check (pharmacy_id = public.get_user_pharmacy_id());

-- Delete — only owner / manager
create policy "only managers delete medicines"
on medicines for delete
using (
  pharmacy_id = public.get_user_pharmacy_id()
  and exists (
    select 1 from profiles
    where id = auth.uid() and role in ('owner','manager')
  )
);
```

### Testing RLS
Create two test pharmacies and two test users. Verify that user A literally **cannot** see user B's data — not even with raw SQL queries via the Supabase client.

---

## 7. Authentication & Authorization

### Flow
1. User visits `/signup` → enters email, password, pharmacy name
2. Supabase Auth creates `auth.users` row → sends verification email
3. Database trigger creates `pharmacies` row and `profiles` row (role = `owner`)
4. User clicks verification link → redirected to `/dashboard`
5. Owner can invite staff from Settings → each invite sends an email with a signup link pre-filled with `pharmacy_id`

### Role-Based UI Gating
- Hide UI elements based on `role`
- **Never rely on UI hiding alone** — RLS policies are the real enforcement

### Roles & Permissions Matrix

| Action | Owner | Manager | Pharmacist | Cashier |
|--------|-------|---------|------------|---------|
| View dashboard | ✅ | ✅ | ✅ | ✅ |
| Add/edit medicines | ✅ | ✅ | ✅ | ❌ |
| Delete medicines | ✅ | ✅ | ❌ | ❌ |
| Create sale | ✅ | ✅ | ✅ | ✅ |
| Create purchase | ✅ | ✅ | ❌ | ❌ |
| View reports | ✅ | ✅ | ❌ | ❌ |
| Invite users | ✅ | ❌ | ❌ | ❌ |
| Pharmacy settings | ✅ | ❌ | ❌ | ❌ |

---

## 8. Project Structure

```
medical-store-saas/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Public auth pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/              # Protected app
│   │   ├── layout.tsx            # Sidebar + auth check
│   │   ├── dashboard/page.tsx    # Home / overview
│   │   ├── medicines/
│   │   │   ├── page.tsx          # List
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── pos/page.tsx          # Point of sale
│   │   ├── sales/page.tsx
│   │   ├── purchases/page.tsx
│   │   ├── suppliers/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/page.tsx
│   ├── api/                      # Webhooks, CSV import, etc.
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── medicines/
│   ├── pos/
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts
│   ├── actions/                  # Server Actions (CRUD)
│   │   ├── medicines.ts
│   │   ├── sales.ts
│   │   └── ...
│   ├── validators/               # zod schemas
│   └── utils.ts
├── types/
│   └── database.types.ts         # Generated from Supabase
├── supabase/
│   ├── migrations/               # SQL migration files
│   └── seed.sql
├── public/
├── .env.local                    # Supabase keys (gitignored)
├── package.json
└── README.md
```

---

## 9. Development Phases (Milestones)

### Phase 0: Setup (Day 1)
- [ ] Create GitHub repo
- [ ] Create Supabase project (free tier)
- [ ] Initialize Next.js with TypeScript and Tailwind
- [ ] Install shadcn/ui
- [ ] Set up `.env.local` with Supabase keys
- [ ] Deploy a blank page to Vercel — confirm pipeline works

### Phase 1: Foundation (Days 2–4)
- [ ] Database schema migrations
- [ ] RLS policies on every table
- [ ] Auth: signup, login, logout, password reset
- [ ] Pharmacy onboarding flow (signup creates pharmacy + owner profile)
- [ ] Protected dashboard layout with sidebar
- [ ] User profile dropdown

### Phase 2: Medicine Inventory (Days 5–7)
- [ ] Medicine list page with search and filter
- [ ] Add/edit medicine form
- [ ] Delete with confirmation
- [ ] CSV bulk import
- [ ] Expiry and low-stock alert components
- [ ] Categories CRUD

### Phase 3: Suppliers & Purchases (Days 8–10)
- [ ] Suppliers CRUD
- [ ] Create purchase invoice (multi-item form)
- [ ] Auto-update stock on purchase
- [ ] Purchase history page

### Phase 4: Point of Sale (Days 11–14)
- [ ] POS page with barcode/name search
- [ ] Cart with quantity, discount, tax
- [ ] Checkout with payment method selection
- [ ] Auto-decrement stock + create sale + sale items (transaction)
- [ ] Print receipt (PDF)
- [ ] Hold/resume sale feature

### Phase 5: Customers & Prescriptions (Days 15–16)
- [ ] Customers CRUD
- [ ] Link sale to customer
- [ ] Upload prescription image to Supabase Storage
- [ ] Display prescription history per customer

### Phase 6: Reports (Days 17–19)
- [ ] Daily / weekly / monthly sales chart
- [ ] Top medicines report
- [ ] Profit margin report
- [ ] Expired / low-stock reports
- [ ] CSV / PDF export

### Phase 7: Team Management (Days 20–21)
- [ ] Invite users by email
- [ ] Role assignment
- [ ] Remove users
- [ ] Permissions enforced in UI + RLS

### Phase 8: Settings & Polish (Days 22–23)
- [ ] Pharmacy profile (logo upload, address)
- [ ] Receipt template
- [ ] Tax configuration
- [ ] Loading states, empty states, error boundaries everywhere
- [ ] Mobile responsiveness pass

### Phase 9: Testing & Hardening (Days 24–26)
- [ ] RLS tests: prove tenant isolation
- [ ] Manual test plan execution
- [ ] Performance check (1000 medicines, 100 sales)
- [ ] Add audit logging for all sensitive actions
- [ ] Backup/export feature

### Phase 10: Launch Prep (Days 27–28)
- [ ] Landing page (`/`)
- [ ] Pricing page
- [ ] Privacy policy + terms of service
- [ ] Demo account with seed data
- [ ] Onboarding video or tour
- [ ] Custom domain + production deploy

**Total: ~4 weeks of focused work**

---

## 10. Working with Claude Code (Vibe Coding Best Practices)

Vibe coding works best when you **set the rails** for the AI. Here is how to get production-quality code from Claude Code:

### 10.1 Start every session with `CLAUDE.md`
Create a `CLAUDE.md` file in the project root that Claude Code reads automatically. Include:
- Tech stack and versions
- Coding conventions (e.g., "use Server Actions, not API routes for CRUD")
- File structure rules
- Database conventions (snake_case in DB, camelCase in TypeScript)
- Common patterns (how a CRUD module is structured)

### 10.2 Build one module at a time
Don't ask Claude to "build the whole app." Instead:
> "Build the medicine inventory module. Start with the database migration, then RLS policies, then the list page, then the create form."

### 10.3 Always ask for tests with sensitive logic
> "Write the sale-checkout server action that decrements stock, creates a sale, and inserts sale items in a single transaction. Then write a test that verifies stock cannot go negative."

### 10.4 Review and run before moving on
- Read every file Claude creates — don't just trust it
- Run the code locally and click through the feature yourself
- Commit working code to Git **before** asking for the next change

### 10.5 Use type generation
After every schema change, regenerate types so Claude has accurate context:
```bash
npx supabase gen types typescript --project-id YOUR_ID > types/database.types.ts
```

### 10.6 Lock down Claude's freedom on critical files
For `lib/supabase/server.ts`, RLS policies, and auth middleware — write these yourself first, then tell Claude **never to modify them** without your approval.

### 10.7 Commit often, branch per feature
```bash
git checkout -b feature/medicine-crud
# vibe code with Claude
git commit -m "Add medicine CRUD"
git push
# open PR, review yourself, merge
```

---

## 11. Testing Strategy

### Levels
1. **Type safety** — TypeScript catches most issues for free
2. **Schema validation** — zod validates every input on the server
3. **RLS tests** — write SQL tests proving cross-tenant isolation
4. **Integration tests** — Playwright for critical flows (signup → add medicine → sell)
5. **Manual smoke test** — checklist before every deploy

### Critical Test Cases (do these before launch)
- [ ] Pharmacy A user cannot read Pharmacy B medicines, even by guessing UUIDs
- [ ] A sale fails atomically if stock would go negative (transaction rollback)
- [ ] Concurrent sales of the same medicine handle stock correctly
- [ ] Cashier role cannot delete medicines via the UI **or** direct API call
- [ ] Expired medicines show a warning when added to cart
- [ ] CSV import rejects malformed rows with clear error messages

---

## 12. Deployment & DevOps

### Environments
| Environment | Database | Hosting |
|-------------|----------|---------|
| Local dev | Supabase free project (dev) | `localhost:3000` |
| Production | Supabase free project (prod) | Vercel free tier |

### Secrets (never commit)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # server-only, never expose
```

### CI/CD
- Push to `main` → auto-deploy to Vercel
- Pull requests → preview deploys
- Run `npm run lint` and `npm run typecheck` on every PR

### Backups
- Supabase free tier: 7-day point-in-time recovery available on paid tier only
- **Workaround:** schedule a daily `pg_dump` via GitHub Actions to a private repo or Backblaze B2 (free tier)

---

## 13. Free-Tier Limits & Scaling Plan

### Supabase Free Tier (as of 2026)
- 500 MB database storage
- 1 GB file storage
- 5 GB bandwidth/month
- 50,000 monthly active users
- Project pauses after 1 week of inactivity (wakes on first request)

### What this comfortably supports
- 10–20 pharmacies, each with up to ~5,000 medicines and ~50 sales/day
- Beyond that, upgrade to Supabase Pro ($25/mo) when revenue justifies it

### Vercel Free Tier
- 100 GB bandwidth/month
- Serverless functions: 100 GB-hours
- 6,000 build minutes/month

### When to upgrade
| Trigger | Action |
|---------|--------|
| First 5 paying pharmacies | Upgrade Supabase to Pro |
| 50+ pharmacies | Add database connection pooler (PgBouncer / Supavisor) |
| 100+ pharmacies | Consider read replicas for reports |
| 1000+ pharmacies | Move to per-tenant databases or sharding |

---

## 14. Legal & Compliance

> **You are not a lawyer, and neither am I. The points below are general guidance — consult a local lawyer before launch, especially in healthcare.**

- **Data residency:** Supabase has regions; pick one close to your customers (e.g. Mumbai or Singapore for Pakistan)
- **Privacy policy:** Required by app stores and most regions; generate one with Termly or iubenda
- **Terms of service:** Limit your liability; clarify data ownership stays with the pharmacy
- **Healthcare data:** Prescriptions and customer health data may be regulated in your jurisdiction. Pakistan has the Personal Data Protection Bill; India has DPDP Act 2023; HIPAA applies if you sell in the US (and HIPAA on Supabase requires the Enterprise tier)
- **Drug regulations:** Controlled substances often require tracking by law — consult local drug authorities
- **Audit logs:** Keep them — both for trust and for legal disputes

---

## 15. Monetization & Go-to-Market

### Pricing Model
| Plan | Price | Limits |
|------|-------|--------|
| Free trial | $0 | 14 days, full features |
| Starter | $10/mo | 1 user, 500 medicines |
| Pro | $25/mo | 5 users, unlimited medicines, reports |
| Chain | $75/mo | Unlimited users, multi-branch, priority support |

### Initial Go-to-Market
1. Build relationships with 3–5 local pharmacies, offer free use for 6 months in exchange for feedback
2. Get testimonials and case studies
3. Local Facebook groups for pharmacists
4. WhatsApp marketing — most effective in Pakistan/India
5. YouTube tutorials in Urdu/Hindi

### Retention
- Onboarding video call with each new pharmacy
- Monthly check-in for first 3 months
- Feature requests via in-app form

---

## 16. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| RLS bug leaks data between pharmacies | Medium | Catastrophic | Manual + automated RLS tests; bug bounty after launch |
| Supabase free tier limits hit | High | Medium | Upgrade plan ready; monitor with Supabase dashboard |
| Pharmacy loses internet | Certain | High | Add offline-first POS later (Phase 11); for now, document downtime workaround |
| Stock count drifts from reality | High | High | Audit logs + periodic stock-take feature |
| User forgets password and loses pharmacy | Medium | Catastrophic | Multi-user from day one — at least one backup owner |
| Vendor lock-in to Supabase | Low | Medium | Postgres is portable; you can self-host Supabase or move to plain Postgres |
| Slow performance on cheap Android phones | Medium | Medium | Server components + minimal client JS; test on a $100 phone |

---

## 17. Appendix: Useful Resources

- **Next.js App Router docs:** `nextjs.org/docs`
- **Supabase docs:** `supabase.com/docs`
- **Supabase + Next.js auth guide:** `supabase.com/docs/guides/auth/server-side/nextjs`
- **shadcn/ui:** `ui.shadcn.com`
- **Row-Level Security deep dive:** `supabase.com/docs/guides/auth/row-level-security`
- **Claude Code docs:** `docs.claude.com/en/docs/claude-code`

---

## Final Checklist Before You Start Coding

- [ ] You've read this entire document
- [ ] You have a GitHub account
- [ ] You have a Supabase account (free)
- [ ] You have a Vercel account (free)
- [ ] You have Claude Code installed
- [ ] You've decided on a project name and grabbed a domain (optional)
- [ ] You have a `CLAUDE.md` ready to paste into your repo
- [ ] You're committing to building one phase at a time, not all at once

**Now go build it. Ship small, iterate fast, and talk to real pharmacists every week.**

---

*This plan is a living document — update it as you learn what your customers actually need.*
