-- Fix RLS Infinite Recursion by using a SECURITY DEFINER function

-- 1. Create a secure function to check if the current user is a superadmin
-- SECURITY DEFINER means this function runs with the privileges of the creator (postgres),
-- bypassing RLS policies on the profiles table, thus breaking the recursion loop.
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  );
$$;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Superadmins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Superadmins can delete any profile" ON profiles;

-- 3. Re-create the policies using the non-recursive function
CREATE POLICY "Superadmins can read all profiles"
  ON profiles FOR SELECT
  USING ( is_superadmin() );

CREATE POLICY "Superadmins can update any profile"
  ON profiles FOR UPDATE
  USING ( is_superadmin() );

CREATE POLICY "Superadmins can delete any profile"
  ON profiles FOR DELETE
  USING ( is_superadmin() );
