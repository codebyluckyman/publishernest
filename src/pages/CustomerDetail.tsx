import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomers } from '@/hooks/useCustomers';
import { AlertCircle, ArrowLeft, Building, Mail, Phone, Globe, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CustomerRequirementsTab } from '@/components/customers/requirements/CustomerRequirementsTab';
import { DeliveryLocationsTab } from '@/components/customers/delivery-locations/DeliveryLocationsTab';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getCustomerById } = useCustomers();
  const { data: customer, isLoading, isError, error } = getCustomerById(id || '');

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 w-1/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-100 rounded mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="container mx-auto p-4 mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load customer details'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!customer) {
    return (
      <Alert variant="destructive" className="container mx-auto p-4 mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>
          The requested customer could not be found.
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </Link>
            {customer.status && getStatusBadge(customer.status)}
          </div>
          <h1 className="text-2xl font-bold">{customer.customer_name}</h1>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link to={`/customers/${customer.id}/edit`}>Edit Customer</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Customer Details</TabsTrigger>
          <TabsTrigger value="delivery-locations">Delivery Locations</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {customer.contact_name && (
                  <div className="flex items-start">
                    <span className="text-muted-foreground w-24">Contact:</span>
                    <span>{customer.contact_name}</span>
                  </div>
                )}
                {customer.contact_email && (
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`mailto:${customer.contact_email}`} className="text-blue-600 hover:underline">
                      {customer.contact_email}
                    </a>
                  </div>
                )}
                {customer.contact_phone && (
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{customer.contact_phone}</span>
                  </div>
                )}
                {customer.website && (
                  <div className="flex items-start">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {customer.website}
                    </a>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start mt-4">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="whitespace-pre-wrap">{customer.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Special Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>File Approval Required:</span>
                  <Badge variant={customer.file_approval_required ? "default" : "outline"}>
                    {customer.file_approval_required ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Advance Payment Required:</span>
                  <Badge variant={customer.advance_payment_required ? "default" : "outline"}>
                    {customer.advance_payment_required ? "Yes" : "No"}
                  </Badge>
                </div>
                {customer.packaging_requirements && (
                  <>
                    <Separator className="my-2" />
                    <div>
                      <h3 className="font-medium">Packaging Requirements:</h3>
                      <p className="text-sm text-muted-foreground">{customer.packaging_requirements}</p>
                    </div>
                  </>
                )}
                {customer.carton_marking_requirements && (
                  <div>
                    <h3 className="font-medium">Carton Marking:</h3>
                    <p className="text-sm text-muted-foreground">{customer.carton_marking_requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {customer.freight_forwarder && (
                  <div>
                    <h3 className="font-medium">Freight Forwarder:</h3>
                    <p className="text-sm">{customer.freight_forwarder}</p>
                  </div>
                )}
                {customer.delivery_address && (
                  <div className="mt-4">
                    <h3 className="font-medium">Delivery Address:</h3>
                    <p className="text-sm whitespace-pre-wrap">{customer.delivery_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {(customer.notes || customer.document_notes) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {customer.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Internal Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{customer.notes}</p>
                  </CardContent>
                </Card>
              )}
              
              {customer.document_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Document Notes</CardTitle>
                    <CardDescription>
                      These notes may appear on customer-facing documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{customer.document_notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="delivery-locations">
          <DeliveryLocationsTab customerId={customer.id} />
        </TabsContent>
        
        <TabsContent value="requirements">
          <CustomerRequirementsTab customerId={customer.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetail;
