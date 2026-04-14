import { useCRM } from '@/contexts/CRMContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  DollarSign,
  MessageCircle,
  Calendar as CalendarIcon,
  ArrowRight,
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Platform } from '@/lib/types'

const platformColors: Record<Platform, string> = {
  whatsapp: 'bg-[#25D366]/10 text-[#25D366]',
  instagram: 'bg-[#E4405F]/10 text-[#E4405F]',
  facebook: 'bg-[#1877F2]/10 text-[#1877F2]',
  system: 'bg-muted text-muted-foreground',
}

export default function Index() {
  const { clients, products, interactions, events } = useCRM()

  const activeClients = clients.filter((c) => c.status === 'active').length
  const pipelineValue = products
    .filter((p) => p.stage === 'Proposta' || p.stage === 'Negociação')
    .reduce((acc, curr) => acc + curr.value, 0)

  const recentMessages = interactions
    .filter((i) => i.direction === 'inbound')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4)

  const upcomingMeetings = events
    .filter((e) => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  // Prepare data for funnel chart
  const stages = ['Interesse', 'Proposta', 'Negociação', 'Fechado', 'Upsell']
  const chartData = stages.map((stage) => ({
    stage,
    count: products.filter((p) => p.stage === stage).length,
  }))

  const chartConfig = {
    count: {
      label: 'Produtos',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-subtle border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes Ativos
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{activeClients}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 desde o último mês</p>
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline Atual
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                pipelineValue,
              )}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Em Negociação & Proposta</p>
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mensagens Pendentes
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">12</div>
            <p className="text-xs text-muted-foreground mt-1">Em 3 plataformas diferentes</p>
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reuniões (Próx. 24h)
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{upcomingMeetings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Sincronizado via Google Calendar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Funnel Chart */}
        <Card className="lg:col-span-4 shadow-subtle border-none">
          <CardHeader>
            <CardTitle className="font-display">Funil de Produtos</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="stage"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  className="text-sm font-medium"
                />
                <ChartTooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.stage === 'Fechado' ? 'hsl(var(--secondary))' : 'hsl(var(--primary))'
                      }
                      fillOpacity={0.8 + index * 0.05}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Interactions */}
        <Card className="lg:col-span-3 shadow-subtle border-none overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Interações Recentes</CardTitle>
            <Link
              to="/clientes"
              className="text-sm text-primary font-medium hover:underline flex items-center"
            >
              Ver todas <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-6">
              {recentMessages.map((msg) => {
                const client = clients.find((c) => c.id === msg.clientId)
                if (!client) return null
                return (
                  <div key={msg.id} className="flex items-start gap-4 group">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={client.avatar} />
                      <AvatarFallback>{client.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{client.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(msg.timestamp))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 rounded-sm font-semibold capitalize ${platformColors[msg.platform]}`}
                        >
                          {msg.platform}
                        </Badge>
                        <p className="text-sm text-muted-foreground truncate flex-1">
                          {msg.type === 'audio' ? '🎵 Mensagem de áudio' : msg.content}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/clientes/${client.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
