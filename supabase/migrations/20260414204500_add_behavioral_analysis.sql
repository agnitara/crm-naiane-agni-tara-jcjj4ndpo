-- Adicionar colunas de análise comportamental
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS behavioral_profile TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS sentiment_tags TEXT[] DEFAULT '{}';
