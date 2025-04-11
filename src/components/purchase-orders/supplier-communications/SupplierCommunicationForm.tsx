
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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
        <Label>Communication Type</Label>
        <RadioGroup 
          value={communicationType} 
          onValueChange={(value) => setCommunicationType(value as 'email' | 'phone' | 'note' | 'other')}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="email" />
            <Label htmlFor="email">Email</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="phone" id="phone" />
            <Label htmlFor="phone">Phone Call</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="note" id="note" />
            <Label htmlFor="note">Note</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Other</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter details about your communication with the supplier..."
          className="h-32"
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting || !message.trim()}>
        {isSubmitting ? 'Recording...' : 'Record Communication'}
      </Button>
    </form>
  );
}
