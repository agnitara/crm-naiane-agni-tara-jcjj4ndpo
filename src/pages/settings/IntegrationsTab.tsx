import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

export function IntegrationsTab() {
  const [fbConnected, setFbConnected] = useState(false)
  const [isConnectingFb, setIsConnectingFb] = useState(false)
  const [igConnected, setIgConnected] = useState(true)
  const [waConnected, setWaConnected] = useState(true)

  const WEBHOOK_URL = 'https://lsvmdgjznmwavfmhqykp.supabase.co/functions/v1/meta-webhook'
  const VERIFY_TOKEN = 'crm_omnichannel_token'

  const handleConnectFb = () => {
    setIsConnectingFb(true)
    setTimeout(() => {
      setFbConnected(true)
      setIsConnectingFb(false)
      toast.success('Facebook Messenger conectado via Meta API!')
    }, 1500)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para a área de transferência')
  }

  return (
    <div className="space-y-6">
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
                <p className="text-xs text-muted-foreground">Conectado Oficialmente (Final 9888)</p>
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
                  {fbConnected ? 'Conectado Oficialmente (Página Naiane Agni)' : 'Não configurado'}
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

      <Card className="shadow-subtle border-none">
        <CardHeader>
          <CardTitle className="font-display">Guia de Configuração Meta (Webhooks)</CardTitle>
          <CardDescription>
            Siga estes passos no painel de desenvolvedor da Meta para ativar o recebimento de leads
            dos anúncios sem duplicidades.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3 text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border">
            <p>
              <strong>1.</strong> Acesse o{' '}
              <a
                href="https://developers.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Meta for Developers
              </a>{' '}
              e selecione seu App.
            </p>
            <p>
              <strong>2.</strong> No menu lateral, adicione ou acesse o produto{' '}
              <strong>Webhooks</strong>.
            </p>
            <p>
              <strong>3.</strong> Clique em <strong>Editar Assinatura</strong> e preencha com os
              dados abaixo:
            </p>

            <div className="space-y-4 my-4">
              <div className="space-y-1.5">
                <Label className="text-foreground">URL de Retorno (Callback URL)</Label>
                <div className="flex gap-2">
                  <Input readOnly value={WEBHOOK_URL} className="bg-background font-mono text-xs" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(WEBHOOK_URL)}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground">Token de Verificação (Verify Token)</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={VERIFY_TOKEN}
                    className="bg-background font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(VERIFY_TOKEN)}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <p>
              <strong>4.</strong> Após verificar e salvar, assine os campos <code>messages</code>,{' '}
              <code>messaging_postbacks</code> e <code>comments</code> na aba do
              Messenger/Instagram.
            </p>
            <p>
              <strong>5.</strong> Pronto! O CRM irá cruzar o <em>Sender ID</em> para evitar
              duplicidade de leads que comentam em vários anúncios.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
