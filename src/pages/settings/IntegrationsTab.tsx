import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Copy, Save, Loader2, Key, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'

export function IntegrationsTab() {
  const { user } = useAuth()

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
      const cleanedPageId = fbPageId.trim()
      const cleanedToken = fbToken.trim()

      const { data: existing } = await supabase
        .from('meta_credentials')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      const payload = {
        user_id: user.id,
        facebook_page_id: cleanedPageId,
        facebook_page_access_token: cleanedToken,
        instagram_account_id: existing?.instagram_account_id || null,
        instagram_access_token: existing?.instagram_access_token || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('meta_credentials')
        .upsert(payload, { onConflict: 'user_id' })

      if (error) throw error

      setFbPageId(cleanedPageId)
      setFbToken(cleanedToken)
      toast.success('Credenciais do Facebook salvas com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      const msg = error?.message || ''
      if (msg.includes('invalid input syntax')) {
        toast.error('Erro de validação do usuário. Por favor, tente novamente mais tarde.')
      } else {
        toast.error(
          'Falha ao salvar credenciais do Facebook. Verifique se o ID e Token são válidos.',
        )
      }
    } finally {
      setIsSavingFb(false)
    }
  }

  const handleSaveIg = async () => {
    if (!user) return
    setIsSavingIg(true)
    try {
      const cleanedAccountId = igAccountId.trim()
      const cleanedToken = igToken.trim()

      const { data: existing } = await supabase
        .from('meta_credentials')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      const payload = {
        user_id: user.id,
        facebook_page_id: existing?.facebook_page_id || null,
        facebook_page_access_token: existing?.facebook_page_access_token || null,
        instagram_account_id: cleanedAccountId,
        instagram_access_token: cleanedToken,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('meta_credentials')
        .upsert(payload, { onConflict: 'user_id' })

      if (error) throw error

      setIgAccountId(cleanedAccountId)
      setIgToken(cleanedToken)
      toast.success('Credenciais do Instagram salvas com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      const msg = error?.message || ''
      if (msg.includes('invalid input syntax')) {
        toast.error('Erro de validação do usuário. Por favor, tente novamente mais tarde.')
      } else {
        toast.error(
          'Falha ao salvar credenciais do Instagram. Verifique se o ID e Token são válidos.',
        )
      }
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

  const isIgConfigured = igAccountId && igToken
  const isFbConfigured = fbPageId && fbToken

  return (
    <div className="space-y-6">
      <Card className="shadow-subtle border-none">
        <CardHeader>
          <CardTitle className="font-display">Integrações Omnichannel</CardTitle>
          <CardDescription>
            Conecte e gerencie seus tokens de acesso para ativar as automações do Facebook e
            Instagram.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] font-bold text-xl">
                W
              </div>
              <div>
                <p className="font-medium text-base">WhatsApp Cloud API</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" /> Conectado Oficialmente (Final
                  9888)
                </p>
              </div>
            </div>
            <Switch checked={true} disabled />
          </div>

          <div className="flex flex-col border rounded-lg bg-card overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-muted/20">
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center text-white font-bold text-xl ${!isIgConfigured ? 'opacity-50 grayscale' : ''}`}
                >
                  IG
                </div>
                <div>
                  <p className="font-medium text-base">Instagram API</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    {isIgConfigured ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-green-500" /> Conectado
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-amber-500" /> Requer configuração
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 border-t space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  Credenciais de Acesso do Instagram
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="ig-account-id">ID da Conta do Instagram (Account ID)</Label>
                    <Input
                      id="ig-account-id"
                      placeholder="Ex: 17841400000000000"
                      value={igAccountId}
                      onChange={(e) => setIgAccountId(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ig-token">Token de Acesso (Access Token)</Label>
                    <Input
                      id="ig-token"
                      type="password"
                      placeholder="EAA..."
                      value={igToken}
                      onChange={(e) => setIgToken(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveIg} disabled={isSavingIg} className="w-full sm:w-auto">
                    {isSavingIg ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Token do Instagram
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col border rounded-lg bg-card overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-muted/20">
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] font-bold text-xl ${!isFbConfigured ? 'opacity-50 grayscale' : ''}`}
                >
                  f
                </div>
                <div>
                  <p className="font-medium text-base">Facebook Messenger API</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    {isFbConfigured ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-green-500" /> Conectado
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-amber-500" /> Requer configuração
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 border-t space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  Credenciais de Acesso da Página
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fb-page-id">ID da Página (Page ID)</Label>
                    <Input
                      id="fb-page-id"
                      placeholder="Ex: 100000000000000"
                      value={fbPageId}
                      onChange={(e) => setFbPageId(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fb-token">Token de Acesso (Page Token)</Label>
                    <Input
                      id="fb-token"
                      type="password"
                      placeholder="EAA..."
                      value={fbToken}
                      onChange={(e) => setFbToken(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveFb} disabled={isSavingFb} className="w-full sm:w-auto">
                    {isSavingFb ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Token do Facebook
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-subtle border-none">
        <CardHeader>
          <CardTitle className="font-display">Webhooks de Retorno (Meta)</CardTitle>
          <CardDescription>
            Utilize estas informações fixas no painel de desenvolvedor da Meta para conectar o
            aplicativo ao nosso sistema de CRM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3 text-sm text-muted-foreground bg-muted/30 p-5 rounded-lg border">
            <p>
              Preencha esses dados exatos na configuração do <strong>Webhook</strong> para os
              produtos de Instagram e Messenger:
            </p>

            <div className="space-y-4 my-4">
              <div className="space-y-1.5">
                <Label className="text-foreground">URL de Retorno (Callback URL)</Label>
                <div className="flex gap-2">
                  <Input readOnly value={WEBHOOK_URL} className="bg-background font-mono text-sm" />
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
                    className="bg-background font-mono text-sm"
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
              Certifique-se de assinar os campos de <code>messages</code>,{' '}
              <code>messaging_postbacks</code> e <code>comments</code>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
