
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash } from 'lucide-react';
import { SalesOrderCharge } from '@/types/salesOrder';

type Charge = Omit<SalesOrderCharge, 'id' | 'sales_order_id' | 'created_at' | 'updated_at'>;

interface ChargesTableProps {
  charges: Charge[];
  onChargesChange: (charges: Charge[]) => void;
  currency: string;
}

export function ChargesTable({ charges, onChargesChange, currency }: ChargesTableProps) {
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
                No charges added. Click "Add Charge" below to add additional charges.
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

      <Button
        type="button"
        variant="outline"
        onClick={addCharge}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Charge
      </Button>
    </div>
  );
}
