import { Client, Product, Interaction, CalendarEvent, Document } from './types'

export const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'Carolina Mendes',
    email: 'carol.mendes@exemplo.com',
    phone: '+55 11 98765-4321',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
    status: 'active',
    createdAt: '2023-10-15T10:00:00Z',
    notes: 'CEO de agência de marketing. Busca estruturação de equipe.',
  },
  {
    id: 'c2',
    name: 'Roberto Alves',
    email: 'roberto.alves@exemplo.com',
    phone: '+55 21 97654-3210',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
    status: 'active',
    createdAt: '2023-11-02T14:30:00Z',
  },
  {
    id: 'c3',
    name: 'Mariana Costa',
    email: 'mari.costa@exemplo.com',
    phone: '+55 31 99999-8888',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
    status: 'active',
    createdAt: '2023-11-20T09:15:00Z',
  },
]

export const mockProducts: Product[] = [
  {
    id: 'p1',
    clientId: 'c1',
    name: 'Mentoria VIP 6 Meses',
    value: 15000,
    stage: 'Negociação',
    expectedDate: '2023-12-15T00:00:00Z',
  },
  {
    id: 'p2',
    clientId: 'c1',
    name: 'Consultoria de Processos',
    value: 8000,
    stage: 'Fechado',
    expectedDate: '2023-11-01T00:00:00Z',
  },
  {
    id: 'p3',
    clientId: 'c2',
    name: 'Imersão Estratégica',
    value: 5000,
    stage: 'Proposta',
    expectedDate: '2023-12-05T00:00:00Z',
  },
  {
    id: 'p4',
    clientId: 'c3',
    name: 'Mentoria em Grupo',
    value: 3000,
    stage: 'Interesse',
    expectedDate: '2024-01-10T00:00:00Z',
  },
]

export const mockInteractions: Interaction[] = [
  {
    id: 'i1',
    clientId: 'c1',
    platform: 'whatsapp',
    type: 'text',
    direction: 'inbound',
    content: 'Oi Naiane, consegui ler a proposta. Podemos fechar os detalhes na sexta?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'i2',
    clientId: 'c1',
    platform: 'whatsapp',
    type: 'audio',
    direction: 'inbound',
    content: 'audio_file.mp3',
    audioDuration: 45,
    transcriptionStatus: 'completed',
    transcription:
      'Então, eu tava pensando aqui sobre a parte de contratação que você mencionou. Acho que faz sentido incluirmos isso no escopo da mentoria VIP.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'i3',
    clientId: 'c1',
    platform: 'instagram',
    type: 'text',
    direction: 'outbound',
    content: 'Perfeito Carol! Vou te mandar o link do nosso encontro por aqui mesmo.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'i4',
    clientId: 'c2',
    platform: 'facebook',
    type: 'text',
    direction: 'inbound',
    content: 'Vi seu anúncio sobre a imersão. Como funciona para empresas B2B?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
]

export const mockEvents: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Reunião de Fechamento - Carolina',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    clientId: 'c1',
    type: 'meeting',
    googleCalendarId: 'gcal_123',
  },
  {
    id: 'e2',
    title: 'Alinhamento Estratégico - Roberto',
    date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    clientId: 'c2',
    type: 'meeting',
  },
]

export const mockDocuments: Document[] = [
  {
    id: 'd1',
    productId: 'p2',
    name: 'Contrato_Consultoria_Assinado.pdf',
    url: '#',
    uploadedAt: '2023-11-02T10:00:00Z',
    type: 'pdf',
  },
  {
    id: 'd2',
    productId: 'p1',
    name: 'Proposta_Comercial_Mentoria.pdf',
    url: '#',
    uploadedAt: '2023-11-15T15:30:00Z',
    type: 'pdf',
  },
]
