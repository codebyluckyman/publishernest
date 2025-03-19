
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ChevronDown, ChevronUp, Library } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { DefaultExtraCost, ExtraCostTableItem } from "@/types/extraCost";
import { useOrganization } from "@/hooks/useOrganization";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";

export function ExtraCostsField() {
  const {
    currentOrganization
  } = useOrganization();
  const {
    control,
    setValue
  } = useFormContext<QuoteRequestFormValues>();
  const [defaultCostsAdded, setDefaultCostsAdded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [extraCostLibrary, setExtraCostLibrary] = useState<ExtraCostTableItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  
  const {
    fields,
    append,
    remove
  } = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  const handleAddCost = () => {
    append({
      name: ""
    });
  };

  // Add default extra costs from organization settings if available
  useEffect(() => {
    if (!defaultCostsAdded && currentOrganization?.default_extra_costs && currentOrganization.default_extra_costs.length > 0 && (!fields || fields.length === 0)) {
      const defaultCosts = currentOrganization.default_extra_costs.map((cost: DefaultExtraCost) => ({
        name: cost.name,
        description: cost.description || "",
        unit_of_measure: cost.unit_of_measure || ""
      }));
      setValue("extra_costs", defaultCosts);
      setDefaultCostsAdded(true);
    }
  }, [currentOrganization, fields, setValue, defaultCostsAdded]);

  // Fetch extra costs library when dialog opens
  const fetchExtraCostLibrary = async () => {
    if (!currentOrganization) return;
    
    setLoadingLibrary(true);
    try {
      const { data, error } = await supabase
        .from('extra_costs')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      setExtraCostLibrary(data as ExtraCostTableItem[]);
    } catch (error) {
      console.error("Error fetching extra costs library:", error);
      toast.error("Failed to load extra costs library");
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleLibraryOpen = () => {
    fetchExtraCostLibrary();
    setLibraryOpen(true);
  };

  const handleAddFromLibrary = (cost: ExtraCostTableItem) => {
    append({
      name: cost.name,
      description: cost.description || "",
      unit_of_measure: cost.unit_of_measure || ""
    });
    setLibraryOpen(false);
    toast.success(`Added "${cost.name}" to extra costs`);
  };

  return <Card className="mt-6">
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
              {fields.length === 0 ? <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground text-sm">
                    No extra costs added yet. 
                  </p>
                </div> : <div className="space-y-3">
                  {fields.map((field, index) => <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-4">
                        <Input placeholder="Cost name" {...control.register(`extra_costs.${index}.name` as const)} className="w-full" />
                      </div>
                      <div className="col-span-5">
                        <Textarea placeholder="Description (optional)" {...control.register(`extra_costs.${index}.description` as const)} className="w-full h-10 min-h-10 resize-none" />
                      </div>
                      <div className="col-span-2">
                        <Input placeholder="Unit of measure" {...control.register(`extra_costs.${index}.unit_of_measure` as const)} className="w-full" />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button variant="ghost" size="icon" onClick={() => remove(index)} type="button" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>)}
                </div>}

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="w-full" onClick={handleAddCost} type="button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Extra Cost
                </Button>
                <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleLibraryOpen} type="button">
                      <Library className="h-4 w-4 mr-2" />
                      Add from Library
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                      <DialogTitle>Extra Costs Library</DialogTitle>
                      <DialogDescription>
                        Select extra costs from your library to add to this quote.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="max-h-[400px] overflow-y-auto mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Unit of Measure</TableHead>
                            <TableHead className="w-[80px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingLibrary ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-6">
                                Loading costs...
                              </TableCell>
                            </TableRow>
                          ) : extraCostLibrary.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-6">
                                No extra costs found in your library.
                              </TableCell>
                            </TableRow>
                          ) : (
                            extraCostLibrary.map((cost) => (
                              <TableRow key={cost.id}>
                                <TableCell>{cost.name}</TableCell>
                                <TableCell>{cost.description || '-'}</TableCell>
                                <TableCell>{cost.unit_of_measure || '-'}</TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-primary"
                                    onClick={() => handleAddFromLibrary(cost)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>;
}
