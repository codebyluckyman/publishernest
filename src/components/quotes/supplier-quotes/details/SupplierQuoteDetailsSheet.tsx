
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormatDetailsPanel } from "./FormatDetailsPanel";
import { SupplierQuoteDetails } from "./SupplierQuoteDetails";
import { SupplierQuote } from "@/types/supplierQuote";

interface SupplierQuoteDetailsSheetProps {
  quote: SupplierQuote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (quote: SupplierQuote) => void;
}

export function SupplierQuoteDetailsSheet({ 
  quote, 
  open, 
  onOpenChange,
  onApprove
}: SupplierQuoteDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  
  // Reset the active tab when opening the sheet
  useEffect(() => {
    if (open) {
      setActiveTab("details");
      // Select the first format by default if available
      if (quote?.formats?.length > 0 && quote.formats[0]?.id) {
        setSelectedFormatId(quote.formats[0].id);
      } else {
        setSelectedFormatId(null);
      }
    }
  }, [open, quote]);

  if (!quote) return null;
  
  const canApprove = quote.status === 'submitted' && onApprove;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-auto">
        <SheetHeader>
          <SheetTitle>Quote Details</SheetTitle>
          <SheetDescription>
            From <span className="font-semibold">{quote.supplier?.name}</span> for <span className="font-semibold">{quote.print_run?.title}</span>
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="details">Quote Details</TabsTrigger>
              <TabsTrigger value="formats" disabled={!quote.formats || quote.formats.length === 0}>
                {quote.formats && quote.formats.length > 0 ? `Formats (${quote.formats.length})` : "No Formats"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <SupplierQuoteDetails quote={quote} />
            </TabsContent>
            
            <TabsContent value="formats" className="space-y-4">
              {quote.formats && quote.formats.length > 0 && (
                <FormatDetailsPanel 
                  formats={quote.formats} 
                  selectedFormatId={selectedFormatId}
                  onFormatSelect={setSelectedFormatId}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <SheetFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            {canApprove && (
              <Button 
                onClick={() => onApprove(quote)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve Quote
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
