
import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganization } from "@/hooks/useOrganization";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
import { useSuppliersApi } from "@/hooks/useSuppliersApi";
import { QuoteRequestTable } from "@/components/quotes/QuoteRequestTable";
import { QuoteRequestDialog } from "@/components/quotes/QuoteRequestDialog";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const QuoteRequests = () => {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for tab parameter in URL query string when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get("tab");
    if (tabParam && ["pending", "approved", "declined", "all"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  
  const { useQuoteRequestsList } = useQuoteRequests();
  const { data: suppliers = [], isLoading: isSuppliersLoading } = useSuppliersApi(currentOrganization);
  
  const { data: quoteRequests = [], isLoading: isQuoteRequestsLoading, refetch } = useQuoteRequestsList(
    currentOrganization,
    activeTab !== "all" ? activeTab : undefined,
    searchQuery
  );

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleQuoteRequestSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const navigateToQuotes = useCallback(() => {
    navigate('/quotes');
  }, [navigate]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Quote Requests</h1>
        <p className="text-gray-600">Create and manage quote requests to suppliers</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex space-x-2">
              <QuoteRequestDialog suppliers={suppliers} onSuccess={handleQuoteRequestSuccess} />
              <Button variant="outline" onClick={navigateToQuotes}>
                <FileText className="mr-2 h-4 w-4" />
                View All Supplier Quotes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search quote requests..."
                value={searchQuery}
                onChange={handleSearch}
                className="max-w-sm"
              />
            </div>
            <Tabs value={activeTab} className="space-y-4" onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Active</TabsTrigger>
                <TabsTrigger value="declined">Inactive</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="space-y-4">
                <QuoteRequestTable 
                  quoteRequests={quoteRequests} 
                  isLoading={isQuoteRequestsLoading} 
                />
              </TabsContent>
              <TabsContent value="approved" className="space-y-4">
                <QuoteRequestTable 
                  quoteRequests={quoteRequests} 
                  isLoading={isQuoteRequestsLoading} 
                />
              </TabsContent>
              <TabsContent value="declined" className="space-y-4">
                <QuoteRequestTable 
                  quoteRequests={quoteRequests} 
                  isLoading={isQuoteRequestsLoading} 
                />
              </TabsContent>
              <TabsContent value="all" className="space-y-4">
                <QuoteRequestTable 
                  quoteRequests={quoteRequests} 
                  isLoading={isQuoteRequestsLoading} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuoteRequests;
