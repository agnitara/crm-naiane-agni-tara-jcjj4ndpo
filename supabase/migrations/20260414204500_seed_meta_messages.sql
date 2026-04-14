DO $$
DECLARE
  fb_client_id text := 'fb_123456789';
  ig_client_id text := 'ig_987654321';
BEGIN
  -- Insert Facebook Client
  INSERT INTO public.clients (id, name, status, pipeline_stage, avatar, behavioral_profile, sentiment_tags)
  VALUES (
    fb_client_id, 
    'Carlos (Facebook)', 
    'active', 
    'Proposta', 
    'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=42',
    'Cliente objetivo, focado em resultados.',
    ARRAY['Direto', 'Pronto para comprar']
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert Instagram Client
  INSERT INTO public.clients (id, name, status, pipeline_stage, avatar, behavioral_profile, sentiment_tags)
  VALUES (
    ig_client_id, 
    'Marina (Instagram)', 
    'active', 
    'Interesse', 
    'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=15',
    'Busca validação social e provas de resultado.',
    ARRAY['Curiosa', 'Engajada']
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert Facebook Messages
  INSERT INTO public.messages (id, client_id, platform, direction, content, created_at)
  VALUES (
    gen_random_uuid(),
    fb_client_id,
    'facebook',
    'inbound',
    'Olá Naiane, vi sua palestra e gostaria de entender como funciona a consultoria para a minha empresa.',
    NOW() - INTERVAL '2 days'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.messages (id, client_id, platform, direction, content, created_at)
  VALUES (
    gen_random_uuid(),
    fb_client_id,
    'facebook',
    'outbound',
    'Olá Carlos! Fico feliz que tenha gostado. A consultoria é personalizada. Você tem disponibilidade para uma call amanhã?',
    NOW() - INTERVAL '1 day'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert Instagram Messages
  INSERT INTO public.messages (id, client_id, platform, direction, content, created_at)
  VALUES (
    gen_random_uuid(),
    ig_client_id,
    'instagram',
    'inbound',
    'Oi! Adorei o último post. Tem alguma turma aberta para a mentoria?',
    NOW() - INTERVAL '5 hours'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.messages (id, client_id, platform, direction, content, created_at)
  VALUES (
    gen_random_uuid(),
    ig_client_id,
    'instagram',
    'outbound',
    'Oi Marina! Muito obrigada. Temos uma turma abrindo no próximo mês. Vou te mandar o link de pré-inscrição.',
    NOW() - INTERVAL '4 hours'
  )
  ON CONFLICT (id) DO NOTHING;
END $$;
