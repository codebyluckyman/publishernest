
import { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ExpandedState,
  getExpandedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronDown, ChevronRight, XCircle } from "lucide-react";
import { SupplierQuote } from "@/types/supplierQuote";
import { formatDate, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SupplierQuoteDetails } from "./SupplierQuoteDetails";
import { formatCurrency } from "@/utils/formatters";

interface QuoteComparisonViewProps {
  quotes: SupplierQuote[];
  quoteRequestTitle?: string;
  onSelectQuote?: (quote: SupplierQuote) => void;
}

export function QuoteComparisonView({
  quotes,
  quoteRequestTitle,
  onSelectQuote
}: QuoteComparisonViewProps) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  
  // Group quotes by format to compare prices for the same format
  const formatGroups = useMemo(() => {
    const groups: Record<string, { formatName: string, quotes: SupplierQuote[] }> = {};
    
    quotes.forEach(quote => {
      if (quote.formats && quote.formats.length > 0) {
        quote.formats.forEach(format => {
          const formatId = format.format_id;
          if (!groups[formatId]) {
            groups[formatId] = {
              formatName: format.format_name,
              quotes: []
            };
          }
          groups[formatId].quotes.push(quote);
        });
      } else {
        // If no format, put in "Unknown" group
        const unknownKey = "unknown";
        if (!groups[unknownKey]) {
          groups[unknownKey] = {
            formatName: "Unknown Format",
            quotes: []
          };
        }
        groups[unknownKey].quotes.push(quote);
      }
    });
    
    return groups;
  }, [quotes]);

  // Find the quote with the lowest total cost
  const getBestQuote = (quotes: SupplierQuote[]): SupplierQuote | null => {
    if (!quotes.length) return null;
    
    return quotes.reduce((best, current) => {
      if (!best.total_cost) return current;
      if (!current.total_cost) return best;
      return best.total_cost < current.total_cost ? best : current;
    });
  };
  
  type SupplierComparisonRow = {
    supplier: string;
    supplierId: string;
    totalCost: number | null;
    currency: string;
    status: string;
    deliveryTime?: string;
    quoteId: string;
    validUntil?: string;
    submittedAt?: string;
    quote: SupplierQuote;
    subRows?: any[];
  };
  
  // Define the columns for the comparison table
  const columns: ColumnDef<SupplierComparisonRow>[] = [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <Button
            variant="ghost"
            onClick={() => row.toggleExpanded()}
            size="icon"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : null;
      },
      size: 30,
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      cell: ({ row }) => <div className="font-medium">{row.getValue("supplier")}</div>,
    },
    {
      accessorKey: "totalCost",
      header: "Total Cost",
      cell: ({ row }) => {
        const value = row.getValue("totalCost") as number | null;
        const currency = row.original.currency || "USD"; // Ensure we always have a default currency
        
        if (value === null) return "Not provided";
        
        const formattedValue = formatCurrency(value, currency);
        
        const isBest = getBestQuote(quotes)?.id === row.original.quoteId;
        
        return (
          <div className="flex items-center">
            <span>{formattedValue}</span>
            {isBest && (
              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                Best Price
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const getStatusColor = () => {
          switch (status.toLowerCase()) {
            case "draft": return "bg-gray-100 text-gray-800";
            case "submitted": return "bg-blue-100 text-blue-800";
            case "approved": return "bg-green-100 text-green-800";
            case "rejected": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
          }
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "validUntil",
      header: "Valid Until",
      cell: ({ row }) => row.getValue("validUntil") || "Not specified",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedQuote(row.original.quote)}
          >
            View Details
          </Button>
          {onSelectQuote && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onSelectQuote(row.original.quote)}
              className={cn(
                row.original.status.toLowerCase() !== "submitted" && "opacity-50 cursor-not-allowed"
              )}
              disabled={row.original.status.toLowerCase() !== "submitted"}
            >
              Select Quote
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{quoteRequestTitle ? `Quote Comparison: ${quoteRequestTitle}` : "Quote Comparison"}</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(formatGroups).map(([formatId, group]) => (
          <div key={formatId} className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{group.formatName}</h3>
            
            {/* Summary cards showing key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {group.quotes.length}
                  </div>
                  <p className="text-muted-foreground">Total Quotes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">
                      {group.quotes.filter(q => q.status === "submitted").length}
                    </div>
                    <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-muted-foreground">Ready for Review</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">
                      {group.quotes.filter(q => q.status === "draft").length}
                    </div>
                    <XCircle className="ml-2 h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-muted-foreground">Drafts (Not Ready)</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Interactive comparison table */}
            <div className="rounded-md border">
              <ComparisonTable 
                quotes={group.quotes} 
                columns={columns} 
                expanded={expanded}
                setExpanded={setExpanded}
              />
            </div>
          </div>
        ))}
        
        {/* Quote details dialog */}
        {selectedQuote && (
          <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogTitle>Quote Details</DialogTitle>
              <SupplierQuoteDetails 
                quote={selectedQuote} 
                onClose={() => setSelectedQuote(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

interface ComparisonTableProps {
  quotes: SupplierQuote[];
  columns: ColumnDef<any>[];
  expanded: ExpandedState;
  setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>;
}

function ComparisonTable({ quotes, columns, expanded, setExpanded }: ComparisonTableProps) {
  const data = useMemo(() => {
    return quotes.map(quote => {
      const baseRow = {
        supplier: quote.supplier?.supplier_name || "Unknown Supplier",
        supplierId: quote.supplier_id,
        totalCost: quote.total_cost,
        currency: quote.currency || "USD", // Ensure there's always a fallback currency
        status: quote.status,
        deliveryTime: "Not specified", // This would come from production schedule if available
        quoteId: quote.id,
        validUntil: quote.valid_to ? formatDate(quote.valid_to) : undefined,
        submittedAt: quote.submitted_at ? formatDate(quote.submitted_at) : undefined,
        quote: quote,
      };
      
      // Add subrows for price breaks if available
      const subRows = quote.price_breaks?.length ? 
        quote.price_breaks.map(pb => ({
          quantity: pb.quantity,
          unitCost: pb.unit_cost,
          totalForQuantity: pb.quantity * (pb.unit_cost || 0)
        })) : [];
      
      if (subRows.length) {
        return {
          ...baseRow,
          subRows
        };
      }
      
      return baseRow;
    });
  }, [quotes]);

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded
    },
    onExpandedChange: setExpanded,
    getSubRows: row => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : (
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No quotes available.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
