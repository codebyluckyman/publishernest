
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequestFormat } from "@/types/quoteRequest";
import { updateFormatProducts } from "./formatProductOperations";
import { updateFormatPriceBreaks } from "./formatPriceBreakOperations";

/**
 * Creates a new format for a quote request
 */
export async function createFormat(
  quoteRequestId: string,
  format: Partial<QuoteRequestFormat>
): Promise<{ id: string } | null> {
  const { data: newFormat, error: insertFormatError } = await supabase
    .from("quote_request_formats")
    .insert({
      quote_request_id: quoteRequestId,
      format_id: format.format_id,
      notes: format.notes || null,
      num_products: format.num_products || 1
    })
    .select("id")
    .single();

  if (insertFormatError) {
    console.error("Error inserting new format:", insertFormatError);
    throw insertFormatError;
  }

  return newFormat;
}

/**
 * Updates an existing format for a quote request
 */
export async function updateFormat(
  formatId: string,
  format: Partial<QuoteRequestFormat>
): Promise<void> {
  const { error: updateFormatError } = await supabase
    .from("quote_request_formats")
    .update({
      notes: format.notes || null,
      num_products: format.num_products || 1
    })
    .eq("id", formatId);

  if (updateFormatError) {
    console.error("Error updating format:", updateFormatError);
    throw updateFormatError;
  }
}

/**
 * Handle all format operations for a quote request - create, update, or delete formats as needed
 */
export async function handleFormatOperations(
  quoteRequestId: string,
  formats: Partial<QuoteRequestFormat>[] = [],
  existingFormats: Partial<QuoteRequestFormat>[] = []
): Promise<void> {
  // Get all format IDs in the update
  const updatedFormatIds = new Set(
    formats
      .filter(format => format.format_id)
      .map(format => format.format_id)
  );

  // Delete formats no longer in the update
  for (const existingFormat of existingFormats) {
    if (existingFormat.id && existingFormat.format_id && !updatedFormatIds.has(existingFormat.format_id)) {
      const { error: deleteFormatError } = await supabase
        .from("quote_request_formats")
        .delete()
        .eq("id", existingFormat.id);

      if (deleteFormatError) {
        console.error("Error deleting format:", deleteFormatError);
        throw deleteFormatError;
      }
    }
  }

  // Upsert each format
  for (const format of formats) {
    // Skip invalid format entries
    if (!format.format_id) continue;

    // Check if this format already exists
    const existingFormat = existingFormats.find(
      ef => ef.format_id === format.format_id
    );

    if (existingFormat?.id) {
      // Update existing format
      await updateFormat(existingFormat.id, format);

      // Handle products for this format
      await updateFormatProducts(existingFormat.id, format.products);

      // Handle price breaks for this format, passing the num_products value
      await updateFormatPriceBreaks(existingFormat.id, format.price_breaks, format.num_products || 1);
    } else {
      // Create new format
      const newFormat = await createFormat(quoteRequestId, format);

      if (newFormat) {
        // Handle products for this new format
        await updateFormatProducts(newFormat.id, format.products);

        // Handle price breaks for this new format, passing the num_products value
        await updateFormatPriceBreaks(newFormat.id, format.price_breaks, format.num_products || 1);
      }
    }
  }
}
