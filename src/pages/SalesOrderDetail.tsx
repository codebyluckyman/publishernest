

import React from 'react';
import { useParams } from 'react-router-dom';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, User, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { SalesOrderRequirementsSection } from '@/components/sales-orders/requirements/SalesOrderRequirementsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeliveryLocationTab } from '@/components/sales-orders/DeliveryLocationTab';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getSymbolForCurrency } from '@/api/organizations/currencySymbols';

const SalesOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    getSalesOrderById, 
    updateSalesOrderStatus,
    isUpdatingStatus
  } = useSalesOrders();
  
  const { 
    data: salesOrder,
    isLoading,
    isError,
    error
  } = getSalesOrderById(id || '');

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (!salesOrder) return;
    
    updateSalesOrderStatus({
      id: salesOrder.id,
      status: newStatus,
      changedBy: '00000000-0000-0000-0000-000000000000' // In a real app, get this from auth context
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const getCreatorName = () => {
    if (!salesOrder?.created_by_user) return 'Unknown User';
    
    if (salesOrder.created_by_user.first_name && salesOrder.created_by_user.last_name) {
      return `${salesOrder.created_by_user.first_name} ${salesOrder.created_by_user.last_name}`;
    }
    
    return salesOrder.created_by_user.email;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 w-1/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-100 rounded mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="container mx-auto p-4 mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load sales order details'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!salesOrder) {
    return (
      <Alert variant="destructive" className="container mx-auto p-4 mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>
          The requested sales order could not be found.
        </AlertDescription>
      </Alert>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salesOrder.currency
    }).format(amount);
  };

  const isEditable = salesOrder.status === 'draft';

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{salesOrder.so_number}</h1>
          <p className="text-gray-500">
            {salesOrder.issue_date ? 
              `Issued: ${format(new Date(salesOrder.issue_date), 'MMM d, yyyy')}` : 
              'Not yet issued'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(salesOrder.status)}
          {salesOrder.status === 'draft' && (
            <Button 
              onClick={() => handleStatusChange('approved')}
              disabled={isUpdatingStatus}
            >
              Approve
            </Button>
          )}
          {salesOrder.status === 'draft' && (
            <Button 
              variant="destructive" 
              onClick={() => handleStatusChange('cancelled')}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="mb-6">
        <TabsList>
          <TabsTrigger value="details">Order Details</TabsTrigger>
          <TabsTrigger value="requirements">Customer Requirements</TabsTrigger>
          {salesOrder.delivery_location_id && (
            <TabsTrigger value="delivery">Delivery Location</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{salesOrder.customer?.customer_name}</p>
                <p className="text-sm text-gray-500">{salesOrder.customer?.address}</p>
                {salesOrder.customer?.contact_name && (
                  <div className="mt-4">
                    <p className="font-medium">Contact</p>
                    <p>{salesOrder.customer.contact_name}</p>
                    <p>{salesOrder.customer.contact_email}</p>
                    <p>{salesOrder.customer.contact_phone}</p>
                  </div>
                )}
                {salesOrder.customer_purchase_order && (
                  <div className="mt-4">
                    <p className="font-medium">Customer PO</p>
                    <p>{salesOrder.customer_purchase_order}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Status</span>
                  <span>{getStatusBadge(salesOrder.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Currency</span>
                  <span>
                    {salesOrder.currency} 
                    {` (${getSymbolForCurrency(salesOrder.currency)})`}
                  </span>
                </div>
                {salesOrder.customer_contact_name && (
                  <div className="flex justify-between">
                    <span>Customer Contact</span>
                    <span>{salesOrder.customer_contact_name}</span>
                  </div>
                )}
                {salesOrder.sales_person && (
                  <div className="flex justify-between">
                    <span>Sales Person</span>
                    <span>{salesOrder.sales_person}</span>
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <p className="font-medium">Created By User Details</p>
                
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://www.gravatar.com/avatar/${salesOrder.created_by_user?.email}?d=mp`} />
                    <AvatarFallback className="text-xs">{getInitials(getCreatorName())}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <User className="h-3 w-3 text-muted-foreground mr-1" />
                      <span>{getCreatorName()}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{format(new Date(salesOrder.created_at), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {salesOrder.payment_terms && (
                  <div className="flex justify-between">
                    <span>Payment Terms</span>
                    <span>{salesOrder.payment_terms}</span>
                  </div>
                )}
                {salesOrder.delivery_date && (
                  <div className="flex justify-between">
                    <span>Delivery Date</span>
                    <span>{format(new Date(salesOrder.delivery_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {salesOrder.fob_date && (
                  <div className="flex justify-between">
                    <span>FOB Date</span>
                    <span>{format(new Date(salesOrder.fob_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {salesOrder.departing_port && (
                  <div className="flex justify-between">
                    <span>Departing Port</span>
                    <span>{salesOrder.departing_port}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="p-2">Product</th>
                      <th className="p-2">Quantity</th>
                      <th className="p-2">Unit Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesOrder.line_items?.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="p-2">
                          <div className="flex items-center space-x-3">
                            {item.product?.cover_image_url && (
                              <div className="flex-shrink-0 h-12 w-10 overflow-hidden rounded border">
                                <img 
                                  src={item.product.cover_image_url} 
                                  alt={item.product?.title || 'Product cover'}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                                  }}
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{item.product?.title}</div>
                              {item.format && <div className="text-sm text-gray-500">{item.format.format_name}</div>}
                              {item.product?.isbn13 && <div className="text-xs text-gray-500">ISBN: {item.product.isbn13}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">{formatCurrency(item.unit_price)}</td>
                        <td className="p-2 text-right">{formatCurrency(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold">
                      <td colSpan={3} className="p-2 text-right">Subtotal:</td>
                      <td className="p-2 text-right">{formatCurrency(salesOrder.total_amount || 0)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="p-2 text-right">Tax ({salesOrder.tax_rate}%):</td>
                      <td className="p-2 text-right">{formatCurrency(salesOrder.tax_amount || 0)}</td>
                    </tr>
                    {salesOrder.charges?.map((charge) => (
                      <tr key={charge.id}>
                        <td colSpan={3} className="p-2 text-right">{charge.description}:</td>
                        <td className="p-2 text-right">{formatCurrency(charge.amount)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td colSpan={3} className="p-2 text-right">Total:</td>
                      <td className="p-2 text-right">{formatCurrency(salesOrder.grand_total || 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(salesOrder.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({salesOrder.tax_rate}%)</span>
                <span>{formatCurrency(salesOrder.tax_amount || 0)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(salesOrder.grand_total || 0)}</span>
              </div>
            </CardContent>
          </Card>

          {salesOrder.notes && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{salesOrder.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="requirements">
          {salesOrder.customer_id && (
            <SalesOrderRequirementsSection 
              salesOrderId={salesOrder.id} 
              customerId={salesOrder.customer_id} 
              readOnly={!isEditable}
            />
          )}
        </TabsContent>

        <TabsContent value="delivery">
          <DeliveryLocationTab 
            deliveryLocation={salesOrder.delivery_location} 
            isLoading={isLoading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesOrderDetail;

