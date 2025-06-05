
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

interface SupplierPurchaseOrdersTabProps {
  supplierId: string;
}

export function SupplierPurchaseOrdersTab({ supplierId }: SupplierPurchaseOrdersTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Purchase Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Purchase Orders Feature Coming Soon</h3>
          <p className="text-sm max-w-md mx-auto">
            This tab will display all purchase orders placed with this supplier, including order history, status tracking, and delivery information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
