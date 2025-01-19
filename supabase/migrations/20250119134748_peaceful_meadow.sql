/*
  # Add discussions and messages tables

  1. New Tables
    - `discussions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `topic` (text)
      - `description` (text)
      - `status` (text, enum: 'active' | 'completed')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `messages`
      - `id` (uuid, primary key)
      - `discussion_id` (uuid, references discussions)
      - `expert_role` (text)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own discussions and messages
*/

-- Create discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  topic text NOT NULL,
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'completed')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid REFERENCES discussions ON DELETE CASCADE NOT NULL,
  expert_role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_discussions_user_id ON discussions(user_id);
CREATE INDEX idx_messages_discussion_id ON messages(discussion_id);

-- Create updated_at triggers
CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for discussions
CREATE POLICY "Users can view their own discussions"
  ON discussions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own discussions"
  ON discussions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions"
  ON discussions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions"
  ON discussions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in their discussions"
  ON messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM discussions
    WHERE discussions.id = messages.discussion_id
    AND discussions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create messages in their discussions"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM discussions
    WHERE discussions.id = messages.discussion_id
    AND discussions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update messages in their discussions"
  ON messages
  FOR UPDATE
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
  ON messages
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM discussions
    WHERE discussions.id = messages.discussion_id
    AND discussions.user_id = auth.uid()
  ));