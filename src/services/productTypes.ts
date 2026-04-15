import { supabase } from '@/lib/supabase/client'

export interface ProductType {
  id: string
  name: string
  description?: string
  default_value: number
  created_at: string
}

export const getProductTypes = async () => {
  const { data, error } = await supabase.from('product_types').select('*').order('name')
  if (error) throw error
  return data as ProductType[]
}

export const createProductType = async (type: Partial<ProductType>) => {
  const { data, error } = await supabase
    .from('product_types')
    .insert({
      name: type.name,
      description: type.description,
      default_value: type.default_value,
    })
    .select()
    .single()
  if (error) throw error
  return data as ProductType
}

export const updateProductType = async (id: string, updates: Partial<ProductType>) => {
  const { data, error } = await supabase
    .from('product_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as ProductType
}

export const deleteProductType = async (id: string) => {
  const { error } = await supabase.from('product_types').delete().eq('id', id)
  if (error) throw error
}
