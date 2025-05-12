
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product } from "@/types/product";
import { PresentationDisplaySettings } from "@/types/salesPresentation";
import { formatPrice } from "@/utils/productUtils";
import Image from "@/components/ui/img";

interface TableViewProps {
  products: Array<{
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }>;
  displaySettings?: PresentationDisplaySettings;
  onSelectProduct: (product: {
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }) => void;
}

export function TableView({ products, displaySettings, onSelectProduct }: TableViewProps) {
  const cardColumns = displaySettings?.cardColumns || ['price', 'isbn13', 'publisher'];
  
  const getDisplayValue = (product: Product, column: string) => {
    switch (column) {
      case 'price':
        return formatPrice(product.list_price, product.default_currency);
      case 'isbn13':
        return product.isbn13 || 'N/A';
      case 'publisher':
        return product.publisher_name || 'N/A';
      case 'publication_date':
        return product.publication_date ? new Date(product.publication_date).toLocaleDateString() : 'N/A';
      case 'format':
        return product.format_extra_comments || 'N/A';
      case 'synopsis':
        return product.synopsis ? `${product.synopsis.substring(0, 100)}...` : 'N/A';
      default:
        return '';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Cover</TableHead>
          <TableHead>Title</TableHead>
          {cardColumns.map((column) => (
            <TableHead key={column}>
              {column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ')}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((item) => (
          <TableRow 
            key={item.product.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSelectProduct(item)}
          >
            <TableCell>
              {item.product.cover_image_url ? (
                <div className="w-16 h-20 overflow-hidden rounded">
                  <Image
                    src={item.product.cover_image_url}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-20 bg-muted rounded flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </TableCell>
            <TableCell className="font-medium">{item.product.title}</TableCell>
            {cardColumns.map((column) => (
              <TableCell key={column}>
                {getDisplayValue(item.product, column)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
