
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalesPresentations } from '@/hooks/useSalesPresentations';
import { Button } from '@/components/ui/button';
import { PresentationCard } from '@/components/sales-presentations/PresentationCard';
import { PlusCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShareDialog } from '@/components/sales-presentations/ShareDialog';

const SalesPresentations = () => {
  const navigate = useNavigate();
  const { usePresentations, useDeletePresentation, useSharePresentation } = useSalesPresentations();
  const { data: presentations = [], isLoading } = usePresentations();
  const deletePresentation = useDeletePresentation();
  const sharePresentation = useSharePresentation();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presentationToDelete, setPresentationToDelete] = useState<string | null>(null);
  
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [presentationToShare, setPresentationToShare] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleCreateNew = () => {
    navigate('/sales-presentations/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/sales-presentations/${id}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`/sales-presentations/${id}`);
  };

  const handleDelete = (id: string) => {
    setPresentationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (presentationToDelete) {
      await deletePresentation.mutateAsync(presentationToDelete);
      setDeleteDialogOpen(false);
      setPresentationToDelete(null);
    }
  };

  const handleShare = (id: string) => {
    setPresentationToShare(id);
    setShareLink(null);
    setShareDialogOpen(true);
  };

  const confirmShare = async (recipientEmail?: string) => {
    if (presentationToShare) {
      const link = await sharePresentation.mutateAsync({
        presentationId: presentationToShare,
        sharedWith: recipientEmail
      });
      
      if (link) {
        setShareLink(link);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales Presentations</h1>
        <Button onClick={handleCreateNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : presentations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentations.map((presentation) => (
            <PresentationCard
              key={presentation.id}
              presentation={presentation}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onShare={handleShare}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No presentations found</h3>
          <p className="text-muted-foreground mt-1">
            Create your first sales presentation to showcase your products to clients.
          </p>
          <Button onClick={handleCreateNew} className="mt-4">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create First Presentation
          </Button>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the presentation
              and all its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShareDialog 
        open={shareDialogOpen} 
        onOpenChange={setShareDialogOpen} 
        onShare={confirmShare}
        shareLink={shareLink}
        isSharing={sharePresentation.isPending}
      />
    </div>
  );
};

export default SalesPresentations;
