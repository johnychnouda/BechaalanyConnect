import { useSession } from 'next-auth/react';
import { useMemo, useCallback } from 'react';
import { refreshSessionCache } from '@/utils/api';

// Custom hook that provides centralized session management
export const useAppSession = () => {
  const { data: session, status, update } = useSession();
  
  // Memoize the session data to prevent unnecessary re-renders
  const memoizedSession = useMemo(() => session, [session]);
  
  // Memoize derived values to prevent unnecessary recalculations
  const isAuthenticated = useMemo(() => status === "authenticated" && !!session, [status, session]);
  const isLoading = useMemo(() => status === "loading", [status]);
  const user = useMemo(() => session?.user || null, [session?.user]);
  const token = useMemo(() => session?.laravelToken || null, [session?.laravelToken]);
  
  // Function to manually refresh the session cache
  const refreshCache = useCallback(async () => {
    return await refreshSessionCache();
  }, []);
  
  return {
    session: memoizedSession,
    status,
    update,
    isAuthenticated,
    isLoading,
    user,
    token,
    refreshCache,
  };
};
