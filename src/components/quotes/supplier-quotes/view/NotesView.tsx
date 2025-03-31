
import { SupplierQuote } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote } from "lucide-react";

interface NotesViewProps {
  quote: SupplierQuote;
}

export function NotesView({ quote }: NotesViewProps) {
  // Combine notes and remarks if both are available
  const hasNotes = !!quote.notes;
  const hasRemarks = !!quote.remarks;
  
  // If no notes or remarks available
  if (!hasNotes && !hasRemarks) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <StickyNote className="w-5 h-5 mr-2" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm italic">No notes provided</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <StickyNote className="w-5 h-5 mr-2" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasNotes && (
          <div>
            <h3 className="text-sm font-medium mb-1">General Notes</h3>
            <div className="whitespace-pre-wrap text-sm">{quote.notes}</div>
          </div>
        )}
        
        {hasRemarks && (
          <div>
            <h3 className="text-sm font-medium mb-1">Additional Remarks</h3>
            <div className="whitespace-pre-wrap text-sm">{quote.remarks}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
