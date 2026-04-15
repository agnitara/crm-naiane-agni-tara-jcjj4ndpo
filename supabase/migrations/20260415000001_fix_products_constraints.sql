DO $$
BEGIN
  -- Drop constraint that might be blocking custom CRM stages
  ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_stage_check;
  
  -- Make dates nullable as they might not be defined at creation time
  ALTER TABLE public.products ALTER COLUMN expected_date DROP NOT NULL;
  ALTER TABLE public.products ALTER COLUMN start_date DROP NOT NULL;
  
  -- Make client_id nullable in case product is created before assigning to a client
  ALTER TABLE public.products ALTER COLUMN client_id DROP NOT NULL;
END $$;
