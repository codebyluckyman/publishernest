
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
    const formData = await req.formData();
    const file = formData.get('file');
    const organizationId = formData.get('organizationId');

    if (!file || !organizationId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or organization ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Sanitize filename and generate a unique path
    const fileName = file.name.replace(/[^\x00-\x7F]/g, '');
    const fileExt = fileName.split('.').pop();
    const sanitizedName = fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().getTime();
    const filePath = `organizations/${organizationId}/products/${sanitizedName}_${timestamp}.${fileExt}`;

    // Upload file to storage
    const { data, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({ url: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
