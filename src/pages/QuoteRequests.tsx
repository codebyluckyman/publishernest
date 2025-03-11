
import { useOrganization } from "@/hooks/useOrganization";
import { QuoteRequestTableContainer } from "@/components/quote-requests/QuoteRequestTableContainer";

const QuoteRequests = () => {
  const { currentOrganization } = useOrganization();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <QuoteRequestTableContainer 
        key={`quote-requests-${currentOrganization?.id || 'none'}`} 
        currentOrganization={currentOrganization} 
      />
    </div>
  );
};

export default QuoteRequests;
