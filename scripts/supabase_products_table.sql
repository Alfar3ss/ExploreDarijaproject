-- Live shop catalog for ExploreDarija
-- Run this in the Supabase SQL editor before using /admin/shop.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  description text not null default '',
  price numeric(10, 2),
  currency text not null default 'USD',
  type text not null default 'Digital download',
  included text not null default 'Examples, exercises, quick-reference pages',
  format text not null default 'PDF guide, made for phone or print',
  language text not null default 'Moroccan Darija + English',
  label text,
  color text,
  image_url text,
  image_urls text[] not null default '{}',
  checkout_url text,
  whop_token text,
  download_url text,
  digital_file_url text,
  is_new boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists image_urls text[] not null default '{}';
alter table public.products add column if not exists included text not null default 'Examples, exercises, quick-reference pages';
alter table public.products add column if not exists format text not null default 'PDF guide, made for phone or print';
alter table public.products add column if not exists language text not null default 'Moroccan Darija + English';
alter table public.products add column if not exists whop_token text;
alter table public.products add column if not exists download_url text;
alter table public.products add column if not exists digital_file_url text;

create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_featured_idx on public.products (featured) where featured = true;

-- Products are public to read. Admin writes must use the Supabase service_role key
-- from the server environment; service_role bypasses RLS automatically.
alter table public.products enable row level security;
drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
  on public.products for select
  to anon, authenticated
  using (true);

-- Public product images are stored in Supabase Storage. Uploads still go
-- through the server-side service role API.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Public can read product files" on storage.objects;
create policy "Public can read product files"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-files');

-- Keep update timestamps current when an admin edits a product.
create or replace function public.products_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.products_set_updated_at();

-- The app reads this table through server-side API routes using the service key.
-- No seed rows are inserted: add the real catalog from /admin/shop.
