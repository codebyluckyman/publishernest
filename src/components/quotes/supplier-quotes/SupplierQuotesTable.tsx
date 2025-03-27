
import { useState } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { SupplierQuote } from "@/types/supplierQuote";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SupplierQuotesEmptyState } from "./SupplierQuotesEmptyState";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { SupplierQuoteDetails } from "./SupplierQuoteDetails";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleDollarSign, Eye, FileCheck, FileX, BookOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePagination, PageSize } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface SupplierQuotesTableProps {
  statusFilter?: string[] | undefined;
  searchQuery?: string;
  quoteRequestId?: string | null;
}

export function SupplierQuotesTable({ statusFilter, searchQuery, quoteRequestId }: SupplierQuotesTableProps) {
  const { currentOrganization } = useOrganization();
  const { useSupplierQuotesList } = useSupplierQuotes();
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: supplierQuotes = [], isLoading } = useSupplierQuotesList(
    currentOrganization,
    statusFilter ? statusFilter.join(',') : undefined,
    undefined,
    quoteRequestId || undefined,
    searchQuery
  );

  const {
    currentData: paginatedQuotes,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
  } = usePagination<SupplierQuote>({
    data: supplierQuotes,
    initialPageSize: 10,
  });

  const handleViewDetails = (quote: SupplierQuote) => {
    setSelectedQuote(quote);
    setDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-red-500">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-1/6" />
          </div>
        ))}
      </div>
    );
  }

  if (supplierQuotes.length === 0) {
    return <SupplierQuotesEmptyState statusFilter={statusFilter} />;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Quote Request</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuotes.map((quote) => (
              <TableRow key={quote.id} className="hover:bg-muted/50 cursor-pointer">
                <TableCell 
                  className="font-mono text-sm"
                  onClick={() => handleViewDetails(quote)}
                >
                  {quote.reference_id || "—"}
                </TableCell>
                <TableCell 
                  className="font-medium"
                  onClick={() => handleViewDetails(quote)}
                >
                  {quote.quote_request?.title || "Untitled Quote Request"}
                </TableCell>
                <TableCell onClick={() => handleViewDetails(quote)}>
                  {quote.supplier?.supplier_name || "Unknown Supplier"}
                </TableCell>
                <TableCell onClick={() => handleViewDetails(quote)}>
                  {quote.formats && quote.formats.length > 0 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{quote.formats.length} format{quote.formats.length !== 1 ? 's' : ''}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <ul className="text-xs">
                            {quote.formats.map((format, index) => (
                              <li key={index}>{format.format_name}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell onClick={() => handleViewDetails(quote)}>
                  {getStatusBadge(quote.status)}
                </TableCell>
                <TableCell onClick={() => handleViewDetails(quote)}>
                  {quote.submitted_at 
                    ? format(new Date(quote.submitted_at), "MMM d, yyyy") 
                    : "Not submitted"}
                </TableCell>
                <TableCell className="text-right" onClick={() => handleViewDetails(quote)}>
                  {quote.total_cost 
                    ? `${quote.currency} ${quote.total_cost.toLocaleString()}` 
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleViewDetails(quote)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {quote.status === 'submitted' && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Accept Quote"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(quote);
                          }}
                        >
                          <FileCheck className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Decline Quote"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(quote);
                          }}
                        >
                          <FileX className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={goToPage}
        onPreviousPage={previousPage}
        onNextPage={nextPage}
        onPageSizeChange={changePageSize}
      />

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-hidden">
          <SheetHeader>
            <SheetTitle>Supplier Quote Details</SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-5rem)] pr-4">
            {selectedQuote && (
              <SupplierQuoteDetails
                supplierQuote={selectedQuote}
                onClose={() => setDetailsOpen(false)}
              />
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
