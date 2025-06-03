
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate API key if provided
    const apiKey = req.headers.get('x-api-key')
    if (apiKey) {
      const { data: orgId, error: apiError } = await supabaseClient.rpc('validate_api_key', {
        key: apiKey
      })
      
      if (apiError || !orgId) {
        return new Response(
          JSON.stringify({ error: 'Invalid API key' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Parse request body
    const { 
      organization_id,
      notification_type,
      title,
      message,
      user_id,
      data,
      expires_at,
      priority
    } = await req.json()

    // Validate required fields
    if (!organization_id || !notification_type || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: organization_id, notification_type, title, message' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create the notification
    const { data: notificationId, error } = await supabaseClient.rpc('create_organization_notification', {
      p_organization_id: organization_id,
      p_notification_type: notification_type,
      p_title: title,
      p_message: message,
      p_user_id: user_id || null,
      p_data: data || {},
      p_expires_at: expires_at || null,
      p_priority: priority || 'normal'
    })

    if (error) {
      console.error('Error creating notification:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create notification' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification_id: notificationId,
        message: 'Notification created successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in create-organization-notification function:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
