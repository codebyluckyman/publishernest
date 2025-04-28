
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface TextSectionProps {
  title: string;
  content: string;
  description?: string;
  isEditable?: boolean;
  onEdit?: () => void;
}

export function TextSection({ 
  title, 
  content,
  description,
  isEditable = false,
  onEdit
}: TextSectionProps) {
  return (
    <Card>
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {isEditable && onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </CardContent>
    </Card>
  );
}
