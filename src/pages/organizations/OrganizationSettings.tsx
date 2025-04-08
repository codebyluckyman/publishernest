
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OrganizationSettings = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organization Settings</h1>
      <p className="text-gray-500">Manage settings for organization ID: {id}</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-500">Organization details placeholder</h3>
              <p>Organization settings would appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSettings;
