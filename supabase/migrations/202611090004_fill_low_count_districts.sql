insert into public.stations(name,district,area,source,source_url,source_checked_at) values
  ('Puma Energy Zalewa','Neno','M1, Zalewa','Puma Energy Africa Stations Locations (2025)','https://pumaenergy.com/wp-content/uploads/2025/08/Puma-Energy-Africa-Stations-Locations.pdf','2026-11-09'),
  ('Mount Meru Ntchisi Filling Station','Ntchisi','Near Ntchisi Hospital','OpenStreetMap via Mapcarta','https://mapcarta.com/N8293977599','2026-11-09'),
  ('Chitipa Puma Service Station','Chitipa','Chitipa Boma','MERA station operations notice (Aug 2025)','https://www.times.mw/fuel-woes-stir-up-new-rules/','2026-11-09'),
  ('Karonga Ipyana Mount Meru Service Station','Karonga','Ipyana','MERA station operations notice (Aug 2025)','https://www.times.mw/fuel-woes-stir-up-new-rules/','2026-11-09'),
  ('Karonga SIMSO Service Station','Karonga','Karonga Boma','MERA station operations notice (Aug 2025)','https://www.times.mw/fuel-woes-stir-up-new-rules/','2026-11-09'),
  ('Kaporo SIMSO Service Station','Karonga','Kaporo','MERA station operations notice (Aug 2025)','https://www.times.mw/fuel-woes-stir-up-new-rules/','2026-11-09'),
  ('Puma Energy Nkhata Bay','Nkhata Bay','Nkhata Bay Highway','Puma Energy Africa Stations Locations (2025)','https://pumaenergy.com/wp-content/uploads/2025/08/Puma-Energy-Africa-Stations-Locations.pdf','2026-11-09'),
  ('Puma Energy Dwangwa','Nkhotakota','M5, Dwangwa','Puma Energy Africa Stations Locations (2025)','https://pumaenergy.com/wp-content/uploads/2025/08/Puma-Energy-Africa-Stations-Locations.pdf','2026-11-09'),
  ('Engen Mwansambo Service Station','Nkhotakota','Near Mkaika','Engen station locator','https://www.engen.mw/station-locator/','2026-11-09'),
  ('Puma Energy Ulongwe','Balaka','M3, Ulongwe','Puma Energy Africa Stations Locations (2025)','https://pumaenergy.com/wp-content/uploads/2025/08/Puma-Energy-Africa-Stations-Locations.pdf','2026-11-09'),
  ('Namwera Super Sink Service Station','Machinga','Namwera','MERA station operations notice (Aug 2025)','https://www.times.mw/fuel-woes-stir-up-new-rules/','2026-11-09'),
  ('Tengani Filling Station','Nsanje','Tengani','Malawi Freedom Network report (Jul 2026)','https://malawifreedomnetwork.com/fuel-shortage-crisis-hits-nsanje-only-diesel-available-at-major-stations/','2026-11-09'),
  ('Muloza Mount Meru Service Station','Mulanje','Muloza','MERA station operations notice (Aug 2025)','https://www.times.mw/fuel-woes-stir-up-new-rules/','2026-11-09')
on conflict do nothing;
