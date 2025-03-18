
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type StockUpdate = {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  operation?: "set" | "add" | "subtract";
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get API key from headers
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing API key" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the API key
    const { data: orgData, error: orgError } = await supabase.rpc('validate_api_key', { key: apiKey });
    if (orgError || !orgData) {
      console.error("API key validation error:", orgError);
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const organizationId = orgData;
    console.log(`Request authenticated for organization: ${organizationId}`);

    // Parse the request body
    const { updates } = await req.json();
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request format. Expected an array of stock updates." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each stock update
    const results = [];
    for (const update of updates as StockUpdate[]) {
      const { product_id, warehouse_id, quantity, operation = "set" } = update;
      
      if (!product_id || !warehouse_id || quantity === undefined) {
        results.push({ 
          product_id, warehouse_id, 
          status: "error", 
          message: "Missing required fields" 
        });
        continue;
      }

      // Check if product exists and belongs to the organization
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', product_id)
        .eq('organization_id', organizationId)
        .single();

      if (productError || !productData) {
        results.push({ 
          product_id, warehouse_id, 
          status: "error", 
          message: "Product not found or not accessible" 
        });
        continue;
      }

      // Check if warehouse exists and belongs to the organization
      const { data: warehouseData, error: warehouseError } = await supabase
        .from('warehouses')
        .select('id')
        .eq('id', warehouse_id)
        .eq('organization_id', organizationId)
        .single();

      if (warehouseError || !warehouseData) {
        results.push({ 
          product_id, warehouse_id, 
          status: "error", 
          message: "Warehouse not found or not accessible" 
        });
        continue;
      }

      try {
        let stockResult;
        
        if (operation === "set") {
          // Set the stock quantity directly
          const { data, error } = await supabase
            .from('stock_on_hand')
            .upsert({
              product_id,
              warehouse_id,
              organization_id: organizationId,
              quantity
            }, { onConflict: 'product_id,warehouse_id' });
          
          if (error) throw error;
          stockResult = data;
        } 
        else {
          // For add/subtract, first get current quantity
          const { data: currentStock, error: stockError } = await supabase
            .from('stock_on_hand')
            .select('quantity')
            .eq('product_id', product_id)
            .eq('warehouse_id', warehouse_id)
            .single();
            
          if (stockError && stockError.code !== 'PGRST116') { // Not found is ok
            throw stockError;
          }
          
          const currentQuantity = currentStock?.quantity || 0;
          let newQuantity;
          
          if (operation === "add") {
            newQuantity = currentQuantity + quantity;
          } else if (operation === "subtract") {
            newQuantity = Math.max(0, currentQuantity - quantity); // Prevent negative stock
          } else {
            newQuantity = quantity;
          }
          
          const { data, error } = await supabase
            .from('stock_on_hand')
            .upsert({
              product_id,
              warehouse_id,
              organization_id: organizationId,
              quantity: newQuantity
            }, { onConflict: 'product_id,warehouse_id' });
            
          if (error) throw error;
          stockResult = data;
        }
        
        results.push({ 
          product_id, 
          warehouse_id, 
          status: "success", 
          operation,
          quantity: quantity 
        });
      } catch (error) {
        console.error(`Error updating stock for product ${product_id}:`, error);
        results.push({ 
          product_id, 
          warehouse_id, 
          status: "error", 
          message: error.message || "Failed to update stock" 
        });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error processing stock update:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
