
import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp, Library } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { SavingTableItem } from "@/types/saving";
import { useOrganization } from "@/hooks/useOrganization";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SavingsList } from "./SavingsList";
import { SavingLibraryDialog } from "./SavingLibraryDialog";
import { toast } from "sonner";

export function SavingsField() {
  const { currentOrganization } = useOrganization();
  const { control, setValue, formState, getValues, watch } = useFormContext<QuoteRequestFormValues>();
  const [defaultSavingsAdded, setDefaultSavingsAdded] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Start with the section open for better visibility
  const [libraryOpen, setLibraryOpen] = useState(false);
  
  // Set up the field array for savings
  const { fields, append, remove } = useFieldArray({
    control,
    name: "savings"
  });
  
  // Force re-render when fields change
  const savings = watch("savings");
  
  // Log savings state for debugging
  useEffect(() => {
    console.log("SavingsField rendered, current savings:", savings);
    console.log("Fields in SavingsField:", fields);
  }, [savings, fields]);

  // Check if we already have savings from the form (existing quote being edited)
  useEffect(() => {
    const existingSavings = getValues("savings");
    if (existingSavings && existingSavings.length > 0) {
      console.log("Existing savings found:", existingSavings);
      setDefaultSavingsAdded(true);
    }
  }, [getValues]);
  
  // Add default savings from organization settings if available and no existing savings
  useEffect(() => {
    if (!defaultSavingsAdded && currentOrganization?.default_savings && currentOrganization.default_savings.length > 0) {
      const existingSavings = getValues("savings");
      
      if (!existingSavings || existingSavings.length === 0) {
        const defaultSavings = currentOrganization.default_savings.map((saving) => ({
          name: saving.name,
          description: saving.description || "",
          unit_of_measure_id: saving.unit_of_measure_id || ""
        }));
        setValue("savings", defaultSavings);
        setDefaultSavingsAdded(true);
        console.log("Default savings added:", defaultSavings);
      }
    }
  }, [currentOrganization, setValue, defaultSavingsAdded, getValues, fields]);

  const handleLibraryOpen = () => {
    setLibraryOpen(true);
  };

  const handleAddFromLibrary = (saving: SavingTableItem) => {
    console.log("Adding from library:", saving);
    append({
      name: saving.name,
      description: saving.description || "",
      unit_of_measure_id: saving.unit_of_measure_id || ""
    });
    setLibraryOpen(false);
    toast.success(`Added "${saving.name}" to savings`);
  };

  const handleAddSaving = () => {
    console.log("Add Saving button clicked");
    console.log("Current savings before adding:", getValues("savings"));
    
    // Ensure we're adding an empty saving
    append({ 
      name: "",
      description: "",
      unit_of_measure_id: ""
    });
    
    // Log the updated state
    setTimeout(() => {
      console.log("Current savings after adding:", getValues("savings"));
      console.log("Fields after append:", fields);
    }, 0);
    
    // Ensure the collapsible is open when adding a new saving
    if (!isOpen) {
      setIsOpen(true);
    }
    
    // Show success toast for better user feedback
    toast.success("New saving field added");
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-5">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Savings</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Specify the savings to be included on the supplier quote
          </p>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-3">
              {/* Pass the savings array to trigger re-render when it changes */}
              <SavingsList control={control} savings={savings} />

              <div className="flex space-x-2">
                <Button 
                  variant="success"  
                  size="sm" 
                  onClick={handleAddSaving} 
                  type="button"
                  data-testid="add-saving-button"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Saving
                </Button>
                <SavingLibraryDialog 
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
