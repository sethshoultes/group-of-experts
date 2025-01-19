@@ .. @@
 CREATE POLICY "Users can create their own discussions"
   ON discussions
   FOR INSERT
   TO authenticated
-  WITH CHECK (auth.uid() = user_id);
+  WITH CHECK (
+    auth.uid() = user_id AND
+    auth.uid() IS NOT NULL
+  );

 CREATE POLICY "Users can update their own discussions"
   ON discussions