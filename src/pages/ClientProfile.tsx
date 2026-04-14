import { useParams, useNavigate } from 'react-router-dom'
import { useCRM } from '@/contexts/CRMContext'
import { mockDocuments } from '@/lib/mock-data' // importing directly as it's static for now
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Phone, Mail, MapPin, Calendar, Clock, Send, Mic, PlusCircle } from 'lucide-react'
import { ClientTimeline } from '@/components/client/ClientTimeline'
import { ClientProducts } from '@/components/client/ClientProducts'

export default function ClientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, interactions, products } = useCRM()

  const client = clients.find((c) => c.id === id)

  if (!client) {
    return (
      <div className="p-8 text-center">
        Cliente não encontrado.{' '}
        <Button variant="link" onClick={() => navigate('/clientes')}>
          Voltar
        </Button>
      </div>
    )
  }

  const clientInteractions = interactions.filter((i) => i.clientId === client.id)
  const clientProducts = products.filter((p) => p.clientId === client.id)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 animate-fade-in">
      {/* Col 1: Client Info (Fixed on Desktop) */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 overflow-y-auto hidden-scrollbar pb-6">
        <Card className="shadow-subtle border-none bg-gradient-to-b from-card to-muted/20">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md mb-4">
              <AvatarImage src={client.avatar} />
              <AvatarFallback className="text-2xl">{client.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-display font-bold">{client.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">ID: {client.id.toUpperCase()}</p>

            <div className="w-full space-y-3 mt-2 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground bg-background p-2.5 rounded-lg border border-border/50">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{client.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground bg-background p-2.5 rounded-lg border border-border/50">
                <Mail className="h-4 w-4 text-primary" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground bg-background p-2.5 rounded-lg border border-border/50">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Cliente desde {new Date(client.createdAt).getFullYear()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-none flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display flex items-center justify-between">
              Anotações Fixadas
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <PlusCircle className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg italic border-l-2 border-primary">
              {client.notes || 'Nenhuma anotação estratégica registrada ainda.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Col 2: Omnichannel Timeline (Main flex) */}
      <Card className="flex-1 flex flex-col shadow-subtle border-none overflow-hidden h-full">
        <CardHeader className="border-b py-4 bg-card z-10 shadow-sm flex flex-row items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Linha do Tempo Omnichannel
          </CardTitle>
          <div className="flex gap-1">{/* Filter buttons could go here */}</div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8fafc] dark:bg-black/20">
          <ClientTimeline
            interactions={clientInteractions}
            clientAvatar={client.avatar}
            clientName={client.name}
          />
        </CardContent>

        <div className="p-4 bg-card border-t mt-auto">
          <div className="flex items-end gap-2 relative">
            <Input
              placeholder="Digite uma mensagem..."
              className="pr-24 bg-muted/50 border-none shadow-inner focus-visible:ring-1 resize-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-8 w-8 rounded-full shadow-sm">
                <Send className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Col 3: Products & Pipeline (Mobile uses Tabs, Desktop is 3rd col) */}
      <div className="w-full lg:w-[300px] xl:w-[350px] shrink-0 h-full flex flex-col">
        <Tabs defaultValue="products" className="h-full flex flex-col">
          <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1">
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Produtos
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="lg:hidden data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Info
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="products"
            className="flex-1 overflow-y-auto p-1 mt-4 hidden-scrollbar border-none"
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-semibold font-display text-sm uppercase tracking-wider text-muted-foreground">
                Pipeline do Cliente
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <ClientProducts products={clientProducts} documents={mockDocuments} />
          </TabsContent>

          <TabsContent value="info" className="flex-1 overflow-y-auto mt-4 lg:hidden">
            {/* Duplicate info block for mobile tab view to keep DOM simple, normally abstracted */}
            <Card className="shadow-none border bg-card">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={client.avatar} />
                </Avatar>
                <h2 className="text-xl font-bold">{client.name}</h2>
                <div className="w-full space-y-2 mt-4 text-sm text-left">
                  <p>
                    <strong>Telefone:</strong> {client.phone}
                  </p>
                  <p>
                    <strong>Email:</strong> {client.email}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
