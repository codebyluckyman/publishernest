
import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { useOrganization } from "@/hooks/useOrganization";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExtraCostsList } from "./ExtraCostsList";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Library } from "lucide-react";
import { ExtraCostLibraryDialog } from "./ExtraCostLibraryDialog";
import { ExtraCostTableItem } from "@/types/extraCost";
import { toast } from "sonner";

export function ExtraCostsField() {
  const { currentOrganization } = useOrganization();
  const { control, setValue, getValues, watch } = useFormContext<QuoteRequestFormValues>();
  const [defaultCostsAdded, setDefaultCostsAdded] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Start collapsed
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  // Set up the field array for extra_costs
  const { fields, append } = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  // Force re-render when fields change
  const extraCosts = watch("extra_costs");
  
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
        console.log("Default extra costs added:", defaultCosts);
      }
    }
  }, [currentOrganization, setValue, defaultCostsAdded, fields]);

  // Handle adding an extra cost from the library
  const handleAddFromLibrary = (cost: ExtraCostTableItem) => {
    const currentCosts = getValues("extra_costs") || [];
    
    // Check if cost already exists in the form
    const alreadyExists = currentCosts.some(
      existingCost => existingCost.name === cost.name
    );
    
    if (alreadyExists) {
      toast.warning(`"${cost.name}" is already added to this quote request`);
      return;
    }
    
    // Add the new cost
    append({
      name: cost.name,
      description: cost.description || "",
      unit_of_measure_id: cost.unit_of_measure_id || ""
    });
    
    toast.success(`"${cost.name}" added to extra costs`);
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
            Extra costs included on the quote request
          </p>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-3">
              <ExtraCostsList control={control} extraCosts={extraCosts} />
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsLibraryOpen(true)}
                className="w-full"
                type="button"
              >
                <Library className="h-4 w-4 mr-2" />
                Add from Library
              </Button>
              
              <ExtraCostLibraryDialog
                open={isLibraryOpen}
                onOpenChange={setIsLibraryOpen}
                onAddFromLibrary={handleAddFromLibrary}
                organizationId={currentOrganization?.id}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}
