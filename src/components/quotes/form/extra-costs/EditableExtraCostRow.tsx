
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { ExtraCostTableItem } from "@/types/extraCost";
import { updateExtraCost } from "./extraCostsService";
import { toast } from "sonner";

interface EditableExtraCostRowProps {
  cost: ExtraCostTableItem;
  editedCost: {
    name: string;
    description: string;
    unit_of_measure: string;
  };
  setEditedCost: (cost: {
    name: string;
    description: string;
    unit_of_measure: string;
  }) => void;
  onCancel: () => void;
  onSuccess: (updatedCost: ExtraCostTableItem) => void;
}

export function EditableExtraCostRow({ 
  cost, 
  editedCost, 
  setEditedCost, 
  onCancel,
  onSuccess
}: EditableExtraCostRowProps) {
  const handleEditSubmit = async () => {
    if (!editedCost.name.trim()) {
      toast.error("Cost name is required");
      return;
    }

    try {
      const updatedCost = await updateExtraCost(cost.id, editedCost);
      onSuccess(updatedCost);
    } catch (error) {
      console.error("Error updating extra cost:", error);
      toast.error("Failed to update extra cost");
    }
  };

  return (
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
            onClick={handleEditSubmit}
            className="text-primary"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </>
  );
}
