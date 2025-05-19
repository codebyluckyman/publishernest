
import { useState, useEffect } from 'react';
import { SelectFilter, FilterOption } from '@/components/common/SelectFilter';
import { UserInfo, fetchUsersByIds } from '@/services/userService';

interface UserFilterProps {
  userIds: string[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function UserFilter({ userIds, value, onValueChange, className }: UserFilterProps) {
  const [options, setOptions] = useState<FilterOption[]>([
    { value: "none", label: "All Users" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      // Only fetch if we have unique user IDs
      if (userIds.length === 0) return;

      // Remove duplicates
      const uniqueUserIds = [...new Set(userIds)];
      
      setIsLoading(true);
      try {
        const usersMap = await fetchUsersByIds(uniqueUserIds);
        
        const userOptions: FilterOption[] = [
          { value: "none", label: "All Users" }
        ];
        
        // Convert to options
        usersMap.forEach((user, userId) => {
          const displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
          userOptions.push({
            value: userId,
            label: displayName
          });
        });
        
        setOptions(userOptions);
      } catch (error) {
        console.error("Error loading users for filter:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsers();
  }, [userIds]);

  return (
    <SelectFilter
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder="Filter by user"
      label="Created By"
      className={className}
    />
  );
}
