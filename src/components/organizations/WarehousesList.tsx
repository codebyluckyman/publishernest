
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Warehouse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "sonner";

type Warehouse = {
  id: string;
  name: string;
  location: string | null;
  organization_id: string;
};

interface WarehousesListProps {
  organizationId: string;
}

export const WarehousesList = ({ organizationId }: WarehousesListProps) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newWarehouseName, setNewWarehouseName] = useState("");
  const [newWarehouseLocation, setNewWarehouseLocation] = useState("");
  const { currentOrganization } = useOrganization();

  const fetchWarehouses = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');
        
      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      toast.error("Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [organizationId]);

  const addWarehouse = async () => {
    if (!newWarehouseName.trim()) {
      toast.error("Warehouse name is required");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('warehouses')
        .insert({
          name: newWarehouseName.trim(),
          location: newWarehouseLocation.trim() || null,
          organization_id: organizationId
        });
        
      if (error) throw error;
      
      toast.success("Warehouse added successfully");
      setNewWarehouseName("");
      setNewWarehouseLocation("");
      setIsAdding(false);
      fetchWarehouses();
    } catch (error) {
      console.error("Error adding warehouse:", error);
      toast.error("Failed to add warehouse");
    }
  };

  const deleteWarehouse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this warehouse? This will also delete all stock records associated with this warehouse.")) {
      return;
    }
    
    try {
      // First delete associated stock records
      const { error: stockError } = await supabase
        .from('stock_on_hand')
        .delete()
        .eq('warehouse_id', id);
        
      if (stockError) throw stockError;
      
      // Then delete the warehouse
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success("Warehouse deleted successfully");
      fetchWarehouses();
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      toast.error("Failed to delete warehouse");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Warehouse className="h-5 w-5" />
          Warehouses
        </CardTitle>
        <CardDescription>Manage your organization's warehouses</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading warehouses...</div>
        ) : (
          <div className="space-y-4">
            {warehouses.length === 0 && !isAdding ? (
              <div className="text-center py-4 text-gray-500">
                No warehouses added yet. Add your first warehouse to start tracking inventory.
              </div>
            ) : (
              <div className="space-y-3">
                {warehouses.map(warehouse => (
                  <div key={warehouse.id} className="flex items-center justify-between border rounded-md p-3">
                    <div>
                      <div className="font-medium">{warehouse.name}</div>
                      {warehouse.location && (
                        <div className="text-sm text-gray-500">{warehouse.location}</div>
                      )}
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteWarehouse(warehouse.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {isAdding ? (
              <div className="border rounded-md p-4 space-y-4">
                <h3 className="font-medium">Add New Warehouse</h3>
                <div className="space-y-2">
                  <Label htmlFor="warehouse-name">Warehouse Name</Label>
                  <Input 
                    id="warehouse-name"
                    value={newWarehouseName}
                    onChange={e => setNewWarehouseName(e.target.value)}
                    placeholder="Main Warehouse"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouse-location">Location (Optional)</Label>
                  <Input 
                    id="warehouse-location"
                    value={newWarehouseLocation}
                    onChange={e => setNewWarehouseLocation(e.target.value)}
                    placeholder="New York, NY"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addWarehouse}>
                    Save Warehouse
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Warehouse
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
