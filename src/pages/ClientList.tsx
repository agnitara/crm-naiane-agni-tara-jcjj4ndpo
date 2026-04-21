import { useState } from 'react'
import { useCRM } from '@/contexts/CRMContext'
import { Link } from 'react-router-dom'
import {
  Search,
  MoreVertical,
  ShieldAlert,
  Plus,
  Sparkles,
  Calendar as CalIcon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PIPELINE_STAGES } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { createClient } from '@/services/clients'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MassFollowUpModal } from '@/components/MassFollowUpModal'
import { useNotifications } from '@/contexts/NotificationContext'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function ClientList() {
  const { clients, products, deleteClientSoft, openClientPanel } = useCRM()
  const { badges } = useNotifications()
  const [search, setSearch] = useState('')
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)

  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    pipeline_stage: 'Lead',
    behavioral_profile: '',
    notes: '',
    utm_source: '',
    utm_campaign: '',
    utm_medium: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  const activeClients = clients.filter(
    (c) => c.status === 'active' && c.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = () => {
    if (clientToDelete) {
      deleteClientSoft(clientToDelete)
      setClientToDelete(null)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientData.name.trim()) return

    try {
      setIsCreating(true)
      const result = await createClient(newClientData)

      if (result.success) {
        toast.success('Cliente criado com sucesso!')
        setIsNewClientOpen(false)
        setNewClientData({
          name: '',
          email: '',
          phone: '',
          avatar: '',
          pipeline_stage: 'Lead',
          behavioral_profile: '',
          notes: '',
          utm_source: '',
          utm_campaign: '',
          utm_medium: '',
        })
        // Small delay to allow the user to see the success before redirect
        setTimeout(() => {
          window.location.href = `/clientes/${result.data.id}`
        }, 500)
      } else {
        toast.error(`Erro ao criar cliente: ${result.error}`)
      }
    } catch (error: any) {
      toast.error(`Erro ao criar cliente: ${error?.message || 'Tente novamente'}`)
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie sua carteira de mentorados e clientes de consultoria.
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              className="pl-9 bg-card border-none shadow-subtle"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <MassFollowUpModal />
          <Button onClick={() => setIsNewClientOpen(true)} className="shrink-0 shadow-elevation">
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeClients.map((client) => {
          const clientProducts = products.filter((p) => p.clientId === client.id)
          const activePipeline = clientProducts.filter((p) => p.stage !== 'Entregue').length

          return (
            <Card
              key={client.id}
              className="p-5 flex flex-col gap-4 shadow-subtle border-none hover:shadow-elevation transition-shadow duration-300 group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border border-muted">
                      <AvatarImage src={client.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                        {client.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {(badges[client.id]?.unreadMessages || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background animate-in zoom-in">
                        {badges[client.id].unreadMessages}
                      </span>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => openClientPanel(client.id)}
                      className="font-semibold hover:text-primary transition-colors block text-left flex items-center gap-1.5"
                    >
                      {client.name}
                    </button>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {client.email || client.phone || 'Sem contato'}
                      </p>
                      {(badges[client.id]?.pendingSuggestions || 0) > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] h-4 px-1 bg-purple-100 text-purple-700 hover:bg-purple-100"
                        >
                          <Sparkles className="w-2.5 h-2.5 mr-0.5" />{' '}
                          {badges[client.id]?.pendingSuggestions || 0}
                        </Badge>
                      )}
                      {(badges[client.id]?.upcomingEvents || 0) > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] h-4 px-1 bg-blue-100 text-blue-700 hover:bg-blue-100"
                        >
                          <CalIcon className="w-2.5 h-2.5 mr-0.5" />{' '}
                          {badges[client.id]?.upcomingEvents || 0}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => openClientPanel(client.id)}>
                      Abrir Painel
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/clientes/${client.id}`}>Ver Perfil Completo</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={() => setClientToDelete(client.id)}
                    >
                      Arquivar Cliente
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 grid grid-cols-2 gap-2 text-sm mt-auto">
                <div>
                  <p className="text-muted-foreground text-xs font-medium mb-1">Produtos</p>
                  <p className="font-semibold">{clientProducts.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium mb-1">Status</p>
                  {activePipeline > 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200"
                    >
                      Em Negociação
                    </Badge>
                  ) : clientProducts.length > 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      Cliente Ativo
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-slate-700 border-slate-200"
                    >
                      Lead
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
        {activeClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-xl border border-dashed">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      <AlertDialog
        open={!!clientToDelete}
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Arquivar Cliente
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja arquivar este cliente? Ele não aparecerá mais nas listas
              principais, mas seus produtos e histórico de mensagens serão mantidos no banco de
              dados para relatórios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 rounded-full shadow-elevation sm:hidden z-50 px-6 gap-2"
        onClick={() => setIsNewClientOpen(true)}
      >
        <Plus className="h-5 w-5" />
        Novo Cliente
      </Button>

      <Dialog
        open={isNewClientOpen}
        onOpenChange={(open) => {
          setIsNewClientOpen(open)
          if (!open) {
            setNewClientData({
              name: '',
              email: '',
              phone: '',
              avatar: '',
              pipeline_stage: 'Lead',
              behavioral_profile: '',
              notes: '',
              utm_source: '',
              utm_campaign: '',
              utm_medium: '',
            })
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateClient} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newClientData.name}
                    onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                    placeholder="Ex: João Silva"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    placeholder="joao@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp</Label>
                  <Input
                    id="phone"
                    value={newClientData.phone}
                    onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="avatar">URL do Avatar (Foto de Perfil)</Label>
                  <Input
                    id="avatar"
                    value={newClientData.avatar}
                    onChange={(e) => setNewClientData({ ...newClientData, avatar: e.target.value })}
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="pipeline_stage">Estágio do Funil</Label>
                  <Select
                    value={newClientData.pipeline_stage}
                    onValueChange={(v) => setNewClientData({ ...newClientData, pipeline_stage: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estágio" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="behavioral_profile">Perfil Comportamental (Opcional)</Label>
                  <Textarea
                    id="behavioral_profile"
                    value={newClientData.behavioral_profile}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, behavioral_profile: e.target.value })
                    }
                    placeholder="Resumo do perfil do cliente..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notas Iniciais (Opcional)</Label>
                  <Textarea
                    id="notes"
                    value={newClientData.notes}
                    onChange={(e) => setNewClientData({ ...newClientData, notes: e.target.value })}
                    placeholder="Informações adicionais relevantes..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utm_source">Origem (UTM Source)</Label>
                  <Input
                    id="utm_source"
                    value={newClientData.utm_source}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, utm_source: e.target.value })
                    }
                    placeholder="Ex: instagram"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utm_campaign">Campanha (UTM Campaign)</Label>
                  <Input
                    id="utm_campaign"
                    value={newClientData.utm_campaign}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, utm_campaign: e.target.value })
                    }
                    placeholder="Ex: lancamento_v2"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="utm_medium">Mídia (UTM Medium)</Label>
                  <Input
                    id="utm_medium"
                    value={newClientData.utm_medium}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, utm_medium: e.target.value })
                    }
                    placeholder="Ex: cpc, email, social"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4 mt-2 shrink-0 border-t">
              <Button type="button" variant="outline" onClick={() => setIsNewClientOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating || !newClientData.name.trim()}>
                {isCreating ? 'Salvando...' : 'Salvar Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
