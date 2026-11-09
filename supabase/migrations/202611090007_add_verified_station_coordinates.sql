-- Add map pins only for station-name and district matches marked verified in Alipo's catalog.
alter table public.stations add column if not exists latitude double precision;
alter table public.stations add column if not exists longitude double precision;
alter table public.stations add column if not exists coordinate_source text;
alter table public.stations add column if not exists coordinate_source_url text;
alter table public.stations add column if not exists coordinates_checked_at date;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'stations_coordinates_valid'
  ) then
    alter table public.stations add constraint stations_coordinates_valid
      check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180));
  end if;
end $$;

update public.stations as s
set latitude = v.latitude,
    longitude = v.longitude,
    coordinate_source = 'Alipo verified station catalog',
    coordinate_source_url = 'https://www.alipo.co.mw/api/stations/catalog',
    coordinates_checked_at = '2026-11-09'
from (values
  ('Petroda Balaka', 'Balaka', -14.9573936, 34.894124),
  ('Petroda Clock Tower', 'Blantyre', -15.7880001, 35.0124931),
  ('Petroda Kameza', 'Blantyre', -15.7249784, 35.0184207),
  ('Petroda Mandala', 'Blantyre', -15.8040723, 35.0114081),
  ('Petroda Mbayani', 'Blantyre', -15.772, 35.021),
  ('Petroda Tsiranana', 'Blantyre', -15.8045861, 35.0628429),
  ('Petroda Karonga', 'Karonga', -9.935021, 33.94141),
  ('Petroda Area 25', 'Lilongwe', -13.89979063, 33.7577874),
  ('Petroda Area 4', 'Lilongwe', -13.9627027, 33.761941),
  ('Petroda Area 43', 'Lilongwe', -13.9278162, 33.7963047),
  ('Petroda Area 46', 'Lilongwe', -13.985, 33.735),
  ('Petroda Area 47', 'Lilongwe', -13.9758758, 33.7784842),
  ('Petroda Biwi', 'Lilongwe', -14.0106913, 33.7875244),
  ('Petroda Bunda', 'Lilongwe', -14.0607189, 33.801988),
  ('Petroda Salima Turn-off', 'Lilongwe', -13.974014, 33.750755),
  ('Petroda Liwonde', 'Machinga', -15.0700581, 35.2271993),
  ('Petroda Mangochi', 'Mangochi', -14.4850732, 35.2578838),
  ('Petroda Mchinji', 'Mchinji', -13.800174, 32.888125),
  ('Puma Energy Mulanje', 'Mulanje', -16.023119, 35.500636),
  ('Petroda Mwanza', 'Mwanza', -15.6067225, 34.5203521),
  ('Petroda Mzimba', 'Mzimba', -11.907596, 33.602891),
  ('Puma Energy Dwangwa', 'Nkhotakota', -12.508506, 34.110892),
  ('Petroda Ntcheu', 'Ntcheu', -14.8160319, 34.6376497),
  ('Puma Energy Ntchisi', 'Ntchisi', -13.277736, 33.880861),
  ('Petroda Salima Boma', 'Salima', -13.7711358, 34.4403774),
  ('Petroda Luchenza', 'Thyolo', -16.0058828, 35.3114674),
  ('Petroda Zomba', 'Zomba', -15.3835345, 35.3217641)
) as v(name, district, latitude, longitude)
where lower(s.name) = lower(v.name) and lower(s.district) = lower(v.district);
