
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ProductCustomField, FieldType } from '@/types/customFields';
import { useOrganizationProductFields } from '@/hooks/useOrganizationProductFields';
import { Loader2, X } from 'lucide-react';

interface ProductFieldFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingField: ProductCustomField | null;
}

export function ProductFieldForm({ 
  isOpen, 
  onOpenChange,
  editingField 
}: ProductFieldFormProps) {
  const { createCustomField, updateCustomField } = useOrganizationProductFields();
  
  const [fieldName, setFieldName] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [isRequired, setIsRequired] = useState(false);
  const [selectOptions, setSelectOptions] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingField) {
      setFieldName(editingField.field_name);
      setFieldKey(editingField.field_key);
      setFieldType(editingField.field_type);
      setIsRequired(editingField.is_required);
      
      if (editingField.field_type === 'select' && editingField.options?.values) {
        setSelectOptions(editingField.options.values);
      } else {
        setSelectOptions(['']);
      }
    } else {
      resetForm();
    }
  }, [editingField, isOpen]);

  const resetForm = () => {
    setFieldName('');
    setFieldKey('');
    setFieldType('text');
    setIsRequired(false);
    setSelectOptions(['']);
    setErrors({});
  };

  const handleFieldNameChange = (value: string) => {
    setFieldName(value);
    // Auto-generate field key if user hasn't manually edited it yet
    if (!editingField && (fieldKey === '' || fieldKey === generateFieldKey(fieldName))) {
      setFieldKey(generateFieldKey(value));
    }
  };

  const generateFieldKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  };

  const addSelectOption = () => {
    setSelectOptions([...selectOptions, '']);
  };

  const updateSelectOption = (index: number, value: string) => {
    const newOptions = [...selectOptions];
    newOptions[index] = value;
    setSelectOptions(newOptions);
  };

  const removeSelectOption = (index: number) => {
    if (selectOptions.length > 1) {
      setSelectOptions(selectOptions.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!fieldName.trim()) {
      newErrors.fieldName = 'Field name is required';
    }
    
    if (!fieldKey.trim()) {
      newErrors.fieldKey = 'Field key is required';
    } else if (!/^[a-z0-9_]+$/.test(fieldKey)) {
      newErrors.fieldKey = 'Field key can only contain lowercase letters, numbers, and underscores';
    }
    
    if (fieldType === 'select') {
      const nonEmptyOptions = selectOptions.filter(opt => opt.trim() !== '');
      if (nonEmptyOptions.length === 0) {
        newErrors.selectOptions = 'At least one option is required';
      }
      
      // Check for duplicate options
      const uniqueOptions = new Set(selectOptions.map(opt => opt.trim().toLowerCase()));
      if (uniqueOptions.size !== nonEmptyOptions.length) {
        newErrors.selectOptions = 'Duplicate options are not allowed';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const fieldData: any = {
        field_name: fieldName,
        field_key: fieldKey,
        field_type: fieldType,
        is_required: isRequired,
      };
      
      if (fieldType === 'select') {
        fieldData.options = {
          values: selectOptions.filter(opt => opt.trim() !== '')
        };
      }
      
      if (editingField) {
        await updateCustomField.mutateAsync({
          id: editingField.id,
          ...fieldData
        });
      } else {
        await createCustomField.mutateAsync(fieldData);
      }
      
      onOpenChange(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingField ? 'Edit' : 'Add'} Custom Product Field</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fieldName">Field Name</Label>
            <Input
              id="fieldName"
              value={fieldName}
              onChange={(e) => handleFieldNameChange(e.target.value)}
              placeholder="e.g. Country of Origin"
              className={errors.fieldName ? 'border-destructive' : ''}
            />
            {errors.fieldName && (
              <p className="text-sm text-destructive">{errors.fieldName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fieldKey">Field Key (unique identifier)</Label>
            <Input
              id="fieldKey"
              value={fieldKey}
              onChange={(e) => setFieldKey(e.target.value)}
              placeholder="e.g. country_of_origin"
              className={errors.fieldKey ? 'border-destructive' : ''}
              disabled={!!editingField}
            />
            {errors.fieldKey && (
              <p className="text-sm text-destructive">{errors.fieldKey}</p>
            )}
            {editingField && (
              <p className="text-xs text-muted-foreground">Field key cannot be changed after creation</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fieldType">Field Type</Label>
            <Select 
              value={fieldType} 
              onValueChange={(value) => setFieldType(value as FieldType)}
              disabled={!!editingField}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="select">Select (Dropdown)</SelectItem>
              </SelectContent>
            </Select>
            {editingField && (
              <p className="text-xs text-muted-foreground">Field type cannot be changed after creation</p>
            )}
          </div>

          {fieldType === 'select' && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {selectOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateSelectOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeSelectOption(index)}
                      disabled={selectOptions.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  type="button"
                  onClick={addSelectOption}
                >
                  Add Option
                </Button>
                {errors.selectOptions && (
                  <p className="text-sm text-destructive">{errors.selectOptions}</p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isRequired"
              checked={isRequired}
              onCheckedChange={setIsRequired}
            />
            <Label htmlFor="isRequired">Required Field</Label>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingField ? 'Update' : 'Create'} Field
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
