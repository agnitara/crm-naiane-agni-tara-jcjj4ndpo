import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const META_VERIFY_TOKEN = Deno.env.get('META_VERIFY_TOKEN') || 'crm_omnichannel_token';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url);

  // Webhook verification from Meta (GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
      console.log('Meta Webhook verified successfully!');
      return new Response(challenge, { status: 200 });
    } else {
      return new Response('Forbidden', { status: 403 });
    }
  }

  // Webhook event handling (POST)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('Received Meta Webhook:', JSON.stringify(body, null, 2));

      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      
      // We use service role key here because this is a server-to-server webhook request
      // and Meta doesn't have a user JWT.
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Handle Instagram, Messenger (page) and WhatsApp
      if (body.object === 'instagram' || body.object === 'page' || body.object === 'whatsapp_business_account') {
        const entries = body.entry || [];
        
        for (const entry of entries) {
          // Meta API structures vary slightly between platforms
          const messagingEvents = entry.messaging || entry.changes?.[0]?.value?.messages || [];
          const platform = body.object === 'instagram' ? 'instagram' : body.object === 'page' ? 'facebook' : 'whatsapp';
          
          for (const event of messagingEvents) {
            const senderId = event.sender?.id || event.from;
            const text = event.message?.text || event.text?.body;
            
            // Check for audio messages
            const audio = event.message?.audio || event.audio;
            let audioUrl = null;
            
            if (audio && audio.id) {
               // In production, we'd use Meta's Graph API to download the media using this ID
               audioUrl = `meta-media://${audio.id}`;
            }

            if (senderId && (text || audioUrl)) {
              // 1. Ensure client exists in our DB
              const { data: existingClient } = await supabase
                .from('clients')
                .select('id')
                .eq('id', String(senderId))
                .maybeSingle();

              if (!existingClient) {
                // Check for referral/ad data
                const referral = event.message?.referral || event.referral;
                let utmSource = platform;
                let utmCampaign = null;

                if (referral) {
                  utmSource = referral.source || platform;
                  if (referral.ad_id) {
                     utmCampaign = `Ad ${referral.ad_id}`;
                  } else if (referral.ref) {
                     utmCampaign = referral.ref;
                  }
                }

                // If it's a new lead from Meta, we create a placeholder client record
                const shortId = String(senderId).substring(0, 5);
                const name = `Lead ${platform.charAt(0).toUpperCase() + platform.slice(1)} (${shortId})`;
                
                await supabase.from('clients').insert({
                  id: String(senderId),
                  name: name,
                  status: 'active',
                  pipeline_stage: 'Lead',
                  sentiment_tags: [],
                  utm_source: utmSource,
                  utm_campaign: utmCampaign
                });
              }

              // 2. Insert the received message into the timeline
              await supabase.from('messages').insert({
                client_id: String(senderId),
                platform: platform,
                direction: 'inbound',
                content: text || null,
                audio_url: audioUrl
              });
            }
          }
        }
        
        // Meta requires a 200 OK response quickly to confirm receipt
        return new Response('EVENT_RECEIVED', { status: 200 });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
})
