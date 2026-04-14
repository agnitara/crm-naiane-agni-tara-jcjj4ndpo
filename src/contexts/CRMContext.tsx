import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Client, Product, Interaction, CalendarEvent, Stage } from '@/lib/types'
import { mockClients, mockProducts, mockInteractions, mockEvents } from '@/lib/mock-data'
import { toast } from 'sonner'

interface CRMContextType {
  clients: Client[]
  products: Product[]
  interactions: Interaction[]
  events: CalendarEvent[]
  updateProductStage: (productId: string, newStage: Stage) => void
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void
  deleteClientSoft: (clientId: string) => void
}

const CRMContext = createContext<CRMContextType | undefined>(undefined)

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [interactions, setInteractions] = useState<Interaction[]>(mockInteractions)
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)

  const updateProductStage = (productId: string, newStage: Stage) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stage: newStage } : p)))
    toast.success(`Status do produto atualizado para ${newStage}`)
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
