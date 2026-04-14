import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserCircle, Link as LinkIcon, BellRing, Megaphone } from 'lucide-react'
import { ProfileTab } from './settings/ProfileTab'
import { IntegrationsTab } from './settings/IntegrationsTab'
import { CampaignsTab } from './settings/CampaignsTab'
import { Card, CardContent } from '@/components/ui/card'

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-display font-bold tracking-tight">Configurações</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie sua conta, integrações da plataforma e rastreamento de anúncios.
        </p>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
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
          <ProfileTab />
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <CampaignsTab />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="shadow-subtle border-none">
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhuma notificação configurada no momento.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
