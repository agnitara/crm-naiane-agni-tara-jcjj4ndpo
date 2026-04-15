import { useState, useMemo, useEffect } from 'react'
import { useCRM } from '@/contexts/CRMContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { PipelineStage } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Package,
  Search,
  Clock,
  MoreVertical,
  ArrowRightLeft,
  PieChart,
  Settings2,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Filter,
  User,
  Phone,
  Tag,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChannelMetrics } from '@/components/ChannelMetrics'
import { MassFollowUpModal } from '@/components/MassFollowUpModal'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { differenceInDays } from 'date-fns'

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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

type ProductCountFilter = 'all' | '0' | '1-2' | '3+'
type LastInteractionFilter = 'all' | '7' | '30' | '90'

interface FilterState {
  search: string
  columns: string[]
  productStages: string[]
  tags: string[]
  lastInteraction: LastInteractionFilter
  productCount: ProductCountFilter
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  columns: [],
  productStages: [],
  tags: [],
  lastInteraction: 'all',
  productCount: 'all',
}

export default function KanbanBoard() {
  const { badges } = useNotifications()
  const {
    clients,
    products,
    updateClientStage,
    pipelineStages,
    updatePipelineStages,
    openClientPanel,
  } = useCRM()

  const [filters, setFilters] = useState<FilterState>(() => {
    const saved = localStorage.getItem('crm-kanban-filters')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        /* ignore */
      }
    }
    return DEFAULT_FILTERS
  })

  useEffect(() => {
    localStorage.setItem('crm-kanban-filters', JSON.stringify(filters))
  }, [filters])

  const [searchTerm, setSearchTerm] = useState(filters.search)
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [searchOpen, setSearchOpen] = useState(false)
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null)

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }))
  }, [debouncedSearch])

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    clients.forEach((c) => c.sentiment_tags?.forEach((t) => tags.add(t)))
    return Array.from(tags)
  }, [clients])

  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return []
    const q = searchTerm.toLowerCase()
    const results: { label: string; type: 'client' | 'tag' | 'phone'; value: string }[] = []

    clients
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((c) => results.push({ label: c.name, type: 'client', value: c.name }))
    clients
      .filter((c) => c.phone && c.phone.includes(q))
      .slice(0, 2)
      .forEach((c) => results.push({ label: c.phone!, type: 'phone', value: c.phone! }))
    availableTags
      .filter((t) => t.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((t) => results.push({ label: `Tag: ${t}`, type: 'tag', value: t }))

    return results
  }, [searchTerm, clients, availableTags])

  const filteredClients = useMemo(() => {
    return clients
      .filter((c) => {
        if (c.status === 'archived') return false

        if (filters.search) {
          const q = filters.search.toLowerCase()
          const matchesName = c.name.toLowerCase().includes(q)
          const matchesEmail = c.email?.toLowerCase().includes(q)
          const matchesPhone = c.phone?.toLowerCase().includes(q)
          if (!matchesName && !matchesEmail && !matchesPhone) return false
        }

        if (filters.columns.length > 0 && !filters.columns.includes(c.pipeline_stage)) return false

        if (filters.tags.length > 0) {
          if (!c.sentiment_tags || !filters.tags.some((t) => c.sentiment_tags!.includes(t)))
            return false
        }

        const clientProducts = products.filter((p) => p.clientId === c.id)

        if (filters.productStages.length > 0) {
          const hasMatchingProduct = clientProducts.some((p) =>
            filters.productStages.includes(p.stage),
          )
          if (!hasMatchingProduct) return false
        }

        if (filters.productCount !== 'all') {
          const count = clientProducts.length
          if (filters.productCount === '0' && count !== 0) return false
          if (filters.productCount === '1-2' && (count < 1 || count > 2)) return false
          if (filters.productCount === '3+' && count < 3) return false
        }

        if (filters.lastInteraction !== 'all') {
          const lastUpdate = new Date(c.updatedAt || c.createdAt)
          const daysSince = Math.max(0, differenceInDays(new Date(), lastUpdate))
          if (filters.lastInteraction === '7' && daysSince > 7) return false
          if (filters.lastInteraction === '30' && daysSince > 30) return false
          if (filters.lastInteraction === '90' && daysSince > 90) return false
        }

        return true
      })
      .map((c) => {
        if (pipelineStages.length > 0 && !pipelineStages.includes(c.pipeline_stage)) {
          return { ...c, pipeline_stage: pipelineStages[0] }
        }
        return c
      })
  }, [clients, products, filters, pipelineStages])

  const activeFilterCount =
    filters.columns.length +
    filters.productStages.length +
    filters.tags.length +
    (filters.lastInteraction !== 'all' ? 1 : 0) +
    (filters.productCount !== 'all' ? 1 : 0)

  const toggleFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const list = prev[key] as string[]
      if (list.includes(value)) {
        return { ...prev, [key]: list.filter((v) => v !== value) }
      } else {
        return { ...prev, [key]: [...list, value] }
      }
    })
  }

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    e.dataTransfer.setData('clientId', clientId)
    setDraggedClientId(clientId)
    setTimeout(() => {
      const target = e.target as HTMLElement
      if (target) target.style.opacity = '0.5'
    }, 0)
  }
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedClientId(null)
    const target = e.target as HTMLElement
    if (target) target.style.opacity = '1'
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  const handleDrop = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault()
    const clientId = e.dataTransfer.getData('clientId')
    if (clientId) updateClientStage(clientId, stage)
    setDraggedClientId(null)
  }

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [localStages, setLocalStages] = useState<
    { id: string; name: string; originalName: string | null }[]
  >([])
  const [newStageName, setNewStageName] = useState('')

  useEffect(() => {
    if (isSettingsOpen) {
      setLocalStages(
        pipelineStages.map((s, idx) => ({ id: `stage-${idx}`, name: s, originalName: s })),
      )
      setNewStageName('')
    }
  }, [isSettingsOpen, pipelineStages])

  const handleAddStage = () => {
    if (newStageName.trim() && !localStages.some((s) => s.name === newStageName.trim())) {
      setLocalStages([
        ...localStages,
        { id: `new-${Date.now()}`, name: newStageName.trim(), originalName: null },
      ])
      setNewStageName('')
    }
  }
  const handleRemoveStage = (id: string) => setLocalStages(localStages.filter((s) => s.id !== id))
  const handleRenameStage = (id: string, newName: string) =>
    setLocalStages(localStages.map((s) => (s.id === id ? { ...s, name: newName } : s)))
  const moveStageUp = (index: number) => {
    if (index > 0) {
      const newArr = [...localStages]
      const temp = newArr[index - 1]
      newArr[index - 1] = newArr[index]
      newArr[index] = temp
      setLocalStages(newArr)
    }
  }
  const moveStageDown = (index: number) => {
    if (index < localStages.length - 1) {
      const newArr = [...localStages]
      const temp = newArr[index + 1]
      newArr[index + 1] = newArr[index]
      newArr[index] = temp
      setLocalStages(newArr)
    }
  }
  const handleSaveStages = () => {
    const validStages = localStages.filter((s) => s.name.trim() !== '')
    if (validStages.length > 0) {
      const uniqueStages = Array.from(new Set(validStages.map((s) => s.name.trim())))
      const renames = validStages
        .filter(
          (s) =>
            s.originalName &&
            s.originalName !== s.name.trim() &&
            uniqueStages.includes(s.name.trim()),
        )
        .map((s) => ({ oldName: s.originalName!, newName: s.name.trim() }))
      updatePipelineStages(uniqueStages, renames)
      setIsSettingsOpen(false)
    }
  }

  const visibleStages =
    filters.columns.length > 0
      ? pipelineStages.filter((s) => filters.columns.includes(s))
      : pipelineStages

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-muted/10 animate-fade-in">
      <div className="flex-none pt-4 lg:pt-6 px-4 lg:px-6 pb-2 border-b bg-background flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Kanban de Clientes</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto items-start lg:items-center">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-background shrink-0 w-full lg:w-auto">
                  <Settings2 className="h-4 w-4 mr-2" /> Personalizar Colunas
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Configurar Colunas do Kanban</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Nome do novo estágio..."
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
                    />
                    <Button onClick={handleAddStage} type="button" size="icon" className="shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2">
                      {localStages.map((stage, idx) => (
                        <div
                          key={stage.id}
                          className="flex items-center gap-2 bg-muted/50 p-2 rounded-md border"
                        >
                          <div className="flex flex-col gap-0.5 mr-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4"
                              onClick={() => moveStageUp(idx)}
                              disabled={idx === 0}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4"
                              onClick={() => moveStageDown(idx)}
                              disabled={idx === localStages.length - 1}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          <Input
                            value={stage.name}
                            onChange={(e) => handleRenameStage(stage.id, e.target.value)}
                            className="flex-1 h-8 text-sm font-medium bg-background"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => handleRemoveStage(stage.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveStages} disabled={localStages.length === 0}>
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <MassFollowUpModal />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="hidden lg:flex shrink-0 gap-2 bg-background">
                  <PieChart className="h-4 w-4" /> Métricas
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Dashboard de Canais</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ChannelMetrics />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex gap-2 w-full lg:w-auto relative z-10">
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar nome, tag..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSearchOpen(true)
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  className="pl-9 bg-background w-full"
                />
                {searchOpen && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-popover border border-border rounded-md shadow-md z-50 overflow-hidden">
                    <div className="p-1">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Sugestões
                      </div>
                      {suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm flex items-center gap-2"
                          onClick={() => {
                            setSearchTerm(s.value)
                            setSearchOpen(false)
                            if (s.type === 'tag') {
                              toggleFilter('tags', s.value)
                              setSearchTerm('')
                            }
                          }}
                        >
                          {s.type === 'client' && <User className="h-3 w-3" />}
                          {s.type === 'phone' && <Phone className="h-3 w-3" />}
                          {s.type === 'tag' && <Tag className="h-3 w-3" />}
                          <span className="truncate">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-background shrink-0">
                    <Filter className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Filtros</span>
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-1.5 px-1 rounded-sm h-5 font-normal">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] p-0" align="end">
                  <ScrollArea className="h-[400px]">
                    <div className="p-4 space-y-5">
                      <div className="space-y-2.5">
                        <h4 className="text-sm font-medium leading-none">Coluna do Kanban</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {pipelineStages.map((stage) => (
                            <Badge
                              key={stage}
                              variant={filters.columns.includes(stage) ? 'default' : 'outline'}
                              className="cursor-pointer font-normal"
                              onClick={() => toggleFilter('columns', stage)}
                            >
                              {stage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2.5">
                        <h4 className="text-sm font-medium leading-none">Status de Produto</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Interesse',
                            'Proposta',
                            'Negociação',
                            'Fechado',
                            'Entregue',
                            'Upsell',
                          ].map((stage) => (
                            <Badge
                              key={stage}
                              variant={
                                filters.productStages.includes(stage) ? 'default' : 'outline'
                              }
                              className="cursor-pointer font-normal"
                              onClick={() => toggleFilter('productStages', stage)}
                            >
                              {stage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2.5">
                        <h4 className="text-sm font-medium leading-none">Tags</h4>
                        {availableTags.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Nenhuma tag em uso.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {availableTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                                className="cursor-pointer font-normal"
                                onClick={() => toggleFilter('tags', tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Separator />
                      <div className="space-y-2.5">
                        <h4 className="text-sm font-medium leading-none">Última Interação</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: 'Qualquer', value: 'all' },
                            { label: 'Últimos 7 dias', value: '7' },
                            { label: 'Últimos 30 dias', value: '30' },
                            { label: 'Últimos 90 dias', value: '90' },
                          ].map((opt) => (
                            <Badge
                              key={opt.value}
                              variant={
                                filters.lastInteraction === opt.value ? 'default' : 'outline'
                              }
                              className="cursor-pointer font-normal"
                              onClick={() =>
                                setFilters((f) => ({ ...f, lastInteraction: opt.value as any }))
                              }
                            >
                              {opt.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2.5">
                        <h4 className="text-sm font-medium leading-none">Número de Produtos</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: 'Qualquer', value: 'all' },
                            { label: 'Nenhum', value: '0' },
                            { label: '1 a 2', value: '1-2' },
                            { label: '3 ou mais', value: '3+' },
                          ].map((opt) => (
                            <Badge
                              key={opt.value}
                              variant={filters.productCount === opt.value ? 'default' : 'outline'}
                              className="cursor-pointer font-normal"
                              onClick={() =>
                                setFilters((f) => ({ ...f, productCount: opt.value as any }))
                              }
                            >
                              {opt.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground mr-1">Filtros ativos:</span>
            {filters.columns.map((c) => (
              <Badge key={`col-${c}`} variant="secondary" className="gap-1 px-2 font-normal">
                Coluna: {c}{' '}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={() => toggleFilter('columns', c)}
                />
              </Badge>
            ))}
            {filters.productStages.map((s) => (
              <Badge key={`stage-${s}`} variant="secondary" className="gap-1 px-2 font-normal">
                Status: {s}{' '}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={() => toggleFilter('productStages', s)}
                />
              </Badge>
            ))}
            {filters.tags.map((t) => (
              <Badge key={`tag-${t}`} variant="secondary" className="gap-1 px-2 font-normal">
                Tag: {t}{' '}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={() => toggleFilter('tags', t)}
                />
              </Badge>
            ))}
            {filters.lastInteraction !== 'all' && (
              <Badge variant="secondary" className="gap-1 px-2 font-normal">
                Interação: &lt;= {filters.lastInteraction}d{' '}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={() => setFilters((f) => ({ ...f, lastInteraction: 'all' }))}
                />
              </Badge>
            )}
            {filters.productCount !== 'all' && (
              <Badge variant="secondary" className="gap-1 px-2 font-normal">
                Produtos: {filters.productCount}{' '}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={() => setFilters((f) => ({ ...f, productCount: 'all' }))}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters(DEFAULT_FILTERS)
                setSearchTerm('')
              }}
              className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
            >
              Limpar todos
            </Button>
          </div>
        )}
      </div>

      <div className="flex-none px-4 lg:px-6 pt-4 pb-1 border-b bg-muted/5 shadow-inner">
        <ScrollArea className="w-full whitespace-nowrap" type="auto">
          <div className="flex w-max space-x-4 pb-3">
            <Card className="w-[140px] shrink-0 p-3 shadow-sm border-primary/20 bg-primary/5">
              <div className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider truncate">
                Total Filtrado
              </div>
              <div className="text-2xl font-bold font-display mt-0.5 text-primary">
                {filteredClients.length}
              </div>
            </Card>
            {visibleStages.map((stage) => {
              const count = filteredClients.filter((c) => c.pipeline_stage === stage).length
              return (
                <Card
                  key={stage}
                  className="w-[140px] shrink-0 p-3 shadow-sm bg-background border-border/50"
                >
                  <div
                    className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate"
                    title={stage}
                  >
                    {stage}
                  </div>
                  <div className="text-2xl font-bold font-display mt-0.5 text-foreground/90">
                    {count}
                  </div>
                </Card>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>
      </div>

      <ScrollArea className="flex-1 w-full" type="auto">
        <div className="flex gap-4 p-4 lg:p-6 h-full min-h-[500px] items-start snap-x snap-mandatory">
          {visibleStages.map((stage) => {
            const stageClients = filteredClients.filter((c) => c.pipeline_stage === stage)
            return (
              <div
                key={stage}
                className="w-[85vw] max-w-[320px] lg:w-[320px] shrink-0 bg-muted/40 border border-border/50 rounded-xl flex flex-col max-h-full overflow-hidden snap-center"
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
                      const daysInStage = Math.max(
                        0,
                        differenceInDays(
                          new Date(),
                          new Date(client.updatedAt || client.createdAt),
                        ),
                      )
                      let daysColor = 'text-muted-foreground'
                      if (daysInStage >= 15) daysColor = 'text-red-500 font-medium'
                      else if (daysInStage >= 7) daysColor = 'text-amber-500 font-medium'

                      return (
                        <Card
                          key={client.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, client.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            'p-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all border-border/50 group bg-background touch-pan-y',
                            draggedClientId === client.id ? 'ring-2 ring-primary opacity-50' : '',
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar
                                className="h-10 w-10 border shadow-sm shrink-0 cursor-pointer"
                                onClick={() => openClientPanel(client.id)}
                              >
                                <AvatarImage src={client.avatar || ''} />
                                <AvatarFallback>
                                  {client.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    onClick={() => openClientPanel(client.id)}
                                    className="font-medium text-sm hover:text-primary transition-colors truncate block cursor-pointer"
                                  >
                                    {client.name}
                                  </span>
                                  {badges[client.id]?.unreadMessages > 0 && (
                                    <span
                                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
                                      title={`${badges[client.id].unreadMessages} mensagens não lidas`}
                                    >
                                      {badges[client.id].unreadMessages}
                                    </span>
                                  )}
                                  {badges[client.id]?.pendingSuggestions > 0 && (
                                    <span
                                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white"
                                      title={`${badges[client.id].pendingSuggestions} sugestões Kimi`}
                                    >
                                      {badges[client.id].pendingSuggestions}
                                    </span>
                                  )}
                                  {badges[client.id]?.upcomingEvents > 0 && (
                                    <span
                                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white"
                                      title={`${badges[client.id].upcomingEvents} agendamentos próximos`}
                                    >
                                      {badges[client.id].upcomingEvents}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {client.email || client.phone}
                                </p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0 -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                  Mover para...
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <ScrollArea className="h-[200px]">
                                  {pipelineStages
                                    .filter((s) => s !== stage)
                                    .map((s) => (
                                      <DropdownMenuItem
                                        key={s}
                                        onClick={() => updateClientStage(client.id, s)}
                                        className="text-xs cursor-pointer"
                                      >
                                        <ArrowRightLeft className="mr-2 h-3 w-3 text-muted-foreground" />{' '}
                                        {s}
                                      </DropdownMenuItem>
                                    ))}
                                </ScrollArea>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {clientProducts.length > 0 ? (
                            <div className="space-y-2 mb-3">
                              {clientProducts.slice(0, 2).map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center justify-between gap-2 text-xs"
                                >
                                  <span className="truncate flex-1 font-medium text-foreground/70 flex items-center gap-1.5">
                                    <Package className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{product.name}</span>
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'text-[10px] px-1.5 py-0 h-4 border shrink-0',
                                      getProductBadgeColor(product.stage),
                                    )}
                                  >
                                    {product.stage}
                                  </Badge>
                                </div>
                              ))}
                              {clientProducts.length > 2 && (
                                <p className="text-[10px] text-muted-foreground text-center pt-1 border-t border-border/40">
                                  +{clientProducts.length - 2} produto(s)
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground/60 flex items-center gap-1.5 italic bg-muted/30 p-1.5 rounded-md justify-center mb-3">
                              Nenhum produto atrelado
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div
                              className={cn('flex items-center gap-1 text-[10px]', daysColor)}
                              title="Dias neste estágio"
                            >
                              <Clock className="h-3 w-3" />
                              <span className="font-medium">
                                {daysInStage} {daysInStage === 1 ? 'dia' : 'dias'}
                              </span>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                    {stageClients.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground/50 transition-colors hover:border-border/80">
                        Nenhum cliente
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
