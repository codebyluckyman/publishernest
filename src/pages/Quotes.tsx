
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganization } from "@/hooks/useOrganization";

const Quotes = () => {
  const { currentOrganization } = useOrganization();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Quotes</h1>
        <p className="text-gray-600">View and manage quotes from suppliers</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quotes</CardTitle>
            <CardDescription>
              View and manage quotes from suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="space-y-4">
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="space-y-4">
                <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No active quotes</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a quote request to get started
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No completed quotes</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quotes will appear here once they are completed
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="all" className="space-y-4">
                <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No quotes found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a quote request to get started
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

export default Quotes;
