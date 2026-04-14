DO $$
BEGIN
  -- Fix meta_credentials
  DROP POLICY IF EXISTS "Users can manage their own meta credentials" ON public.meta_credentials;
  ALTER TABLE public.meta_credentials DROP CONSTRAINT IF EXISTS meta_credentials_user_id_fkey;
  ALTER TABLE public.meta_credentials DROP CONSTRAINT IF EXISTS meta_credentials_pkey;
  ALTER TABLE public.meta_credentials ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'public.meta_credentials'::regclass AND contype = 'p'
  ) THEN
    ALTER TABLE public.meta_credentials ADD PRIMARY KEY (user_id);
  END IF;

  -- Fix google_calendar_credentials
  DROP POLICY IF EXISTS "Users can manage their own credentials" ON public.google_calendar_credentials;
  ALTER TABLE public.google_calendar_credentials DROP CONSTRAINT IF EXISTS google_calendar_credentials_user_id_fkey;
  ALTER TABLE public.google_calendar_credentials DROP CONSTRAINT IF EXISTS google_calendar_credentials_pkey;
  ALTER TABLE public.google_calendar_credentials ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'public.google_calendar_credentials'::regclass AND contype = 'p'
  ) THEN
    ALTER TABLE public.google_calendar_credentials ADD PRIMARY KEY (user_id);
  END IF;

  -- Fix calendar_events
  DROP POLICY IF EXISTS "Users can manage their own calendar events" ON public.calendar_events;
  ALTER TABLE public.calendar_events DROP CONSTRAINT IF EXISTS calendar_events_user_id_fkey;
  ALTER TABLE public.calendar_events ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
END $$;

-- Recreate policies for meta_credentials
CREATE POLICY "Users can manage their own meta credentials" ON public.meta_credentials
    FOR ALL USING (auth.uid()::text = user_id OR auth.role() = 'anon' OR user_id LIKE 'user_%') 
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'anon' OR user_id LIKE 'user_%');

-- Recreate policies for google_calendar_credentials
CREATE POLICY "Users can manage their own credentials" ON public.google_calendar_credentials
    FOR ALL USING (auth.uid()::text = user_id OR auth.role() = 'anon' OR user_id LIKE 'user_%') 
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'anon' OR user_id LIKE 'user_%');

-- Recreate policies for calendar_events
CREATE POLICY "Users can manage their own calendar events" ON public.calendar_events
    FOR ALL USING (auth.uid()::text = user_id OR auth.role() = 'anon' OR user_id LIKE 'user_%') 
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'anon' OR user_id LIKE 'user_%');
