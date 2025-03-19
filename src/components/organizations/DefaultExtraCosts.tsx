
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import { DefaultExtraCost } from "@/types/extraCost";
import { toast } from "sonner";

export function DefaultExtraCosts() {
  const { currentOrganization, updateOrganizationSetting } = useOrganization();
  const [extraCosts, setExtraCosts] = useState<DefaultExtraCost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing extra costs from the organization
  useEffect(() => {
    if (currentOrganization?.default_extra_costs) {
      setExtraCosts(currentOrganization.default_extra_costs);
    } else {
      setExtraCosts([]);
    }
  }, [currentOrganization]);

  const handleAddCost = () => {
    setExtraCosts([...extraCosts, { name: "" }]);
  };

  const handleRemoveCost = (index: number) => {
    const updatedCosts = [...extraCosts];
    updatedCosts.splice(index, 1);
    setExtraCosts(updatedCosts);
  };

  const handleUpdateCost = (index: number, field: keyof DefaultExtraCost, value: string) => {
    const updatedCosts = [...extraCosts];
    // @ts-ignore - We know the field and value types match
    updatedCosts[index][field] = value;
    setExtraCosts(updatedCosts);
  };

  const handleSubmit = async () => {
    // Validate that each cost has at least a name
    if (extraCosts.some(cost => !cost.name.trim())) {
      toast.error("All extra costs must have a name");
      return;
    }
    
    setIsLoading(true);
    try {
      await updateOrganizationSetting('default_extra_costs', extraCosts);
      toast.success("Default extra costs updated successfully");
    } catch (error) {
      console.error("Error updating default extra costs:", error);
      toast.error("Failed to update default extra costs");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Extra Costs</CardTitle>
        <CardDescription>
          Configure standard extra costs that will be included in all quote requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {extraCosts.length === 0 ? (
          <div className="text-center p-4 border border-dashed rounded-md">
            <p className="text-muted-foreground text-sm">
              No default extra costs configured yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {extraCosts.map((cost, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <Input
                    placeholder="Cost name"
                    value={cost.name}
                    onChange={(e) => handleUpdateCost(index, 'name', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="col-span-5">
                  <Textarea
                    placeholder="Description (optional)"
                    value={cost.description || ""}
                    onChange={(e) => handleUpdateCost(index, 'description', e.target.value)}
                    className="w-full h-10 min-h-10 resize-none"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Unit of measure"
                    value={cost.unit_of_measure || ""}
                    onChange={(e) => handleUpdateCost(index, 'unit_of_measure', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCost(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={handleAddCost}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Extra Cost
          </Button>
          
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Default Extra Costs"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
