
import React from "react";
import { SupplierQuoteFormat } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormatDetailsPanelProps {
  formatList: SupplierQuoteFormat[];
  selectedFormatId: string | null;
  onFormatSelect: (id: string | null) => void;
}

export function FormatDetailsPanel({
  formatList,
  selectedFormatId,
  onFormatSelect,
}: FormatDetailsPanelProps) {
  // Find the currently selected format
  const selectedFormat = formatList.find((f) => f.id === selectedFormatId) || null;

  return (
    <div className="space-y-4">
      <Tabs className="w-full">
        <TabsList className="w-full flex overflow-x-auto">
          {formatList.map((format) => (
            <TabsTrigger
              key={format.id}
              value={format.id}
              onClick={() => onFormatSelect(format.id)}
              className={selectedFormatId === format.id ? 'border-primary' : ''}
            >
              {format.format_name || "Format"}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {selectedFormat && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>{selectedFormat.format_name || "Format Details"}</span>
              {selectedFormat.dimensions && (
                <Badge variant="outline">{selectedFormat.dimensions}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedFormat.extent && (
                <div>
                  <p className="font-medium text-sm">Extent</p>
                  <p>{selectedFormat.extent}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
