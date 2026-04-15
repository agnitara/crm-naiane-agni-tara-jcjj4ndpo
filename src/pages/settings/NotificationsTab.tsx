import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotifications } from '@/contexts/NotificationContext'

export function NotificationsTab() {
  const { settings, updateSettings, requestBrowserPermission } = useNotifications()

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
          <CardDescription>
            Gerencie como e quando você deseja ser alertado sobre novas atividades.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base cursor-pointer" htmlFor="sound-toggle">
                Som de Notificação
              </Label>
              <p className="text-sm text-muted-foreground">
                Toca um som discreto ao receber novas mensagens ou sugestões.
              </p>
            </div>
            <Switch
              id="sound-toggle"
              checked={settings.soundEnabled}
              onCheckedChange={(v) => updateSettings({ soundEnabled: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base cursor-pointer" htmlFor="browser-toggle">
                Notificações no Navegador
              </Label>
              <p className="text-sm text-muted-foreground">
                Receba alertas visuais no seu sistema operacional mesmo quando estiver em outra aba.
              </p>
            </div>
            <Switch
              id="browser-toggle"
              checked={settings.browserEnabled}
              onCheckedChange={(v) => {
                if (v) requestBrowserPermission()
                updateSettings({ browserEnabled: v })
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
