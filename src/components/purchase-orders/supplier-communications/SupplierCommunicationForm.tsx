
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';

interface SupplierCommunicationFormProps {
  onSubmit: (message: string, communicationType: 'email' | 'phone' | 'note' | 'other') => void;
  isSubmitting: boolean;
}

export function SupplierCommunicationForm({ onSubmit, isSubmitting }: SupplierCommunicationFormProps) {
  const [message, setMessage] = useState('');
  const [communicationType, setCommunicationType] = useState<'email' | 'phone' | 'note' | 'other'>('note');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSubmit(message, communicationType);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="communication-type">Communication Type</Label>
        <Select 
          value={communicationType} 
          onValueChange={(value) => setCommunicationType(value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone Call</SelectItem>
            <SelectItem value="note">Note</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Enter communication details..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="resize-none"
          required
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={isSubmitting || !message.trim()} 
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Recording...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Record Communication
          </>
        )}
      </Button>
    </form>
  );
}
