import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/chat/type";

export const useMessageSearch = (roomId: string | null) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const searchMessages = useCallback(
    async (term: string) => {
      if (!roomId || !term.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        // Search in messages content for this room
        const { data, error } = await supabase
          .from("communications")
          .select("*")
          .eq("room_id", roomId)
          .ilike("message", `%${term}%`)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          console.error("Error searching messages:", error);
          setSearchResults([]);
        } else if (data) {
          // Format messages
          const formattedResults = data.map((msg) => ({
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
          }));

          setSearchResults(formattedResults);
        }
      } catch (error) {
        console.error("Error in searchMessages:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [roomId]
  );

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    searchMessages,
    isSearching,
  };
};
