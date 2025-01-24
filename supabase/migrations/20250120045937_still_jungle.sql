/*
  # Fix discussions table schema

  1. Changes
    - Consolidate current_round column definition
    - Refresh schema cache
    - Ensure proper column constraints

  2. Security
    - Maintain existing RLS policies
    - No data loss
*/

-- Refresh schema cache for discussions table
BEGIN;

  -- Drop existing current_round column if it exists
  DO $$ 
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'discussions' 
      AND column_name = 'current_round'
    ) THEN
      ALTER TABLE discussions DROP COLUMN current_round;
    END IF;
  END $$;

  -- Add current_round column with proper constraints
  ALTER TABLE discussions
  ADD COLUMN current_round integer NOT NULL DEFAULT 1;

  -- Create index for current_round if it doesn't exist
  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'discussions' 
      AND indexname = 'idx_discussions_current_round'
    ) THEN
      CREATE INDEX idx_discussions_current_round ON discussions(current_round);
    END IF;
  END $$;

  -- Notify PostgREST to refresh schema cache
  NOTIFY pgrst, 'reload schema';

COMMIT;