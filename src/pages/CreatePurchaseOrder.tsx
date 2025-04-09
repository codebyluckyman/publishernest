
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Clock } from "lucide-react";

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Purchase Order creation feature is currently under development. We are working to enhance this functionality to provide a better user experience.
          </p>
          <p className="text-muted-foreground">
            In the meantime, you can view and manage existing purchase orders. Check back soon for updates on this feature.
          </p>
          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              onClick={() => navigate('/purchase-orders')}
            >
              Return to Purchase Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePurchaseOrder;
