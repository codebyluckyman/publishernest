import React, { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { updateOnlineStatus } from "@/hooks/updateOnlineStatus";

type Status = "online" | "away" | "offline";

interface OnlineStatusContextProps {
  setStatus: (newStatus: Status) => void;
  status: Status;
}

const OnlineStatusContext = createContext<OnlineStatusContextProps | undefined>(
  undefined
);

export const OnlineStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [status, setStatusState] = React.useState<Status>("offline");
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const setStatus = (newStatus: Status) => {
    console.log("User status effect triggered");
    setStatusState(newStatus);
    if (user) updateOnlineStatus(user.id, newStatus);
  };

  useEffect(() => {
    if (!user && status !== "offline") {
      setStatus("offline");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setStatus("online");

    const setAway = () => setStatus("away");
    const setOffline = () => setStatus("offline");

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      setOffline();
      // Ensure the status is updated before the tab closes
      event.preventDefault();
      return (event.returnValue = "");
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setAway();
      } else {
        resetIdleTimer();
      }
    };

    const resetIdleTimer = () => {
      // Clear existing debounce timeout
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      // Only update status if we're not already online
      if (status !== "online") {
        debounceTimeout.current = setTimeout(() => {
          if (idleTimeout.current) clearTimeout(idleTimeout.current);
          setStatus("online");
          idleTimeout.current = setTimeout(setAway, 5 * 60 * 1000); // 5 minutes
        }, 5 * 60 * 1000); // Debounce for 1 second
      }

      // Reset idle timeout without updating status
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
      idleTimeout.current = setTimeout(setAway, 5 * 60 * 1000);
    };

    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("visibilitychange", handleVisibilityChange);

    idleTimeout.current = setTimeout(setAway, 3 * 60 * 1000);

    return () => {
      setOffline();
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  return (
    <OnlineStatusContext.Provider value={{ setStatus, status }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = () => {
  const ctx = useContext(OnlineStatusContext);
  if (!ctx)
    throw new Error("useOnlineStatus must be used within OnlineStatusProvider");
  return ctx;
};
