
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useSupplierQuotes } from '@/hooks/useSupplierQuotes';
import { formatDistanceToNow } from 'date-fns';

interface SupplierQuoteAuditHistoryProps {
  supplierQuoteId: string;
}

export function SupplierQuoteAuditHistory({ supplierQuoteId }: SupplierQuoteAuditHistoryProps) {
  const { useSupplierQuoteAudit } = useSupplierQuotes();
  const { data: auditTrail, isLoading } = useSupplierQuoteAudit(supplierQuoteId);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <HistoryIcon className="w-5 h-5 mr-2" />
            Audit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading audit history...</p>
        </CardContent>
      </Card>
    );
  }

  if (!auditTrail || auditTrail.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <HistoryIcon className="w-5 h-5 mr-2" />
            Audit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm italic">No audit history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <HistoryIcon className="w-5 h-5 mr-2" />
          Audit History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditTrail.map((entry) => (
            <div key={entry.id} className="border rounded-lg overflow-hidden">
              <div
                className="flex justify-between items-center p-3 cursor-pointer bg-muted/30"
                onClick={() => toggleItem(entry.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(entry.action)}`}>
                    {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                  </span>
                  <span className="text-sm">
                    {entry.user_name || 'Unknown user'} - {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </span>
                </div>
                {expandedItems.includes(entry.id) ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {expandedItems.includes(entry.id) && entry.changes && (
                <div className="p-3 border-t">
                  <div className="grid grid-cols-3 gap-2 text-sm mb-2 font-medium">
                    <div>Field</div>
                    <div>Old Value</div>
                    <div>New Value</div>
                  </div>
                  {Object.entries(entry.changes).map(([field, values]) => (
                    <div key={field} className="grid grid-cols-3 gap-2 text-sm py-1 border-t first:border-t-0">
                      <div className="text-muted-foreground break-all">{field}</div>
                      <div className="break-all">{renderValue(values.old)}</div>
                      <div className="break-all">{renderValue(values.new)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to render different types of values
function renderValue(value: any): string {
  if (value === null || value === undefined) {
    return '-';
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
}
