
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalesPresentations } from '@/hooks/useSalesPresentations';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PresentationSections } from '@/components/sales-presentations/PresentationSections';

const SalesPresentationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usePresentation, usePublishPresentation } = useSalesPresentations();
  
  const { data: presentation, isLoading, isError } = usePresentation(id);
  const publishMutation = usePublishPresentation();

  const handleEdit = () => {
    navigate(`/sales-presentations/${id}/edit`);
  };

  const handlePublish = async () => {
    if (id) {
      await publishMutation.mutateAsync({ id });
    }
  };

  if (isLoading) {
    return <div>Loading presentation...</div>;
  }

  if (isError || !presentation) {
    return <div>Error loading presentation</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/sales-presentations')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{presentation.title}</h1>
        </div>
        <div className="space-x-2">
          <Button onClick={handleEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {presentation.status === 'draft' ? (
            <Button onClick={handlePublish} disabled={publishMutation.isPending}>
              {publishMutation.isPending ? 'Publishing...' : 'Publish'}
            </Button>
          ) : (
            <Button>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Badge className={
          presentation.status === 'published' 
            ? 'bg-green-100 text-green-800' 
            : presentation.status === 'draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
        }>
          {presentation.status.charAt(0).toUpperCase() + presentation.status.slice(1)}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Created: {new Date(presentation.created_at).toLocaleDateString()}
        </span>
        {presentation.published_at && (
          <span className="text-sm text-muted-foreground">
            Published: {new Date(presentation.published_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {presentation.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {presentation.description}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <PresentationSections
          presentationId={id!}
          isEditable={presentation.status === 'draft'}
          displaySettings={presentation.display_settings}
        />
      </div>
    </div>
  );
};

export default SalesPresentationDetail;
