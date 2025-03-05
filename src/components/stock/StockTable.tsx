
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StockItem = {
  id: string;
  quantity: number;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_location: string | null;
  product_id: string;
  product_title: string;
  product_isbn13: string | null;
  product_form: string | null;
  list_price: number | null;
};

type StockTableProps = {
  stockItems: StockItem[] | undefined;
  isLoading: boolean;
};

const StockTable = ({ stockItems, isLoading }: StockTableProps) => {
  const formatCurrency = (price: number | null) => {
    if (price === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getProductFormLabel = (form: string | null) => {
    if (!form) return "N/A";
    
    const formMap: Record<string, string> = {
      "BA": "Book",
      "BB": "Hardcover",
      "BC": "Paperback",
      "JB": "Journal",
      "DG": "Electronic",
      "XA": "Custom",
    };
    
    return formMap[form] || form;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>ISBN</TableHead>
          <TableHead>Format</TableHead>
          <TableHead>Warehouse</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">Loading stock information...</TableCell>
          </TableRow>
        ) : stockItems?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">No stock records found</TableCell>
          </TableRow>
        ) : (
          stockItems?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.product_title}</TableCell>
              <TableCell>{item.product_isbn13 || "—"}</TableCell>
              <TableCell>
                {item.product_form ? (
                  <Badge variant="secondary">
                    {getProductFormLabel(item.product_form)}
                  </Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{item.warehouse_name}</TableCell>
              <TableCell>{item.warehouse_location || "—"}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.list_price)}</TableCell>
              <TableCell className="text-right font-medium">{item.quantity}</TableCell>
              <TableCell className="text-right font-medium">
                {item.list_price 
                  ? formatCurrency(item.list_price * item.quantity)
                  : "N/A"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default StockTable;
