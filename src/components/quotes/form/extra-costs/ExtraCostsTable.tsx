
import { useEffect, useState } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";
import { ExtraCostTableItem } from "@/types/extraCost";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExtraCostsTableHeader } from "./ExtraCostsTableHeader";
import { ExtraCostsTableBody } from "./ExtraCostsTableBody";
import { NewExtraCostRow } from "./NewExtraCostRow";
import { fetchExtraCosts } from "./extraCostsService";
import { toast } from "sonner";

export function ExtraCostsTable() {
  const { currentOrganization } = useOrganization();
  const { unitOfMeasures, getUnitNameById } = useUnitOfMeasures();
  const [extraCosts, setExtraCosts] = useState<ExtraCostTableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Load extra costs when component mounts or organization changes
  useEffect(() => {
    if (currentOrganization) {
      loadExtraCosts();
    }
  }, [currentOrganization]);

  const loadExtraCosts = async () => {
    setLoading(true);
    try {
      const data = await fetchExtraCosts(currentOrganization?.id);
      // Enhance with unit names if needed
      const enhancedData = data.map(cost => ({
        ...cost,
        unit_of_measure_name: getUnitNameById(cost.unit_of_measure_id) || cost.unit_of_measure_name
      }));
      setExtraCosts(enhancedData);
    } catch (error) {
      console.error("Error fetching extra costs:", error);
      toast.error("Failed to load extra costs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleAddCancel = () => {
    setIsAdding(false);
  };

  const handleAddSuccess = (newCost: ExtraCostTableItem) => {
    // Add the unit name to the new cost
    const costWithUnitName = {
      ...newCost,
      unit_of_measure_name: getUnitNameById(newCost.unit_of_measure_id) || newCost.unit_of_measure_name
    };
    setExtraCosts([...extraCosts, costWithUnitName]);
    setIsAdding(false);
    toast.success("Extra cost added successfully");
  };

  const handleUpdateSuccess = (updatedCost: ExtraCostTableItem) => {
    // Update with the correct unit name
    const costWithUnitName = {
      ...updatedCost,
      unit_of_measure_name: getUnitNameById(updatedCost.unit_of_measure_id) || updatedCost.unit_of_measure_name
    };
    setExtraCosts(extraCosts.map(cost => 
      cost.id === costWithUnitName.id ? costWithUnitName : cost
    ));
    setEditingId(null);
    toast.success("Extra cost updated successfully");
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setExtraCosts(extraCosts.filter(cost => cost.id !== deletedId));
    toast.success("Extra cost deleted successfully");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Extra Costs Library</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage standardized extra costs for your quotes
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <ExtraCostsTableHeader />
              <ExtraCostsTableBody 
                loading={loading}
                extraCosts={extraCosts}
                editingId={editingId}
                setEditingId={setEditingId}
                onUpdateSuccess={handleUpdateSuccess}
                onDeleteSuccess={handleDeleteSuccess}
              />
              {isAdding && (
                <NewExtraCostRow
                  organizationId={currentOrganization?.id || ''}
                  onAddSuccess={handleAddSuccess}
                  onCancel={handleAddCancel}
                />
              )}
            </table>
          </div>
          
          {!isAdding && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2" 
              onClick={handleAddClick}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Extra Cost
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
