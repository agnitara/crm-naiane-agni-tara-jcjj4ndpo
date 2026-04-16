import { supabase } from '@/lib/supabase/client'
import { Client, PipelineStage } from '@/lib/types'

// Centraliza a validação do token JWT e injeção do user_id
async function checkAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    window.location.href = '/login'
    return null
  }
  return session.user
}

export async function getClients() {
  const user = await checkAuth()
  if (!user) {
    return { success: false, error: 'Faça login primeiro', code: '401' }
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase Error:', error)
    return {
      success: false,
      error: error.code === '42501' ? 'Permissão negada para listar clientes' : error.message,
      code: error.code,
    }
  }

  const formattedData = data
    ? data.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
        avatar: c.avatar || '',
        status: c.status as 'active' | 'archived',
        pipeline_stage: c.pipeline_stage || 'Lead',
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        notes: c.notes || '',
        behavioral_profile: c.behavioral_profile || '',
        sentiment_tags: c.sentiment_tags || [],
        utm_source: c.utm_source || '',
        utm_campaign: c.utm_campaign || '',
        utm_medium: c.utm_medium || '',
        opt_out: (c as any).opt_out || false,
      }))
    : []

  // Preservando array proxy para compatibilidade, mas retornando no formato padrão
  const res: any = formattedData
  res.success = true
  res.data = formattedData
  return res
}

export async function createClient(data: {
  name: string
  email?: string
  phone?: string
  avatar?: string
  pipeline_stage?: string
  behavioral_profile?: string
  notes?: string
  utm_source?: string
  utm_campaign?: string
  utm_medium?: string
}) {
  const user = await checkAuth()
  if (!user) return { success: false, error: 'Faça login primeiro', code: '401' }

  const { data: result, error } = await supabase
    .from('clients')
    .insert({
      id: crypto.randomUUID(),
      user_id: user.id, // OBRIGATÓRIO - RLS valida
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      avatar: data.avatar || null,
      pipeline_stage: data.pipeline_stage || 'Lead',
      behavioral_profile: data.behavioral_profile || null,
      notes: data.notes || null,
      utm_source: data.utm_source || null,
      utm_campaign: data.utm_campaign || null,
      utm_medium: data.utm_medium || null,
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    const errorMsg =
      error.code === '42501'
        ? 'Erro RLS: Você não tem permissão para criar clientes'
        : error.message
    console.error(errorMsg)
    return { success: false, error: errorMsg, code: error.code }
  }

  return { success: true, data: result }
}

export async function updateClientPipelineStage(id: string, stage: PipelineStage) {
  const user = await checkAuth()
  if (!user) return { success: false, error: 'Faça login primeiro', code: '401' }

  const { data, error } = await supabase
    .from('clients')
    .update({
      pipeline_stage: stage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()

  if (error) {
    const errorMsg = error.code === '42501' ? 'Erro RLS: Este cliente não é seu' : error.message
    console.error(errorMsg)
    return { success: false, error: errorMsg, code: error.code }
  }

  return { success: true, data }
}

export async function updateClientOptOut(id: string, optOut: boolean) {
  const user = await checkAuth()
  if (!user) return { success: false, error: 'Faça login primeiro', code: '401' }

  const { data, error } = await supabase
    .from('clients')
    .update({
      opt_out: optOut,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', id)
    .select()

  if (error) {
    const errorMsg = error.code === '42501' ? 'Erro RLS: Este cliente não é seu' : error.message
    console.error(errorMsg)
    return { success: false, error: errorMsg, code: error.code }
  }

  return { success: true, data }
}

export async function deleteClient(id: string) {
  const user = await checkAuth()
  if (!user) return { success: false, error: 'Faça login primeiro', code: '401' }

  const { data, error } = await supabase.from('clients').delete().eq('id', id)

  if (error) {
    const errorMsg =
      error.code === '42501'
        ? 'Erro RLS: Permissão negada para deletar este cliente'
        : error.message
    console.error(errorMsg)
    return { success: false, error: errorMsg, code: error.code }
  }

  return { success: true, data }
}
