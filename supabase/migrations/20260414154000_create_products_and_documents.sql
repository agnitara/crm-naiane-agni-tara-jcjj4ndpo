CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  stage TEXT NOT NULL CHECK (stage IN ('Interesse', 'Proposta', 'Negociação', 'Fechado', 'Entregue', 'Upsell')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS products_client_id_idx ON public.products(client_id);
CREATE INDEX IF NOT EXISTS products_stage_idx ON public.products(stage);

CREATE TABLE IF NOT EXISTS public.product_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_products" ON public.products;
CREATE POLICY "authenticated_all_products" ON public.products FOR ALL TO authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "authenticated_all_documents" ON public.product_documents;
CREATE POLICY "authenticated_all_documents" ON public.product_documents FOR ALL TO authenticated USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "authenticated_all_storage" ON storage.objects;
CREATE POLICY "authenticated_all_storage" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "public_read_storage" ON storage.objects;
CREATE POLICY "public_read_storage" ON storage.objects FOR SELECT TO public USING (bucket_id = 'documents');

INSERT INTO public.products (id, client_id, name, value, stage, start_date, expected_date)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'c1', 'Mentoria Avançada', 5000.00, 'Negociação', NOW(), NOW() + interval '30 days'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'c2', 'Consultoria de Estruturação', 12000.00, 'Fechado', NOW() - interval '10 days', NOW() + interval '60 days')
ON CONFLICT (id) DO NOTHING;
