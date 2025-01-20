/*
  # Consolidated Schema Migration

  1. Core Tables
    - api_keys: Store and manage API keys
    - discussions: Multi-expert discussions with metadata
    - messages: Thread-based messages with references
    - admin_users: Admin user management

  2. Features
    - Secure key management
    - Expert discussion system
    - Message threading
    - Admin capabilities
    - Row-level security

  3. Security
    - RLS policies for all tables
    - Secure defaults
    - Data validation
*/

-- Enable secure key management
CREATE EXTENSION IF NOT EXISTS "pgsodium";

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create tables
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  provider text NOT NULL CHECK (provider IN ('openai')),
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
  expert_ids text[] NOT NULL DEFAULT '{}',
  discussion_mode text NOT NULL DEFAULT 'sequential' CHECK (discussion_mode IN ('sequential', 'parallel')),
  current_round integer NOT NULL DEFAULT 1,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT min_experts CHECK (expert_ids IS NULL OR array_length(expert_ids, 1) IS NULL OR array_length(expert_ids, 1) >= 1),
  CONSTRAINT max_experts CHECK (expert_ids IS NULL OR array_length(expert_ids, 1) IS NULL OR array_length(expert_ids, 1) <= 3)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid REFERENCES discussions ON DELETE CASCADE NOT NULL,
  expert_role text NOT NULL,
  content text NOT NULL,
  round integer NOT NULL DEFAULT 1,
  message_refs jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  response_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_round CHECK (round > 0),
  CONSTRAINT valid_response_order CHECK (response_order IS NULL OR response_order > 0)
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
CREATE INDEX IF NOT EXISTS idx_discussions_expert_ids ON discussions USING gin(expert_ids);
CREATE INDEX IF NOT EXISTS idx_discussions_current_round ON discussions(current_round);
CREATE INDEX IF NOT EXISTS idx_discussions_metadata ON discussions USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_messages_discussion_id ON messages(discussion_id);
CREATE INDEX IF NOT EXISTS idx_messages_round ON messages(round);
CREATE INDEX IF NOT EXISTS idx_messages_response_order ON messages(response_order);
CREATE INDEX IF NOT EXISTS idx_messages_refs ON messages USING gin(message_refs);
CREATE INDEX IF NOT EXISTS idx_messages_metadata ON messages USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Create triggers
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create API Keys policies
CREATE POLICY "Users can view their own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create Discussions policies
CREATE POLICY "Users can view their own discussions"
  ON discussions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own discussions"
  ON discussions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions"
  ON discussions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions"
  ON discussions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create Messages policies
CREATE POLICY "Users can view messages in their discussions"
  ON messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM discussions
    WHERE discussions.id = messages.discussion_id
    AND discussions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create messages in their discussions"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM discussions
    WHERE discussions.id = messages.discussion_id
    AND discussions.user_id = auth.uid()
  ));

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

CREATE POLICY "Users can delete messages in their discussions"
  ON messages FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM discussions
    WHERE discussions.id = messages.discussion_id
    AND discussions.user_id = auth.uid()
  ));

-- Create Admin policies
CREATE POLICY "View admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "First admin only"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id IS NOT NULL
    )
  );

CREATE POLICY "Admin operations"
  ON admin_users FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users admins
      WHERE admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users admins
      WHERE admins.user_id = auth.uid()
    )
  );