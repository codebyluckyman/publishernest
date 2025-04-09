
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PublishingProgram = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Publishing Program</h1>
        <p className="text-gray-600">Manage your publishing program and schedule</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Publishing Program (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground text-center">
              This feature is currently under development. More functionality will be added soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishingProgram;
