
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { SavingTableItem } from "@/types/saving";
import { updateSaving } from "./savingsService";
import { toast } from "sonner";
import { UnitOfMeasureSelect } from "@/components/organizations/unitOfMeasures/UnitOfMeasureSelect";

interface EditableSavingRowProps {
  saving: SavingTableItem;
  editedSaving: {
    name: string;
    description: string;
    unit_of_measure_id: string;
  };
  setEditedSaving: (saving: {
    name: string;
    description: string;
    unit_of_measure_id: string;
  }) => void;
  onCancel: () => void;
  onSuccess: (updatedSaving: SavingTableItem) => void;
}

export function EditableSavingRow({ 
  saving, 
  editedSaving, 
  setEditedSaving, 
  onCancel,
  onSuccess
}: EditableSavingRowProps) {
  const handleEditSubmit = async () => {
    if (!editedSaving.name.trim()) {
      toast.error("Saving name is required");
      return;
    }

    try {
      const updatedSaving = await updateSaving(saving.id, editedSaving);
      onSuccess(updatedSaving);
    } catch (error) {
      console.error("Error updating saving:", error);
      toast.error("Failed to update saving");
    }
  };

  return (
    <>
      <TableCell>
        <Input 
          value={editedSaving.name} 
          onChange={(e) => setEditedSaving({...editedSaving, name: e.target.value})}
          className="w-full"
        />
      </TableCell>
      <TableCell>
        <Textarea 
          value={editedSaving.description || ''} 
          onChange={(e) => setEditedSaving({...editedSaving, description: e.target.value})}
          className="w-full h-10 min-h-10 resize-none"
        />
      </TableCell>
      <TableCell>
        <UnitOfMeasureSelect
          value={editedSaving.unit_of_measure_id || ''}
          onChange={(value) => setEditedSaving({...editedSaving, unit_of_measure_id: value})}
          placeholder="Select unit"
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
