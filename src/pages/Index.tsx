
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Printer, ShoppingCart, Truck } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { label: "Active Quotes", value: "12", icon: FileText, color: "text-blue-500" },
    { label: "Open Orders", value: "8", icon: ShoppingCart, color: "text-purple-500" },
    { label: "In Production", value: "5", icon: Printer, color: "text-green-500" },
    { label: "Shipments", value: "3", icon: Truck, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Welcome to PublishFlow</h1>
        <p className="text-gray-600">Manage your book production and delivery process</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
