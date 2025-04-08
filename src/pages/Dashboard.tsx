
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Printer, ShoppingCart, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { currentOrganization } = useOrganization();
  const [quoteRequestsCount, setQuoteRequestsCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuoteRequestsCount = async () => {
      if (!currentOrganization) return;
      
      try {
        setIsLoading(true);
        const { count, error } = await supabase
          .from("quote_requests")
          .select("id", { count: "exact" })
          .eq("organization_id", currentOrganization.id)
          .eq("status", "approved"); // Only count active (approved) quote requests
        
        if (error) {
          console.error("Error fetching quote requests count:", error);
          return;
        }
        
        setQuoteRequestsCount(count);
      } catch (error) {
        console.error("Error fetching quote requests count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuoteRequestsCount();
  }, [currentOrganization]);

  // Handle navigation to the specific page based on card
  const handleCardClick = (destination: string, tab?: string) => {
    if (tab) {
      navigate(`/${destination}?tab=${tab}`);
    } else {
      navigate(`/${destination}`);
    }
  };

  const stats = [
    { 
      label: "Active Quote Requests", 
      value: isLoading ? "..." : (quoteRequestsCount !== null ? quoteRequestsCount.toString() : "0"), 
      icon: FileText, 
      color: "text-blue-500",
      destination: "quote-requests",
      tab: "approved"
    },
    { label: "Open Orders", value: "8", icon: ShoppingCart, color: "text-purple-500", destination: "purchase-orders" },
    { label: "In Production", value: "5", icon: Printer, color: "text-green-500", destination: "print-runs" },
    { label: "Shipments", value: "3", icon: Truck, color: "text-orange-500", destination: "shipments" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Welcome to PublishFlow</h1>
        <p className="text-gray-600">Manage your book production and delivery process</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card 
            key={stat.label} 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => handleCardClick(stat.destination, stat.tab)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Quotes</CardTitle>
            <CardDescription>Latest quote requests and responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">No quotes available</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>Currently processing purchase orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">No orders available</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
