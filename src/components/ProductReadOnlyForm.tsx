
import { useProductForm } from '@/hooks/useProductForm';
import { Product } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductReadOnlyFormProps {
  product: Product;
}

export function ProductReadOnlyForm({ product }: ProductReadOnlyFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Publisher:</strong> {product.publisher_name || 'N/A'}</p>
          <p><strong>ISBN-13:</strong> {product.isbn13 || 'N/A'}</p>
          <p><strong>Status:</strong> {product.status}</p>
          {product.list_price && (
            <p><strong>Price:</strong> {product.list_price} {product.currency_code || 'USD'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
