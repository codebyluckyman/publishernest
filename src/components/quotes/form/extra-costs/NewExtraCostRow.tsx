
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { ExtraCostTableItem } from "@/types/extraCost";
import { createExtraCost } from "./extraCostsService";
import { toast } from "sonner";
import { UnitOfMeasureSelect } from "@/components/organizations/unitOfMeasures/UnitOfMeasureSelect";

interface NewExtraCostRowProps {
  organizationId: string;
  onAddSuccess: (newCost: ExtraCostTableItem) => void;
  onCancel: () => void;
}

export function NewExtraCostRow({ 
  organizationId, 
  onAddSuccess, 
  onCancel 
}: NewExtraCostRowProps) {
  const [newCost, setNewCost] = useState({
    name: "",
    description: "",
    unit_of_measure_id: ""
  });

  const handleAddSubmit = async () => {
    if (!newCost.name.trim()) {
      toast.error("Cost name is required");
      return;
    }

    try {
      const createdCost = await createExtraCost(organizationId, newCost);
      onAddSuccess(createdCost);
      setNewCost({ name: "", description: "", unit_of_measure_id: "" });
    } catch (error) {
      console.error("Error adding extra cost:", error);
      toast.error("Failed to add extra cost");
    }
  };

  return (
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
        <UnitOfMeasureSelect
          value={newCost.unit_of_measure_id}
          onChange={(value) => setNewCost({...newCost, unit_of_measure_id: value})}
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
