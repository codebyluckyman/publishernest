
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SupplierQuote } from "@/types/supplierQuote";
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SupplierQuoteAudit {
  id: string;
  supplier_quote_id: string;
  action: string;
  user_id: string;
  changes: any;
  created_at: string;
  user_email?: string; // Added for joining user info
  user_display_name?: string; // Added for joining user info
}

interface SupplierQuoteAuditHistoryProps {
  quoteId: string;
}

export function SupplierQuoteAuditHistory({ quoteId }: SupplierQuoteAuditHistoryProps) {
  const [auditLogs, setAuditLogs] = useState<SupplierQuoteAudit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('supplier_quote_audit')
          .select(`
            id,
            supplier_quote_id,
            action,
            user_id,
            changes,
            created_at,
            users:user_id (email, display_name)
          `)
          .eq('supplier_quote_id', quoteId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data to flatten user details
        const transformedData = data.map(log => ({
          ...log,
          user_email: log.users?.email,
          user_display_name: log.users?.display_name
        }));

        setAuditLogs(transformedData);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setError('Failed to load audit history');
      } finally {
        setIsLoading(false);
      }
    };

    if (quoteId) {
      fetchAuditLogs();
    }
  }, [quoteId]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'created':
        return <Badge className="bg-green-500">Created</Badge>;
      case 'updated':
        return <Badge className="bg-blue-500">Updated</Badge>;
      case 'status_changed':
        return <Badge className="bg-purple-500">Status Changed</Badge>;
      case 'submitted':
        return <Badge className="bg-amber-500">Submitted</Badge>;
      case 'accepted':
        return <Badge className="bg-emerald-500">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-red-500">Declined</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };

  const formatChanges = (changes: any) => {
    if (!changes) return null;
    
    return Object.entries(changes).map(([key, value]: [string, any]) => {
      // Skip some internal fields
      if (['id', 'created_at', 'updated_at'].includes(key)) {
        return null;
      }
      
      // Format different types of changes
      let displayValue;
      if (value && typeof value === 'object' && ('old' in value || 'new' in value)) {
        const oldValue = value.old !== undefined ? formatDisplayValue(value.old) : 'N/A';
        const newValue = value.new !== undefined ? formatDisplayValue(value.new) : 'N/A';
        displayValue = <>{oldValue} → {newValue}</>;
      } else {
        displayValue = formatDisplayValue(value);
      }
      
      return (
        <div key={key} className="py-1 flex items-start">
          <div className="w-1/3 font-medium text-sm">{formatFieldName(key)}</div>
          <div className="w-2/3 text-sm">{displayValue}</div>
        </div>
      );
    }).filter(Boolean);
  };

  const formatFieldName = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDisplayValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
      try {
        return formatDate(value);
      } catch (e) {
        return value;
      }
    }
    return String(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Audit History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading audit history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Audit History</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Audit History</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No audit history available for this quote</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Audit History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {auditLogs.map((log) => (
            <div key={log.id} className="border-l-2 pl-4 py-2 border-l-muted-foreground/30">
              <div className="flex justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getActionBadge(log.action)}
                  <span className="text-sm text-muted-foreground">
                    by {log.user_display_name || log.user_email || 'Unknown user'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(log.created_at)}
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-md p-3 mt-2">
                {formatChanges(log.changes)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
