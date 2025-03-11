
import { 
  Table, 
  TableBody, 
} from '@/components/ui/table';
import { QuoteRequest, SortQuoteRequestField, SortDirection } from '@/types/quoteRequest';
import { Organization } from '@/types/organization';
import { useQuoteRequestsApi } from '@/hooks/quote-requests/useQuoteRequestsApi';
import { QuoteRequestTableHeader } from './table/QuoteRequestTableHeader';
import { QuoteRequestTableRow } from './table/QuoteRequestTableRow';

interface QuoteRequestsTableProps {
  quoteRequests: QuoteRequest[];
  sortField: SortQuoteRequestField;
  sortDirection: SortDirection;
  onSort: (field: SortQuoteRequestField) => void;
  currentOrganization: Organization | null;
}

export function QuoteRequestsTable({ 
  quoteRequests, 
  sortField, 
  sortDirection, 
  onSort,
  currentOrganization
}: QuoteRequestsTableProps) {
  const { refetch } = useQuoteRequestsApi(currentOrganization);

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <QuoteRequestTableHeader 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        <TableBody>
          {quoteRequests.map((quoteRequest) => (
            <QuoteRequestTableRow
              key={quoteRequest.id}
              quoteRequest={quoteRequest}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
