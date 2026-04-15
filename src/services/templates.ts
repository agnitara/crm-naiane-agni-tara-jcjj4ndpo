import { supabase } from '@/lib/supabase/client'
import { MessageTemplate } from '@/lib/types'

export async function getTemplates(userId: string): Promise<MessageTemplate[]> {
  const { data, error } = await supabase
    .from('message_templates' as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching templates:', error)
    return []
  }

  return (data as any[]).map((t: any) => ({
    id: t.id,
    name: t.name,
    content: t.content,
    createdAt: t.created_at,
  }))
}

export async function saveTemplate(
  userId: string,
  name: string,
  content: string,
): Promise<MessageTemplate> {
  const { data, error } = await supabase
    .from('message_templates' as any)
    .insert({ user_id: userId, name, content })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    content: data.content,
    createdAt: data.created_at,
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('message_templates' as any)
    .delete()
    .eq('id', id)

  if (error) throw error
}
