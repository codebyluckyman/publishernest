
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import { useQuoteRequestsApi } from "@/hooks/useQuoteRequestsApi";
import { useSuppliersApi } from "@/hooks/useSuppliersApi";
import { QuoteRequestTable } from "@/components/quotes/QuoteRequestTable";
import { QuoteRequestDialog } from "@/components/quotes/QuoteRequestDialog";
import { Input } from "@/components/ui/input";

const QuoteRequests = () => {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  
  const { useQuoteRequests } = useQuoteRequestsApi();
  const suppliersApi = useSuppliersApi(currentOrganization);
  
  const { data: suppliers = [], isLoading: isSuppliersLoading } = suppliersApi;
  const { data: quoteRequests = [], isLoading: isQuoteRequestsLoading } = useQuoteRequests(
    currentOrganization,
    activeTab !== "all" ? activeTab : undefined,
    searchQuery
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Quote Requests</h1>
        <p className="text-gray-600">Create and manage quote requests to suppliers</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quote Requests</CardTitle>
              <CardDescription>
                Create and manage quote requests to suppliers
              </CardDescription>
            </div>
            <QuoteRequestDialog suppliers={suppliers} />
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
            <Tabs defaultValue="pending" className="space-y-4" onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="declined">Declined</TabsTrigger>
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
