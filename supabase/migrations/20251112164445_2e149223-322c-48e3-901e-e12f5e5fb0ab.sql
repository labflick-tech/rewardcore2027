-- Add policy for users to insert their own profile (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" 
    ON public.profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Update profile select policy to allow viewing all profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Anyone can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Add policy for inserting referrals
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'referrals' 
    AND policyname = 'System can insert referrals'
  ) THEN
    CREATE POLICY "System can insert referrals" 
    ON public.referrals 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;