
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalesPresentations } from '@/hooks/useSalesPresentations';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PresentationsTable } from '@/components/sales-presentations/PresentationsTable';
import { CreatePresentationForm } from '@/components/sales-presentations/CreatePresentationForm';
import { StatusFilter } from '@/components/sales-presentations/StatusFilter';
import { UserFilter } from '@/components/sales-presentations/UserFilter';
import { ShareDialog } from '@/components/sales-presentations/ShareDialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const SalesPresentations = () => {
  const navigate = useNavigate();
  const { usePresentations, useDeletePresentation } = useSalesPresentations();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [shareDialogData, setShareDialogData] = useState<{ id: string; title: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  const { data: presentations = [], isLoading } = usePresentations();
  const deleteMutation = useDeletePresentation();

  // Create a map of users for filtering
  const users = new Map();
  presentations.forEach(presentation => {
    if (presentation.created_by && !users.has(presentation.created_by)) {
      users.set(presentation.created_by, { 
        id: presentation.created_by, 
        name: 'User' 
      });
    }
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete presentation:', error);
    }
  };

  const handleShare = (id: string) => {
    const presentation = presentations.find(p => p.id === id);
    if (presentation) {
      setShareDialogData({ id, title: presentation.title });
    }
  };

  const handleView = (id: string) => {
    navigate(`/sales-presentations/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/sales-presentations/${id}/edit`);
  };

  // Filter presentations based on search and filters
  const filteredPresentations = presentations.filter(presentation => {
    const matchesSearch = searchTerm === '' || 
      presentation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (presentation.description && presentation.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || presentation.status === statusFilter;
    const matchesUser = userFilter === 'all' || presentation.created_by === userFilter;
    
    return matchesSearch && matchesStatus && matchesUser;
  });

  if (isLoading) {
    return <div>Loading presentations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Presentations</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Presentation
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search presentations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <StatusFilter value={statusFilter} onValueChange={setStatusFilter} />
        <UserFilter value={userFilter} onValueChange={setUserFilter} users={users} />
      </div>

      <PresentationsTable
        presentations={filteredPresentations}
        isLoading={isLoading}
        onDelete={handleDelete}
        onShare={handleShare}
        onView={handleView}
        onEdit={handleEdit}
        users={users}
      />

      <CreatePresentationForm
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {shareDialogData && (
        <ShareDialog
          presentationId={shareDialogData.id}
          presentationTitle={shareDialogData.title}
          isOpen={!!shareDialogData}
          onOpenChange={(open) => !open && setShareDialogData(null)}
        />
      )}
    </div>
  );
};

export default SalesPresentations;
