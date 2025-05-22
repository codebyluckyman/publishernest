
import React from "react";
import { SupplierQuoteFormat } from "@/types/supplierQuote";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FormatDetailsPanelProps {
  formats: SupplierQuoteFormat[];
  selectedFormatId: string | null;
  onFormatSelect: (formatId: string) => void;
}

export function FormatDetailsPanel({
  formats,
  selectedFormatId,
  onFormatSelect,
}: FormatDetailsPanelProps) {
  // Find the selected format
  const selectedFormat = formats.find((f) => f.id === selectedFormatId) || null;

  if (formats.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No format information available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Format selector */}
      <div className="md:col-span-1">
        <h3 className="mb-2 text-sm font-medium">Formats</h3>
        <div className="space-y-2">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => onFormatSelect(format.id)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                selectedFormatId === format.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {format.format_name || 'Unnamed Format'}
            </button>
          ))}
        </div>
      </div>

      {/* Format details */}
      <div className="md:col-span-3">
        {selectedFormat ? (
          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-8">
                  {/* Basic info */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem label="Format Name" value={selectedFormat.format_name || 'N/A'} />
                      <FormItem label="Dimensions" value={selectedFormat.dimensions || 'N/A'} />
                      <FormItem label="Extent" value={selectedFormat.extent || 'N/A'} />
                      <FormItem label="Binding Type" value={selectedFormat.binding_type || 'N/A'} />
                    </div>
                  </div>

                  {/* Cover properties */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Cover</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem
                        label="Cover Material"
                        value={selectedFormat.format?.cover_material || 'N/A'}
                      />
                      <FormItem
                        label="Cover Stock Print"
                        value={selectedFormat.format?.cover_stock_print || 'N/A'}
                      />
                    </div>
                  </div>

                  {/* Internal properties */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Internal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem
                        label="Internal Material"
                        value={selectedFormat.format?.internal_material || 'N/A'}
                      />
                      <FormItem
                        label="Internal Stock Print"
                        value={selectedFormat.format?.internal_stock_print || 'N/A'}
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Select a format to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for displaying form items
function FormItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
