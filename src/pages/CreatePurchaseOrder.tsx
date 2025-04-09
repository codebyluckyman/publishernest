
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PurchaseOrderForm } from "@/components/purchase-orders/PurchaseOrderForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();
  const { createPurchaseOrder } = usePurchaseOrders();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await createPurchaseOrder({
        ...formData,
        status: 'draft',
      }, {
        onSuccess: () => {
          navigate('/purchase-orders');
        },
        onError: (error) => {
          setError(`Failed to create purchase order: ${error.message}`);
          console.error('Error creating purchase order:', error);
        }
      });
    } catch (err: any) {
      setError(`Failed to create purchase order: ${err.message || 'Unknown error'}`);
      console.error('Error creating purchase order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/purchase-orders');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/purchase-orders')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Purchase Orders
        </Button>
        <h1 className="text-2xl font-bold">Create Purchase Order</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseOrderForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel} 
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePurchaseOrder;
