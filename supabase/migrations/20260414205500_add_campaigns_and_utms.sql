DO $$
BEGIN
  -- Create campaigns table
  CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Add UTM columns to clients
  ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
  ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS utm_source TEXT;
  ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS utm_medium TEXT;
END $$;

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "authenticated_all_campaigns" ON public.campaigns;
CREATE POLICY "authenticated_all_campaigns" ON public.campaigns
  FOR ALL TO authenticated USING (true);

-- Seed some campaigns
INSERT INTO public.campaigns (id, name, status) VALUES
  ('c0000000-0000-0000-0000-000000000001'::uuid, 'Lançamento Mentoria Q3', 'active'),
  ('c0000000-0000-0000-0000-000000000002'::uuid, 'Promoção Instagram Reels', 'active'),
  ('c0000000-0000-0000-0000-000000000003'::uuid, 'Webinar Estratégia', 'inactive')
ON CONFLICT (id) DO NOTHING;

-- Update some existing clients to have campaigns so the chart isn't empty
DO $$
DECLARE
  client_id_1 TEXT;
  client_id_2 TEXT;
BEGIN
  SELECT id INTO client_id_1 FROM public.clients LIMIT 1;
  SELECT id INTO client_id_2 FROM public.clients OFFSET 1 LIMIT 1;

  IF client_id_1 IS NOT NULL THEN
    UPDATE public.clients SET utm_campaign = 'Lançamento Mentoria Q3' WHERE id = client_id_1;
  END IF;

  IF client_id_2 IS NOT NULL THEN
    UPDATE public.clients SET utm_campaign = 'Promoção Instagram Reels' WHERE id = client_id_2;
  END IF;
END $$;
