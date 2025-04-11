import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchaseOrderDetails } from "@/hooks/usePurchaseOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PurchaseOrderApprovalDialog } from "@/components/purchase-orders/PurchaseOrderApprovalDialog";
import { PurchaseOrderCancelDialog } from "@/components/purchase-orders/PurchaseOrderCancelDialog";
import { PurchaseOrderStatusUpdate } from "@/components/purchase-orders/PurchaseOrderStatusUpdate";
import { PurchaseOrderStatusBadge } from "@/components/purchase-orders/PurchaseOrderStatusBadge";
import { 
  ArrowLeft, 
  Edit, 
  ClipboardList,
  AlertTriangle,
  XCircle, 
  FileText 
} from "lucide-react";
import { PurchaseOrder, PURCHASE_ORDER_STATUS_MAP } from "@/types/purchaseOrder";
import { DateFormatter, formatCurrency } from "@/utils/formatters";

const PurchaseOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePurchaseOrderDetails(id);
  
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  
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
  
  const canEdit = purchaseOrder.status_code === '00'; // Only editable in draft state
  const canRequestApproval = purchaseOrder.status_code === '00';
  const canCancel = purchaseOrder.status_code !== '90'; // Can cancel if not completed
  const canUpdateStatus = true; // Always allow status updates
  
  const formatDateWithUser = (date: string | undefined, userId: string | undefined) => {
    if (!date) return "—";
    let result = DateFormatter.format(new Date(date));
    if (userId) {
      result += " by User"; // In a real app, you would fetch the user's name
    }
    return result;
  };

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
          
          {canUpdateStatus && (
            <Button 
              variant="default"
              onClick={() => setIsStatusUpdateOpen(true)}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Update Status
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
                <PurchaseOrderStatusBadge status={purchaseOrder.status_code} />
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
                <p>{purchaseOrder.currency} {formatCurrency(purchaseOrder.total_amount)}</p>
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
            <h3 className="font-medium mb-4">Status Timeline</h3>
            <div className="space-y-2">
              {purchaseOrder.approved_at && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Approved</span>
                  <span>{formatDateWithUser(purchaseOrder.approved_at, purchaseOrder.approved_by)}</span>
                </div>
              )}
              {purchaseOrder.issued_at && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Issued to Supplier</span>
                  <span>{formatDateWithUser(purchaseOrder.issued_at, purchaseOrder.issued_by)}</span>
                </div>
              )}
              {purchaseOrder.scheduled_at && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Scheduled</span>
                  <span>{formatDateWithUser(purchaseOrder.scheduled_at, purchaseOrder.scheduled_by)}</span>
                </div>
              )}
              {purchaseOrder.production_started_at && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Production Started</span>
                  <span>{formatDateWithUser(purchaseOrder.production_started_at, purchaseOrder.production_started_by)}</span>
                </div>
              )}
              {purchaseOrder.production_completed_at && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Production Completed</span>
                  <span>{formatDateWithUser(purchaseOrder.production_completed_at, purchaseOrder.production_completed_by)}</span>
                </div>
              )}
              {purchaseOrder.awaiting_shipment_at && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Awaiting Shipment</span>
                  <span>{formatDateWithUser(purchaseOrder.awaiting_shipment_at, purchaseOrder.awaiting_shipment_by)}</span>
                </div>
              )}
              {purchaseOrder.shipped_at && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Shipped</span>
                  <span>{formatDateWithUser(purchaseOrder.shipped_at, purchaseOrder.shipped_by)}</span>
                </div>
              )}
              {purchaseOrder.received_at && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Received</span>
                  <span>{formatDateWithUser(purchaseOrder.received_at, purchaseOrder.received_by)}</span>
                </div>
              )}
              {purchaseOrder.goods_checked_at && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Goods Checked</span>
                  <span>{formatDateWithUser(purchaseOrder.goods_checked_at, purchaseOrder.goods_checked_by)}</span>
                </div>
              )}
              {purchaseOrder.completed_at && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Completed</span>
                  <span>{formatDateWithUser(purchaseOrder.completed_at, purchaseOrder.completed_by)}</span>
                </div>
              )}
              {purchaseOrder.cancelled_at && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Cancelled</span>
                  <span>{formatDateWithUser(purchaseOrder.cancelled_at, purchaseOrder.cancelled_by)}</span>
                </div>
              )}
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
      
      <PurchaseOrderStatusUpdate 
        purchaseOrder={purchaseOrder}
        open={isStatusUpdateOpen}
        onOpenChange={setIsStatusUpdateOpen}
      />
    </div>
  );
};

export default PurchaseOrderDetail;
