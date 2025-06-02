
import { useProductForm } from '@/hooks/useProductForm';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

interface ProductFormProps {
  product?: Product;
  onCancel: () => void;
}

export function ProductForm({ product, onCancel }: ProductFormProps) {
  const { form, submitProduct, isLoading, isEditMode } = useProductForm(product);

  const handleSubmit = async (data: any) => {
    await submitProduct(data, isEditMode);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isEditMode ? 'Update' : 'Create'} Product
          </Button>
        </div>
      </form>
    </Form>
  );
}
