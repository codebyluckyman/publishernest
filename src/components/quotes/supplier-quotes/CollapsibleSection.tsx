
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export function CollapsibleSection({ 
  title, 
  isOpen, 
  onOpenChange, 
  children, 
  isEmpty = false,
  emptyMessage = "No items available"
}: CollapsibleSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{title}</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onOpenChange(!isOpen)}
          className="p-0 h-8 w-8"
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleContent>
          {isEmpty ? (
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            <Card>
              <CardContent className="p-4 space-y-3">
                {children}
              </CardContent>
            </Card>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
