
import { supabase } from "@/integrations/supabase/client";
import { 
  SupplierQuote, 
  SupplierQuoteFormat, 
  SupplierQuoteAttachment, 
  SupplierQuotePriceBreak,
  SupplierQuoteExtraCost,
  SupplierQuoteSaving,
  SupplierQuoteStatus 
} from "@/types/supplierQuote";
import { getPublicUrl } from "./getPublicUrls";

// Function to get public URLs for multiple attachments
async function getPublicUrls(attachments: any[], bucket: string): Promise<SupplierQuoteAttachment[]> {
  const processedAttachments: SupplierQuoteAttachment[] = [];
  
  for (const attachment of attachments) {
    try {
      const url = await getPublicUrl(bucket, attachment.file_key);
      processedAttachments.push({
        ...attachment,
        url
      });
    } catch (error) {
      console.error(`Error getting URL for attachment ${attachment.id}:`, error);
    }
  }
  
  return processedAttachments;
}

export async function fetchSupplierQuoteById(id: string): Promise<SupplierQuote> {
  console.log(`🔍 [fetchSupplierQuoteById] Starting fetch for supplier quote ID: ${id}`);
  
  // Fetch the supplier quote
  const { data: quoteData, error } = await supabase
    .from("supplier_quotes")
    .select(`
      *,
      supplier:suppliers(supplier_name)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(`❌ [fetchSupplierQuoteById] Error fetching supplier quote ${id}:`, error);
    throw new Error(`Error fetching supplier quote: ${error.message}`);
  }

  if (!quoteData) {
    console.error(`❌ [fetchSupplierQuoteById] Supplier quote ${id} not found`);
    throw new Error("Supplier quote not found");
  }

  console.log(`✅ [fetchSupplierQuoteById] Successfully fetched quote data for ${id}:`, {
    quoteId: quoteData.id,
    supplierId: quoteData.supplier_id,
    status: quoteData.status,
    quoteRequestId: quoteData.quote_request_id
  });

  // Fetch the associated quote request to get format information
  const { data: quoteRequest, error: quoteRequestError } = await supabase
    .from("quote_requests")
    .select(`
      *,
      formats:quote_request_formats(
        id,
        format_id,
        notes,
        num_products,
        formats:formats(format_name),
        price_breaks:quote_request_format_price_breaks(
          id,
          quantity,
          num_products
        ),
        products:quote_request_format_products(
          id,
          product_id,
          quantity,
          notes,
          products:products(title)
        )
      ),
      extra_costs:quote_request_extra_costs(
        id,
        name,
        description,
        unit_of_measure_id,
        unit_of_measures:unit_of_measures(
          id,
          name,
          abbreviation,
          is_inventory_unit
        )
      ),
      savings:quote_request_savings(
        id,
        name,
        description,
        unit_of_measure_id,
        unit_of_measures:unit_of_measures(
          id,
          name,
          abbreviation,
          is_inventory_unit
        )
      )
    `)
    .eq("id", quoteData.quote_request_id)
    .single();

  if (quoteRequestError) {
    console.error(`⚠️ [fetchSupplierQuoteById] Error fetching quote request for ${id}:`, quoteRequestError.message);
  }

  // Fetch price breaks for this quote
  console.log(`🔍 [fetchSupplierQuoteById] Fetching price breaks for supplier quote ${id}...`);
  const { data: priceBreaks, error: priceBreaksError } = await supabase
    .from("supplier_quote_price_breaks")
    .select("*")
    .eq("supplier_quote_id", id);

  if (priceBreaksError) {
    console.error(`❌ [fetchSupplierQuoteById] Error fetching price breaks for ${id}:`, priceBreaksError);
  } else {
    console.log(`📊 [fetchSupplierQuoteById] Raw price breaks response for ${id}:`, {
      priceBreaksCount: priceBreaks?.length || 0,
      priceBreaksData: priceBreaks
    });
  }

  // Fetch extra costs for this quote
  console.log(`🔍 [fetchSupplierQuoteById] Fetching extra costs for supplier quote ${id}...`);
  const { data: extraCosts, error: extraCostsError } = await supabase
    .from("supplier_quote_extra_costs")
    .select("*")
    .eq("supplier_quote_id", id);

  if (extraCostsError) {
    console.error(`❌ [fetchSupplierQuoteById] Error fetching extra costs for ${id}:`, extraCostsError);
  } else {
    console.log(`💰 [fetchSupplierQuoteById] Extra costs fetched for ${id}:`, extraCosts?.length || 0);
  }

  // Fetch savings for this quote
  console.log(`🔍 [fetchSupplierQuoteById] Fetching savings for supplier quote ${id}...`);
  const { data: savings, error: savingsError } = await supabase
    .from("supplier_quote_savings")
    .select("*")
    .eq("supplier_quote_id", id);

  if (savingsError) {
    console.error(`❌ [fetchSupplierQuoteById] Error fetching savings for ${id}:`, savingsError);
  } else {
    console.log(`💸 [fetchSupplierQuoteById] Savings fetched for ${id}:`, savings?.length || 0);
  }

  // Fetch the formats for this quote
  const { data: formats, error: formatsError } = await supabase
    .from("supplier_quote_formats")
    .select(`
      *,
      format:formats(*)
    `)
    .eq("supplier_quote_id", id);

  if (formatsError) {
    console.error(`❌ [fetchSupplierQuoteById] Error fetching formats for ${id}:`, formatsError);
  }

  // Process formats to include format names
  const processedFormats: SupplierQuoteFormat[] = formats?.map(f => ({
    id: f.id,
    supplier_quote_id: f.supplier_quote_id,
    format_id: f.format_id,
    quote_request_format_id: f.quote_request_format_id,
    format_name: f.format?.format_name || "Unknown Format",
    dimensions: f.format ? `${f.format.tps_height_mm ?? ''}x${f.format.tps_width_mm ?? ''}x${f.format.tps_depth_mm ?? ''}` : null,
    extent: f.format?.extent || null
  })) || [];

  // Fetch the attachments for this quote
  const { data: attachments, error: attachmentsError } = await supabase
    .from("supplier_quote_attachments")
    .select("*")
    .eq("supplier_quote_id", id);

  if (attachmentsError) {
    console.error(`❌ [fetchSupplierQuoteById] Error fetching attachments for ${id}:`, attachmentsError);
  }

  // Get public URLs for attachments
  let processedAttachments: SupplierQuoteAttachment[] = [];
  if (attachments && attachments.length > 0) {
    processedAttachments = await getPublicUrls(attachments, 'supplier-quote-attachments');
  }

  // Process production schedule to ensure it's a record
  let productionSchedule: Record<string, string | null> | null = null;
  if (quoteData.production_schedule) {
    try {
      // If it's a string, try to parse it, otherwise use it directly
      const scheduleData = typeof quoteData.production_schedule === 'string' 
        ? JSON.parse(quoteData.production_schedule) 
        : quoteData.production_schedule;
        
      productionSchedule = scheduleData as Record<string, string | null>;
    } catch (e) {
      console.error(`❌ [fetchSupplierQuoteById] Error parsing production schedule for ${id}:`, e);
      productionSchedule = null;
    }
  }

  // FIXED: Correct fallback logic - ensure the parentheses are in the right place
  const processedPriceBreaks = (priceBreaks || []) as SupplierQuotePriceBreak[];
  const processedExtraCosts = (extraCosts || []) as SupplierQuoteExtraCost[];
  const processedSavings = (savings || []) as SupplierQuoteSaving[];

  console.log(`📋 [fetchSupplierQuoteById] Final processed data for ${id}:`, {
    priceBreaksCount: processedPriceBreaks.length,
    extraCostsCount: processedExtraCosts.length,
    savingsCount: processedSavings.length,
    formatsCount: processedFormats.length,
    attachmentsCount: processedAttachments.length
  });

  // Combine all data into a single supplier quote object
  const supplierQuote: SupplierQuote = {
    ...quoteData,
    supplier_name: quoteData.supplier?.supplier_name || null,
    title: quoteRequest?.title || null,
    quote_request: quoteRequest || null,
    formats: processedFormats,
    attachments: processedAttachments,
    price_breaks: processedPriceBreaks,
    extra_costs: processedExtraCosts,
    savings: processedSavings,
    status: quoteData.status as SupplierQuoteStatus,
    production_schedule: productionSchedule
  };

  console.log(`✅ [fetchSupplierQuoteById] Successfully completed fetch for ${id} with price_breaks.length:`, supplierQuote.price_breaks.length);

  return supplierQuote;
}
