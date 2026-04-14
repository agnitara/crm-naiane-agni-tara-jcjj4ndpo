-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Knowledge base chunks
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_select_chunks" ON public.knowledge_chunks;
CREATE POLICY "authenticated_select_chunks" ON public.knowledge_chunks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_chunks" ON public.knowledge_chunks;
CREATE POLICY "authenticated_insert_chunks" ON public.knowledge_chunks FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_chunks" ON public.knowledge_chunks;
CREATE POLICY "authenticated_update_chunks" ON public.knowledge_chunks FOR UPDATE TO authenticated USING (true);

-- Function for vector search
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$;

-- Suggestions tracking
CREATE TABLE IF NOT EXISTS public.message_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  suggestion_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'edited')),
  chunks_retrieved JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.message_suggestions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_select_suggestions" ON public.message_suggestions;
CREATE POLICY "authenticated_select_suggestions" ON public.message_suggestions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_update_suggestions" ON public.message_suggestions;
CREATE POLICY "authenticated_update_suggestions" ON public.message_suggestions FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_suggestions" ON public.message_suggestions;
CREATE POLICY "authenticated_insert_suggestions" ON public.message_suggestions FOR INSERT TO authenticated WITH CHECK (true);

-- Messages table 
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    direction TEXT NOT NULL,
    content TEXT,
    transcription TEXT,
    audio_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_select_messages" ON public.messages;
CREATE POLICY "authenticated_select_messages" ON public.messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_messages" ON public.messages;
CREATE POLICY "authenticated_insert_messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);
