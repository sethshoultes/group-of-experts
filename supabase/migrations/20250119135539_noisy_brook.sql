/*
  # Update discussions RLS policies

  1. Changes
    - Enhance RLS policy for discussion creation
    - Add explicit check for non-null auth.uid()
    - Ensure proper user ownership validation

  2. Security
    - Strengthens RLS policies
    - Prevents unauthorized discussion creation
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can create their own discussions" ON discussions;

-- Create enhanced policy with additional checks
CREATE POLICY "Users can create their own discussions"
  ON discussions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
  );