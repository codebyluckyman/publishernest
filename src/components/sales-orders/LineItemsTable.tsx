import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash } from 'lucide-react';
import { SalesOrderLineItem } from '@/types/salesOrder';
import { useProducts } from '@/hooks/useProducts';
import { useFormats } from '@/hooks/useFormatsApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PurchaseOrderCostSelector } from '../purchase-orders/PurchaseOrderCostSelector';
import { SupplierQuoteInfo } from '../purchase-orders/SupplierQuoteInfo';
import { SupplierQuoteDetailsDialog } from '../purchase-orders/SupplierQuoteDetailsDialog';
import { useSupplierQuotesByProduct } from '@/hooks/useSupplierQuotesByProduct';
import { SupplierQuote } from '@/types/supplierQuote';
import { api } from '@/api/supplierQuotes/fetchSupplierQuoteById';

type LineItem = Omit<SalesOrderLineItem, 'id' | 'sales_order_id' | 'created_at' | 'updated_at'>;

interface LineItemsTableProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  currency: string;
}

export function LineItemsTable({ items, onItemsChange, currency }: LineItemsTableProps) {
  const { products, isLoading: isLoadingProducts } = useProducts();
  const { formats, isLoadingFormats } = useFormats();
  const [selectedQuoteDetails, setSelectedQuoteDetails] = useState<{
    quoteId: string;
    lineItemIndex: number;
  } | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<SupplierQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  const [selectedQuotes, setSelectedQuotes] = useState<{
    [key: number]: {
      quoteId: string;
      supplierName: string;
      quoteReference: string;
      validFrom?: string | null;
      validTo?: string | null;
    };
  }>({});

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

    if (key === 'product_id' || key === 'format_id') {
      const newSelectedQuotes = { ...selectedQuotes };
      delete newSelectedQuotes[index];
      setSelectedQuotes(newSelectedQuotes);
    }

    onItemsChange(updatedItems);
  };

  const removeLineItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    onItemsChange(updatedItems);
    
    const newSelectedQuotes = { ...selectedQuotes };
    delete newSelectedQuotes[index];
    setSelectedQuotes(newSelectedQuotes);
  };

  const handleCostSelect = (index: number, selectedId: string, unitCost: number, quoteDetails: any) => {
    updateLineItem(index, 'unit_cost', unitCost);
    setSelectedQuotes({
      ...selectedQuotes,
      [index]: {
        quoteId: quoteDetails.quoteId,
        supplierName: quoteDetails.supplierName,
        quoteReference: quoteDetails.quoteReference,
        validFrom: quoteDetails.validFrom,
        validTo: quoteDetails.validTo
      }
    });
  };

  const handleViewQuoteDetails = async (quoteId: string, lineItemIndex: number) => {
    try {
      setLoadingQuote(true);
      setSelectedQuoteDetails({ quoteId, lineItemIndex });
      
      const quote = await api.fetchSupplierQuoteById(quoteId);
      setCurrentQuote(quote);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error("Error loading quote details:", error);
    } finally {
      setLoadingQuote(false);
    }
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
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                No items added. Click "Add Item" below to add a line item.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
              <React.Fragment key={index}>
                <TableRow>
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
                      value={item.format_id || ''}
                      onValueChange={(value) => updateLineItem(index, 'format_id', value || undefined)}
                      disabled={isLoadingFormats}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {formats?.map((format) => (
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
                    {item.product_id && (
                      <PurchaseOrderCostSelector
                        productId={item.product_id}
                        formatId={item.format_id}
                        value={item.supplier_quote_cost_id}
                        onChange={(value, unitCost, quoteDetails) => handleCostSelect(index, value, unitCost, quoteDetails)}
                      />
                    )}
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
                {selectedQuotes[index] && (
                  <TableRow>
                    <TableCell colSpan={8} className="px-0 pb-0 pt-0 border-t-0">
                      <SupplierQuoteInfo
                        supplierName={selectedQuotes[index].supplierName}
                        quoteReference={selectedQuotes[index].quoteReference}
                        validFrom={selectedQuotes[index].validFrom}
                        validTo={selectedQuotes[index].validTo}
                        onViewDetails={() => handleViewQuoteDetails(selectedQuotes[index].quoteId, index)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
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

      <SupplierQuoteDetailsDialog
        quote={currentQuote}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}
