
import { useOrganization } from "@/hooks/useOrganization";
import { QuoteRequestTableContainer } from "@/components/quote-requests/QuoteRequestTableContainer";

const QuoteRequests = () => {
  const { currentOrganization } = useOrganization();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Quote Requests</h1>
        <p className="text-gray-600">Manage your quote requests and submissions</p>
      </div>

      <QuoteRequestTableContainer 
        key={`quote-requests-${currentOrganization?.id || 'none'}`} 
        currentOrganization={currentOrganization} 
      />
    </div>
  );
};

export default QuoteRequests;
