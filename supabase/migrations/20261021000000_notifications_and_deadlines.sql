-- Response deadlines so musicians are never left hanging, plus an outbox of email notifications.
--
-- Every application gets a respond_by deadline. Venues get a reminder a day before it, and if they
-- still haven't answered, the application closes as declined with closed_reason = 'expired'.
-- Filling or cancelling a gig closes its other pending applications the same way.
-- Database triggers write to public.notifications; the app (service role) sends them as email.

alter table public.applications
  add column respond_by timestamptz,
  add column decided_at timestamptz,
  add column reminded_at timestamptz,
  add column closed_reason text check (closed_reason in ('expired', 'gig_filled', 'gig_cancelled'));

-- Existing applications get a fresh window from today.
update public.applications a
set respond_by = case when a.status = 'pending' then least(now() + interval '5 days', g.starts_at) else a.created_at + interval '5 days' end
from public.gigs g
where g.id = a.gig_id;

alter table public.applications alter column respond_by set not null;
create index applications_pending_deadline_idx on public.applications (respond_by) where status = 'pending';

alter table public.contact_details add column email_notifications boolean not null default true;

-- Venues have five days to answer, and at the latest until a day before the gig.
-- Gigs that start sooner than that can be answered until they start.
create or replace function public.application_deadline(p_starts_at timestamptz)
returns timestamptz
language sql stable
as $$
  select case
    when least(now() + interval '5 days', p_starts_at - interval '1 day') > now() + interval '2 hours'
      then least(now() + interval '5 days', p_starts_at - interval '1 day')
    else p_starts_at
  end;
$$;

create or replace function public.prepare_application()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  select application_deadline(g.starts_at) into new.respond_by from gigs g where g.id = new.gig_id;
  new.decided_at := null;
  new.reminded_at := null;
  new.closed_reason := null;
  return new;
end;
$$;

create trigger applications_prepare before insert on public.applications
  for each row execute function public.prepare_application();

-- System closures (expiry, gig filled or cancelled) set playlist.system for their transaction.
create or replace function public.is_system_update()
returns boolean
language sql stable
as $$
  select coalesce(current_setting('playlist.system', true), '') = 'on';
$$;

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

  if is_system_update() then
    if old.status = 'pending' and new.status <> 'pending' then
      new.decided_at := now();
    end if;
    return new;
  end if;

  -- Bookkeeping columns belong to the system.
  new.respond_by := old.respond_by;
  new.reminded_at := old.reminded_at;
  new.closed_reason := old.closed_reason;
  new.decided_at := old.decided_at;

  select exists (select 1 from gigs where id = new.gig_id and venue_id = auth.uid()) into v_is_venue;

  if v_is_venue then
    if new.status not in ('accepted', 'declined', 'pending') or new.message is distinct from old.message then
      raise exception 'venues may only accept or decline';
    end if;
    if new.status <> old.status and old.status = 'pending' and old.respond_by <= now() then
      raise exception 'this application has expired';
    end if;
  elsif auth.uid() = old.musician_id then
    if new.status not in ('withdrawn', old.status) then
      raise exception 'musicians may only withdraw';
    end if;
  end if;

  if old.status = 'pending' and new.status in ('accepted', 'declined') then
    new.decided_at := now();
  end if;

  return new;
end;
$$;

-- Outbox of emails to send. Only the service role reads it (RLS on, no policies).
create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('new_application', 'respond_reminder', 'accepted', 'declined', 'gig_cancelled', 'message')),
  application_id uuid not null references public.applications (id) on delete cascade,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  attempts integer not null default 0,
  last_error text
);
create index notifications_unsent_idx on public.notifications (id) where sent_at is null;
create index notifications_recent_idx on public.notifications (application_id, user_id, kind, created_at);

alter table public.notifications enable row level security;

create or replace function public.notify_application_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into notifications (user_id, kind, application_id)
  select g.venue_id, 'new_application', new.id from gigs g where g.id = new.gig_id;
  return new;
end;
$$;

create trigger applications_notify_insert after insert on public.applications
  for each row execute function public.notify_application_insert();

-- Accepting fills the gig (which closes the other applicants), and the musician hears back either way.
-- Runs after the update so the gig trigger below sees this application as already decided.
create or replace function public.after_application_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if new.status = 'accepted' then
    insert into notifications (user_id, kind, application_id) values (new.musician_id, 'accepted', new.id);
    update gigs set status = 'filled' where id = new.gig_id and status <> 'filled';
  elsif new.status = 'declined' then
    insert into notifications (user_id, kind, application_id) values (new.musician_id, 'declined', new.id);
  end if;

  return new;
