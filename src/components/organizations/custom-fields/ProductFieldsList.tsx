
import { useState } from 'react';
import { useOrganizationProductFields } from '@/hooks/useOrganizationProductFields';
import { ProductCustomField } from '@/types/customFields';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, Trash2, GripVertical } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProductFieldForm } from './ProductFieldForm';

export function ProductFieldsList() {
  const { customFields, isLoading, deleteCustomField } = useOrganizationProductFields();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<ProductCustomField | null>(null);
  const [isDeletingField, setIsDeletingField] = useState<string | null>(null);

  const handleAddField = () => {
    setEditingField(null);
    setIsAddDialogOpen(true);
  };

  const handleEditField = (field: ProductCustomField) => {
    setEditingField(field);
    setIsAddDialogOpen(true);
  };

  const handleDeleteField = async (fieldId: string) => {
    setIsDeletingField(fieldId);
    try {
      await deleteCustomField.mutateAsync(fieldId);
    } finally {
      setIsDeletingField(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Custom Product Fields</CardTitle>
          <CardDescription>
            Define custom fields for your products
          </CardDescription>
        </div>
        <Button onClick={handleAddField} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : customFields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No custom fields have been defined yet.</p>
            <p className="text-sm">Click "Add Field" to create your first custom field.</p>
          </div>
        ) : (
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-4 font-medium">Field Name</th>
                  <th className="text-left py-2 px-4 font-medium">Field Key</th>
                  <th className="text-left py-2 px-4 font-medium">Type</th>
                  <th className="text-left py-2 px-4 font-medium">Required</th>
                  <th className="text-right py-2 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customFields.map((field) => (
                  <tr key={field.id} className="border-b last:border-b-0 hover:bg-muted/20">
                    <td className="py-2 px-4">{field.field_name}</td>
                    <td className="py-2 px-4">{field.field_key}</td>
                    <td className="py-2 px-4 capitalize">{field.field_type}</td>
                    <td className="py-2 px-4">{field.is_required ? 'Yes' : 'No'}</td>
                    <td className="py-2 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditField(field)}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={isDeletingField === field.id}
                            >
                              {isDeletingField === field.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Custom Field</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the field "{field.field_name}"? This action cannot be undone and all values stored for this field will be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteField(field.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Form Dialog */}
      <ProductFieldForm 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        editingField={editingField}
      />
    </Card>
  );
}
