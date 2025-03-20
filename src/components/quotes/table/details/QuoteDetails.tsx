
import React, { useState } from "react";
import { QuoteRequest } from "@/types/quoteRequest";
import { DetailHeader } from "./DetailHeader";
import { BasicInfo } from "./BasicInfo";
import { FormatAccordion } from "./FormatAccordion";
import { StatusActions } from "./StatusActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface QuoteDetailsProps {
  selectedRequest: QuoteRequest;
  onEdit?: (request: QuoteRequest) => void;
  onStatusChange?: (id: string, status: 'approved' | 'declined' | 'pending') => void;
  onShowHistory: () => void;
}

export function QuoteDetails({ 
  selectedRequest, 
  onEdit, 
  onStatusChange, 
  onShowHistory 
}: QuoteDetailsProps) {
  const [isExtraCostsOpen, setIsExtraCostsOpen] = useState(false);
  const [isSavingsOpen, setIsSavingsOpen] = useState(false);
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(selectedRequest);
    }
  };

  const handleStatusChange = (status: 'approved' | 'declined' | 'pending') => {
    if (onStatusChange) {
      onStatusChange(selectedRequest.id, status);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <DetailHeader 
        request={selectedRequest} 
        onEdit={onEdit ? handleEdit : undefined}
        onShowHistory={onShowHistory}
      />

      <BasicInfo request={selectedRequest} />

      {selectedRequest.description && (
        <div>
          <h3 className="text-md font-medium mb-2">Description</h3>
          <p className="text-sm whitespace-pre-wrap">{selectedRequest.description}</p>
        </div>
      )}

      {/* Format and Product Details */}
      {selectedRequest.formats && selectedRequest.formats.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-2">Format & Product Details</h3>
          <FormatAccordion formats={selectedRequest.formats} />
        </div>
      )}

      {/* Extra Costs */}
      {selectedRequest.extra_costs && selectedRequest.extra_costs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-medium">Extra Costs</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-8 w-8"
              onClick={() => setIsExtraCostsOpen(!isExtraCostsOpen)}
            >
              {isExtraCostsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          <Collapsible open={isExtraCostsOpen} onOpenChange={setIsExtraCostsOpen}>
            <CollapsibleContent>
              <Card>
                <CardContent className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 font-medium text-sm">Item</th>
                        <th className="py-2 font-medium text-sm">Description</th>
                        <th className="py-2 font-medium text-sm text-right">Unit of Measure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.extra_costs.map((cost, index) => (
                        <tr key={cost.id || index} className="border-b">
                          <td className="py-2 text-sm">{cost.name}</td>
                          <td className="py-2 text-sm text-muted-foreground">
                            {cost.description || '-'}
                          </td>
                          <td className="py-2 text-sm text-right">
                            {cost.unit_of_measure_name || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
      
      {/* Savings */}
      {selectedRequest.savings && selectedRequest.savings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-medium">Savings</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-8 w-8"
              onClick={() => setIsSavingsOpen(!isSavingsOpen)}
            >
              {isSavingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          <Collapsible open={isSavingsOpen} onOpenChange={setIsSavingsOpen}>
            <CollapsibleContent>
              <Card>
                <CardContent className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 font-medium text-sm">Item</th>
                        <th className="py-2 font-medium text-sm">Description</th>
                        <th className="py-2 font-medium text-sm text-right">Unit of Measure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.savings.map((saving, index) => (
                        <tr key={saving.id || index} className="border-b">
                          <td className="py-2 text-sm">{saving.name}</td>
                          <td className="py-2 text-sm text-muted-foreground">
                            {saving.description || '-'}
                          </td>
                          <td className="py-2 text-sm text-right">
                            {saving.unit_of_measure_name || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {onStatusChange && (
        <StatusActions 
          status={selectedRequest.status} 
          onStatusChange={handleStatusChange} 
        />
      )}
    </div>
  );
}
