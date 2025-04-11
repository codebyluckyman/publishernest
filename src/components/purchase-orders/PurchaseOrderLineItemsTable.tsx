
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash, Eye } from 'lucide-react';
import { NewPurchaseOrderLineItem } from '@/types/purchaseOrderLineItem';
import { ProductSearchSelect } from '@/components/common/ProductSearchSelect';
import { useFormats } from '@/hooks/useFormatsApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupplierQuoteInfo } from './SupplierQuoteInfo';
import { SupplierQuoteDetailsDialog } from './SupplierQuoteDetailsDialog';
import { Product } from '@/types/product';

interface PurchaseOrderLineItemsTableProps {
  items: NewPurchaseOrderLineItem[];
  onItemsChange: (items: NewPurchaseOrderLineItem[]) => void;
  currency: string;
  onSupplierChange?: (supplierId: string) => void;
  supplierId?: string;
}

export function PurchaseOrderLineItemsTable({
  items,
  onItemsChange,
  currency,
  onSupplierChange,
  supplierId
}: PurchaseOrderLineItemsTableProps) {
  const { formats, isLoadingFormats } = useFormats();
  const [productFormats, setProductFormats] = useState<Record<string, string>>({});
  
  // Initialize empty line items with all quantity fields set to 0
  const addLineItem = () => {
    const newItem: NewPurchaseOrderLineItem = {
      product_id: '',
      format_id: '',
      quantity: 0,
      in_production_quantity: 0,
      in_transit_quantity: 0,
      received_quantity: 0,
      unit_cost: 0,
      total_cost: 0,
    };
    onItemsChange([...items, newItem]);
  };

  // Update a specific field in a line item
  const updateLineItem = (index: number, key: keyof NewPurchaseOrderLineItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [key]: value };

    // Auto-calculate totals when quantity or unit_cost changes
    if (key === 'quantity' || key === 'unit_cost') {
      const qty = key === 'quantity' ? value : items[index].quantity;
      const cost = key === 'unit_cost' ? value : items[index].unit_cost;
      updatedItems[index].total_cost = qty * cost;
    }

    onItemsChange(updatedItems);
  };

  // Handle product selection with format detection
  const handleProductSelect = (index: number, productId: string, product: Product) => {
    updateLineItem(index, 'product_id', productId);
    
    // If the product has a format_id, set it automatically
    if (product.format_id) {
      updateLineItem(index, 'format_id', product.format_id);
    } else {
      // Reset format if the product doesn't have one
      updateLineItem(index, 'format_id', '');
    }
  };

  // Handle supplier quote selection
  const handleSupplierQuoteSelect = (index: number, quoteId: string, unitCost: number, selectedSupplierId: string) => {
    updateLineItem(index, 'supplier_quote_id', quoteId);
    updateLineItem(index, 'unit_cost', unitCost);
    
    // Update the total cost based on the quantity
    const quantity = items[index].quantity || 0;
    updateLineItem(index, 'total_cost', quantity * unitCost);
    
    // If this is the first line item and a supplier ID is set, notify parent
    if (index === 0 && selectedSupplierId && onSupplierChange && !supplierId) {
      onSupplierChange(selectedSupplierId);
    }
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    onItemsChange(updatedItems);
  };

  // Format the currency amount
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
            <TableHead>In Production</TableHead>
            <TableHead>In Transit</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Quote</TableHead>
            <TableHead>Unit Cost</TableHead>
            <TableHead>Total Cost</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                No items added. Click "Add Item" below to add a line item.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="min-w-[200px]">
                  <ProductSearchSelect
                    value={item.product_id}
                    onChange={(productId, product) => handleProductSelect(index, productId, product)}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={item.format_id || ''}
                    onValueChange={(value) => updateLineItem(index, 'format_id', value || undefined)}
                    disabled={isLoadingFormats || !item.product_id}
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
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={item.in_production_quantity}
                    onChange={(e) => updateLineItem(index, 'in_production_quantity', parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={item.in_transit_quantity}
                    onChange={(e) => updateLineItem(index, 'in_transit_quantity', parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={item.received_quantity}
                    onChange={(e) => updateLineItem(index, 'received_quantity', parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <SupplierQuoteInfo
                      productId={item.product_id}
                      formatId={item.format_id}
                      supplierId={supplierId}
                      value={item.supplier_quote_id}
                      onChange={(quoteId, unitCost, quoteSupplier) => 
                        handleSupplierQuoteSelect(index, quoteId, unitCost, quoteSupplier)}
                      disabled={!item.product_id}
                    />
                    {item.supplier_quote_id && item.supplier_quote_id !== 'manual' && (
                      <SupplierQuoteDetailsDialog 
                        quoteId={item.supplier_quote_id} 
                        formatId={item.format_id}
                        productId={item.product_id}
                      />
                    )}
                  </div>
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
