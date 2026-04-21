import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import OpenAI from 'npm:openai@4'
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

env.allowLocalModels = false
env.useBrowserCache = false

let extractor: any = null

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { client_id } = await req.json()
    if (!client_id) throw new Error('client_id is required')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    )

    // Check for recent pending suggestions
    const { data: existing } = await supabase
      .from('client_suggestions')
      .select('id, created_at')
      .eq('client_id', client_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)

    if (existing && existing.length > 0) {
      const ageInMs = new Date().getTime() - new Date(existing[0].created_at).getTime()
      if (ageInMs < 2 * 60 * 1000) {
        return new Response(JSON.stringify({ message: 'Recent suggestions exist' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Expire old pending suggestions
    await supabase
      .from('client_suggestions')
      .update({ status: 'expired' })
      .eq('client_id', client_id)
      .eq('status', 'pending')

    const { data: client } = await supabase.from('clients').select('*').eq('id', client_id).single()
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!client) throw new Error('Client not found')

    let contextText = ''
    if (messages && messages.length > 0) {
      const lastMsg = messages[0]
      if (lastMsg.direction === 'inbound') {
        const textToEmbed = lastMsg.content || lastMsg.transcription || ''
        if (textToEmbed.trim().length > 5) {
          if (!extractor) {
            extractor = await pipeline('feature-extraction', 'Supabase/gte-small')
          }
          const output = await extractor(textToEmbed, { pooling: 'mean', normalize: true })
          const query_embedding = Array.from(output.data)

          const { data: chunks } = await supabase.rpc('match_knowledge_chunks', {
            query_embedding,
            match_threshold: 0.7,
            match_count: 3,
          })

          if (chunks && chunks.length > 0) {
            contextText = chunks.map((c: any) => c.content).join('\n\n')
          }
        }
      }
    }

    const kimiApiKey = Deno.env.get('KIMI_API_KEY')
    let suggestions = []

    if (!kimiApiKey) {
      suggestions = [
        {
          type: 'reply',
          content:
            'Olá! Entendi perfeitamente sua dúvida. Podemos agendar uma breve call para eu te explicar como a mentoria vai resolver exatamente esse ponto?',
          description: 'Sugerir uma call para fechamento',
          reason: 'Cliente demonstra interesse mas ainda tem dúvidas pontuais.',
        },
        {
          type: 'pipeline_stage',
          content: 'Negociação',
          description: 'Mover para Negociação',
          reason: 'A conversa evoluiu para discussão de formato e valores.',
        },
      ]
    } else {
      const kimi = new OpenAI({
        apiKey: kimiApiKey,
        baseURL: 'https://api.moonshot.cn/v1',
      })

      const msgsText = (messages || [])
        .reverse()
        .map(
          (m: any) =>
            `${m.direction === 'inbound' ? 'Cliente' : 'Atendente'}: ${m.content || m.transcription || 'Áudio/Mídia'}`,
        )
        .join('\n')

      const prompt = `Você é um assistente de vendas de CRM inteligente auxiliando Naiane.
Analise a conversa recente com o cliente:
Nome: ${client.name}
Estágio atual do funil: ${client.pipeline_stage}
Tags atuais: ${(client.sentiment_tags || []).join(', ')}

Conversa recente:
${msgsText}

Contexto relevante da base de conhecimento (se aplicável):
${contextText}

Gere até 3 sugestões de ações para o CRM. Responda APENAS em JSON no formato:
{
  "suggestions": [
    {
      "type": "reply" | "next_step" | "tag" | "follow_up" | "pipeline_stage",
      "content": "Ação concreta (ex: texto da resposta, nome do novo estágio, nome da tag, data sugerida ISO YYYY-MM-DDTHH:mm:ss, ou passo)",
      "description": "Descrição curta",
      "reason": "Porquê em 1 frase curta"
    }
  ]
}
Restrições:
- Não sugira mudar para o estágio atual (${client.pipeline_stage}).
- Não sugira adicionar tags que já existem.
- Follow-ups devem ser datas no futuro.`

      const completion = await kimi.chat.completions.create({
        model: 'moonshot-v1-8k',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })

      try {
        const res = JSON.parse(completion.choices[0].message?.content || '{"suggestions":[]}')
        suggestions = res.suggestions || []
      } catch (e) {
        console.error('Failed to parse Kimi response', e)
      }
    }

    if (suggestions.length > 0) {
      const inserts = suggestions.slice(0, 3).map((s: any) => ({
        client_id,
        type: s.type,
        content: s.content,
        description: s.description,
        reason: s.reason,
        status: 'pending',
      }))

      const { data: inserted, error: insertError } = await supabase
        .from('client_suggestions')
        .insert(inserts)
        .select()

      if (insertError) throw insertError

      return new Response(JSON.stringify({ suggestions: inserted }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ suggestions: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error generating client suggestions:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
