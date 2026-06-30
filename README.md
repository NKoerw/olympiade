# Bierolympiade

Static HTML app published with GitHub Pages.

## Live URL

After the first successful deploy, your site URL will be:

https://nkoerw.github.io/olympiade/

## Local file

The app source is in `bierolympiade.html`.

`index.html` redirects to the app so the root URL works.

## Shared data sync (all users see the same state)

This project now supports shared persistence via Supabase.

If Supabase is not configured, it falls back to local browser storage (per device).

### 1. Create Supabase project

1. Go to https://supabase.com and create a new project.
2. Open `Settings -> API` and copy:
	 - `Project URL`
	 - `anon public` key

### 2. Create table and policies

Open `SQL Editor` and run:

```sql
create table if not exists public.olympiade_state (
	room text primary key,
	state jsonb not null,
	updated_at timestamptz not null default timezone('utc', now())
);

alter table public.olympiade_state enable row level security;

drop policy if exists "Public can read olympiade state" on public.olympiade_state;
create policy "Public can read olympiade state"
on public.olympiade_state
for select
using (true);

drop policy if exists "Public can insert olympiade state" on public.olympiade_state;
create policy "Public can insert olympiade state"
on public.olympiade_state
for insert
with check (true);

drop policy if exists "Public can update olympiade state" on public.olympiade_state;
create policy "Public can update olympiade state"
on public.olympiade_state
for update
using (true)
with check (true);

alter publication supabase_realtime add table public.olympiade_state;
```

### 3. Add Supabase keys in the app

Edit `bierolympiade.html` and set these values in the `SYNC` block near the top of the script:

- `supabaseUrl`
- `supabaseAnonKey`
- `room` (shared room id, e.g. `provence-2026`)

### 4. Push to GitHub

After commit + push, GitHub Pages redeploys automatically.

When live, all users on the same URL (and same `room`) share one common scoreboard.
