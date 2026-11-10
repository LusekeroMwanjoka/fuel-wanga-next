-- Move admin authentication to Supabase Auth. Run after migration_001_roles.sql.
-- Existing accounts are linked to auth.users by matching email. Accounts with no
-- matching Auth user remain unlinked and cannot sign in until an Auth user exists.

alter table public.station_admins
  add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;

create unique index if not exists station_admins_auth_user_unique
  on public.station_admins (auth_user_id)
  where auth_user_id is not null;

-- Link existing station admins to their Supabase Auth users.
update public.station_admins sa
set auth_user_id = u.id
from auth.users u
where sa.auth_user_id is null
  and lower(sa.email) = lower(u.email);

-- Materialize the app roles in profiles, which is the app's role source of truth.
insert into public.profiles (id, role, station_id, display_name)
select u.id, 'super_admin', null, coalesce(nullif(u.raw_user_meta_data ->> 'display_name', ''), '')
from public.super_admins s
join auth.users u on lower(u.email) = lower(s.email)
on conflict (id) do update
set role = 'super_admin', station_id = null;

insert into public.profiles as current_profile (id, role, station_id, display_name)
select sa.auth_user_id, 'station_admin', sa.station_id, sa.display_name
from public.station_admins sa
where sa.auth_user_id is not null
on conflict (id) do update
set role = case when current_profile.role = 'super_admin' then 'super_admin' else 'station_admin' end,
    station_id = case when current_profile.role = 'super_admin' then null else excluded.station_id end,
    display_name = case when current_profile.role = 'super_admin' then current_profile.display_name else excluded.display_name end;

-- Passwords and hashes are now owned and managed by Supabase Auth.
alter table public.station_admins drop column if exists password_hash;
drop table if exists public.super_admins;
