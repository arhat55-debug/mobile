export const SQL_SCHEMA = `-- ============================================================
-- NEXUS MLBB — Supabase production schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ---------- Enum ----------
do $$ begin
  create type listing_category as enum ('sale', 'rental');
exception when duplicate_object then null; end $$;

-- ---------- Listings ----------
create table if not exists public.listings (
  id              uuid primary key default gen_random_uuid(),
  category        listing_category not null,
  title           text not null,
  description     text not null default '',
  price           numeric,
  rental_price    numeric,
  rental_duration text,
  rank            text not null,
  heroes          integer not null default 0,
  skins           integer not null default 0,
  messenger_link  text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- Listing images ----------
create table if not exists public.listing_images (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  image_url   text not null,
  created_at  timestamptz not null default now()
);

-- ---------- Buy requests ----------
create table if not exists public.buy_requests (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text not null default '',
  offered_price  numeric not null,
  rank           text not null,
  heroes         integer not null default 0,
  skins          integer not null default 0,
  messenger_link text not null,
  images         text[] not null default '{}',
  status         text not null default 'pending',
  created_at     timestamptz not null default now()
);

-- ---------- Indexes ----------
create index if not exists idx_listings_category   on public.listings(category);
create index if not exists idx_listings_rank       on public.listings(rank);
create index if not exists idx_listings_created_at on public.listings(created_at desc);
create index if not exists idx_listings_price      on public.listings(price);
create index if not exists idx_listings_rental     on public.listings(rental_price);
create index if not exists idx_images_listing      on public.listing_images(listing_id);
create index if not exists idx_buy_created_at       on public.buy_requests(created_at desc);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_listings_updated on public.listings;
create trigger trg_listings_updated
  before update on public.listings
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.listings       enable row level security;
alter table public.listing_images enable row level security;
alter table public.buy_requests   enable row level security;

-- Public can READ listings & images (marketplace is public)
create policy "public read listings"
  on public.listings for select using (true);
create policy "public read images"
  on public.listing_images for select using (true);

-- Only authenticated admins can WRITE listings & images
create policy "admin write listings"
  on public.listings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "admin write images"
  on public.listing_images for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Anyone can SUBMIT a buy request; only admins can read/manage
create policy "public insert buy request"
  on public.buy_requests for insert with check (true);
create policy "admin read buy requests"
  on public.buy_requests for select using (auth.role() = 'authenticated');
create policy "admin manage buy requests"
  on public.buy_requests for update using (auth.role() = 'authenticated');
create policy "admin delete buy requests"
  on public.buy_requests for delete using (auth.role() = 'authenticated');

-- ============================================================
-- Realtime
-- ============================================================
alter publication supabase_realtime add table public.listings;
alter publication supabase_realtime add table public.listing_images;
alter publication supabase_realtime add table public.buy_requests;

-- Create an admin user in Authentication > Users, then log in at /admin
`;
