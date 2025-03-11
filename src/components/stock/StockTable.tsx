
import { useState } from "react";
import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type SortField = 'product_title' | 'warehouse_name' | 'quantity' | 'list_price';
type SortDirection = 'asc' | 'desc';

type StockTableProps = {
  stockItems: StockItem[] | undefined;
  isLoading: boolean;
};

const StockTable = ({ stockItems, isLoading }: StockTableProps) => {
  const [sortField, setSortField] = useState<SortField>('product_title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />;
  };

  // Sort locally since we have all the data
  const sortedItems = [...(stockItems || [])].sort((a, b) => {
    // Handle different field types for proper comparison
    let comparison = 0;
    
    if (sortField === 'product_title') {
      comparison = (a.product_title || '').localeCompare(b.product_title || '');
    } else if (sortField === 'warehouse_name') {
      comparison = (a.warehouse_name || '').localeCompare(b.warehouse_name || '');
    } else if (sortField === 'quantity') {
      comparison = a.quantity - b.quantity;
    } else if (sortField === 'list_price') {
      const priceA = a.list_price || 0;
      const priceB = b.list_price || 0;
      comparison = priceA - priceB;
    }
    
    // Invert for descending
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-1 -ml-3 font-medium flex items-center"
              onClick={() => handleSort('product_title')}
            >
              Product {renderSortIcon('product_title')}
            </Button>
          </TableHead>
          <TableHead>ISBN</TableHead>
          <TableHead>Format</TableHead>
          <TableHead>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-1 -ml-3 font-medium flex items-center"
              onClick={() => handleSort('warehouse_name')}
            >
              Warehouse {renderSortIcon('warehouse_name')}
            </Button>
          </TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-1 -ml-3 font-medium flex items-center justify-end ml-auto"
              onClick={() => handleSort('list_price')}
            >
              Unit Price {renderSortIcon('list_price')}
            </Button>
          </TableHead>
          <TableHead className="text-right">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-1 -ml-3 font-medium flex items-center justify-end ml-auto"
              onClick={() => handleSort('quantity')}
            >
              Quantity {renderSortIcon('quantity')}
            </Button>
          </TableHead>
          <TableHead className="text-right">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">Loading stock information...</TableCell>
          </TableRow>
        ) : sortedItems.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">No stock records found</TableCell>
          </TableRow>
        ) : (
          sortedItems.map((item) => (
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
