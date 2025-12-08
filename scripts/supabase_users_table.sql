-- Users table + Sessions table for Supabase (register & login)
-- Run this in Supabase SQL editor (Project → SQL)

-- Ensure pgcrypto is enabled for gen_random_uuid()
create extension if not exists pgcrypto;

-- Users table
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  username text unique,
  name text,
  password_hash text,                -- store bcrypt hashes (do NOT store raw passwords)
  bio text,
  avatar text,
  email_confirmed boolean default false,
  confirmation_token text,
  metadata jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for case-insensitive email lookups
create index if not exists users_email_idx on public.users (lower(email));

-- Sessions table (optional, for server-managed tokens)
create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  token text not null unique,         -- store session token (consider hashing in DB)
  created_at timestamptz default now(),
  expires_at timestamptz,
  user_agent text,
  ip inet
);

-- Trigger to keep updated_at fresh for users
create or replace function public.trigger_set_timestamp_users()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql volatile;

drop trigger if exists set_timestamp_users on public.users;
create trigger set_timestamp_users
  before update on public.users
  for each row execute function public.trigger_set_timestamp_users();

-- Helper notes / example inserts
-- IMPORTANT: Generate bcrypt password hashes on the server (Node using bcrypt/bcryptjs, or any secure method).
-- Example (replace <bcrypt_hash> with a real bcrypt hash):
-- insert into public.users (email, username, name, password_hash, email_confirmed)
-- values ('test@example.com', 'testuser', 'Test User', '<bcrypt_hash>', true);

-- Example session insert (token should be a securely generated random string; prefer storing a hash of the token):
-- insert into public.sessions (user_id, token, expires_at) values ('<user-uuid>', '<secure-token>', now() + interval '7 days');

-- Security & deployment notes
-- 1) DO NOT expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Use it only in server-side Next.js route handlers.
-- 2) For registration: hash the password server-side (e.g., bcryptjs) then call Supabase (or a server API) to insert into `users`.
-- 3) For login: fetch the user row by email (server-side), compare submitted password using bcrypt, then issue a session cookie (HTTP-only) or return a secure token.
-- 4) Consider using Supabase Auth instead of a custom users table if you want built-in auth features (email confirmation flows, OAuth, etc.).
-- 5) When storing session tokens, prefer saving only hashed tokens (e.g., hash token with SHA-256) and compare hashed values, to reduce risk if DB leaks.

-- Optional: Basic RLS skeleton suggestions (do not enable blindly) --
-- If you enable RLS, create policies that allow public SELECT only for published/public data, and restrict INSERT/UPDATE/DELETE to authenticated admin or via server.

-- End of script
