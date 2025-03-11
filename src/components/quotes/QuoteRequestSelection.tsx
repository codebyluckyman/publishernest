
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
    <div className="md:col-span-2">
      <div className="flex items-center mb-2">
        <label className="text-sm font-medium">Quote Request</label>
      </div>
      <Select
        value={quoteRequestId || "none"}
        onValueChange={(value) => setQuoteRequestId(value === "none" ? null : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a quote request (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No quote request</SelectItem>
          {quoteRequests && quoteRequests.map((request) => (
            <SelectItem key={request.id} value={request.id}>
              {request.title} ({request.status})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
