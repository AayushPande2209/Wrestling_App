-- ─────────────────────────────────────────────────────────────
-- Waitlist — landing page email capture
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- The public marketing landing page (ui/pages/Landing.jsx) inserts
-- emails here using the anon key. No auth required.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz default now()
);

-- The landing page is public, so the anon role must be able to INSERT.
-- We DO enable RLS and grant only INSERT to anon — this lets anyone join
-- the waitlist while preventing the anon key from SELECTing (i.e. scraping)
-- every email already on the list. The app never reads from this table.
--
-- If you'd rather leave RLS off entirely (as in the original spec), delete
-- the block below — but note that doing so lets anyone with the anon key
-- read the full list of emails.
alter table public.waitlist enable row level security;

drop policy if exists "waitlist: anyone can join" on public.waitlist;
create policy "waitlist: anyone can join"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);
