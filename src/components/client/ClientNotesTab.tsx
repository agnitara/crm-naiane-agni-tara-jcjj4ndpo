import { useState, useEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tag, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export function ClientNotesTab({
  clientId,
  initialTags,
  initialNotes,
}: {
  clientId: string
  initialTags: string[]
  initialNotes: string
}) {
  const [notes, setNotes] = useState(initialNotes)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [newTag, setNewTag] = useState('')
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setNotes(initialNotes)
    setTags(initialTags)
  }, [initialTags, initialNotes])

  const handleSaveNotes = async (text: string) => {
    if (!clientId) return
    try {
      await supabase.from('clients').update({ notes: text }).eq('id', clientId)
    } catch (e) {
      console.error(e)
    }
  }

  const onNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setNotes(val)
    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current)
    notesTimeoutRef.current = setTimeout(() => {
      handleSaveNotes(val)
    }, 500)
  }

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.trim() || !clientId) return
    const updatedTags = [...tags, newTag.trim()]
    setTags(updatedTags)
    setNewTag('')
    await supabase.from('clients').update({ sentiment_tags: updatedTags }).eq('id', clientId)
  }

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!clientId) return
    const updatedTags = tags.filter((t) => t !== tagToRemove)
    setTags(updatedTags)
    await supabase.from('clients').update({ sentiment_tags: updatedTags }).eq('id', clientId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" /> Tags de Sentimento
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 bg-muted px-2 py-1"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-muted-foreground hover:text-foreground ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {tags.length === 0 && (
            <span className="text-xs text-muted-foreground italic">Nenhuma tag.</span>
          )}
        </div>
        <form onSubmit={handleAddTag} className="flex gap-2 max-w-sm">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Nova tag..."
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" className="h-8">
            Adicionar
          </Button>
        </form>
      </div>
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          Notas Internas{' '}
          <span className="text-xs font-normal text-muted-foreground ml-2">
            (salvamento automático)
          </span>
        </h3>
        <Textarea
          value={notes}
          onChange={onNotesChange}
          placeholder="Escreva observações sobre o cliente aqui..."
          className="min-h-[250px] resize-y bg-background"
        />
      </div>
    </div>
  )
}
