
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "sonner";

interface ProductPrice {
  id: string;
  currency_code: string;
  price: number;
  is_default: boolean;
}

interface PricingSectionProps {
  form: UseFormReturn<ProductFormValues>;
  productId?: string;
  readOnly?: boolean;
}

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "NOK", label: "NOK - Norwegian Krone" },
  { value: "DKK", label: "DKK - Danish Krone" },
  { value: "PLN", label: "PLN - Polish Zloty" },
  { value: "CZK", label: "CZK - Czech Koruna" },
  { value: "HUF", label: "HUF - Hungarian Forint" },
  { value: "RUB", label: "RUB - Russian Ruble" },
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
  { value: "HKD", label: "HKD - Hong Kong Dollar" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "KRW", label: "KRW - South Korean Won" },
  { value: "TRY", label: "TRY - Turkish Lira" },
  { value: "ZAR", label: "ZAR - South African Rand" },
  { value: "NZD", label: "NZD - New Zealand Dollar" },
];

export function PricingSection({ form, productId, readOnly = false }: PricingSectionProps) {
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [newPrice, setNewPrice] = useState<number | null>(null);
  const [newCurrency, setNewCurrency] = useState<string>("USD");
  const [isLoading, setIsLoading] = useState(false);
  const { currentOrganization } = useOrganization();
  
  // Get the list of already used currencies
  const usedCurrencies = prices.map(price => price.currency_code);
  
  // Filter available currencies to exclude ones already in use
  const availableCurrencies = CURRENCY_OPTIONS.filter(
    currency => !usedCurrencies.includes(currency.value)
  );

  // Fetch existing prices when the component loads
  useEffect(() => {
    if (productId) {
      fetchProductPrices();
    }
  }, [productId]);

  const fetchProductPrices = async () => {
    if (!productId || !currentOrganization) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_prices")
        .select("*")
        .eq("product_id", productId)
        .eq("organization_id", currentOrganization.id);
      
      if (error) throw error;
      setPrices(data as ProductPrice[]);
    } catch (error: any) {
      console.error("Error fetching prices:", error);
      toast.error("Failed to load price information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPrice = async () => {
    if (!productId || !newCurrency || newPrice === null || !currentOrganization) {
      toast.error("Please select a currency and enter a price");
      return;
    }
    
    setIsLoading(true);
    try {
      // Check if this is the first price entry - if so, make it default
      const isDefault = prices.length === 0;
      
      const { data, error } = await supabase
        .from("product_prices")
        .insert({
          product_id: productId,
          organization_id: currentOrganization.id,
          currency_code: newCurrency,
          price: newPrice,
          is_default: isDefault
        })
        .select();
      
      if (error) throw error;
      
      // Update the local state with the new price
      if (data && data.length > 0) {
        setPrices([...prices, data[0] as ProductPrice]);
        setNewPrice(null);
        setNewCurrency(availableCurrencies[0]?.value || "USD");
        toast.success("Price added successfully");
      }
    } catch (error: any) {
      console.error("Error adding price:", error);
      toast.error("Failed to add price");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePrice = async (priceId: string) => {
    if (!productId || !currentOrganization) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("product_prices")
        .delete()
        .eq("id", priceId);
      
      if (error) throw error;
      
      // Update the local state by removing the deleted price
      setPrices(prices.filter(price => price.id !== priceId));
      toast.success("Price removed successfully");
    } catch (error: any) {
      console.error("Error removing price:", error);
      toast.error("Failed to remove price");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (priceId: string) => {
    if (!productId || !currentOrganization) return;
    
    setIsLoading(true);
    try {
      // First, remove default status from all prices
      await supabase
        .from("product_prices")
        .update({ is_default: false })
        .eq("product_id", productId);
      
      // Then set the selected price as default
      const { error } = await supabase
        .from("product_prices")
        .update({ is_default: true })
        .eq("id", priceId);
      
      if (error) throw error;
      
      // Update the local state
      setPrices(prices.map(price => ({
        ...price,
        is_default: price.id === priceId
      })));
      
      toast.success("Default price updated");
    } catch (error: any) {
      console.error("Error setting default price:", error);
      toast.error("Failed to set default price");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (currencyCode: string, price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currencyCode 
    }).format(price);
  };

  const getCurrencyLabel = (code: string) => {
    const currency = CURRENCY_OPTIONS.find(c => c.value === code);
    return currency ? currency.label : code;
  };

  if (!productId) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Pricing</h3>
        <p className="text-sm text-muted-foreground">
          Additional pricing options will be available after saving the product.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Pricing</h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manage RRPs</CardTitle>
        </CardHeader>
        <CardContent>
          {prices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Default</TableHead>
                  {!readOnly && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.map(price => (
                  <TableRow key={price.id}>
                    <TableCell>{getCurrencyLabel(price.currency_code)}</TableCell>
                    <TableCell>{formatCurrency(price.currency_code, price.price)}</TableCell>
                    <TableCell>
                      {price.is_default ? (
                        <span className="text-green-600 font-medium">Default</span>
                      ) : (
                        !readOnly && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSetDefault(price.id)}
                            disabled={isLoading}
                          >
                            Set as default
                          </Button>
                        )
                      )}
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePrice(price.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No prices added yet.</p>
          )}

          {!readOnly && availableCurrencies.length > 0 && (
            <div className="mt-4 flex items-end space-x-2">
              <div className="w-1/3">
                <label className="text-sm mb-1 block">Currency</label>
                <Select
                  value={newCurrency}
                  onValueChange={setNewCurrency}
                  disabled={isLoading || availableCurrencies.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-1/3">
                <label className="text-sm mb-1 block">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newPrice === null ? '' : newPrice}
                  onChange={e => setNewPrice(e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={isLoading}
                />
              </div>
              
              <Button
                onClick={handleAddPrice}
                disabled={isLoading || !newCurrency || newPrice === null || availableCurrencies.length === 0}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Price
              </Button>
            </div>
          )}
          
          {!readOnly && availableCurrencies.length === 0 && (
            <p className="text-sm text-amber-600 mt-4">
              All available currencies have been added. To add a new price, remove an existing one first.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
