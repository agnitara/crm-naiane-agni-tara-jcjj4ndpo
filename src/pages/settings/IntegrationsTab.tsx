import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Copy, Save, Loader2, Key } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'

export function IntegrationsTab() {
  const { user } = useAuth()
  const [fbConnected, setFbConnected] = useState(false)
  const [igConnected, setIgConnected] = useState(false)
  const [waConnected, setWaConnected] = useState(true)

  const [isLoading, setIsLoading] = useState(true)
  const [isSavingFb, setIsSavingFb] = useState(false)
  const [isSavingIg, setIsSavingIg] = useState(false)

  const [fbPageId, setFbPageId] = useState('')
  const [fbToken, setFbToken] = useState('')
  const [igAccountId, setIgAccountId] = useState('')
  const [igToken, setIgToken] = useState('')

  const WEBHOOK_URL = 'https://lsvmdgjznmwavfmhqykp.supabase.co/functions/v1/meta-webhook'
  const VERIFY_TOKEN = 'crm_omnichannel_token'

  useEffect(() => {
    if (user) {
      loadMetaCredentials()
    }
  }, [user])

  const loadMetaCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('meta_credentials')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setFbPageId(data.facebook_page_id || '')
        setFbToken(data.facebook_page_access_token || '')
        setIgAccountId(data.instagram_account_id || '')
        setIgToken(data.instagram_access_token || '')

        if (data.facebook_page_id || data.facebook_page_access_token) setFbConnected(true)
        if (data.instagram_account_id || data.instagram_access_token) setIgConnected(true)
      }
    } catch (error: any) {
      console.error('Erro ao carregar credenciais:', error)
      toast.error('Erro ao carregar credenciais do Meta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveFb = async () => {
    if (!user) return
    setIsSavingFb(true)
    try {
      const { error } = await supabase.from('meta_credentials').upsert(
        {
          user_id: user.id,
          facebook_page_id: fbPageId,
          facebook_page_access_token: fbToken,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )

      if (error) throw error
      toast.success('Credenciais do Facebook salvas com sucesso!')
      setFbConnected(true)
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar credenciais do Facebook')
    } finally {
      setIsSavingFb(false)
    }
  }

  const handleSaveIg = async () => {
    if (!user) return
    setIsSavingIg(true)
    try {
      const { error } = await supabase.from('meta_credentials').upsert(
        {
          user_id: user.id,
          instagram_account_id: igAccountId,
          instagram_access_token: igToken,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )

      if (error) throw error
      toast.success('Credenciais do Instagram salvas com sucesso!')
      setIgConnected(true)
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar credenciais do Instagram')
    } finally {
      setIsSavingIg(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para a área de transferência')
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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

          <div className="flex flex-col border rounded-lg bg-card overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center text-white font-bold text-xl ${!igConnected ? 'grayscale' : ''}`}
                >
                  IG
                </div>
                <div>
                  <p className="font-medium">Instagram API</p>
                  <p className="text-xs text-muted-foreground">
                    {igConnected ? 'Configurado' : 'Não configurado'}
                  </p>
                </div>
              </div>
              <Switch checked={igConnected} onCheckedChange={setIgConnected} />
            </div>

            {igConnected && (
              <div className="p-4 pt-0 border-t bg-muted/10 space-y-4 mt-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    Credenciais do Instagram
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="ig-account-id">Instagram Account ID</Label>
                      <Input
                        id="ig-account-id"
                        placeholder="Ex: 17841400000000000"
                        value={igAccountId}
                        onChange={(e) => setIgAccountId(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ig-token">Token de Acesso (Page/User Token)</Label>
                      <Input
                        id="ig-token"
                        type="password"
                        placeholder="EAA..."
                        value={igToken}
                        onChange={(e) => setIgToken(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleSaveIg} disabled={isSavingIg}>
                      {isSavingIg ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar Credenciais IG
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={`flex flex-col border rounded-lg bg-card overflow-hidden transition-all duration-300 ${!fbConnected ? 'opacity-80' : ''}`}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] font-bold text-xl ${!fbConnected ? 'grayscale' : ''}`}
                >
                  f
                </div>
                <div>
                  <p className="font-medium">Facebook Messenger API</p>
                  <p className="text-xs text-muted-foreground">
                    {fbConnected ? 'Configurado' : 'Não configurado'}
                  </p>
                </div>
              </div>
              <Switch checked={fbConnected} onCheckedChange={setFbConnected} />
            </div>

            {fbConnected && (
              <div className="p-4 pt-0 border-t bg-muted/10 space-y-4 mt-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    Credenciais da Página do Facebook
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="fb-page-id">Page ID (ID da Página)</Label>
                      <Input
                        id="fb-page-id"
                        placeholder="Ex: 100000000000000"
                        value={fbPageId}
                        onChange={(e) => setFbPageId(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fb-token">Token de Acesso da Página (Page Token)</Label>
                      <Input
                        id="fb-token"
                        type="password"
                        placeholder="EAA..."
                        value={fbToken}
                        onChange={(e) => setFbToken(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleSaveFb} disabled={isSavingFb}>
                      {isSavingFb ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar Credenciais FB
                    </Button>
                  </div>
                </div>
              </div>
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
