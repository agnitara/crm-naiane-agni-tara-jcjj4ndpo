import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import OpenAI from 'npm:openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    const kimiApiKey = Deno.env.get('KIMI_API_KEY')

    if (!kimiApiKey) {
      // Mock response for preview environments without API keys
      console.log('API keys missing, returning mocked response')
      const mockSuggestion = "Olá {{nome}}! Gostaria de saber como estão os preparativos em relação ao {{produto}}. Teria um momento para conversarmos essa semana?"
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return new Response(JSON.stringify({ suggestion: mockSuggestion }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate suggestion via Kimi (Moonshot API)
    const kimi = new OpenAI({
      apiKey: kimiApiKey,
      baseURL: 'https://api.moonshot.cn/v1',
    })

    const completion = await kimi.chat.completions.create({
      model: 'moonshot-v1-8k',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especialista em vendas que ajuda Naiane a criar mensagens de follow-up em massa para seus clientes.
Instruções:
- Crie uma mensagem empática, persuasiva e direta.
- A mensagem será enviada para vários clientes ao mesmo tempo, então ela deve usar variáveis dinâmicas se apropriado.
- Você pode usar as variáveis: {{nome}} e {{produto}}.
- A resposta deve ter entre 50 e 500 caracteres.
- Idioma: Português do Brasil.
- Responda APENAS com a sugestão de mensagem, sem aspas, introduções ou notas adicionais.`
        },
        { role: 'user', content: `Crie uma mensagem com o seguinte objetivo: ${prompt}` }
      ],
      temperature: 0.7,
    })

    const suggestion = completion.choices[0]?.message?.content || ''

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('Error generating mass message:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
