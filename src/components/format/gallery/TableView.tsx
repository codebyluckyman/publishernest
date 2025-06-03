
import { Image } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Product } from "../types/ProductTypes";

interface TableViewProps { 
  products: Product[];
  onProductClick: (productId: string) => void;
}

export function TableView({ products, onProductClick }: TableViewProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Cover</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>ISBN-13</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onProductClick(product.id)}
            >
              <TableCell>
                <div className="h-12 w-9 bg-muted flex items-center justify-center overflow-hidden">
                  {product.cover_image_url ? (
                    <img
                      src={product.cover_image_url}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <Image className="h-6 w-6 text-muted-foreground opacity-20" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{product.title}</TableCell>
              <TableCell>{product.isbn13 || product.isbn10 || "No ISBN"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
