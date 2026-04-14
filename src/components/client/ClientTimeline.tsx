import { Interaction, Platform } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play, Pause, FileText, CheckCheck, Sparkles, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { ReplySuggestion } from './ReplySuggestion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

const platformStyles: Record<
  Platform,
  { bg: string; border: string; text: string; label: string }
> = {
  whatsapp: {
    bg: 'bg-[#25D366]/10',
    border: 'border-[#25D366]/20',
    text: 'text-[#25D366]',
    label: 'WhatsApp',
  },
  instagram: {
    bg: 'bg-[#E4405F]/10',
    border: 'border-[#E4405F]/20',
    text: 'text-[#E4405F]',
    label: 'Instagram',
  },
  facebook: {
    bg: 'bg-[#1877F2]/10',
    border: 'border-[#1877F2]/20',
    text: 'text-[#1877F2]',
    label: 'Facebook',
  },
  system: {
    bg: 'bg-muted',
    border: 'border-border',
    text: 'text-muted-foreground',
    label: 'Sistema',
  },
}

interface ClientTimelineProps {
  interactions: Interaction[]
  clientAvatar: string
  clientName: string
}

export function ClientTimeline({ interactions, clientAvatar, clientName }: ClientTimelineProps) {
  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  return (
    <div className="space-y-6">
      {sortedInteractions.map((interaction) => (
        <TimelineItem
          key={interaction.id}
          interaction={interaction}
          clientAvatar={clientAvatar}
          clientName={clientName}
        />
      ))}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-dashed">
        Fim do histórico
      </div>
    </div>
  )
}

function TimelineItem({
  interaction,
  clientAvatar,
  clientName,
}: {
  interaction: Interaction
  clientAvatar: string
  clientName: string
}) {
  const isOutbound = interaction.direction === 'outbound'
  const style = platformStyles[interaction.platform]
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProcessAudio = async () => {
    setIsProcessing(true)
    try {
      if (interaction.id.length < 10) {
        await new Promise((r) => setTimeout(r, 1500))
        toast.success('Áudio processado com sucesso! (Mock)')
        window.location.reload()
        return
      }

      const { error } = await supabase.functions.invoke('process-audio', {
        body: { message_id: interaction.id },
      })
      if (error) throw error
      toast.success('Áudio processado com sucesso!')
      setTimeout(() => window.location.reload(), 1000)
    } catch (e: any) {
      toast.error('Erro ao processar áudio: ' + e.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className={`flex gap-3 w-full animate-slide-in-right ${isOutbound ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        {isOutbound ? (
          <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=99" />
        ) : (
          <AvatarImage src={clientAvatar} />
        )}
        <AvatarFallback>{isOutbound ? 'NA' : clientName.substring(0, 2)}</AvatarFallback>
      </Avatar>

      <div
        className={`flex flex-col w-full max-w-[85%] ${isOutbound ? 'items-end' : 'items-start'}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {new Intl.DateTimeFormat('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(interaction.timestamp))}
          </span>
          {!isOutbound && (
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${style.bg} ${style.text}`}
            >
              {style.label}
            </span>
          )}
        </div>

        <div
          className={`relative p-3 rounded-2xl text-sm shadow-sm border ${isOutbound ? 'bg-primary text-primary-foreground rounded-tr-sm border-transparent' : `bg-card rounded-tl-sm ${style.border}`}`}
        >
          {interaction.type === 'text' && (
            <p className="whitespace-pre-wrap leading-relaxed">{interaction.content}</p>
          )}

          {interaction.type === 'audio' && (
            <div className="min-w-[200px] flex flex-col gap-2">
              <div
                className={`flex items-center gap-2 p-2 rounded-xl ${isOutbound ? 'bg-primary-foreground/20' : 'bg-muted/50'}`}
              >
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${isOutbound ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'}`}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full w-1/3 rounded-full ${isOutbound ? 'bg-primary-foreground' : 'bg-primary'}`}
                  ></div>
                </div>
                <span className="text-xs font-medium opacity-80">
                  0:{interaction.audioDuration || 45}
                </span>
              </div>

              {interaction.transcription && (
                <div
                  className={`text-xs p-2 rounded-md border-l-2 mt-1 ${isOutbound ? 'border-primary-foreground/50 bg-black/10' : 'border-primary bg-primary/5'}`}
                >
                  <span className="font-semibold block mb-1 opacity-70">Transcrição:</span>
                  <p className="italic">{interaction.transcription}</p>
                </div>
              )}

              {!interaction.transcription && !isOutbound && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] mt-1 self-start gap-1 px-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  onClick={handleProcessAudio}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Analisar IA e Transcrever
                </Button>
              )}
            </div>
          )}

          {interaction.type === 'document' && (
            <div className="flex items-center gap-3 p-1">
              <div
                className={`p-2 rounded-lg ${isOutbound ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'}`}
              >
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-medium underline underline-offset-2 cursor-pointer">
                {interaction.content}
              </span>
            </div>
          )}

          {isOutbound && (
            <div className="absolute bottom-1.5 right-2 opacity-70">
              <CheckCheck className="h-3 w-3" />
            </div>
          )}
        </div>

        {!isOutbound && (
          <ReplySuggestion
            messageId={interaction.id}
            content={interaction.transcription || interaction.content}
            onSend={(text) => {
              toast.success('Mensagem enviada com sucesso!')
            }}
          />
        )}
      </div>
    </div>
  )
}
