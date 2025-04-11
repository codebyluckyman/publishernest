
import { useQuery } from "@tanstack/react-query";
import { useOrganization } from "@/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Book } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ActiveProductsCardProps {
  onClick: () => void;
}

const ActiveProductsCard = ({ onClick }: ActiveProductsCardProps) => {
  const { currentOrganization } = useOrganization();

  const { data: activeProductCount = 0, isLoading } = useQuery({
    queryKey: ["active-products-count", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return 0;

      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", currentOrganization.id)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching active products:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!currentOrganization,
  });

  return (
    <Card
      className="flex flex-col justify-between h-full hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="pt-6 flex items-center justify-center flex-col text-center h-full">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Book className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold text-xl mb-1">Active Products</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <p className="text-3xl font-bold text-primary">{activeProductCount}</p>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3 border-t">
        <Button variant="ghost" className="w-full justify-start p-0" onClick={onClick}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActiveProductsCard;
