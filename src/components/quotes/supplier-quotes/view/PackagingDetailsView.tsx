
import { SupplierQuote } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

interface PackagingDetailsViewProps {
  quote: SupplierQuote;
}

export function PackagingDetailsView({ quote }: PackagingDetailsViewProps) {
  // Check if packaging details exist
  const hasPackagingDetails = 
    quote.packaging_carton_quantity || 
    quote.packaging_carton_weight || 
    quote.packaging_carton_length || 
    quote.packaging_carton_width || 
    quote.packaging_carton_height || 
    quote.packaging_carton_volume || 
    quote.packaging_cartons_per_pallet || 
    quote.packaging_copies_per_20ft_palletized || 
    quote.packaging_copies_per_40ft_palletized || 
    quote.packaging_copies_per_20ft_unpalletized || 
    quote.packaging_copies_per_40ft_unpalletized;
    
  if (!hasPackagingDetails) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Packaging Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm italic">No packaging details provided</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Packaging Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium mb-3">Carton Information</h3>
            <div className="space-y-2">
              {quote.packaging_carton_quantity && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quantity:</span>
                  <span className="text-sm font-medium">{quote.packaging_carton_quantity} copies per carton</span>
                </div>
              )}
              
              {quote.packaging_carton_weight && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Weight:</span>
                  <span className="text-sm font-medium">{quote.packaging_carton_weight} kg</span>
                </div>
              )}
              
              {(quote.packaging_carton_length || quote.packaging_carton_width || quote.packaging_carton_height) && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dimensions (L×W×H):</span>
                  <span className="text-sm font-medium">
                    {quote.packaging_carton_length || '-'} × {quote.packaging_carton_width || '-'} × {quote.packaging_carton_height || '-'} cm
                  </span>
                </div>
              )}
              
              {quote.packaging_carton_volume && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volume:</span>
                  <span className="text-sm font-medium">{quote.packaging_carton_volume} m³</span>
                </div>
              )}
              
              {quote.packaging_cartons_per_pallet && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cartons per Pallet:</span>
                  <span className="text-sm font-medium">{quote.packaging_cartons_per_pallet}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-3">Container Capacity</h3>
            <div className="space-y-4">
              {(quote.packaging_copies_per_20ft_palletized || quote.packaging_copies_per_40ft_palletized) && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Palletized</h4>
                  <div className="space-y-2">
                    {quote.packaging_copies_per_20ft_palletized && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">20ft Container:</span>
                        <span className="text-sm font-medium">{quote.packaging_copies_per_20ft_palletized} copies</span>
                      </div>
                    )}
                    
                    {quote.packaging_copies_per_40ft_palletized && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">40ft Container:</span>
                        <span className="text-sm font-medium">{quote.packaging_copies_per_40ft_palletized} copies</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {(quote.packaging_copies_per_20ft_unpalletized || quote.packaging_copies_per_40ft_unpalletized) && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Unpalletized</h4>
                  <div className="space-y-2">
                    {quote.packaging_copies_per_20ft_unpalletized && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">20ft Container:</span>
                        <span className="text-sm font-medium">{quote.packaging_copies_per_20ft_unpalletized} copies</span>
                      </div>
                    )}
                    
                    {quote.packaging_copies_per_40ft_unpalletized && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">40ft Container:</span>
                        <span className="text-sm font-medium">{quote.packaging_copies_per_40ft_unpalletized} copies</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
