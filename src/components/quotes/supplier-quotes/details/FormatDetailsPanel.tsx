import React from 'react';
import { SupplierQuoteFormat } from '@/types/supplierQuote';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FormatDetailsPanelProps {
  formats: SupplierQuoteFormat[];
  selectedFormatId: string | null;
  onFormatSelect: (formatId: string) => void;
}

export function FormatDetailsPanel({ 
  formats, 
  selectedFormatId, 
  onFormatSelect 
}: FormatDetailsPanelProps) {
  if (!formats || formats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Format Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No formats available for this quote.</p>
        </CardContent>
      </Card>
    );
  }

  const selectedFormat = formats.find(format => format.id === selectedFormatId) || formats[0];
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Format Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <TabsList className="w-full">
            {formats.map(format => (
              <TabsTrigger 
                key={format.id} 
                value={format.id}
                onClick={() => onFormatSelect(format.id)}
                className={selectedFormatId === format.id ? "bg-primary text-primary-foreground" : ""}
              >
                {format.format_name}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardContent>
      </Card>
      
      {selectedFormat && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedFormat.format_name} Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-100">
              {selectedFormat.dimensions && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
                  <dt className="text-sm font-medium">Dimensions</dt>
                  <dd className="text-sm">{selectedFormat.dimensions}</dd>
                </div>
              )}
              {selectedFormat.binding_type && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
                  <dt className="text-sm font-medium">Binding</dt>
                  <dd className="text-sm">{selectedFormat.binding_type}</dd>
                </div>
              )}
              {selectedFormat.extent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
                  <dt className="text-sm font-medium">Extent</dt>
                  <dd className="text-sm">{selectedFormat.extent}</dd>
                </div>
              )}
              {/* Display more format details as needed */}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
