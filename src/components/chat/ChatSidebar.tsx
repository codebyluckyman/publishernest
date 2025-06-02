import type React from "react";
import { useState } from "react";
import {
  Search,
  Users,
  Building2,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation } from "./type";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const availableTypes = ["customer", "supplier", "publisher"].filter(
    (type) => type !== currentOrganizationRole
  ) as ("customer" | "supplier" | "publisher")[];

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    availableTypes.reduce((acc, type) => ({ ...acc, [type]: true }), {})
  );

  // Toggle group expansion
  const toggleGroup = (type: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    return (
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conversation.lastMessage &&
        conversation.lastMessage
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
    );
  });

  // Group conversations by type
  const groupedConversations = availableTypes.reduce(
    (acc, type) => {
      acc[type] = filteredConversations.filter((conv) => conv.type === type);
      return acc;
    },
    {} as Record<string, Conversation[]>
  );

  // Calculate unread counts by type
  const unreadCounts = availableTypes.reduce(
    (acc, type) => {
      acc[type] = conversations
        .filter((c) => c.type === type)
        .reduce((total, conversation) => total + conversation.unread, 0);
      return acc;
    },
    {} as Record<string, number>
  );

  // Get icon for each conversation type
  const getIconForType = (type: "customer" | "supplier" | "publisher") => {
    switch (type) {
      case "customer":
        return <Users className="h-4 w-4 mr-2" />;
      case "supplier":
        return <Building2 className="h-4 w-4 mr-2" />;
      case "publisher":
        return <BookOpen className="h-4 w-4 mr-2" />;
    }
  };

  // Format type name for display
  const formatTypeName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1) + "s";
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

        {/* Grouped Conversations */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <ConversationSkeleton key={i} />
              ))}
            </div>
          ) : (
            availableTypes.map((type) => (
              <Collapsible
                key={type}
                open={expandedGroups[type]}
                onOpenChange={() => toggleGroup(type)}
                className="border-b border-gray-100 last:border-b-0"
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-gray-50/80 hover:bg-gray-100/80 cursor-pointer">
                    <div className="flex items-center">
                      {getIconForType(type)}
                      <span className="font-medium text-gray-700">
                        {formatTypeName(type)}
                      </span>
                      {unreadCounts[type] > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-2 bg-rose-500 text-white"
                        >
                          {unreadCounts[type]}
                        </Badge>
                      )}
                    </div>
                    {expandedGroups[type] ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {groupedConversations[type].length > 0 ? (
                    groupedConversations[type].map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isSelected={
                          selectedConversation === conversation.room_id
                        }
                        onClick={() => onSelectConversation(conversation)}
                        currentUser={currentUser}
                      />
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No {type}s found
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))
          )}

          {!isLoading && filteredConversations.length === 0 && (
            <EmptyState
              icon={<Search className="h-8 w-8 text-gray-400" />}
              title="No conversations found"
              description={
                searchQuery
                  ? "No conversations match your search."
                  : "Start a new conversation."
              }
            />
          )}
        </div>
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
            src={conversation?.avatar_url}
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
