# FundBridge

Auth + role-selection scaffold for the FundBridge capstone. Built with
Next.js (App Router), Supabase (auth + Postgres), and Tailwind CSS —
same stack as your Ledger project.

## What's working right now

- Register with email/password and pick a role: Founder, Investor, or Bidder
- Email verification (handled by Supabase)
- Login / logout
- Each role lands on its own dashboard after login
- Route protection — logged-out users get bounced to `/login`, and a
  bidder can't open the founder dashboard by typing the URL
- Admin role exists in the database (promote a user manually — see below)

Everything past this (startup profiles, funding campaigns, bidding, the
admin panel's real content) is a placeholder card that says "plugs in
here next" — the modules from your project doc.

## 1. Create a Supabase project

1. Go to https://supabase.com, sign in, click **New project**.
2. Pick any name/region, set a database password (save it somewhere).
3. Wait ~2 minutes for it to finish provisioning.
4. In the project, go to **Project Settings → Data API**. Copy the
   **Project URL** and the **anon public** key — you'll need both next.

## 2. Set up the database

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this project, copy all of it, paste
   it into the SQL editor, and click **Run**.
3. This creates the `profiles` table, the `founder / investor / bidder /
   admin` role enum, and a trigger that auto-creates a profile row
   whenever someone signs up.

## 3. Configure the app (Windows, Command Prompt)

Open Command Prompt in this folder (`cd path\to\fundbridge`), then:

```cmd
copy .env.local.example .env.local
```

Open `.env.local` in a text editor and paste in the two values from
step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Save the file.

## 4. Install and run

```cmd
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## 5. Try it end to end

1. Click **Get started**, fill in the form, pick a role, submit.
2. Supabase emails a confirmation link to the address you used (check
   spam if it doesn't show up — by default Supabase sends from its own
   domain and rate-limits test emails, which is fine for a capstone).
3. Click the link, then log in at `/login`.
4. You should land on the dashboard matching the role you picked.

## Making yourself an admin

No one can register as admin from the form on purpose — it's meant to
be granted, not self-selected. After you've registered a normal
account:

1. Supabase dashboard → **Table Editor → profiles**.
2. Find your row, change `role` from e.g. `founder` to `admin`.
3. Log out and back in — you'll land on `/dashboard/admin`.

## Project structure

```
app/
  page.tsx                landing page
  register/page.tsx       sign-up form with role picker
  login/page.tsx           login form
  verify-email/page.tsx    "check your inbox" screen
  dashboard/
    layout.tsx             shared header (name, role, sign out)
    page.tsx                redirects to the right role dashboard
    founder/page.tsx
    investor/page.tsx
    bidder/page.tsx
    admin/page.tsx
components/
  RoleCard.tsx             role picker option
  BridgeProgress.tsx        signup-flow progress graphic
  SignOutButton.tsx
lib/
  supabase/client.ts        browser Supabase client
  supabase/server.ts        server Supabase client
  supabase/middleware.ts     session refresh + route protection
  require-role.ts            per-page role guard
supabase/schema.sql          run this once in the Supabase SQL editor
```

## Next modules to build (in your project doc's order)

1. **Startup module** — a `startups` table + form on the founder
   dashboard to create a profile (name, description, funding goal, team).
2. **Funding module** — a `funding_campaigns` table, investor browse
   page, and an `investments` table for the virtual-fund simulation.
3. **Bidding module** — a `projects` table for founder postings and a
   `bids` table bidders submit to; a comparison view for founders to
   pick a winner.
4. **Admin panel** — real queries against `profiles`/`startups` for
   user management, startup verification, and basic analytics.

Each of those is its own database table plus a page — happy to build
any of them next.

## What's real now (as of this update)

- **Startup module** — founders create/edit a startup profile (name, tagline, description, stage, funding goal) at `/dashboard/founder/startup`
- **Funding module** — investors get a starting virtual balance of $100,000, browse real startups, and invest through an atomic balance-check-and-deduct function (`invest_in_startup` in the database, no way to overspend even with rapid double-clicks); funding progress bars are computed live from real investment rows
- **Bidding module** — founders post projects under their startup; bidders browse open projects and submit proposals; founders review bids and select a winner, which locks the project to "in progress" and marks the other bids "rejected"
- **Admin panel** — real user list, and a verify/unverify toggle for each startup, both reading live from the database

## Extra setup step for this update

You need to run one more SQL file — `supabase/002_core_modules.sql` — the same way you ran `schema.sql`:

1. Supabase dashboard → **SQL Editor → New query**
2. Open `supabase/002_core_modules.sql`, copy all of it, paste, click **Run**

This adds the `startups`, `investments`, `projects`, and `bids` tables, the virtual balance column on profiles, and the row-level security policies that keep each role's data scoped correctly (a bidder can only see their own bids, a founder can only edit their own startup, etc).

## Second update: password recovery, notifications, reviews, profile

- **Forgot password** — `/forgot-password` sends a reset email; `/reset-password` (the link's destination) lets them set a new one
- **Notifications** — a bell icon in the dashboard header with an unread badge; database triggers fire automatically (no app code involved) when: a founder's project gets a new bid, a bidder's bid is accepted/rejected, or a founder's startup gets a new investment
- **Reviews** — investors can leave a 1-5 star rating + comment on any startup they've actually invested in (enforced by a database rule, not just the UI); average rating shows on the startup's page
- **Profile page** — click your name in the header to edit your display name and see your role/join date (and virtual balance, if you're an investor)

## One more SQL file to run

Same drill as before — run `supabase/003_notifications_reviews.sql` in the Supabase SQL Editor, after `schema.sql` and `002_core_modules.sql`. This adds the `notifications` and `reviews` tables plus three trigger functions that auto-generate notifications.

## Supabase email setup for password reset (important)

Password reset uses the same shared email sender as signup confirmation, so it has the same low rate limit. If you turned off "Confirm email" earlier to dodge that limit, password reset emails still go through that same limited sender — expect to hit the rate limit if you test it repeatedly in a short window. For your actual demo, either wait between tests or set up your own SMTP under **Authentication → Providers → Email → SMTP Settings** to remove the limit entirely.
