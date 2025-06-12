// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Plus, Trash, ChevronDown, ChevronUp } from "lucide-react";
// import type { NewPurchaseOrderLineItem } from "@/types/purchaseOrderLineItem";
// import { ProductSearchSelect } from "@/components/common/ProductSearchSelect";
// import { useFormats } from "@/hooks/useFormatsApi";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { SupplierQuoteInfo } from "./SupplierQuoteInfo";
// import { SupplierQuoteDetailsDialog } from "./SupplierQuoteDetailsDialog";
// import type { Product } from "@/types/product";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// interface PurchaseOrderLineItemsTableProps {
//   items: NewPurchaseOrderLineItem[];
//   onItemsChange: (items: NewPurchaseOrderLineItem[]) => void;
//   currency: string;
//   onSupplierChange?: (supplierId: string) => void;
//   supplierId?: string;
// }

// export function PurchaseOrderLineItemsTable({
//   items,
//   onItemsChange,
//   currency,
//   onSupplierChange,
//   supplierId,
// }: PurchaseOrderLineItemsTableProps) {
//   const { formats, isLoadingFormats } = useFormats();
//   const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

//   // Initialize empty line items with all quantity fields set to 0
//   const addLineItem = () => {
//     const newItem: NewPurchaseOrderLineItem = {
//       product_id: "",
//       format_id: "",
//       quantity: 0,
//       production_quantity: 0,
//       transit_quantity: 0,
//       received_quantity: 0,
//       unit_cost: 0,
//       total_cost: 0,
//     };
//     onItemsChange([...items, newItem]);
//   };

//   // Update a specific field in a line item
//   const updateLineItem = (
//     index: number,
//     key: keyof NewPurchaseOrderLineItem,
//     value: any
//   ) => {
//     const updatedItems = [...items];
//     updatedItems[index] = { ...updatedItems[index], [key]: value };

//     // Auto-calculate totals when quantity or unit_cost changes
//     if (key === "quantity" || key === "unit_cost") {
//       const qty = key === "quantity" ? value : items[index].quantity;
//       const cost = key === "unit_cost" ? value : items[index].unit_cost;
//       updatedItems[index].total_cost = qty * cost;
//     }

//     onItemsChange(updatedItems);
//   };

//   // Handle product selection with format detection
//   const handleProductSelect = (
//     index: number,
//     productId: string,
//     product: Product
//   ) => {
//     // Create a new array with the updated item to ensure React detects the change
//     const updatedItems = [...items];
//     updatedItems[index] = {
//       ...updatedItems[index],
//       product_id: productId,
//     };

//     // If the product has a format_id, set it automatically
//     if (product.format_id) {
//       updatedItems[index].format_id = product.format_id;
//     } else {
//       // Reset format if the product doesn't have one
//       updatedItems[index].format_id = "";
//     }

//     // Update the state immediately with the complete updated item
//     onItemsChange(updatedItems);
//   };

//   // Handle supplier quote selection
//   const handleSupplierQuoteSelect = (
//     index: number,
//     quoteId: string,
//     unitCost: number,
//     selectedSupplierId: string
//   ) => {
//     // First update the supplier quote id
//     updateLineItem(index, "supplier_quote_id", quoteId);

//     // Then update the unit cost from the selected quote
//     updateLineItem(index, "unit_cost", unitCost);

//     // Update the total cost based on the quantity
//     const quantity = items[index].quantity || 0;
//     updateLineItem(index, "total_cost", quantity * unitCost);

//     // If this is the first line item and a supplier ID is set, notify parent
//     if (index === 0 && selectedSupplierId && onSupplierChange && !supplierId) {
//       onSupplierChange(selectedSupplierId);
//     }
//   };

//   // Remove a line item
//   const removeLineItem = (index: number, e: React.MouseEvent) => {
//     // Prevent event from bubbling up to form
//     e.preventDefault();
//     e.stopPropagation();

//     const updatedItems = [...items];
//     updatedItems.splice(index, 1);
//     onItemsChange(updatedItems);
//   };

//   // Format the currency amount
//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: currency || "USD",
//     }).format(amount);
//   };

//   // Toggle expanded state for a row
//   const toggleRowExpanded = (index: number, e: React.MouseEvent) => {
//     // Prevent event from bubbling up to form
//     e.preventDefault();
//     e.stopPropagation();

//     setExpandedRows((prev) => ({
//       ...prev,
//       [index]: !prev[index],

//     }));
//   };

