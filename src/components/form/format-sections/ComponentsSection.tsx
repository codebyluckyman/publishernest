
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import { FormatFormValues } from "@/hooks/useFormatForm";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface FormatComponent {
  id: string;
  component_name: string;
  description: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

interface FormatComponentLink {
  id: string;
  format_id: string;
  component_id: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  component?: FormatComponent;
}

interface ComponentsSectionProps {
  form: UseFormReturn<FormatFormValues>;
  formatId?: string;
  readOnly?: boolean;
}

export function ComponentsSection({ form, formatId, readOnly = false }: ComponentsSectionProps) {
  const { currentOrganization } = useOrganization();
  const [components, setComponents] = useState<FormatComponent[]>([]);
  const [linkedComponents, setLinkedComponents] = useState<FormatComponentLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<FormatComponent | null>(null);
  const [selectedLink, setSelectedLink] = useState<FormatComponentLink | null>(null);
  const [componentName, setComponentName] = useState("");
  const [componentDescription, setComponentDescription] = useState("");
  const [linkQuantity, setLinkQuantity] = useState(1);
  const [linkNotes, setLinkNotes] = useState("");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // Fetch all components for the organization
  const fetchComponents = async () => {
    if (!currentOrganization) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("format_components")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .order("component_name");
        
      if (error) {
        throw error;
      }
      
      setComponents(data as FormatComponent[]);
    } catch (error: any) {
      toast.error("Failed to load components: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // If there's a formatId, fetch linked components
  const fetchLinkedComponents = async () => {
    if (!formatId || !currentOrganization) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("format_component_links")
        .select(`
          *,
          component:format_components(*)
        `)
        .eq("format_id", formatId);
        
      if (error) {
        throw error;
      }
      
      setLinkedComponents(data as FormatComponentLink[]);
    } catch (error: any) {
      toast.error("Failed to load linked components: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [currentOrganization]);

  useEffect(() => {
    if (formatId) {
      fetchLinkedComponents();
    } else {
      setLinkedComponents([]);
    }
  }, [formatId, currentOrganization]);

  // Handle component dialog
  const handleOpenComponentDialog = (component?: FormatComponent) => {
    if (component) {
      setSelectedComponent(component);
      setComponentName(component.component_name);
      setComponentDescription(component.description || "");
    } else {
      setSelectedComponent(null);
      setComponentName("");
      setComponentDescription("");
    }
    setIsComponentDialogOpen(true);
  };

  // Handle link dialog
  const handleOpenLinkDialog = (link?: FormatComponentLink) => {
    if (link) {
      setSelectedLink(link);
      setSelectedComponentId(link.component_id);
      setLinkQuantity(link.quantity);
      setLinkNotes(link.notes || "");
    } else {
      setSelectedLink(null);
      setSelectedComponentId(null);
      setLinkQuantity(1);
      setLinkNotes("");
    }
    setIsLinkDialogOpen(true);
  };

  // Save component
  const handleSaveComponent = async () => {
    if (!currentOrganization) {
      toast.error("No organization selected");
      return;
    }
    
    if (!componentName.trim()) {
      toast.error("Component name is required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (selectedComponent) {
        // Update existing component
        const { error } = await supabase
          .from("format_components")
          .update({
            component_name: componentName,
            description: componentDescription || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", selectedComponent.id);
          
        if (error) throw error;
        toast.success("Component updated");
      } else {
        // Create new component
        const { error } = await supabase
          .from("format_components")
          .insert({
            component_name: componentName,
            description: componentDescription || null,
            organization_id: currentOrganization.id
          });
          
        if (error) throw error;
        toast.success("Component created");
      }
      
      // Close dialog and refresh components
      setIsComponentDialogOpen(false);
      fetchComponents();
    } catch (error: any) {
      toast.error(`Failed to save component: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Save component link
  const handleSaveLink = async () => {
    if (!currentOrganization || !formatId) {
      toast.error("Missing required information");
      return;
    }
    
    if (!selectedComponentId) {
      toast.error("Please select a component");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (selectedLink) {
        // Update existing link
        const { error } = await supabase
          .from("format_component_links")
          .update({
            component_id: selectedComponentId,
            quantity: linkQuantity,
            notes: linkNotes || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", selectedLink.id);
          
        if (error) throw error;
        toast.success("Component link updated");
      } else {
        // Create new link
        const { error } = await supabase
          .from("format_component_links")
          .insert({
            format_id: formatId,
            component_id: selectedComponentId,
            quantity: linkQuantity,
            notes: linkNotes || null
          });
          
        if (error) throw error;
        toast.success("Component added to format");
      }
      
      // Close dialog and refresh linked components
      setIsLinkDialogOpen(false);
      fetchLinkedComponents();
    } catch (error: any) {
      toast.error(`Failed to save component link: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove component link
  const handleRemoveLink = async (linkId: string) => {
    if (!formatId) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("format_component_links")
        .delete()
        .eq("id", linkId);
        
      if (error) throw error;
      
      toast.success("Component removed from format");
      fetchLinkedComponents();
    } catch (error: any) {
      toast.error(`Failed to remove component: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Components</h3>
        {!readOnly && (
          <div className="space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => handleOpenComponentDialog()}
              disabled={isLoading}
            >
              <Plus className="mr-1 h-4 w-4" />
              Create Component
            </Button>
            <Button 
              type="button" 
              variant="default" 
              size="sm" 
              onClick={() => handleOpenLinkDialog()}
              disabled={isLoading || !formatId}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add to Format
            </Button>
          </div>
        )}
      </div>

      {linkedComponents.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Notes</TableHead>
              {!readOnly && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {linkedComponents.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-medium">
                  {link.component?.component_name || "Unknown Component"}
                </TableCell>
                <TableCell>{link.quantity}</TableCell>
                <TableCell>{link.notes || "-"}</TableCell>
                {!readOnly && (
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenLinkDialog(link)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-4 border rounded-md bg-muted/20">
          {formatId ? "No components added to this format yet." : "Save the format first to add components."}
        </div>
      )}

      {/* Component Dialog */}
      <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedComponent ? "Edit Component" : "Create New Component"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormItem>
              <FormLabel>Component Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Plastic Handle"
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional description"
                  value={componentDescription}
                  onChange={(e) => setComponentDescription(e.target.value)}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={handleSaveComponent} 
              disabled={isLoading || !componentName.trim()}
            >
              {isLoading ? "Saving..." : selectedComponent ? "Update Component" : "Create Component"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLink ? "Edit Component Link" : "Add Component to Format"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormItem>
              <FormLabel>Component *</FormLabel>
              <FormControl>
                <select
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50"
                  value={selectedComponentId || ""}
                  onChange={(e) => setSelectedComponentId(e.target.value || null)}
                  disabled={isLoading}
                >
                  <option value="">Select a component</option>
                  {components.map((component) => (
                    <option key={component.id} value={component.id}>
                      {component.component_name}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  value={linkQuantity}
                  onChange={(e) => setLinkQuantity(parseInt(e.target.value) || 1)}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional notes"
                  value={linkNotes}
                  onChange={(e) => setLinkNotes(e.target.value)}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={handleSaveLink} 
              disabled={isLoading || !selectedComponentId}
            >
              {isLoading ? "Saving..." : selectedLink ? "Update Link" : "Add Component"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
