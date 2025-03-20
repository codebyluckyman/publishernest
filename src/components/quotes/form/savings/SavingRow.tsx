
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { SavingTableItem } from "@/types/saving";
import { deleteSaving } from "./savingsService";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SavingRowProps {
  saving: SavingTableItem;
  onEditClick: (saving: SavingTableItem) => void;
  onDeleteSuccess: (deletedId: string) => void;
}

export function SavingRow({ saving, onEditClick, onDeleteSuccess }: SavingRowProps) {
  const handleDelete = async () => {
    try {
      await deleteSaving(saving.id);
      onDeleteSuccess(saving.id);
    } catch (error) {
      console.error("Error deleting saving:", error);
      toast.error("Failed to delete saving");
    }
  };

  return (
    <>
      <TableCell>{saving.name}</TableCell>
      <TableCell>{saving.description || "-"}</TableCell>
      <TableCell>{saving.unit_of_measure_name || "-"}</TableCell>
      <TableCell>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEditClick(saving)}
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
                <p className="text-sm">Are you sure you want to delete this saving?</p>
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
