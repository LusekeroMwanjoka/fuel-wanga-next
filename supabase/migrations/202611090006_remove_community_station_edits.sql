-- Station records are maintained from trusted sources; visitors can submit fuel reports only.
drop function if exists public.rename_station(uuid, text);
drop table if exists public.name_edits;
