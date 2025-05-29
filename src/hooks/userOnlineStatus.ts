import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type OnlineStatus = "online" | "away" | "offline";

export const useOnlineStatus = (userId: string | undefined) => {
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>("offline");
  const activityTimeoutRef = useRef<NodeJS.Timeout>();
  const updateIntervalRef = useRef<NodeJS.Timeout>();
  const isPageVisibleRef = useRef(true);
  const lastUpdateRef = useRef<number>(0);
  const isUpdatingRef = useRef(false);
  const hasSetupBeforeUnloadRef = useRef(false);

  const updateStatus = useCallback(
    async (status: OnlineStatus) => {
      if (!userId || isUpdatingRef.current) return;

      // Prevent too frequent updates (minimum 2 seconds between updates)
      const now = Date.now();
      if (now - lastUpdateRef.current < 2000 && status === onlineStatus) {
        return;
      }

      isUpdatingRef.current = true;
      lastUpdateRef.current = now;

      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            online_status: status,
            last_seen: new Date().toISOString(),
          })
          .eq("id", userId);

        if (!error) {
          setOnlineStatus(status);
        }
      } catch (error) {
        console.error("Error updating online status:", error);
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [userId, onlineStatus]
  );

  // Function to set user offline directly (client-side only)
  const setUserOffline = useCallback(async () => {
    if (!userId) return;

    try {
      // Direct update to profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          online_status: "offline",
          last_seen: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) {
        console.error("Error setting user offline:", profileError);
      }

      // Clean up typing status
      const { error: typingError } = await supabase
        .from("typing_status")
        .delete()
        .eq("user_id", userId);

      if (typingError) {
        console.error("Error cleaning up typing status:", typingError);
      }

      setOnlineStatus("offline");
    } catch (error) {
      console.error("Error setting user offline:", error);
    }
  }, [userId]);

  const handleActivity = useCallback(() => {
    if (!isPageVisibleRef.current || !userId) return;

    // Clear existing timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    // Only update to online if not already online
    if (onlineStatus !== "online") {
      updateStatus("online");
    }

    // Set timeout for away status (3 minutes)
    activityTimeoutRef.current = setTimeout(
      () => {
        updateStatus("away");
      },
      3 * 60 * 1000
    );
  }, [onlineStatus, updateStatus, userId]);

  // Handle page visibility with immediate updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasVisible = isPageVisibleRef.current;
      isPageVisibleRef.current = !document.hidden;

      if (isPageVisibleRef.current && !wasVisible) {
        // Page became visible - immediately update to online
        updateStatus("online");
        handleActivity();
      } else if (!isPageVisibleRef.current && wasVisible) {
        // Page became hidden - immediately update to away
        updateStatus("away");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [updateStatus, handleActivity]);

  // Set up activity listeners and beforeunload handler
  useEffect(() => {
    if (!userId) return;

    // Initial status update only once
    if (onlineStatus === "offline") {
      updateStatus("online");
      handleActivity();
    }

    // Activity events (throttled)
    let activityThrottle: NodeJS.Timeout;
    const throttledActivity = () => {
      if (activityThrottle) clearTimeout(activityThrottle);
      activityThrottle = setTimeout(handleActivity, 500); // Reduced throttle for better responsiveness
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart", "focus"];
    events.forEach((event) => {
      window.addEventListener(event, throttledActivity, { passive: true });
    });

    // More frequent status update (every 30 seconds when online)
    updateIntervalRef.current = setInterval(
      () => {
        if (isPageVisibleRef.current && onlineStatus === "online") {
          updateStatus("online");
        }
      },
      30 * 1000 // Increased frequency for better real-time updates
    );

    // Enhanced beforeunload handler (client-side only)
    const handleBeforeUnload = () => {
      setUserOffline();
    };

    // Page unload handler (more reliable than beforeunload)
    const handlePageHide = () => {
      setUserOffline();
    };

    // Set up beforeunload and pagehide only once
    if (!hasSetupBeforeUnloadRef.current) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("pagehide", handlePageHide);
      hasSetupBeforeUnloadRef.current = true;
    }

    return () => {
      // Cleanup
      events.forEach((event) => {
        window.removeEventListener(event, throttledActivity);
      });

      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
      if (activityThrottle) clearTimeout(activityThrottle);
    };
  }, [userId, handleActivity, updateStatus, onlineStatus, setUserOffline]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (hasSetupBeforeUnloadRef.current) {
        const handleBeforeUnload = () => setUserOffline();
        const handlePageHide = () => setUserOffline();

        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("pagehide", handlePageHide);
        hasSetupBeforeUnloadRef.current = false;
      }

      // Final offline status update
      if (userId) {
        setUserOffline();
      }
    };
  }, [userId, setUserOffline]);

  return { onlineStatus, updateStatus, setUserOffline };
};
