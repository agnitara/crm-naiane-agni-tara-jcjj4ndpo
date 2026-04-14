import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createLocalEvent, syncToGoogle, checkConflicts } from '@/services/calendar'
import { useCRM } from '@/contexts/CRMContext'

interface EventDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultClientId?: string
}

export function EventDialog({ isOpen, onClose, onSuccess, defaultClientId }: EventDialogProps) {
  const { clients } = useCRM()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    clientId: defaultClientId || 'none',
    description: '',
  })

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({ ...prev, clientId: defaultClientId || 'none' }))
    }
  }, [isOpen, defaultClientId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return toast.error('Título é obrigatório')
    if (!formData.date || !formData.startTime || !formData.endTime)
      return toast.error('Datas são obrigatórias')

    const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`).toISOString()
    const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`).toISOString()

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      return toast.error('A data de término deve ser posterior à data de início')
    }

    setLoading(true)
    try {
      const hasConflict = await checkConflicts(startDateTime, endDateTime)
      if (hasConflict) {
        toast.error('Você já tem um compromisso neste horário')
        setLoading(false)
        return
      }

      const event = await createLocalEvent({
        title: formData.title,
        date: startDateTime,
        endDate: endDateTime,
        clientId: formData.clientId === 'none' ? undefined : formData.clientId,
        description: formData.description,
      })

      // Background sync
      syncToGoogle(event.id)
        .then(() => {
          onSuccess()
        })
        .catch((err) => {
          console.error('Failed to sync', err)
          toast.warning(
            'Evento criado localmente, mas falhou ao sincronizar com Google. Será tentado novamente.',
          )
          onSuccess()
        })

      toast.success('Evento criado e enviando para o Google Calendar!')
      onClose()
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        clientId: defaultClientId || 'none',
        description: '',
      })
    } catch (error: any) {
      toast.error('Erro ao criar evento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Compromisso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Reunião de Alinhamento"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Início</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Fim</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Cliente Relacionado (Opcional)</Label>
            <Select
              value={formData.clientId}
              onValueChange={(v) => setFormData({ ...formData, clientId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes adicionais..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div flex justify-end gap-3 pt-4>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Agendar e Sincronizar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
