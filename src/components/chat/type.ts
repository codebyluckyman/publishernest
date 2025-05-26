// Shared types for the chat application
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
  online_status: "online" | "away" | "offline";
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
}

export interface Message {
  id: number | string;
  content: string;
  sender: string;
  time: string;
  date: string;
  attachments?: {
    type: string;
    name?: string;
    size?: number;
    url?: string;
  }[];
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
  type: "customer" | "supplier";
  visitorId?: string;
}
