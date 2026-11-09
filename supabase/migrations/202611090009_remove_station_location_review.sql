-- Visitor pin reporting was removed; discard its unused private review queue.
drop table if exists public.station_location_reports;
