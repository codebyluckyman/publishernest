
import { useEffect, useState } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { ExtraCostTableItem } from "@/types/extraCost";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Check, X, Edit } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExtraCostsTable() {
  const { currentOrganization } = useOrganization();
  const [extraCosts, setExtraCosts] = useState<ExtraCostTableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCost, setNewCost] = useState({
    name: "",
    description: "",
    unit_of_measure: ""
  });
  const [editedCost, setEditedCost] = useState({
    name: "",
    description: "",
    unit_of_measure: ""
  });
  const [isAdding, setIsAdding] = useState(false);

  // Define fetchExtraCosts function before using it
  const fetchExtraCosts = async () => {
    if (!currentOrganization) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('extra_costs')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      setExtraCosts(data as ExtraCostTableItem[]);
    } catch (error) {
      console.error("Error fetching extra costs:", error);
      toast.error("Failed to load extra costs");
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect instead of useState to call fetchExtraCosts when component mounts
  useEffect(() => {
    if (currentOrganization) {
      fetchExtraCosts();
    }
  }, [currentOrganization]);

  const handleAddClick = () => {
    setIsAdding(true);
    setNewCost({ name: "", description: "", unit_of_measure: "" });
  };

  const handleAddCancel = () => {
    setIsAdding(false);
  };

  const handleAddSubmit = async () => {
    if (!currentOrganization) return;
    if (!newCost.name.trim()) {
      toast.error("Cost name is required");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('extra_costs')
        .insert({
          name: newCost.name,
          description: newCost.description,
          unit_of_measure: newCost.unit_of_measure,
          organization_id: currentOrganization.id
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setExtraCosts([...extraCosts, data[0] as ExtraCostTableItem]);
        setIsAdding(false);
        toast.success("Extra cost added successfully");
      }
    } catch (error) {
      console.error("Error adding extra cost:", error);
      toast.error("Failed to add extra cost");
    }
  };

  const handleEditClick = (cost: ExtraCostTableItem) => {
    setEditingId(cost.id);
    setEditedCost({
      name: cost.name,
      description: cost.description || "",
      unit_of_measure: cost.unit_of_measure || ""
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleEditSubmit = async (id: string) => {
    if (!editedCost.name.trim()) {
      toast.error("Cost name is required");
      return;
    }

    try {
      const { error } = await supabase
        .from('extra_costs')
        .update({
          name: editedCost.name,
          description: editedCost.description,
          unit_of_measure: editedCost.unit_of_measure
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setExtraCosts(extraCosts.map(cost => 
        cost.id === id 
          ? { ...cost, ...editedCost }
          : cost
      ));
      
      setEditingId(null);
      toast.success("Extra cost updated successfully");
    } catch (error) {
      console.error("Error updating extra cost:", error);
      toast.error("Failed to update extra cost");
    }
  };

  const handleDeleteClick = async (id: string) => {
    try {
      const { error } = await supabase
        .from('extra_costs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setExtraCosts(extraCosts.filter(cost => cost.id !== id));
      toast.success("Extra cost deleted successfully");
    } catch (error) {
      console.error("Error deleting extra cost:", error);
      toast.error("Failed to delete extra cost");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Extra Costs Library</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage standardized extra costs for your quotes
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Unit of Measure</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Loading extra costs...
                  </TableCell>
                </TableRow>
              ) : extraCosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No extra costs found. Add one below.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {extraCosts.map((cost) => (
                    <TableRow key={cost.id}>
                      {editingId === cost.id ? (
                        <>
                          <TableCell>
                            <Input 
                              value={editedCost.name} 
                              onChange={(e) => setEditedCost({...editedCost, name: e.target.value})}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Textarea 
                              value={editedCost.description || ''} 
                              onChange={(e) => setEditedCost({...editedCost, description: e.target.value})}
                              className="w-full h-10 min-h-10 resize-none"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={editedCost.unit_of_measure || ''} 
                              onChange={(e) => setEditedCost({...editedCost, unit_of_measure: e.target.value})}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditSubmit(cost.id)}
                                className="text-primary"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleEditCancel}
                                className="text-muted-foreground"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{cost.name}</TableCell>
                          <TableCell>{cost.description || '-'}</TableCell>
                          <TableCell>{cost.unit_of_measure || '-'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditClick(cost)}
                                className="text-primary"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteClick(cost.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </>
              )}
              {isAdding && (
                <TableRow>
                  <TableCell>
                    <Input 
                      placeholder="Cost name" 
                      value={newCost.name} 
                      onChange={(e) => setNewCost({...newCost, name: e.target.value})}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea 
                      placeholder="Description (optional)" 
                      value={newCost.description} 
                      onChange={(e) => setNewCost({...newCost, description: e.target.value})}
                      className="w-full h-10 min-h-10 resize-none"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      placeholder="Unit of measure" 
                      value={newCost.unit_of_measure} 
                      onChange={(e) => setNewCost({...newCost, unit_of_measure: e.target.value})}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleAddSubmit}
                        className="text-primary"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleAddCancel}
                        className="text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {!isAdding && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2" 
              onClick={handleAddClick}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Extra Cost
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
