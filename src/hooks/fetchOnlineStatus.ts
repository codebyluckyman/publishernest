import { useEffect, useState } from "react";
import { fetchProfiles } from "./fetchProfiles";

interface Profile {
  id: string;
  online_status: "online" | "away" | "offline";
  // add other fields if needed
}

export function useProfilesPolling(intervalMs: number = 5000) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchProfiles();
        if (mounted)
          setProfiles(
            data.map((profile: any) => ({
              ...profile,
              online_status: profile.online_status as
                | "online"
                | "away"
                | "offline",
            }))
          );
        setError(null);
      } catch (err: any) {
        if (mounted) setError(err.message || "Error fetching profiles");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    timer = setInterval(fetchData, intervalMs);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [intervalMs]);

  return { profiles, loading, error };
}
