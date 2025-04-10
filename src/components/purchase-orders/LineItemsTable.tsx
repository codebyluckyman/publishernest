import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { useProductsWithFormats } from "@/hooks/useProductsWithFormats";
import { Card, CardContent } from "@/components/ui/card";
import { SupplierQuoteSelector } from "./SupplierQuoteSelector";
import { SupplierQuoteInfo } from "./SupplierQuoteInfo";
import { fetchSupplierQuoteById } from "@/api/supplierQuotes";
import { SupplierQuoteDetailsDialog } from "./SupplierQuoteDetailsDialog";
import { SupplierQuote } from "@/types/supplierQuote";

interface LineItem {
  id?: string;
  product_id: string;
  format_id?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  supplier_id?: string;
  supplier_quote_id?: string;
  isNew?: boolean;
  isDeleted?: boolean;
}

interface LineItemsTableProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  onSupplierSelect?: (supplierId: string) => void;
  disabled?: boolean;
}

export function LineItemsTable({ 
  items = [], 
  onChange, 
  onSupplierSelect,
  disabled = false 
}: LineItemsTableProps) {
  const { products, isLoading: isProductsLoading } = useProductsWithFormats();
  const [lineItems, setLineItems] = useState<LineItem[]>(items);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
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

  useEffect(() => {
    if (items.length > 0 && lineItems.length === 0) {
      setLineItems(items);
    }
  }, [items]);

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: uuidv4(),
      product_id: "",
      quantity: 1,
      unit_cost: 0,
      total_cost: 0,
      isNew: true,
    };
    const updatedItems = [...lineItems, newItem];
    setLineItems(updatedItems);
    onChange(updatedItems);
    setExpandedItem(newItem.id || null);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...lineItems];
    if (updatedItems[index].id && !updatedItems[index].isNew) {
      updatedItems[index] = {
        ...updatedItems[index],
        isDeleted: true,
      };
      setLineItems(updatedItems);
    } else {
      updatedItems.splice(index, 1);
      setLineItems(updatedItems);
    }
    
    // Remove from selected quotes
    const newSelectedQuotes = { ...selectedQuotes };
    delete newSelectedQuotes[index];
    setSelectedQuotes(newSelectedQuotes);
    
    onChange(updatedItems.filter(item => !item.isDeleted));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // When product changes, update format_id if the product has a linked format
    if (field === 'product_id') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct?.format) {
        updatedItems[index].format_id = selectedProduct.format.id;
      } else {
        updatedItems[index].format_id = undefined;
      }
      
      // Reset supplier-related fields
      updatedItems[index].supplier_id = undefined;
      updatedItems[index].supplier_quote_id = undefined;
      
      // Remove from selected quotes
      const newSelectedQuotes = { ...selectedQuotes };
      delete newSelectedQuotes[index];
      setSelectedQuotes(newSelectedQuotes);
    }
    
    // Calculate total cost
    if (field === 'quantity' || field === 'unit_cost') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitCost = field === 'unit_cost' ? value : updatedItems[index].unit_cost;
      updatedItems[index].total_cost = parseFloat((quantity * unitCost).toFixed(2));
    }

    setLineItems(updatedItems);
    onChange(updatedItems);
  };
  
  const handleQuoteSelect = (index: number, data: { supplierId: string, supplierQuoteId: string, unitCost: number, supplierName: string, quoteReference: string, validFrom?: string | null, validTo?: string | null }) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      supplier_id: data.supplierId,
      supplier_quote_id: data.supplierQuoteId,
      unit_cost: data.unitCost,
    };
    
    // Update total cost
    updatedItems[index].total_cost = parseFloat((updatedItems[index].quantity * data.unitCost).toFixed(2));
    
    // Store quote details for display
    setSelectedQuotes({
      ...selectedQuotes,
      [index]: {
        quoteId: data.supplierQuoteId,
        supplierName: data.supplierName,
        quoteReference: data.quoteReference,
        validFrom: data.validFrom,
        validTo: data.validTo
      }
    });
    
    setLineItems(updatedItems);
    onChange(updatedItems);
    
    // Notify parent of supplier selection
    if (onSupplierSelect && data.supplierId) {
      onSupplierSelect(data.supplierId);
    }
  };

  const handleViewQuoteDetails = async (quoteId: string, lineItemIndex: number) => {
    try {
      setLoadingQuote(true);
      setSelectedQuoteDetails({ quoteId, lineItemIndex });
      
      const quote = await fetchSupplierQuoteById(quoteId);
      setCurrentQuote(quote);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error("Error loading quote details:", error);
    } finally {
      setLoadingQuote(false);
    }
  };

  const toggleExpandItem = (itemId: string | undefined) => {
    if (!itemId) return;
    
    if (expandedItem === itemId) {
      setExpandedItem(null);
    } else {
      setExpandedItem(itemId);
    }
  };

  const getProductById = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  const visibleItems = lineItems.filter(item => !item.isDeleted);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No items added. Click "Add Item" to add a line item.
                </TableCell>
              </TableRow>
            ) : (
              visibleItems.map((item, index) => (
                <>
                  <TableRow 
                    key={item.id}
                    className={expandedItem === item.id ? "bg-muted/50" : ""}
                    onClick={() => toggleExpandItem(item.id)}
                  >
                    <TableCell>
                      <Select
                        value={item.product_id}
                        onValueChange={(value) => handleItemChange(index, 'product_id', value)}
                        disabled={disabled || isProductsLoading}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {item.product_id && getProductById(item.product_id)?.format ? (
                        <span className="text-sm">
                          {getProductById(item.product_id)?.format?.format_name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-[100px]"
                        min={1}
                        disabled={disabled}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.unit_cost}
                        onChange={(e) => handleItemChange(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                        className="w-[100px]"
                        min={0}
                        step={0.01}
                        disabled={disabled}
                      />
                    </TableCell>
                    <TableCell>
                      {item.total_cost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { 
                          e.stopPropagation();
                          handleRemoveItem(index);
                        }}
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Display supplier quote information if selected */}
                  {selectedQuotes[index] && (
                    <TableRow>
                      <TableCell colSpan={6} className="px-0 pb-0 pt-0 border-t-0">
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
                  
                  {expandedItem === item.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-slate-50 p-0">
                        <Card className="border-0 shadow-none">
                          <CardContent className="p-4">
                            <SupplierQuoteSelector
                              productId={item.product_id}
                              formatId={item.format_id}
                              onQuoteSelect={(data) => handleQuoteSelect(index, data)}
                              disabled={disabled}
                            />
                          </CardContent>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddItem}
        disabled={disabled}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
      
      <SupplierQuoteDetailsDialog
        quote={currentQuote}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}
