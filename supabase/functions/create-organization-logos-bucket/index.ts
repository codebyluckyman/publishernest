
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create the organization-logos bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw bucketsError;
    }

    const orgLogoBucket = buckets.find(b => b.name === 'organization-logos');
    
    if (!orgLogoBucket) {
      const { error: createError } = await supabase.storage.createBucket(
        'organization-logos',
        { public: true }
      );
      
      if (createError) {
        throw createError;
      }
      
      // Set RLS policy to allow authenticated users to upload
      const { error: policyError } = await supabase.storage.from('organization-logos').createPolicy(
        'authenticated-uploads',
        {
          name: 'authenticated-uploads',
          definition: {
            role: 'authenticated',
            operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
          }
        }
      );
      
      if (policyError) {
        throw policyError;
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "organization-logos bucket is ready" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
