import { supabase } from '@/lib/supabase/client'

export async function getClients() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    console.error('Erro: Usuário não autenticado')
    return []
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    if (error.code === '401') {
      console.error('Erro: Usuário não autenticado')
    }
    console.error('Erro ao buscar clientes:', error)
    return []
  }

  return data || []
}

export async function createClient(dados: any) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return { success: false, error: 'Faça login primeiro' }

  const newId = `c${Date.now()}`

  const { data, error } = await supabase
    .from('clients')
    .insert({
      id: newId,
      user_id: session.user.id,
      name: dados.name,
      email: dados.email || null,
      phone: dados.phone || null,
      avatar: dados.avatar || null,
      status: dados.status || 'active',
      pipeline_stage: dados.pipeline_stage || 'Lead',
      behavioral_profile: dados.behavioral_profile || null,
      notes: dados.notes || null,
      utm_source: dados.utm_source || null,
      utm_campaign: dados.utm_campaign || null,
      utm_medium: dados.utm_medium || null,
      sentiment_tags: [],
    })
    .select()
    .single()

  if (error) {
    if (error.code === '42501') {
      console.error('Erro RLS: Você não tem permissão para criar clientes')
      return { success: false, error: 'Permissão negada' }
    }
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updateClientPipelineStage(clienteId: string, newStage: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('clients')
    .update({ pipeline_stage: newStage })
    .eq('id', clienteId)
    .eq('user_id', session.user.id)
    .select()

  if (error) {
    if (error.code === '42501') {
      console.error('Erro RLS: Este cliente não é seu')
      throw new Error('Você não pode editar este cliente')
    }
    throw error
  }
  return data
}

export async function updateClient(clienteId: string, dados: any) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return { success: false, error: 'Usuário não autenticado' }

  const { data, error } = await supabase
    .from('clients')
    .update(dados)
    .eq('id', clienteId)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) {
    if (error.code === '42501') {
      console.error('Erro RLS: Este cliente não é seu')
      return { success: false, error: 'Você não pode editar este cliente' }
    }
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function deleteClient(clienteId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return { success: false, error: 'Usuário não autenticado' }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clienteId)
    .eq('user_id', session.user.id)

  if (error) {
    if (error.code === '42501') {
      console.error('Erro RLS: Você não pode deletar este cliente')
      return { success: false, error: 'Permissão negada' }
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}
