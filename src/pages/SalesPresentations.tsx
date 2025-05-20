
import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PresentationsTable } from "@/components/sales-presentations/PresentationsTable";
import { SalesPresentation } from "@/types/salesPresentation";
import { useSalesPresentations } from "@/hooks/useSalesPresentations";

export default function SalesPresentations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    usePresentationsList, 
    useCreatePresentation,
    useDuplicatePresentation
  } = useSalesPresentations();
  
  const { data: presentations, isLoading } = usePresentationsList();
  const createPresentation = useCreatePresentation();
  const duplicatePresentation = useDuplicatePresentation();
  
  // Map to store user information
  const [usersMap] = useState<Map<string, any>>(new Map());
  
  const handleCreatePresentation = () => {
    createPresentation.mutate(
      { title: "New Presentation", status: "draft" },
      {
        onSuccess: (presentationId) => {
          navigate(`/sales-presentations/${presentationId}`);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to create presentation",
            variant: "destructive",
          });
        }
      }
    );
  };
  
  const handleEditPresentation = (presentation: SalesPresentation) => {
    navigate(`/sales-presentations/${presentation.id}`);
  };
  
  const handleDuplicatePresentation = (presentation: SalesPresentation) => {
    duplicatePresentation.mutate(presentation.id, {
      onSuccess: (newPresentationId) => {
        toast({
          title: "Success",
          description: "Presentation duplicated successfully",
        });
        navigate(`/sales-presentations/${newPresentationId}`);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to duplicate presentation",
          variant: "destructive",
        });
      }
    });
  };
  
  const handleDeletePresentation = (id: string) => {
    // Deletion is handled in PresentationsTable component
  };
  
  const handleSharePresentation = (id: string) => {
    navigate(`/sales-presentations/${id}/share`);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Sales Presentations</h1>
        <Button
          onClick={handleCreatePresentation}
          disabled={createPresentation.isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Presentation
        </Button>
      </div>
      
      {isLoading ? (
        <PresentationsTable
          presentations={[]}
          isLoading={true}
          onDelete={handleDeletePresentation}
          onShare={handleSharePresentation}
          users={usersMap}
          onEdit={handleEditPresentation}
          onDuplicate={handleDuplicatePresentation}
        />
      ) : (
        <PresentationsTable
          presentations={presentations || []}
          isLoading={false}
          onDelete={handleDeletePresentation}
          onShare={handleSharePresentation}
          users={usersMap}
          onEdit={handleEditPresentation}
          onDuplicate={handleDuplicatePresentation}
        />
      )}
    </div>
  );
}
