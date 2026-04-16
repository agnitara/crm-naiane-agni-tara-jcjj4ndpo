import { supabase } from '@/lib/supabase/client'
import { Product } from '@/lib/types'

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

export const getProducts = async (clientId?: string) => {
  await checkAuth()
  let query = supabase
    .from('products')
    .select('*, clients(id, name, avatar)')
    .is('deleted_at', null)
  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) handleError(error)
  return data
}

export const createProduct = async (product: Partial<Product>) => {
  const userId = await checkAuth()
  const { data, error } = await supabase
    .from('products')
    .insert({
      user_id: userId,
      client_id: product.clientId || null,
      name: product.name,
      value: product.value,
      stage: product.stage,
      start_date: product.startDate || null,
      expected_date: product.expectedDate || null,
    })
    .select()
    .single()

  if (error) handleError(error)
  return data
}

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  await checkAuth()
  const payload: any = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.value !== undefined) payload.value = updates.value
  if (updates.stage !== undefined) payload.stage = updates.stage
  if (updates.startDate !== undefined) payload.start_date = updates.startDate || null
  if (updates.expectedDate !== undefined) payload.expected_date = updates.expectedDate || null

  payload.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) handleError(error)
  return data
}

export const deleteProduct = async (id: string) => {
  await checkAuth()
  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) handleError(error)
}

export const uploadProductDocument = async (productId: string, file: File) => {
  await checkAuth()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `products/${productId}/${fileName}`

  const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)
  if (uploadError) handleError(uploadError)

  const {
    data: { publicUrl },
  } = supabase.storage.from('documents').getPublicUrl(filePath)

  const { data, error } = await supabase
    .from('product_documents')
    .insert({
      product_id: productId,
      name: file.name,
      url: publicUrl,
      type: file.type || 'unknown',
      size: file.size,
    })
    .select()
    .single()

  if (error) handleError(error)
  return data
}

export const getProductDocumentsByClient = async (clientId: string) => {
  await checkAuth()
  const { data, error } = await supabase
    .from('product_documents')
    .select('*, products!inner(client_id, deleted_at)')
    .eq('products.client_id', clientId)
    .is('products.deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) handleError(error)
  return data
}

export const deleteProductDocument = async (id: string, url: string) => {
  await checkAuth()
  try {
    const urlParts = url.split('/documents/')
    if (urlParts.length > 1) {
      await supabase.storage.from('documents').remove([urlParts[1]])
    }
  } catch (e) {
    console.error('Storage deletion failed', e)
  }
  const { error } = await supabase.from('product_documents').delete().eq('id', id)
  if (error) handleError(error)
}
