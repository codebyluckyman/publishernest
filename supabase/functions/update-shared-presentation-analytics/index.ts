
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

    const { viewId, presentationId, sectionsViewed, itemsViewed, viewDuration } = await req.json()

    if (!viewId || !presentationId) {
      return new Response(
        JSON.stringify({ error: 'View ID and presentation ID are required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }

    // Update the analytics record
    const { data, error } = await supabaseClient
      .from('presentation_analytics')
      .update({
        sections_viewed: sectionsViewed || [],
        items_viewed: itemsViewed || [],
        view_duration: viewDuration || 0,
        last_activity: new Date().toISOString()
      })
      .eq('view_id', viewId)
      .eq('presentation_id', presentationId)
      .select()

    if (error) {
      console.error('Error updating analytics:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update analytics' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Unexpected error in update-shared-presentation-analytics:', error)
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
