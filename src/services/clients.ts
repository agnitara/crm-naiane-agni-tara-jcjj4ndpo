import { supabase } from '@/lib/supabase/client'
import { Client, PipelineStage } from '@/lib/types'

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email || '',
    phone: c.phone || '',
    avatar: c.avatar || '',
    status: c.status as 'active' | 'archived',
    pipeline_stage: (c.pipeline_stage as PipelineStage) || 'Lead',
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }))
}

export async function updateClientPipelineStage(id: string, stage: PipelineStage) {
  const { error } = await supabase
    .from('clients')
    .update({
      pipeline_stage: stage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}
