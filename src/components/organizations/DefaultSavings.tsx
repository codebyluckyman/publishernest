
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ChevronDown, ChevronUp, Library } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import { DefaultSaving, SavingTableItem } from "@/types/saving";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UnitOfMeasureSelect } from "./unitOfMeasures/UnitOfMeasureSelect";
import { fetchSavings } from "../quotes/form/savings/savingsService";
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

export function DefaultSavings() {
  const { currentOrganization, updateOrganizationSetting } = useOrganization();
  const [savings, setSavings] = useState<DefaultSaving[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Set to true to ensure it's initially expanded
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [savingLibrary, setSavingLibrary] = useState<SavingTableItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

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

  const fetchSavingLibrary = async () => {
    if (!currentOrganization) return;
    
    setLoadingLibrary(true);
    try {
      const data = await fetchSavings(currentOrganization.id);
      setSavingLibrary(data);
    } catch (error) {
      console.error("Error fetching savings library:", error);
      toast.error("Failed to load savings library");
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleLibraryOpen = () => {
    fetchSavingLibrary();
    setLibraryOpen(true);
  };

  const handleAddFromLibrary = (saving: SavingTableItem) => {
    setSavings([...savings, {
      name: saving.name,
      description: saving.description || "",
      unit_of_measure_id: saving.unit_of_measure_id || undefined
    }]);
    setLibraryOpen(false);
    toast.success(`Added "${saving.name}" to default savings`);
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
              {savings.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground text-sm">
                    No default savings configured yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savings.map((saving, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-4">
                        <Input
                          placeholder="Saving name"
                          value={saving.name}
                          onChange={(e) => handleUpdateSaving(index, 'name', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-5">
                        <Textarea
                          placeholder="Description (optional)"
                          value={saving.description || ""}
                          onChange={(e) => handleUpdateSaving(index, 'description', e.target.value)}
                          className="w-full h-10 min-h-10 resize-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <UnitOfMeasureSelect
                          value={saving.unit_of_measure_id || ""}
                          onChange={(value) => handleUpdateSaving(index, 'unit_of_measure_id', value)}
                          placeholder="Unit"
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSaving(index)}
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
                    onClick={handleAddSaving}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Saving
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
                        <DialogTitle>Savings Library</DialogTitle>
                        <DialogDescription>
                          Select savings from your library to add to default savings.
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
                                  Loading savings...
                                </TableCell>
                              </TableRow>
                            ) : savingLibrary.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-6">
                                  No savings found in your library.
                                </TableCell>
                              </TableRow>
                            ) : (
                              savingLibrary.map((saving) => (
                                <TableRow key={saving.id}>
                                  <TableCell>{saving.name}</TableCell>
                                  <TableCell>{saving.description || '-'}</TableCell>
                                  <TableCell>{saving.unit_of_measure_name || '-'}</TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-primary"
                                      onClick={() => handleAddFromLibrary(saving)}
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
                  {isLoading ? "Saving..." : "Save Default Savings"}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}
