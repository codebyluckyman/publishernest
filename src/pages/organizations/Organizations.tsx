
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganization } from '@/hooks/useOrganization';

const Organizations = () => {
  const { currentOrganization } = useOrganization();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organizations</h1>
      
      {currentOrganization ? (
        <Card>
          <CardHeader>
            <CardTitle>{currentOrganization.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-500">Organization ID</h3>
                <p className="text-sm font-mono">{currentOrganization.id}</p>
              </div>
              
              {/* Add more organization details here */}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>Loading organizations...</div>
      )}
    </div>
  );
};

export default Organizations;
