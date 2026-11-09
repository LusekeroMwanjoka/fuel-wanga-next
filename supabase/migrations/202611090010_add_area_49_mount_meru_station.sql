-- Add the Mount Meru station in Area 49, separately from the Area 49 Puma and Best Oil stations.
insert into public.stations (
  name, district, area, source, source_url, source_checked_at,
  latitude, longitude, coordinate_source, coordinate_source_url, coordinates_checked_at
)
select
  'Mt. Meru Filling Station',
  'Lilongwe',
  'Opposite Bingu National Stadium, Area 49',
  'Mount Meru Group petroleum network; Face of Malawi (Jan 2022); MANA location reference (Jun 2024)',
  'https://www.mountmerugroup.com/service-details/mount-meru-petroleum',
  '2026-11-09',
  -13.90201,
  33.75126,
  'OpenStreetMap node 11324758269',
  'https://www.openstreetmap.org/node/11324758269',
  '2026-11-09'
where not exists (
  select 1 from public.stations
  where lower(name) = lower('Mt. Meru Filling Station')
    and lower(district) = lower('Lilongwe')
);
