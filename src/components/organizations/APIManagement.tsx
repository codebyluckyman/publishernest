
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APIKeysList } from "./APIKeysList";
import { APIDocumentation } from "./APIDocumentation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Key } from "lucide-react";

export function APIManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={20} />
          API Management
        </CardTitle>
        <CardDescription>
          Manage API access for external system integrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="keys" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="keys" className="flex items-center gap-1">
              <Key size={16} />
              <span>API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-1">
              <Database size={16} />
              <span>API Documentation</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="keys" className="pt-4">
            <APIKeysList />
          </TabsContent>
          <TabsContent value="docs" className="pt-4">
            <APIDocumentation />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
