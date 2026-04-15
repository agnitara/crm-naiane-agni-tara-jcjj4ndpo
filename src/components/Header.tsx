import { Bell, Search, Plus, LogOut, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const routeNames: Record<string, string> = {
  '/dashboard': 'Dashboard Estratégico',
  '/clientes': 'Gestão de Clientes',
  '/produtos': 'Pipeline de Produtos',
  '/calendario': 'Agenda & Sincronização',
  '/configuracoes': 'Configurações da Conta',
}

export function Header() {
  const location = useLocation()
  const title = routeNames[location.pathname] || 'Detalhes do Cliente'
  const { signOut, user } = useAuth()
  const { notifications, unreadCount, markAllAsRead, openClientPanel } = useNotifications()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 shadow-sm sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center gap-4 md:gap-8">
        <h1 className="text-lg font-semibold tracking-tight hidden md:block">{title}</h1>
        <div className="flex-1 md:ml-auto md:max-w-md relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes, produtos ou mensagens..."
            className="w-full bg-muted/50 pl-9 border-none focus-visible:ring-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-3 py-2">
                <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                  >
                    <Check className="mr-1 h-3 w-3" /> Marcar lidas
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Nenhuma notificação recente.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!n.read ? 'bg-muted/50' : ''}`}
                      onClick={() => openClientPanel(n.clientId)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-sm ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}
                        >
                          {n.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {n.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2 w-full whitespace-normal">
                        {n.body}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="hidden sm:flex gap-2 rounded-full shadow-elevation">
            <Plus className="h-4 w-4" />
            <span>Novo Registro</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors">
                <AvatarImage
                  src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=99"
                  alt={user?.email || 'Usuário'}
                />
                <AvatarFallback>
                  {user?.email?.substring(0, 2).toUpperCase() || 'NA'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-muted-foreground truncate" disabled>
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair do sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
