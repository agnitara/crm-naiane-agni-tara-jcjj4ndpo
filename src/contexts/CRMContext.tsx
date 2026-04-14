import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { Client, Product, Interaction, CalendarEvent, Stage, PipelineStage } from '@/lib/types'
import { mockInteractions, mockEvents } from '@/lib/mock-data'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { getProducts } from '@/services/products'
import { getClients, updateClientPipelineStage } from '@/services/clients'

interface CRMContextType {
  clients: Client[]
  products: Product[]
  interactions: Interaction[]
  events: CalendarEvent[]
  updateProductStage: (productId: string, newStage: Stage) => void
  addClient: (client: any) => Promise<void>
  deleteClientSoft: (clientId: string) => Promise<void>
  updateClientStage: (clientId: string, newStage: PipelineStage) => Promise<void>
  pipelineStages: string[]
  updatePipelineStages: (stages: string[]) => Promise<void>
  refreshProducts: () => Promise<void>
  refreshClients: () => Promise<void>
  refreshEvents: () => Promise<void>
}

const CRMContext = createContext<CRMContextType | undefined>(undefined)

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>(mockInteractions)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [pipelineStages, setPipelineStages] = useState<string[]>([
    'Lead',
    'Prospect',
    'Qualificado',
    'Em Tratativa',
    'Proposta',
    'Negociação',
    'Ativo',
    'Concluído',
    'Inativo',
  ])

  const refreshEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('calendar_events').select('*')
      if (error) throw error
      if (data) {
        setEvents(
          data.map((e) => ({
            id: e.id,
            title: e.title,
            date: e.start_time,
            endDate: e.end_time,
            clientId: e.client_id || undefined,
            googleCalendarId: e.google_calendar_event_id || undefined,
            type: 'meeting',
            description: e.description || undefined,
            syncStatus: e.sync_status as any,
          })),
        )
      }
    } catch (e) {
      console.error('Failed to fetch events', e)
    }
  }, [])

  const refreshClients = useCallback(async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (e) {
      console.error('Failed to fetch clients', e)
    }
  }, [])

  const refreshSettings = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from('user_settings')
        .select('pipeline_stages')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      if (data && data.pipeline_stages && data.pipeline_stages.length > 0) {
        setPipelineStages(data.pipeline_stages)
      }
    } catch (e) {
      console.error('Failed to fetch settings', e)
    }
  }, [])

  const refreshProducts = useCallback(async () => {
    try {
      const data = await getProducts()
      setProducts(
        data.map((p) => ({
          id: p.id,
          clientId: p.client_id,
          name: p.name,
          value: p.value,
          stage: p.stage as Stage,
          startDate: p.start_date,
          expectedDate: p.expected_date,
          createdAt: p.created_at,
        })),
      )
    } catch (e) {
      console.error('Failed to fetch products', e)
    }
  }, [])

  useEffect(() => {
    refreshSettings()
    refreshClients()
    refreshProducts()
    refreshEvents()

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        refreshSettings()
        refreshClients()
        refreshProducts()
        refreshEvents()
      }
    })

    const channel = supabase
      .channel('public:clients_and_products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        refreshClients()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        refreshProducts()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, () => {
        refreshEvents()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      authListener.subscription.unsubscribe()
    }
  }, [refreshClients, refreshProducts, refreshEvents, refreshSettings])

  const updatePipelineStages = async (stages: string[]) => {
    setPipelineStages(stages)
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.user) {
      const { error } = await supabase.from('user_settings').upsert(
        {
          user_id: session.user.id,
          pipeline_stages: stages,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      if (error) {
        toast.error('Erro ao salvar estágios')
        refreshSettings()
      } else {
        toast.success('Estágios atualizados com sucesso')
      }
    }
  }

  const updateProductStage = async (productId: string, newStage: Stage) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stage: newStage } : p)))
    const { error } = await supabase
      .from('products')
      .update({ stage: newStage })
      .eq('id', productId)
    if (error) {
      toast.error('Erro ao atualizar produto')
      refreshProducts()
    }
  }

  const updateClientStage = async (clientId: string, newStage: PipelineStage) => {
    const previous = [...clients]
    const now = new Date().toISOString()
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, pipeline_stage: newStage, updatedAt: now } : c)),
    )
    try {
      await updateClientPipelineStage(clientId, newStage)
    } catch (error) {
      toast.error('Erro ao atualizar estágio do cliente')
      setClients(previous)
    }
  }

  const addClient = async (clientData: any) => {
    const newId = `c${Date.now()}`
    const { error } = await supabase.from('clients').insert({
      id: newId,
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      avatar: clientData.avatar,
      status: clientData.status || 'active',
      pipeline_stage: clientData.pipeline_stage || 'Lead',
    })
    if (!error) {
      toast.success('Cliente adicionado com sucesso!')
      refreshClients()
    } else {
      toast.error('Erro ao adicionar cliente')
    }
  }

  const deleteClientSoft = async (clientId: string) => {
    const previous = [...clients]
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, status: 'archived' } : c)))
    const { error } = await supabase
      .from('clients')
      .update({ status: 'archived' })
      .eq('id', clientId)
    if (error) {
      toast.error('Erro ao arquivar cliente')
      setClients(previous)
    } else {
      toast.info('Cliente arquivado com sucesso.')
    }
  }

  return (
    <CRMContext.Provider
      value={
        {
          clients,
          products,
          interactions,
          events,
          updateProductStage,
          updateClientStage,
          addClient,
          deleteClientSoft,
          pipelineStages,
          updatePipelineStages,
          refreshProducts,
          refreshClients,
          refreshEvents,
        } as any
      }
    >
      {children}
    </CRMContext.Provider>
  )
}

export const useCRM = () => {
  const context = useContext(CRMContext)
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider')
  }
  return context
}
