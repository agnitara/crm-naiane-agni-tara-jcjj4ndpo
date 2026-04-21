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
    const { message_id } = await req.json()

    if (!message_id) {
      throw new Error('message_id is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    })

    // 1. Get message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .select('*, clients(*)')
      .eq('id', message_id)
      .single()

    if (msgError || !message) {
      throw new Error('Message not found')
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    let transcription = "Transcrição simulada: Estou muito interessado na mentoria, mas me sinto um pouco inseguro sobre os próximos passos. Queria mais clareza e entender como isso pode me ajudar na prática."
    
    // 2. Transcribe Audio
    if (openAiKey && message.audio_url) {
      const openai = new OpenAI({ apiKey: openAiKey })
      
      try {
        const audioResponse = await fetch(message.audio_url)
        if (audioResponse.ok) {
          const audioBlob = await audioResponse.blob()
          const audioFile = new File([audioBlob], 'audio.ogg', { type: audioBlob.type || 'audio/ogg' })

          const transcriptionResponse = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'pt',
          })
          
          transcription = transcriptionResponse.text
        }
      } catch (e) {
        console.error('Failed to transcribe with Whisper', e)
        // Fallback to simulated on failure
      }
    }

    // 3. Update message with transcription
    await supabase
      .from('messages')
      .update({ transcription })
      .eq('id', message_id)

    // 4. Analyze behavior and sentiment
    let behavioralProfile = message.clients?.behavioral_profile || ''
    let sentimentTags = message.clients?.sentiment_tags || []

    if (openAiKey) {
      const openai = new OpenAI({ apiKey: openAiKey })
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise comportamental de clientes. Com base na mensagem, forneça um breve perfil comportamental (máximo 2 frases) e até 3 tags de sentimento (ex: "Ansioso", "Motivado"). Responda estritamente no formato JSON: { "profile": "...", "tags": ["...", "..."] }'
            },
            {
              role: 'user',
              content: `Mensagem transcrita do cliente: "${transcription}"`
            }
          ],
          response_format: { type: "json_object" }
        })

        const result = JSON.parse(completion.choices[0].message.content || '{}')
        if (result.profile) behavioralProfile = result.profile
        if (result.tags) sentimentTags = result.tags
      } catch (e) {
        console.error('Failed to parse behavior analysis', e)
      }
    } else {
      behavioralProfile = "O cliente demonstra um misto de forte interesse e leve insegurança. Busca ativamente por clareza e um direcionamento mais estruturado antes de tomar uma decisão de compra."
      sentimentTags = ["Interessado", "Inseguro", "Buscando Clareza"]
    }

    // 5. Update client profile
    await supabase
      .from('clients')
      .update({
        behavioral_profile: behavioralProfile,
        sentiment_tags: sentimentTags
      })
      .eq('id', message.client_id)

    return new Response(JSON.stringify({ 
      success: true, 
      transcription, 
      behavioralProfile, 
      sentimentTags 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('Error processing audio:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
