
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteRequest } from "@/types/quoteRequest";
import { QuoteStatus } from "@/types/quote";

interface QuoteFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: QuoteStatus | 'all';
  setStatusFilter: (status: QuoteStatus | 'all') => void;
  quoteRequestFilter: string | null;
  setQuoteRequestFilter: (id: string | null) => void;
  quoteRequests: Pick<QuoteRequest, 'id' | 'title'>[];
}

export function QuoteFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  quoteRequestFilter,
  setQuoteRequestFilter,
  quoteRequests
}: QuoteFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="flex-1">
        <Input
          placeholder="Search by supplier or quote number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as QuoteStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={quoteRequestFilter || "none"}
          onValueChange={(value) => setQuoteRequestFilter(value === "none" ? null : value)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by quote request" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">All Quote Requests</SelectItem>
            {quoteRequests.map((request) => (
              <SelectItem key={request.id} value={request.id}>
                {request.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
