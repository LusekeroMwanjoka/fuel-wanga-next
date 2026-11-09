-- Keep visitor location suggestions separate from authoritative station records.
create table if not exists public.station_location_reports (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  issue text not null check (issue in ('wrong_pin', 'missing_pin')),
  latitude double precision,
  longitude double precision,
  note text check (note is null or char_length(note) <= 300),
  reporter_key text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  constraint station_location_reports_coordinates_valid check (
    (latitude is null and longitude is null) or
    (latitude between -90 and 90 and longitude between -180 and 180)
  )
);

create index if not exists station_location_reports_review_queue
  on public.station_location_reports (status, created_at desc);
create index if not exists station_location_reports_rate_limit
  on public.station_location_reports (station_id, reporter_key, created_at desc);

alter table public.station_location_reports enable row level security;
revoke all on public.station_location_reports from anon, authenticated;
grant all on public.station_location_reports to service_role;
