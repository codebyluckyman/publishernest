import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganization } from "@/hooks/useOrganization";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
import { useSuppliersApi } from "@/hooks/useSuppliersApi";
import { QuoteRequestTable } from "@/components/quotes/QuoteRequestTable";
import { QuoteRequestDialog } from "@/components/quotes/QuoteRequestDialog";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import QuoteFilters from "@/components/quotes/QuoteFilters";

import { supabase } from "@/integrations/supabase/client";
import { OrganizationMember } from "@/types/organization";
import { debounce } from "lodash";

interface FilterState {
  title: string;
  supplier: string;
  formats: string;
  quote_requests: string;
  users: string;
}

type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

const QuoteRequests = () => {
  const { currentOrganization, getOrganizationMembers } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState(searchQuery);

  const [activeTab, setActiveTab] = useState("pending");
  const location = useLocation();
  const navigate = useNavigate();

  const [members, setMembers] = useState<
    (OrganizationMember & { profile?: UserProfile })[]
  >([]);

  const [users, setUsers] = useState("");
  const [supplier, setSupplier] = useState("");

  const debouncedSetSearchQuery = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 500),
    [setSearchQuery]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearchQuery(value);
  };

  // Check for tab parameter in URL query string when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get("tab");
    if (
      tabParam &&
      ["pending", "approved", "declined", "all"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const { useQuoteRequestsList } = useQuoteRequests();
  const { data: suppliers = [], isLoading: isSuppliersLoading } =
    useSuppliersApi(currentOrganization);
  const {
    data: quoteRequests = [],
    isLoading: isQuoteRequestsLoading,
    refetch,
  } = useQuoteRequestsList(
    currentOrganization,
    activeTab !== "all" ? activeTab : undefined,
    searchQuery,
    users,
    supplier
  );

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const handleQuoteRequestSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const navigateToQuotes = useCallback(() => {
    navigate("/quotes");
  }, [navigate]);

  useEffect(() => {
    refetch();
  }, [users, supplier, refetch]);

  useEffect(() => {
    if (!currentOrganization) return;

    const fetchMembers = async () => {
      try {
        const memberData = await getOrganizationMembers(currentOrganization.id);

        const memberIds = memberData.map((m) => m.auth_user_id);

        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, email, first_name, last_name, avatar_url")
          .in("id", memberIds);

        if (error) throw error;

        const membersWithProfiles = memberData.map((member) => {
          const profile = profiles?.find((p) => p.id === member.auth_user_id);
          return { ...member, profile };
        });

        setMembers(membersWithProfiles);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, [currentOrganization, getOrganizationMembers]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Quote Requests</h1>
        <p className="text-gray-600">
          Create and manage quote requests to suppliers
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex space-x-2">
              <QuoteRequestDialog
                suppliers={suppliers}
                onSuccess={handleQuoteRequestSuccess}
              />
              <Button variant="outline" onClick={navigateToQuotes}>
                <FileText className="mr-2 h-4 w-4" />
                View All Supplier Quotes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center w-full">
                <Input
                  placeholder="Search quote requests..."
                  value={inputValue}
                  onChange={handleInputChange}
                  className="max-w-sm"
                />
                <QuoteFilters
                  filterOption="supplier"
                  options={suppliers?.map((supplier) => ({
                    value: supplier.id,
                    label: supplier.supplier_name,
                  }))}
                  value={supplier}
                  isLoading={isSuppliersLoading}
                  // onChange={(value) => handleFilterChange("supplier", value)}
                  onChange={(value) => setSupplier(value)}
                />
                <QuoteFilters
                  filterOption="users"
                  options={members?.map((member) => ({
                    value: member.auth_user_id,
                    label:
                      member.profile?.first_name +
                      " " +
                      member?.profile?.last_name,
                  }))}
                  value={users}
                  isLoading={isSuppliersLoading}
                  onChange={(value) => setUsers(value)}
                />
              </div>
              {(users || supplier) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setUsers("");
                    setSupplier("");
                  }}
                >
                  Reset Filters
                </Button>
              )}
            </div>
            <Tabs
              value={activeTab}
              className="space-y-4"
              onValueChange={handleTabChange}
            >
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Active</TabsTrigger>
                <TabsTrigger value="declined">Inactive</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="space-y-4">
                <QuoteRequestTable
                  quoteRequests={quoteRequests}
                  isLoading={isQuoteRequestsLoading}
                />
              </TabsContent>
              <TabsContent value="approved" className="space-y-4">
                <QuoteRequestTable
                  quoteRequests={quoteRequests}
                  isLoading={isQuoteRequestsLoading}
                />
              </TabsContent>
              <TabsContent value="declined" className="space-y-4">
                <QuoteRequestTable
                  quoteRequests={quoteRequests}
                  isLoading={isQuoteRequestsLoading}
                />
              </TabsContent>
              <TabsContent value="all" className="space-y-4">
                <QuoteRequestTable
                  quoteRequests={quoteRequests}
                  isLoading={isQuoteRequestsLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuoteRequests;
