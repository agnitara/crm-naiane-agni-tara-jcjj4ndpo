import { supabase } from '@/lib/supabase/client'
import { CalendarEvent } from '@/lib/types'

export const checkGoogleConnection = async () => {
  const { data, error } = await supabase.functions.invoke('google-calendar', {
    body: { action: 'status' },
  })
  if (error) throw error
  return data
}

export const getGoogleAuthUrl = async () => {
  const { data, error } = await supabase.functions.invoke('google-calendar', {
    body: { action: 'getAuthUrl', redirectUri: window.location.origin + '/calendario' },
  })
  if (error) throw error
  return data.url
}

export const exchangeGoogleCode = async (code: string, redirectUri: string) => {
  const { data, error } = await supabase.functions.invoke('google-calendar', {
    body: { action: 'exchangeCode', code, redirectUri },
  })
  if (error) throw error
  return data
}

export const syncFromGoogle = async () => {
  const { data, error } = await supabase.functions.invoke('google-calendar', {
    body: { action: 'syncFromGoogle' },
  })
  if (error) throw error
  return data
}

export const syncToGoogle = async (eventId: string) => {
  const { data, error } = await supabase.functions.invoke('google-calendar', {
    body: { action: 'syncToGoogle', eventId },
  })
  if (error) throw error
  return data
}

export const deleteEventFromGoogle = async (eventId: string) => {
  const { data, error } = await supabase.functions.invoke('google-calendar', {
    body: { action: 'deleteEvent', eventId },
  })
  if (error) throw error
  return data
}

export const createLocalEvent = async (event: Partial<CalendarEvent>) => {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.user.id,
      title: event.title,
      description: event.description,
      start_time: event.date,
      end_time: event.endDate,
      client_id: event.clientId || null,
      sync_status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const checkConflicts = async (
  startTime: string,
  endTime: string,
  currentEventId?: string,
) => {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Not authenticated')

  let query = supabase
    .from('calendar_events')
    .select('id, title, start_time, end_time')
    .eq('user_id', user.user.id)
    .lt('start_time', endTime)
    .gt('end_time', startTime)

  if (currentEventId) {
    query = query.neq('id', currentEventId)
  }

  const { data, error } = await query
  if (error) throw error

  return data.length > 0
}
