# Fuel Wanga

A mobile-friendly community fuel finder built with Next.js and Supabase. It covers Malawi's 28 districts and lets visitors find verified station listings and share recent fuel and queue reports. Supabase PostgreSQL is the shared database, so app instances use the same station and report data.

## Connect your Supabase project

1. Create a Supabase project at [supabase.com](https://supabase.com/).
2. For a new project, run `supabase/schema.sql` once, then run each SQL file in `supabase/migrations/` in filename order. For the already linked project, apply only pending migrations. The station seed migration adds source metadata and stations listed in MERA's 2026/2027 liquid fuel retail register, valid as at 31 July 2026. It uses the named locality, never the license holder's postal address, as the district clue. MERA listing confirms a retail licence in that dated register; it does not confirm a station is currently open or has fuel. It excludes Afrox and Falcon Gas entries, which are gas retailers rather than automotive fuel sites.
3. In **Project Settings → API Keys**, copy the project URL and a **secret key** (`sb_secret_…`). Older Supabase projects may show a legacy `service_role` key; the app accepts either.
4. Copy `.env.example` to `.env.local` and set:

   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_...
   ```

   Keep this secret key on the server. Do not rename it with a `NEXT_PUBLIC_` prefix, add it to browser code, or commit `.env.local`.

5. Install and run the app:

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:3000. To make it available to your users, deploy this Next.js app and configure the same two environment variables in the hosting provider. All deployed copies connected to that Supabase project share the database.

## Features

- District chooser for all 28 districts grouped by region.
- Station and area search; filters for petrol, diesel, and available fuel.
- Directions links, using verified coordinates where available and a station search otherwise.
- Station records are maintained from MERA and other credible sources.
- Report fuel status and queue without an account or phone number.
- Reports receive server timestamps and stop appearing as current after three hours.
- Supabase function enforces one report per station/browser identifier per 15 minutes.
- Conflicting recent fuel reports are flagged and excluded from the “fuel available” filter.
- Station listings have no availability status until visitors submit a report.

## Supabase security model

The browser calls the Next.js API only. The API uses the Supabase secret key on the server, never in browser code. The schema enables Row Level Security, revokes direct access from `anon` and `authenticated`, and grants table/function access only to `service_role`. The report operation runs as a database function so its validation and rate limit happen atomically. The Supabase secret key bypasses RLS, so keep it private and only set it in server environment variables.


This is an open, anonymous community MVP. Its random browser identifier discourages quick repeated reports but is not identity verification; users can reset browser storage or switch devices.

## Included station examples

Existing Petroda sample names are based on the operator's [published service-station directory](https://petrodamw.com/index.php/service-stations). The migration also cross-references those records against [MERA's regulated-entities register](https://mera.mw/regulated-entities/), which links to its dated licence PDF. Fuel availability is never prefilled; check the listed source for station details.

## Project layout

- `app/page.tsx` — station finder and forms.
- `app/api/stations/` — server endpoints for listing and fuel reports.
- `lib/data.ts` — district list and sample station names.
- `lib/supabaseAdmin.ts` — server-only Supabase client.
- `supabase/schema.sql` — database schema, functions, access rules, and sample records.
- `.env.example` — environment variable names, without credentials.
