
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PurchaseOrderStatusBadge } from './PurchaseOrderStatusBadge';
import { PurchaseOrder } from '@/types/purchaseOrder';
import { format } from 'date-fns';
import { FileText, Eye } from 'lucide-react';

interface PurchaseOrdersTableProps {
  purchaseOrders: PurchaseOrder[];
  isLoading?: boolean;
}

export function PurchaseOrdersTable({ purchaseOrders, isLoading = false }: PurchaseOrdersTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO Number</TableHead>
            <TableHead>Print Run</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell className="animate-pulse bg-gray-200 h-8 rounded"></TableCell>
              <TableCell className="animate-pulse bg-gray-200 h-8 rounded"></TableCell>
              <TableCell className="animate-pulse bg-gray-200 h-8 rounded"></TableCell>
              <TableCell className="animate-pulse bg-gray-200 h-8 rounded"></TableCell>
              <TableCell className="animate-pulse bg-gray-200 h-8 rounded"></TableCell>
              <TableCell className="animate-pulse bg-gray-200 h-8 rounded"></TableCell>
              <TableCell className="animate-pulse bg-gray-200 h-8 rounded"></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (!purchaseOrders.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-md">
        <FileText className="h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium">No purchase orders found</h3>
        <p className="text-gray-500 mb-4">
          There are no purchase orders to display.
        </p>
        <Button onClick={() => navigate('/purchase-orders/new')}>
          Create a Purchase Order
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>PO Number</TableHead>
          <TableHead>Print Run</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Issue Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchaseOrders.map((po) => (
          <TableRow key={po.id}>
            <TableCell>{po.po_number}</TableCell>
            <TableCell>{po.print_run?.title || '—'}</TableCell>
            <TableCell>{po.supplier?.supplier_name || '—'}</TableCell>
            <TableCell>
              {po.issue_date 
                ? format(new Date(po.issue_date), 'MMM d, yyyy') 
                : '—'}
            </TableCell>
            <TableCell>
              <PurchaseOrderStatusBadge status={po.status} />
            </TableCell>
            <TableCell>
              {po.total_amount 
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: po.currency || 'USD'
                  }).format(po.total_amount)
                : '—'}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/purchase-orders/${po.id}`)}
                title="View Purchase Order"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
