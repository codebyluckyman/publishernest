
import React, { useState } from "react";
import { ChevronDown, ChevronRight, ArrowUpDown, ChevronUp } from "lucide-react";
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

type GroupedStockItem = {
  isbn13: string | null;
  items: StockItem[];
  totalQuantity: number;
  totalValue: number;
  productTitles: string[];
};

type SortField = 'isbn13' | 'totalQuantity' | 'totalValue';
type SortDirection = 'asc' | 'desc';

type StockGroupedTableProps = {
  stockItems: StockItem[] | undefined;
  isLoading: boolean;
};

const StockGroupedTable = ({ stockItems, isLoading }: StockGroupedTableProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<SortField>('isbn13');
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

  // Group stock items by ISBN
  const groupedItems = (): GroupedStockItem[] => {
    if (!stockItems) return [];

    const groups: Record<string, GroupedStockItem> = {};
    
    stockItems.forEach(item => {
      const key = item.product_isbn13 || "no-isbn";
      
      if (!groups[key]) {
        groups[key] = {
          isbn13: item.product_isbn13,
          items: [],
          totalQuantity: 0,
          totalValue: 0,
          productTitles: []
        };
      }
      
      groups[key].items.push(item);
      groups[key].totalQuantity += item.quantity;
      
      if (item.list_price !== null) {
        groups[key].totalValue += item.list_price * item.quantity;
      }
      
      if (!groups[key].productTitles.includes(item.product_title)) {
        groups[key].productTitles.push(item.product_title);
      }
    });
    
    // Convert to array
    const groupsArray = Object.values(groups);

    // Sort based on the current sort field and direction
    return groupsArray.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'isbn13') {
        const isbnA = a.isbn13 || '';
        const isbnB = b.isbn13 || '';
        comparison = isbnA.localeCompare(isbnB);
      } else if (sortField === 'totalQuantity') {
        comparison = a.totalQuantity - b.totalQuantity;
      } else if (sortField === 'totalValue') {
        comparison = a.totalValue - b.totalValue;
      }
      
      // Invert for descending
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const toggleGroup = (isbn: string | null) => {
    const key = isbn || "no-isbn";
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-6"></TableHead>
          <TableHead>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-1 -ml-3 font-medium flex items-center"
              onClick={() => handleSort('isbn13')}
            >
              ISBN {renderSortIcon('isbn13')}
            </Button>
          </TableHead>
          <TableHead>Products</TableHead>
          <TableHead className="text-right">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-1 -ml-3 font-medium flex items-center justify-end ml-auto"
              onClick={() => handleSort('totalQuantity')}
            >
              Total Quantity {renderSortIcon('totalQuantity')}
            </Button>
          </TableHead>
          <TableHead className="text-right">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-1 -ml-3 font-medium flex items-center justify-end ml-auto"
              onClick={() => handleSort('totalValue')}
            >
              Total Value {renderSortIcon('totalValue')}
            </Button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8">Loading stock information...</TableCell>
          </TableRow>
        ) : groupedItems().length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8">No stock records found</TableCell>
          </TableRow>
        ) : (
          <>
            {groupedItems().map((group) => {
              const groupKey = group.isbn13 || "no-isbn";
              const isExpanded = !!expandedGroups[groupKey];
              
              return (
                <React.Fragment key={groupKey}>
                  {/* Group row */}
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/60 font-medium"
                    onClick={() => toggleGroup(group.isbn13)}
                  >
                    <TableCell className="p-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {group.isbn13 || "No ISBN"}
                    </TableCell>
                    <TableCell>
                      {group.productTitles.length === 1 
                        ? group.productTitles[0] 
                        : `${group.productTitles[0]} +${group.productTitles.length - 1} more`}
                    </TableCell>
                    <TableCell className="text-right font-medium">{group.totalQuantity}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(group.totalValue || null)}
                    </TableCell>
                  </TableRow>
                  
                  {/* Detail rows */}
                  {isExpanded && group.items.map((item) => (
                    <TableRow key={item.id} className="bg-muted/20">
                      <TableCell></TableCell>
                      <TableCell className="p-2">
                        <Badge variant="outline" className="font-normal">
                          {getProductFormLabel(item.product_form)}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center space-x-2">
                        <div>{item.product_title}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.warehouse_name}
                          {item.warehouse_location && ` (${item.warehouse_location})`}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {item.list_price 
                          ? formatCurrency(item.list_price * item.quantity)
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}
          </>
        )}
      </TableBody>
    </Table>
  );
};

export default StockGroupedTable;
