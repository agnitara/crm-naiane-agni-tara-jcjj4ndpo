CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id text PRIMARY KEY,
  pipeline_stages text[] NOT NULL DEFAULT ARRAY['Lead', 'Prospect', 'Qualificado', 'Em Tratativa', 'Proposta', 'Negociação', 'Ativo', 'Concluído', 'Inativo'],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
CREATE POLICY "Users can manage their own settings" ON public.user_settings
  FOR ALL USING (
    (auth.uid())::text = user_id 
    OR auth.role() = 'anon' 
    OR user_id LIKE 'user_%'
  ) WITH CHECK (
    (auth.uid())::text = user_id 
    OR auth.role() = 'anon' 
    OR user_id LIKE 'user_%'
  );
