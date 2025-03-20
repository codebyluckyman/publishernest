
import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { ExtraCostTableItem } from "@/types/extraCost";
import { useOrganization } from "@/hooks/useOrganization";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExtraCostsList } from "./ExtraCostsList";
import { ExtraCostLibraryDialog } from "./ExtraCostLibraryDialog";
import { toast } from "sonner";

export function ExtraCostsField() {
  const { currentOrganization } = useOrganization();
  const { control, setValue, formState, getValues } = useFormContext<QuoteRequestFormValues>();
  const [defaultCostsAdded, setDefaultCostsAdded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  
  // Set up the field array for extra_costs
  const { fields, append, remove } = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  // Add default extra costs from organization settings if available
  useEffect(() => {
    if (!defaultCostsAdded && currentOrganization?.default_extra_costs && currentOrganization.default_extra_costs.length > 0) {
      if (!fields || fields.length === 0) {
        const defaultCosts = currentOrganization.default_extra_costs.map((cost) => ({
          name: cost.name,
          description: cost.description || "",
          unit_of_measure_id: cost.unit_of_measure_id || ""
        }));
        setValue("extra_costs", defaultCosts);
        setDefaultCostsAdded(true);
      }
    }
  }, [currentOrganization, setValue, defaultCostsAdded, fields]);

  const handleLibraryOpen = () => {
    setLibraryOpen(true);
  };

  const handleAddFromLibrary = (cost: ExtraCostTableItem) => {
    console.log("Adding from library:", cost);
    append({
      name: cost.name,
      description: cost.description || "",
      unit_of_measure_id: cost.unit_of_measure_id || ""
    });
    setLibraryOpen(false);
    toast.success(`Added "${cost.name}" to extra costs`);
  };

  const handleAddExtraCost = () => {
    console.log("Add Extra Cost button clicked");
    console.log("Current extra costs before adding:", getValues("extra_costs"));
    
    // Ensure we're adding an empty extra cost
    append({ 
      name: "",
      description: "",
      unit_of_measure_id: ""
    });
    
    console.log("Current extra costs after adding:", getValues("extra_costs"));
    
    // Ensure the collapsible is open when adding a new cost
    if (!isOpen) {
      setIsOpen(true);
    }
    
    // For debugging
    console.log("Fields after append:", fields);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-5">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Extra Costs</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Specify the extra costs to be included on the supplier quote
          </p>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-3">
              <ExtraCostsList control={control} />

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={handleAddExtraCost} 
                  type="button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Extra Cost
                </Button>
                <ExtraCostLibraryDialog 
                  open={libraryOpen} 
                  onOpenChange={setLibraryOpen}
                  onAddFromLibrary={handleAddFromLibrary}
                  onOpen={handleLibraryOpen}
                  organizationId={currentOrganization?.id}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}
