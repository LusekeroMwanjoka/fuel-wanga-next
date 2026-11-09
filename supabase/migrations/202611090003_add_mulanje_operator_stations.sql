insert into public.stations(name,district,area,source,source_url,source_checked_at) values
  ('Puma Energy Mulanje','Mulanje','M2, Mulanje','Puma Energy Africa Stations Locations (2025)','https://pumaenergy.com/wp-content/uploads/2025/08/Puma-Energy-Africa-Stations-Locations.pdf','2026-11-09'),
  ('Engen Nkando Service Station','Mulanje','Nkando, M4','Engen station locator','https://www.engen.mw/station-locator/','2026-11-09'),
  ('Engen Muloza Service Station','Mulanje','Muloza Trading Centre','Engen station locator','https://www.engen.mw/station-locator/','2026-11-09')
on conflict do nothing;
