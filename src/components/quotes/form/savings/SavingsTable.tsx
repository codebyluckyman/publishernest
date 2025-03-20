
import { useEffect, useState } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";
import { SavingTableItem } from "@/types/saving";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SavingsTableHeader } from "./SavingsTableHeader";
import { SavingsTableBody } from "./SavingsTableBody";
import { NewSavingRow } from "./NewSavingRow";
import { fetchSavings } from "./savingsService";
import { toast } from "sonner";

export function SavingsTable() {
  const { currentOrganization } = useOrganization();
  const { unitOfMeasures, getUnitNameById } = useUnitOfMeasures();
  const [savings, setSavings] = useState<SavingTableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Load savings when component mounts or organization changes
  useEffect(() => {
    if (currentOrganization) {
      loadSavings();
    }
  }, [currentOrganization, unitOfMeasures]);

  const loadSavings = async () => {
    setLoading(true);
    try {
      const data = await fetchSavings(currentOrganization?.id);
      
      // Enhance with unit names
      const enhancedData = data.map(saving => ({
        ...saving,
        unit_of_measure_name: getUnitNameById(saving.unit_of_measure_id) || saving.unit_of_measure_name
      }));
      
      setSavings(enhancedData);
    } catch (error) {
      console.error("Error fetching savings:", error);
      toast.error("Failed to load savings");
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

  const handleAddSuccess = (newSaving: SavingTableItem) => {
    // Add the unit name to the new saving
    const savingWithUnitName = {
      ...newSaving,
      unit_of_measure_name: getUnitNameById(newSaving.unit_of_measure_id) || newSaving.unit_of_measure_name
    };
    setSavings([...savings, savingWithUnitName]);
    setIsAdding(false);
    toast.success("Saving added successfully");
  };

  const handleUpdateSuccess = (updatedSaving: SavingTableItem) => {
    // Update with the correct unit name
    const savingWithUnitName = {
      ...updatedSaving,
      unit_of_measure_name: getUnitNameById(updatedSaving.unit_of_measure_id) || updatedSaving.unit_of_measure_name
    };
    setSavings(savings.map(saving => 
      saving.id === savingWithUnitName.id ? savingWithUnitName : saving
    ));
    setEditingId(null);
    toast.success("Saving updated successfully");
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setSavings(savings.filter(saving => saving.id !== deletedId));
    toast.success("Saving deleted successfully");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Savings Library</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage standardized savings for your quotes
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <SavingsTableHeader />
              <SavingsTableBody 
                loading={loading}
                savings={savings}
                editingId={editingId}
                setEditingId={setEditingId}
                onUpdateSuccess={handleUpdateSuccess}
                onDeleteSuccess={handleDeleteSuccess}
              />
              {isAdding && (
                <NewSavingRow
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
              Add Saving
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
