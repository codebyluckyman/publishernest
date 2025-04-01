
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganization } from "@/context/OrganizationContext";
import { SupplierQuotesTable } from "@/components/quotes/supplier-quotes/SupplierQuotesTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { SupplierQuoteStatus } from "@/types/supplierQuote";

const Quotes = () => {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const location = useLocation();
  const [quoteRequestId, setQuoteRequestId] = useState<string | null>(null);

  // Check for tab parameter and quoteRequestId in URL query string
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    // Get and set tab parameter
    const tabParam = queryParams.get("tab");
    if (tabParam && ["active", "completed", "all", "draft", "submitted", "approved", "rejected"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    // Get and set quoteRequestId parameter
    const requestIdParam = queryParams.get("quoteRequestId");
    setQuoteRequestId(requestIdParam);
  }, [location.search]);

  // Map tab values to status filter
  const getStatusFilter = (tab: string): SupplierQuoteStatus[] | undefined => {
    switch (tab) {
      case "active":
        return ["draft", "submitted"];
      case "completed":
        return ["approved", "rejected"];
      case "draft":
        return ["draft"];
      case "submitted":
        return ["submitted"];
      case "approved":
        return ["approved"];
      case "rejected":
        return ["rejected"];
      default:
        return undefined;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Quotes</h1>
        <p className="text-gray-600">View and manage quotes from suppliers</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Quotes</CardTitle>
                <CardDescription>
                  View and manage quotes from suppliers
                </CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quotes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="active" 
              className="space-y-4"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="submitted">Submitted</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="space-y-4">
                <SupplierQuotesTable 
                  statusFilter={getStatusFilter("active")} 
                  searchQuery={searchQuery}
                  quoteRequestId={quoteRequestId}
                />
              </TabsContent>
              <TabsContent value="draft" className="space-y-4">
                <SupplierQuotesTable 
                  statusFilter={getStatusFilter("draft")} 
                  searchQuery={searchQuery}
                  quoteRequestId={quoteRequestId}
                />
              </TabsContent>
              <TabsContent value="submitted" className="space-y-4">
                <SupplierQuotesTable 
                  statusFilter={getStatusFilter("submitted")} 
                  searchQuery={searchQuery}
                  quoteRequestId={quoteRequestId}
                />
              </TabsContent>
              <TabsContent value="approved" className="space-y-4">
                <SupplierQuotesTable 
                  statusFilter={getStatusFilter("approved")} 
                  searchQuery={searchQuery}
                  quoteRequestId={quoteRequestId}
                />
              </TabsContent>
              <TabsContent value="rejected" className="space-y-4">
                <SupplierQuotesTable 
                  statusFilter={getStatusFilter("rejected")} 
                  searchQuery={searchQuery}
                  quoteRequestId={quoteRequestId}
                />
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                <SupplierQuotesTable 
                  statusFilter={getStatusFilter("completed")} 
                  searchQuery={searchQuery}
                  quoteRequestId={quoteRequestId}
                />
              </TabsContent>
              <TabsContent value="all" className="space-y-4">
                <SupplierQuotesTable 
                  searchQuery={searchQuery}
                  quoteRequestId={quoteRequestId}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quotes;
