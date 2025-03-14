
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface BulkDueDateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date | undefined) => void;
  count: number;
}

export function BulkDueDateDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  count,
}: BulkDueDateDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onOpenChange(false);
  };

  const handleClear = () => {
    setSelectedDate(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Due Date</DialogTitle>
          <DialogDescription>
            Set a new due date for {count} selected quote {count === 1 ? "request" : "requests"}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 flex flex-col items-center space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
          />
          
          {selectedDate && (
            <p className="text-sm font-medium">
              Selected: {format(selectedDate, "PPP")}
            </p>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClear}
            className="mt-2"
          >
            Clear Selection
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            {selectedDate ? "Update" : "Remove"} Due Date
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
