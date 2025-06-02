import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/context/AuthContext";
import ChatSidebar from "./ChatSidebar";
import { Contact, Conversation, Message } from "./type";
import ChatView from "./Chatview";
import {
  useUserRole,
  useConversations,
  useMessages,
  useMarkMessagesAsRead,
  useSendMessage,
  useCreateOrGetConversationRoom,
  useContactInfo,
  useMessageSubscription,
  useOnlineStatusSubscription,
} from "@/hooks/useChatQueries";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ChatComponent: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const { room_id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(room_id || null);
  const [contact, setContact] = useState<Contact | null>(null);

  // Set selected conversation from URL
  useEffect(() => {
    if (room_id) {
      setSelectedConversation(room_id);
    }
  }, [room_id]);

  // Queries
  const { data: currentUserRole = "" } = useUserRole(
    currentOrganization?.id,
    user?.id
  );

  const { data: conversations = [], isLoading: isLoadingConversations } =
    useConversations(currentOrganization?.id, user?.id, currentUserRole);

  const { data: messages = [], isLoading: isLoadingMessages } = useMessages(
    selectedConversation,
    user?.id || ""
  );

  const { data: contactInfo } = useContactInfo(
    selectedConversation,
    conversations
  );

  // Mutations
  const markMessagesAsRead = useMarkMessagesAsRead();
  const sendMessage = useSendMessage();
  const createOrGetRoom = useCreateOrGetConversationRoom();

  // Update contact when contactInfo changes
  useEffect(() => {
    if (contactInfo) {
      setContact(contactInfo);
    }
  }, [contactInfo]);

  // Handle new messages from subscription
  const handleNewMessage = useCallback(
    (newMessage: Message) => {
      // Only show notification if the message is from someone else
      if (newMessage.sender !== user?.id) {
        // Get sender name from conversations
        const senderConversation = conversations.find(
          (conv) => conv.id === newMessage.sender
        );

        const senderName = senderConversation?.name || "Someone";
        const messageContent = newMessage.content || "Sent an attachment";

        // Request notification permission if not granted
        if (Notification.permission !== "granted") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              showNotification(
                senderName,
                messageContent,
                senderConversation?.avatar_url
              );
            }
          });
        } else {
          showNotification(
            senderName,
            messageContent,
            senderConversation?.avatar_url
          );
        }
      }
    },
    [user?.id, conversations, navigate, selectedConversation]
  );

  // Function to show system notification
  const showNotification = useCallback(
    (sender: string, content: string, icon?: string) => {
      try {
        const notification = new Notification(sender, {
          body: content,
          icon: icon || "/user_logo.png",
          silent: false,
        });

        // Focus window and navigate to conversation when notification is clicked
        notification.onclick = () => {
          window.focus();
          if (selectedConversation) {
            navigate(`/chat/${selectedConversation}`);
          }
        };
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    },
    [navigate, selectedConversation]
  );

  // Set up real-time subscriptions
  useEffect(() => {
    if (selectedConversation && user?.id) {
      console.log(
        "Setting up message subscription for room:",
        selectedConversation
      ); // Debug log

      const subscription = supabase
        .channel(`room:${selectedConversation}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "communications",
            filter: `room_id=eq.${selectedConversation}`,
          },
          (payload) => {
            console.log("Received message from subscription:", payload); // Debug log

            const newMessage = payload.new as any;

            // Convert to Message format
            const message: Message = {
              id: newMessage.id,
              content: newMessage.message || "",
              sender: newMessage.sender_id,
              time: new Date(newMessage.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              date: new Date(newMessage.created_at).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              ),
              status: "sent",
              attachments: newMessage.attachment
                ? JSON.parse(newMessage.attachment)
                : undefined,
            };

            // Call the handler
            handleNewMessage(message);

            // Invalidate the messages query to refresh the UI
            queryClient.invalidateQueries({
              queryKey: ["messages", selectedConversation, user.id],
            });
          }
        )
        .subscribe();

      return () => {
        console.log("Unsubscribing from message subscription"); // Debug log
        subscription.unsubscribe();
      };
    }
  }, [selectedConversation, user?.id, handleNewMessage, queryClient]);

  useOnlineStatusSubscription(
    conversations.map((conv) => conv.id),
    (userId, status) => {
      // Update contact if it's the current contact
      if (contact && contact.id === userId) {
        setContact((prev) =>
          prev ? { ...prev, online: status === "online" } : null
        );
      }
    }
  );

  // Handle conversation selection
  const handleSelectConversation = useCallback(
    async (conversation: Conversation) => {
      if (!user?.id) return;

      try {
        let roomId = conversation.room_id;

        // Create room if it doesn't exist
        if (!roomId) {
          const result = await createOrGetRoom.mutateAsync({
            userId: user.id,
            contactId: conversation.id,
          });
          roomId = result.roomId;
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
          await markMessagesAsRead.mutateAsync({
            roomId,
            userId: user.id,
          });
        }
      } catch (error) {
        console.error("Error handling conversation selection:", error);
      }
    },
    [user?.id, navigate, markMessagesAsRead, createOrGetRoom]
  );

  // Handle sending message
  const handleSendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      if (
        !selectedConversation ||
        (!content.trim() && !attachments?.length) ||
        !user?.id ||
        !room_id
      )
        return;

      // Find receiver
      const otherUserId = conversations.find(
        (conv) => conv.room_id === room_id
      )?.id;

      if (!otherUserId) return;

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

      // Add message optimistically to UI
      queryClient.setQueryData(
        ["messages", selectedConversation, user.id],
        (oldData: Message[] = []) => [...oldData, tempMessage]
      );

      try {
        await sendMessage.mutateAsync({
          content,
          roomId: room_id,
          userId: user.id,
          receiverId: otherUserId,
          attachments,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        // Remove the optimistic update on error
        queryClient.setQueryData(
          ["messages", selectedConversation, user.id],
          (oldData: Message[] = []) =>
            oldData.filter((msg) => msg.id !== tempMessage.id)
        );
      }
    },
    [selectedConversation, user?.id, room_id, conversations, sendMessage]
  );

  // Request notification permission on component mount
  useEffect(() => {
    // Only request if not already granted or denied
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

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
          messages={messages as Message[]}
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
