import type React from "react";
import { useState } from "react";
import { Search } from "lucide-react";
import { Conversation } from "./type";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuid } from "uuid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  currentOrganizationRole: string;
  currentUser: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  isLoading,
  selectedConversation,
  onSelectConversation,
  currentOrganizationRole,
  currentUser,
}) => {
  const availableTabs = ["customer", "supplier", "publisher"].filter(
    (tab) => tab !== currentOrganizationRole
  ) as ("customer" | "supplier" | "publisher")[];

  const [activeTab, setActiveTab] = useState<
    "customer" | "supplier" | "publisher"
  >(availableTabs[0]);

  // Filter conversations based on active tab
  const filteredConversations = conversations.filter((conversation) => {
    return conversation.type === activeTab;
  });

  const unreadCounts = {
    customers: conversations
      .filter((c) => c.type === "customer")
      .reduce((total, conversation) => total + conversation.unread, 0),
    suppliers: conversations
      .filter((c) => c.type === "supplier")
      .reduce((total, conversation) => total + conversation.unread, 0),
    publishers: conversations
      .filter((c) => c.type === "publisher")
      .reduce((total, conversation) => total + conversation.unread, 0),
  };

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col">
      <div className="flex flex-col w-full">
        <Tabs defaultValue={availableTabs[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-0 bg-transparent border-gray-200 rounded-none">
            {availableTabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="text-center text-md p-2 data-[state=active]:text-indigo-600 border-b data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:shadow-none text-gray-500 hover:text-gray-700 rounded-none"
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {unreadCounts[tab] > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-indigo-500 text-white min-w-[20px]">
                    {unreadCounts[tab]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {availableTabs.map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="flex-1 overflow-auto">
                {isLoading ? (
                  <div className="p-3 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <ConversationSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div className="h-full overflow-auto">
                    {filteredConversations.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isSelected={selectedConversation === conversation.id}
                        onClick={() => onSelectConversation(conversation.id)}
                        id={conversation.id}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Search className="h-8 w-8 text-gray-400" />}
                    title={`No ${activeTab} yet`}
                    description={`When ${activeTab} message you, they'll appear here.`}
                  />
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        {/* Search */}
        <div className="relative p-2 border-b border-gray-200">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by contact or IP"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

// Conversation Item Component
const ConversationItem: React.FC<{
  conversation: Conversation;
  isSelected: boolean;
  id: string;
  onClick: () => void;
  currentUser: string;
}> = ({ conversation, isSelected, onClick, id, currentUser }) => {
  const navigate = useNavigate();

  const room_id = uuid();

  const ensureConversationPair = async (
    currentUserId: string,
    memberId: string,
    conversationId: string
  ) => {
    const { data, error } = await supabase
      .from("conversations")
      .select("room_id, user_id")
      .in("user_id", [currentUserId, memberId]);

    if (error) {
      console.error("Error checking conversations:", error);
      return;
    }

    const roomUserCount: Record<string, Set<string>> = {};
    data.forEach(({ room_id, user_id }) => {
      if (!roomUserCount[room_id]) roomUserCount[room_id] = new Set();
      roomUserCount[room_id].add(user_id);
    });

    const existingRoomId = Object.entries(roomUserCount).find(
      ([, users]) => users.has(currentUserId) && users.has(memberId)
    )?.[0];

    let room_id: string;

    if (existingRoomId) {
      room_id = existingRoomId;
    } else {
      room_id = uuid();

      const { error: insertError } = await supabase
        .from("conversations")
        .insert([
          {
            room_id,
            user_id: currentUserId,
            last_message_id: null,
            last_message_read_id: null,
          },
          {
            room_id,
            user_id: memberId,
            last_message_id: null,
            last_message_read_id: null,
          },
        ]);

      if (insertError) {
        console.error("Error creating conversations:", insertError);
        return;
      }
    }

    navigate(`/chat/${room_id}`);
  };

  const handleClick = async () => {
    try {
      await ensureConversationPair(currentUser, conversation.id, id);
      onClick();
    } catch (error) {
      console.error("Error handling conversation click:", error);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? "bg-indigo-50" : ""
      } ${conversation.unread > 0 ? "bg-indigo-50/50" : ""}`}
      onClick={handleClick}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage
            src={conversation?.avatar_url}
            alt={conversation.name}
            className="bg-indigo-100"
          />
          <AvatarFallback>
            {conversation.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        {conversation.online_status && (
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${
              conversation.online_status === "online"
                ? "bg-green-500"
                : conversation.online_status === "away"
                ? "bg-yellow-500"
                : "bg-gray-500"
            }  border-2 border-white`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col items-start justify-between">
          <h3
            className={`font-medium text-sm ${
              conversation.unread > 0 ? "font-semibold text-gray-900" : ""
            }`}
          >
            {conversation.name}
          </h3>
          {/* <span className="text-xs text-gray-500">{conversation.time}</span> */}
        </div>
        <p
          className={`text-xs truncate mt-1 ${
            conversation.unread > 0 ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {conversation.lastMessage}
        </p>
      </div>
      {conversation.unread > 0 && (
        <div className="flex-shrink-0 flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white">
          <span className="text-xs font-medium">{conversation.unread}</span>
        </div>
      )}
    </div>
  );
};

// Conversation Skeleton Component
const ConversationSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="bg-gray-100 rounded-full p-6 mb-4">{icon}</div>
      <h3 className="font-medium text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500 text-center mt-2">{description}</p>
    </div>
  );
};

export default Sidebar;
