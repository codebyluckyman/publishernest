import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useSalesPresentations } from '@/hooks/useSalesPresentations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Plus, Eye, Edit, Trash2, Share2 } from 'lucide-react';
import { SalesPresentation } from '@/types/salesPresentation';
import { PresentationActions } from '@/components/sales-presentations/PresentationActions';
import { ShareDialog } from '@/components/sales-presentations/ShareDialog';
import { toast } from 'sonner';
import { createPresentationShare } from '@/api/salesPresentations/createPresentationShare';
import { supabaseCustom } from '@/integrations/supabase/client-custom';

interface PresentationsTableProps {
  presentations: SalesPresentation[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  users: Record<string, any>;
}

const PresentationsTable: React.FC<PresentationsTableProps> = ({
  presentations,
  isLoading,
  onDelete,
  onShare,
  onView,
  onEdit,
  users,
}) => {
  if (isLoading) {
    return <div>Loading presentations...</div>;
  }

  if (!presentations || presentations.length === 0) {
    return <div>No presentations found.</div>;
  }

  return (
    <div className="w-full">
      <Table>
        <TableCaption>A list of your sales presentations.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {presentations.map((presentation) => {
            const user = users[presentation.created_by];
            return (
              <TableRow key={presentation.id}>
                <TableCell className="font-medium">{presentation.title}</TableCell>
                <TableCell>{presentation.status}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} />
                      <AvatarFallback>{user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{user?.first_name} {user?.last_name}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(presentation.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <PresentationActions
                    presentation={presentation}
                    onDelete={onDelete}
                    onShare={onShare}
                    onView={onView}
                    onEdit={onEdit}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              {presentations.length} presentation(s) total
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

const SalesPresentations = () => {
  const [title, setTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createdByFilter, setCreatedByFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [userMap, setUserMap] = useState<Record<string, any>>({});
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [selectedPresentationId, setSelectedPresentationId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { 
    usePresentations, 
    useCreatePresentation, 
    useDeletePresentation 
  } = useSalesPresentations();

  const { 
    data: presentationsData, 
    isLoading, 
    isError 
  } = usePresentations(statusFilter, createdByFilter, limit, page);
  const createMutation = useCreatePresentation();
  const deleteMutation = useDeletePresentation();

  useEffect(() => {
    if (presentationsData?.data) {
      setTotalCount(presentationsData.total);
    }
  }, [presentationsData]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (currentOrganization?.id) {
        const { data: users, error } = await supabaseCustom
          .from('users')
          .select('id, first_name, last_name, email')
          .eq('organization_id', currentOrganization.id);

        if (error) {
          console.error('Error fetching users:', error);
        } else {
          const userMap: Record<string, any> = {};
          users.forEach(user => {
            userMap[user.id] = user;
          });
          setUserMap(userMap);
        }
      }
    };

    fetchUsers();
  }, [currentOrganization?.id]);

  const handleCreatePresentation = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    await createMutation.mutateAsync({ title });
    setTitle('');
  };

  const handleDeletePresentation = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleSharePresentation = (id: string) => {
    setSelectedPresentationId(id);
    setShareDialogOpen(true);
    setShareLink(null); // Reset any previous link
  };

  const handleViewPresentation = (id: string) => {
    navigate(`/sales-presentations/${id}`);
  };

  const handleEditPresentation = (id: string) => {
    navigate(`/sales-presentations/${id}/edit`);
  };

  const confirmShare = async (recipientEmail?: string) => {
    if (!selectedPresentationId) return;
    
    setIsSharing(true);
    try {
      const currentUser = await supabaseCustom.auth.getUser();
      const userId = currentUser.data.user?.id;
      
      if (!userId) {
        toast.error('You must be logged in to share presentations');
        return;
      }
      
      let expiresAt: string | undefined = undefined;
      if (recipientEmail) {
        // Set expiration 30 days from now if sending to specific recipient
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 30);
        expiresAt = expiration.toISOString();
      }
      
      const link = await createPresentationShare({
        presentationId: selectedPresentationId,
        sharedBy: userId,
        sharedWith: recipientEmail,
        expiresAt
      });
      
      if (link) {
        setShareLink(link);
        // Only show toast if sharing without dialog
        if (!shareDialogOpen) {
          toast.success('Share link created successfully');
        }
      } else {
        toast.error('Failed to create share link');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Failed to create share link');
    } finally {
      setIsSharing(false);
    }
  };

  if (isError) {
    return <div>Error loading presentations</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Presentations</h1>
        <Button onClick={() => navigate('/sales-presentations/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Presentation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="createdBy">Created By</Label>
          <Input
            type="text"
            id="createdBy"
            placeholder="Filter by User ID"
            value={createdByFilter}
            onChange={(e) => setCreatedByFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div>Loading presentations...</div>
      ) : (
        <PresentationsTable
          presentations={presentationsData?.data || []}
          isLoading={isLoading}
          onDelete={handleDeletePresentation}
          onShare={handleSharePresentation}
          onView={handleViewPresentation}
          onEdit={handleEditPresentation}
          users={userMap}
        />
      )}

      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {totalCount} presentation(s)
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={() => setPage(page - 1)} disabled={page === 1} />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => setPage(page + 1)}
                disabled={page * limit >= totalCount}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onShare={confirmShare}
        shareLink={shareLink}
        isSharing={isSharing}
      />
    </div>
  );
};

export default SalesPresentations;
