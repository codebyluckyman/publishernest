
import { useOrganization } from "@/hooks/useOrganization";
import { QuoteTableContainer } from "@/components/quotes/QuoteTableContainer";

const Quotes = () => {
  const { currentOrganization } = useOrganization();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <QuoteTableContainer currentOrganization={currentOrganization} />
    </div>
  );
};

export default Quotes;
