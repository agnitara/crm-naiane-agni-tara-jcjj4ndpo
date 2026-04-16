import { supabase } from '@/lib/supabase/client'

export interface ProductType {
  id: string
  name: string
  description?: string
  default_value: number
  created_at: string
}

async function checkAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return null
  return session.user
}

export const getProductTypes = async () => {
  const { data, error } = await supabase.from('product_types').select('*').order('name')
  if (error) throw error
  return data as ProductType[]
}

export const createProductType = async (type: Partial<ProductType>) => {
  const user = await checkAuth()
  if (!user) return { success: false, error: 'Faça login primeiro', code: '401' }

  const { data, error } = await supabase
    .from('product_types')
    .insert({
      name: type.name,
      description: type.description,
      default_value: type.default_value,
    })
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  return { success: true, data: data as ProductType }
}

export const updateProductType = async (id: string, updates: Partial<ProductType>) => {
  const user = await checkAuth()
  if (!user) return { success: false, error: 'Faça login primeiro', code: '401' }

  const { data, error } = await supabase
    .from('product_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  return { success: true, data: data as ProductType }
}

export const deleteProductType = async (id: string) => {
  const user = await checkAuth()
  if (!user) return { success: false, error: 'Faça login primeiro', code: '401' }

  const { error } = await supabase.from('product_types').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}
