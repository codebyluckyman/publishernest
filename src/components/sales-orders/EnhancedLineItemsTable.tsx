
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash } from 'lucide-react';
import { SalesOrderLineItem } from '@/types/salesOrder';
import { useProducts } from '@/hooks/useProducts';
import { useFormats } from '@/hooks/useFormatsApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PurchaseOrderCostSelector } from './PurchaseOrderCostSelector';

type LineItem = Omit<SalesOrderLineItem, 'id' | 'sales_order_id' | 'created_at' | 'updated_at'> & {
  cost_source?: string;
};

interface EnhancedLineItemsTableProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  currency: string;
}

export function EnhancedLineItemsTable({ items, onItemsChange, currency }: EnhancedLineItemsTableProps) {
  const { products, isLoading: isLoadingProducts } = useProducts();
  const { formats, isLoadingFormats } = useFormats();

  const addLineItem = () => {
    const newItem: LineItem = {
      product_id: '',
      format_id: '',
      quantity: 1,
      unit_cost: 0,
      unit_price: 0,
      total_cost: 0,
      total_price: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const updateLineItem = (index: number, key: keyof LineItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [key]: value };

    // Auto-calculate totals
    if (key === 'quantity' || key === 'unit_price') {
      const qty = key === 'quantity' ? value : items[index].quantity;
      const price = key === 'unit_price' ? value : items[index].unit_price;
      updatedItems[index].total_price = qty * price;
    }

    if (key === 'quantity' || key === 'unit_cost') {
      const qty = key === 'quantity' ? value : items[index].quantity;
      const cost = key === 'unit_cost' ? value : items[index].unit_cost;
      updatedItems[index].total_cost = qty * cost;
    }

    onItemsChange(updatedItems);
  };

  const updateLineItemWithCost = (index: number, costSourceId: string, unitCost: number) => {
    const updatedItems = [...items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      cost_source: costSourceId,
      unit_cost: unitCost,
      total_cost: updatedItems[index].quantity * unitCost
    };
    onItemsChange(updatedItems);
  };

  const removeLineItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    onItemsChange(updatedItems);
  };

  const getProductById = (id: string) => {
    return products?.find(product => product.id === id);
  };

  const getFormatById = (id: string) => {
    return formats?.find(format => format.id === id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Cost Source</TableHead>
            <TableHead>Unit Cost</TableHead>
            <TableHead>Total Cost</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                No items added. Click "Add Item" below to add a line item.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Select
                    value={item.product_id}
                    onValueChange={(value) => updateLineItem(index, 'product_id', value)}
                    disabled={isLoadingProducts}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={item.format_id || undefined}
                    onValueChange={(value) => updateLineItem(index, 'format_id', value || undefined)}
                    disabled={isLoadingFormats}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {formats?.filter(format => format.id).map((format) => (
                        <SelectItem key={format.id} value={format.id}>
                          {format.format_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <PurchaseOrderCostSelector
                    productId={item.product_id}
                    formatId={item.format_id}
                    value={item.cost_source}
                    onChange={(sourceId, cost) => updateLineItemWithCost(index, sourceId, cost)}
                    disabled={!item.product_id}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_cost}
                    onChange={(e) => updateLineItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                    className="w-28"
                  />
                </TableCell>
                <TableCell>
                  {formatCurrency(item.total_cost)}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="w-28"
                  />
                </TableCell>
                <TableCell>
                  {formatCurrency(item.total_price)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Button
        type="button"
        variant="outline"
        onClick={addLineItem}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Item
      </Button>
    </div>
  );
}
