
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash, Library } from 'lucide-react';
import { SalesOrderCharge } from '@/types/salesOrder';
import { ExtraCostLibraryDialog } from '@/components/quotes/form/extra-costs/ExtraCostLibraryDialog';
import { useOrganization } from '@/hooks/useOrganization';
import { ExtraCostTableItem } from '@/types/extraCost';
import { toast } from '@/utils/toast-utils';

type Charge = Omit<SalesOrderCharge, 'id' | 'sales_order_id' | 'created_at' | 'updated_at'>;

interface EnhancedChargesTableProps {
  charges: Charge[];
  onChargesChange: (charges: Charge[]) => void;
  currency: string;
}

export function EnhancedChargesTable({ charges, onChargesChange, currency }: EnhancedChargesTableProps) {
  const { currentOrganization } = useOrganization();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const addCharge = () => {
    const newCharge: Charge = {
      charge_type: 'shipping',
      description: 'Shipping',
      amount: 0,
      taxable: true,
    };
    onChargesChange([...charges, newCharge]);
  };

  const updateCharge = (index: number, key: keyof Charge, value: any) => {
    const updatedCharges = [...charges];
    updatedCharges[index] = { ...updatedCharges[index], [key]: value };
    onChargesChange(updatedCharges);
  };

  const removeCharge = (index: number) => {
    const updatedCharges = [...charges];
    updatedCharges.splice(index, 1);
    onChargesChange(updatedCharges);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const handleAddFromLibrary = (cost: ExtraCostTableItem) => {
    const currentCharges = [...charges]; 
    
    // Check if cost already exists in charges
    const alreadyExists = currentCharges.some(
      existingCharge => existingCharge.charge_type === cost.name
    );
    
    if (alreadyExists) {
      toast.warning(`"${cost.name}" is already added to this sales order`);
      return;
    }
    
    // Add the extra cost as a charge
    const newCharge: Charge = {
      charge_type: cost.name,
      description: cost.description || cost.name,
      amount: 0,
      taxable: true,
    };
    
    onChargesChange([...charges, newCharge]);
    toast.success(`"${cost.name}" added to charges`);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Taxable</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {charges.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No charges added. Add charges manually or from the Extra Costs library.
              </TableCell>
            </TableRow>
          ) : (
            charges.map((charge, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    type="text"
                    value={charge.charge_type}
                    onChange={(e) => updateCharge(index, 'charge_type', e.target.value)}
                    placeholder="e.g. shipping, handling, etc."
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={charge.description}
                    onChange={(e) => updateCharge(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={charge.amount}
                    onChange={(e) => updateCharge(index, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={charge.taxable}
                    onCheckedChange={(checked) => updateCharge(index, 'taxable', checked)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCharge(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={addCharge}
          className="mt-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Charge
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsLibraryOpen(true)}
          className="mt-2"
        >
          <Library className="mr-2 h-4 w-4" /> Add from Library
        </Button>
      </div>

      <ExtraCostLibraryDialog
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onAddFromLibrary={handleAddFromLibrary}
        organizationId={currentOrganization?.id}
      />
    </div>
  );
}
