import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PurchaseOrderFormValues } from '@/types/purchaseOrder';
import { PrintRunSelectCombobox } from '@/components/purchase-orders/PrintRunSelectCombobox';
import { CreatePrintRunDialog } from '@/components/purchase-orders/CreatePrintRunDialog';
import { Loader2 } from 'lucide-react';

const CreatePurchaseOrderPage = () => {
  const navigate = useNavigate();
  const [printRunId, setPrintRunId] = useState<string>('');
  const [supplierId, setSupplierId] = useState<string>('');
  const [supplierQuoteId, setSupplierQuoteId] = useState<string>('');
  const [isCreatePrintRunDialogOpen, setIsCreatePrintRunDialogOpen] = useState(false);
  
  const { useCreatePurchaseOrder } = usePurchaseOrders();
  const createMutation = useCreatePurchaseOrder();

  const handleCreatePurchaseOrder = async () => {
    if (!printRunId) {
      alert('Please select a Print Run');
      return;
    }

    if (!supplierId) {
      alert('Please select a Supplier');
      return;
    }

    // Create the required minimal PurchaseOrderFormValues
    const formData: PurchaseOrderFormValues = {
      print_run_id: printRunId,
      supplier_id: supplierId,
      supplier_quote_id: supplierQuoteId || undefined,
      line_items: [
        // At least one line item is required
        {
          product_id: 'temp-product-id', // This would be replaced with real data
          quantity: 1
        }
      ]
    };

    createMutation.mutate(formData, {
      onSuccess: (data) => {
        navigate(`/purchase-orders/${data.id}`);
      }
    });
  };

  const handlePrintRunCreated = (newPrintRunId: string) => {
    setPrintRunId(newPrintRunId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Purchase Order</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/purchase-orders')}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreatePurchaseOrder} 
            disabled={!printRunId || !supplierId || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Purchase Order'
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Print Run</label>
              <div className="flex gap-2">
                <div className="flex-grow">
                  <PrintRunSelectCombobox 
                    value={printRunId}
                    onChange={setPrintRunId}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreatePrintRunDialogOpen(true)}
                >
                  Create New
                </Button>
              </div>
            </div>
            
            {/* Placeholder for supplier selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier</label>
              <div>
                <p className="text-sm text-gray-500">
                  Supplier selection functionality would go here
                </p>
                <Button 
                  type="button" 
                  variant="link" 
                  className="p-0" 
                  onClick={() => setSupplierId('placeholder-supplier')}
                >
                  Use placeholder supplier for demo
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreatePrintRunDialog 
        open={isCreatePrintRunDialogOpen}
        onOpenChange={setIsCreatePrintRunDialogOpen}
        onSuccess={handlePrintRunCreated}
      />
    </div>
  );
};

export default CreatePurchaseOrderPage;
