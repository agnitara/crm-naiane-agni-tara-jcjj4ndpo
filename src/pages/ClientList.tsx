import { useState } from 'react'
import { useCRM } from '@/contexts/CRMContext'
import { Link } from 'react-router-dom'
import { Search, MoreVertical, ShieldAlert, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  const [search, setSearch] = useState('')
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)

  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
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
    if (!newClientName.trim()) return

    try {
      setIsCreating(true)
      const newClient = await createClient({
        name: newClientName,
        email: newClientEmail,
        phone: newClientPhone,
      })
      toast.success('Cliente criado com sucesso!')
      setIsNewClientOpen(false)
      // Small delay to allow the user to see the success before redirect
      setTimeout(() => {
        window.location.href = `/clientes/${newClient.id}`
      }, 500)
    } catch (error) {
      toast.error('Erro ao criar cliente')
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
                  <div>
                    <button
                      onClick={() => openClientPanel(client.id)}
                      className="font-semibold hover:text-primary transition-colors block text-left"
                    >
                      {client.name}
                    </button>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {client.email}
                    </p>
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

      <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateClient}>
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ex: João Silva"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="joao@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewClientOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating || !newClientName.trim()}>
                {isCreating ? 'Salvando...' : 'Salvar Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