//   return (
//     <div className="space-y-4">
//       {items.length === 0 ? (
//         <Card>
//           <CardContent className="p-6 text-center text-muted-foreground">
//             No items added. Click "Add Item" below to add a line item.
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="space-y-4">
//           {items.map((item, index) => (
//             <Card key={index} className="overflow-hidden">
//               <div className="p-4 flex items-center justify-between bg-muted/30">
//                 <div className="flex items-center gap-4 flex-grow">
//                   <div className="flex-grow">
//                     <ProductSearchSelect
//                       value={item.product_id}
//                       onChange={(productId, product) =>
//                         handleProductSelect(index, productId, product)
//                       }
//                     />
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="text-sm font-medium">
//                       {formatCurrency(item.total_cost)}
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       type="button"
//                       onClick={(e) => removeLineItem(index, e)}
//                     >
//                       <Trash className="h-4 w-4" />
//                       <span className="sr-only">Remove item</span>
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       type="button"
//                       onClick={(e) => toggleRowExpanded(index, e)}
//                     >
//                       {expandedRows[index] ? (
//                         <ChevronUp className="h-4 w-4" />
//                       ) : (
//                         <ChevronDown className="h-4 w-4" />
//                       )}
//                       <span className="sr-only">
//                         {expandedRows[index] ? "Collapse" : "Expand"}
//                       </span>
//                     </Button>
//                   </div>
//                 </div>
//               </div>

//               {expandedRows[index] && (
//                 <CardContent className="p-4 pt-0">
//                   <Tabs defaultValue="details" className="mt-4">
//                     <TabsList className="grid grid-cols-2">
//                       <TabsTrigger value="details">Details</TabsTrigger>
//                       <TabsTrigger value="quantities">Quantities</TabsTrigger>
//                     </TabsList>
//                     <TabsContent value="details" className="space-y-4 pt-4">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium">Format</label>
//                           <Select
//                             value={item.format_id || ""}
//                             onValueChange={(value) =>
//                               updateLineItem(
//                                 index,
//                                 "format_id",
//                                 value || undefined
//                               )
//                             }
//                             disabled={isLoadingFormats || !item.product_id}
//                           >
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select format" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="none">None</SelectItem>
//                               {formats
//                                 ?.filter((format) => format.id)
//                                 .map((format) => (
//                                   <SelectItem key={format.id} value={format.id}>
//                                     {format.format_name}
//                                   </SelectItem>
//                                 ))}
//                             </SelectContent>
//                           </Select>
//                         </div>

//                         <div className="space-y-2">
//                           <label className="text-sm font-medium">Quote</label>
//                           <div className="flex items-center space-x-2">
//                             <SupplierQuoteInfo
//                               productId={item.product_id}
//                               formatId={item.format_id}
//                               supplierId={supplierId}
//                               value={item.supplier_quote_id}
//                               onChange={(quoteId, unitCost, quoteSupplier) =>
//                                 handleSupplierQuoteSelect(
//                                   index,
//                                   quoteId,
//                                   unitCost,
//                                   quoteSupplier
//                                 )
//                               }
//                               disabled={!item.product_id}
//                             />
//                             {item.supplier_quote_id &&
//                               item.supplier_quote_id !== "manual" && (
//                                 <SupplierQuoteDetailsDialog
//                                   quoteId={item.supplier_quote_id}
//                                   formatId={item.format_id}
//                                   productId={item.product_id}
//                                 />
//                               )}
//                           </div>
//                         </div>

//                         <div className="space-y-2">
//                           <label className="text-sm font-medium">
//                             Quantity
//                           </label>
//                           <Input
//                             type="number"
//                             min="0"
//                             value={item.quantity}
//                             onChange={(e) =>
//                               updateLineItem(
//                                 index,
//                                 "quantity",
//                                 Number.parseInt(e.target.value) || 0
//                               )
//                             }
//                           />
//                         </div>

//                         <div className="space-y-2">
//                           <label className="text-sm font-medium">
//                             Unit Cost
//                           </label>
//                           <Input
//                             type="number"
//                             min="0"
//                             step="0.01"
//                             value={item.unit_cost}
//                             onChange={(e) =>
//                               updateLineItem(
//                                 index,
//                                 "unit_cost",
//                                 Number.parseFloat(e.target.value) || 0
//                               )
//                             }
//                           />
//                         </div>
//                       </div>
//                     </TabsContent>

//                     <TabsContent value="quantities" className="space-y-4 pt-4">
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium">
//                             In Production
//                           </label>
//                           <Input
//                             type="number"
//                             min="0"
//                             value={item.production_quantity}
//                             onChange={(e) =>
//                               updateLineItem(
//                                 index,
//                                 "production_quantity",
//                                 Number.parseInt(e.target.value) || 0
//                               )
//                             }
//                           />
//                         </div>

