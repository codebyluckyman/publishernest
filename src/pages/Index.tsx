import { useEffect, useState } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";

// Keep the rest of the code the same, but update the data fetching functions
const Dashboard = () => {
  // ... keep existing code (state variables)
  
  useEffect(() => {
    if (currentOrganization) {
      // Fetch print runs count
      const fetchPrintRunsCount = async () => {
        const { count, error } = await supabase
          .from('print_runs')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id);
          
        if (!error && count !== null) {
          setPrintRunsCount(count);
        }
      };
      
      // Fetch purchase orders count
      const fetchPurchaseOrdersCount = async () => {
        const { count, error } = await supabase
          .from('purchase_orders')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id);
          
        if (!error && count !== null) {
          setPurchaseOrdersCount(count);
        }
      };
      
      // Call the fetch functions
      fetchPrintRunsCount();
      fetchPurchaseOrdersCount();
      // Keep other fetch functions
    }
  }, [currentOrganization]);

  // ... keep existing code (the rest of the dashboard)
}

export default Dashboard;
