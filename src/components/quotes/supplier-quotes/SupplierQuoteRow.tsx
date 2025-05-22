
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Check } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/utils/date';
import { Badge } from '@/components/ui/badge';
import { SupplierQuote } from '@/types/supplierQuote';

export interface SupplierQuoteRowProps {
  quote: SupplierQuote;
  onDetailClick: () => void;
  onApprove?: () => void;
}

export function SupplierQuoteRow({ 
  quote, 
  onDetailClick,
  onApprove
}: SupplierQuoteRowProps) {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };
  
  const statusColor = statusColors[quote.status] || 'bg-gray-200 text-gray-800';
  
  return (
    <TableRow>
      <TableCell>{quote.reference_id || '-'}</TableCell>
      <TableCell>
        {quote.supplier?.supplier_name || quote.supplier_name || '-'}
      </TableCell>
      <TableCell>
        {quote.print_run?.title || quote.title || '-'}
      </TableCell>
      <TableCell>
        <Badge className={`${statusColor} hover:${statusColor}`} variant="outline">
          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>{formatDate(quote.created_at)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {quote.status === 'submitted' && onApprove && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onApprove}
              title="Approve Quote"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onDetailClick}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDetailClick}>View Details</DropdownMenuItem>
              {quote.status === 'submitted' && onApprove && (
                <DropdownMenuItem onClick={onApprove}>Approve</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
