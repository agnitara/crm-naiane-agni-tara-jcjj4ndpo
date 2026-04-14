import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserCircle, Link as LinkIcon, BellRing, Save, Megaphone, Plus, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export default function Settings() {
  const [fbConnected, setFbConnected] = useState(false)
  const [isConnectingFb, setIsConnectingFb] = useState(false)
  const [igConnected, setIgConnected] = useState(true)
  const [waConnected, setWaConnected] = useState(true)

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

  const handleConnectFb = () => {
    setIsConnectingFb(true)
    setTimeout(() => {
      setFbConnected(true)
      setIsConnectingFb(false)
      toast.success('Facebook Messenger conectado via Meta API!')
    }, 1500)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-display font-bold tracking-tight">Configurações</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie sua conta, integrações da plataforma e rastreamento de anúncios.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted/50">
          <TabsTrigger value="profile" className="data-[state=active]:bg-background">
            <UserCircle className="w-4 h-4 mr-2 hidden sm:block" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-background">
            <LinkIcon className="w-4 h-4 mr-2 hidden sm:block" /> Integrações
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-background">
            <Megaphone className="w-4 h-4 mr-2 hidden sm:block" /> Campanhas
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-background">
            <BellRing className="w-4 h-4 mr-2 hidden sm:block" /> Alertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="shadow-subtle border-none">
            <CardHeader>
              <CardTitle className="font-display">Perfil da Mentora</CardTitle>
              <CardDescription>
                Informações públicas exibidas nos contratos e convites.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border">
                  <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=99" />
                  <AvatarFallback>NA</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Mudar Foto
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue="Naiane Agni Tara" className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Profissional</Label>
                  <Input id="email" defaultValue="contato@naianeagni.com" className="bg-muted/30" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Assinatura / Título</Label>
                  <Input
                    id="bio"
                    defaultValue="Mentora e Consultora Estratégica"
                    className="bg-muted/30"
                  />
                </div>
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" /> Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card className="shadow-subtle border-none">
            <CardHeader>
              <CardTitle className="font-display">Integrações Omnichannel</CardTitle>
              <CardDescription>
                Conecte suas contas para unificar a timeline de mensagens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] font-bold text-xl">
                    W
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp Cloud API</p>
                    <p className="text-xs text-muted-foreground">
                      Conectado Oficialmente (Final 9888)
                    </p>
                  </div>
                </div>
                <Switch checked={waConnected} onCheckedChange={setWaConnected} />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center text-white font-bold text-xl">
                    IG
                  </div>
                  <div>
                    <p className="font-medium">Instagram API</p>
                    <p className="text-xs text-muted-foreground">
                      Conectado Oficialmente (@naiane.agni)
                    </p>
                  </div>
                </div>
                <Switch checked={igConnected} onCheckedChange={setIgConnected} />
              </div>

              <div
                className={`flex items-center justify-between p-4 border rounded-lg bg-card transition-all duration-300 ${!fbConnected ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] font-bold text-xl">
                    f
                  </div>
                  <div>
                    <p className="font-medium">Facebook Messenger API</p>
                    <p className="text-xs text-muted-foreground">
                      {fbConnected
                        ? 'Conectado Oficialmente (Página Naiane Agni)'
                        : 'Não configurado'}
                    </p>
                  </div>
                </div>
                {fbConnected ? (
                  <Switch checked={fbConnected} onCheckedChange={setFbConnected} />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleConnectFb}
                    disabled={isConnectingFb}
                  >
                    {isConnectingFb ? 'Conectando...' : 'Conectar'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <Card className="shadow-subtle border-none">
            <CardHeader>
              <CardTitle className="font-display">Rastreamento de Campanhas</CardTitle>
              <CardDescription>
                Cadastre suas campanhas ativas para rastrear a origem dos leads (UTM Campaign).
                Esses dados alimentarão o Dashboard de Canais.
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
