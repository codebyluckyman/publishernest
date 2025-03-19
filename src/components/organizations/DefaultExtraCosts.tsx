
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ChevronDown, ChevronUp, Library } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import { DefaultExtraCost, ExtraCostTableItem } from "@/types/extraCost";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { UnitOfMeasureSelect } from "./unitOfMeasures/UnitOfMeasureSelect";
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

export function DefaultExtraCosts() {
  const { currentOrganization, updateOrganizationSetting } = useOrganization();
  const [extraCosts, setExtraCosts] = useState<DefaultExtraCost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [extraCostLibrary, setExtraCostLibrary] = useState<ExtraCostTableItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  // Load existing extra costs from the organization
  useEffect(() => {
    if (currentOrganization?.default_extra_costs) {
      console.log("Loading default extra costs:", currentOrganization.default_extra_costs);
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
    setExtraCosts([...extraCosts, {
      name: cost.name,
      description: cost.description || "",
      unit_of_measure_id: cost.unit_of_measure || cost.unit_of_measure_id || undefined
    }]);
    setLibraryOpen(false);
    toast.success(`Added "${cost.name}" to default extra costs`);
  };

  return (
    <Card>
      <CardHeader>
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <div className="flex items-center justify-between">
            <CardTitle>Default Extra Costs</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription>
            Configure standard extra costs that will be included in all quote requests
          </CardDescription>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-4">
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
                        <UnitOfMeasureSelect
                          value={cost.unit_of_measure_id || ""}
                          onChange={(value) => handleUpdateCost(index, 'unit_of_measure_id', value)}
                          placeholder="Unit"
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
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={handleAddCost}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Extra Cost
                  </Button>
                  
                  <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleLibraryOpen}
                      >
                        <Library className="h-4 w-4 mr-2" />
                        Add from Library
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                      <DialogHeader>
                        <DialogTitle>Extra Costs Library</DialogTitle>
                        <DialogDescription>
                          Select extra costs from your library to add to default costs.
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
                                  <TableCell>{cost.unit_of_measure_name || '-'}</TableCell>
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
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}
