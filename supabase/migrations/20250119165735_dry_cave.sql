/*
  # Initial Schema Setup

  1. Core Infrastructure
    - Enable pgsodium for secure key management
    - Create updated_at function and trigger
    - Set up tables for API keys, discussions, messages, and admin users
  
  2. Security
    - Enable RLS on all tables
    - Set up proper indexes
    - Create security policies
*/

-- Enable secure key management
CREATE EXTENSION IF NOT EXISTS "pgsodium";

-- Create updated_at function
DO $$ 
BEGIN
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ language 'plpgsql';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create tables
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

CREATE TABLE IF NOT EXISTS discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  topic text NOT NULL,
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'completed')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid REFERENCES discussions ON DELETE CASCADE NOT NULL,
  expert_role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_discussion_id ON messages(discussion_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Create triggers
DO $$ 
BEGIN
  CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE TRIGGER update_discussions_updated_at
    BEFORE UPDATE ON discussions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create policies with safe creation
DO $$ 
BEGIN
  -- API Keys Policies
  CREATE POLICY "Users can view their own API keys"
    ON api_keys FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "Users can create their own API keys"
    ON api_keys FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "Users can update their own API keys"
    ON api_keys FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "Users can delete their own API keys"
    ON api_keys FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Discussions Policies
DO $$ 
BEGIN
  CREATE POLICY "Users can view their own discussions"
    ON discussions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "Users can create their own discussions"
    ON discussions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "Users can update their own discussions"
    ON discussions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "Users can delete their own discussions"
    ON discussions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Messages Policies
DO $$ 
BEGIN
  CREATE POLICY "Users can view messages in their discussions"
    ON messages FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM discussions
      WHERE discussions.id = messages.discussion_id
      AND discussions.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "Users can create messages in their discussions"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
      SELECT 1 FROM discussions
      WHERE discussions.id = messages.discussion_id
      AND discussions.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "Users can update messages in their discussions"
    ON messages FOR UPDATE
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM discussions
      WHERE discussions.id = messages.discussion_id
      AND discussions.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM discussions
      WHERE discussions.id = messages.discussion_id
      AND discussions.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "Users can delete messages in their discussions"
    ON messages FOR DELETE
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM discussions
      WHERE discussions.id = messages.discussion_id
      AND discussions.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Admin Users Policies
DO $$ 
BEGIN
  CREATE POLICY "View admin status"
    ON admin_users FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "First admin creation"
    ON admin_users FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT COUNT(*) FROM admin_users) = 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "Admin management"
    ON admin_users FOR ALL
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM admin_users a 
      WHERE a.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;