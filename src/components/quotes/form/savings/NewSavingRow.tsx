
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { SavingTableItem } from "@/types/saving";
import { createSaving } from "./savingsService";
import { toast } from "sonner";
import { UnitOfMeasureSelect } from "@/components/organizations/unitOfMeasures/UnitOfMeasureSelect";

interface NewSavingRowProps {
  organizationId: string;
  onAddSuccess: (newSaving: SavingTableItem) => void;
  onCancel: () => void;
}

export function NewSavingRow({ 
  organizationId, 
  onAddSuccess, 
  onCancel 
}: NewSavingRowProps) {
  const [newSaving, setNewSaving] = useState({
    name: "",
    description: "",
    unit_of_measure_id: ""
  });

  const handleAddSubmit = async () => {
    if (!newSaving.name.trim()) {
      toast.error("Saving name is required");
      return;
    }

    try {
      const createdSaving = await createSaving(organizationId, newSaving);
      onAddSuccess(createdSaving);
      setNewSaving({ name: "", description: "", unit_of_measure_id: "" });
    } catch (error) {
      console.error("Error adding saving:", error);
      toast.error("Failed to add saving");
    }
  };

  return (
    <TableRow>
      <TableCell>
        <Input 
          placeholder="Saving name" 
          value={newSaving.name} 
          onChange={(e) => setNewSaving({...newSaving, name: e.target.value})}
          className="w-full"
        />
      </TableCell>
      <TableCell>
        <Textarea 
          placeholder="Description (optional)" 
          value={newSaving.description} 
          onChange={(e) => setNewSaving({...newSaving, description: e.target.value})}
          className="w-full h-10 min-h-10 resize-none"
        />
      </TableCell>
      <TableCell>
        <UnitOfMeasureSelect
          value={newSaving.unit_of_measure_id}
          onChange={(value) => setNewSaving({...newSaving, unit_of_measure_id: value})}
          placeholder="Select unit"
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
            onClick={onCancel}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
