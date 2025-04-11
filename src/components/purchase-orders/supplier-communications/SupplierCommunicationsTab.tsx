
import { useSupplierCommunications } from '@/hooks/useSupplierCommunications';
import { SupplierCommunicationForm } from './SupplierCommunicationForm';
import { SupplierCommunicationList } from './SupplierCommunicationList';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const handleSubmit = (message: string, communicationType: 'email' | 'phone' | 'note' | 'other') => {
    createCommunication({ message, communicationType });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Communication History</TabsTrigger>
          <TabsTrigger value="new">New Communication</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>
                View all communications with the supplier for this purchase order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupplierCommunicationList 
                communications={communications || []} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Record New Communication</CardTitle>
              <CardDescription>
                Record a new communication with the supplier about this purchase order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupplierCommunicationForm 
                onSubmit={handleSubmit} 
                isSubmitting={isCreating} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
