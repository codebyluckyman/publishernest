
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalesPresentations } from '@/hooks/useSalesPresentations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PresentationCard } from '@/components/sales-presentations/PresentationCard';
import { PresentationsTable } from '@/components/sales-presentations/PresentationsTable';
import { UserFilter } from '@/components/sales-presentations/UserFilter';
import { ViewToggle } from '@/components/sales-presentations/ViewToggle';
import { StatusFilter, PresentationStatus } from '@/components/sales-presentations/StatusFilter';
import { PlusCircle, Search, X } from 'lucide-react';
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
import { Card, CardHeader, CardContent } from '@/components/ui/card';

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

  // Changed default view mode to 'table' instead of 'card'
  const [viewMode, setViewMode] = useState<PresentationViewMode>('table');
  const [userFilter, setUserFilter] = useState('none');
  const [statusFilter, setStatusFilter] = useState<PresentationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter presentations by selected user, status and search query
  const filteredPresentations = presentations
    .filter(p => userFilter === 'none' || p.created_by === userFilter)
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()));

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

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales Presentations</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
          </div>
          <Button onClick={handleCreateNew}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </CardHeader>
        
        <CardContent>
          {presentations.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-3">
              <div className="relative w-full sm:w-[250px]">
                <Input
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8"
                />
                {searchQuery && (
                  <button 
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <UserFilter
                userIds={presentations.map(p => p.created_by)}
                value={userFilter}
                onValueChange={setUserFilter}
                className="w-full sm:w-[200px]"
              />
              <StatusFilter 
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="w-full sm:w-[200px]"
              />
            </div>
          )}

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
                onView={handleView}
                onEdit={handleEdit}
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
                onView={handleView}
                onEdit={handleEdit}
                users={users}
              />
            )
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No presentations found</h3>
              <p className="text-muted-foreground mt-1">
                {userFilter !== 'none' || statusFilter !== 'all' || searchQuery 
                  ? "No presentations found with the current filters. Try adjusting your search criteria."
                  : "Create your first sales presentation to showcase your products to clients."
                }
              </p>
              {userFilter === 'none' && statusFilter === 'all' && !searchQuery && (
                <Button onClick={handleCreateNew} className="mt-4">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Presentation
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
