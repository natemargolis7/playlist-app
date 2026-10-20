-- Messaging between a venue and a musician, one conversation per application,
-- plus private booking contact details that unlock once an application is accepted.

-- True when the current user is the applicant or the venue that posted the gig.
create or replace function public.is_application_participant(p_application_id uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from applications a join gigs g on g.id = a.gig_id
    where a.id = p_application_id and auth.uid() in (a.musician_id, g.venue_id)
  );
$$;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index messages_application_idx on public.messages (application_id, created_at);

alter table public.messages enable row level security;

create policy "participants read messages" on public.messages for select
  using (public.is_application_participant(application_id));

-- Conversations stay open while an application is pending or accepted.
create policy "participants send messages" on public.messages for insert
  with check (
    sender_id = auth.uid()
    and public.is_application_participant(application_id)
    and exists (select 1 from public.applications a where a.id = application_id and a.status in ('pending', 'accepted'))
  );

-- Last time each participant opened a conversation, for unread counts.
create table public.conversation_reads (
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (application_id, user_id)
);

alter table public.conversation_reads enable row level security;

create policy "users manage own read markers" on public.conversation_reads for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.is_application_participant(application_id));

-- Private contact details, visible to the owner and to anyone they have a booking with.
create table public.contact_details (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  email text,
  phone text,
  updated_at timestamptz not null default now()
);

create or replace function public.has_booking_with(p_other uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from applications a join gigs g on g.id = a.gig_id
    where a.status = 'accepted'
      and ((a.musician_id = auth.uid() and g.venue_id = p_other)
        or (g.venue_id = auth.uid() and a.musician_id = p_other))
  );
$$;

alter table public.contact_details enable row level security;

create policy "owner or booked party reads contact" on public.contact_details for select
  using (user_id = auth.uid() or public.has_booking_with(user_id));
create policy "owner inserts contact" on public.contact_details for insert
  with check (user_id = auth.uid());
create policy "owner updates contact" on public.contact_details for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger contact_details_touch before update on public.contact_details
  for each row execute function public.touch_updated_at();

-- Seed contact email from the auth account. Runs after on_auth_user_created (triggers fire in name order).
create or replace function public.handle_new_user_contact()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.contact_details (user_id, email) values (new.id, new.email) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_contact
  after insert on auth.users
  for each row execute function public.handle_new_user_contact();

insert into public.contact_details (user_id, email)
select p.id, u.email from public.profiles p join auth.users u on u.id = p.id
on conflict do nothing;

-- One row per conversation the current user is in, newest activity first.
create or replace function public.inbox()
returns table (
  application_id uuid,
  gig_id uuid,
  gig_title text,
  starts_at timestamptz,
  status public.application_status,
  other_id uuid,
  other_name text,
  other_avatar text,
  other_color text,
  other_slug text,
  last_body text,
  last_at timestamptz,
  last_sender uuid,
  unread integer
)
language sql stable
security invoker set search_path = public
as $$
  select
    a.id, g.id, g.title, g.starts_at, a.status,
    case when a.musician_id = auth.uid() then v.id else m.id end,
    case when a.musician_id = auth.uid() then v.name else m.stage_name end,
    case when a.musician_id = auth.uid() then v.logo_url else m.avatar_url end,
    case when a.musician_id = auth.uid() then null else m.accent_color end,
    case when a.musician_id = auth.uid() then null else m.slug end,
    coalesce(last.body, a.message),
    coalesce(last.created_at, a.created_at),
    coalesce(last.sender_id, a.musician_id),
    (
      select count(*)::int from messages x
      where x.application_id = a.id and x.sender_id <> auth.uid()
        and x.created_at > coalesce(r.last_read_at, '-infinity')
    ) + case
      -- The pitch counts as unread for the venue until they open the conversation.
      when g.venue_id = auth.uid() and r.last_read_at is null and a.message is not null then 1 else 0
    end
  from applications a
  join gigs g on g.id = a.gig_id
  join venues v on v.id = g.venue_id
  join musicians m on m.id = a.musician_id
  left join conversation_reads r on r.application_id = a.id and r.user_id = auth.uid()
  left join lateral (
    select body, created_at, sender_id from messages x
    where x.application_id = a.id order by created_at desc limit 1
  ) last on true
  where auth.uid() in (a.musician_id, g.venue_id)
  order by coalesce(last.created_at, a.created_at) desc;
$$;

-- Live updates for open conversations (RLS still applies to subscribers).
alter publication supabase_realtime add table public.messages;
