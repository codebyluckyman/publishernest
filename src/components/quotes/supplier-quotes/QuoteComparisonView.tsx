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
import { CheckCircle2, ChevronDown, ChevronRight, XCircle, Filter } from "lucide-react";
import { SupplierQuote } from "@/types/supplierQuote";
import { formatDate, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SupplierQuoteDetails } from "./SupplierQuoteDetails";
import { formatCurrency } from "@/utils/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceBreakComparisonTable } from "./price-break/PriceBreakComparisonTable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "../table/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SupplierQuoteDetailsSheet } from "./details/SupplierQuoteDetailsSheet";

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
  const [comparisonView, setComparisonView] = useState<'summary' | 'priceBreaks' | 'products'>('summary');
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [quoteForDetailsSheet, setQuoteForDetailsSheet] = useState<SupplierQuote | null>(null);
  
  const [includeExpiredQuotes, setIncludeExpiredQuotes] = useState(true);
  const [includeDraftQuotes, setIncludeDraftQuotes] = useState(false);
  
  const handleViewDetails = (quote: SupplierQuote) => {
    setQuoteForDetailsSheet(quote);
    setDetailsSheetOpen(true);
  };
  
  const handleApproveQuote = (quote: SupplierQuote) => {
    if (onSelectQuote) {
      onSelectQuote(quote);
      setDetailsSheetOpen(false);
    }
  };

  const expiredQuoteCount = useMemo(() => {
    return quotes.filter(quote => 
      quote.valid_to && new Date(quote.valid_to) < new Date()
    ).length;
  }, [quotes]);
  
  const draftQuoteCount = useMemo(() => {
    return quotes.filter(quote => quote.status === 'draft').length;
  }, [quotes]);
  
  const formatGroups = useMemo(() => {
    const groups: Record<string, { 
      formatName: string, 
      formatId: string, 
      quoteRequestFormatId: string,
      quotes: SupplierQuote[] 
    }> = {};
    
    quotes.forEach(quote => {
      if (quote.formats && quote.formats.length > 0) {
        quote.formats.forEach(format => {
          const formatId = format.format_id;
          const quoteRequestFormatId = format.quote_request_format_id || formatId;
          
          if (!groups[formatId]) {
            groups[formatId] = {
              formatName: format.format_name,
              formatId: format.format_id,
              quoteRequestFormatId: quoteRequestFormatId,
              quotes: []
            };
          }
          
          if (!groups[formatId].quotes.some(q => q.id === quote.id)) {
            groups[formatId].quotes.push(quote);
          }
        });
      } else {
        const unknownKey = "unknown";
        if (!groups[unknownKey]) {
          groups[unknownKey] = {
            formatName: "Unknown Format",
            formatId: unknownKey,
            quoteRequestFormatId: unknownKey,
            quotes: []
          };
        }
        
        if (!groups[unknownKey].quotes.some(q => q.id === quote.id)) {
          groups[unknownKey].quotes.push(quote);
        }
      }
    });
    
    return groups;
  }, [quotes]);

  const getBestQuote = (quotes: SupplierQuote[]): SupplierQuote | null => {
    if (!quotes.length) return null;
    
    const validQuotes = quotes.filter(q => 
      q.status === 'submitted' && 
      (!q.valid_to || new Date(q.valid_to) >= new Date())
    );
    
    if (!validQuotes.length) return null;
    
    return validQuotes.reduce((best, current) => {
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
    isExpired: boolean;
    isDraft: boolean;
    subRows?: any[];
  };
  
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
      cell: ({ row }) => {
        const isExpired = row.original.isExpired;
        const isDraft = row.original.isDraft;
        
        return (
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleViewDetails(row.original.quote)}
          >
            <div className={cn(
              "font-medium",
              (isExpired || isDraft) && "text-gray-500"
            )}>
              {row.getValue("supplier")}
            </div>
            
            {isExpired && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <XCircle size={16} className="text-red-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Expired quote
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {isDraft && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                Draft
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "totalCost",
      header: "Total Cost",
      cell: ({ row }) => {
        const value = row.getValue("totalCost") as number | null;
        const currency = row.original.currency || "USD";
        
        if (value === null) return "Not provided";
        
        const formattedValue = formatCurrency(value, currency);
        
        const isExpired = row.original.isExpired;
        const isDraft = row.original.isDraft;
        const isBest = getBestQuote(quotes)?.id === row.original.quoteId;
        
        return (
          <div className="flex items-center">
            <span className={cn(
              (isExpired || isDraft) && "text-gray-400",
              isExpired && "line-through"
            )}>
              {formattedValue}
            </span>
            {isBest && !isExpired && !isDraft && (
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
        return status ? <StatusBadge status={status} /> : <span>Unknown</span>;
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
            onClick={() => handleViewDetails(row.original.quote)}
          >
            View Details
          </Button>
          {onSelectQuote && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onSelectQuote(row.original.quote)}
              className={cn(
                row.original.status !== "submitted" && "opacity-50 cursor-not-allowed"
              )}
              disabled={row.original.status !== "submitted"}
            >
              Select Quote
            </Button>
          )}
        </div>
      ),
    },
  ];

  const getFilteredQuotes = (quotes: SupplierQuote[]) => {
    return quotes.filter(quote => {
      if (!includeExpiredQuotes) {
        const isExpired = quote.valid_to ? new Date(quote.valid_to) < new Date() : false;
        if (isExpired) return false;
      }
      
      if (!includeDraftQuotes && quote.status === 'draft') {
        return false;
      }
      
      return true;
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{quoteRequestTitle ? `Quote Comparison: ${quoteRequestTitle}` : "Quote Comparison"}</CardTitle>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="include-expired" 
                checked={includeExpiredQuotes} 
                onCheckedChange={setIncludeExpiredQuotes}
              />
              <Label htmlFor="include-expired" className="flex items-center gap-1">
                Include expired quotes
                {expiredQuoteCount > 0 && (
                  <Badge variant="outline" className="text-xs ml-1 bg-gray-50">
                    {expiredQuoteCount}
                  </Badge>
                )}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="include-draft" 
                checked={includeDraftQuotes} 
                onCheckedChange={setIncludeDraftQuotes}
              />
              <Label htmlFor="include-draft" className="flex items-center gap-1">
                Include draft quotes
                {draftQuoteCount > 0 && (
                  <Badge variant="outline" className="text-xs ml-1 bg-gray-50">
                    {draftQuoteCount}
                  </Badge>
                )}
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {Object.entries(formatGroups).map(([formatId, group]) => {
          const filteredQuotes = getFilteredQuotes(group.quotes);
          
          if (filteredQuotes.length === 0) {
            return null;
          }
          
          return (
            <div key={formatId} className="mb-8">
              <h3 className="text-lg font-semibold mb-4">{group.formatName}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {filteredQuotes.length}
                    </div>
                    <p className="text-muted-foreground">Total Quotes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="text-2xl font-bold">
                        {filteredQuotes.filter(q => q.status === "submitted" && (!q.valid_to || new Date(q.valid_to) >= new Date())).length}
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
                        {filteredQuotes.filter(q => q.status === "draft" || (q.valid_to && new Date(q.valid_to) < new Date())).length}
                      </div>
                      <XCircle className="ml-2 h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="text-muted-foreground">Drafts or Expired</p>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="summary" className="mb-4">
                <TabsList>
                  <TabsTrigger value="summary" onClick={() => setComparisonView('summary')}>
                    Summary View
                  </TabsTrigger>
                  <TabsTrigger value="priceBreaks" onClick={() => setComparisonView('priceBreaks')}>
                    Price Break Comparison
                  </TabsTrigger>
                  <TabsTrigger value="products" onClick={() => setComparisonView('products')}>
                    Product Comparison
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="mt-4">
                  <div className="rounded-md border">
                    <ComparisonTable 
                      quotes={filteredQuotes} 
                      columns={columns} 
                      expanded={expanded}
                      setExpanded={setExpanded}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="priceBreaks" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Price Break Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PriceBreakComparisonTable 
                        quotes={group.quotes}
                        formatId={group.quoteRequestFormatId !== "unknown" ? group.quoteRequestFormatId : undefined}
                        includeExpiredQuotes={includeExpiredQuotes}
                        includeDraftQuotes={includeDraftQuotes}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="products" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Product Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProductComparisonView 
                        quotes={filteredQuotes} 
                        includeExpiredQuotes={includeExpiredQuotes}
                        includeDraftQuotes={includeDraftQuotes}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          );
        })}
        
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
        
        <SupplierQuoteDetailsSheet
          quote={quoteForDetailsSheet}
          open={detailsSheetOpen}
          onOpenChange={setDetailsSheetOpen}
          onApprove={onSelectQuote ? handleApproveQuote : undefined}
        />
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
      const isExpired = quote.valid_to ? new Date(quote.valid_to) < new Date() : false;
      const isDraft = quote.status === 'draft';
      
      const baseRow = {
        supplier: quote.supplier?.supplier_name || "Unknown Supplier",
        supplierId: quote.supplier_id,
        totalCost: quote.total_cost,
        currency: quote.currency || "USD",
        status: quote.status,
        deliveryTime: "Not specified",
        quoteId: quote.id,
        validUntil: quote.valid_to ? formatDate(quote.valid_to) : undefined,
        submittedAt: quote.submitted_at ? formatDate(quote.submitted_at) : undefined,
        quote: quote,
        isExpired,
        isDraft
      };
      
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

function ProductComparisonView({ 
  quotes, 
  includeExpiredQuotes = true, 
  includeDraftQuotes = false 
}: { 
  quotes: SupplierQuote[],
  includeExpiredQuotes?: boolean,
  includeDraftQuotes?: boolean 
}) {
  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      if (!includeExpiredQuotes) {
        const isExpired = quote.valid_to ? new Date(quote.valid_to) < new Date() : false;
        if (isExpired) return false;
      }
      
      if (!includeDraftQuotes && quote.status === 'draft') {
        return false;
      }
      
      return true;
    });
  }, [quotes, includeExpiredQuotes, includeDraftQuotes]);
  
  const productIds = useMemo(() => {
    const ids = new Set<string>();
    
    filteredQuotes.forEach(quote => {
      if (quote.formats) {
        quote.formats.forEach(format => {
          const formatProductIds = quote.quote_request?.formats
            ?.find(f => f.id === format.quote_request_format_id)
            ?.products?.map(p => p.product_id) || [];
            
          formatProductIds.forEach(id => {
            if (id) ids.add(id);
          });
        });
      }
    });
    
    return Array.from(ids);
  }, [filteredQuotes]);
  
  if (!productIds.length) {
    return <div className="text-center py-6">No product information available for comparison.</div>;
  }
  
  const isQuoteValid = (quote: SupplierQuote) => {
    if (quote.status === 'draft') return false;
    return !quote.valid_to || new Date(quote.valid_to) >= new Date();
  };
  
  return (
    <div className="space-y-6">
      {productIds.map((productId, index) => (
        <Card key={productId} className="overflow-hidden">
          <CardHeader className="bg-muted/20 py-3">
            <CardTitle className="text-sm">Product {index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map(quote => {
                  const isValid = isQuoteValid(quote);
                  const isDraft = quote.status === 'draft';
                  
                  const productPriceBreaks = quote.price_breaks?.filter(pb => {
                    const pbProductKey = `unit_cost_${productId}`;
                    return pb[pbProductKey] !== undefined;
                  }) || [];
                  
                  if (!productPriceBreaks.length) return null;
                  
                  return productPriceBreaks.map((pb, pbIndex) => {
                    const unitCostKey = `unit_cost_${productId}`;
                    const unitCost = pb[unitCostKey];
                    const total = pb.quantity * (unitCost || 0);
                    
                    const isBestPrice = filteredQuotes
                      .filter(isQuoteValid)
                      .every(q => {
                        const matchingPb = q.price_breaks?.find(otherPb => 
                          otherPb.quantity === pb.quantity
                        );
                        
                        if (!matchingPb) return true;
                        const otherCost = matchingPb[unitCostKey];
                        if (!otherCost) return true;
                        
                        return unitCost <= otherCost;
                      });
                    
                    return (
                      <TableRow key={`${quote.id}-${pbIndex}`}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className={(!isValid || isDraft) ? "text-gray-400" : ""}>
                              {quote.supplier?.supplier_name || "Unknown"}
                            </span>
                            
                            {!isValid && !isDraft && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                      <span className={cn(
                                        (!isValid || isDraft) && "text-gray-400",
                                        !isValid && "line-through"
                                      )}>
                                        {formatCurrency(unitCost, quote.currency || "USD")}
                                      </span>
                                      {isBestPrice && isValid && !isDraft && (
                                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                                          Best
                                        </Badge>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {!isValid ? "Expired quote" : isDraft ? "Draft quote" : "Best price for this quantity"}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            {isDraft && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                                      Draft
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Draft quote - not submitted
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{pb.quantity.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {unitCost ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                      <span className={cn(
                                        (!isValid || isDraft) && "text-gray-400",
                                        !isValid && "line-through"
                                      )}>
                                        {formatCurrency(unitCost, quote.currency || "USD")}
                                      </span>
                                      {isBestPrice && isValid && !isDraft && (
                                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                                          Best
                                        </Badge>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {!isValid ? "Expired quote" : isDraft ? "Draft quote" : "Best price for this quantity"}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              "Not provided"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            (!isValid || isDraft) && "text-gray-400",
                            !isValid && "line-through"
                          )}>
                            {unitCost ? formatCurrency(total, quote.currency || "USD") : "N/A"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  });
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
