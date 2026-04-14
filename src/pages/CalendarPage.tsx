import { useCRM } from '@/contexts/CRMContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import {
  CalendarDays,
  RefreshCw,
  Video,
  Plus,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  checkGoogleConnection,
  getGoogleAuthUrl,
  exchangeGoogleCode,
  syncFromGoogle,
} from '@/services/calendar'
import { EventDialog } from '@/components/calendar/EventDialog'

export default function CalendarPage() {
  const { events, clients, refreshEvents } = useCRM()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [searchParams, setSearchParams] = useSearchParams()
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)

  useEffect(() => {
    const checkConn = async () => {
      try {
        const { connected } = await checkGoogleConnection()
        setIsConnected(connected)
      } catch (e) {
        console.error('Error checking google conn', e)
      } finally {
        setIsChecking(false)
      }
    }
    checkConn()
  }, [])

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      const exchange = async () => {
        setIsChecking(true)
        try {
          await exchangeGoogleCode(code, window.location.origin + '/calendario')
          toast.success('Google Calendar conectado com sucesso!')
          setIsConnected(true)
          setSearchParams({})
          handleSync()
        } catch (e: any) {
          toast.error('Erro ao conectar Google Calendar: ' + e.message)
        } finally {
          setIsChecking(false)
        }
      }
      exchange()
    }
  }, [searchParams])

  // Polling every 5 minutes
  useEffect(() => {
    if (!isConnected) return
    const interval = setInterval(
      () => {
        handleSync(true)
      },
      5 * 60 * 1000,
    )
    return () => clearInterval(interval)
  }, [isConnected])

  const handleConnect = async () => {
    try {
      const url = await getGoogleAuthUrl()
      window.location.href = url
    } catch (e: any) {
      toast.error('Erro ao gerar link de autenticação')
    }
  }

  const handleSync = async (silent = false) => {
    if (!silent) setIsSyncing(true)
    try {
      await syncFromGoogle()
      await refreshEvents()
      if (!silent) toast.success('Calendário sincronizado!')
    } catch (e: any) {
      if (!silent) {
        if (e.message.includes('Failed to refresh token')) {
          toast.error('Autenticação expirada. Reconecte sua conta do Google.')
          setIsConnected(false)
        } else {
          toast.error('Erro ao sincronizar: ' + e.message)
        }
      }
    } finally {
      if (!silent) setIsSyncing(false)
    }
  }

  const selectedDayEvents = events
    .filter((e) => {
      if (!date) return false
      const eDate = new Date(e.date)
      return (
        eDate.getDate() === date.getDate() &&
        eDate.getMonth() === date.getMonth() &&
        eDate.getFullYear() === date.getFullYear()
      )
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Check upcoming notifications (15 mins before)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      events.forEach((e) => {
        const eTime = new Date(e.date).getTime()
        const diff = eTime - now
        if (diff > 0 && diff <= 15 * 60 * 1000 && !e.notified) {
          toast.info(`O evento "${e.title}" começa em breve!`, {
            icon: <AlertCircle className="h-4 w-4 text-blue-500" />,
          })
          e.notified = true // Local mutate to prevent spam
        }
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [events])

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Agenda</h2>
          {isChecking ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              Verificando conexão...
            </p>
          ) : isConnected ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              Sincronizado com Google Calendar
            </p>
          ) : (
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-orange-500"></span>
              Google Calendar não conectado
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isChecking && !isConnected && (
            <Button variant="default" className="gap-2" onClick={handleConnect}>
              <LinkIcon className="h-4 w-4" />
              Conectar Google
            </Button>
          )}
          {isConnected && (
            <>
              <Button
                variant="outline"
                className="gap-2 bg-background"
                onClick={() => handleSync()}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
              <Button onClick={() => setIsEventDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Evento
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-7 gap-6">
        <Card className="md:col-span-3 lg:col-span-3 shadow-subtle border-none h-fit">
          <CardContent className="p-4 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d: Date | undefined) => d && setDate(d)}
              className="rounded-md"
              modifiers={{ hasEvent: events.map((e) => new Date(e.date)) }}
              modifiersStyles={{
                hasEvent: { fontWeight: 'bold', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-4 lg:col-span-4 shadow-subtle border-none bg-muted/10">
          <CardHeader className="pb-3 border-b bg-card rounded-t-xl">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Compromissos do Dia {date ? date.toLocaleDateString('pt-BR') : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event) => {
                  const client = clients.find((c) => c.id === event.clientId)
                  return (
                    <div
                      key={event.id}
                      className="p-4 hover:bg-card transition-colors flex gap-4 items-start"
                    >
                      <div className="text-center w-16 shrink-0 pt-1">
                        <span className="text-lg font-bold font-display text-primary block leading-none">
                          {new Date(event.date).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase mt-1 block">
                          {event.endDate
                            ? new Date(event.endDate).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'BRT'}
                        </span>
                      </div>

                      <div className="flex-1 bg-card border rounded-lg p-3 shadow-sm border-l-4 border-l-primary relative">
                        {event.syncStatus === 'pending' && (
                          <div className="absolute top-2 right-2 text-[10px] text-orange-500 flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-full">
                            <RefreshCw className="h-3 w-3 animate-spin" /> Sync pendente
                          </div>
                        )}
                        {event.syncStatus === 'failed' && (
                          <div className="absolute top-2 right-2 text-[10px] text-destructive flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full">
                            <AlertCircle className="h-3 w-3" /> Falha no sync
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-2 pr-24">
                          <h4 className="font-semibold text-sm">{event.title}</h4>
                        </div>
                        {client && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></span>
                            <span>
                              Cliente: <strong>{client.name}</strong>
                            </span>
                          </div>
                        )}
                        {event.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-3">
                            {event.description}
                          </p>
                        )}
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-primary text-primary-foreground gap-1.5"
                          >
                            <Video className="h-3 w-3" /> Iniciar Sala
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <CalendarDays className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p>Nenhum compromisso agendado para este dia.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <EventDialog
        isOpen={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        onSuccess={() => {
          setIsEventDialogOpen(false)
          handleSync(true)
        }}
      />
    </div>
  )
}
