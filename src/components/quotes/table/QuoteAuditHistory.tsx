
import { useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
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
import { QuoteRequest, QuoteRequestAudit } from "@/types/quoteRequest";

export interface QuoteAuditHistoryProps {
  quoteRequest: QuoteRequest | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuoteAuditHistory({
  quoteRequest,
  isOpen,
  onOpenChange,
}: QuoteAuditHistoryProps) {
  const { user } = useAuth();
  const { useQuoteRequestAudit } = useQuoteRequests();
  const { data: auditEntries = [], isLoading } = useQuoteRequestAudit(quoteRequest?.id || null);

  // Helper function to format audit data
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return { label: 'Created', color: 'bg-green-500' };
      case 'update':
        return { label: 'Updated', color: 'bg-blue-500' };
      case 'status_change':
        return { label: 'Status Changed', color: 'bg-yellow-500' };
      case 'delete':
        return { label: 'Deleted', color: 'bg-red-500' };
      default:
        return { label: 'Modified', color: 'bg-gray-500' };
    }
  };

  // Format the changes for display
  const formatChanges = (changes: any) => {
    if (!changes) return 'No changes recorded';
    
    return Object.entries(changes).map(([key, value]: [string, any]) => {
      const { previous, new: newValue } = value;
      
      // Format the values for display
      let previousFormatted = previous;
      let newFormatted = newValue;
      
      // Special handling for arrays (like supplier_ids)
      if (Array.isArray(previous)) {
        previousFormatted = previous.join(', ');
      }
      if (Array.isArray(newValue)) {
        newFormatted = newValue.join(', ');
      }
      
      // Format dates
      if (key === 'due_date' && previous) {
        previousFormatted = previous;
      }
      if (key === 'due_date' && newValue) {
        newFormatted = newValue;
      }
      
      return (
        <div key={key} className="mb-2 border-b pb-2">
          <div className="font-medium capitalize">{key.replace('_', ' ')}</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-gray-500">Previous:</span>
              <div className="text-sm">{previousFormatted || '(empty)'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">New:</span>
              <div className="text-sm">{newFormatted || '(empty)'}</div>
            </div>
          </div>
        </div>
      );
    });
  };

  const handleBackClick = () => {
    onOpenChange(false);
  };

  if (!quoteRequest) return null;

  return (
    <div className="space-y-4 py-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Audit History - {quoteRequest.title}</h3>
        <Button variant="outline" size="sm" onClick={handleBackClick}>
          Back to Details
        </Button>
      </div>
      
      <div className="overflow-auto max-h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            <span className="ml-2">Loading audit history...</span>
          </div>
        ) : auditEntries.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No audit records found for this quote request.
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
              {auditEntries.map((entry: any) => {
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
