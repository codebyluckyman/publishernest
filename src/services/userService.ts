
import { supabase } from "@/integrations/supabase/client";

export interface UserInfo {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Fetches user information by user ID
 * @param userId The ID of the user to fetch
 * @returns A promise that resolves to the user information
 */
export async function fetchUserById(userId: string): Promise<UserInfo | null> {
  if (!userId) return null;
  
  // Query the profiles table which is linked to auth.users
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      first_name,
      last_name
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }

  return data as UserInfo;
}

/**
 * Fetches multiple users by their IDs
 * @param userIds Array of user IDs to fetch
 * @returns A promise that resolves to a map of user IDs to user information
 */
export async function fetchUsersByIds(userIds: string[]): Promise<Map<string, UserInfo>> {
  if (!userIds.length) return new Map();

  // Filter out any duplicate IDs
  const uniqueUserIds = [...new Set(userIds)];
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      first_name,
      last_name
    `)
    .in('id', uniqueUserIds);

  if (error) {
    console.error("Error fetching users:", error);
    return new Map();
  }

  // Create a map of user ID to user info
  const userMap = new Map<string, UserInfo>();
  data?.forEach(user => {
    userMap.set(user.id, user as UserInfo);
  });

  return userMap;
}
