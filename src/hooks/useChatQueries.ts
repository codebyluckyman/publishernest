import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message, Contact } from "@/components/chat/type";
import { v4 as uuid } from "uuid";
import { useEffect } from "react";

// Get current user role in organization
export const useUserRole = (
  organizationId: string | undefined,
  userId: string | undefined
) => {
  return useQuery({
    queryKey: ["userRole", organizationId, userId],
    queryFn: async () => {
      if (!organizationId || !userId) return null;

      const { data, error } = await supabase
        .from("organization_members")
        .select("member_type")
        .eq("organization_id", organizationId)
        .eq("auth_user_id", userId)
        .single();

      if (error) throw error;
      return data?.member_type;
    },
    enabled: !!organizationId && !!userId,
  });
};

// Calculate unread count for a conversation
export const useUnreadCount = (roomId: string, userId: string) => {
  return useQuery({
    queryKey: ["unreadCount", roomId, userId],
    queryFn: async () => {
      if (!roomId || !userId) return 0;

      const { data: unreadMessages, error } = await supabase
        .from("communications")
        .select("id")
        .eq("room_id", roomId)
        .neq("sender_id", userId);

      if (error) throw error;
      if (!unreadMessages?.length) return 0;

      const messageIds = unreadMessages.map((m) => m.id);

      const { data: readMessages, error: readError } = await supabase
        .from("message_reads")
        .select("message_id")
        .eq("user_id", userId)
        .in("message_id", messageIds);

      if (readError) throw readError;

      return unreadMessages.length - (readMessages?.length || 0);
    },
    enabled: !!roomId && !!userId,
  });
};

