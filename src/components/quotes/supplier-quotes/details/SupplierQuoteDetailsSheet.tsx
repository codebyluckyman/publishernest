
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SupplierQuote, SupplierQuoteFormat } from '@/types/supplierQuote';
import { PriceBreakSection } from './PriceBreakSection';
import { FormatDetailsPanel } from './FormatDetailsPanel';
import { MetadataSection } from './MetadataSection';

interface SupplierQuoteDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: SupplierQuote | null;
}

export function SupplierQuoteDetailsSheet({ 
  open, 
  onOpenChange, 
  quote 
}: SupplierQuoteDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState("price-breaks");
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  
  // Safely extract formats from the quote
  const formats: SupplierQuoteFormat[] = (quote?.formats || []).map(format => ({
    id: format.id || '',
    format_id: format.format_id || '',
    supplier_quote_id: format.supplier_quote_id || '',
    quote_request_format_id: format.quote_request_format_id || '',
    format_name: format.format?.format_name || '',
    dimensions: `${format.format?.tps_height_mm || 0}×${format.format?.tps_width_mm || 0}×${format.format?.tps_depth_mm || 0} mm`,
    extent: format.format?.extent || '',
    binding_type: format.format?.binding_type || '',
    format: format.format || null
  }));
  
  // Set the first format as selected by default when the sheet opens or the quote changes
  React.useEffect(() => {
    if (formats.length > 0 && open) {
      setSelectedFormatId(formats[0].id);
    } else {
      setSelectedFormatId(null);
    }
  }, [open, quote, formats]);

  if (!quote) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:max-w-[900px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Quote Details: {quote.reference_id}</span>
            <div className="flex items-center gap-2">
              <Badge>{quote.supplier?.supplier_name}</Badge>
              <Badge variant="outline">{quote.quote_request?.title}</Badge>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="price-breaks">Price Breaks</TabsTrigger>
              <TabsTrigger value="formats">Formats</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>
            
            <TabsContent value="price-breaks">
              <PriceBreakSection quote={quote} />
            </TabsContent>
            
            <TabsContent value="formats">
              <FormatDetailsPanel
                formats={formats}
                selectedFormatId={selectedFormatId}
                onFormatSelect={setSelectedFormatId}
              />
            </TabsContent>
            
            <TabsContent value="metadata">
              <MetadataSection quote={quote} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
