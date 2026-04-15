CREATE TABLE IF NOT EXISTS public.client_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.client_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_client_suggestions" ON public.client_suggestions;
CREATE POLICY "authenticated_select_client_suggestions" ON public.client_suggestions 
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_client_suggestions" ON public.client_suggestions;
CREATE POLICY "authenticated_insert_client_suggestions" ON public.client_suggestions 
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_client_suggestions" ON public.client_suggestions;
CREATE POLICY "authenticated_update_client_suggestions" ON public.client_suggestions 
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_client_suggestions" ON public.client_suggestions;
CREATE POLICY "authenticated_delete_client_suggestions" ON public.client_suggestions 
  FOR DELETE TO authenticated USING (true);
