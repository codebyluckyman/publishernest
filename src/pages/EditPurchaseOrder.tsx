
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { PurchaseOrderForm } from "@/components/purchase-orders/PurchaseOrderForm";
import { usePurchaseOrders, usePurchaseOrderDetails } from "@/hooks/usePurchaseOrders";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

const EditPurchaseOrder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updatePurchaseOrder } = usePurchaseOrders();
  const { data, isLoading, isError, error } = usePurchaseOrderDetails(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Only allow editing purchase orders in draft state
  useEffect(() => {
    if (data?.purchaseOrder && data.purchaseOrder.status_code !== '00') {
      toast({
        title: "Cannot Edit Purchase Order",
        description: "Only draft purchase orders can be edited.",
        variant: "destructive",
      });
      navigate(`/purchase-orders/${id}`);
    }
  }, [data, id, navigate]);

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      // Extract line items from the form data
      const { lineItems, ...purchaseOrderData } = formData;

      // Update the purchase order
      await updatePurchaseOrder({
        id: id as string,
        ...purchaseOrderData
      });
      
      toast({
        title: "Success",
        description: "Purchase order updated successfully",
        variant: "default"
      });
      
      navigate(`/purchase-orders/${id}`);
    } catch (err) {
      setFormError('Failed to update purchase order. Please try again.');
      console.error('Error updating purchase order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/purchase-orders/${id}`);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading purchase order details...</div>;
  }
  
  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading purchase order: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!data || !data.purchaseOrder) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Purchase order not found</AlertDescription>
      </Alert>
    );
  }

  // Prepare initial data for the form
  const initialData = {
    printRunId: data.purchaseOrder.print_run_id,
    supplierId: data.purchaseOrder.supplier_id,
    currency: data.purchaseOrder.currency,
    issueDate: data.purchaseOrder.issue_date ? new Date(data.purchaseOrder.issue_date) : undefined,
    deliveryDate: data.purchaseOrder.delivery_date ? new Date(data.purchaseOrder.delivery_date) : undefined,
    notes: data.purchaseOrder.notes,
    shippingAddress: data.purchaseOrder.shipping_address,
    shippingMethod: data.purchaseOrder.shipping_method,
    lineItems: data.lineItems
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate(`/purchase-orders/${id}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Purchase Order
        </Button>
        <h1 className="text-2xl font-bold">Edit Purchase Order</h1>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Purchase Order: {data.purchaseOrder.po_number}</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseOrderForm 
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPurchaseOrder;
