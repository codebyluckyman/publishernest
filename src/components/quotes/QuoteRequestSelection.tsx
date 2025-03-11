
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteRequest } from "@/types/quoteRequest";

interface QuoteRequestSelectionProps {
  quoteRequests: Pick<QuoteRequest, 'id' | 'title' | 'status'>[];
  quoteRequestId: string | null;
  setQuoteRequestId: (id: string | null) => void;
}

export function QuoteRequestSelection({ 
  quoteRequests, 
  quoteRequestId, 
  setQuoteRequestId 
}: QuoteRequestSelectionProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Quote Request</label>
      <Select 
        value={quoteRequestId || "none"} 
        onValueChange={(value) => setQuoteRequestId(value === "none" ? null : value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select quote request (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No quote request</SelectItem>
          {quoteRequests.map((request) => (
            <SelectItem key={request.id} value={request.id}>
              {request.title} ({request.status})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Link this quote to an existing quote request
      </p>
    </div>
  );
}
