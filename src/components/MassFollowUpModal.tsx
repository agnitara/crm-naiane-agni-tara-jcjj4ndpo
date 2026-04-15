import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Loader2, Users, ArrowRight, ArrowLeft } from 'lucide-react'
import { useCRM } from '@/contexts/CRMContext'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { StepSelection } from './mass-follow-up/StepSelection'
import { StepMessage } from './mass-follow-up/StepMessage'
import { StepSend } from './mass-follow-up/StepSend'

export function MassFollowUpModal() {
  const { clients, products } = useCRM()

  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [inactiveDays, setInactiveDays] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set())

  const [messageTemplate, setMessageTemplate] = useState('')
  const [kimiPrompt, setKimiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const [sendResults, setSendResults] = useState<any[]>([])
  const [isSending, setIsSending] = useState(false)
  const [hasSent, setHasSent] = useState(false)

  useEffect(() => {
    if (isOpen && !isSending && !hasSent) {
      setStep(1)
      setSelectedClientIds(new Set())
      setMessageTemplate('')
      setKimiPrompt('')
      setSendResults([])
    }
  }, [isOpen, isSending, hasSent])

  const handleGenerateMessage = async () => {
    if (!kimiPrompt) return toast.error('Digite um contexto para o Kimi gerar a mensagem')
    setIsGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-mass-message', {
        body: { prompt: kimiPrompt },
      })
      if (error) throw error
      if (data.suggestion) setMessageTemplate(data.suggestion)
    } catch (error) {
      toast.error('Erro ao gerar mensagem com Kimi')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSend = async () => {
    setIsSending(true)
    setHasSent(true)

    const clientsToSend = clients.filter((c) => selectedClientIds.has(c.id))
    const results = clientsToSend.map((c) => ({
      clientId: c.id,
      clientName: c.name,
      platform: 'whatsapp',
      status: 'pending',
    }))
    setSendResults(results)

    for (let i = 0; i < clientsToSend.length; i++) {
      const client = clientsToSend[i]
      let text = messageTemplate
      text = text.replace(/\{\{nome\}\}/g, client.name.split(' ')[0])
      const clientProducts = products.filter((p) => p.clientId === client.id)
      const firstProduct = clientProducts.length > 0 ? clientProducts[0].name : 'nosso serviço'
      text = text.replace(/\{\{produto\}\}/g, firstProduct)

      try {
        const { error } = await supabase.from('messages').insert({
          client_id: client.id,
          platform: 'whatsapp',
          direction: 'outbound',
          content: text,
        })
        if (error) throw error
        setSendResults((prev) => {
          const next = [...prev]
          next[i] = { ...next[i], status: 'success', time: new Date().toLocaleTimeString() }
          return next
        })
      } catch (err: any) {
        setSendResults((prev) => {
          const next = [...prev]
          next[i] = {
            ...next[i],
            status: 'error',
            time: new Date().toLocaleTimeString(),
            error: err.message,
          }
          return next
        })
      }
      await new Promise((r) => setTimeout(r, 500))
    }

    setIsSending(false)
    toast.success('Envio em massa concluído!')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !isSending && setIsOpen(v)}>
      <DialogTrigger asChild>
        <Button variant="default" className="hidden lg:flex shrink-0 gap-2">
          <MessageSquare className="h-4 w-4" /> Follow-up em Massa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 border-b shrink-0 bg-muted/20">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-primary" /> Follow-up em Massa
          </DialogTitle>
          <div className="flex items-center gap-4 mt-4">
            <Badge
              variant={step >= 1 ? 'default' : 'secondary'}
              className={cn('text-xs py-1', step === 1 && 'ring-2 ring-primary ring-offset-2')}
            >
              1. Seleção de Clientes
            </Badge>
            <div className={cn('h-px w-8', step >= 2 ? 'bg-primary' : 'bg-border')} />
            <Badge
              variant={step >= 2 ? 'default' : 'secondary'}
              className={cn('text-xs py-1', step === 2 && 'ring-2 ring-primary ring-offset-2')}
            >
              2. Mensagem
            </Badge>
            <div className={cn('h-px w-8', step >= 3 ? 'bg-primary' : 'bg-border')} />
            <Badge
              variant={step >= 3 ? 'default' : 'secondary'}
              className={cn('text-xs py-1', step === 3 && 'ring-2 ring-primary ring-offset-2')}
            >
              3. Confirmação e Envio
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative bg-background">
          {step === 1 && (
            <StepSelection
              {...{
                selectedStages,
                setSelectedStages,
                selectedTags,
                setSelectedTags,
                inactiveDays,
                setInactiveDays,
                searchTerm,
                setSearchTerm,
                selectedClientIds,
                setSelectedClientIds,
              }}
            />
          )}
          {step === 2 && (
            <StepMessage
              {...{
                messageTemplate,
                setMessageTemplate,
                kimiPrompt,
                setKimiPrompt,
                isGenerating,
                handleGenerateMessage,
                selectedClientIds,
              }}
            />
          )}
          {step === 3 && <StepSend {...{ sendResults, isSending }} />}
        </div>

        <DialogFooter className="p-6 border-t shrink-0 bg-muted/20 flex justify-between items-center sm:justify-between">
          <div>
            {step > 1 && !isSending && !hasSent && (
              <Button variant="outline" onClick={() => setStep((s) => (s - 1) as any)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
            )}
          </div>
          <div>
            {step === 1 && (
              <Button onClick={() => setStep(2)} disabled={selectedClientIds.size === 0}>
                Continuar para Mensagem <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {step === 2 && (
              <Button onClick={() => setStep(3)} disabled={!messageTemplate.trim()}>
                Revisar e Enviar <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {step === 3 && !hasSent && (
              <Button onClick={handleSend} disabled={isSending || selectedClientIds.size === 0}>
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Confirmar e Enviar
                  </>
                )}
              </Button>
            )}
            {step === 3 && hasSent && !isSending && (
              <Button onClick={() => setIsOpen(false)}>Fechar Painel</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
