/*
  # Fix discussions schema

  1. Changes
    - Refresh schema cache for discussions table
    - Ensure current_round column exists with proper constraints
    - Add missing indexes

  2. Security
    - No data loss
    - Safe schema updates
*/

-- Refresh schema cache for discussions table
DO $$ 
BEGIN
  -- Ensure current_round exists with proper constraints
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discussions' 
    AND column_name = 'current_round'
  ) THEN
    ALTER TABLE discussions
    ADD COLUMN current_round integer NOT NULL DEFAULT 1;
  END IF;

  -- Ensure index exists
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