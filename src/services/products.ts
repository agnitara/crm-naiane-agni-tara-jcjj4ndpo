import { supabase } from '@/lib/supabase/client'
import { Product } from '@/lib/types'

export const getProducts = async (clientId?: string) => {
  let query = supabase.from('products').select('*').is('deleted_at', null)
  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createProduct = async (product: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      client_id: product.clientId,
      name: product.name,
      value: product.value,
      stage: product.stage,
      start_date: product.startDate,
      expected_date: product.expectedDate,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const payload: any = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.value !== undefined) payload.value = updates.value
  if (updates.stage !== undefined) payload.stage = updates.stage
  if (updates.startDate !== undefined) payload.start_date = updates.startDate
  if (updates.expectedDate !== undefined) payload.expected_date = updates.expectedDate

  payload.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export const uploadProductDocument = async (productId: string, file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `products/${productId}/${fileName}`

  const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)
  if (uploadError) throw uploadError

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

  if (error) throw error
  return data
}

export const getProductDocumentsByClient = async (clientId: string) => {
  const { data, error } = await supabase
    .from('product_documents')
    .select('*, products!inner(client_id, deleted_at)')
    .eq('products.client_id', clientId)
    .is('products.deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const deleteProductDocument = async (id: string, url: string) => {
  try {
    const urlParts = url.split('/documents/')
    if (urlParts.length > 1) {
      await supabase.storage.from('documents').remove([urlParts[1]])
    }
  } catch (e) {
    console.error('Storage deletion failed', e)
  }
  const { error } = await supabase.from('product_documents').delete().eq('id', id)
  if (error) throw error
}
