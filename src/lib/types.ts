export type Stage = 'Interesse' | 'Proposta' | 'Negociação' | 'Fechado' | 'Entregue' | 'Upsell'
export type Platform = 'whatsapp' | 'instagram' | 'facebook' | 'system'

export type PipelineStage =
  | 'Lead'
  | 'Prospect'
  | 'Qualificado'
  | 'Em Tratativa'
  | 'Proposta'
  | 'Negociação'
  | 'Ativo'
  | 'Concluído'
  | 'Inativo'

export const PIPELINE_STAGES: PipelineStage[] = [
  'Lead',
  'Prospect',
  'Qualificado',
  'Em Tratativa',
  'Proposta',
  'Negociação',
  'Ativo',
  'Concluído',
  'Inativo',
]

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  status: 'active' | 'archived'
  pipeline_stage: PipelineStage
  createdAt: string
  updatedAt?: string
  notes?: string
}

export interface Product {
  id: string
  clientId: string
  name: string
  value: number
  stage: Stage
  startDate?: string
  expectedDate: string
  createdAt?: string
}

export interface Interaction {
  id: string
  clientId: string
  platform: Platform
  type: 'text' | 'audio' | 'document' | 'system'
  content: string
  transcription?: string
  transcriptionStatus?: 'pending' | 'completed' | 'failed'
  timestamp: string
  direction: 'inbound' | 'outbound'
  audioDuration?: number
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  clientId?: string
  googleCalendarId?: string
  type: 'meeting' | 'deadline'
}

export interface Document {
  id: string
  productId: string
  name: string
  url: string
  uploadedAt: string
  type: string
  size?: number
}
