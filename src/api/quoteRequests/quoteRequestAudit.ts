
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest, QuoteRequestAudit } from "@/types/quoteRequest";

/**
 * Records an audit entry for changes made to a quote request
 */
export async function recordQuoteRequestAudit(
  quoteRequestId: string,
  userId: string,
  previousData: Partial<QuoteRequest>,
  newData: Partial<QuoteRequest>,
  action: 'update' | 'status_change' | 'create' | 'delete'
): Promise<boolean> {
  try {
    // Extract only the changed fields for better audit records
    const changedFields: Record<string, { previous: any; new: any }> = {};
    
    Object.keys(newData).forEach(key => {
      // Skip certain fields we don't want to audit
      if (['updated_at', 'id'].includes(key)) return;
      
      const typedKey = key as keyof QuoteRequest;
      const previousValue = previousData[typedKey];
      const newValue = newData[typedKey];
      
      // Only record if the value has changed
      if (JSON.stringify(previousValue) !== JSON.stringify(newValue)) {
        changedFields[key] = {
          previous: previousValue,
          new: newValue
        };
      }
    });
    
    // If no fields changed, don't create an audit record
    if (Object.keys(changedFields).length === 0 && action === 'update') {
      return true;
    }
    
    // Insert the audit record - using PostgrestFilterBuilder properly
    const { error } = await supabase
      .from('quote_request_audit')
      .insert({
        quote_request_id: quoteRequestId,
        changed_by: userId,
        action,
        changes: changedFields,
      });

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error("Error recording quote request audit:", error);
    return false;
  }
}

/**
 * Fetches audit history for a specific quote request
 */
export async function fetchQuoteRequestAudit(quoteRequestId: string): Promise<QuoteRequestAudit[]> {
  try {
    const { data, error } = await supabase
      .from('quote_request_audit')
      .select(`
        *,
        changed_by_user:changed_by(email)
      `)
      .eq("quote_request_id", quoteRequestId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error("Error fetching quote request audit:", error);
    throw error;
  }
}
