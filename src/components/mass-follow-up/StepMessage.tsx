import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Bot, Wand2, Loader2 } from 'lucide-react'
import { useCRM } from '@/contexts/CRMContext'

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
  const previewClients = clients.filter((c) => selectedClientIds.has(c.id)).slice(0, 2)

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
                placeholder="Ex: Crie um follow-up amigável para reengajar..."
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('nome')}
                  className="h-6 text-xs px-2"
                >
                  {'{{nome}}'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('produto')}
                  className="h-6 text-xs px-2"
                >
                  {'{{produto}}'}
                </Button>
              </div>
            </div>
            <Textarea
              className="h-48 resize-none"
              placeholder="Escreva sua mensagem aqui ou use o Kimi para gerar..."
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Caracteres: {messageTemplate.length}. Recomendado: 10-1000.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold mb-2">Pré-visualização</h3>
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
              {selectedClientIds.size > 2 && (
                <div className="text-xs text-center text-muted-foreground pt-2">
                  + {selectedClientIds.size - 2} outros clientes
                </div>
              )}
            </div>
          ) : (
            <div className="bg-muted/30 border rounded-lg p-4 text-sm text-muted-foreground italic text-center h-32 flex items-center justify-center">
              Selecione clientes no passo anterior.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
