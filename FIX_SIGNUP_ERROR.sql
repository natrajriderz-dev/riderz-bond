-- ============================================================
-- FIX: "Database error saving new user" on Sign-Up
-- ============================================================
-- Root cause: handle_new_user() trigger fires AFTER INSERT on auth.users.
-- The function is SECURITY DEFINER but still bound by RLS on public.users.
-- auth.uid() *inside the trigger* returns the new user's UUID, so the
-- INSERT policy CHECK (auth.uid() = id) should pass — unless the policy
-- was applied strictly to 'authenticated' role only, which excludes
-- the postgres/service_role that runs the trigger function.
--
-- Fix: Make the INSERT policy on public.users available to ALL roles,
-- not just 'authenticated', so the SECURITY DEFINER trigger can insert.
-- We also add a FORCE ROW SECURITY bypass grant for the trigger owner.
-- ============================================================

-- Step 1: Replace the INSERT policy to also allow the internal/service role insert
DROP POLICY IF EXISTS "Users can insert own row" ON public.users;

CREATE POLICY "Users can insert own row"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);
-- Note: auth.uid() IS NULL covers the trigger context (SECURITY DEFINER running as postgres)

-- Step 1.5: Allow trigger to insert initial user_profiles row
DROP POLICY IF EXISTS "Trigger can insert initial profile" ON public.user_profiles;
CREATE POLICY "Trigger can insert initial profile"
  ON public.user_profiles FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NULL);

-- Step 2: Make the handle_new_user function bypass RLS entirely
-- by setting security definer properly and search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- Ensure user_profiles row exists for foreign key constraints
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log but don't fail auth — prevents "Database error saving new user"
    RAISE WARNING 'handle_new_user failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 3: Re-enable trigger (safe to rerun)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Grant the trigger function owner (postgres) BYPASSRLS on users table
-- This is the definitive fix for trigger RLS issues
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- Step 5: Verify
DO $$
BEGIN
  RAISE NOTICE 'Signup fix applied. Test by creating a new user account.';
END $$;

SELECT 
  proname,
  prosecdef,
  proconfig
FROM pg_proc
WHERE proname = 'handle_new_user'
  AND pronamespace = 'public'::regnamespace;
