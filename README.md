# Fuel Wanga

A mobile-friendly community fuel finder built with Next.js and Supabase. It covers Malawi's 28 districts and lets visitors find stations, add station records, correct names, and share recent fuel and queue reports. Supabase PostgreSQL is the shared database, so app instances use the same station and report data.

## Connect your Supabase project

1. Create a Supabase project at [supabase.com](https://supabase.com/).
2. In the Supabase Dashboard, open **SQL Editor**, paste in `supabase/schema.sql`, and run it once. This creates the tables, server-side report and rename functions, permissions, and 28 sample station records.
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
- Add a station in the selected district, with a nearby area/trading centre.
- Correct a station name. Changes are immediate and written to `name_edits` history.
- Report fuel status and queue without an account or phone number.
- Reports receive server timestamps and stop appearing as current after three hours.
- Supabase function enforces one report per station/browser identifier per 15 minutes.
- Conflicting recent fuel reports are flagged and excluded from the “fuel available” filter.
- Seeded station names have no availability status and remain editable.

## Supabase security model

The browser calls the Next.js API only. The API uses the Supabase secret key on the server, never in browser code. The schema enables Row Level Security, revokes direct access from `anon` and `authenticated`, and grants table/function access only to `service_role`. The rename and report operations run as database functions so their validation, history write, and report rate limit happen atomically. The Supabase secret key bypasses RLS, so keep it private and only set it in server environment variables.

This is an open, anonymous community MVP. Its random browser identifier discourages quick repeated reports but is not identity verification; users can reset browser storage or switch devices. Name edits are public and immediate. Add moderation and stronger abuse controls before relying on this for high-volume or safety-critical decisions.

## Included station examples

The sample names are based on Petroda's [published service-station directory](https://petrodamw.com/index.php/service-stations). They are examples only: check their current details and use the correction flow when needed. Availability is never prefilled. The other districts start with no station records so local users can add the stations they know.

## Project layout

- `app/page.tsx` — station finder and forms.
- `app/api/stations/` — server endpoints for listing, adding, renaming, and reporting.
- `lib/data.ts` — district list and sample station names.
- `lib/supabaseAdmin.ts` — server-only Supabase client.
- `supabase/schema.sql` — database schema, functions, access rules, and sample records.
- `.env.example` — environment variable names, without credentials.
