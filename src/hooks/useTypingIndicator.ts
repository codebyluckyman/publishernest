import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TypingUser {
  user_id: string;
  name: string;
  avatar_url?: string;
}

export const useTypingIndicator = (
  roomId: string | null,
  currentUserId: string
) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTypingUpdateRef = useRef<number>(0);
  const isUpdatingTypingRef = useRef(false);

  // Update typing status with throttling
  const updateTypingStatus = useCallback(
    async (typing: boolean) => {
      if (!roomId || !currentUserId || isUpdatingTypingRef.current) return;

      // Throttle typing updates to prevent spam
      const now = Date.now();
      if (typing && now - lastTypingUpdateRef.current < 1000) {
        return;
      }

      isUpdatingTypingRef.current = true;
      lastTypingUpdateRef.current = now;

      try {
        const { error } = await supabase.rpc("update_typing_status", {
          p_room_id: roomId,
          p_user_id: currentUserId,
          p_is_typing: typing,
        });

        if (error) {
          console.error("Error updating typing status:", error);
        }
      } catch (error) {
        console.error("Error updating typing status:", error);
      } finally {
        isUpdatingTypingRef.current = false;
      }
    },
    [roomId, currentUserId]
  );

  // Start typing
  const startTyping = useCallback(() => {
    if (!roomId || isTyping) return;

    setIsTyping(true);
    updateTypingStatus(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 3000);
  }, [roomId, isTyping, updateTypingStatus]);

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!isTyping) return;

    setIsTyping(false);
    updateTypingStatus(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [isTyping, updateTypingStatus]);

  // Handle input change (throttled)
  const handleInputChange = useCallback(() => {
    const now = Date.now();

    // Throttle typing updates to every 1 second
    if (now - lastTypingUpdateRef.current > 1000) {
      startTyping();
    } else if (!isTyping) {
      startTyping();
    }

    // Reset the timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [startTyping, stopTyping, isTyping]);

  // Set up real-time subscription for typing status
  useEffect(() => {
    if (!roomId) {
      setTypingUsers([]);
      return;
    }

    const subscription = supabase
      .channel(`typing:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_status",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            const typingData = payload.new as any;

            // Don't show current user as typing
            if (typingData.user_id === currentUserId) return;

            if (typingData.is_typing) {
              // Get user profile
              const { data: profile } = await supabase
                .from("profiles")
                .select("first_name, last_name, avatar_url")
                .eq("id", typingData.user_id)
                .single();

              if (profile) {
                const typingUser: TypingUser = {
                  user_id: typingData.user_id,
                  name: `${profile.first_name} ${profile.last_name}`.trim(),
                  avatar_url: profile.avatar_url,
                };

                setTypingUsers((prev) => {
                  const filtered = prev.filter(
                    (u) => u.user_id !== typingData.user_id
                  );
                  return [...filtered, typingUser];
                });
              }
            } else {
              setTypingUsers((prev) =>
                prev.filter((u) => u.user_id !== typingData.user_id)
              );
            }
          } else if (payload.eventType === "DELETE") {
            const deletedData = payload.old as any;
            setTypingUsers((prev) =>
              prev.filter((u) => u.user_id !== deletedData.user_id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      stopTyping();
    };
  }, [roomId, currentUserId, stopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping();
    };
  }, [stopTyping]);

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping,
    handleInputChange,
  };
};
