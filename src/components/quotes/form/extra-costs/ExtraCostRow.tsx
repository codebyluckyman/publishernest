
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { ExtraCostTableItem } from "@/types/extraCost";
import { deleteExtraCost } from "./extraCostsService";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ExtraCostRowProps {
  cost: ExtraCostTableItem;
  onEditClick: (cost: ExtraCostTableItem) => void;
  onDeleteSuccess: (deletedId: string) => void;
}

export function ExtraCostRow({ cost, onEditClick, onDeleteSuccess }: ExtraCostRowProps) {
  const handleDelete = async () => {
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
      <TableCell>{cost.description || "-"}</TableCell>
      <TableCell>{cost.unit_of_measure_name || "-"}</TableCell>
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
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <div className="space-y-2">
                <p className="text-sm">Are you sure you want to delete this cost?</p>
                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="outline">Cancel</Button>
                  <Button size="sm" variant="destructive" onClick={handleDelete}>Delete</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </TableCell>
    </>
  );
}
