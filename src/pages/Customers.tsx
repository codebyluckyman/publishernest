
import React, { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, Search, Users } from 'lucide-react';
import { 
  Table,
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    customers, 
    isLoadingCustomers, 
    isErrorCustomers,
    errorCustomers
  } = useCustomers();

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      customer.customer_name.toLowerCase().includes(query) ||
      (customer.contact_name && customer.contact_name.toLowerCase().includes(query)) ||
      (customer.contact_email && customer.contact_email.toLowerCase().includes(query))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isErrorCustomers) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {errorCustomers instanceof Error ? errorCustomers.message : 'Failed to load customers'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button asChild>
          <Link to="/customers/create">
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>
                Manage your customers and their requirements
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingCustomers ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="h-16 w-16 text-gray-400 mb-2" />
              {searchQuery ? (
                <>
                  <h3 className="text-lg font-medium">No matching customers</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    No customers match your search query. Try a different search or clear the filter.
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium">No Customers</h3>
                  <p className="text-sm text-gray-500 mt-2 mb-4">
                    You haven't added any customers yet.
                  </p>
                  <Button asChild>
                    <Link to="/customers/create">
                      <Plus className="mr-2 h-4 w-4" /> Add Customer
                    </Link>
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Special Requirements</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <Link to={`/customers/${customer.id}`} className="hover:underline text-blue-600">
                          {customer.customer_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {customer.contact_name && (
                          <div>
                            <p>{customer.contact_name}</p>
                            {customer.contact_email && (
                              <p className="text-sm text-gray-500">{customer.contact_email}</p>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.status && getStatusBadge(customer.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {customer.file_approval_required && (
                            <Badge variant="outline" className="bg-blue-50">File Approval</Badge>
                          )}
                          {customer.advance_payment_required && (
                            <Badge variant="outline" className="bg-amber-50">Advance Payment</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
