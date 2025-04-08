
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { useProducts } from "@/hooks/useProducts";
import { useFormatsForSelect } from "@/hooks/useFormatsForSelect";

interface LineItem {
  id?: string;
  product_id: string;
  format_id?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

interface LineItemsTableProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  disabled?: boolean;
}

export function LineItemsTable({ items = [], onChange, disabled = false }: LineItemsTableProps) {
  const { products, isLoading: isProductsLoading } = useProducts();
  const { formats, isLoading: isFormatsLoading } = useFormatsForSelect();
  const [lineItems, setLineItems] = useState(items);

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
    onChange(updatedItems.filter(item => !item.isDeleted));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    if (field === 'quantity' || field === 'unit_cost') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitCost = field === 'unit_cost' ? value : updatedItems[index].unit_cost;
      updatedItems[index].total_cost = parseFloat((quantity * unitCost).toFixed(2));
    }

    setLineItems(updatedItems);
    onChange(updatedItems);
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
                <TableRow key={item.id}>
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
                      value={item.format_id || "no_format"}
                      onValueChange={(value) => handleItemChange(index, 'format_id', value === "no_format" ? undefined : value)}
                      disabled={disabled || isFormatsLoading}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_format">None</SelectItem>
                        {formats?.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      onClick={() => handleRemoveItem(index)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
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
    </div>
  );
}
