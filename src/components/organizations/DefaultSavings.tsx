
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import { DefaultSaving, SavingTableItem } from "@/types/saving";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SavingsList } from "./savings/SavingsList";

export function DefaultSavings() {
  const { currentOrganization, updateOrganizationSetting } = useOrganization();
  const [savings, setSavings] = useState<DefaultSaving[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Set to true to ensure it's initially expanded

  useEffect(() => {
    if (currentOrganization?.default_savings) {
      console.log("Loading default savings:", currentOrganization.default_savings);
      setSavings(currentOrganization.default_savings);
    } else {
      setSavings([]);
    }
  }, [currentOrganization]);

  const handleAddSaving = () => {
    setSavings([...savings, { name: "" }]);
  };

  const handleRemoveSaving = (index: number) => {
    const updatedSavings = [...savings];
    updatedSavings.splice(index, 1);
    setSavings(updatedSavings);
  };

  const handleUpdateSaving = (index: number, field: keyof DefaultSaving, value: string) => {
    const updatedSavings = [...savings];
    updatedSavings[index][field] = value;
    setSavings(updatedSavings);
  };

  const handleAddFromLibrary = (saving: SavingTableItem) => {
    setSavings([...savings, {
      name: saving.name,
      description: saving.description || "",
      unit_of_measure_id: saving.unit_of_measure_id || undefined
    }]);
  };

  const handleSubmit = async () => {
    if (savings.some(saving => !saving.name.trim())) {
      toast.error("All savings must have a name");
      return;
    }
    
    setIsLoading(true);
    try {
      await updateOrganizationSetting('default_savings', savings);
      toast.success("Default savings updated successfully");
    } catch (error) {
      console.error("Error updating default savings:", error);
      toast.error("Failed to update default savings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <div className="flex items-center justify-between">
            <CardTitle>Default Savings</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription>
            Configure standard savings that will be included in all quote requests
          </CardDescription>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-4">
              <SavingsList
                savings={savings}
                organizationId={currentOrganization?.id || ''}
                onAddSaving={handleAddSaving}
                onRemoveSaving={handleRemoveSaving}
                onUpdateSaving={handleUpdateSaving}
                onAddFromLibrary={handleAddFromLibrary}
              />
              
              <Button 
                size="sm" 
                onClick={handleSubmit} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Default Savings"}
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}
