insert into public.stations(name,district,area,source,source_url,source_checked_at)
values ('Puma Energy Ntchisi','Ntchisi','M7, Ntchisi','Puma Energy Africa Stations Locations (2025)','https://pumaenergy.com/wp-content/uploads/2025/08/Puma-Energy-Africa-Stations-Locations.pdf','2026-11-09')
on conflict do nothing;
