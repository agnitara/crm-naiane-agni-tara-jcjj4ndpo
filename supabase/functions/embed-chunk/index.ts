import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { pipeline, env } from '@xenova/transformers'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

// Configuração para rodar na Edge
env.allowLocalModels = false;
env.useBrowserCache = false;

let extractor: any = null;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    // Suporte para payload direto ou via Database Webhook do Supabase
    const record = payload.type === 'INSERT' || payload.type === 'UPDATE' ? payload.record : payload

    if (!record || !record.id || !record.content) {
      throw new Error('Missing record data (id, content)')
    }

    if (!extractor) {
      extractor = await pipeline('feature-extraction', 'Supabase/gte-small')
    }

    const output = await extractor(record.content, { pooling: 'mean', normalize: true })
    const embedding = Array.from(output.data)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabaseAdmin
      .from('knowledge_chunks')
      .update({ embedding })
      .eq('id', record.id)

    if (error) throw error

    return new Response(JSON.stringify({ success: true, id: record.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error('Error in embed-chunk:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
