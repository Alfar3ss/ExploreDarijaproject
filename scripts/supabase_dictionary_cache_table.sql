-- SQL migration to create `dictionary_cache` table for persisting generated dictionary entries
-- Run this in your Supabase SQL editor or via psql on your project DB.

-- Note: `gen_random_uuid()` comes from the `pgcrypto` extension. If your DB uses `uuid-ossp`, replace with `uuid_generate_v4()`.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS dictionary_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  source_lang text,
  query_text text,
  entry jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Optional index to speed up prefix/key lookups
CREATE INDEX IF NOT EXISTS idx_dictionary_cache_cache_key ON dictionary_cache(cache_key);
