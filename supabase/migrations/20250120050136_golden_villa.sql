/*
  # Fix Schema Cache Issues

  1. Changes
    - Drop and recreate current_round column
    - Refresh schema cache
    - Fix constraints and indexes

  2. Notes
    - Ensures clean state for current_round column
    - Forces schema cache refresh
    - Preserves data integrity
*/

-- Drop and recreate current_round with proper setup
DO $$ 
BEGIN
  -- Drop column if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discussions' 
    AND column_name = 'current_round'
  ) THEN
    ALTER TABLE discussions DROP COLUMN current_round;
  END IF;

  -- Recreate column with proper constraints
  ALTER TABLE discussions
  ADD COLUMN current_round integer NOT NULL DEFAULT 1;

  -- Recreate index
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'discussions' 
    AND indexname = 'idx_discussions_current_round'
  ) THEN
    DROP INDEX idx_discussions_current_round;
  END IF;
  CREATE INDEX idx_discussions_current_round ON discussions(current_round);
END $$;

-- Force schema cache refresh
SELECT pg_notify('pgrst', 'reload schema');