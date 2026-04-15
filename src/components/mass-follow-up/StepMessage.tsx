import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Bot, Wand2, Loader2, Save } from 'lucide-react'
import { useCRM } from '@/contexts/CRMContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getTemplates, saveTemplate } from '@/services/templates'
import { toast } from 'sonner'
import { MessageTemplate } from '@/lib/types'

export function StepMessage({
  messageTemplate,
  setMessageTemplate,
  kimiPrompt,
  setKimiPrompt,
  isGenerating,
  handleGenerateMessage,
  selectedClientIds,
}: any) {
  const { clients, products } = useCRM()
  const { user } = useAuth()
  const previewClients = clients
    .filter((c) => selectedClientIds.has(c.id) && !c.opt_out)
    .slice(0, 2)
  const optedOutCount = clients.filter((c) => selectedClientIds.has(c.id) && c.opt_out).length

  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')

  useEffect(() => {
    if (user) {
      getTemplates(user.id).then(setTemplates)
    }
  }, [user])

  const insertVariable = (variable: string) =>
    setMessageTemplate((prev: string) => prev + ` {{${variable}}}`)

  const getPreviewText = (client: any) => {
    let text = messageTemplate
    text = text.replace(/\{\{nome\}\}/g, client.name.split(' ')[0])
    const clientProducts = products.filter((p) => p.clientId === client.id)
    const firstProduct = clientProducts.length > 0 ? clientProducts[0].name : 'nosso serviço'
    text = text.replace(/\{\{produto\}\}/g, firstProduct)
    text = text.replace(/\{\{status\}\}/g, client.pipeline_stage)
    return text
  }

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim() || !messageTemplate.trim() || !user) return
    try {
      const newTpl = await saveTemplate(user.id, newTemplateName, messageTemplate)
      setTemplates([newTpl, ...templates])
      setIsSaveModalOpen(false)
      setNewTemplateName('')
      toast.success('Template salvo com sucesso!')
    } catch (e) {
      toast.error('Erro ao salvar template')
    }
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" /> Gerar com Kimi K2.5
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Crie um follow-up amigável..."
                value={kimiPrompt}
                onChange={(e) => setKimiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateMessage()}
              />
              <Button onClick={handleGenerateMessage} disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Mensagem</h3>
              <div className="flex gap-2 items-center flex-wrap justify-end">
                <Select
                  onValueChange={(val) => {
                    const t = templates.find((x) => x.id === val)
                    if (t) setMessageTemplate(t.content)
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue placeholder="Meus Templates" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length === 0 && (
                      <SelectItem value="none" disabled>
                        Nenhum salvo
                      </SelectItem>
                    )}
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSaveModalOpen(true)}
                  className="h-8 text-xs px-2"
                  disabled={!messageTemplate.trim()}
                >
                  <Save className="w-3 h-3 mr-1" /> Salvar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('nome')}
                  className="h-8 text-xs px-2"
                >
                  {'{{nome}}'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('produto')}
                  className="h-8 text-xs px-2"
                >
                  {'{{produto}}'}
                </Button>
              </div>
            </div>
            <Textarea
              className="h-48 resize-none"
              placeholder="Escreva sua mensagem aqui..."
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Caracteres: {messageTemplate.length}. Recomendado: 10-1000.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold mb-2 flex items-center justify-between">
            Pré-visualização
            {optedOutCount > 0 && (
              <span className="text-xs font-normal text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                {optedOutCount} na Lista Negra
              </span>
            )}
          </h3>
          {previewClients.length > 0 ? (
            <div className="space-y-4">
              {previewClients.map((client) => (
                <div key={client.id} className="bg-muted/30 border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-2 font-medium">
                    Para: {client.name}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {getPreviewText(client) || (
                      <span className="italic text-muted-foreground">Mensagem vazia...</span>
                    )}
                  </div>
                </div>
              ))}
              {selectedClientIds.size - optedOutCount > 2 && (
                <div className="text-xs text-center text-muted-foreground pt-2">
                  + {selectedClientIds.size - optedOutCount - 2} outros clientes
                </div>
              )}
            </div>
          ) : (
            <div className="bg-muted/30 border rounded-lg p-4 text-sm text-muted-foreground italic text-center h-32 flex items-center justify-center">
              {selectedClientIds.size > 0 && optedOutCount === selectedClientIds.size
                ? 'Todos os clientes selecionados estão na Lista Negra.'
                : 'Selecione clientes válidos no passo anterior.'}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Template</label>
              <Input
                placeholder="Ex: Follow-up de Venda"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Conteúdo (Apenas visualização)</label>
              <Textarea value={messageTemplate} disabled className="h-24 resize-none bg-muted/50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!newTemplateName.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
