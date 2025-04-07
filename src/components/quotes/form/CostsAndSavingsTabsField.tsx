
import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { useOrganization } from "@/hooks/useOrganization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtraCostsList } from "./extra-costs/ExtraCostsList";
import { SavingsList } from "./savings/SavingsList";
import { Button } from "@/components/ui/button";
import { Library, Plus } from "lucide-react";
import { ExtraCostLibraryDialog } from "./extra-costs/ExtraCostLibraryDialog";
import { SavingLibraryDialog } from "./savings/SavingLibraryDialog";
import { ExtraCostTableItem } from "@/types/extraCost";
import { SavingTableItem } from "@/types/saving";
import { toast } from "sonner";

export function CostsAndSavingsTabsField() {
  const { currentOrganization } = useOrganization();
  const { control, setValue, getValues, watch } = useFormContext<QuoteRequestFormValues>();
  const [defaultCostsAdded, setDefaultCostsAdded] = useState(false);
  const [defaultSavingsAdded, setDefaultSavingsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("extra-costs");
  const [isExtraCostLibraryOpen, setIsExtraCostLibraryOpen] = useState(false);
  const [isSavingLibraryOpen, setIsSavingLibraryOpen] = useState(false);
  
  // Set up the field arrays
  const extraCostsFieldArray = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  const savingsFieldArray = useFieldArray({
    control,
    name: "savings"
  });
  
  // Force re-render when fields change
  const extraCosts = watch("extra_costs");
  const savings = watch("savings");
  
  // Add default extra costs from organization settings if available
  useEffect(() => {
    if (!defaultCostsAdded && currentOrganization?.default_extra_costs && currentOrganization.default_extra_costs.length > 0) {
      if (!extraCostsFieldArray.fields || extraCostsFieldArray.fields.length === 0) {
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
  }, [currentOrganization, setValue, defaultCostsAdded, extraCostsFieldArray.fields]);

  // Add default savings from organization settings if available
  useEffect(() => {
    if (!defaultSavingsAdded && currentOrganization?.default_savings && currentOrganization.default_savings.length > 0) {
      if (!savingsFieldArray.fields || savingsFieldArray.fields.length === 0) {
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
  }, [currentOrganization, setValue, defaultSavingsAdded, savingsFieldArray.fields]);

  // Handle adding an extra cost from the library
  const handleAddExtraCostFromLibrary = (cost: ExtraCostTableItem) => {
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
    extraCostsFieldArray.append({
      name: cost.name,
      description: cost.description || "",
      unit_of_measure_id: cost.unit_of_measure_id || ""
    });
    
    // Ensure we're on the extra costs tab
    setActiveTab("extra-costs");
    
    toast.success(`"${cost.name}" added to extra costs`);
  };

  // Handle adding a saving from the library
  const handleAddSavingFromLibrary = (saving: SavingTableItem) => {
    console.log("Adding from library:", saving);
    savingsFieldArray.append({
      name: saving.name,
      description: saving.description || "",
      unit_of_measure_id: saving.unit_of_measure_id || ""
    });
    
    // Ensure we're on the savings tab
    setActiveTab("savings");
    
    toast.success(`Added "${saving.name}" to savings`);
  };

  const handleAddSaving = () => {
    console.log("Add Saving button clicked");
    console.log("Current savings before adding:", getValues("savings"));
    
    // Ensure we're adding an empty saving
    savingsFieldArray.append({ 
      name: "",
      description: "",
      unit_of_measure_id: ""
    });
    
    // Log the updated state
    setTimeout(() => {
      console.log("Current savings after adding:", getValues("savings"));
      console.log("Fields after append:", savingsFieldArray.fields);
    }, 0);
    
    // Show success toast for better user feedback
    toast.success("New saving field added");
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Costs & Savings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Specify extra costs and savings to include in the quote request
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="extra-costs">Extra Costs</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="extra-costs" className="space-y-4">
            <ExtraCostsList control={control} extraCosts={extraCosts} />
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsExtraCostLibraryOpen(true)}
              className="w-full"
              type="button"
            >
              <Library className="h-4 w-4 mr-2" />
              Add from Library
            </Button>
            
            <ExtraCostLibraryDialog
              open={isExtraCostLibraryOpen}
              onOpenChange={setIsExtraCostLibraryOpen}
              onAddFromLibrary={handleAddExtraCostFromLibrary}
              organizationId={currentOrganization?.id}
            />
          </TabsContent>
          
          <TabsContent value="savings" className="space-y-4">
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
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsSavingLibraryOpen(true)}
                className="w-full"
                type="button"
              >
                <Library className="h-4 w-4 mr-2" />
                From Library
              </Button>
              
              <SavingLibraryDialog
                open={isSavingLibraryOpen}
                onOpenChange={setIsSavingLibraryOpen}
                onAddFromLibrary={handleAddSavingFromLibrary}
                organizationId={currentOrganization?.id}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
