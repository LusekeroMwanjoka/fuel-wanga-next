insert into public.stations(name,district,area,source,source_url,source_checked_at) values
  ('Engen FLK Service Station','Phalombe','Miseu Four','Engen station locator','https://www.engen.mw/station-locator/','2026-11-09'),
  ('Engen Nguludi Service Station','Chiradzulu','Nguludi Turn-off','Engen station locator','https://www.engen.mw/station-locator/','2026-11-09')
on conflict do nothing;
