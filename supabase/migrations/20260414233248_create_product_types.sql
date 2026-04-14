CREATE TABLE IF NOT EXISTS public.product_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  default_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_product_types" ON public.product_types;
CREATE POLICY "authenticated_all_product_types" ON public.product_types FOR ALL TO authenticated USING (true);

INSERT INTO public.product_types (name, default_value) VALUES 
('Mentoria Estratégica', 5000.00),
('Consultoria Empresarial', 12000.00),
('Sessão de Alinhamento', 800.00)
ON CONFLICT (name) DO NOTHING;
