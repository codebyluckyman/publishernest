
import { useState } from "react";
import { useDefaultPriceBreaks } from "@/hooks/useDefaultPriceBreaks";
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function DefaultPriceBreaks() {
  const { currentOrganization } = useOrganization();
  const { 
    defaultPriceBreaks, 
    isLoading, 
    updateDefaultPriceBreaks, 
    isUpdating 
  } = useDefaultPriceBreaks(currentOrganization);
  
  const [localPriceBreaks, setLocalPriceBreaks] = useState<{ quantity: number; id?: string }[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local state from fetched data when it becomes available
  useState(() => {
    if (defaultPriceBreaks.length > 0 && !hasChanges) {
      setLocalPriceBreaks(defaultPriceBreaks);
    }
  });

  const handleAddPriceBreak = () => {
    setLocalPriceBreaks(prev => [...prev, { quantity: 1000 }]);
    setHasChanges(true);
  };

  const handleRemovePriceBreak = (index: number) => {
    setLocalPriceBreaks(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleQuantityChange = (index: number, value: string) => {
    const quantity = parseInt(value, 10) || 0;
    setLocalPriceBreaks(prev => 
      prev.map((priceBreak, i) => 
        i === index ? { ...priceBreak, quantity } : priceBreak
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    if (currentOrganization) {
      updateDefaultPriceBreaks(localPriceBreaks);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Default Price Breaks</CardTitle>
          <CardDescription>
            Set default price break quantities for new quote requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Price Breaks</CardTitle>
        <CardDescription>
          Set default price break quantities for new quote requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {localPriceBreaks.length > 0 ? (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Quantity</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localPriceBreaks.map((priceBreak, index) => (
                  <TableRow key={priceBreak.id || `new-${index}`}>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        className="h-8"
                        value={priceBreak.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePriceBreak(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            No default price breaks specified. Add one below.
          </p>
        )}
        
        <div className="flex space-x-2 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddPriceBreak}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Add Price Break
          </Button>
          
          {hasChanges && (
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isUpdating}
            >
              Save Changes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
