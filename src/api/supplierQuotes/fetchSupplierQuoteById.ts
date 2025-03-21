
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuote, SupplierQuotePriceBreak, SupplierQuoteExtraCost, SupplierQuoteSaving } from "@/types/supplierQuote";

export async function fetchSupplierQuoteById(id: string): Promise<SupplierQuote | null> {
  // Fetch the supplier quote
  const { data: quote, error } = await supabase
    .from("supplier_quotes")
    .select(`
      *,
      quote_requests(
        *,
        formats:quote_request_formats(
          *,
          format:formats(*),
          price_breaks:quote_request_format_price_breaks(*),
          products:quote_request_format_products(
            *,
            product:products(*)
          )
        ),
        extra_costs:quote_request_extra_costs(
          *,
          unit_of_measure:unit_of_measures(*)
        ),
        savings:quote_request_savings(
          *,
          unit_of_measure:unit_of_measures(*)
        )
      ),
      supplier:suppliers(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Error fetching supplier quote: ${error.message}`);
  }

  if (!quote) {
    return null;
  }

  // Fetch price breaks for this supplier quote
  const { data: priceBreaks, error: priceBreaksError } = await supabase
    .from("supplier_quote_price_breaks")
    .select(`
      *,
      format:quote_request_formats(*),
      price_break:quote_request_format_price_breaks(*),
      product:products(*)
    `)
    .eq("supplier_quote_id", id);

  if (priceBreaksError) {
    throw new Error(`Error fetching price breaks: ${priceBreaksError.message}`);
  }

  // Fetch extra costs for this supplier quote
  const { data: extraCosts, error: extraCostsError } = await supabase
    .from("supplier_quote_extra_costs")
    .select(`
      *,
      extra_cost:quote_request_extra_costs(
        *,
        unit_of_measure:unit_of_measures(*)
      )
    `)
    .eq("supplier_quote_id", id);

  if (extraCostsError) {
    throw new Error(`Error fetching extra costs: ${extraCostsError.message}`);
  }

  // Fetch savings for this supplier quote
  const { data: savings, error: savingsError } = await supabase
    .from("supplier_quote_savings")
    .select(`
      *,
      saving:quote_request_savings(
        *,
        unit_of_measure:unit_of_measures(*)
      )
    `)
    .eq("supplier_quote_id", id);

  if (savingsError) {
    throw new Error(`Error fetching savings: ${savingsError.message}`);
  }

  // Construct the full supplier quote object
  const supplierQuote: SupplierQuote = {
    ...quote,
    price_breaks: priceBreaks as unknown as SupplierQuotePriceBreak[],
    extra_costs: extraCosts as unknown as SupplierQuoteExtraCost[],
    savings: savings as unknown as SupplierQuoteSaving[]
  };

  return supplierQuote;
}
