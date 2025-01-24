/*
  # Add current_round column to discussions

  1. Changes
    - Add current_round column to discussions table
    - Set default value to 1
    - Make column NOT NULL
*/

-- Add current_round column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discussions' 
    AND column_name = 'current_round'
  ) THEN
    ALTER TABLE discussions
    ADD COLUMN current_round integer NOT NULL DEFAULT 1;
  END IF;
END $$;