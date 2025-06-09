
import React from 'react';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, FileText } from 'lucide-react';
import { 
  Table,
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SalesOrders = () => {
  const { 
    salesOrders, 
    isLoadingSalesOrders, 
    isErrorSalesOrders
  } = useSalesOrders();

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

  if (isErrorSalesOrders) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load sales orders. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales Orders</h1>
          <p className="text-muted-foreground">Manage your sales orders and track customer orders</p>
        </div>
        <Button asChild>
          <Link to="/create-sales-order">
            <Plus className="mr-2 h-4 w-4" /> Create Sales Order
          </Link>
        </Button>
      </div>

      {/* Sales Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SO Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingSalesOrders ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                </TableRow>
              ))
            ) : salesOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <FileText className="h-16 w-16 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium">No Sales Orders</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-4">
                      You haven't created any sales orders yet.
                    </p>
                    <Button asChild>
                      <Link to="/create-sales-order">
                        <Plus className="mr-2 h-4 w-4" /> Create Sales Order
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              salesOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link to={`/sales-orders/${order.id}`} className="hover:underline text-blue-600">
                      {order.so_number}
                    </Link>
                  </TableCell>
                  <TableCell>{order.customer?.customer_name}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    {order.issue_date ? format(new Date(order.issue_date), 'MMM d, yyyy') : 'Not issued'}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.grand_total ? 
                      new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: order.currency 
                      }).format(order.grand_total) : 
                      '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SalesOrders;
