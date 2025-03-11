import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";

const QuoteRequests = () => {
  const { currentOrganization } = useOrganization();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Quote Requests</h1>
        <p className="text-gray-600">Create and manage quote requests to suppliers</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quote Requests</CardTitle>
            <CardDescription>
              Create and manage quote requests to suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="declined">Declined</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="space-y-4">
                <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No pending quote requests</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a new quote request to get started
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="approved" className="space-y-4">
                <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No approved quote requests</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Approved quote requests will appear here
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="declined" className="space-y-4">
                <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No declined quote requests</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Declined quote requests will appear here
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="all" className="space-y-4">
                <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No quote requests found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a new quote request to get started
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuoteRequests;
