
import { useOrganization } from "@/hooks/useOrganization";
import { QuoteTableContainer } from "@/components/quotes/QuoteTableContainer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

const Quotes = () => {
  const { currentOrganization } = useOrganization();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Supplier Quotes</h1>
        <Button variant="outline" asChild>
          <Link to="/quote-requests">
            <FileQuestion className="h-4 w-4 mr-2" />
            Manage Quote Requests
          </Link>
        </Button>
      </div>
      <QuoteTableContainer currentOrganization={currentOrganization} />
    </div>
  );
};

export default Quotes;
