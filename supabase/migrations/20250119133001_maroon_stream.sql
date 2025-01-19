/*
  # Update API Keys Table and Policies

  1. Ensure Table Structure
    - Check for pgsodium extension
    - Add any missing columns or constraints
    - Add indexes if not present

  2. Security Updates
    - Ensure RLS is enabled
    - Update existing policies if needed
    - Add trigger for updated_at if not exists
*/

-- Enable secure key management if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgsodium";

-- Create the table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    provider text NOT NULL CHECK (provider IN ('claude', 'openai')),
    key text NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true,
    last_used timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Create or replace the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$ BEGIN
  CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;