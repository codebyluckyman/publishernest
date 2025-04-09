
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSalesOrders } from "@/hooks/useSalesOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalesOrderForm } from "@/components/sales-orders/SalesOrderForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";

const CreateSalesOrder = () => {
  const navigate = useNavigate();
  const { createSalesOrder } = useSalesOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const salesOrderId = await createSalesOrder({
        ...formData,
        status: 'draft',
      });
      
      if (salesOrderId) {
        navigate(`/sales-orders/${salesOrderId}`);
      } else {
        throw new Error('Failed to create sales order');
      }
    } catch (err) {
      setError('Failed to create sales order. Please try again.');
      console.error('Error creating sales order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/sales-orders');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/sales-orders')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sales Orders
        </Button>
        <h1 className="text-2xl font-bold">Create Sales Order</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sales Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesOrderForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel} 
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSalesOrder;
