
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Library, Plus, PlusCircle } from "lucide-react";
import { ExtraCostTableItem } from "@/types/extraCost";
import { fetchExtraCosts } from "./extraCostsService";
import { NewExtraCostDialog } from "./NewExtraCostDialog";
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

interface ExtraCostLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFromLibrary: (cost: ExtraCostTableItem) => void;
  onOpen?: () => void; // Make this prop optional
  organizationId?: string;
}

export function ExtraCostLibraryDialog({ 
  open, 
  onOpenChange, 
  onAddFromLibrary, 
  onOpen = () => {}, // Provide a default empty function
  organizationId 
}: ExtraCostLibraryDialogProps) {
  const [extraCostLibrary, setExtraCostLibrary] = useState<ExtraCostTableItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  // Fetch extra costs library when dialog opens
  const fetchExtraCostLibrary = async () => {
    if (!organizationId) return;
    
    setLoadingLibrary(true);
    try {
      const data = await fetchExtraCosts(organizationId);
      setExtraCostLibrary(data);
    } catch (error) {
      console.error("Error fetching extra costs library:", error);
      toast.error("Failed to load extra costs library");
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchExtraCostLibrary();
    }
  }, [open, organizationId]);

  // Handle adding a new extra cost to the library
  const handleExtraCostAdded = (newExtraCost: ExtraCostTableItem) => {
    setExtraCostLibrary(prevLibrary => [...prevLibrary, newExtraCost]);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={onOpen} type="button">
            <Library className="h-4 w-4 mr-2" />
            Add from Library
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Extra Costs Library</DialogTitle>
              <Button 
                onClick={() => setIsNewDialogOpen(true)} 
                size="sm" 
                variant="outline"
                type="button"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Extra Cost
              </Button>
            </div>
            <DialogDescription>
              Select extra costs from your library to add to this quote.
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
                      Loading costs...
                    </TableCell>
                  </TableRow>
                ) : extraCostLibrary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      No extra costs found in your library.
                    </TableCell>
                  </TableRow>
                ) : (
                  extraCostLibrary.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell>{cost.name}</TableCell>
                      <TableCell>{cost.description || '-'}</TableCell>
                      <TableCell>{cost.unit_of_measure_name || '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-primary"
                          onClick={() => onAddFromLibrary(cost)}
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

      <NewExtraCostDialog 
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        organizationId={organizationId}
        onExtraCostAdded={handleExtraCostAdded}
      />
    </>
  );
}
