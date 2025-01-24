/*
  # Drop All Tables

  1. Changes
    - Drop all tables in correct order
    - Remove extensions
    - Clean up schema

  2. Notes
    - Drops tables in order to respect foreign key constraints
    - Removes indexes and triggers automatically
    - Cleans up extensions
*/

-- Disable row level security first
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users DISABLE ROW LEVEL SECURITY;

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS discussions;
DROP TABLE IF EXISTS api_keys;
DROP TABLE IF EXISTS admin_users;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop extensions
DROP EXTENSION IF EXISTS "pgsodium";

-- Force schema cache refresh
SELECT pg_notify('pgrst', 'reload schema');