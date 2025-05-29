import type React from "react";
import { useState } from "react";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation } from "./type";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";

interface SidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  selectedConversation: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  currentOrganizationRole: string;
  currentUser: string;
}

const ChatSidebar: React.FC<SidebarProps> = ({
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
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations based on active tab and search query
  const filteredConversations = conversations.filter((conversation) => {
    const matchesTab = conversation.type === activeTab;
    const matchesSearch =
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const unreadCounts = {
    customer: conversations
      .filter((c) => c.type === "customer")
      .reduce((total, conversation) => total + conversation.unread, 0),
    supplier: conversations
      .filter((c) => c.type === "supplier")
      .reduce((total, conversation) => total + conversation.unread, 0),
    publisher: conversations
      .filter((c) => c.type === "publisher")
      .reduce((total, conversation) => total + conversation.unread, 0),
  };

  return (
    <div className="w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200/80 flex flex-col h-full shadow-sm">
      <div className="flex flex-col w-full h-full">
        {/* Search */}
        <div className="relative p-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200/60 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          defaultValue={availableTabs[0]}
          className="w-full flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 p-1.5 bg-gray-50/80 border-b border-gray-100 rounded-none h-auto backdrop-blur-sm">
            {availableTabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="relative text-center text-sm font-semibold py-3.5 px-4 data-[state=active]:text-indigo-700 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/10 text-gray-600 hover:text-gray-800 rounded-lg transition-all duration-300 data-[state=active]:border data-[state=active]:border-indigo-100 hover:bg-white/60"
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {unreadCounts[tab] > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold leading-none rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white min-w-[20px] h-[20px] shadow-lg shadow-rose-500/25">
                    {unreadCounts[tab]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {availableTabs.map((tab) => (
            <TabsContent key={tab} value={tab} className="flex-1 mt-0">
              <div className="flex-1 overflow-auto h-full">
                {isLoading ? (
                  <div className="p-3 space-y-2">
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
                        isSelected={
                          selectedConversation === conversation.room_id
                        }
                        onClick={() => onSelectConversation(conversation)}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Search className="h-8 w-8 text-gray-400" />}
                    title={`No ${activeTab}s found`}
                    description={
                      searchQuery
                        ? `No ${activeTab}s match your search.`
                        : `When ${activeTab}s message you, they'll appear here.`
                    }
                  />
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

// Conversation Item Component with typing indicator
const ConversationItem: React.FC<{
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  currentUser: string;
}> = ({ conversation, isSelected, onClick, currentUser }) => {
  const { typingUsers } = useTypingIndicator(
    conversation.room_id || null,
    currentUser
  );
  const isTyping = typingUsers.length > 0;

  const getOnlineStatusColor = (
    status: "online" | "away" | "offline" | null
  ) => {
    switch (status) {
      case "online":
        return "bg-gradient-to-r from-emerald-400 to-green-500";
      case "away":
        return "bg-gradient-to-r from-amber-400 to-orange-500";
      case "offline":
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500";
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 mx-3 my-1.5 rounded-xl cursor-pointer transition-all duration-300 group relative overflow-hidden ${
        isSelected
          ? "bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border border-indigo-200/60 shadow-lg shadow-indigo-500/10 transform scale-[1.02]"
          : conversation.unread > 0
            ? "bg-gradient-to-r from-blue-50/80 to-white hover:from-blue-50 hover:to-blue-50/50 border border-blue-100/60 hover:border-blue-200/80 hover:shadow-md hover:shadow-blue-500/10"
            : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-white border border-transparent hover:border-gray-200/60 hover:shadow-md hover:shadow-gray-500/10"
      }`}
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12 ring-2 ring-white shadow-lg">
          <AvatarImage
            src={conversation?.avatar_url || "/placeholder.svg"}
            alt={conversation.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 text-indigo-700 font-bold text-sm border border-indigo-200/30">
            {conversation.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {conversation.online_status && (
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-3 border-white shadow-lg ${getOnlineStatusColor(
              conversation.online_status
            )}`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <h3
            className={`font-semibold text-sm truncate ${conversation.unread > 0 ? "text-gray-900" : "text-gray-700"}`}
          >
            {conversation.name}
          </h3>
          <span
            className={`text-xs flex-shrink-0 ml-2 font-medium ${
              conversation.unread > 0 ? "text-indigo-600" : "text-gray-500"
            }`}
          >
            {conversation.time}
          </span>
        </div>
        <p
          className={`text-xs truncate leading-relaxed ${
            conversation.unread > 0
              ? "text-gray-700 font-medium"
              : "text-gray-500"
          }`}
        >
          {isTyping ? (
            <span className="text-indigo-600 font-medium italic">
              {typingUsers[0].name} is typing...
            </span>
          ) : (
            conversation.lastMessage || "No messages yet"
          )}
        </p>
      </div>
      {conversation.unread > 0 && (
        <div className="flex-shrink-0 flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30">
          <span className="text-xs font-bold">{conversation.unread}</span>
        </div>
      )}
    </div>
  );
};

// Conversation Skeleton Component
const ConversationSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 mx-3 my-1.5 rounded-xl bg-gradient-to-r from-gray-50 to-white">
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex-shrink-0" />
      <div className="space-y-2.5 flex-1">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
          <div className="h-3 w-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
        </div>
        <div className="h-3 w-36 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
      </div>
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
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="font-bold text-gray-800 text-lg mb-3">{title}</h3>
      <p className="text-sm text-gray-600 text-center leading-relaxed max-w-52 font-medium">
        {description}
      </p>
    </div>
  );
};

export default ChatSidebar;
