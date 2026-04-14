import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import OpenAI from 'openai'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message_id, content } = await req.json()

    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    )

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    const kimiApiKey = Deno.env.get('KIMI_API_KEY')

    if (!openAIApiKey || !kimiApiKey) {
      // Mock response for preview environments without API keys
      console.log('API keys missing, returning mocked response')
      const mockSuggestion =
        'Olá! Compreendo perfeitamente o seu momento. Segundo o Método Gene da Escolha, o primeiro passo é focar na clareza do que realmente importa para você agora. Que tal agendarmos nossa sessão para aprofundar nisso?'

      const { data: suggestion, error: insertError } = await supabaseClient
        .from('message_suggestions')
        .insert({
          message_id,
          suggestion_text: mockSuggestion,
          chunks_retrieved: [
            {
              content: 'Chunk simulado do Método Gene da Escolha sobre clareza.',
              similarity: 0.95,
            },
          ],
          status: 'pending',
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      return new Response(JSON.stringify({ suggestion }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Generate embedding for user message using OpenAI
    const openai = new OpenAI({ apiKey: openAIApiKey })
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
    })
    const query_embedding = embeddingResponse.data[0].embedding

    // 2. Retrieve relevant chunks
    const { data: chunks, error: matchError } = await supabaseClient.rpc('match_knowledge_chunks', {
      query_embedding,
      match_threshold: 0.6,
      match_count: 3,
    })

    if (matchError) throw matchError

    if (!chunks || chunks.length === 0) {
      return new Response(JSON.stringify({ suggestion: null, reason: 'no_chunks_found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Generate suggestion via Kimi (Moonshot API)
    const kimi = new OpenAI({
      apiKey: kimiApiKey,
      baseURL: 'https://api.moonshot.cn/v1',
    })

    const contextText = chunks.map((c: any) => c.content).join('\n\n')

    const completion = await kimi.chat.completions.create({
      model: 'moonshot-v1-8k',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente que ajuda Naiane a responder seus clientes usando o "Método Gene da Escolha". 
Use as seguintes informações do método para basear sua resposta:
${contextText}

Instruções:
- Crie uma resposta empática, alinhada com o método.
- A resposta deve ter entre 50 e 500 caracteres.
- Idioma: Português.
- Responda apenas com a sugestão de mensagem, sem aspas ou introduções.`,
        },
        { role: 'user', content: `Mensagem do cliente: ${content}` },
      ],
      temperature: 0.7,
    })

    const suggestion_text = completion.choices[0]?.message?.content || ''

    // 4. Save to database
    const { data: suggestion, error: insertError } = await supabaseClient
      .from('message_suggestions')
      .insert({
        message_id,
        suggestion_text,
        chunks_retrieved: chunks,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) throw insertError

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error generating suggestion:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
