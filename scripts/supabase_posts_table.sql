-- Posts table with SEO columns for Supabase

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Posts table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  description text,
  content text,
  image text,
  -- SEO fields
  meta_title text,
  meta_description text,
  meta_keywords text,
  canonical_url text,
  meta_robots text,
  og_image text,

  published boolean default false,
  published_at timestamptz,
  -- Keep the same type as `admins.id` (use bigint if admins.id is serial/bigint)
  author_id bigint references public.admins(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to keep updated_at fresh
create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql volatile;

drop trigger if exists set_timestamp on public.posts;
create trigger set_timestamp
  before update on public.posts
  for each row execute function public.trigger_set_timestamp();

-- Full text search column + index (including title + content + meta fields)
alter table public.posts drop column if exists tsv;
alter table public.posts add column tsv tsvector;

-- Populate existing rows
update public.posts set tsv = to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,'') || ' ' || coalesce(meta_description,'') || ' ' || coalesce(meta_keywords,''));

-- Index for fast search
create index if not exists posts_tsv_idx on public.posts using gin (tsv);

-- Trigger to maintain tsv on insert/update
create or replace function public.posts_tsv_trigger() returns trigger as $$
begin
  new.tsv := to_tsvector('english', coalesce(new.title,'') || ' ' || coalesce(new.content,'') || ' ' || coalesce(new.meta_description,'') || ' ' || coalesce(new.meta_keywords,''));
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_tsv_update on public.posts;
create trigger posts_tsv_update
  before insert or update on public.posts
  for each row execute function public.posts_tsv_trigger();

-- Example insert (publish immediately)
insert into public.posts (slug, title, description, content, image, meta_title, meta_description, meta_keywords, published, published_at)
values ('hello-world', 'Hello World', 'First post', '<p>Hello world from Supabase-backed blog!</p>', '', 'Hello World — iDarija', 'A short description for SEO', 'darija,arabic,language', true, now());
