
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteStatus } from "@/types/quote";
import { QuoteRequest } from "@/types/quoteRequest";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface QuoteFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: QuoteStatus | 'all';
  setStatusFilter: (value: QuoteStatus | 'all') => void;
  quoteRequestFilter: string | null;
  setQuoteRequestFilter: (value: string | null) => void;
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle URL parameters
  useEffect(() => {
    const requestId = searchParams.get('requestId');
    if (requestId) {
      setQuoteRequestFilter(requestId);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search quotes..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select 
          value={statusFilter} 
          onValueChange={(value) => setStatusFilter(value as QuoteStatus | 'all')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-64">
        <Select 
          value={quoteRequestFilter || ''} 
          onValueChange={(value) => {
            setQuoteRequestFilter(value || null);
            if (value) {
              setSearchParams({ requestId: value });
            } else {
              searchParams.delete('requestId');
              setSearchParams(searchParams);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by quote request" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Quote Requests</SelectItem>
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
