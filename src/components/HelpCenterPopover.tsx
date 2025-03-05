
import React, { useState } from "react";
import { HelpCircle, Search, Book, BookOpen, MessageCircle, Package as PackageIcon, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Sample help articles data
const HELP_CATEGORIES = [
  {
    id: "getting-started",
    name: "Getting Started",
    icon: BookOpen,
    articles: [
      { id: "gs1", title: "Welcome to PublishFlow", snippet: "Introduction to the platform" },
      { id: "gs2", title: "Setting up your organization", snippet: "Configure your publishing house" },
      { id: "gs3", title: "User roles and permissions", snippet: "Learn about access control" },
    ]
  },
  {
    id: "products",
    name: "Managing Products",
    icon: PackageIcon,
    articles: [
      { id: "p1", title: "Creating a new product", snippet: "Add books to your catalog" },
      { id: "p2", title: "Formatting options", snippet: "Configure book formats" },
      { id: "p3", title: "Managing product metadata", snippet: "ISBN, pricing, and more" },
    ]
  },
  {
    id: "orders",
    name: "Orders & Shipments",
    icon: ShoppingCart,
    articles: [
      { id: "o1", title: "Creating a quote", snippet: "Generate price quotes" },
      { id: "o2", title: "Processing purchase orders", snippet: "From PO to fulfillment" },
      { id: "o3", title: "Tracking shipments", snippet: "Monitor delivery status" },
    ]
  },
];

const HelpCenterPopover = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" side="bottom">
        <div className="p-4 border-b">
          <h3 className="font-medium mb-2">Help Center</h3>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search help articles..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="max-h-[350px] overflow-auto p-4">
          {HELP_CATEGORIES.map((category) => (
            <div key={category.id} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <category.icon className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">{category.name}</h4>
              </div>
              <div className="space-y-2 pl-6">
                {category.articles.map((article) => (
                  <div 
                    key={article.id} 
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                    onClick={() => console.log(`Opening article: ${article.id}`)}
                  >
                    <div className="font-medium text-sm">{article.title}</div>
                    <div className="text-xs text-gray-500">{article.snippet}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-3 border-t flex justify-between items-center">
          <span className="text-xs text-gray-500">Need more help?</span>
          <Button size="sm" className="gap-1 text-xs">
            <MessageCircle className="h-3.5 w-3.5" />
            Contact Support
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HelpCenterPopover;
