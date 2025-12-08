-- Run this SQL in your Supabase SQL editor to create an `admins` table
-- Then insert an admin with a bcrypt-hashed password.

create table if not exists admins (
  id bigserial primary key,
  email text unique,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Example: insert a user (replace the hash with one produced by bcrypt)
-- insert into admins (email, password_hash) values ('admin@example.com', '$2a$10$...');
