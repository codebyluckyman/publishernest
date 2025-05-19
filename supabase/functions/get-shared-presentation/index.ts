
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the access code from the request URL
    const url = new URL(req.url)
    const accessCode = url.searchParams.get('accessCode')

    if (!accessCode) {
      return new Response(
        JSON.stringify({ error: 'Access code is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }

    // Get presentation data using the database function
    const { data, error } = await supabaseClient
      .rpc('fetch_shared_presentation', { access_code: accessCode })
      .single()

    if (error) {
      console.error('Error fetching shared presentation:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch presentation' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Presentation not found or expired' }),
        { 
          status: 404, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }

    // Record the view in presentation_analytics
    const sessionId = crypto.randomUUID()
    const viewerIp = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown'
    const viewerDevice = req.headers.get('user-agent') || 'unknown'
    
    // Create view analytics entry
    await supabaseClient
      .from('presentation_analytics')
      .insert({
        presentation_id: data.id,
        view_id: sessionId,
        viewer_ip: viewerIp,
        viewer_device: viewerDevice,
      })
      .select()
    
    // Update access count in presentation_shares table
    // We use the access code to find the right share record
    await supabaseClient.rpc('increment_presentation_share_access', { code: accessCode })
    
    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Unexpected error in get-shared-presentation:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})
