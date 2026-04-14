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
import { differenceInDays } from 'date-fns'

const COLORS = {
  Instagram: '#E1306C',
  Facebook: '#1877F2',
  WhatsApp: '#25D366',
  Outros: '#94a3b8',
}

type TimeFilter = 'all' | 'today' | 'week' | 'month'

export function ChannelMetrics() {
  const [data, setData] = useState<{ platform: string; leads: number; fill: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TimeFilter>('all')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const { data: messages } = await supabase
          .from('messages')
          .select('client_id, platform')
          .order('created_at', { ascending: true })

        const { data: clients } = await supabase.from('clients').select('id, created_at')

        if (messages && clients) {
          const clientPlatforms = new Map<string, string>()

          messages.forEach((m) => {
            if (!clientPlatforms.has(m.client_id)) {
              clientPlatforms.set(m.client_id, m.platform)
            }
          })

          let instagram = 0
          let facebook = 0
          let whatsapp = 0
          let outros = 0

          const now = new Date()

          clients.forEach((c) => {
            const createdAt = new Date(c.created_at)
            const daysDiff = differenceInDays(now, createdAt)

            if (filter === 'today' && daysDiff > 0) return
            if (filter === 'week' && daysDiff > 7) return
            if (filter === 'month' && daysDiff > 30) return

            const platform = clientPlatforms.get(c.id)
            if (platform === 'instagram') instagram++
            else if (platform === 'facebook') facebook++
            else if (platform === 'whatsapp') whatsapp++
            else outros++
          })

          setData(
            [
              { platform: 'Instagram', leads: instagram, fill: COLORS.Instagram },
              { platform: 'Facebook', leads: facebook, fill: COLORS.Facebook },
              { platform: 'WhatsApp', leads: whatsapp, fill: COLORS.WhatsApp },
              { platform: 'Outros', leads: outros, fill: COLORS.Outros },
            ].filter((item) => item.leads > 0),
          )
        }
      } catch (error) {
        console.error('Error fetching channel metrics', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filter])

  const chartConfig = {
    leads: { label: 'Leads' },
    Instagram: { label: 'Instagram', color: COLORS.Instagram },
    Facebook: { label: 'Facebook', color: COLORS.Facebook },
    WhatsApp: { label: 'WhatsApp', color: COLORS.WhatsApp },
    Outros: { label: 'Outros', color: COLORS.Outros },
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex justify-end">
        <Select value={filter} onValueChange={(val: TimeFilter) => setFilter(val)}>
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o período</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Leads</CardTitle>
          <CardDescription>Origem dos clientes por canal de comunicação</CardDescription>
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
                  dataKey="leads"
                  nameKey="platform"
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
            <Card key={item.platform} className="shadow-sm border-border/50">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.platform}
                </div>
                <div className="text-2xl font-bold font-display">{item.leads}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
