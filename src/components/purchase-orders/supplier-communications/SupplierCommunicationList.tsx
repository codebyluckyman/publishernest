
import { SupplierCommunication } from '@/api/supplierCommunications/fetchSupplierCommunications';
import { Card } from '@/components/ui/card';
import { DateFormatter } from '@/utils/formatters';
import { Mail, Phone, Pencil, AlertCircle } from 'lucide-react';

interface SupplierCommunicationListProps {
  communications: SupplierCommunication[];
  isLoading: boolean;
}

export function SupplierCommunicationList({ communications, isLoading }: SupplierCommunicationListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading communications...</p>
      </div>
    );
  }

  if (communications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">No communications recorded yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Record your supplier interactions to keep track of important discussions.
        </p>
      </div>
    );
  }

  const getCommunicationTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'note':
        return <Pencil className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email':
        return 'Email';
      case 'phone':
        return 'Phone Call';
      case 'note':
        return 'Note';
      default:
        return 'Other';
    }
  };

  return (
    <div className="space-y-4">
      {communications.map((comm) => (
        <Card key={comm.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-full bg-muted">
              {getCommunicationTypeIcon(comm.communication_type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{getTypeLabel(comm.communication_type)}</p>
                  <p className="text-xs text-muted-foreground">
                    {comm.creator?.first_name ? 
                      `${comm.creator.first_name} ${comm.creator.last_name || ''}` : 
                      comm.creator?.email || 'User'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {DateFormatter.format(new Date(comm.communication_date))}
                </p>
              </div>
              <div className="mt-2 whitespace-pre-line text-sm">
                {comm.message}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
