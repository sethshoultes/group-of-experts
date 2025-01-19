@@ .. @@
 CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
 
 -- Create Triggers
-CREATE TRIGGER update_api_keys_updated_at
+DO $$ BEGIN
+  CREATE TRIGGER update_api_keys_updated_at
   BEFORE UPDATE ON api_keys
   FOR EACH ROW
   EXECUTE FUNCTION update_updated_at_column();
+EXCEPTION
+  WHEN duplicate_object THEN NULL;
+END $$;
 
-CREATE TRIGGER update_discussions_updated_at
+DO $$ BEGIN
+  CREATE TRIGGER update_discussions_updated_at
   BEFORE UPDATE ON discussions
   FOR EACH ROW
   EXECUTE FUNCTION update_updated_at_column();
+EXCEPTION
+  WHEN duplicate_object THEN NULL;
+END $$;
 
-CREATE TRIGGER update_messages_updated_at
+DO $$ BEGIN
+  CREATE TRIGGER update_messages_updated_at
   BEFORE UPDATE ON messages
   FOR EACH ROW
   EXECUTE FUNCTION update_updated_at_column();
+EXCEPTION
+  WHEN duplicate_object THEN NULL;
+END $$;
 
-CREATE TRIGGER update_admin_users_updated_at
+DO $$ BEGIN
+  CREATE TRIGGER update_admin_users_updated_at
   BEFORE UPDATE ON admin_users
   FOR EACH ROW
   EXECUTE FUNCTION update_updated_at_column();
+EXCEPTION
+  WHEN duplicate_object THEN NULL;
+END $$;