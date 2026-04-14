import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, X, Loader2, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ReplySuggestionProps {
  messageId: string
  content: string
  onSend: (text: string) => void
}

export function ReplySuggestion({ messageId, content, onSend }: ReplySuggestionProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [editedSuggestion, setEditedSuggestion] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateSuggestion = async () => {
    setIsGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-suggestion', {
        body: { message_id: messageId, content },
      })

      if (error) throw error

      if (data?.reason === 'no_chunks_found') {
        toast.info('Nenhuma sugestão disponível. Digite sua resposta manualmente')
        setSuggestion('')
        setEditedSuggestion('')
      } else if (data?.suggestion) {
        setSuggestion(data.suggestion.suggestion_text)
        setEditedSuggestion(data.suggestion.suggestion_text)
        toast.success('Sugestão gerada com sucesso!')
      }
    } catch (err) {
      console.error(err)
      toast.error('Sugestão indisponível no momento')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSend = () => {
    if (!editedSuggestion.trim()) return
    onSend(editedSuggestion)
    setSuggestion(null)
  }

  const handleReject = () => {
    setSuggestion(null)
  }

  if (suggestion !== null) {
    return (
      <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-3 animate-fade-in-up w-full">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <Sparkles className="w-4 h-4" />
          <span>Sugestão RAG (Método Gene da Escolha)</span>
        </div>
        <Textarea
          value={editedSuggestion}
          onChange={(e) => setEditedSuggestion(e.target.value)}
          className="min-h-[80px] text-sm bg-background resize-none focus-visible:ring-primary/30"
          placeholder="Nenhuma sugestão disponível. Digite sua resposta manualmente..."
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleReject} className="h-8 px-3 text-xs">
            <X className="w-4 h-4 mr-1.5" /> Descartar
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!editedSuggestion.trim()}
            className="h-8 px-3 text-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" /> Enviar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2 flex">
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs bg-background/50 hover:bg-primary/5 hover:text-primary border-dashed border-primary/30 rounded-full px-3 transition-all"
        onClick={generateSuggestion}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-primary" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
        )}
        {isGenerating ? 'Analisando contexto RAG...' : 'Sugerir resposta (Kimi)'}
      </Button>
    </div>
  )
}
