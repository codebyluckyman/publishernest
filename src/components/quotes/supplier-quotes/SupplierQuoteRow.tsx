
import { format } from "date-fns";
import { SupplierQuote } from "@/types/supplierQuote";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "../table/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/formatters";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SupplierQuoteRowProps = {
  quote: SupplierQuote;
  onViewDetails: (quote: SupplierQuote) => void;
  onSelectQuote?: (quote: SupplierQuote) => void;
  isSelected?: boolean;
  onSelectRow?: (id: string, selected: boolean) => void;
};

export const SupplierQuoteRow = ({
  quote,
  onViewDetails,
  onSelectQuote,
  isSelected,
  onSelectRow
}: SupplierQuoteRowProps) => {
  const isExpired = quote.valid_to ? new Date(quote.valid_to) < new Date() : false;
  const isDraft = quote.status === 'draft';
  const canBeSelected = quote.status === 'submitted' && !isExpired;

  // Status icon based on quote status
  const getStatusIcon = () => {
    if (isExpired) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <XCircle size={16} className="text-red-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Expired quote</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (isDraft) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle size={16} className="text-amber-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Draft quote - not submitted</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <CheckCircle2 size={16} className="text-green-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Valid quote</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  return (
    <TableRow 
      key={quote.id}
      className={cn(
        "hover:bg-gray-50 cursor-pointer",
        (isExpired || isDraft) && "opacity-80"
      )}
      onClick={() => onViewDetails(quote)}
    >
      {onSelectRow && (
        <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
          <Checkbox 
            checked={isSelected}
            onCheckedChange={(checked) => onSelectRow(quote.id, !!checked)}
            disabled={!canBeSelected}
            className="mr-2"
          />
        </TableCell>
      )}
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div className="flex flex-col">
            <span>{quote.supplier?.supplier_name || "Unknown Supplier"}</span>
            <span className="text-xs text-muted-foreground font-mono">
              {quote.reference || quote.reference_id || "No reference"}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={quote.status} />
      </TableCell>
      <TableCell>
        <span className={cn(isExpired && "line-through text-gray-500")}>
          {quote.total_cost 
            ? formatCurrency(quote.total_cost, quote.currency || 'USD') 
            : "Not specified"}
        </span>
      </TableCell>
      <TableCell>
        <span className={cn(isExpired && "text-gray-500")}>
          {quote.valid_to 
            ? format(new Date(quote.valid_to), "MMM d, yyyy") 
            : "Not specified"}
        </span>
      </TableCell>
      <TableCell>
        {quote.submitted_at 
          ? format(new Date(quote.submitted_at), "MMM d, yyyy") 
          : "Not submitted"}
      </TableCell>
      {onSelectQuote && (
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-end space-x-2">
            <button
              className={cn(
                "px-3 py-1 rounded text-sm font-medium",
                canBeSelected 
                  ? "bg-primary text-white hover:bg-primary/90" 
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (canBeSelected && onSelectQuote) {
                  onSelectQuote(quote);
                }
              }}
              disabled={!canBeSelected}
            >
              {quote.status === 'submitted' ? "Select" : "View"}
            </button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};
