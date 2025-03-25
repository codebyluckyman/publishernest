
import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { OrganizationProductionStep } from "@/types/organization";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GripVertical, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { NumberInput } from "@/components/NumberInput";

export function ProductionStepsTable() {
  const { currentOrganization } = useOrganization();
  const [productionSteps, setProductionSteps] = useState<OrganizationProductionStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, Partial<OrganizationProductionStep>>>({});
  const [newStep, setNewStep] = useState<Omit<OrganizationProductionStep, 'id' | 'created_at' | 'updated_at'> | null>(null);

  useEffect(() => {
    if (currentOrganization) {
      fetchProductionSteps();
    }
  }, [currentOrganization]);

  const fetchProductionSteps = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('organization_production_steps')
        .select('*')
        .eq('organization_id', currentOrganization?.id)
        .order('order_number', { ascending: true });

      if (error) {
        throw error;
      }

      setProductionSteps(data || []);
    } catch (error) {
      console.error("Error fetching production steps:", error);
      toast.error("Failed to load production steps");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (step: OrganizationProductionStep) => {
    setIsEditing({ ...isEditing, [step.id]: true });
    setEditValues({ 
      ...editValues, 
      [step.id]: { 
        step_name: step.step_name,
        description: step.description,
        estimated_days: step.estimated_days,
        is_active: step.is_active
      } 
    });
  };

  const handleCancelEdit = (stepId: string) => {
    const newIsEditing = { ...isEditing };
    delete newIsEditing[stepId];
    setIsEditing(newIsEditing);
    
    const newEditValues = { ...editValues };
    delete newEditValues[stepId];
    setEditValues(newEditValues);
  };

  const handleInputChange = (stepId: string, field: keyof OrganizationProductionStep, value: any) => {
    setEditValues({
      ...editValues,
      [stepId]: {
        ...editValues[stepId],
        [field]: value
      }
    });
  };

  const handleSaveEdit = async (stepId: string) => {
    try {
      const { error } = await supabase
        .from('organization_production_steps')
        .update({
          step_name: editValues[stepId].step_name,
          description: editValues[stepId].description,
          estimated_days: editValues[stepId].estimated_days,
          is_active: editValues[stepId].is_active
        })
        .eq('id', stepId);

      if (error) {
        throw error;
      }

      const updatedSteps = productionSteps.map(step =>
        step.id === stepId
          ? { ...step, ...editValues[stepId], updated_at: new Date().toISOString() }
          : step
      );

      setProductionSteps(updatedSteps);
      handleCancelEdit(stepId);
      toast.success("Step updated successfully");
    } catch (error) {
      console.error("Error updating step:", error);
      toast.error("Failed to update step");
    }
  };

  const handleAddStep = async () => {
    if (!newStep || !newStep.step_name || !currentOrganization) return;

    try {
      const nextOrderNumber = productionSteps.length > 0
        ? Math.max(...productionSteps.map(step => step.order_number)) + 1
        : 1;

      const { data, error } = await supabase
        .from('organization_production_steps')
        .insert({
          organization_id: currentOrganization.id,
          step_name: newStep.step_name,
          description: newStep.description,
          order_number: nextOrderNumber,
          is_active: newStep.is_active !== undefined ? newStep.is_active : true,
          estimated_days: newStep.estimated_days
        })
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setProductionSteps([...productionSteps, data[0]]);
        setNewStep(null);
        toast.success("Step added successfully");
      }
    } catch (error) {
      console.error("Error adding step:", error);
      toast.error("Failed to add step");
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      const { error } = await supabase
        .from('organization_production_steps')
        .delete()
        .eq('id', stepId);

      if (error) {
        throw error;
      }

      const updatedSteps = productionSteps
        .filter(step => step.id !== stepId)
        .map((step, index) => ({
          ...step,
          order_number: index + 1
        }));

      // Update order numbers in database
      await Promise.all(
        updatedSteps.map(step =>
          supabase
            .from('organization_production_steps')
            .update({ order_number: step.order_number })
            .eq('id', step.id)
        )
      );

      setProductionSteps(updatedSteps);
      toast.success("Step deleted successfully");
    } catch (error) {
      console.error("Error deleting step:", error);
      toast.error("Failed to delete step");
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(productionSteps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order_number: index + 1
    }));

    setProductionSteps(updatedItems);

    // Save updated order to database
    try {
      await Promise.all(
        updatedItems.map(step =>
          supabase
            .from('organization_production_steps')
            .update({ order_number: step.order_number })
            .eq('id', step.id)
        )
      );
      toast.success("Order updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
      // Revert to original order
      fetchProductionSteps();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Process Steps</CardTitle>
        <CardDescription>Configure the steps in your production process</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center">Loading production steps...</div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Step Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Est. Days</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <Droppable droppableId="production-steps">
                {(provided) => (
                  <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                    {productionSteps.map((step, index) => (
                      <Draggable key={step.id} draggableId={step.id} index={index}>
                        {(provided) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <TableCell {...provided.dragHandleProps} className="cursor-grab">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </TableCell>
                            <TableCell>
                              {isEditing[step.id] ? (
                                <Input 
                                  value={editValues[step.id]?.step_name || ''} 
                                  onChange={(e) => handleInputChange(step.id, 'step_name', e.target.value)}
                                  className="w-full"
                                />
                              ) : (
                                <span className={!step.is_active ? "text-muted-foreground line-through" : ""}>
                                  {step.step_name}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing[step.id] ? (
                                <Textarea 
                                  value={editValues[step.id]?.description || ''} 
                                  onChange={(e) => handleInputChange(step.id, 'description', e.target.value)}
                                  className="w-full resize-none h-20"
                                />
                              ) : (
                                <span className={!step.is_active ? "text-muted-foreground" : ""}>
                                  {step.description || "—"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing[step.id] ? (
                                <NumberInput
                                  value={editValues[step.id]?.estimated_days || undefined}
                                  onChange={(value) => handleInputChange(step.id, 'estimated_days', value)}
                                  min={0}
                                  className="w-24"
                                />
                              ) : (
                                <span className={!step.is_active ? "text-muted-foreground" : ""}>
                                  {step.estimated_days || "—"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing[step.id] ? (
                                <Switch
                                  checked={editValues[step.id]?.is_active ?? true}
                                  onCheckedChange={(value) => handleInputChange(step.id, 'is_active', value)}
                                />
                              ) : (
                                <Switch 
                                  checked={step.is_active} 
                                  disabled
                                />
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {isEditing[step.id] ? (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleCancelEdit(step.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleSaveEdit(step.id)}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleStartEdit(step)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleDeleteStep(step.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <TableRow>
                      <TableCell className="cursor-not-allowed">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Step name"
                          value={newStep?.step_name || ''}
                          onChange={(e) => setNewStep({
                            ...newStep || {
                              organization_id: currentOrganization?.id || '',
                              order_number: productionSteps.length + 1,
                              is_active: true
                            },
                            step_name: e.target.value
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          placeholder="Description"
                          value={newStep?.description || ''}
                          onChange={(e) => setNewStep({
                            ...newStep || {
                              organization_id: currentOrganization?.id || '',
                              order_number: productionSteps.length + 1,
                              step_name: '',
                              is_active: true
                            },
                            description: e.target.value
                          })}
                          className="resize-none h-20"
                        />
                      </TableCell>
                      <TableCell>
                        <NumberInput
                          placeholder="Days"
                          value={newStep?.estimated_days || undefined}
                          onChange={(value) => setNewStep({
                            ...newStep || {
                              organization_id: currentOrganization?.id || '',
                              order_number: productionSteps.length + 1,
                              step_name: '',
                              is_active: true
                            },
                            estimated_days: value
                          })}
                          min={0}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={newStep?.is_active ?? true}
                          onCheckedChange={(value) => setNewStep({
                            ...newStep || {
                              organization_id: currentOrganization?.id || '',
                              order_number: productionSteps.length + 1,
                              step_name: '',
                            },
                            is_active: value
                          })}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleAddStep}
                          disabled={!newStep?.step_name}
                        >
                          Add Step
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Droppable>
            </Table>
          </DragDropContext>
        )}
      </CardContent>
    </Card>
  );
}
