-- Add opt_out column to clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS opt_out BOOLEAN NOT NULL DEFAULT false;

-- Create message_templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for message_templates
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own templates" ON public.message_templates;
CREATE POLICY "Users can manage their own templates" ON public.message_templates
  FOR ALL TO public
  USING (((auth.uid())::text = user_id) OR (auth.role() = 'anon'::text) OR (user_id ~~ 'user_%'::text))
  WITH CHECK (((auth.uid())::text = user_id) OR (auth.role() = 'anon'::text) OR (user_id ~~ 'user_%'::text));

-- Trigger for updated_at on message_templates
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.message_templates;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();
