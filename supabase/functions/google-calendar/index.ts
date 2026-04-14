import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const action = payload.action
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) throw new Error('No authorization header')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured')
    }

    if (action === 'status') {
      const { data } = await supabase
        .from('google_calendar_credentials')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()
      return new Response(JSON.stringify({ connected: !!data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'getAuthUrl') {
      const { redirectUri } = payload
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      url.searchParams.append('client_id', clientId)
      url.searchParams.append('redirect_uri', redirectUri)
      url.searchParams.append('response_type', 'code')
      url.searchParams.append('scope', 'https://www.googleapis.com/auth/calendar')
      url.searchParams.append('access_type', 'offline')
      url.searchParams.append('prompt', 'consent')
      return new Response(JSON.stringify({ url: url.toString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'exchangeCode') {
      const { code, redirectUri } = payload
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })

      if (!tokenResponse.ok) {
        const err = await tokenResponse.text()
        throw new Error('Failed to exchange code: ' + err)
      }

      const tokens = await tokenResponse.json()

      const { error: upsertError } = await supabase.from('google_calendar_credentials').upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + tokens.expires_in * 1000,
        updated_at: new Date().toISOString(),
      })

      if (upsertError) throw upsertError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const getValidToken = async () => {
      const { data: creds } = await supabase
        .from('google_calendar_credentials')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!creds) throw new Error('Google Calendar not connected')

      if (Date.now() > creds.expires_at - 60000) {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: creds.refresh_token,
            grant_type: 'refresh_token',
          }),
        })

        if (!refreshResponse.ok) throw new Error('Failed to refresh token')
        const tokens = await refreshResponse.json()

        await supabase
          .from('google_calendar_credentials')
          .update({
            access_token: tokens.access_token,
            expires_at: Date.now() + tokens.expires_in * 1000,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)

        return tokens.access_token
      }

      return creds.access_token
    }

    if (action === 'syncFromGoogle') {
      const token = await getValidToken()
      const timeMin = new Date()
      timeMin.setDate(timeMin.getDate() - 30)

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&singleEvents=true&orderBy=startTime`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (!response.ok) throw new Error('Failed to fetch events from Google')
      const googleEvents = await response.json()

      for (const item of googleEvents.items) {
        if (!item.start?.dateTime || !item.end?.dateTime) continue

        const { data: existing } = await supabase
          .from('calendar_events')
          .select('id')
          .eq('google_calendar_event_id', item.id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (existing) {
          await supabase
            .from('calendar_events')
            .update({
              title: item.summary || 'Sem título',
              description: item.description || '',
              start_time: item.start.dateTime,
              end_time: item.end.dateTime,
              sync_status: 'synced',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
        } else {
          await supabase.from('calendar_events').insert({
            user_id: user.id,
            title: item.summary || 'Sem título',
            description: item.description || '',
            start_time: item.start.dateTime,
            end_time: item.end.dateTime,
            google_calendar_event_id: item.id,
            sync_status: 'synced',
          })
        }
      }

      return new Response(JSON.stringify({ success: true, count: googleEvents.items.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'syncToGoogle') {
      const { eventId } = payload
      const token = await getValidToken()

      const { data: event } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle()
      if (!event) throw new Error('Event not found')

      const gEvent = {
        summary: event.title,
        description: event.description || '',
        start: { dateTime: event.start_time },
        end: { dateTime: event.end_time },
      }

      let response
      if (event.google_calendar_event_id) {
        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.google_calendar_event_id}`,
          {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(gEvent),
          },
        )
      } else {
        response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(gEvent),
        })
      }

      if (!response.ok) {
        const err = await response.text()
        await supabase
          .from('calendar_events')
          .update({ sync_status: 'failed', sync_error: err })
          .eq('id', eventId)
        throw new Error('Failed to sync to Google: ' + err)
      }

      const result = await response.json()
      await supabase
        .from('calendar_events')
        .update({
          google_calendar_event_id: result.id,
          sync_status: 'synced',
          sync_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)

      return new Response(JSON.stringify({ success: true, googleEventId: result.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'deleteEvent') {
      const { eventId } = payload
      const { data: event } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle()

      if (event?.google_calendar_event_id) {
        try {
          const token = await getValidToken()
          await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.google_calendar_event_id}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            },
          )
        } catch (e) {
          console.error('Failed to delete from google', e)
        }
      }

      await supabase.from('calendar_events').delete().eq('id', eventId)
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')
  } catch (error: any) {
    console.error('Error in google-calendar function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
