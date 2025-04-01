
import { supabase } from "@/integrations/supabase/client";
import { 
  SupplierQuote, 
  SupplierQuoteFormat, 
  SupplierQuoteAttachment, 
  SupplierQuotePriceBreak,
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
    throw new Error(`Error fetching supplier quote: ${error.message}`);
  }

  if (!quoteData) {
    throw new Error("Supplier quote not found");
  }

  // Fetch the associated quote request to get format information
  const { data: quoteRequest, error: quoteRequestError } = await supabase
    .from("quote_requests")
    .select(`
      *,
      formats:quote_request_formats(
        id,
        format_id,
        notes,
        formats:formats(format_name),
        price_breaks:quote_request_format_price_breaks(
          id,
          quantity
        ),
        products:quote_request_format_products(
          id,
          product_id,
          quantity,
          notes,
          products:products(title)
        )
      )
    `)
    .eq("id", quoteData.quote_request_id)
    .single();

  if (quoteRequestError) {
    console.error("Error fetching quote request:", quoteRequestError.message);
  }

  // Fetch price breaks for this quote
  const { data: priceBreaks, error: priceBreaksError } = await supabase
    .from("supplier_quote_price_breaks")
    .select("*")
    .eq("supplier_quote_id", id);

  if (priceBreaksError) {
    console.error("Error fetching price breaks:", priceBreaksError.message);
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
    console.error("Error fetching formats:", formatsError.message);
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
    console.error("Error fetching attachments:", attachmentsError.message);
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
      console.error("Error parsing production schedule:", e);
      productionSchedule = null;
    }
  }

  // Combine all data into a single supplier quote object
  const supplierQuote: SupplierQuote = {
    ...quoteData,
    quote_request: quoteRequest || null,
    formats: processedFormats,
    attachments: processedAttachments,
    price_breaks: priceBreaks as SupplierQuotePriceBreak[] || [],
    status: quoteData.status as SupplierQuoteStatus,
    production_schedule: productionSchedule
  };

  return supplierQuote;
}
