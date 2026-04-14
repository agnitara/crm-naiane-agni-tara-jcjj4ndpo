import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [newCampaignName, setNewCampaignName] = useState('')
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true)
    try {
      const { data, error } = await supabase
        .from('campaigns' as any)
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setCampaigns(data)
      }
    } catch (e) {
      console.error(e)
    }
    setLoadingCampaigns(false)
  }

  const handleAddCampaign = async () => {
    if (!newCampaignName.trim()) return
    try {
      const { data, error } = await supabase
        .from('campaigns' as any)
        .insert({ name: newCampaignName, status: 'active' })
        .select()
        .single()

      if (!error && data) {
        setCampaigns([data, ...campaigns])
        setNewCampaignName('')
        toast.success('Campanha adicionada com sucesso!')
      } else {
        toast.error('Erro ao adicionar campanha.')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteCampaign = async (id: string) => {
    try {
      await supabase
        .from('campaigns' as any)
        .delete()
        .eq('id', id)
      setCampaigns(campaigns.filter((c) => c.id !== id))
      toast.success('Campanha removida!')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Card className="shadow-subtle border-none">
      <CardHeader>
        <CardTitle className="font-display">Rastreamento de Campanhas</CardTitle>
        <CardDescription>
          Cadastre suas campanhas ativas para rastrear a origem dos leads (UTM Campaign). Esses
          dados alimentarão o Dashboard de Canais e a integração com a Meta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Nome da nova campanha (ex: Lançamento Maio)"
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              className="bg-muted/30"
            />
          </div>
          <Button onClick={handleAddCampaign} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>

        <div className="space-y-3 mt-6">
          <h3 className="text-sm font-medium text-muted-foreground">Campanhas Ativas</h3>
          {loadingCampaigns ? (
            <div className="text-sm text-muted-foreground animate-pulse">Carregando...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
              Nenhuma campanha cadastrada.
            </div>
          ) : (
            <div className="grid gap-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-sm">{campaign.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
