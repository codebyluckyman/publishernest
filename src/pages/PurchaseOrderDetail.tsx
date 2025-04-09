
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchaseOrderDetails } from "@/hooks/usePurchaseOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PurchaseOrderApprovalDialog } from "@/components/purchase-orders/PurchaseOrderApprovalDialog";
import { PurchaseOrderCancelDialog } from "@/components/purchase-orders/PurchaseOrderCancelDialog";
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle, 
  AlertTriangle,
  XCircle, 
  FileText 
} from "lucide-react";
import { PurchaseOrderStatus } from "@/types/purchaseOrder";
import { DateFormatter } from "@/utils/formatters";

const PurchaseOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePurchaseOrderDetails(id);
  
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  
  if (isLoading) {
    return <div className="text-center py-8">Loading purchase order details...</div>;
  }
  
  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>
          Error loading purchase order: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!data || !data.purchaseOrder) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>Purchase order not found</AlertDescription>
      </Alert>
    );
  }
  
  const { purchaseOrder, lineItems } = data;
  
  const getStatusBadge = (status: PurchaseOrderStatus) => {
    const statusMap = {
      'draft': <Badge variant="outline" className="bg-gray-100">Draft</Badge>,
      'pending_approval': <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>,
      'approved': <Badge className="bg-blue-100 text-blue-800">Approved</Badge>,
      'fulfilled': <Badge className="bg-green-100 text-green-800">Fulfilled</Badge>,
      'cancelled': <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
    };
    
    return statusMap[status] || <Badge>Unknown</Badge>;
  };
  
  const canEdit = purchaseOrder.status === 'draft';
  const canApprove = purchaseOrder.status === 'pending_approval';
  const canRequestApproval = purchaseOrder.status === 'draft';
  const canCancel = ['draft', 'pending_approval', 'approved'].includes(purchaseOrder.status);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/purchase-orders')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Orders
          </Button>
          <h1 className="text-2xl font-bold">Purchase Order Details</h1>
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <Button 
              variant="outline"
              onClick={() => navigate(`/purchase-orders/edit/${purchaseOrder.id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          
          {canRequestApproval && (
            <Button 
              variant="outline"
              onClick={() => setIsApprovalDialogOpen(true)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Request Approval
            </Button>
          )}
          
          {canApprove && (
            <Button 
              variant="default"
              onClick={() => setIsApprovalDialogOpen(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          
          {canCancel && (
            <Button 
              variant="destructive"
              onClick={() => setIsCancelDialogOpen(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle className="flex items-center gap-4">
                <FileText className="h-6 w-6" />
                <span>{purchaseOrder.po_number}</span>
                {getStatusBadge(purchaseOrder.status)}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created on {DateFormatter.format(new Date(purchaseOrder.created_at))}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Print Run</h3>
                <p>{purchaseOrder.print_run?.title || "—"}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Supplier</h3>
                <p>{purchaseOrder.supplier?.supplier_name || "—"}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Currency</h3>
                <p>{purchaseOrder.currency}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Total Amount</h3>
                <p>{purchaseOrder.currency} {purchaseOrder.total_amount?.toFixed(2) || "0.00"}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Issue Date</h3>
                <p>{purchaseOrder.issue_date ? DateFormatter.format(new Date(purchaseOrder.issue_date)) : "—"}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Delivery Date</h3>
                <p>{purchaseOrder.delivery_date ? DateFormatter.format(new Date(purchaseOrder.delivery_date)) : "—"}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Shipping Address</h3>
                <p>{purchaseOrder.shipping_address || "—"}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Shipping Method</h3>
                <p>{purchaseOrder.shipping_method || "—"}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-4">Notes</h3>
            <p className="whitespace-pre-line">{purchaseOrder.notes || "No notes provided."}</p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-4">Line Items</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No items added to this purchase order.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product?.title || item.product_id}</TableCell>
                        <TableCell>{item.format?.format_name || "—"}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{purchaseOrder.currency} {item.unit_cost.toFixed(2)}</TableCell>
                        <TableCell>{purchaseOrder.currency} {item.total_cost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">
                      Total:
                    </TableCell>
                    <TableCell className="font-medium">
                      {purchaseOrder.currency} {purchaseOrder.total_amount?.toFixed(2) || "0.00"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          
          {purchaseOrder.status === 'cancelled' && purchaseOrder.cancellation_reason && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Cancellation Reason</h3>
                <p className="text-red-700">{purchaseOrder.cancellation_reason}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      <PurchaseOrderApprovalDialog 
        purchaseOrder={purchaseOrder}
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
      />
      
      <PurchaseOrderCancelDialog
        purchaseOrder={purchaseOrder}
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      />
    </div>
  );
};

export default PurchaseOrderDetail;
