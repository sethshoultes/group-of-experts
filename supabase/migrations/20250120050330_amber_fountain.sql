/*
  # Drop All Tables and Extensions

  1. Changes
    - Drop all tables with CASCADE
    - Remove extensions with CASCADE
    - Clean up schema completely

  2. Notes
    - Uses CASCADE to handle all dependencies
    - Removes all related objects
    - Complete cleanup of database
*/

-- Disable row level security first
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users DISABLE ROW LEVEL SECURITY;

-- Drop tables in correct order with CASCADE
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop extensions with CASCADE to handle dependencies
DROP EXTENSION IF EXISTS "supabase_vault" CASCADE;
DROP EXTENSION IF EXISTS "pgsodium" CASCADE;

-- Force schema cache refresh
SELECT pg_notify('pgrst', 'reload schema');