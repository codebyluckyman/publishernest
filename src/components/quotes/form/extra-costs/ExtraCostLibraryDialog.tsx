
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Library, Plus } from "lucide-react";
import { ExtraCostTableItem } from "@/types/extraCost";
import { supabase } from "@/integrations/supabase/client";
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
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";

interface ExtraCostLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFromLibrary: (cost: ExtraCostTableItem) => void;
  onOpen: () => void;
  organizationId?: string;
}

export function ExtraCostLibraryDialog({ 
  open, 
  onOpenChange, 
  onAddFromLibrary, 
  onOpen,
  organizationId 
}: ExtraCostLibraryDialogProps) {
  const [extraCostLibrary, setExtraCostLibrary] = useState<ExtraCostTableItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const { getUnitNameById } = useUnitOfMeasures();

  // Fetch extra costs library when dialog opens
  const fetchExtraCostLibrary = async () => {
    if (!organizationId) return;
    
    setLoadingLibrary(true);
    try {
      const { data, error } = await supabase
        .from('extra_costs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      // Enhance with unit names
      const enhancedData = data.map(cost => ({
        ...cost,
        unit_of_measure_id: cost.unit_of_measure || null,
        unit_of_measure_name: getUnitNameById(cost.unit_of_measure) || cost.unit_of_measure || null
      }));
      
      setExtraCostLibrary(enhancedData as ExtraCostTableItem[]);
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
          <DialogTitle>Extra Costs Library</DialogTitle>
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
  );
}
