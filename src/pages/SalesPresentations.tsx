
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalesPresentations } from '@/hooks/useSalesPresentations';
import { Button } from '@/components/ui/button';
import { PresentationCard } from '@/components/sales-presentations/PresentationCard';
import { PresentationsTable } from '@/components/sales-presentations/PresentationsTable';
import { UserFilter } from '@/components/sales-presentations/UserFilter';
import { ViewToggle } from '@/components/sales-presentations/ViewToggle';
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
import { PresentationViewMode } from '@/types/salesPresentation';
import { fetchUsersByIds } from '@/services/userService';

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

  // New state for view mode and user filter
  const [viewMode, setViewMode] = useState<PresentationViewMode>('card');
  const [userFilter, setUserFilter] = useState('none');
  const [users, setUsers] = useState<Map<string, any>>(new Map());

  // Extract all unique user IDs from presentations
  useEffect(() => {
    const loadUsers = async () => {
      if (!presentations.length) return;
      
      // Get unique user IDs
      const userIds = [...new Set(presentations.map(p => p.created_by))];
      
      try {
        const usersMap = await fetchUsersByIds(userIds);
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    
    loadUsers();
  }, [presentations]);

  // Filter presentations by selected user
  const filteredPresentations = userFilter !== 'none' 
    ? presentations.filter(p => p.created_by === userFilter)
    : presentations;

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
        <div className="flex space-x-4 items-center">
          <ViewToggle 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            features={{
              enabledViews: ['card', 'table'],
              allowViewToggle: true,
              showProductDetails: true
            }}
          />
          <Button onClick={handleCreateNew}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        {presentations.length > 0 && (
          <UserFilter
            userIds={presentations.map(p => p.created_by)}
            value={userFilter}
            onValueChange={setUserFilter}
            className="w-[250px]"
          />
        )}
      </div>

      {isLoading ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <PresentationsTable
            presentations={[]}
            isLoading={true}
            onDelete={handleDelete}
            onShare={handleShare}
            users={users}
          />
        )
      ) : filteredPresentations.length > 0 ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPresentations.map((presentation) => (
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
          <PresentationsTable
            presentations={filteredPresentations}
            isLoading={false}
            onDelete={handleDelete}
            onShare={handleShare}
            users={users}
          />
        )
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No presentations found</h3>
          <p className="text-muted-foreground mt-1">
            {userFilter !== 'none' 
              ? "No presentations found for the selected user. Try selecting a different user."
              : "Create your first sales presentation to showcase your products to clients."
            }
          </p>
          {userFilter === 'none' && (
            <Button onClick={handleCreateNew} className="mt-4">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create First Presentation
            </Button>
          )}
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