end;
$$;

create trigger applications_after_update after update on public.applications
  for each row execute function public.after_application_update();

-- Filling or cancelling a gig closes its pending applications; cancelling also tells the booked musician.
create or replace function public.after_gig_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status is not distinct from old.status or new.status = 'open' then
    return new;
  end if;

  perform set_config('playlist.system', 'on', true);
  update applications
  set status = 'declined', closed_reason = case when new.status = 'filled' then 'gig_filled' else 'gig_cancelled' end
  where gig_id = new.id and status = 'pending';
  perform set_config('playlist.system', 'off', true);

  if new.status = 'cancelled' then
    insert into notifications (user_id, kind, application_id)
    select musician_id, 'gig_cancelled', id from applications where gig_id = new.id and status = 'accepted';
  end if;

  return new;
end;
$$;

create trigger gigs_after_update after update on public.gigs
  for each row execute function public.after_gig_update();

-- Email the other side of a conversation, at most once every 15 minutes per conversation.
create or replace function public.notify_message_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_recipient uuid;
begin
  select case when a.musician_id = new.sender_id then g.venue_id else a.musician_id end
  into v_recipient
  from applications a join gigs g on g.id = a.gig_id
  where a.id = new.application_id;

  if not exists (
    select 1 from notifications
    where application_id = new.application_id and user_id = v_recipient and kind = 'message'
      and created_at > now() - interval '15 minutes'
  ) then
    insert into notifications (user_id, kind, application_id) values (v_recipient, 'message', new.application_id);
  end if;
  return new;
end;
$$;

create trigger messages_notify after insert on public.messages
  for each row execute function public.notify_message_insert();

-- Remind venues a day before a deadline, then close applications that passed it.
-- Called by the app whenever it sends notifications, and by the daily cron.
create or replace function public.sweep_applications()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform set_config('playlist.system', 'on', true);

  with due as (
    update applications a
    set reminded_at = now()
    from gigs g
    where g.id = a.gig_id
      and a.status = 'pending' and a.reminded_at is null
      and a.respond_by > now() and a.respond_by <= now() + interval '1 day'
      -- Skip reminders for short windows (gigs booked at the last minute).
      and a.created_at < a.respond_by - interval '36 hours'
    returning a.id, g.venue_id
  )
  insert into notifications (user_id, kind, application_id)
  select venue_id, 'respond_reminder', id from due;

  update applications
  set status = 'declined', closed_reason = 'expired'
  where status = 'pending' and respond_by <= now();

  perform set_config('playlist.system', 'off', true);
end;
$$;

-- Hand out a batch of unsent notifications. Rows claimed by a sender that died are retried after
-- 10 minutes; anything older than two days is dropped rather than sent late.
create or replace function public.claim_notifications(p_limit integer default 50)
returns setof public.notifications
language sql
security definer set search_path = public
as $$
  update notifications n
  set claimed_at = now(), attempts = n.attempts + 1
  where n.id in (
    select id from notifications
    where sent_at is null and attempts < 5
      and created_at > now() - interval '2 days'
      and (claimed_at is null or claimed_at < now() - interval '10 minutes')
    order by id
    limit p_limit
    for update skip locked
  )
  returning n.*;
$$;

revoke execute on function public.sweep_applications() from public, anon, authenticated;
revoke execute on function public.claim_notifications(integer) from public, anon, authenticated;
grant execute on function public.sweep_applications() to service_role;
grant execute on function public.claim_notifications(integer) to service_role;

-- How quickly a venue answers applicants, for its public pages.
create or replace function public.venue_response_stats(p_venue uuid)
returns table (answered integer, expired integer, median_hours double precision)
language sql stable
security definer set search_path = public
as $$
  select
    count(*) filter (where a.decided_at is not null and a.closed_reason is null)::int,
    count(*) filter (where a.closed_reason = 'expired')::int,
    percentile_cont(0.5) within group (order by extract(epoch from a.decided_at - a.created_at) / 3600)
      filter (where a.decided_at is not null and a.closed_reason is null)
  from applications a join gigs g on g.id = a.gig_id
  where g.venue_id = p_venue;
$$;
