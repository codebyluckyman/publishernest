
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Box } from "lucide-react";

const ProductCategories = () => {
  const productCategories = [
    { name: "Hardcover Books", count: 0, icon: Package, color: "text-emerald-500" },
    { name: "Paperback Books", count: 0, icon: Package, color: "text-blue-500" },
    { name: "Journals", count: 0, icon: Box, color: "text-purple-500" },
    { name: "Custom Publications", count: 0, icon: Box, color: "text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {productCategories.map((category) => (
        <Card key={category.name} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {category.name}
            </CardTitle>
            <category.icon className={`w-5 h-5 ${category.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{category.count}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductCategories;
