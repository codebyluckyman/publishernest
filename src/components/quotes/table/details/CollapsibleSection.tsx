
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: Array<{
    id?: string;
    name: string;
    description?: string | null;
    unit_of_measure_name?: string | null;
  }>;
}

export function CollapsibleSection({ title, isOpen, onOpenChange, items }: CollapsibleSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-medium">{title}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-8 w-8"
          onClick={() => onOpenChange(!isOpen)}
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
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
                  {items.map((item, index) => (
                    <tr key={item.id || index} className="border-b">
                      <td className="py-2 text-sm">{item.name}</td>
                      <td className="py-2 text-sm text-muted-foreground">
                        {item.description || '-'}
                      </td>
                      <td className="py-2 text-sm text-right">
                        {item.unit_of_measure_name || '-'}
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
  );
}
