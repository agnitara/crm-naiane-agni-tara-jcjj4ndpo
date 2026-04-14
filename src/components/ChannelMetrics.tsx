import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Pie, PieChart, Cell, Legend } from 'recharts'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { differenceInDays } from 'date-fns'

const CHANNEL_COLORS = {
  Instagram: '#E1306C',
  Facebook: '#1877F2',
  WhatsApp: '#25D366',
  Outros: '#94a3b8',
}

const CAMPAIGN_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f43f5e',
  '#64748b',
]

type TimeFilter = 'all' | 'today' | 'week' | 'month'
type ViewDimension = 'channel' | 'campaign'

export function ChannelMetrics() {
  const [data, setData] = useState<{ label: string; count: number; fill: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [dimension, setDimension] = useState<ViewDimension>('channel')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const { data: messages } = await supabase
          .from('messages')
          .select('client_id, platform')
          .order('created_at', { ascending: true })

        // Buscando clients, usando "any" para evitar erros de tipagem com a nova coluna utm_campaign
        const { data: clientsData } = await supabase.from('clients').select('*')
        const clients = (clientsData || []) as any[]

        if (messages && clients) {
          const clientPlatforms = new Map<string, string>()
          messages.forEach((m) => {
            if (!clientPlatforms.has(m.client_id)) {
              clientPlatforms.set(m.client_id, m.platform)
            }
          })

          const now = new Date()

          // Filter clients by time
          const filteredClients = clients.filter((c) => {
            const createdAt = new Date(c.created_at)
            const daysDiff = differenceInDays(now, createdAt)
            if (timeFilter === 'today' && daysDiff > 0) return false
            if (timeFilter === 'week' && daysDiff > 7) return false
            if (timeFilter === 'month' && daysDiff > 30) return false
            return true
          })

          if (dimension === 'channel') {
            let instagram = 0,
              facebook = 0,
              whatsapp = 0,
              outros = 0
            filteredClients.forEach((c) => {
              const platform = clientPlatforms.get(c.id)
              if (platform === 'instagram') instagram++
              else if (platform === 'facebook') facebook++
              else if (platform === 'whatsapp') whatsapp++
              else outros++
            })

            setData(
              [
                { label: 'Instagram', count: instagram, fill: CHANNEL_COLORS.Instagram },
                { label: 'Facebook', count: facebook, fill: CHANNEL_COLORS.Facebook },
                { label: 'WhatsApp', count: whatsapp, fill: CHANNEL_COLORS.WhatsApp },
                { label: 'Outros', count: outros, fill: CHANNEL_COLORS.Outros },
              ].filter((item) => item.count > 0),
            )
          } else {
            // Campaing dimension
            const campaignCounts = new Map<string, number>()
            filteredClients.forEach((c) => {
              const camp = c.utm_campaign || 'Orgânico'
              campaignCounts.set(camp, (campaignCounts.get(camp) || 0) + 1)
            })

            const sortedCampaigns = Array.from(campaignCounts.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([label, count], index) => ({
                label,
                count,
                fill: CAMPAIGN_COLORS[index % CAMPAIGN_COLORS.length],
              }))

            setData(sortedCampaigns)
          }
        }
      } catch (error) {
        console.error('Error fetching metrics', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeFilter, dimension])

  const chartConfig = {
    count: { label: 'Leads' },
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-1 bg-muted/50 p-1 rounded-md">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 text-xs px-3',
              dimension === 'channel' && 'bg-background shadow-sm hover:bg-background',
            )}
            onClick={() => setDimension('channel')}
          >
            Por Canal
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 text-xs px-3',
              dimension === 'campaign' && 'bg-background shadow-sm hover:bg-background',
            )}
            onClick={() => setDimension('campaign')}
          >
            Por Campanha
          </Button>
        </div>

        <Select value={timeFilter} onValueChange={(val: TimeFilter) => setTimeFilter(val)}>
          <SelectTrigger className="w-[150px] h-9 bg-background text-xs">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo período</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">
            {dimension === 'channel' ? 'Distribuição por Canal' : 'Performance de Campanhas'}
          </CardTitle>
          <CardDescription>
            {dimension === 'channel'
              ? 'Origem dos clientes por plataforma de comunicação'
              : 'Rastreamento de leads por origem de anúncios (UTM)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-xl">
              Nenhum lead encontrado neste período
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={60}
                  strokeWidth={2}
                  stroke="var(--background)"
                  paddingAngle={5}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {!loading && data.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {data.map((item) => (
            <Card key={item.label} className="shadow-sm border-border/50">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-2 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="text-2xl font-bold font-display">{item.count}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
