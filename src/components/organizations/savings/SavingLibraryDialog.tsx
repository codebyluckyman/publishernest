
import { Button } from "@/components/ui/button";
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
import { SavingTableItem } from "@/types/saving";
import { Library, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { fetchSavings } from "@/components/quotes/form/savings/savingsService";

interface SavingLibraryDialogProps {
  organizationId: string;
  onAddFromLibrary: (saving: SavingTableItem) => void;
}

export function SavingLibraryDialog({ organizationId, onAddFromLibrary }: SavingLibraryDialogProps) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [savingLibrary, setSavingLibrary] = useState<SavingTableItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  const fetchSavingLibrary = async () => {
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

  const handleLibraryOpen = () => {
    fetchSavingLibrary();
    setLibraryOpen(true);
  };

  const handleAddSaving = (saving: SavingTableItem) => {
    onAddFromLibrary(saving);
    setLibraryOpen(false);
    toast.success(`Added "${saving.name}" to default savings`);
  };

  return (
    <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLibraryOpen}
        >
          <Library className="h-4 w-4 mr-2" />
          Add from Library
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Savings Library</DialogTitle>
          <DialogDescription>
            Select savings from your library to add to default savings.
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
                        onClick={() => handleAddSaving(saving)}
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
