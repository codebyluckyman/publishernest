
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizationProductFields } from '@/hooks/useOrganizationProductFields';
import { ProductCustomField, FieldType } from '@/types/customFields';
import { toast } from 'sonner';

interface ProductFieldFormProps {
  field?: ProductCustomField;
  onClose: () => void;
}

export function ProductFieldForm({ field, onClose }: ProductFieldFormProps) {
  const { createCustomField, updateCustomField } = useOrganizationProductFields();
  const [formData, setFormData] = useState({
    field_name: field?.field_name || '',
    field_key: field?.field_key || '',
    field_type: field?.field_type || 'text' as FieldType,
    is_required: field?.is_required || false,
    display_order: field?.display_order || 0,
    options: field?.options || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (field) {
        await updateCustomField.mutateAsync({ 
          id: field.id, 
          ...formData 
        });
      } else {
        await createCustomField.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save field');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="field_name">Field Name</Label>
        <Input
          id="field_name"
          value={formData.field_name}
          onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="field_type">Field Type</Label>
        <Select 
          value={formData.field_type} 
          onValueChange={(value: FieldType) => setFormData({ ...formData, field_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="select">Select</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="date">Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {field ? 'Update' : 'Create'} Field
        </Button>
      </div>
    </form>
  );
}
