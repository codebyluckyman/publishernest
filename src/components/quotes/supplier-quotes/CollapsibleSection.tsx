
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export function CollapsibleSection({ 
  title, 
  children, 
  isEmpty = false,
  emptyMessage = "No items available"
}: SectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{title}</h4>
      </div>
      
      {isEmpty ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <Card>
          <CardContent className="p-4 space-y-3">
            {children}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
