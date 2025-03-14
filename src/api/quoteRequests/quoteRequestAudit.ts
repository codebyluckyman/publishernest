
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
        id, 
        quote_request_id, 
        changed_by,
        action,
        changes,
        created_at,
        profiles(email)
      `)
      .eq("quote_request_id", quoteRequestId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Properly type cast the data to match QuoteRequestAudit type
    const auditData: QuoteRequestAudit[] = data.map(item => {
      // Cast the action string to our enum type
      const action = item.action as 'create' | 'update' | 'status_change' | 'delete';
      
      // Handle the joined profiles data safely
      let changedByUser: { email: string } | undefined = undefined;
      if (item.profiles && typeof item.profiles === 'object' && 'email' in item.profiles) {
        changedByUser = { email: item.profiles.email as string };
      }
      
      // Cast changes from Json type to our expected Record type
      const changes = item.changes as Record<string, { previous: any; new: any }>;
      
      return {
        id: item.id,
        quote_request_id: item.quote_request_id,
        changed_by: item.changed_by,
        action: action,
        changes: changes || {},
        created_at: item.created_at,
        changed_by_user: changedByUser
      };
    });

    return auditData;
  } catch (error: any) {
    console.error("Error fetching quote request audit:", error);
    throw error;
  }
}
