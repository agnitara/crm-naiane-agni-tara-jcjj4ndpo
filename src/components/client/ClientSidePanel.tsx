import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ClientProducts } from './ClientProducts'
import { ClientTimeline } from './ClientTimeline'
import { ClientNotesTab } from './ClientNotesTab'
import { ClientSuggestions } from './ClientSuggestions'
import { useCRM } from '@/contexts/CRMContext'
import { supabase } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Calendar as CalIcon, MessageSquare, Package, Tag, Clock, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Interaction } from '@/lib/types'

export function ClientSidePanel({
  clientId,
  isOpen,
  onClose,
}: {
  clientId: string | null
  isOpen: boolean
  onClose: () => void
}) {
  const { clients, products, events } = useCRM()
  const client = clients.find((c) => c.id === clientId)

  const [messages, setMessages] = useState<Interaction[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [activeTab, setActiveTab] = useState('chat')
  const [newMessage, setNewMessage] = useState('')
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (isOpen && clientId && activeTab === 'chat' && isFirstLoad.current) {
      isFirstLoad.current = false
      fetchMessages(0, true)
    }
  }, [isOpen, clientId, activeTab])

  useEffect(() => {
    if (!isOpen) {
      isFirstLoad.current = true
      setMessages([])
      setPage(0)
      setHasMore(true)
      setActiveTab('chat')
    }
  }, [isOpen])

  useEffect(() => {
    if (!clientId || !isOpen) return
    const channel = supabase
      .channel(`messages-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const m = payload.new
          const newInteraction: Interaction = {
            id: m.id,
            clientId: m.client_id,
            platform: m.platform as any,
            type: m.audio_url ? 'audio' : 'text',
            content: m.content || m.audio_url || '',
            transcription: m.transcription || undefined,
            timestamp: m.created_at,
            direction: m.direction as any,
          }
          setMessages((prev) => [newInteraction, ...prev])
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const m = payload.new
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === m.id ? { ...msg, transcription: m.transcription || undefined } : msg,
            ),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId, isOpen])

  const fetchMessages = async (pageIndex: number, reset = false) => {
    if (!clientId) return
    setLoadingMessages(true)
    try {
      const limit = 20
      const dateLimit = new Date()
      dateLimit.setDate(dateLimit.getDate() - 120)

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('client_id', clientId)
        .gte('created_at', dateLimit.toISOString())
        .order('created_at', { ascending: false })
        .range(pageIndex * limit, pageIndex * limit + limit - 1)

      if (error) throw error

      const mapped: Interaction[] = data.map((m) => ({
        id: m.id,
        clientId: m.client_id,
        platform: m.platform as any,
        type: m.audio_url ? 'audio' : 'text',
        content: m.content || m.audio_url || '',
        transcription: m.transcription || undefined,
        timestamp: m.created_at,
        direction: m.direction as any,
      }))

      if (mapped.length < limit) setHasMore(false)
      if (reset) setMessages(mapped)
      else setMessages((prev) => [...prev, ...mapped])
      setPage(pageIndex)
    } catch (err) {
      toast.error('Erro ao carregar histórico')
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleToggleOptOut = async () => {
    if (!client) return
    const newValue = !client.opt_out
    try {
      await supabase
        .from('clients')
        .update({ opt_out: newValue } as any)
        .eq('id', client.id)
      toast.success(
        newValue ? 'Cliente adicionado à lista negra' : 'Cliente removido da lista negra',
      )
    } catch (e) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = typeof textToSend === 'string' ? textToSend : newMessage
    if (!text.trim() || !clientId) return
    try {
      await supabase
        .from('messages')
        .insert({ client_id: clientId, platform: 'system', direction: 'outbound', content: text })
      if (typeof textToSend !== 'string') setNewMessage('')
    } catch (e) {
      toast.error('Erro ao enviar mensagem')
    }
  }

  if (!client)
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md">
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Cliente não encontrado.</p>
          </div>
        </SheetContent>
      </Sheet>
    )

  const clientProducts = products.filter((p) => p.clientId === clientId)
  const clientEvents = events
    .filter((e) => e.clientId === clientId && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg md:max-w-2xl flex flex-col p-0 bg-background border-l shadow-2xl overflow-hidden">
        <SheetHeader className="p-4 sm:p-6 border-b shrink-0 bg-card">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border shadow-sm">
              <AvatarImage src={client.avatar} />
              <AvatarFallback>{client.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-xl font-bold leading-tight">{client.name}</SheetTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  {client.pipeline_stage}
                </Badge>
                {client.utm_source && (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Origem: {client.utm_source}
                  </Badge>
                )}
                {client.opt_out && (
                  <Badge variant="destructive" className="text-[10px]">
                    <ShieldAlert className="w-3 h-3 mr-1" />
                    Lista Negra
                  </Badge>
                )}
                <div className="flex items-center gap-1.5 ml-auto pl-2 border-l">
                  <Switch
                    checked={client.opt_out || false}
                    onCheckedChange={handleToggleOptOut}
                    id="opt-out"
                    className="scale-75"
                  />
                  <Label htmlFor="opt-out" className="text-xs text-muted-foreground cursor-pointer">
                    Opt-out
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="px-4 sm:px-6 border-b bg-card shrink-0">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-4 sm:gap-6 rounded-none">
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-xs sm:text-sm font-medium"
              >
                <MessageSquare className="h-4 w-4 mr-2 hidden sm:block" /> Chat
              </TabsTrigger>
              <TabsTrigger
                value="produtos"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-xs sm:text-sm font-medium"
              >
                <Package className="h-4 w-4 mr-2 hidden sm:block" /> Produtos
              </TabsTrigger>
              <TabsTrigger
                value="agendamentos"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-xs sm:text-sm font-medium"
              >
                <CalIcon className="h-4 w-4 mr-2 hidden sm:block" /> Agenda
              </TabsTrigger>
              <TabsTrigger
                value="notas"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-xs sm:text-sm font-medium"
              >
                <Tag className="h-4 w-4 mr-2 hidden sm:block" /> Notas
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="chat" className="m-0 h-full flex flex-col">
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
                {hasMore && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mx-auto"
                    onClick={() => fetchMessages(page + 1)}
                    disabled={loadingMessages}
                  >
                    {loadingMessages ? 'Carregando...' : 'Carregar mais antigas'}
                  </Button>
                )}
                <ClientTimeline
                  interactions={messages}
                  clientAvatar={client.avatar}
                  clientName={client.name}
                  onReply={handleSendMessage}
                />
              </div>
              <ClientSuggestions clientId={client.id} onSendReply={handleSendMessage} />
              <div className="p-4 border-t bg-card shrink-0 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={() => handleSendMessage()}>Enviar</Button>
              </div>
            </TabsContent>

            <TabsContent value="produtos" className="m-0 p-4 sm:p-6">
              <ClientProducts products={clientProducts} clientId={client.id} />
            </TabsContent>

            <TabsContent value="agendamentos" className="m-0 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Próximos Compromissos</h3>
                <Button size="sm" asChild>
                  <Link to="/calendario">
                    <CalIcon className="h-4 w-4 mr-2" /> Agendar
                  </Link>
                </Button>
              </div>
              {clientEvents.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                  Nenhum agendamento futuro.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex gap-4 p-3 rounded-lg border bg-card items-start"
                    >
                      <div className="bg-primary/10 text-primary p-2 rounded-md flex flex-col items-center justify-center min-w-[3.5rem]">
                        <span className="text-[10px] font-semibold uppercase">
                          {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold mt-1">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(event.date).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notas" className="m-0 p-4 sm:p-6">
              <ClientNotesTab
                clientId={client.id}
                initialTags={client.sentiment_tags || []}
                initialNotes={client.notes || ''}
              />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
