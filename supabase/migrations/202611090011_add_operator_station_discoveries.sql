-- Additional locations found in operator locators and corroborated station references.
-- Listings are added without pins where available sources do not provide a dependable coordinate.

insert into public.stations (name, district, area, source, source_url, source_checked_at)
select v.name, v.district, v.area, v.source, v.source_url, '2026-11-09'
from (values
  ('Engen Tachedwa Filling Station', 'Lilongwe', 'M1 Road, Lilongwe', 'Engen Malawi station locator; PPDA supplier address', 'https://www.engen.mw/station-locator/'),
  ('Engen Michiru Filling Station', 'Blantyre', 'Lunzu Trading Centre', 'Engen Malawi station locator', 'https://www.engen.mw/station-locator/'),
  ('Engen Zomba Service Station', 'Zomba', 'Zomba City', 'Engen Malawi station locator', 'https://www.engen.mw/station-locator/'),
  ('Engen Everrut Investments Service Station', 'Machinga', 'Ntaja', 'Engen Malawi station locator', 'https://www.engen.mw/station-locator/'),
  ('Engen Apatsa Superette Service Station', 'Lilongwe', 'Lilongwe', 'Engen Malawi station locator', 'https://www.engen.mw/station-locator/'),
  ('Engen Maselema Service Station', 'Blantyre', 'Masauko Chipembere Highway', 'Engen Malawi station locator', 'https://www.engen.mw/station-locator/'),
  ('Engen Nkhonya Service Station', 'Mulanje', 'Nkhonya', 'Engen Malawi station locator', 'https://www.engen.mw/station-locator/'),
  ('Engen Streambox Service Station', 'Lilongwe', 'Six Miles', 'Engen Malawi station locator', 'https://www.engen.mw/station-locator/'),
  ('Engen 4 Miles Service Station', 'Zomba', 'Four Miles', 'Engen Malawi station locator', 'https://www.engen.mw/station-locator/'),
  ('SIMSO Oil Area 13 Service Station', 'Lilongwe', 'Area 13, near Woodlands and Capital City Motel', 'PowerTex branch address; 2026 local business listing; map listing', 'https://powertexmw.com/contact/'),
  ('SIMSO Oil Six Miles Service Station', 'Lilongwe', 'Six Miles', 'Malawi Police statement reported by Face of Malawi (2022); PPDA supplier address', 'https://www.faceofmalawi.com/2022/04/05/police-recovers-240-bags-of-indian-hemp-in-lilongwe/'),
  ('SIMSO Oil Genesis Complex Service Station', 'Lilongwe', 'Genesis Complex, Area 25A', 'Cybo gas-station listing; local utility address listing', 'https://www.cybo.com/MW-biz/simso-filling-station_1V'),
  ('Maone TotalEnergies Service Station', 'Blantyre', 'Maone, Blantyre–Zomba Road', 'TotalEnergies opening announcement reported by Malawi Freedom Network; TotalEnergies staff announcement', 'https://malawifreedomnetwork.com/totalenergies-opens-79th-service-station-in-malawi-expands-investment-in-blantyre/')
) as v(name, district, area, source, source_url)
where not exists (
  select 1 from public.stations s
  where lower(s.name) = lower(v.name) and lower(s.district) = lower(v.district)
);

-- The Mzuzu SIMSO outlet was reported suspended by MERA in February 2025; keep it out of the live directory.

-- A map-listed Mitundu filling station matches the existing Mitundu (Chiseka) locality.
update public.stations
set latitude = -14.24798,
    longitude = 33.7789,
    coordinate_source = 'OpenStreetMap node 8936624153',
    coordinate_source_url = 'https://www.openstreetmap.org/node/8936624153',
    coordinates_checked_at = '2026-11-09'
where lower(name) = lower('Mitundu (Chiseka) Mount Meru Service Station')
  and lower(district) = lower('Lilongwe')
  and latitude is null;
