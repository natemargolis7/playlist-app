-- Core schema: accounts (profiles), musician profiles, venues, gigs and applications.

create type public.user_role as enum ('musician', 'venue');
create type public.gig_status as enum ('open', 'filled', 'cancelled');
create type public.application_status as enum ('pending', 'accepted', 'declined', 'withdrawn');

-- One row per auth user, holding their role.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- Customizable public profile for musicians.
create table public.musicians (
  id uuid primary key references public.profiles (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,40}$'),
  stage_name text not null,
  headline text,
  bio text,
  location text,
  genres text[] not null default '{}',
  instruments text[] not null default '{}',
  rate_cents integer check (rate_cents >= 0),
  avatar_url text,
  banner_url text,
  accent_color text not null default '#7c3aed' check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  links jsonb not null default '{}'::jsonb,        -- { website, instagram, spotify, youtube, soundcloud, bandcamp }
  media_urls text[] not null default '{}',          -- YouTube / SoundCloud / Spotify embeds
  available boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  address text,
  city text,
  capacity integer check (capacity > 0),
  website text,
  logo_url text,
  updated_at timestamptz not null default now()
);

create table public.gigs (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  duration_minutes integer check (duration_minutes > 0),
  pay_cents integer not null check (pay_cents >= 0),
  genres text[] not null default '{}',
  status public.gig_status not null default 'open',
  created_at timestamptz not null default now()
);
create index gigs_open_idx on public.gigs (starts_at) where status = 'open';
create index gigs_venue_idx on public.gigs (venue_id);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs (id) on delete cascade,
  musician_id uuid not null references public.musicians (id) on delete cascade,
  message text,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (gig_id, musician_id)
);
create index applications_musician_idx on public.applications (musician_id);

-- Create profile + role-specific row when a user signs up.
-- Expects raw_user_meta_data = { role: 'musician' | 'venue', display_name: text }.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role public.user_role := coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'musician')::public.user_role;
  v_name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1));
  v_slug text;
begin
  insert into public.profiles (id, role, display_name) values (new.id, v_role, v_name);

  if v_role = 'musician' then
    v_slug := left(trim(both '-' from regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g')), 30);
    if length(v_slug) < 3 then v_slug := 'musician'; end if;
    v_slug := v_slug || '-' || substr(replace(new.id::text, '-', ''), 1, 6);
    insert into public.musicians (id, slug, stage_name) values (new.id, v_slug, v_name);
  else
    insert into public.venues (id, name) values (new.id, v_name);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger musicians_touch before update on public.musicians
  for each row execute function public.touch_updated_at();
create trigger venues_touch before update on public.venues
  for each row execute function public.touch_updated_at();

-- Row level security
alter table public.profiles enable row level security;
alter table public.musicians enable row level security;
alter table public.venues enable row level security;
alter table public.gigs enable row level security;
alter table public.applications enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
-- No update policy on profiles: role is fixed at sign-up. Names live on musicians/venues.

create policy "musicians are public" on public.musicians for select using (true);
create policy "musicians update own row" on public.musicians for update
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "venues are public" on public.venues for select using (true);
create policy "venues update own row" on public.venues for update
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "gigs are public" on public.gigs for select using (true);
create policy "venues create own gigs" on public.gigs for insert
  with check (auth.uid() = venue_id);
create policy "venues update own gigs" on public.gigs for update
  using (auth.uid() = venue_id) with check (auth.uid() = venue_id);
create policy "venues delete own gigs" on public.gigs for delete
  using (auth.uid() = venue_id);

-- Applications are visible to the applicant and to the venue that posted the gig.
create policy "applicant or venue reads applications" on public.applications for select
  using (
    auth.uid() = musician_id
    or exists (select 1 from public.gigs g where g.id = gig_id and g.venue_id = auth.uid())
  );
create policy "musicians apply to open gigs" on public.applications for insert
  with check (
    auth.uid() = musician_id
    and exists (select 1 from public.gigs g where g.id = gig_id and g.status = 'open')
  );
-- Musicians may only withdraw; venues may accept or decline. Enforced by trigger below.
create policy "applicant or venue updates applications" on public.applications for update
  using (
    auth.uid() = musician_id
    or exists (select 1 from public.gigs g where g.id = gig_id and g.venue_id = auth.uid())
  );

create or replace function public.guard_application_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_is_venue boolean;
begin
  if new.gig_id <> old.gig_id or new.musician_id <> old.musician_id then
    raise exception 'cannot move an application';
  end if;

  select exists (select 1 from gigs where id = new.gig_id and venue_id = auth.uid()) into v_is_venue;

  if v_is_venue then
    if new.status not in ('accepted', 'declined', 'pending') or new.message is distinct from old.message then
      raise exception 'venues may only accept or decline';
    end if;
  elsif auth.uid() = old.musician_id then
    if new.status not in ('withdrawn', old.status) then
      raise exception 'musicians may only withdraw';
    end if;
  end if;

  -- Accepting fills the gig.
  if new.status = 'accepted' and old.status <> 'accepted' then
    update gigs set status = 'filled' where id = new.gig_id;
  end if;

  return new;
end;
$$;

create trigger applications_guard before update on public.applications
  for each row execute function public.guard_application_update();
