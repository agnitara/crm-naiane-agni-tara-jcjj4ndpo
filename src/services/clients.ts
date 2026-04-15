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
  const { data: result, error } = await supabase
    .from('clients')
    .insert({
      id: crypto.randomUUID(),
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
  if (error) throw error
  return result
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

export async function updateClientOptOut(id: string, optOut: boolean) {
  const { error } = await supabase
    .from('clients')
    .update({
      opt_out: optOut,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', id)
  if (error) throw error
}
