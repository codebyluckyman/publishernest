
import { useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SupplierQuote } from "@/types/supplierQuote";
import { SupplierQuoteAudit } from "@/api/supplierQuotes/supplierQuoteAudit";

export interface SupplierQuoteAuditHistoryProps {
  supplierQuote?: SupplierQuote | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  supplierQuoteId?: string;
}

export function SupplierQuoteAuditHistory({
  supplierQuote,
  supplierQuoteId,
  isOpen,
  onOpenChange,
}: SupplierQuoteAuditHistoryProps) {
  const { user } = useAuth();
  const { useSupplierQuoteAudit } = useSupplierQuotes();
  const quoteId = supplierQuote?.id || supplierQuoteId || null;
  const { data: auditEntries = [], isLoading } = useSupplierQuoteAudit(quoteId);

  // Helper function to format audit data
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return { label: 'Created', color: 'bg-green-500' };
      case 'update':
        return { label: 'Updated', color: 'bg-blue-500' };
      case 'submit':
        return { label: 'Submitted', color: 'bg-purple-500' };
      case 'accept':
        return { label: 'Accepted', color: 'bg-emerald-500' };
      case 'decline':
        return { label: 'Declined', color: 'bg-red-500' };
      default:
        return { label: 'Modified', color: 'bg-gray-500' };
    }
  };

  // Format the changes for display
  const formatChanges = (changes: any) => {
    if (!changes) return 'No changes recorded';
    
    // Handle different possible formats of changes
    if (typeof changes !== 'object') {
      return JSON.stringify(changes);
    }
    
    // Try to display in a structured way if it matches our expected format
    const changeEntries = Object.entries(changes);
    if (changeEntries.length === 0) return 'No changes recorded';
    
    return changeEntries.map(([key, value]: [string, any]) => {
      // Handle both our structured format and simpler formats
      const previous = value?.previous !== undefined ? value.previous : 'N/A';
      const newValue = value?.new !== undefined ? value.new : value;
      
      return (
        <div key={key} className="mb-2 border-b pb-2">
          <div className="font-medium capitalize">{key.replace('_', ' ')}</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-gray-500">Previous:</span>
              <div className="text-sm">{previous !== undefined ? JSON.stringify(previous) : '(empty)'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">New:</span>
              <div className="text-sm">{newValue !== undefined ? JSON.stringify(newValue) : '(empty)'}</div>
            </div>
          </div>
        </div>
      );
    });
  };

  const handleBackClick = () => {
    if (onOpenChange) onOpenChange(false);
  };

  if (!supplierQuote && !supplierQuoteId) return null;

  return (
    <div className="space-y-4 py-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Audit History</h3>
        {onOpenChange && (
          <Button variant="outline" size="sm" onClick={handleBackClick}>
            Back to Details
          </Button>
        )}
      </div>
      
      <div className="overflow-auto max-h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            <span className="ml-2">Loading audit history...</span>
          </div>
        ) : auditEntries.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No audit records found for this supplier quote.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditEntries.map((entry: SupplierQuoteAudit) => {
                const { label, color } = getActionLabel(entry.action);
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.created_at), 'PPP p')}
                    </TableCell>
                    <TableCell>
                      <Badge className={color}>{label}</Badge>
                    </TableCell>
                    <TableCell>
                      {entry.changed_by_user?.email || 'Unknown user'}
                    </TableCell>
                    <TableCell>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="changes">
                          <AccordionTrigger>View Changes</AccordionTrigger>
                          <AccordionContent>
                            <div className="bg-gray-50 p-3 rounded text-sm">
                              {formatChanges(entry.changes)}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
