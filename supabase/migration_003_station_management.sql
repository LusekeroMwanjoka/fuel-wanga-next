-- Adds station activation controls and guarded permanent deletion.
alter table public.stations
  add column if not exists is_active boolean not null default true;

-- Reports from old clients cannot be submitted for a station after it is deactivated.
create or replace function public.submit_station_report(
  p_station_id uuid, p_fuel text, p_status text, p_queue text, p_reporter_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_allowed uuid;
  v_confirmations integer;
  v_created_at timestamptz := now();
begin
  if p_fuel not in ('Petrol','Diesel','Both') or p_status not in ('Available','Low','No fuel')
     or p_queue not in ('No queue update','No queue','Short queue','Medium queue','Long queue') then
    raise exception 'INVALID_REPORT';
  end if;
  if not exists (select 1 from public.stations where id = p_station_id and is_active = true) then
    raise exception 'STATION_NOT_FOUND';
  end if;
  insert into public.report_limits(station_id, reporter_key, last_report_at)
    values (p_station_id, p_reporter_key, v_created_at)
    on conflict (station_id, reporter_key) do update set last_report_at = excluded.last_report_at
      where public.report_limits.last_report_at <= v_created_at - interval '15 minutes'
    returning station_id into v_allowed;
  if v_allowed is null then raise exception 'REPORT_RATE_LIMIT'; end if;
  insert into public.reports(station_id, fuel, status, queue, reporter_key, created_at)
    values (p_station_id, p_fuel, p_status, p_queue, p_reporter_key, v_created_at);
  select count(distinct reporter_key)::integer into v_confirmations from public.reports
    where station_id = p_station_id and fuel = p_fuel and status = p_status
      and created_at >= v_created_at - interval '3 hours';
  return jsonb_build_object('ok', true, 'createdAt', v_created_at, 'confirmations', v_confirmations);
end;
$$;

revoke all on function public.submit_station_report(uuid, text, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.submit_station_report(uuid, text, text, text, uuid)
  to service_role;

-- Do not cascade-delete station reports, limits, admins or profiles by accident.
create or replace function public.delete_station_if_unused(p_station_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform 1 from public.stations where id = p_station_id for update;
  if not found then raise exception 'STATION_NOT_FOUND'; end if;

  if exists (select 1 from public.reports where station_id = p_station_id)
     or exists (select 1 from public.report_limits where station_id = p_station_id)
     or exists (select 1 from public.station_admins where station_id = p_station_id)
     or exists (select 1 from public.admin_updates where station_id = p_station_id)
     or exists (select 1 from public.profiles where station_id = p_station_id) then
    raise exception 'STATION_IN_USE';
  end if;

  delete from public.stations where id = p_station_id;
end;
$$;

revoke all on function public.delete_station_if_unused(uuid) from public, anon, authenticated;
grant execute on function public.delete_station_if_unused(uuid) to service_role;
