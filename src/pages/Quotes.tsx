
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganization } from "@/hooks/useOrganization";
import { SupplierQuotesTable } from "@/components/quotes/supplier-quotes/SupplierQuotesTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Quotes = () => {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // Map tab values to status filter
  const getStatusFilter = (tab: string) => {
    switch (tab) {
      case "active":
        return ["draft", "submitted"];
      case "completed":
        return ["accepted", "declined"];
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
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="space-y-4">
                <SupplierQuotesTable 
                  statusFilter={getStatusFilter("active")} 
                  searchQuery={searchQuery}
                />
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                <SupplierQuotesTable 
                  statusFilter={getStatusFilter("completed")} 
                  searchQuery={searchQuery}
                />
              </TabsContent>
              <TabsContent value="all" className="space-y-4">
                <SupplierQuotesTable 
                  searchQuery={searchQuery}
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
