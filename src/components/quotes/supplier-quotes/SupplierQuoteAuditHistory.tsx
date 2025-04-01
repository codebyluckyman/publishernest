import { useState, useEffect } from "react";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, FileEdit, Send, User, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from "lucide-react";

interface SupplierQuoteAuditHistoryProps {
  supplierQuoteId: string;
}

export function SupplierQuoteAuditHistory({ supplierQuoteId }: SupplierQuoteAuditHistoryProps) {
  const { useSupplierQuoteAudit } = useSupplierQuotes();
  const { data: auditEntries = [], isLoading, error } = useSupplierQuoteAudit(supplierQuoteId);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
      case 'create':
        return <FileEdit className="h-4 w-4" />;
      case 'submitted':
      case 'submit':
        return <Send className="h-4 w-4" />;
      case 'updated':
      case 'update':
        return <FileEdit className="h-4 w-4" />;
      case 'accepted':
      case 'accept':
        return <CheckCircle className="h-4 w-4" />;
      case 'declined':
      case 'decline':
        return <XCircle className="h-4 w-4" />;
      case 'approved':
      case 'approve':
        return <ThumbsUp className="h-4 w-4" />;
      case 'rejected':
      case 'reject':
        return <ThumbsDown className="h-4 w-4" />;
      default:
        return <CalendarClock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !auditEntries) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load audit history.</p>
        </CardContent>
      </Card>
    );
  }

  if (auditEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No audit history available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Audit History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditEntries.map((entry: any) => (
            <div key={entry.id} className="flex items-start space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.user_avatar} alt={entry.user_name || "User"} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{entry.user_name || "Unknown user"}</span>
                  <span className="text-muted-foreground text-sm">{entry.created_at}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1 text-sm">
                  {getActionIcon(entry.action)}
                  <span>
                    {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)} the quote
                    {entry.details ? `: ${entry.details}` : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
