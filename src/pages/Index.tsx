import { useEffect, useState } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";

// Keep the rest of the code the same, but update the data fetching functions
const Dashboard = () => {
  const { currentOrganization } = useOrganization();
  const [printRunsCount, setPrintRunsCount] = useState<number>(0);
  const [purchaseOrdersCount, setPurchaseOrdersCount] = useState<number>(0);
  
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
    }
  }, [currentOrganization]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {!currentOrganization ? (
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          <p className="text-lg text-muted-foreground">Please select or create an organization to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Print Runs</h2>
            <p className="text-3xl font-bold">{printRunsCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Total print runs</p>
          </div>
          <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Purchase Orders</h2>
            <p className="text-3xl font-bold">{purchaseOrdersCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Total purchase orders</p>
          </div>
          {/* Additional dashboard widgets can be added here */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
