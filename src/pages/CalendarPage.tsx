import { useCRM } from '@/contexts/CRMContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, RefreshCw, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function CalendarPage() {
  const { events, clients } = useCRM()
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Simple mock filter for selected day events
  const selectedDayEvents = events.filter((e) => {
    if (!date) return false
    const eDate = new Date(e.date)
    return eDate.getDate() === date.getDate() && eDate.getMonth() === date.getMonth()
  })

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Agenda</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            Sincronizado com Google Calendar há 5 min
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-background">
          <RefreshCw className="h-4 w-4" />
          Sincronizar Agora
        </Button>
      </div>

      <div className="grid md:grid-cols-7 gap-6">
        <Card className="md:col-span-3 lg:col-span-3 shadow-subtle border-none h-fit">
          <CardContent className="p-4 flex justify-center">
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
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
            <div className="divide-y divide-border/50">
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
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">
                          BRT
                        </span>
                      </div>

                      <div className="flex-1 bg-card border rounded-lg p-3 shadow-sm border-l-4 border-l-primary">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm">{event.title}</h4>
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-blue-50 text-blue-700"
                          >
                            Videochamada
                          </Badge>
                        </div>
                        {client && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></span>
                            <span>
                              Cliente: <strong>{client.name}</strong>
                            </span>
                          </div>
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
    </div>
  )
}
