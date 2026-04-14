CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  pipeline_stage TEXT NOT NULL DEFAULT 'Lead',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_clients" ON public.clients;
CREATE POLICY "authenticated_all_clients" ON public.clients
  FOR ALL TO authenticated USING (true);

-- Realtime Setup for Kanban sync
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'clients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Silently ignore if realtime is not properly set up
END $$;

-- Kanban Mock Data 
INSERT INTO public.clients (id, name, email, phone, avatar, status, pipeline_stage)
VALUES
  ('c1', 'João Silva', 'joao@example.com', '11999999999', 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1', 'active', 'Prospect'),
  ('c2', 'Maria Oliveira', 'maria@example.com', '11999999998', 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2', 'active', 'Em Tratativa'),
  ('c3', 'Carlos Souza', 'carlos@example.com', '11999999997', 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3', 'active', 'Ativo'),
  ('c4', 'Ana Beatriz', 'ana@example.com', '11999999996', 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=4', 'active', 'Negociação')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, client_id, name, value, stage, expected_date)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'c1', 'Mentoria Estratégica', 5000, 'Interesse', NOW() + INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'c2', 'Consultoria de Vendas', 12000, 'Negociação', NOW() + INTERVAL '15 days'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'c3', 'Treinamento In Company', 25000, 'Fechado', NOW() - INTERVAL '5 days'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'c4', 'Mentoria Individual', 8000, 'Proposta', NOW() + INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;
