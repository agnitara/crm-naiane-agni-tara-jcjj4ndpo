DO $$
DECLARE
  t text;
BEGIN
  -- Loop through all tables in the public schema
  FOR t IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    -- Enable RLS for the table
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    
    -- Drop the catch-all policy if it exists to make it idempotent
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_all_%I" ON public.%I', t, t);
    
    -- Create the fully permissive catch-all policy for authenticated users
    -- This ensures no authenticated user gets blocked by a security policy constraint
    EXECUTE format('CREATE POLICY "authenticated_all_%I" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;
