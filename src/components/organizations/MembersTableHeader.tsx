
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { SelectFilter, FilterOption } from "@/components/common/SelectFilter";

interface MembersTableHeaderProps {
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onMemberTypeFilterChange: (value: string) => void;
  roleFilter: string;
  memberTypeFilter: string;
}

export const MembersTableHeader = ({
  onSearchChange,
  onRoleFilterChange,
  onMemberTypeFilterChange,
  roleFilter,
  memberTypeFilter,
}: MembersTableHeaderProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const roleOptions: FilterOption[] = [
    { value: "all", label: "All Roles" },
    { value: "owner", label: "Owner" },
    { value: "admin", label: "Admin" },
    { value: "member", label: "Member" }
  ];

  const memberTypeOptions: FilterOption[] = [
    { value: "all", label: "All Types" },
    { value: "publisher", label: "Publisher" },
    { value: "customer", label: "Customer" },
    { value: "supplier", label: "Supplier" }
  ];

  return (
    <div className="mb-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search members..."
            className="pl-8"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>
      
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-2">
          <SelectFilter
            value={roleFilter}
            onValueChange={onRoleFilterChange}
            options={roleOptions}
            placeholder="Filter by role"
            label="Role"
          />
          <SelectFilter
            value={memberTypeFilter}
            onValueChange={onMemberTypeFilterChange}
            options={memberTypeOptions}
            placeholder="Filter by type"
            label="Member Type"
          />
        </div>
      )}
    </div>
  );
};
