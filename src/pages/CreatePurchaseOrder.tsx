import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { PurchaseOrderForm } from "@/components/purchase-orders/PurchaseOrderForm";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { createPurchaseOrderLineItem } from "@/api/purchaseOrders";

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

      // Extract line items from the form data
      const { lineItems, ...purchaseOrderData } = formData;

      // Calculate total amount from line items
      const totalAmount = lineItems.reduce(
        (sum, item) => sum + (item.total_cost || 0),
        0
      );

      await createPurchaseOrder(
        {
          ...purchaseOrderData,
          status: "draft",
          total_amount: totalAmount, // Add the calculated total amount
        },
        {
          onSuccess: async (purchaseOrderId) => {
            // Create all line items
            try {
              if (lineItems && lineItems.length > 0) {
                for (const item of lineItems) {
                  if (item.product_id) {
                    // Only create line items with a product selected
                    await createPurchaseOrderLineItem({
                      ...item,
                      purchase_order_id: purchaseOrderId,
                    });
                  }
                }
              }

              toast({
                title: "Success",
                description: "Purchase order created successfully",
                variant: "default",
              });
              navigate(`/purchase-orders/${purchaseOrderId}`);
            } catch (lineItemError) {
              console.error(
                "Error creating purchase order line items:",
                lineItemError
              );
              toast({
                title: "Warning",
                description:
                  "Purchase order created but there was an issue with some line items",
                variant: "destructive",
              });
              navigate(`/purchase-orders/${purchaseOrderId}`);
            }
          },
          onError: (error) => {
            setError("Failed to create purchase order. Please try again.");
            console.error("Error creating purchase order:", error);
          },
        }
      );
    } catch (err) {
      setError("Failed to create purchase order. Please try again.");
      console.error("Error creating purchase order:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/purchase-orders");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate("/purchase-orders")}
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
            mode="create"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePurchaseOrder;
