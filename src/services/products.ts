import { supabase } from '@/lib/supabase/client'

export async function getProducts() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    console.error('Erro: Usuário não autenticado')
    return { success: false, error: 'Faça login primeiro', data: [] }
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, clients(id, name, avatar)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    if (error.code === '401') {
      console.error('Erro: Usuário não autenticado')
      return { success: false, error: 'Faça login primeiro', data: [] }
    }
    console.error('Erro ao buscar produtos:', error)
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function createProduct(dados: any) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return { success: false, error: 'Usuário não autenticado' }

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...dados,
      user_id: session.user.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '42501') {
      console.error('Erro RLS: Você não tem permissão para criar produtos')
      return { success: false, error: 'Permissão negada' }
    }
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updateProduct(productId: string, dados: any) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return { success: false, error: 'Usuário não autenticado' }

  const { data, error } = await supabase
    .from('products')
    .update(dados)
    .eq('id', productId)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) {
    if (error.code === '42501') {
      console.error('Erro RLS: Este produto não é seu')
      return { success: false, error: 'Você não pode editar este produto' }
    }
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function deleteProduct(productId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return { success: false, error: 'Usuário não autenticado' }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('user_id', session.user.id)

  if (error) {
    if (error.code === '42501') {
      console.error('Erro RLS: Você não pode deletar este produto')
      return { success: false, error: 'Permissão negada' }
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}
