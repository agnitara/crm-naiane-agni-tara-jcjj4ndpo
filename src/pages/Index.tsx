import { useState, useMemo } from 'react'
import { useCRM } from '@/contexts/CRMContext'
import { PipelineStage, PIPELINE_STAGES } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Link } from 'react-router-dom'
import { Package, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const getProductBadgeColor = (stage: string) => {
  switch (stage) {
    case 'Fechado':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    case 'Entregue':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    case 'Negociação':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    case 'Proposta':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    case 'Interesse':
      return 'bg-sky-500/10 text-sky-600 border-sky-500/20'
    case 'Upsell':
      return 'bg-pink-500/10 text-pink-600 border-pink-500/20'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  }
}

export default function KanbanBoard() {
  const { clients, products, updateClientStage } = useCRM()
  const [filterProductStage, setFilterProductStage] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null)

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (c.status === 'archived') return false

      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      if (filterProductStage !== 'all') {
        const clientProducts = products.filter((p) => p.clientId === c.id)
        const hasProductInStage = clientProducts.some((p) => p.stage === filterProductStage)
        if (!hasProductInStage) return false
      }
      return true
    })
  }, [clients, products, filterProductStage, searchQuery])

  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    e.dataTransfer.setData('clientId', clientId)
    setDraggedClientId(clientId)
    setTimeout(() => {
      const target = e.target as HTMLElement
      target.style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedClientId(null)
    const target = e.target as HTMLElement
    target.style.opacity = '1'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault()
    const clientId = e.dataTransfer.getData('clientId')
    if (clientId && clientId !== '') {
      updateClientStage(clientId, stage)
    }
    setDraggedClientId(null)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-muted/10 animate-fade-in">
      {/* Header */}
      <div className="flex-none p-6 border-b bg-background flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-display font-bold">Kanban de Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Arraste os cards para atualizar o estágio do relacionamento.
          </p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={filterProductStage} onValueChange={setFilterProductStage}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Filtrar por Produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Produtos</SelectItem>
              <SelectItem value="Interesse">Interesse</SelectItem>
              <SelectItem value="Proposta">Proposta</SelectItem>
              <SelectItem value="Negociação">Negociação</SelectItem>
              <SelectItem value="Fechado">Fechado</SelectItem>
              <SelectItem value="Entregue">Entregue</SelectItem>
              <SelectItem value="Upsell">Upsell</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban Area */}
      <ScrollArea className="flex-1 w-full" type="auto">
        <div className="flex gap-4 p-6 h-full min-h-[500px] items-start">
          {PIPELINE_STAGES.map((stage) => {
            const stageClients = filteredClients.filter((c) => c.pipeline_stage === stage)
            return (
              <div
                key={stage}
                className="w-[320px] shrink-0 bg-muted/40 border border-border/50 rounded-xl flex flex-col max-h-full overflow-hidden"
                onDrop={(e) => handleDrop(e, stage)}
                onDragOver={handleDragOver}
              >
                <div className="p-3 bg-muted/50 border-b border-border/50 font-semibold text-sm flex items-center justify-between text-foreground/80">
                  <span className="truncate pr-2">{stage}</span>
                  <Badge variant="secondary" className="rounded-full px-2 shadow-sm bg-background">
                    {stageClients.length}
                  </Badge>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-3">
                    {stageClients.map((client) => {
                      const clientProducts = products.filter((p) => p.clientId === client.id)
                      return (
                        <Card
                          key={client.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, client.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            'p-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all border-border/50 group bg-background',
                            draggedClientId === client.id ? 'ring-2 ring-primary' : '',
                          )}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar className="h-10 w-10 border shadow-sm">
                              <AvatarImage src={client.avatar || ''} />
                              <AvatarFallback>
                                {client.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/clientes/${client.id}`}
                                className="font-medium text-sm hover:text-primary transition-colors truncate block"
                              >
                                {client.name}
                              </Link>
                              <p className="text-xs text-muted-foreground truncate">
                                {client.email || client.phone}
                              </p>
                            </div>
                          </div>

                          {clientProducts.length > 0 ? (
                            <div className="space-y-2">
                              {clientProducts.slice(0, 2).map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center justify-between gap-2 text-xs"
                                >
                                  <span className="truncate flex-1 font-medium text-foreground/70 flex items-center gap-1.5">
                                    <Package className="h-3 w-3" />
                                    {product.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'text-[10px] px-1.5 py-0 h-4 border',
                                      getProductBadgeColor(product.stage),
                                    )}
                                  >
                                    {product.stage}
                                  </Badge>
                                </div>
                              ))}
                              {clientProducts.length > 2 && (
                                <p className="text-[10px] text-muted-foreground text-center pt-1 border-t">
                                  +{clientProducts.length - 2} produto(s)
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground/60 flex items-center gap-1.5 italic bg-muted/30 p-1.5 rounded-md justify-center">
                              Nenhum produto atrelado
                            </div>
                          )}
                        </Card>
                      )
                    })}
                    {stageClients.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground/50 transition-colors hover:border-border">
                        Arraste para cá
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
