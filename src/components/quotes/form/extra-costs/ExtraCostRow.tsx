
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { ExtraCostTableItem } from "@/types/extraCost";
import { deleteExtraCost } from "./extraCostsService";
import { toast } from "sonner";

interface ExtraCostRowProps {
  cost: ExtraCostTableItem;
  onEditClick: (cost: ExtraCostTableItem) => void;
  onDeleteSuccess: (deletedId: string) => void;
}

export function ExtraCostRow({ cost, onEditClick, onDeleteSuccess }: ExtraCostRowProps) {
  const handleDeleteClick = async () => {
    try {
      await deleteExtraCost(cost.id);
      onDeleteSuccess(cost.id);
    } catch (error) {
      console.error("Error deleting extra cost:", error);
      toast.error("Failed to delete extra cost");
    }
  };

  return (
    <>
      <TableCell>{cost.name}</TableCell>
      <TableCell>{cost.description || '-'}</TableCell>
      <TableCell>{cost.unit_of_measure_name || '-'}</TableCell>
      <TableCell>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEditClick(cost)}
            className="text-primary"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDeleteClick}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </>
  );
}
