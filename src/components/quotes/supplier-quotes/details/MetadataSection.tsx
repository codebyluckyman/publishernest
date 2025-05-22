
import React from 'react';
import { SupplierQuote } from '@/types/supplierQuote';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/date';

interface MetadataSectionProps {
  quote: SupplierQuote;
}

export function MetadataSection({ quote }: MetadataSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quote Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
              <dt className="text-sm font-medium">Reference</dt>
              <dd className="text-sm">{quote.reference || 'N/A'}</dd>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
              <dt className="text-sm font-medium">Currency</dt>
              <dd className="text-sm">{quote.currency || 'USD'}</dd>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
              <dt className="text-sm font-medium">Status</dt>
              <dd className="text-sm">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                  quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                  quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  quote.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {quote.status}
                </span>
              </dd>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
              <dt className="text-sm font-medium">Created</dt>
              <dd className="text-sm">{formatDate(quote.created_at)}</dd>
            </div>
            {quote.submitted_at && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
                <dt className="text-sm font-medium">Submitted</dt>
                <dd className="text-sm">{formatDate(quote.submitted_at)}</dd>
              </div>
            )}
            {quote.valid_from && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
                <dt className="text-sm font-medium">Valid From</dt>
                <dd className="text-sm">{formatDate(quote.valid_from)}</dd>
              </div>
            )}
            {quote.valid_to && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
                <dt className="text-sm font-medium">Valid To</dt>
                <dd className="text-sm">{formatDate(quote.valid_to)}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {quote.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{quote.notes}</p>
          </CardContent>
        </Card>
      )}
      
      {quote.terms && (
        <Card>
          <CardHeader>
            <CardTitle>Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{quote.terms}</p>
          </CardContent>
        </Card>
      )}
      
      {quote.remarks && (
        <Card>
          <CardHeader>
            <CardTitle>Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{quote.remarks}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
