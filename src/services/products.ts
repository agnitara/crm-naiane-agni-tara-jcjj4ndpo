import { supabase } from '@/lib/supabase/client'
import { Product } from '@/lib/types'

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

export const getProducts = async (clientId?: string) => {
  const user = await checkAuth()
  if (!user) {
    const err: any = []
    err.success = false
    err.error = 'Faça login primeiro'
    err.code = '401'
    return err
  }

  let query = supabase
    .from('products')
    .select('*, clients!inner(id, name, avatar, user_id)')
    .eq('user_id', user.id) // RLS validation
    .is('deleted_at', null)

  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    const err: any = []
    err.success = false
    err.error = error.code === '42501' ? 'Erro RLS. Permissão negada' : error.message
    err.code = error.code
    return err
  }

  const res: any = data || []
  res.success = true
  res.data = data || []
  return res
}

export const createProduct = async (product: Partial<Product>) => {
  const user = await checkAuth()
  if (!user) return { success: false, error: 'Faça login primeiro', code: '401' }

  const { data, error } = await supabase
    .from('products')
    .insert({
      user_id: user.id, // OBRIGATÓRIO
      client_id: product.clientId || null,
      name: product.name,
      value: product.value,
      stage: product.stage,
      start_date: product.startDate || null,
      expected_date: product.expectedDate || null,
    })
    .select()
    .single()

  if (error) {
    const errorMsg =
      error.code === '42501'
        ? 'Erro RLS. Você não tem permissão para criar produtos'
        : error.message
    return { success: false, error: errorMsg, code: error.code }
  }

  const res = { success: true, data }
  Object.assign(res, data)
  return res
}

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const user = await checkAuth()
  if (!user) return { success: false, error: 'Faça login primeiro', code: '401' }

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
    .eq('user_id', user.id) // RLS
    .select()
    .single()

  if (error) {
    const errorMsg = error.code === '42501' ? 'Erro RLS. Este produto não é seu' : error.message
    return { success: false, error: errorMsg, code: error.code }
  }

  const res = { success: true, data }
  Object.assign(res, data)
  return res
}

export const deleteProduct = async (id: string) => {
  const user = await checkAuth()
  if (!user) return { success: false, error: 'Faça login primeiro', code: '401' }

  const { data, error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id) // RLS
    .select()

  if (error) {
    const errorMsg =
      error.code === '42501' ? 'Erro RLS. Você não pode deletar este produto' : error.message
    return { success: false, error: errorMsg, code: error.code }
  }

  const res = { success: true, data }
  Object.assign(res, data)
  return res
}

export const uploadProductDocument = async (productId: string, file: File) => {
  const user = await checkAuth()
  if (!user) return { success: false, error: '401: Faça login primeiro' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `products/${productId}/${fileName}`

  const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)
  if (uploadError) return { success: false, error: uploadError.message }

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

  if (error) return { success: false, error: error.message }

  const res = { success: true, data }
  Object.assign(res, data)
  return res
}

export const getProductDocumentsByClient = async (clientId: string) => {
  const user = await checkAuth()
  if (!user) {
    const err: any = []
    err.success = false
    err.error = '401: Usuário não autenticado. Faça login primeiro'
    return err
  }

  const { data, error } = await supabase
    .from('product_documents')
    .select('*, products!inner(client_id, deleted_at, user_id)')
    .eq('products.client_id', clientId)
    .eq('products.user_id', user.id)
    .is('products.deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    const err: any = []
    err.success = false
    err.error = error.code === '42501' ? '42501: Erro RLS. Permissão negada' : error.message
    return err
  }

  const res: any = data || []
  res.success = true
  res.data = data || []
  return res
}

export const deleteProductDocument = async (id: string, url: string) => {
  const user = await checkAuth()
  if (!user) return { success: false, error: '401: Faça login primeiro' }

  try {
    const urlParts = url.split('/documents/')
    if (urlParts.length > 1) {
      await supabase.storage.from('documents').remove([urlParts[1]])
    }
  } catch (e) {
    console.error('Storage deletion failed', e)
  }
  const { data, error } = await supabase.from('product_documents').delete().eq('id', id).select()

  if (error) {
    const errorMsg = error.code === '42501' ? '42501: Erro RLS. Permissão negada' : error.message
    return { success: false, error: errorMsg }
  }

  const res = { success: true, data }
  Object.assign(res, data)
  return res
}
