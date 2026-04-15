import { useMemo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCRM } from '@/contexts/CRMContext'
import { differenceInDays } from 'date-fns'

export function StepSelection({
  selectedStages,
  setSelectedStages,
  selectedTags,
  setSelectedTags,
  inactiveDays,
  setInactiveDays,
  searchTerm,
  setSearchTerm,
  selectedClientIds,
  setSelectedClientIds,
}: any) {
  const { clients, pipelineStages } = useCRM()

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    clients.forEach((c) => c.sentiment_tags?.forEach((t) => tags.add(t)))
    return Array.from(tags)
  }, [clients])

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (c.status === 'archived') return false
      if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      if (selectedStages.length > 0 && !selectedStages.includes(c.pipeline_stage)) return false
      if (
        selectedTags.length > 0 &&
        (!c.sentiment_tags || !selectedTags.some((t) => c.sentiment_tags!.includes(t)))
      )
        return false
      if (inactiveDays !== 'all') {
        const days = differenceInDays(new Date(), new Date(c.updatedAt || c.createdAt))
        if (inactiveDays === '7' && days <= 7) return false
        if (inactiveDays === '30' && days <= 30) return false
        if (inactiveDays === '90' && days <= 90) return false
      }
      return true
    })
  }, [clients, selectedStages, selectedTags, inactiveDays, searchTerm])

  const handleSelectAll = () => {
    if (selectedClientIds.size === filteredClients.length) setSelectedClientIds(new Set())
    else setSelectedClientIds(new Set(filteredClients.map((c) => c.id)))
  }

  const toggleClient = (id: string) => {
    const next = new Set(selectedClientIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedClientIds(next)
  }

  const toggleArray = (arr: string[], setArr: any, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  return (
    <div className="flex h-full divide-x">
      <div className="w-1/3 p-6 space-y-6 overflow-y-auto">
        <div>
          <h3 className="font-semibold mb-3">Busca</h3>
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Por Coluna</h3>
          <div className="space-y-2">
            {pipelineStages.map((stage) => (
              <div key={stage} className="flex items-center space-x-2">
                <Checkbox
                  id={`stage-${stage}`}
                  checked={selectedStages.includes(stage)}
                  onCheckedChange={() => toggleArray(selectedStages, setSelectedStages, stage)}
                />
                <Label htmlFor={`stage-${stage}`} className="font-normal cursor-pointer">
                  {stage}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Por Inatividade</h3>
          <Select value={inactiveDays} onValueChange={setInactiveDays}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer período</SelectItem>
              <SelectItem value="7">Há mais de 7 dias</SelectItem>
              <SelectItem value="30">Há mais de 30 dias</SelectItem>
              <SelectItem value="90">Há mais de 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {availableTags.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Por Tag</h3>
            <div className="space-y-2">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => toggleArray(selectedTags, setSelectedTags, tag)}
                  />
                  <Label htmlFor={`tag-${tag}`} className="font-normal cursor-pointer">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="w-2/3 p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Clientes ({filteredClients.length})</h3>
            {selectedClientIds.size > 0 && (
              <Badge variant="secondary">{selectedClientIds.size} selecionados</Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedClientIds.size === filteredClients.length && filteredClients.length > 0
              ? 'Desmarcar Todos'
              : 'Selecionar Todos'}
          </Button>
        </div>
        <ScrollArea className="flex-1 border rounded-md p-4">
          <div className="space-y-3">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`client-${client.id}`}
                    checked={selectedClientIds.has(client.id)}
                    onCheckedChange={() => toggleClient(client.id)}
                  />
                  <div className="flex flex-col">
                    <Label htmlFor={`client-${client.id}`} className="font-medium cursor-pointer">
                      {client.name}
                    </Label>
                    <span className="text-xs text-muted-foreground">{client.pipeline_stage}</span>
                  </div>
                </div>
                {client.sentiment_tags && client.sentiment_tags.length > 0 && (
                  <div className="flex gap-1">
                    {client.sentiment_tags.slice(0, 2).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {filteredClients.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Nenhum cliente corresponde aos filtros atuais.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
