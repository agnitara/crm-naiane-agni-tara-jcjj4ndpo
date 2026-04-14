DO $$
BEGIN
  -- Remover a função de match que depende do vetor na dimensão 1536 (OpenAI)
  DROP FUNCTION IF EXISTS public.match_knowledge_chunks(vector, float, int);
  DROP FUNCTION IF EXISTS public.match_knowledge_chunks(vector(1536), float, int);
  
  -- Alterar a dimensão da coluna embedding para 384 (Supabase/gte-small)
  -- USING NULL é utilizado para limpar embeddings 1536 antigos que não podem ser convertidos para 384
  ALTER TABLE public.knowledge_chunks ALTER COLUMN embedding TYPE vector(384) USING NULL;
END $$;

-- Recriar a função de match otimizada para a nova dimensão de 384
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kc.id,
    kc.content,
    kc.metadata,
    (1 - (kc.embedding <=> query_embedding))::float AS similarity
  FROM public.knowledge_chunks kc
  WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
$$;
