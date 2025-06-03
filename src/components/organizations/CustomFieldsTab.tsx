
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductFieldsList } from './custom-fields/ProductFieldsList';

export function CustomFieldsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Custom Fields</h2>
        <p className="text-muted-foreground">
          Define custom fields for your organization's data
        </p>
      </div>
      
      <ProductFieldsList />
    </div>
  );
}
