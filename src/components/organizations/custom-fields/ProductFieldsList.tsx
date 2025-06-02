
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganizationProductFields } from '@/hooks/useOrganizationProductFields';
import { ProductFieldForm } from './ProductFieldForm';
import { ProductCustomField } from '@/types/customFields';

export function ProductFieldsList() {
  const { customFields, isLoading, deleteCustomField } = useOrganizationProductFields();
  const [editingField, setEditingField] = useState<ProductCustomField | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return <div>Loading custom fields...</div>;
  }

  const handleDelete = async (fieldId: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      await deleteCustomField.mutateAsync(fieldId);
    }
  };

  if (showForm || editingField) {
    return (
      <ProductFieldForm
        field={editingField || undefined}
        onClose={() => {
          setShowForm(false);
          setEditingField(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Custom Product Fields</h3>
        <Button onClick={() => setShowForm(true)}>
          Add Field
        </Button>
      </div>

      {customFields.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No custom fields configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {customFields.map((field) => (
            <Card key={field.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">{field.field_name}</CardTitle>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingField(field)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(field.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Type: {field.field_type} | Required: {field.is_required ? 'Yes' : 'No'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
