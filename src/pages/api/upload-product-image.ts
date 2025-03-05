
import { supabase } from "@/integrations/supabase/client";

export async function POST(request: Request) {
  const formData = await request.formData();
  
  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/upload-product-image`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      }
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error proxying to Supabase function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to upload image' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
