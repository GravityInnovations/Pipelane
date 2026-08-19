create type public.app_role as enum ('admin', 'sales_manager', 'sales_rep');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  role public.app_role not null default 'sales_rep',
  active boolean not null default true,
  job_title text check (job_title is null or char_length(job_title) <= 120),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_active_idx on public.profiles (role, active);

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid() and active = true;
$$;

create function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and active = true);
$$;

alter table public.profiles enable row level security;

create policy "active users can read permitted profiles"
on public.profiles for select to authenticated
using (
  public.is_active_user()
  and (
    id = auth.uid()
    or public.current_app_role() in ('admin', 'sales_manager')
  )
);

create policy "active users can update their safe profile fields"
on public.profiles for update to authenticated
using (public.is_active_user() and id = auth.uid())
with check (public.is_active_user() and id = auth.uid());

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, job_title, avatar_url) on public.profiles to authenticated;

create function public.admin_update_profile(
  target_user_id uuid,
  new_role public.app_role,
  is_active boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_app_role() <> 'admin' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if target_user_id = auth.uid() and is_active = false then
    raise exception 'an admin cannot deactivate their own account' using errcode = '23514';
  end if;

  update public.profiles
  set role = new_role, active = is_active
  where id = target_user_id;

  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.current_app_role() from public;
revoke all on function public.is_active_user() from public;
revoke all on function public.admin_update_profile(uuid, public.app_role, boolean) from public;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.admin_update_profile(uuid, public.app_role, boolean) to authenticated;
