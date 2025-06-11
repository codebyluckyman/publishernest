import React, { useState, useMemo } from 'react';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { Button } from '@/components/ui/button';
import { AlertCircle, PlusCircle, FileText } from 'lucide-react';
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
import { SortableTableHeader } from '@/components/common/SortableTableHeader';
import { SalesOrderSortField, SortDirection, SortConfig } from '@/types/sorting';

const SalesOrders = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig<SalesOrderSortField>>({
    field: 'so_number',
    direction: 'asc'
  });

  const { 
    salesOrders, 
    isLoadingSalesOrders, 
    isErrorSalesOrders
  } = useSalesOrders();

  // Sort sales orders
  const sortedSalesOrders = useMemo(() => {
    if (!salesOrders.length) return [];

    return [...salesOrders].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'so_number':
          aValue = a.so_number;
          bValue = b.so_number;
          break;
        case 'customer_name':
          aValue = a.customer?.customer_name || '';
          bValue = b.customer?.customer_name || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'issue_date':
          aValue = a.issue_date ? new Date(a.issue_date) : new Date(0);
          bValue = b.issue_date ? new Date(b.issue_date) : new Date(0);
          break;
        case 'grand_total':
          aValue = a.grand_total || 0;
          bValue = b.grand_total || 0;
          break;
        default:
          return 0;
      }

      if (sortConfig.field === 'issue_date') {
        const comparison = aValue.getTime() - bValue.getTime();
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (sortConfig.field === 'grand_total') {
        const comparison = aValue - bValue;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      // String comparison
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const comparison = aValue.toString().toLowerCase().localeCompare(bValue.toString().toLowerCase());
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [salesOrders, sortConfig]);

  const handleSort = (field: SalesOrderSortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

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
      <div className="flex justify-end">
        <Button asChild>
          <Link to="/create-sales-order">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Sales Order
          </Link>
        </Button>
      </div>

      {/* Sales Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHeader
                field="so_number"
                label="SO Number"
                currentSortField={sortConfig.field}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
              <SortableTableHeader
                field="customer_name"
                label="Customer"
                currentSortField={sortConfig.field}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
              <SortableTableHeader
                field="status"
                label="Status"
                currentSortField={sortConfig.field}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
              <SortableTableHeader
                field="issue_date"
                label="Issue Date"
                currentSortField={sortConfig.field}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
              <SortableTableHeader
                field="grand_total"
                label="Total"
                currentSortField={sortConfig.field}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
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
            ) : sortedSalesOrders.length === 0 ? (
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
              sortedSalesOrders.map((order) => (
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
