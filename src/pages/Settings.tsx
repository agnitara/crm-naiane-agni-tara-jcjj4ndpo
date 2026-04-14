import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserCircle, Link as LinkIcon, BellRing, Save } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { toast } from 'sonner'

export default function Settings() {
  const [fbConnected, setFbConnected] = useState(false)
  const [isConnectingFb, setIsConnectingFb] = useState(false)
  const [igConnected, setIgConnected] = useState(true)
  const [waConnected, setWaConnected] = useState(true)

  const handleConnectFb = () => {
    setIsConnectingFb(true)
    // Simula o fluxo de conexão OAuth com a API da Meta
    setTimeout(() => {
      setFbConnected(true)
      setIsConnectingFb(false)
      toast.success('Facebook Messenger conectado via Meta API!')
    }, 1500)
  }
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-display font-bold tracking-tight">Configurações</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie sua conta e integrações da plataforma.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50">
          <TabsTrigger value="profile" className="data-[state=active]:bg-background">
            <UserCircle className="w-4 h-4 mr-2 hidden sm:block" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-background">
            <LinkIcon className="w-4 h-4 mr-2 hidden sm:block" /> Integrações
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

          <Card className="shadow-subtle border-none mt-6">
            <CardHeader>
              <CardTitle className="font-display">Integrações de Ferramentas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div>
                  <p className="font-medium">Google Calendar</p>
                  <p className="text-xs text-muted-foreground">Sincroniza reuniões e deadlines</p>
                </div>
                <Badge className="bg-emerald-500 hover:bg-emerald-600">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div>
                  <p className="font-medium">OpenAI Whisper (Áudio)</p>
                  <p className="text-xs text-muted-foreground">
                    Transcreve áudios do WhatsApp automaticamente
                  </p>
                </div>
                <Badge className="bg-emerald-500 hover:bg-emerald-600">Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
