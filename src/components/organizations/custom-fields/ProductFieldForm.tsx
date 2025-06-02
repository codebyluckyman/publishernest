import { useState, useEffect } from 'react';
import { useOrganizationProductFields } from '@/hooks/useOrganizationProductFields';
import { ProductCustomField } from '@/types/customFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface ProductFieldFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingField?: ProductCustomField | null;
}

export function ProductFieldForm({ isOpen, onOpenChange, editingField }: ProductFieldFormProps) {
  const { createField, updateField } = useOrganizationProductFields();
  const [formData, setFormData] = useState({
    field_name: '',
    field_key: '',
    field_type: 'text',
    is_required: false,
    display_order: 0,
    options: null as any
  });

  useEffect(() => {
    if (editingField) {
      setFormData({
        field_name: editingField.field_name,
        field_key: editingField.field_key,
        field_type: editingField.field_type,
        is_required: editingField.is_required,
        display_order: editingField.display_order,
        options: editingField.options
      });
    } else {
      setFormData({
        field_name: '',
        field_key: '',
        field_type: 'text',
        is_required: false,
        display_order: 0,
        options: null
      });
    }
  }, [editingField, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingField) {
        await updateField.mutateAsync({
          id: editingField.id,
          updates: formData
        });
      } else {
        await createField.mutateAsync(formData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving field:', error);
    }
  };

  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingField ? 'Edit Custom Field' : 'Add Custom Field'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="field_name">Field Name</Label>
            <Input
              id="field_name"
              value={formData.field_name}
              onChange={(e) => setFormData(prev => ({ ...prev, field_name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="field_key">Field Key</Label>
            <Input
              id="field_key"
              value={formData.field_key}
              onChange={(e) => setFormData(prev => ({ ...prev, field_key: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="field_type">Field Type</Label>
            <Select value={formData.field_type} onValueChange={(value) => setFormData(prev => ({ ...prev, field_type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="select">Select</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_required"
              checked={formData.is_required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: checked }))}
            />
            <Label htmlFor="is_required">Required Field</Label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createField.isPending || updateField.isPending}>
              {(createField.isPending || updateField.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingField ? 'Update' : 'Create'} Field
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
