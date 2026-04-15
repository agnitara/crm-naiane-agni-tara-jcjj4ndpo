import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  ListTodo,
  Tag,
  Calendar as CalIcon,
  Columns,
  Check,
  X,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

interface Suggestion {
  id: string
  type: 'reply' | 'next_step' | 'tag' | 'follow_up' | 'pipeline_stage'
  content: string
  description: string
  reason: string
}

export function ClientSuggestions({
  clientId,
  onSendReply,
}: {
  clientId: string
  onSendReply: (text: string) => void
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [editedReplies, setEditedReplies] = useState<Record<string, string>>({})

  const fetchSuggestions = useCallback(async () => {
    const { data } = await (supabase as any)
      .from('client_suggestions')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(3)

    if (data) {
      setSuggestions(data as Suggestion[])
      const newEdited = { ...editedReplies }
      data.forEach((s: Suggestion) => {
        if (s.type === 'reply' && newEdited[s.id] === undefined) {
          newEdited[s.id] = s.content
        }
      })
      setEditedReplies(newEdited)
    }
  }, [clientId])

  const generateSuggestions = useCallback(async () => {
    setLoading(true)
    try {
      await supabase.functions.invoke('generate-client-suggestions', {
        body: { client_id: clientId },
      })
      await fetchSuggestions()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [clientId, fetchSuggestions])

  useEffect(() => {
    fetchSuggestions()

    const channel = supabase
      .channel(`msgs-sugg-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          if (payload.new.direction === 'inbound') {
            generateSuggestions()
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId, fetchSuggestions, generateSuggestions])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (suggestions.length === 0 && !loading) {
        generateSuggestions()
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [clientId])

  const handleAccept = async (s: Suggestion) => {
    try {
      await (supabase as any)
        .from('client_suggestions')
        .update({ status: 'accepted' })
        .eq('id', s.id)

      if (s.type === 'reply') {
        const text = editedReplies[s.id] || s.content
        if (text.trim()) onSendReply(text)
      } else if (s.type === 'pipeline_stage') {
        await supabase
          .from('clients')
          .update({ pipeline_stage: s.content } as any)
          .eq('id', clientId)
      } else if (s.type === 'tag') {
        const { data: client } = await supabase
          .from('clients')
          .select('sentiment_tags')
          .eq('id', clientId)
          .single()
        const tags = client?.sentiment_tags || []
        if (!tags.includes(s.content)) {
          await supabase
            .from('clients')
            .update({ sentiment_tags: [...tags, s.content] } as any)
            .eq('id', clientId)
        }
      } else if (s.type === 'follow_up') {
        const { data: user } = await supabase.auth.getUser()
        if (user.user) {
          const startTime = new Date(s.content)
          if (!isNaN(startTime.getTime())) {
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
            await supabase.from('calendar_events').insert({
              user_id: user.user.id,
              client_id: clientId,
              title: 'Follow-up Sugerido',
              description: s.description,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
            } as any)
          }
        }
      } else if (s.type === 'next_step') {
        const { data: client } = await supabase
          .from('clients')
          .select('notes')
          .eq('id', clientId)
          .single()
        const newNotes = client?.notes
          ? `${client.notes}\n\nPróximo passo: ${s.content}`
          : `Próximo passo: ${s.content}`
        await supabase
          .from('clients')
          .update({ notes: newNotes } as any)
          .eq('id', clientId)
      }

      toast.success('Sugestão aplicada com sucesso')
      setSuggestions((prev) => prev.filter((item) => item.id !== s.id))
    } catch (e) {
      toast.error('Erro ao aplicar sugestão. Tente manualmente.')
    }
  }

  const handleReject = async (s: Suggestion) => {
    try {
      await (supabase as any)
        .from('client_suggestions')
        .update({ status: 'rejected' })
        .eq('id', s.id)
      setSuggestions((prev) => prev.filter((item) => item.id !== s.id))
    } catch (e) {
      console.error(e)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'reply':
        return <MessageSquare className="w-4 h-4" />
      case 'next_step':
        return <ListTodo className="w-4 h-4" />
      case 'tag':
        return <Tag className="w-4 h-4" />
      case 'follow_up':
        return <CalIcon className="w-4 h-4" />
      case 'pipeline_stage':
        return <Columns className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  if (suggestions.length === 0 && !loading) return null

  return (
    <div className="flex flex-col gap-3 px-4 sm:px-6 pb-4">
      {loading && suggestions.length === 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse py-2">
          <Sparkles className="w-3.5 h-3.5" /> Analisando contexto para sugestões...
        </div>
      )}
      {suggestions.map((s) => (
        <div
          key={s.id}
          className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-col gap-2 animate-fade-in-up"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            {getIcon(s.type)}
            <span>{s.description}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">{s.reason}</p>

          {s.type === 'reply' ? (
            <Textarea
              className="text-xs min-h-[60px] bg-background mt-1 resize-none"
              value={editedReplies[s.id] ?? s.content}
              onChange={(e) => setEditedReplies({ ...editedReplies, [s.id]: e.target.value })}
            />
          ) : (
            <div className="text-sm font-medium mt-1 bg-background p-2 rounded-md border text-foreground">
              {s.type === 'follow_up' && !isNaN(new Date(s.content).getTime())
                ? new Date(s.content).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                : s.content}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => handleReject(s)}
            >
              <X className="w-3.5 h-3.5 mr-1" /> Rejeitar
            </Button>
            <Button size="sm" className="h-7 text-xs px-3" onClick={() => handleAccept(s)}>
              <Check className="w-3.5 h-3.5 mr-1" /> Aceitar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
