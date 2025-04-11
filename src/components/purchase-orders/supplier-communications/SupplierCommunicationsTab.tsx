
import { useSupplierCommunications } from '@/hooks/useSupplierCommunications';
import { SupplierChatInterface } from './SupplierChatInterface';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SupplierCommunicationsTabProps {
  purchaseOrderId: string;
}

export function SupplierCommunicationsTab({ purchaseOrderId }: SupplierCommunicationsTabProps) {
  const { 
    communications, 
    isLoading, 
    createCommunication, 
    isCreating 
  } = useSupplierCommunications(purchaseOrderId);

  const handleSendMessage = (message: string, communicationType: 'email' | 'phone' | 'note' | 'other') => {
    createCommunication({ message, communicationType });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Communications</CardTitle>
          <CardDescription>
            Send messages and view your communication history with the supplier for this purchase order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierChatInterface
            communications={communications || []}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            isSending={isCreating}
          />
        </CardContent>
      </Card>
    </div>
  );
}
