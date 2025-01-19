/*
  # Fix recursive admin policies

  1. Changes
    - Drop existing policies
    - Add new non-recursive policies
    - Simplify policy structure
    - Maintain security model

  2. Security
    - Allow viewing admin status
    - Allow first admin creation
    - Allow admin management by admins
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Allow first admin creation" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;

-- Create new non-recursive policies
-- Allow viewing admin status (needed for role checks)
CREATE POLICY "View admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow first admin creation when table is empty
CREATE POLICY "First admin creation"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT COUNT(*) FROM admin_users) = 0
  );

-- Allow admins to insert new admins
CREATE POLICY "Admin user management"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM admin_users a 
      WHERE a.user_id = auth.uid()
      AND a.user_id <> COALESCE(admin_users.user_id, '00000000-0000-0000-0000-000000000000')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM admin_users a 
      WHERE a.user_id = auth.uid()
      AND a.user_id <> COALESCE(NEW.user_id, '00000000-0000-0000-0000-000000000000')
    )
  );