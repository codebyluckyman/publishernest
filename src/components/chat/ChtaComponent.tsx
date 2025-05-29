import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuid } from "uuid";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/context/AuthContext";
import ChatSidebar from "./ChatSidebar";
import { Contact, Conversation, Message } from "./type";
import ChatView from "./Chatview";

const ChatComponent: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const { room_id } = useParams();
  const navigate = useNavigate();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Set selected conversation from URL
  useEffect(() => {
    if (room_id) {
      setSelectedConversation(room_id);
    }
  }, [room_id]);

  // Fetch current user role
  useEffect(() => {
    if (!currentOrganization?.id || !user?.id) return;

    const getCurrentUserRole = async () => {
      try {
        const { data: organizationData, error } = await supabase
          .from("organization_members")
          .select("member_type")
          .eq("organization_id", currentOrganization.id)
          .eq("auth_user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          return;
        }

        if (organizationData) {
          setCurrentUserRole(organizationData.member_type);
        }
      } catch (error) {
        console.error("Error in getCurrentUserRole:", error);
      }
    };

    getCurrentUserRole();
  }, [user?.id, currentOrganization?.id]);

  // Calculate unread count
  const calculateUnreadCount = useCallback(
    async (roomId: string, userId: string): Promise<number> => {
      try {
        const { data: unreadMessages, error } = await supabase
          .from("communications")
          .select("id")
          .eq("room_id", roomId)
          .neq("sender_id", userId);

        if (error) {
          console.error("Error fetching messages:", error);
          return 0;
        }

        if (!unreadMessages?.length) return 0;

        const messageIds = unreadMessages.map((m) => m.id);

        const { data: readMessages, error: readError } = await supabase
          .from("message_reads")
          .select("message_id")
          .eq("user_id", userId)
          .in("message_id", messageIds);

        if (readError) {
          console.error("Error fetching read messages:", readError);
          return 0;
        }

        const readMessageIds = new Set(
          readMessages?.map((r) => r.message_id) || []
        );
        return unreadMessages.filter((m) => !readMessageIds.has(m.id)).length;
      } catch (error) {
        console.error("Error calculating unread count:", error);
        return 0;
      }
    },
    []
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (roomId: string) => {
      if (!user?.id) return;

      try {
        // Get all unread messages in this room
        const { data: roomMessages } = await supabase
          .from("communications")
          .select("id")
          .eq("room_id", roomId)
          .neq("sender_id", user.id);

        if (!roomMessages?.length) return;

        // Get already read messages
        const { data: readMessages } = await supabase
          .from("message_reads")
          .select("message_id")
          .eq("user_id", user.id)
          .in(
            "message_id",
            roomMessages.map((m) => m.id)
          );

        const readMessageIds = new Set(
          readMessages?.map((r) => r.message_id) || []
        );
        const unreadMessages = roomMessages.filter(
          (m) => !readMessageIds.has(m.id)
        );

        if (!unreadMessages.length) return;

        // Mark unread messages as read using upsert
        for (const message of unreadMessages) {
          try {
            await supabase.from("message_reads").upsert({
              message_id: message.id,
              user_id: user.id,
              read_at: new Date().toISOString(),
            });
          } catch (error) {
            console.error(
              `Error marking message ${message.id} as read:`,
              error
            );
          }
        }

        // Update conversations table with last read message
        if (unreadMessages.length > 0) {
          const latestMessageId = unreadMessages[0].id;
          await supabase
            .from("conversations")
            .update({ last_message_read_id: latestMessageId })
            .eq("room_id", roomId)
            .eq("user_id", user.id);
        }

        // Update local state
        setConversations((prev) =>
          prev.map((conv) =>
            conv.room_id === roomId ? { ...conv, unread: 0 } : conv
          )
        );

        setMessages((prev) =>
          prev.map((msg) => {
            if (unreadMessages.some((m) => m.id === msg.id)) {
              return {
                ...msg,
                read_by: [...(msg.read_by || []), user.id],
                status: msg.sender === user.id ? "read" : msg.status,
              };
            }
            return msg;
          })
        );
      } catch (error) {
        console.error("Error in markMessagesAsRead:", error);
      }
    },
    [user?.id]
  );

  // Fetch conversations with optimized queries
  const fetchConversations = useCallback(async () => {
    if (!currentOrganization?.id || !currentUserRole || !user?.id) return;

    setIsLoadingConversations(true);
    try {
      // Get organization members (excluding current user)
      const { data: memberData } = await supabase
        .from("organization_members")
        .select("auth_user_id, member_type")
        .eq("organization_id", currentOrganization.id)
        .neq("auth_user_id", user.id);

      if (!memberData?.length) {
        setConversations([]);
        return;
      }

      const userIds = memberData.map((member) => member.auth_user_id);

      // Fetch profiles and conversations in parallel
      const [profilesResponse, allConversationsResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, first_name, last_name, email, avatar_url, online_status, created_at"
          )
          .in("id", userIds),
        supabase
          .from("conversations")
          .select("room_id, user_id, last_message_id, created_at"),
      ]);

      const profileData = profilesResponse.data || [];
      const allConversations = allConversationsResponse.data || [];

      // Find rooms where current user participates
      const userRooms = allConversations
        .filter((conv) => conv.user_id === user.id)
        .map((conv) => conv.room_id);

      // Group conversations by room
      const roomParticipants: Record<string, string[]> = {};
      allConversations.forEach((conv) => {
        if (userRooms.includes(conv.room_id)) {
          if (!roomParticipants[conv.room_id]) {
            roomParticipants[conv.room_id] = [];
          }
          roomParticipants[conv.room_id].push(conv.user_id);
        }
      });

      // Get last messages and unread counts in parallel
      const [lastMessages, unreadCounts] = await Promise.all([
        Promise.all(
          userRooms.map(async (roomId) => {
            const { data: messageData } = await supabase
              .from("communications")
              .select("message, created_at, sender_id")
              .eq("room_id", roomId)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            return {
              roomId,
              message: messageData?.message || "",
              created_at: messageData?.created_at,
              sender_id: messageData?.sender_id,
            };
          })
        ),
        Promise.all(
          userRooms.map(async (roomId) => ({
            roomId,
            unreadCount: await calculateUnreadCount(roomId, user.id),
          }))
        ),
      ]);

      // Build conversations list
      const formattedConversations: Conversation[] = memberData
        .filter((member) => member.member_type !== currentUserRole)
        .map((member) => {
          const profile = profileData.find((p) => p.id === member.auth_user_id);
          if (!profile) return null;

          // Find room between current user and this member
          const roomId = Object.entries(roomParticipants).find(
            ([, participants]) =>
              participants.includes(user.id) &&
              participants.includes(member.auth_user_id)
          )?.[0];

          const lastMessage = lastMessages.find((msg) => msg.roomId === roomId);
          const unreadData = unreadCounts.find((uc) => uc.roomId === roomId);

          const online_status: "online" | "away" | "offline" =
            (profile.online_status as "online" | "away" | "offline") ||
            "offline";

          return {
            id: member.auth_user_id,
            name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
            avatar_url: profile.avatar_url,
            email: profile.email,
            type: member.member_type as "customer" | "supplier" | "publisher",
            online_status,
            room_id: roomId,
            lastMessage: lastMessage?.message || "",
            time: lastMessage?.created_at
              ? new Date(lastMessage.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            unread: unreadData?.unreadCount || 0,
            joinedDate: profile.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : undefined,
          };
        })
        .filter(Boolean)
        .sort((a, b) => {
          const aTime = lastMessages.find(
            (msg) => msg.roomId === a.room_id
          )?.created_at;
          const bTime = lastMessages.find(
            (msg) => msg.roomId === b.room_id
          )?.created_at;

          if (!aTime && !bTime) return 0;
          if (!aTime) return 1;
          if (!bTime) return -1;

          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });

      setConversations(formattedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [
    currentOrganization?.id,
    currentUserRole,
    user?.id,
    calculateUnreadCount,
  ]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load contact info when room_id changes or when conversations are loaded
  useEffect(() => {
    if (room_id && conversations.length > 0) {
      const conversation = conversations.find(
        (conv) => conv.room_id === room_id
      );
      if (conversation) {
        setContact({
          id: conversation.id,
          name: conversation.name,
          online: conversation.online_status === "online",
          type: conversation.type,
          email: conversation.email,
          avatar_url: conversation.avatar_url,
          joinedDate: conversation.joinedDate,
        });
      }
    }
  }, [room_id, conversations]);

  // Handle conversation selection
  const handleSelectConversation = useCallback(
    async (conversation: Conversation) => {
      if (!user?.id) return;

      try {
        let roomId = conversation.room_id;

        // Create room if it doesn't exist
        if (!roomId) {
          // Check for existing room
          const { data: existingConversations } = await supabase
            .from("conversations")
            .select("room_id, user_id")
            .in("user_id", [user.id, conversation.id]);

          // Find room with both users
          const roomUserCount: Record<string, Set<string>> = {};
          existingConversations?.forEach(({ room_id, user_id }) => {
            if (!roomUserCount[room_id]) roomUserCount[room_id] = new Set();
            roomUserCount[room_id].add(user_id);
          });

          const existingRoomId = Object.entries(roomUserCount).find(
            ([, users]) => users.has(user.id) && users.has(conversation.id)
          )?.[0];

          if (existingRoomId) {
            roomId = existingRoomId;
          } else {
            // Create new room
            roomId = uuid();
            const { error: insertError } = await supabase
              .from("conversations")
              .insert([
                {
                  room_id: roomId,
                  user_id: user.id,
                  last_message_id: null,
                  last_message_read_id: null,
                },
                {
                  room_id: roomId,
                  user_id: conversation.id,
                  last_message_id: null,
                  last_message_read_id: null,
                },
              ]);

            if (insertError) {
              console.error("Error creating conversations:", insertError);
              return;
            }
          }

          // Update conversation in state
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversation.id ? { ...conv, room_id: roomId } : conv
            )
          );
        }

        // Set contact info
        setContact({
          id: conversation.id,
          name: conversation.name,
          online: conversation.online_status === "online",
          type: conversation.type,
          email: conversation.email,
          avatar_url: conversation.avatar_url,
          joinedDate: conversation.joinedDate,
        });

        // Navigate and mark as read
        navigate(`/chat/${roomId}`);
        setSelectedConversation(roomId);

        if (roomId) {
          await markMessagesAsRead(roomId);
        }
      } catch (error) {
        console.error("Error handling conversation selection:", error);
      }
    },
    [user?.id, navigate, markMessagesAsRead]
  );

  // Handle sending message (supports file-only messages)
  const handleSendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      if (
        !selectedConversation ||
        (!content.trim() && !attachments?.length) ||
        !user?.id ||
        !room_id
      )
        return;

      // Optimistic UI update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        content: content.trim() || "", // Allow empty content for file-only messages
        sender: user.id,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
        attachments: attachments?.map((file) => ({
          type: file.type.startsWith("image/") ? "image" : "file",
          name: file.name,
          size: file.size,
          url: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
        })),
      };

      setMessages((prev) => [...prev, tempMessage]);

      try {
        // Upload attachments
        const attachmentUrls = [];
        if (attachments?.length) {
          for (const file of attachments) {
            const uniqueId = Math.random().toString(36).substring(2);
            const fileName = `${uniqueId}_${file.name}`;
            const filePath = `attachments/${fileName}`;

            const { data: uploadData, error: uploadError } =
              await supabase.storage
                .from("chatting-attachment")
                .upload(filePath, file, {
                  cacheControl: "3600",
                  upsert: false,
                });

            if (uploadError) {
              console.error("Error uploading file:", uploadError);
              continue;
            }

            const { data: publicUrlData } = supabase.storage
              .from("chatting-attachment")
              .getPublicUrl(filePath);

            attachmentUrls.push({
              type: file.type.startsWith("image/") ? "image" : "file",
              name: file.name,
              size: file.size,
              url: publicUrlData.publicUrl,
            });
          }
        }

        // Find receiver
        const otherUserId = conversations.find(
          (conv) => conv.room_id === room_id
        )?.id;

        // Insert message (allow empty content for file-only messages)
        const { data: messageData, error: messageError } = await supabase
          .from("communications")
          .insert({
            sender_id: user.id,
            receiver_id: otherUserId,
            message:
              content.trim() ||
              (attachments?.length ? `Sent ${attachments.length} file(s)` : ""),
            room_id: room_id,
            attachment:
              attachmentUrls.length > 0 ? JSON.stringify(attachmentUrls) : null,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (messageError) throw messageError;

        // Update conversations table for both users
        const conversationUpdates = [
          {
            room_id: room_id,
            user_id: user.id,
            last_message_id: messageData.id,
            last_message_read_id: messageData.id, // Sender has read their own message
          },
          {
            room_id: room_id,
            user_id: otherUserId,
            last_message_id: messageData.id,
            last_message_read_id: null, // Receiver hasn't read it yet
          },
        ];

        // Update both conversation records
        for (const update of conversationUpdates) {
          await supabase
            .from("conversations")
            .update({
              last_message_id: update.last_message_id,
              last_message_read_id: update.last_message_read_id,
              created_at: new Date().toISOString(),
            })
            .eq("room_id", update.room_id)
            .eq("user_id", update.user_id);
        }

        // Mark message as read by sender
        await supabase.from("message_reads").upsert({
          message_id: messageData.id,
          user_id: user.id,
          read_at: new Date().toISOString(),
        });

        // Replace temp message with real message
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== tempMessage.id),
          {
            id: messageData.id,
            date: new Date(messageData.created_at).toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            content: messageData.message,
            sender: messageData.sender_id,
            time: new Date(messageData.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "sent",
            attachments: messageData.attachment
              ? JSON.parse(messageData.attachment)
              : undefined,
            read_by: [user.id],
          },
        ]);

        // Update conversation list
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.room_id === room_id) {
              return {
                ...conv,
                lastMessage:
                  content.trim() || `Sent ${attachments?.length || 0} file(s)`,
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
            }
            return conv;
          })
        );
      } catch (error) {
        console.error("Error sending message:", error);
        // Remove temp message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      }
    },
    [selectedConversation, user?.id, room_id, conversations]
  );

  // Fetch messages and set up real-time subscription
  useEffect(() => {
    if (!selectedConversation || !room_id || !user?.id) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);

    const fetchMessages = async () => {
      try {
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("communications")
          .select("*")
          .eq("room_id", room_id)
          .order("created_at", { ascending: true });

        if (messagesError) throw messagesError;

        // Get read status for all messages
        const messageIds = messagesData.map((m) => m.id);
        const { data: readData } = await supabase
          .from("message_reads")
          .select("message_id, user_id")
          .in("message_id", messageIds);

        // Group read data by message_id
        const readByMessage: Record<string, string[]> = {};
        readData?.forEach((read) => {
          if (!readByMessage[read.message_id]) {
            readByMessage[read.message_id] = [];
          }
          readByMessage[read.message_id].push(read.user_id);
        });

        // Format messages
        const formattedMessages = messagesData.map((msg) => {
          const readBy = readByMessage[msg.id] || [];
          const isRead =
            readBy.length > 1 ||
            (readBy.length === 1 && readBy[0] !== msg.sender_id);

          let status: "sent" | "delivered" | "read" = "sent";
          if (msg.sender_id === user.id) {
            status = isRead ? "read" : "delivered"; // Show delivered immediately for own messages
          } else {
            status = isRead ? "read" : "delivered";
          }

          return {
            id: msg.id,
            date: new Date(msg.created_at).toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            content: msg.message,
            sender: msg.sender_id,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status,
            attachments: msg.attachment
              ? JSON.parse(msg.attachment)
              : undefined,
            read_by: readBy,
          };
        });

        setMessages(formattedMessages);

        // Mark messages as read when loading the conversation
        await markMessagesAsRead(room_id);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription for new messages
    const messageSubscription = supabase
      .channel(`room:${room_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "communications",
          filter: `room_id=eq.${room_id}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;

          // Don't add message if it's from current user (already added optimistically)
          if (newMsg.sender_id === user.id) return;

          // Get sender profile for notification
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("first_name, last_name, avatar_url")
            .eq("id", newMsg.sender_id)
            .single();

          // Show push notification with navigation - only if not currently viewing this room
          if (senderProfile && document.hidden) {
            const senderName =
              `${senderProfile.first_name} ${senderProfile.last_name}`.trim();

            // Request notification permission if not granted
            if (Notification.permission === "default") {
              await Notification.requestPermission();
            }

            if (Notification.permission === "granted") {
              const notification = new Notification("New Message", {
                body: `${senderName}: ${newMsg.message}`,
                icon: senderProfile.avatar_url || "/user_logo.png",
                tag: `chat-${room_id}`, // Prevent duplicate notifications
                requireInteraction: true,
              });

              notification.onclick = () => {
                window.focus();
                navigate(`/chat/${room_id}`);
                notification.close();
              };

              // Auto close after 5 seconds
              setTimeout(() => notification.close(), 5000);
            }
          }

          const formattedMessage: Message = {
            id: newMsg.id,
            date: new Date(newMsg.created_at).toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            content: newMsg.message,
            sender: newMsg.sender_id,
            time: new Date(newMsg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "delivered",
            attachments: newMsg.attachment
              ? JSON.parse(newMsg.attachment)
              : undefined,
            read_by: [],
          };

          setMessages((prev) => [...prev, formattedMessage]);

          // Update conversation list with new message and increment unread count
          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.room_id === room_id) {
                return {
                  ...conv,
                  lastMessage: newMsg.message,
                  time: new Date(newMsg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  unread: conv.unread + 1,
                };
              }
              return conv;
            })
          );

          // Mark as read immediately since user is viewing this conversation
          await markMessagesAsRead(room_id);
        }
      )
      .subscribe();

    // Set up real-time subscription for read receipts
    const readReceiptSubscription = supabase
      .channel(`read_receipts:${room_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message_reads",
        },
        (payload) => {
          const newReadReceipt = payload.new as any;
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === newReadReceipt.message_id) {
                return {
                  ...msg,
                  read_by: [...(msg.read_by || []), newReadReceipt.user_id],
                  status: msg.sender === user.id ? "read" : msg.status,
                };
              }
              return msg;
            })
          );
        }
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      readReceiptSubscription.unsubscribe();
    };
  }, [selectedConversation, room_id, user?.id, markMessagesAsRead, navigate]);

  // Set up real-time subscription for online status changes (improved)
  useEffect(() => {
    if (!conversations.length) return;

    const userIds = conversations.map((c) => c.id);

    const subscription = supabase
      .channel("online_status_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=in.(${userIds.join(",")})`,
        },
        (payload) => {
          const updatedProfile = payload.new as any;

          // Update conversations immediately
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === updatedProfile.id
                ? { ...conv, online_status: updatedProfile.online_status }
                : conv
            )
          );

          // Update contact info if it's the current contact
          if (contact && contact.id === updatedProfile.id) {
            setContact((prev) =>
              prev
                ? {
                    ...prev,
                    online: updatedProfile.online_status === "online",
                  }
                : null
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversations, contact]);

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] bg-white">
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          isLoading={isLoadingConversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          currentOrganizationRole={currentUserRole}
          currentUser={user?.id || ""}
        />
        <ChatView
          selectedConversation={selectedConversation}
          messages={messages}
          contact={contact}
          isLoading={isLoadingMessages}
          onSendMessage={handleSendMessage}
          currentUserId={user?.id || ""}
          roomId={room_id || null}
        />
      </div>
    </div>
  );
};

export default ChatComponent;
