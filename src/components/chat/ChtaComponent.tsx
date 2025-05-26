import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Contact, Conversation, Message } from "./type";
import Header from "./ChatHeader";
import Sidebar from "./ChatSidebar";
import ChatView from "./Chatview";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import addNotification from "react-push-notification";
import { useProfilesPolling } from "@/hooks/fetchOnlineStatus";
import { useOrganizationMembers } from "@/hooks/organization/useOrganizationMembers";

const ChatComponent: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const { room_id } = useParams();

  const { profiles, loading, error } = useProfilesPolling(3 * 60 * 1000); // 3 minutes

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set selected conversation from URL parameter
  useEffect(() => {
    if (room_id) {
      setSelectedConversation(room_id);
    }
  }, [room_id]);

  // Fetch current user role
  useEffect(() => {
    if (currentOrganization?.id && user?.id) {
      const getCurrentUserRole = async () => {
        const { data: organizationData, error: organizationError } =
          await supabase
            .from("organization_members")
            .select("member_type")
            .eq("organization_id", currentOrganization?.id)
            .eq("auth_user_id", user?.id)
            .single();

        if (organizationError) {
          console.error("Error fetching user role:", organizationError);
          return;
        }

        if (organizationData) {
          setCurrentUserRole(organizationData?.member_type);
        }
      };

      getCurrentUserRole();
    }
  }, [user?.id, currentOrganization?.id]);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!currentOrganization?.id || !currentUserRole) return;
    setIsLoadingConversations(true);
    try {
      const conversations: any[] = [];

      // Helper function to fetch members by type
      const fetchMembers = async (memberType: string) => {
        const { data: memberData, error: memberError } = await supabase
          .from("organization_members")
          .select("auth_user_id")
          .eq("organization_id", currentOrganization.id)
          .eq("member_type", memberType);

        if (memberError) throw memberError;

        if (memberData && memberData.length > 0) {
          const userIds = memberData.map((member) => member.auth_user_id);
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select(
              `*, conversations(*), ${
                memberType === "supplier" ? "suppliers(*)" : "*"
              }`
            )
            .in("id", userIds);

          if (profilesError) throw profilesError;

          if (profilesData) {
            console.log("Profiles Data:", profilesData);
            return profilesData.map((profile) => ({
              id: profile.id,
              name: `${profile.first_name}` + " " + `${profile.last_name}`,
              lastMessage: "",
              time: profile.created_at,
              online_status: profiles.find(
                (profiles) => profiles.id === profile.id
              )?.online_status,
              unread: 0,
              role: memberType,
              type: memberType,
              email: profile.email,
              // phone: profile.phone || "",
              avatar_url: profile.avatar_url,
              room_id: profile.conversations.find(
                (conv) => profile.id === conv.user_id
              )?.room_id,
            }));
          }
        }
        return [];
      };

      // Fetch appropriate conversations based on user role
      if (currentUserRole !== "supplier") {
        const suppliers = await fetchMembers("supplier");
        if (suppliers) conversations.push(...suppliers);
      }

      if (currentUserRole !== "customer") {
        const customers = await fetchMembers("customer");
        if (customers) conversations.push(...customers);
      }

      if (currentUserRole !== "publisher") {
        const publishers = await fetchMembers("publisher");
        if (publishers) conversations.push(...publishers);
      }
      setConversations(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [currentOrganization?.id, currentUserRole]);

  // Handle sending a message
  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedConversation || !content.trim() || !user?.id || !room_id)
      return;

    // Create temporary message for optimistic UI update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      date: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      content: content.trim(),
      sender: user.id,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
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
      // Upload attachments if any
      let attachmentUrls = [];
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          const fileExt = file.name.split(".").pop();
          const uniqueId = Math.random().toString(36).substring(2);
          const fileName = `${uniqueId}_${file.name}`;
          // Changed filepath to include 'attachments' folder
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

      // Insert message into database
      const { data: messageData, error: messageError } = await supabase
        .from("communications")
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation,
          message: content.trim(),
          room_id: room_id,
          attachment:
            attachmentUrls.length > 0 ? JSON.stringify(attachmentUrls) : null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Check if conversation exists for sender
      const { data: senderConversation, error: senderConvError } =
        await supabase
          .from("conversations")
          .select("*")
          .eq("user_id", user.id)
          .eq("room_id", room_id)
          .maybeSingle();

      if (senderConvError) throw senderConvError;

      // Update or create conversation for sender
      if (senderConversation) {
        const { error: senderUpdateError } = await supabase
          .from("conversations")
          .update({
            last_message_id: messageData.id,
            created_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("room_id", room_id);

        if (senderUpdateError) throw senderUpdateError;
      }

      // Check if conversation exists for receiver
      const { data: receiverConversation, error: receiverConvError } =
        await supabase
          .from("conversations")
          .select("*")
          .eq("user_id", selectedConversation)
          .eq("room_id", room_id)
          .maybeSingle();

      if (receiverConvError) throw receiverConvError;

      // Update or create conversation for receiver
      if (receiverConversation) {
        const { error: receiverUpdateError } = await supabase
          .from("conversations")
          .update({
            last_message_id: messageData.id,
            created_at: new Date().toISOString(),
          })
          .eq("user_id", selectedConversation)
          .eq("room_id", room_id);

        if (receiverUpdateError) throw receiverUpdateError;
      }

      // Replace temporary message with actual message from database
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
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove temporary message if there was an error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    }
  };

  // Fetch messages and set up real-time subscription
  useEffect(() => {
    if (!selectedConversation || !room_id || !user?.id) {
      setMessages([]);
      setContact(null);
      return;
    }

    setIsLoadingMessages(true);

    const fetchMessagesAndContact = async () => {
      try {
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("communications")
          .select("*")
          .eq("room_id", room_id)
          .order("created_at", { ascending: true });

        if (messagesError) throw messagesError;

        // Format messages with correct status (sent/received)
        const formattedMessages = messagesData.map((msg) => ({
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
          status: msg.sender_id === user.id ? "sent" : "received",
          attachments: msg.attachment ? JSON.parse(msg.attachment) : undefined,
        }));

        setMessages(formattedMessages);

        // Update last read message
        if (messagesData.length > 0) {
          const lastMessage = messagesData[messagesData.length - 1];
          if (lastMessage.sender_id !== user.id) {
            await supabase
              .from("conversations")
              .update({
                last_message_read_id: lastMessage.id,
                created_at: new Date().toISOString(),
              })
              .eq("user_id", user.id)
              .eq("room_id", room_id);
          }
        }

        // Set contact info
        const contactConversation = conversations.find(
          (c) => c.id === selectedConversation
        );
        // if (contactConversation) {
        //   setContact({
        //     id: contactConversation.id,
        //     name: contactConversation.name,
        //     online: contactConversation.online,
        //     type: contactConversation.type,
        //     email: contactConversation.email,
        //     phone: contactConversation.phone,
        //     location: contactConversation.location,
        //     role: contactConversation.role,
        //   });
        // }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessagesAndContact();

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel(`room:${room_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "communications",
          filter: `room_id=eq.${room_id}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;

          const { data: senderProfile, error: profileError } = await supabase
            .from("profiles")
            .select("first_name, last_name, avatar_url")
            .eq("id", newMsg.sender_id)
            .single();

          if (profileError) {
            console.error("Error fetching sender profile:", profileError);
            return;
          }

          addNotification({
            title: "Direct Message",
            message: `${
              senderProfile.first_name + " " + senderProfile.last_name
            }: ${newMsg.message}`,
            native: true,
            duration: 2500,
            icon: senderProfile.avatar_url
              ? senderProfile.avatar_url
              : "/user_logo.png",
          });

          if (newMsg.sender_id === user.id) return;

          const formattedMessage = {
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
            status: "received",
            attachments: newMsg.attachment
              ? JSON.parse(newMsg.attachment)
              : undefined,
          };

          setMessages((prev) => [...prev, formattedMessage]);

          await supabase
            .from("conversations")
            .update({
              last_message_read_id: newMsg.id,
              created_at: new Date().toISOString(),
            })
            .eq("user_id", user.id)
            .eq("room_id", room_id);

          // scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation, room_id, user?.id, conversations, profiles]);

  useEffect(() => {
    const subscription = supabase
      .channel(`profiles-realtime`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `current_organization_id=eq.${currentOrganization?.id}`,
        },
        async (payload) => {
          setConversations((prevConversations) =>
            prevConversations.map((conversation) => {
              const updatedProfile = profiles.find(
                (profile) => profile.id === conversation.id
              );
              if (updatedProfile) {
                return {
                  ...conversation,
                  online_status: updatedProfile.online_status,
                };
              }
              return conversation;
            })
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation, room_id, user?.id, conversations, profiles]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // const [members, setMembers] = useState<any[]>([]);
  // const { fetchOrganizationMembers } = useOrganizationMembers(
  //   currentOrganization?.id
  // );
  // const fetchMembers = async () => {
  //   const { data: membersData, error: membersError } = await supabase
  //     .from("organization_members")
  //     .select(`*, profiles(*)`)
  //     .eq("organization_id", currentOrganization?.id);
  //   if (membersError) {
  //     console.error("Error fetching members:", membersError);
  //     return;
  //   }

  //   if()

  //   console.log("Members Data:", membersData);
  // };

  // Helper function to fetch and format member data based on type
  const fetchMembersByType = async (
    memberType: string,
    organizationId: string,
    supabase: any
  ) => {
    // First get organization members
    const { data: members, error } = await supabase
      .from("organization_members")
      .select(
        `
      auth_user_id,
      member_type
    `
      )
      .eq("organization_id", organizationId)
      .eq("member_type", memberType);

    if (error) {
      console.error(`Error fetching ${memberType} members:`, error);
      return [];
    }

    const authUserIds = members.map((member) => member.auth_user_id);

    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(
        `
      id,
      first_name,
      last_name,
      email,
      avatar_url,
      created_at,
      online_status
    `
      )
      .in("id", authUserIds);

    if (profilesError) {
      console.error(`Error fetching profiles:`, profilesError);
      return [];
    }

    // Fetch company info based on member type
    let companyData = [];
    if (memberType !== "publisher") {
      const { data: companies, error: companiesError } = await supabase
        .from(memberType === "supplier" ? "suppliers" : "customers")
        .select(
          `
        id,
      `
        )
        .in("auth_user_id", authUserIds);

      if (companiesError) {
        console.error(
          `Error fetching ${memberType} companies:`,
          companiesError
        );
      } else {
        companyData = companies || [];
      }
    }

    // Fetch conversations
    const { data: conversations, error: conversationsError } = await supabase
      .from("conversations")
      .select(
        `
      room_id,
      last_message_id,
      last_message_read_id,
      user_id
    `
      )
      .in("user_id", authUserIds);

    if (conversationsError) {
      console.error(`Error fetching conversations:`, conversationsError);
      return [];
    }

    // Fetch last messages for conversations
    const roomIds = conversations.map((conv) => conv.room_id).filter(Boolean);
    const lastMessages =
      roomIds.length > 0
        ? await Promise.all(
            roomIds.map(async (roomId) => {
              const { data: messageData } = await supabase
                .from("communications")
                .select("*")
                .eq("room_id", roomId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

              return {
                roomId,
                message: messageData?.message || "",
                created_at: messageData?.created_at,
              };
            })
          )
        : [];

    // Combine all data
    return members.map((member: any) => {
      const profile = profiles.find((p) => p.id === member.auth_user_id);
      const company = companyData.find(
        (c) => c.auth_user_id === member.auth_user_id
      );
      const conversation = conversations.find(
        (c) => c.user_id === member.auth_user_id
      );
      const lastMessage = lastMessages.find(
        (msg) => msg?.roomId === conversation?.room_id
      );

      return {
        id: member.auth_user_id,
        name: `${profile?.first_name || ""} ${profile?.last_name || ""}`,
        avatar_url: profile?.avatar_url,
        email: profile?.email,
        type: memberType,
        online_status: profile?.online_status,
        room_id: conversation?.room_id,
        lastMessage: lastMessage?.message || "",
        lastMessageTime: lastMessage?.created_at || profile?.created_at,
        unreadCount: 0,
      };
    });
  };

  const fetchAllRelevantMembers = async () => {
    if (!currentOrganization?.id || !user?.id) return [];

    try {
      // First, get current user's member type
      const { data: currentUserData, error: currentUserError } = await supabase
        .from("organization_members")
        .select("member_type")
        .eq("organization_id", currentOrganization.id)
        .eq("auth_user_id", user.id)
        .single();

      if (currentUserError) throw currentUserError;

      const currentUserType = currentUserData.member_type;
      const memberTypes = ["publisher", "customer", "supplier"];
      const relevantTypes = memberTypes.filter(
        (type) => type !== currentUserType
      );

      // Fetch members for each relevant type
      const allMembers = await Promise.all(
        relevantTypes.map((type) =>
          fetchMembersByType(type, currentOrganization.id, supabase)
        )
      );

      // Flatten and sort by last message time
      const flattenedMembers = allMembers
        .flat()
        .sort(
          (a, b) =>
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime()
        );

      return flattenedMembers;
    } catch (error) {
      console.error("Error fetching members:", error);
      return [];
    }
  };

  useEffect(() => {
    if (currentOrganization?.id) {
      const fetchData = async () => {
        const members = await fetchAllRelevantMembers();

        console.log("Fetched Members:", members);
        // setMembers(members);
      };

      fetchData();
    }
  }, [currentOrganization?.id]);

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] bg-white">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          conversations={conversations}
          isLoading={isLoadingConversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          currentOrganizationRole={currentUserRole}
          currentUser={user?.id}
        />
        <ChatView
          selectedConversation={selectedConversation}
          messages={messages}
          contact={contact}
          isLoading={isLoadingMessages}
          onSendMessage={handleSendMessage}
          currentUserId={user?.id}
          // messagesEndRef={messagesEndRef}
        />
      </div>
    </div>
  );
};

export default ChatComponent;
