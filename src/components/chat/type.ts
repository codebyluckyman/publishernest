// Chat-specific types that align with Supabase database structure
export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  online_status: "online" | "away" | "offline" | null;
  unread: number;
  role?: string;
  type: "customer" | "supplier" | "publisher";
  visitorId?: string;
  phone?: string;
  email?: string;
  location?: string;
  lastActive?: string;
  joinedDate?: string;
  tags?: string[];
  avatar_url?: string;
  room_id?: string;
}

export interface Message {
  id: number | string;
  content: string;
  sender: string;
  time: string;
  date: string;
  status?: "sent" | "delivered" | "read";
  attachments?: {
    type: string;
    name?: string;
    size?: number;
    url?: string;
  }[];
  read_by?: string[]; // Array of user IDs who have read this message
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
  email?: string;
  phone?: string;
  location?: string;
  role?: string;
  lastActive?: string;
  joinedDate?: string;
  tags?: string[];
  type: "customer" | "supplier" | "publisher";
  visitorId?: string;
  avatar_url?: string;
}

export interface ChatComponentProps {
  currentOrganization?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    email: string;
  };
}
