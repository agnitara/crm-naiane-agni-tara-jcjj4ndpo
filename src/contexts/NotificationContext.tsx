import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase/client'
import { useCRM } from './CRMContext'
import { toast } from 'sonner'

interface NotificationSettings {
  soundEnabled: boolean
  browserEnabled: boolean
}

export interface AppNotification {
  id: string
  clientId: string
  type: 'message' | 'suggestion' | 'event'
  title: string
  body: string
  timestamp: Date
  read: boolean
}

interface ClientBadges {
  unreadMessages: number
  pendingSuggestions: number
  upcomingEvents: number
}

interface NotificationContextType {
  settings: NotificationSettings
  updateSettings: (newSet: Partial<NotificationSettings>) => Promise<void>
  requestBrowserPermission: () => void
  badges: Record<string, ClientBadges>
  notifications: AppNotification[]
  unreadCount: number
  markAllAsRead: () => void
  openClientPanel: (clientId: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { selectedClientId, openClientPanel: crmOpenClientPanel, events } = useCRM()

  const [settings, setSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    browserEnabled: false,
  })
  const [badges, setBadges] = useState<Record<string, ClientBadges>>({})
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const selectedClientIdRef = useRef(selectedClientId)
  const notifiedEventsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    selectedClientIdRef.current = selectedClientId
    if (selectedClientId) {
      // Clear badges for this client
      setBadges((prev) => {
        const b = { ...prev }
        if (b[selectedClientId]) {
          b[selectedClientId] = { ...b[selectedClientId], unreadMessages: 0, pendingSuggestions: 0 }
        }
        return b
      })
      // Mark notifications as read for this client
      setNotifications((prev) =>
        prev.map((n) => (n.clientId === selectedClientId ? { ...n, read: true } : n)),
      )

      // Update DB
      supabase
        .from('clients')
        .update({ last_read_at: new Date().toISOString() })
        .eq('id', selectedClientId)
        .then()
    }
  }, [selectedClientId])

  const fetchSettings = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('user_settings')
        .select('notification_sound_enabled, browser_notifications_enabled')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setSettings({
          soundEnabled: data.notification_sound_enabled,
          browserEnabled: data.browser_notifications_enabled,
        })
      }
    }
  }, [])

  const initializeBadges = useCallback(async () => {
    const { data: clients } = await supabase.from('clients').select('id, last_read_at')
    if (!clients) return

    const now = new Date()
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const { data: messages } = await supabase
      .from('messages')
      .select('client_id, created_at')
      .eq('direction', 'inbound')
      .gte('created_at', sevenDaysAgo.toISOString())

    const { data: suggestions } = await supabase
      .from('client_suggestions')
      .select('client_id')
      .eq('status', 'pending')

    const { data: calEvents } = await supabase
      .from('calendar_events')
      .select('client_id')
      .gte('start_time', now.toISOString())
      .lte('start_time', next24h.toISOString())

    const newBadges: Record<string, ClientBadges> = {}
    for (const client of clients) {
      const lastRead = new Date(client.last_read_at || 0)
      const unread =
        messages?.filter((m) => m.client_id === client.id && new Date(m.created_at) > lastRead)
          .length || 0
      const pending = suggestions?.filter((s) => s.client_id === client.id).length || 0
      const upEvents = calEvents?.filter((e) => e.client_id === client.id).length || 0

      if (unread > 0 || pending > 0 || upEvents > 0) {
        newBadges[client.id] = {
          unreadMessages: unread,
          pendingSuggestions: pending,
          upcomingEvents: upEvents,
        }
      }
    }
    setBadges(newBadges)
  }, [])

  useEffect(() => {
    fetchSettings()
    initializeBadges()

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchSettings()
        initializeBadges()
      }
    })

    return () => authListener.subscription.unsubscribe()
  }, [fetchSettings, initializeBadges])

  const playSound = useCallback(() => {
    if (!settings.soundEnabled) return
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.1)

      setTimeout(() => {
        if (ctx.state !== 'closed') {
          const osc2 = ctx.createOscillator()
          const gain2 = ctx.createGain()
          osc2.connect(gain2)
          gain2.connect(ctx.destination)
          osc2.type = 'sine'
          osc2.frequency.setValueAtTime(1108.73, ctx.currentTime)
          gain2.gain.setValueAtTime(0.05, ctx.currentTime)
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
          osc2.start(ctx.currentTime)
          osc2.stop(ctx.currentTime + 0.2)
        }
      }, 100)
    } catch (e) {
      // Ignore audio initialization errors
    }
  }, [settings.soundEnabled])

  const showBrowserNotification = useCallback(
    (title: string, body: string) => {
      if (!settings.browserEnabled || typeof Notification === 'undefined') return
      if (Notification.permission === 'granted' && document.visibilityState !== 'visible') {
        new Notification(title, { body })
      }
    },
    [settings.browserEnabled],
  )

  const handleNewMessage = useCallback(
    async (msg: any) => {
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', msg.client_id)
        .single()
      const clientName = client?.name || 'Cliente'

      setBadges((prev) => {
        const current = prev[msg.client_id] || {
          unreadMessages: 0,
          pendingSuggestions: 0,
          upcomingEvents: 0,
        }
        return {
          ...prev,
          [msg.client_id]: { ...current, unreadMessages: current.unreadMessages + 1 },
        }
      })

      const content = msg.content || 'Áudio ou Mídia'
      playSound()
      showBrowserNotification(`Mensagem de ${clientName}`, content)

      toast(`Mensagem de ${clientName}`, {
        description: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        action: { label: 'Ver', onClick: () => crmOpenClientPanel(msg.client_id) },
      })

      setNotifications((prev) => [
        {
          id: msg.id,
          clientId: msg.client_id,
          type: 'message',
          title: `Mensagem de ${clientName}`,
          body: content,
          timestamp: new Date(msg.created_at),
          read: false,
        },
        ...prev,
      ])
    },
    [playSound, showBrowserNotification, crmOpenClientPanel],
  )

  const handleNewSuggestion = useCallback(
    async (sug: any) => {
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', sug.client_id)
        .single()
      const clientName = client?.name || 'Cliente'

      setBadges((prev) => {
        const current = prev[sug.client_id] || {
          unreadMessages: 0,
          pendingSuggestions: 0,
          upcomingEvents: 0,
        }
        return {
          ...prev,
          [sug.client_id]: { ...current, pendingSuggestions: current.pendingSuggestions + 1 },
        }
      })

      playSound()
      showBrowserNotification(`Sugestão Kimi K2.5`, `Nova sugestão para ${clientName}`)

      toast(`Sugestão Kimi K2.5`, {
        description: `Nova sugestão de ação para ${clientName}`,
        action: { label: 'Ver', onClick: () => crmOpenClientPanel(sug.client_id) },
      })

      setNotifications((prev) => [
        {
          id: sug.id,
          clientId: sug.client_id,
          type: 'suggestion',
          title: `Sugestão do Kimi`,
          body: `Nova sugestão para ${clientName}: ${sug.description}`,
          timestamp: new Date(sug.created_at),
          read: false,
        },
        ...prev,
      ])
    },
    [playSound, showBrowserNotification, crmOpenClientPanel],
  )

  useEffect(() => {
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new
          if (msg.direction === 'inbound' && msg.client_id !== selectedClientIdRef.current) {
            handleNewMessage(msg)
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'client_suggestions' },
        (payload) => {
          const sug = payload.new
          if (sug.client_id !== selectedClientIdRef.current) {
            handleNewSuggestion(sug)
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'client_suggestions' },
        (payload) => {
          const sug = payload.new
          if (sug.status !== 'pending' && payload.old.status === 'pending') {
            setBadges((prev) => {
              const current = prev[sug.client_id]
              if (!current || current.pendingSuggestions <= 0) return prev
              return {
                ...prev,
                [sug.client_id]: { ...current, pendingSuggestions: current.pendingSuggestions - 1 },
              }
            })
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'calendar_events' },
        (payload) => {
          const evt = payload.new
          if (evt.client_id) {
            setBadges((prev) => {
              const current = prev[evt.client_id] || {
                unreadMessages: 0,
                pendingSuggestions: 0,
                upcomingEvents: 0,
              }
              return {
                ...prev,
                [evt.client_id]: { ...current, upcomingEvents: current.upcomingEvents + 1 },
              }
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [handleNewMessage, handleNewSuggestion])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      events.forEach((event) => {
        if (notifiedEventsRef.current.has(event.id)) return
        const diff = new Date(event.date).getTime() - now.getTime()
        if (diff > 0 && diff <= 15 * 60 * 1000) {
          notifiedEventsRef.current.add(event.id)
          playSound()
          showBrowserNotification(
            'Agendamento Próximo',
            `O evento "${event.title}" começa em breve.`,
          )
          toast(`Agendamento Próximo`, {
            description: `O evento "${event.title}" começa em breve.`,
            action: {
              label: 'Ver',
              onClick: () => (event.clientId ? crmOpenClientPanel(event.clientId) : null),
            },
          })
          setNotifications((prev) => [
            {
              id: `evt-${event.id}`,
              clientId: event.clientId || '',
              type: 'event',
              title: 'Agendamento Próximo',
              body: `O evento "${event.title}" começa em breve.`,
              timestamp: new Date(),
              read: false,
            },
            ...prev,
          ])
        }
      })
    }, 30000)
    return () => clearInterval(interval)
  }, [events, playSound, showBrowserNotification, crmOpenClientPanel])

  const updateSettings = async (newSet: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSet }))
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('user_settings')
        .update({
          notification_sound_enabled: newSet.soundEnabled ?? settings.soundEnabled,
          browser_notifications_enabled: newSet.browserEnabled ?? settings.browserEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }
  }

  const requestBrowserPermission = () => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        settings,
        updateSettings,
        requestBrowserPermission,
        badges,
        notifications,
        unreadCount,
        markAllAsRead,
        openClientPanel: crmOpenClientPanel,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
