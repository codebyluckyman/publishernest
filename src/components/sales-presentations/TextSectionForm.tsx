
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TextSectionFormProps {
  onSave: (data: {
    title: string;
    description: string;
    content: string;
  }) => void;
  initialData?: {
    title: string;
    description: string;
    content: string;
  };
}

export function TextSectionForm({ onSave, initialData }: TextSectionFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [content, setContent] = useState(initialData?.content || '');

  const handleSubmit = () => {
    onSave({
      title,
      description,
      content
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Section Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter section title"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Section Description (Optional)</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter section description"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter section content"
          className="min-h-[200px]"
        />
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSubmit}>
          Save Section
        </Button>
      </div>
    </div>
  );
}
