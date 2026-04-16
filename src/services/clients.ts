import { supabase } from '@/lib/supabase/client'
import { Client, PipelineStage } from '@/lib/types'

// Centraliza a validação do token JWT e injeção do user_id
async function checkAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    window.location.href = '/login'
    throw new Error('401: Não autenticado. Por favor, faça login novamente.')
  }
  return session.user.id
}

// Interceptador para tratar erros 42501 (Row-Level Security)
function handleError(error: any) {
  if (error?.code === '42501') {
    throw new Error(
      '42501: Erro de política de segurança (RLS). Você não tem acesso a esta operação.',
    )
  }
  throw error
}

export async function getClients(): Promise<Client[]> {
  try {
    await checkAuth()
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) handleError(error)
    if (!data) return []

    return data.map((c) => ({
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
  } catch (error) {
    console.error('Error fetching clients:', error)
    return []
  }
}

export async function createClient(data: {
  name: string
  email?: string
  phone?: string
  pipeline_stage?: string
  behavioral_profile?: string
  notes?: string
  utm_source?: string
  utm_campaign?: string
  utm_medium?: string
}) {
  const userId = await checkAuth()

  const { data: result, error } = await supabase
    .from('clients')
    .insert({
      id: crypto.randomUUID(),
      user_id: userId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
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

  if (error) handleError(error)
  return result
}

export async function updateClientPipelineStage(id: string, stage: PipelineStage) {
  await checkAuth()
  const { error } = await supabase
    .from('clients')
    .update({
      pipeline_stage: stage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) handleError(error)
}

export async function updateClientOptOut(id: string, optOut: boolean) {
  await checkAuth()
  const { error } = await supabase
    .from('clients')
    .update({
      opt_out: optOut,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', id)

  if (error) handleError(error)
}