//                         <div className="space-y-2">
//                           <label className="text-sm font-medium">
//                             In Transit
//                           </label>
//                           <Input
//                             type="number"
//                             min="0"
//                             value={item.transit_quantity}
//                             onChange={(e) =>
//                               updateLineItem(
//                                 index,
//                                 "transit_quantity",
//                                 Number.parseInt(e.target.value) || 0
//                               )
//                             }
//                           />
//                         </div>

//                         <div className="space-y-2">
//                           <label className="text-sm font-medium">
//                             Received
//                           </label>
//                           <Input
//                             type="number"
//                             min="0"
//                             value={item.received_quantity}
//                             onChange={(e) =>
//                               updateLineItem(
//                                 index,
//                                 "received_quantity",
//                                 Number.parseInt(e.target.value) || 0
//                               )
//                             }
//                           />
//                         </div>
//                       </div>
//                     </TabsContent>
//                   </Tabs>
//                 </CardContent>
//               )}
//             </Card>
//           ))}
//         </div>
//       )}

//       <Button
//         type="button"
//         variant="outline"
//         onClick={addLineItem}
//         className="mt-4"
//       >
//         <Plus className="mr-2 h-4 w-4" /> Add Item
//       </Button>
//     </div>
//   );
// }

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash,
  ChevronDown,
  ChevronUp,
  Package,
  DollarSign,
  Hash,
  Truck,
} from "lucide-react";
import type { NewPurchaseOrderLineItem } from "@/types/purchaseOrderLineItem";
import { ProductSearchSelect } from "@/components/common/ProductSearchSelect";
import { useFormats } from "@/hooks/useFormatsApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupplierQuoteInfo } from "./SupplierQuoteInfo";
import { SupplierQuoteDetailsDialog } from "./SupplierQuoteDetailsDialog";
import type { Product } from "@/types/product";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  supplierId,
}: PurchaseOrderLineItemsTableProps) {
  const { formats, isLoadingFormats } = useFormats();
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  // Initialize empty line items with all quantity fields set to 0
  const addLineItem = () => {
    const newItem: NewPurchaseOrderLineItem = {
      product_id: "",
      format_id: "",
      quantity: 0,
      production_quantity: 0,
      transit_quantity: 0,
      received_quantity: 0,
      unit_cost: 0,
      total_cost: 0,
    };
    onItemsChange([...items, newItem]);
  };

  // Update a specific field in a line item
  const updateLineItem = (
    index: number,
    key: keyof NewPurchaseOrderLineItem,
    value: any
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [key]: value };

    // Auto-calculate totals when quantity or unit_cost changes
    if (key === "quantity" || key === "unit_cost") {
      const qty = key === "quantity" ? value : items[index].quantity;
      const cost = key === "unit_cost" ? value : items[index].unit_cost;
      updatedItems[index].total_cost = qty * cost;
    }

    onItemsChange(updatedItems);
  };

  // Handle product selection with format detection
  const handleProductSelect = (
    index: number,
    productId: string,
    product: Product
  ) => {
    // Create a new array with the updated item to ensure React detects the change
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      product_id: productId,
    };

    // If the product has a format_id, set it automatically
    if (product.format_id) {
      updatedItems[index].format_id = product.format_id;
    } else {
      // Reset format if the product doesn't have one
      updatedItems[index].format_id = "";
    }

    // Update the state immediately with the complete updated item
    onItemsChange(updatedItems);
  };

  // Handle supplier quote selection
  const handleSupplierQuoteSelect = (
    index: number,
    quoteId: string,
    unitCost: number,
    selectedSupplierId: string
  ) => {
    const updatedItems = [...items];

    // Update supplier quote ID
    updatedItems[index] = {
      ...updatedItems[index],
      supplier_quote_id: quoteId,
      unit_cost: unitCost, // Set the unit cost from the quote
      total_cost: (updatedItems[index].quantity || 0) * unitCost, // Recalculate total
    };

    // Update state
    onItemsChange(updatedItems);

    // Handle supplier change if needed
    if (index === 0 && selectedSupplierId && onSupplierChange && !supplierId) {
      onSupplierChange(selectedSupplierId);
    }
  };

  // Remove a line item
  const removeLineItem = (index: number, e: React.MouseEvent) => {
    // Prevent event from bubbling up to form
    e.preventDefault();
    e.stopPropagation();

    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    onItemsChange(updatedItems);
  };

  // Format the currency amount
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  // Toggle expanded state for a row
  const toggleRowExpanded = (index: number, e: React.MouseEvent) => {
    // Prevent event from bubbling up to form
    e.preventDefault();
    e.stopPropagation();

    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Calculate total order value
  const totalOrderValue = items.reduce(
    (sum, item) => sum + (item.total_cost || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header with summary */}
      {items.length > 0 && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Items:
                </span>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Total:
                </span>
                <span className="text-lg font-semibold">
                  {formatCurrency(totalOrderValue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items added yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your purchase order by adding line items below.
            </p>
            <Button onClick={addLineItem} size="lg">
              <Plus className="mr-2 h-4 w-4" /> Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card
              key={index}
              className="overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-grow">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <ProductSearchSelect
                        value={item.product_id}
                        onChange={(productId, product) =>
                          handleProductSelect(index, productId, product)
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        Line Total
                      </div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(item.total_cost)}
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={(e) => toggleRowExpanded(index, e)}
                        className="h-8 w-8"
                      >
                        {expandedRows[index] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {expandedRows[index] ? "Collapse" : "Expand"}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={(e) => removeLineItem(index, e)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {expandedRows[index] && (
                <CardContent className="pt-0">
                  <Separator className="mb-6" />
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger
                        value="details"
                        className="flex items-center gap-2"
                      >
                        <Package className="h-4 w-4" />
                        Product Details
                      </TabsTrigger>
                      <TabsTrigger
                        value="quantities"
                        className="flex items-center gap-2"
                      >
                        <Truck className="h-4 w-4" />
                        Quantities
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Format
                            </label>
                            <Select
                              value={item.format_id || ""}
                              onValueChange={(value) =>
                                updateLineItem(
                                  index,
                                  "format_id",
                                  value || undefined
                                )
                              }
                              disabled={isLoadingFormats || !item.product_id}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {formats
                                  ?.filter((format) => format.id)
                                  .map((format) => (
                                    <SelectItem
                                      key={format.id}
                                      value={format.id}
                                    >
                                      {format.format_name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Supplier Quote
                            </label>
                            <div className="flex items-center space-x-2">
                              <SupplierQuoteInfo
                                productId={item.product_id}
                                formatId={item.format_id}
                                supplierId={supplierId}
                                quantity={item.quantity}
                                value={item.supplier_quote_id}
                                onChange={(quoteId, unitCost, quoteSupplier) =>
                                  handleSupplierQuoteSelect(
                                    index,
                                    quoteId,
                                    unitCost,
                                    quoteSupplier
                                  )
                                }
                                disabled={!item.product_id}
                              />
                              {item.supplier_quote_id &&
                                item.supplier_quote_id !== "manual" && (
                                  <SupplierQuoteDetailsDialog
                                    quoteId={item.supplier_quote_id}
                                    formatId={item.format_id}
                                    productId={item.product_id}
                                  />
                                )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                Quantity
                              </label>
                              <Input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateLineItem(
                                    index,
                                    "quantity",
                                    Number.parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-11"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Unit Cost
                              </label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_cost || ""} // This will now reflect the quote's unit_cost_1
                                onChange={(e) =>
                                  updateLineItem(
                                    index,
                                    "unit_cost",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-28"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="quantities" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Package className="h-4 w-4 text-orange-500" />
                            In Production
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={item.production_quantity}
                            onChange={(e) =>
                              updateLineItem(
                                index,
                                "production_quantity",
                                Number.parseInt(e.target.value) || 0
                              )
                            }
                            className="h-11"
                          />
                          <div className="text-xs text-muted-foreground">
                            Currently being manufactured
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-500" />
                            In Transit
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={item.transit_quantity}
                            onChange={(e) =>
                              updateLineItem(
                                index,
                                "transit_quantity",
                                Number.parseInt(e.target.value) || 0
                              )
                            }
                            className="h-11"
                          />
                          <div className="text-xs text-muted-foreground">
                            Shipped but not received
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Package className="h-4 w-4 text-green-500" />
                            Received
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={item.received_quantity}
                            onChange={(e) =>
                              updateLineItem(
                                index,
                                "received_quantity",
                                Number.parseInt(e.target.value) || 0
                              )
                            }
                            className="h-11"
                          />
                          <div className="text-xs text-muted-foreground">
                            Delivered and confirmed
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-medium mb-3">Quantity Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Ordered</div>
                            <div className="font-semibold">{item.quantity}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Production
                            </div>
                            <div className="font-semibold text-orange-600">
                              {item.production_quantity}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Transit</div>
                            <div className="font-semibold text-blue-600">
                              {item.transit_quantity}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Received
                            </div>
                            <div className="font-semibold text-green-600">
                              {item.received_quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={addLineItem}
          size="lg"
          className="min-w-[200px]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Line Item
        </Button>
      </div>
    </div>
  );
}
