import { useState, useEffect, useCallback, useMemo } from "react";

export interface MiniStackHealth {
  version: string;
  edition: string;
  services: Record<string, string>;
  status: "running" | "error" | "unknown";
  loading: boolean;
}

export const useHealth = () => {
  const [health, setHealth] = useState<MiniStackHealth>({
    version: "",
    edition: "",
    services: {},
    status: "unknown",
    loading: true,
  });

  const fetchHealth = useCallback(async () => {
    try {
      // Use relative URL to leverage Vite/Nginx proxy and avoid CORS issues
      const response = await fetch("/_ministack/health");
      if (response.ok) {
        const data = await response.json();
        setHealth({
          version: data.version || "unknown",
          edition: data.edition || "unknown",
          services: data.services || {},
          status: "running",
          loading: false,
        });
      } else {
        console.warn(`MiniStack health check returned status ${response.status}`);
        // If it's not OK but we got a response, it might be that some services are down
        // but MiniStack itself is still running. We check if it returns valid JSON.
        try {
          const data = await response.json();
          if (data.version) {
            setHealth({
              version: data.version,
              edition: data.edition || "unknown",
              services: data.services || {},
              status: "running", // Consider it running if we got a valid version
              loading: false,
            });
            return;
          }
        } catch (_jsonErr) {
          // Response body is not JSON or doesn't have a version
        }
        setHealth((prev) => ({ ...prev, status: "error", loading: false }));
      }
    } catch (err) {
      console.error("Failed to fetch MiniStack health", err);
      setHealth((prev) => ({ ...prev, status: "error", loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return useMemo(
    () => ({
      ...health,
      refresh: fetchHealth,
    }),
    [health, fetchHealth]
  );
};
