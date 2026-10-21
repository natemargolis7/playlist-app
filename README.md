# Playlist

A marketplace that connects live musicians with paid gigs. Built with Next.js (App Router, TypeScript, Tailwind) and Supabase (Auth + Postgres with row level security).

## What's here

- **Two account types.** Sign up as a musician or a venue (`/signup`). A database trigger creates the matching row on sign-up.
- **Customizable musician profiles.** Stage name, custom profile URL, headline, bio, location, rate, genres, instruments, accent color, photo and banner, social links, and embedded YouTube / Spotify / SoundCloud tracks, with a live preview while editing (`/dashboard/profile`). Public at `/musicians/<slug>`, browsable at `/musicians`.
- **Venues** edit their details and get a public page at `/venues/<id>`.
- **Gigs.** Venues post paid gigs (`/gigs/new`); everyone can browse open gigs filtered by genre and minimum pay (`/gigs`).
- **Applications.** Musicians apply with a pitch and can withdraw; venues see applicants on the gig page and accept or decline. Accepting marks the gig filled.
- **Response deadlines.** Venues have 5 days to accept or decline (at most until a day before the gig). They get a reminder a day before the deadline; after it the application closes as expired and the musician is told. Filling or cancelling a gig closes its other pending applications the same way. Venue pages show how quickly each venue replies.
- **Email notifications.** New applicants, bookings, declines, reminders and new messages (at most one email per conversation every 15 minutes). Database triggers queue them in `notifications`; the app sends them through [Resend](https://resend.com) right after each action, and a daily cron (`vercel.json` → `/api/cron`) catches anything left over. Users can turn emails off on their profile page.
- **Messages.** Every application is a conversation (`/messages`) between the musician and the venue, updated live through Supabase Realtime, with unread counts in the nav. Once a venue books a musician, each side sees the other's private booking email and phone.

## Setup

1. Create a Supabase project.
2. Apply the schema: either `supabase db push` with the Supabase CLI, or paste each file in `supabase/migrations/` into the SQL editor, oldest first. `20261020000000_media_storage.sql` creates the `media` storage bucket used for photo uploads. `20261020010000_messaging.sql` adds conversations and private booking contact details. `20261021000000_notifications_and_deadlines.sql` adds response deadlines and the email outbox.
3. Copy `.env.example` to `.env.local` and fill in your project URL and anon key.
4. `npm install && npm run dev`, then open http://localhost:3000.

### Email notifications

Optional. Without these variables the app works the same but sends no email (deadlines still apply).

1. Create a [Resend](https://resend.com) account, verify a domain you own, and create an API key. Until a domain is verified, Resend only delivers to your own address.
2. Set these in `.env.local` and in your Vercel project settings:
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase > Project Settings > API keys (the secret / service role key). Server-only, never expose it.
   - `RESEND_API_KEY`
   - `EMAIL_FROM`, for example `Playlist <notifications@yourdomain.com>`
   - `CRON_SECRET`: any long random string. Vercel sends it with the daily cron call.

### Email confirmation

If email confirmation is on (the Supabase default), set the "Confirm signup" email template link to:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard/profile
```

and set Site URL under Auth > URL Configuration. For local testing you can turn confirmation off and users are signed in straight away.

## Layout

```
src/app/            routes (auth, dashboard, gigs, musicians, venues)
src/components/     shared UI (nav, gig card, profile header)
src/lib/supabase/   server client + middleware session refresh
supabase/migrations SQL schema, triggers and RLS policies
```

## Security model

All tables have RLS. Profiles, musicians, venues and gigs are publicly readable. Users can only edit their own musician or venue row, venues can only create and manage their own gigs, and applications are visible only to the applicant and the venue that posted the gig. A trigger restricts musicians to withdrawing and venues to accepting or declining.
