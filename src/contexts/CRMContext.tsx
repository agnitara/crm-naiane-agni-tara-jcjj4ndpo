import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { Client, Product, Interaction, CalendarEvent, Stage } from '@/lib/types'
import { mockClients, mockInteractions, mockEvents } from '@/lib/mock-data'
import { toast } from 'sonner'
import { getProducts } from '@/services/products'

interface CRMContextType {
  clients: Client[]
  products: Product[]
  interactions: Interaction[]
  events: CalendarEvent[]
  updateProductStage: (productId: string, newStage: Stage) => void
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void
  deleteClientSoft: (clientId: string) => void
  refreshProducts: () => Promise<void>
}

const CRMContext = createContext<CRMContextType | undefined>(undefined)

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [products, setProducts] = useState<Product[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>(mockInteractions)
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)

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
    refreshProducts()
  }, [refreshProducts])

  const updateProductStage = (productId: string, newStage: Stage) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stage: newStage } : p)))
  }

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: `c${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setClients((prev) => [newClient, ...prev])
    toast.success('Cliente adicionado com sucesso!')
  }

  const deleteClientSoft = (clientId: string) => {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, status: 'archived' } : c)))
    toast.info('Cliente arquivado. Os produtos foram mantidos para histórico.')
  }

  return (
    <CRMContext.Provider
      value={{
        clients,
        products,
        interactions,
        events,
        updateProductStage,
        addClient,
        deleteClientSoft,
        refreshProducts,
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