// Fetch all conversations for the current user
export const useConversations = (
  organizationId: string | undefined,
  userId: string | undefined,
  userRole: string | null
) => {
  return useQuery({
    queryKey: ["conversations", organizationId, userId, userRole],
    queryFn: async () => {
      if (!organizationId || !userRole || !userId) return [];

      // Get organization members (excluding current user)
      const { data: memberData, error: memberError } = await supabase
        .from("organization_members")
        .select("auth_user_id, member_type")
        .eq("organization_id", organizationId)
        .neq("auth_user_id", userId);

      if (memberError) throw memberError;
      if (!memberData?.length) return [];

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

      if (profilesResponse.error) throw profilesResponse.error;
      if (allConversationsResponse.error) throw allConversationsResponse.error;

      const profileData = profilesResponse.data || [];
      const allConversations = allConversationsResponse.data || [];

      // Find rooms where current user participates
      const userRooms = allConversations
        .filter((conv) => conv.user_id === userId)
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
      const lastMessagesPromises = userRooms.map(async (roomId) => {
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
      });

      const unreadCountPromises = userRooms.map(async (roomId) => {
        const { data: unreadMessages } = await supabase
          .from("communications")
          .select("id")
          .eq("room_id", roomId)
          .neq("sender_id", userId);

        if (!unreadMessages?.length) return { roomId, unreadCount: 0 };

        const messageIds = unreadMessages.map((m) => m.id);

        const { data: readMessages } = await supabase
          .from("message_reads")
          .select("message_id")
          .eq("user_id", userId)
          .in("message_id", messageIds);

        return {
          roomId,
          unreadCount: unreadMessages.length - (readMessages?.length || 0),
        };
      });

      const [lastMessages, unreadCounts] = await Promise.all([
        Promise.all(lastMessagesPromises),
        Promise.all(unreadCountPromises),
      ]);

      // Build conversations list
      const formattedConversations: Conversation[] = memberData
        .filter((member) => member.member_type !== userRole)
        .map((member) => {
          const profile = profileData.find((p) => p.id === member.auth_user_id);
          if (!profile) return null;

          // Find room between current user and this member
          const roomId = Object.entries(roomParticipants).find(
            ([, participants]) =>
              participants.includes(userId) &&
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

      return formattedConversations;
    },
    enabled: !!organizationId && !!userId && !!userRole,
  });
};

// Fetch messages for a conversation
export const useMessages = (roomId: string | null, userId: string) => {
  return useQuery({
    queryKey: ["messages", roomId, userId],
    queryFn: async () => {
      if (!roomId || !userId) return [];

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("communications")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      // Get read status for all messages
      const messageIds = messagesData.map((m) => m.id);
      const { data: readData, error: readError } = await supabase
        .from("message_reads")
        .select("message_id, user_id")
        .in("message_id", messageIds);

      if (readError) throw readError;

      // Group read data by message_id
      const readByMessage: Record<string, string[]> = {};
      readData?.forEach((read) => {
        if (!readByMessage[read.message_id]) {
          readByMessage[read.message_id] = [];
        }
        readByMessage[read.message_id].push(read.user_id);
      });

      // Format messages
      return messagesData.map((msg) => {
        const readBy = readByMessage[msg.id] || [];
        const status =
          msg.sender_id === userId
            ? readBy.length > 1
              ? "read"
              : "sent"
            : "received";

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
          attachments: msg.attachment ? JSON.parse(msg.attachment) : undefined,
          read_by: readBy,
        };
      });
    },
    enabled: !!roomId && !!userId,
  });
};

// Mark messages as read
export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      userId,
    }: {
      roomId: string;
      userId: string;
    }) => {
      if (!roomId || !userId) return;

      // Get all unread messages in this room
      const { data: roomMessages, error } = await supabase
        .from("communications")
        .select("id")
        .eq("room_id", roomId)
        .neq("sender_id", userId);

      if (error) throw error;
      if (!roomMessages?.length) return;

      // Get already read messages
      const { data: readMessages, error: readError } = await supabase
        .from("message_reads")
        .select("message_id")
        .eq("user_id", userId)
        .in(
          "message_id",
          roomMessages.map((m) => m.id)
        );

      if (readError) throw readError;

      const readMessageIds = new Set(
        readMessages?.map((r) => r.message_id) || []
      );
      const unreadMessages = roomMessages.filter(
        (m) => !readMessageIds.has(m.id)
      );

      if (!unreadMessages.length) return;

      // Mark unread messages as read using upsert
      for (const message of unreadMessages) {
        await supabase.from("message_reads").upsert({
          message_id: message.id,
          user_id: userId,
          read_at: new Date().toISOString(),
        });
      }

      // Update conversations table with last read message
      if (unreadMessages.length > 0) {
        const latestMessageId = unreadMessages[0].id;
        await supabase
          .from("conversations")
          .update({ last_message_read_id: latestMessageId })
          .eq("room_id", roomId)
          .eq("user_id", userId);
      }

      return unreadMessages;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.roomId],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadCount", variables.roomId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// Send a message
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      roomId,
      userId,
      receiverId,
      attachments,
    }: {
      content: string;
      roomId: string;
      userId: string;
      receiverId: string;
      attachments?: File[];
    }) => {
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

          if (uploadError) throw uploadError;

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

      // Insert message
      const { data: messageData, error: messageError } = await supabase
        .from("communications")
        .insert({
          sender_id: userId,
          receiver_id: receiverId,
          message:
            content.trim() ||
            (attachments?.length ? `Sent ${attachments.length} file(s)` : ""),
          room_id: roomId,
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
          room_id: roomId,
          user_id: userId,
          last_message_id: messageData.id,
          last_message_read_id: messageData.id, // Sender has read their own message
        },
        {
          room_id: roomId,
          user_id: receiverId,
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
        user_id: userId,
        read_at: new Date().toISOString(),
      });

      return messageData;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.roomId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// Create or get conversation room
export const useCreateOrGetConversationRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      contactId,
    }: {
      userId: string;
      contactId: string;
    }) => {
      // Check for existing room
      const { data: existingConversations, error } = await supabase
        .from("conversations")
        .select("room_id, user_id")
        .in("user_id", [userId, contactId]);

      if (error) throw error;

      // Find room with both users
      const roomUserCount: Record<string, Set<string>> = {};
      existingConversations?.forEach(({ room_id, user_id }) => {
        if (!roomUserCount[room_id]) roomUserCount[room_id] = new Set();
        roomUserCount[room_id].add(user_id);
      });

      const existingRoomId = Object.entries(roomUserCount).find(
        ([, users]) => users.has(userId) && users.has(contactId)
      )?.[0];

      if (existingRoomId) {
        return { roomId: existingRoomId, isNew: false };
      }

      // Create new room
      const roomId = uuid();
      const { error: insertError } = await supabase
        .from("conversations")
        .insert([
          {
            room_id: roomId,
            user_id: userId,
            last_message_id: null,
            last_message_read_id: null,
          },
          {
            room_id: roomId,
            user_id: contactId,
            last_message_id: null,
            last_message_read_id: null,
          },
        ]);

      if (insertError) throw insertError;

      return { roomId, isNew: true };
    },
    onSuccess: () => {
      // Invalidate conversations query
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// Get contact info from conversation
export const useContactInfo = (
  roomId: string | null,
  conversations: Conversation[]
) => {
  return useQuery({
    queryKey: ["contactInfo", roomId, conversations],
    queryFn: async () => {
      if (!roomId || conversations.length === 0) return null;

      const conversation = conversations.find(
        (conv) => conv.room_id === roomId
      );

      if (!conversation) return null;

      const contact: Contact = {
        id: conversation.id,
        name: conversation.name,
        online: conversation.online_status === "online",
        type: conversation.type,
        email: conversation.email,
        avatar_url: conversation.avatar_url,
        joinedDate: conversation.joinedDate,
      };

      return contact;
    },
    enabled: !!roomId && conversations.length > 0,
  });
};

// Hook for real-time message subscription
export const useMessageSubscription = (
  roomId: string | null,
  userId: string | undefined,
  onNewMessage: (message: Message) => void
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roomId || !userId) return;

    // Set up real-time subscription for new messages
    const messageSubscription = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "communications",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;

          // Don't process if it's from current user (already added optimistically)
          if (newMsg.sender_id === userId) return;

          // Get read status
          const { data: readData } = await supabase
            .from("message_reads")
            .select("user_id")
            .eq("message_id", newMsg.id);

          const readBy = readData?.map((r) => r.user_id) || [];

          // Format the new message
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
            read_by: readBy,
          };

          // Call the callback with the new message
          onNewMessage(formattedMessage);

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          queryClient.invalidateQueries({ queryKey: ["unreadCount", roomId] });
        }
      )
      .subscribe();

    // Set up real-time subscription for read receipts
    const readReceiptSubscription = supabase
      .channel(`read_receipts:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message_reads",
        },
        (payload) => {
          const newReadReceipt = payload.new as any;

          // Update the messages cache with the new read receipt
          queryClient.setQueryData(
            ["messages", roomId, userId],
            (oldData: Message[] | undefined) => {
              if (!oldData) return oldData;

              return oldData.map((msg) => {
                if (msg.id === newReadReceipt.message_id) {
                  return {
                    ...msg,
                    read_by: [...(msg.read_by || []), newReadReceipt.user_id],
                    status: msg.sender === userId ? "read" : msg.status,
                  };
                }
                return msg;
              });
            }
          );
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      messageSubscription.unsubscribe();
      readReceiptSubscription.unsubscribe();
    };
  }, [roomId, userId, onNewMessage, queryClient]);
};

// Hook for online status subscription
export const useOnlineStatusSubscription = (
  userIds: string[],
  onStatusChange: (
    userId: string,
    status: "online" | "away" | "offline"
  ) => void
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userIds.length) return;

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

          // Call the callback with the updated status
          onStatusChange(
            updatedProfile.id,
            updatedProfile.online_status as "online" | "away" | "offline"
          );

          // Invalidate conversations query to refresh data
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [userIds, onStatusChange, queryClient]);
};
