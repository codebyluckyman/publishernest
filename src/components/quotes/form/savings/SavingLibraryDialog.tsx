
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Library, Plus } from "lucide-react";
import { SavingTableItem } from "@/types/saving";
import { fetchSavings } from "./savingsService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";

interface SavingLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFromLibrary: (saving: SavingTableItem) => void;
  onOpen?: () => void; // Make this prop optional
  organizationId?: string;
}

export function SavingLibraryDialog({ 
  open, 
  onOpenChange, 
  onAddFromLibrary, 
  onOpen = () => {}, // Provide a default empty function
  organizationId 
}: SavingLibraryDialogProps) {
  const [savingLibrary, setSavingLibrary] = useState<SavingTableItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  // Fetch savings library when dialog opens
  const fetchSavingLibrary = async () => {
    if (!organizationId) return;
    
    setLoadingLibrary(true);
    try {
      const data = await fetchSavings(organizationId);
      setSavingLibrary(data);
    } catch (error) {
      console.error("Error fetching savings library:", error);
      toast.error("Failed to load savings library");
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSavingLibrary();
    }
  }, [open, organizationId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={onOpen} type="button">
          <Library className="h-4 w-4 mr-2" />
          Add from Library
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Savings Library</DialogTitle>
          <DialogDescription>
            Select savings from your library to add to this quote.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-y-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Unit of Measure</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingLibrary ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Loading savings...
                  </TableCell>
                </TableRow>
              ) : savingLibrary.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No savings found in your library.
                  </TableCell>
                </TableRow>
              ) : (
                savingLibrary.map((saving) => (
                  <TableRow key={saving.id}>
                    <TableCell>{saving.name}</TableCell>
                    <TableCell>{saving.description || '-'}</TableCell>
                    <TableCell>{saving.unit_of_measure_name || '-'}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-primary"
                        onClick={() => onAddFromLibrary(saving)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
