import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MessageReadStatus {
  messageId: string;
  senderId: string;
  readByUsers: string[];
  totalReaders: number;
  isReadByOthers: boolean;
}

export const useMessageReads = (
  roomId: string | null,
  currentUserId: string
) => {
  const [messageReads, setMessageReads] = useState<
    Record<string, MessageReadStatus>
  >({});
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const markingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastMarkTimeRef = useRef<number>(0);

  // Mark messages as read with improved error handling
  const markMessagesAsRead = useCallback(
    async (roomId: string) => {
      if (!currentUserId || !roomId || isMarkingAsRead) return;

      // Prevent too frequent marking (minimum 1 second between marks)
      const now = Date.now();
      if (now - lastMarkTimeRef.current < 1000) {
        return;
      }

      setIsMarkingAsRead(true);
      lastMarkTimeRef.current = now;

      try {
        // Get all unread messages in this room from other users
        const { data: unreadMessages, error: messagesError } = await supabase
          .from("communications")
          .select("id, sender_id")
          .eq("room_id", roomId)
          .neq("sender_id", currentUserId);

        if (messagesError) {
          console.error("Error fetching unread messages:", messagesError);
          return;
        }

        if (!unreadMessages?.length) {
          setIsMarkingAsRead(false);
          return;
        }

        // Get already read messages
        const { data: readMessages, error: readError } = await supabase
          .from("message_reads")
          .select("message_id")
          .eq("user_id", currentUserId)
          .in(
            "message_id",
            unreadMessages.map((m) => m.id)
          );

        if (readError) {
          console.error("Error fetching read messages:", readError);
          return;
        }

        // Find messages that need to be marked as read
        const readMessageIds = new Set(
          readMessages?.map((r) => r.message_id) || []
        );
        const messagesToMark = unreadMessages.filter(
          (m) => !readMessageIds.has(m.id)
        );

        if (!messagesToMark.length) {
          setIsMarkingAsRead(false);
          return;
        }

        // Insert read records one by one to avoid duplicate key issues
        for (const message of messagesToMark) {
          try {
            await supabase
              .from("message_reads")
              .upsert({
                message_id: message.id,
                user_id: currentUserId,
                read_at: new Date().toISOString(),
              })
              .select();
          } catch (error) {
            console.error(
              `Error marking message ${message.id} as read:`,
              error
            );
            // Continue with other messages
          }
        }

        // Update the conversation's last read message
        const latestMessageId = messagesToMark[0]?.id;
        if (latestMessageId) {
          await supabase
            .from("conversations")
            .update({ last_message_read_id: latestMessageId })
            .eq("room_id", roomId)
            .eq("user_id", currentUserId);
        }

        // Fetch updated read status
        await fetchMessageReads(roomId);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      } finally {
        setIsMarkingAsRead(false);
      }
    },
    [currentUserId, isMarkingAsRead]
  );

  // Debounced mark as read function
  const debouncedMarkAsRead = useCallback(
    (roomId: string) => {
      if (markingTimeoutRef.current) {
        clearTimeout(markingTimeoutRef.current);
      }

      markingTimeoutRef.current = setTimeout(() => {
        markMessagesAsRead(roomId);
      }, 500); // Reduced delay for faster response
    },
    [markMessagesAsRead]
  );

  // Fetch message read status
  const fetchMessageReads = useCallback(async (roomId: string) => {
    if (!roomId) return;

    try {
      // Get all messages in the room
      const { data: messages, error: messagesError } = await supabase
        .from("communications")
        .select("id, sender_id, created_at")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return;
      }

      if (!messages?.length) {
        setMessageReads({});
        return;
      }

      const messageIds = messages.map((m) => m.id);

      // Get read status for all messages
      const { data: readData, error: readError } = await supabase
        .from("message_reads")
        .select("message_id, user_id, read_at")
        .in("message_id", messageIds);

      if (readError) {
        console.error("Error fetching read data:", readError);
        return;
      }

      // Group read data by message_id
      const readByMessage: Record<string, string[]> = {};
      readData?.forEach((read) => {
        if (!readByMessage[read.message_id]) {
          readByMessage[read.message_id] = [];
        }
        readByMessage[read.message_id].push(read.user_id);
      });

      // Create message read status
      const messageReadStatus: Record<string, MessageReadStatus> = {};
      messages.forEach((msg) => {
        const readByUsers = readByMessage[msg.id] || [];
        const totalReaders = readByUsers.length;
        const isReadByOthers = readByUsers.some(
          (userId) => userId !== msg.sender_id
        );

        messageReadStatus[msg.id] = {
          messageId: msg.id,
          senderId: msg.sender_id,
          readByUsers,
          totalReaders,
          isReadByOthers,
        };
      });

      setMessageReads(messageReadStatus);
    } catch (error) {
      console.error("Error fetching message reads:", error);
    }
  }, []);

  // Set up real-time subscription for message reads
  useEffect(() => {
    if (!roomId) {
      setMessageReads({});
      return;
    }

    // Initial fetch
    fetchMessageReads(roomId);

    // Set up real-time subscription for read receipts
    const subscription = supabase
      .channel(`message_reads:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "message_reads",
        },
        async (payload) => {
          // Check if this read receipt is for a message in our current room
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            const readReceipt = payload.new as any;

            const { data: messageData } = await supabase
              .from("communications")
              .select("room_id")
              .eq("id", readReceipt.message_id)
              .single();

            if (messageData?.room_id === roomId) {
              // Refresh the entire read status to get accurate counts
              await fetchMessageReads(roomId);
            }
          } else if (payload.eventType === "DELETE") {
            // Handle delete event if needed
            await fetchMessageReads(roomId);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      if (markingTimeoutRef.current) {
        clearTimeout(markingTimeoutRef.current);
      }
    };
  }, [roomId, fetchMessageReads]);

  return {
    messageReads,
    markMessagesAsRead: debouncedMarkAsRead,
    fetchMessageReads,
    isMarkingAsRead,
  };
};
