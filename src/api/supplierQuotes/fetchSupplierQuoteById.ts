
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuote, SupplierQuoteAttachment, SupplierQuoteExtraCost, SupplierQuoteFormat, SupplierQuotePriceBreak, SupplierQuoteSaving } from "@/types/supplierQuote";

export async function fetchSupplierQuoteById(id: string): Promise<SupplierQuote | null> {
  // Fetch the quote
  const { data: quote, error } = await supabase
    .from("supplier_quotes")
    .select(`
      *,
      quote_request:quote_requests(
        id,
        title,
        description,
        currency,
        due_date,
        formats:quote_request_formats(
          id,
          format_id,
          notes,
          price_breaks:quote_request_price_breaks(*)
        )
      ),
      supplier:suppliers(id, supplier_name, contact_name, contact_email)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching supplier quote:", error);
    throw error;
  }

  if (!quote) return null;

  // Fetch price breaks
  const { data: priceBreaks, error: priceBreakError } = await supabase
    .from("supplier_quote_price_breaks")
    .select(`
      *,
      format:quote_request_formats(
        id,
        format_id,
        quote_request_id,
        notes
      ),
      product:quote_request_format_products(
        product_id,
        quantity,
        notes
      )
    `)
    .eq("supplier_quote_id", id);

  if (priceBreakError) {
    console.error("Error fetching price breaks:", priceBreakError);
    throw priceBreakError;
  }

  // Fetch extra costs
  const { data: extraCosts, error: extraCostsError } = await supabase
    .from("supplier_quote_extra_costs")
    .select(`
      *,
      extra_cost:extra_costs(*)
    `)
    .eq("supplier_quote_id", id);

  if (extraCostsError) {
    console.error("Error fetching extra costs:", extraCostsError);
    throw extraCostsError;
  }

  // Fetch savings
  const { data: savings, error: savingsError } = await supabase
    .from("supplier_quote_savings")
    .select(`
      *,
      saving:savings(*)
    `)
    .eq("supplier_quote_id", id);

  if (savingsError) {
    console.error("Error fetching savings:", savingsError);
    throw savingsError;
  }

  // Fetch formats
  const { data: formats, error: formatsError } = await supabase
    .from("supplier_quote_formats")
    .select(`
      *,
      format:formats(
        id,
        format_name,
        tps_height_mm,
        tps_width_mm,
        tps_depth_mm,
        extent
      )
    `)
    .eq("supplier_quote_id", id);

  if (formatsError) {
    console.error("Error fetching formats:", formatsError);
    throw formatsError;
  }

  // Fetch attachments
  const { data: attachments, error: attachmentsError } = await supabase
    .rpc('get_quote_attachments', { quote_id: id });

  if (attachmentsError) {
    console.error("Error fetching attachments:", attachmentsError);
    throw attachmentsError;
  }

  // Return structured data with proper type assertions
  return {
    ...quote,
    quote_request: quote.quote_request as any, // Type assertion for the complex nested structure
    status: quote.status as SupplierQuote["status"],
    production_schedule: quote.production_schedule as Record<string, string | null> | null,
    price_breaks: priceBreaks as unknown as SupplierQuotePriceBreak[],
    extra_costs: extraCosts as unknown as SupplierQuoteExtraCost[],
    savings: savings as unknown as SupplierQuoteSaving[],
    attachments: attachments as SupplierQuoteAttachment[],
    formats: formats ? formats.map(f => ({
      id: f.id,
      format_id: f.format_id,
      quote_request_format_id: f.quote_request_format_id,
      format_name: f.format?.format_name || "Unknown Format",
      dimensions: f.format ? `${f.format.tps_width_mm || '-'}mm × ${f.format.tps_height_mm || '-'}mm` : null,
      extent: f.format?.extent || null
    })) : [],
    reference: quote.reference || null
  };
}
