import { Bell, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLocation } from 'react-router-dom'

const routeNames: Record<string, string> = {
  '/': 'Dashboard Estratégico',
  '/clientes': 'Gestão de Clientes',
  '/produtos': 'Pipeline de Produtos',
  '/calendario': 'Agenda & Sincronização',
  '/configuracoes': 'Configurações da Conta',
}

export function Header() {
  const location = useLocation()
  const title = routeNames[location.pathname] || 'Detalhes do Cliente'

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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-destructive"></span>
          </Button>
          <Button className="hidden sm:flex gap-2 rounded-full shadow-elevation">
            <Plus className="h-4 w-4" />
            <span>Novo Registro</span>
          </Button>
          <Avatar className="h-9 w-9 border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors">
            <AvatarImage
              src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=99"
              alt="Naiane"
            />
            <AvatarFallback>NA</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
