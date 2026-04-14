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
  refreshProducts: () => Promise<void>
  refreshClients: () => Promise<void>
}

const CRMContext = createContext<CRMContextType | undefined>(undefined)

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>(mockInteractions)
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)

  const refreshClients = useCallback(async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (e) {
      console.error('Failed to fetch clients', e)
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
    refreshClients()
    refreshProducts()

    const channel = supabase
      .channel('public:clients_and_products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        refreshClients()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        refreshProducts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshClients, refreshProducts])

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
      value={{
        clients,
        products,
        interactions,
        events,
        updateProductStage,
        updateClientStage,
        addClient,
        deleteClientSoft,
        refreshProducts,
        refreshClients,
      }}
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
