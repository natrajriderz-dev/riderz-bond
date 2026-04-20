-- ============================================
-- FIX STORAGE POLICIES
-- ============================================
-- Run this in your Supabase SQL Editor
-- This script sets up RLS policies for all required buckets

-- 1. Policies will be created directly on storage.objects (RLS is enabled by default)

-- 2. Define Helper for Admin Check (if not already exists)
-- This assumes you have an admin_users table or similar. 
-- Adjust the subquery if your admin check is different.
/*
CREATE OR REPLACE FUNCTION storage.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- ============================================
-- BUCKET: avatars / AVATARS
-- ============================================

-- SELECT: Anyone can view profile pictures
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
CREATE POLICY "Public Access Avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('avatars', 'AVATARS'));

-- INSERT: Authenticated users can upload their own photo
DROP POLICY IF EXISTS "Authenticated Upload Avatars" ON storage.objects;
CREATE POLICY "Authenticated Upload Avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('avatars', 'AVATARS') AND 
  (auth.uid())::text = (storage.foldername(name))[1] -- Usually stored as /user_id/filename
  OR 
  bucket_id IN ('avatars', 'AVATARS') -- General fallback if folder structure isn't strict
);

-- UPDATE/DELETE: Owners only
DROP POLICY IF EXISTS "Owner Update Avatars" ON storage.objects;
CREATE POLICY "Owner Update Avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('avatars', 'AVATARS') AND owner = auth.uid());

DROP POLICY IF EXISTS "Owner Delete Avatars" ON storage.objects;
CREATE POLICY "Owner Delete Avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('avatars', 'AVATARS') AND owner = auth.uid());


-- ============================================
-- BUCKET: posts / POSTS
-- ============================================

-- SELECT: Anyone can view posts
DROP POLICY IF EXISTS "Public Access Posts" ON storage.objects;
CREATE POLICY "Public Access Posts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('posts', 'POSTS'));

-- INSERT: Authenticated users can upload posts
DROP POLICY IF EXISTS "Authenticated Upload Posts" ON storage.objects;
CREATE POLICY "Authenticated Upload Posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('posts', 'POSTS'));

-- UPDATE/DELETE: Owners only
DROP POLICY IF EXISTS "Owner Update Posts" ON storage.objects;
CREATE POLICY "Owner Update Posts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('posts', 'POSTS') AND owner = auth.uid());

DROP POLICY IF EXISTS "Owner Delete Posts" ON storage.objects;
CREATE POLICY "Owner Delete Posts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('posts', 'POSTS') AND owner = auth.uid());


-- ============================================
-- BUCKET: verification_media / VERIFICATION_MEDIA
-- ============================================

-- SELECT: Only owner or admin can view verification media
DROP POLICY IF EXISTS "Restricted Access Verification" ON storage.objects;
CREATE POLICY "Restricted Access Verification"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id IN ('verification_media', 'VERIFICATION_MEDIA') AND 
  (owner = auth.uid() OR EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  ))
);

-- INSERT: Authenticated users can upload verification
DROP POLICY IF EXISTS "Authenticated Upload Verification" ON storage.objects;
CREATE POLICY "Authenticated Upload Verification"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('verification_media', 'VERIFICATION_MEDIA'));

-- UPDATE/DELETE: Owners only
DROP POLICY IF EXISTS "Owner Update Verification" ON storage.objects;
CREATE POLICY "Owner Update Verification"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('verification_media', 'VERIFICATION_MEDIA') AND owner = auth.uid());

-- Delete is usually not needed for verification once submitted, but for completeness:
DROP POLICY IF EXISTS "Owner Delete Verification" ON storage.objects;
CREATE POLICY "Owner Delete Verification"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('verification_media', 'VERIFICATION_MEDIA') AND owner = auth.uid());

-- ============================================
-- FINAL SUMMARY
-- ============================================
-- Policies applied for:
-- 1. avatars (Public Read, Auth Upload, Owner Edit)
-- 2. posts (Public Read, Auth Upload, Owner Edit)
-- 3. verification_media (Restricted Read, Auth Upload, Owner Edit)
-- Supports both UPPERCASE and lowercase bucket names.
