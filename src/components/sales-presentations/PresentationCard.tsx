
import { SalesPresentation } from '@/types/salesPresentation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Share2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PresentationCardProps {
  presentation: SalesPresentation;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onShare: (id: string) => void;
}

export function PresentationCard({
  presentation,
  onEdit,
  onDelete,
  onView,
  onShare
}: PresentationCardProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {presentation.cover_image_url && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={presentation.cover_image_url}
            alt={presentation.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{presentation.title}</CardTitle>
          <Badge className={getStatusBadgeColor(presentation.status)}>
            {presentation.status.charAt(0).toUpperCase() + presentation.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {presentation.description && (
          <p className="text-muted-foreground text-sm line-clamp-3 mb-2">
            {presentation.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(new Date(presentation.created_at), { addSuffix: true })}
        </p>
        {presentation.published_at && (
          <p className="text-xs text-muted-foreground">
            Published {formatDistanceToNow(new Date(presentation.published_at), { addSuffix: true })}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(presentation.id)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(presentation.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-x-1">
          {presentation.status === 'published' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(presentation.id)}
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(presentation.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
