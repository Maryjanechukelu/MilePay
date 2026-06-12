# MilePay — Milestone-Based Payment Platform

**Get paid as you deliver. Pay only as you approve.**

Built for Nigerian freelancers, tutors, consultants, photographers, and all service providers.
Powered by Nomba Virtual Accounts infrastructure.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + custom design tokens |
| Forms | React Hook Form + Zod |
| State | Zustand (persisted) |
| HTTP | Axios with JWT interceptor |
| Animation | Framer Motion |
| File Upload | React Dropzone |
| Toasts | Sonner |
| Deployment | Vercel |

---

## Project Structure

```
src/
  app/
    (auth)/login          → Login page
    (auth)/register       → Register + role selection
    (auth)/verify-email   → Email verification
    (onboarding)/onboarding/provider  → 4-step provider onboarding
    (onboarding)/onboarding/client    → 2-step client onboarding
    (provider)/dashboard  → Provider dashboard
    (provider)/projects/new  → Create project + milestone builder
    (provider)/projects/[id] → Project detail (provider view)
    (provider)/earnings   → Earnings & payout history
    (provider)/settings   → Profile & bank details
    (client)/client-dashboard → Client dashboard
    project/[id]          → Public project preview (no auth required)
    admin/                → Admin dashboard + dispute queue
    page.tsx              → Marketing landing page
  components/
    landing/              → All landing page sections
    onboarding/           → Reusable onboarding components
    projects/             → Milestone, project cards, state timeline
    dashboard/            → Stat cards, tables, rows
    shared/               → Notifications, audit log, file upload
    ui/                   → Base UI primitives
  lib/
    api.ts                → Axios instance + all API endpoint functions
    utils.ts              → formatNaira, relativeTime, cn, state configs
  schemas/index.ts        → All Zod validation schemas
  store/authStore.ts      → Zustand auth store
  types/index.ts          → All TypeScript interfaces and enums
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.milepay.ng/v1
```

For local development with backend running locally:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Key Pages

| Page | Route | Auth Required |
|------|-------|---------------|
| Landing page | `/` | No |
| Register | `/register?role=provider` or `?role=client` | No |
| Login | `/login` | No |
| Project preview | `/project/:id` | No |
| Provider dashboard | `/dashboard` | Yes (provider) |
| Create project | `/projects/new` | Yes (provider) |
| Client dashboard | `/client-dashboard` | Yes (client) |
| Admin | `/admin` | Yes (admin) |

---

## API Integration

All API calls are in `src/lib/api.ts`. The Axios instance automatically:
- Attaches `Authorization: Bearer <token>` to every authenticated request
- Redirects to `/login` on 401 responses
- Normalises error messages from the API error format

Replace `NEXT_PUBLIC_API_URL` with your backend URL and all endpoints will work.

---

## Design System

MilePay uses a custom design token system built on Tailwind.

**Brand palette:**
- Forest green: `#0A2E1A` (trust, growth)
- Amber gold: `#D4900A` (value, reward)
- Cream: `#F7F5F0` (warm background)
- Slate: `#1C2B2B` (text)

**Typography:**
- Display: Syne (headings, numbers)
- Body: Inter (body copy, UI text)

**Component classes** (defined in `globals.css`):
- `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`
- `.card`, `.card-hover`, `.card-forest`, `.card-muted`
- `.field-input`, `.field-label`, `.field-error`
- `.badge`, `.badge-green`, `.badge-amber`, `.badge-red` etc.
- `.stat-card`, `.stat-value`, `.stat-label`
- `.container-wide`, `.container-narrow`, `.container-form`
- `.section-py`, `.display-hero`, `.display-section`

---

## Nomba API Integration Points

| Feature | Nomba API | Location |
|---------|-----------|----------|
| Virtual account per project | Virtual Account API | `/onboarding/provider/confirm` + `/projects/:id/accept` |
| Inbound transfer reconciliation | Webhooks | `POST /webhooks/nomba` (backend) |
| Underpayment/overpayment detection | Webhook + Transactions API | Backend reconciliation logic |
| Milestone payout | Transfers API | Backend — triggered on milestone approval |
| Misdirected payment detection | Transactions API | Backend — admin alert flow |
| Customer-level reporting | Transactions API | `/projects/:id/payments` |

---

## Demo Accounts (seed these in backend)

| Role | Email | Password |
|------|-------|----------|
| Provider | provider@demo.ng | Demo1234 |
| Client | client@demo.ng | Demo1234 |
| Admin | admin@demo.ng | Demo1234 |

---

Built by Codechic Enterprise · Hackathon submission for Nomba devcareer.io · June 2026
