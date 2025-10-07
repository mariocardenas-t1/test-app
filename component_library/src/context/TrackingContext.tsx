import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  trackingApi,
  type AuthCredentials,
  type AuthResponse,
  type ExportPayload,
  type StatsResponse,
  type TrackEventPayload,
  type AuthenticatedUser,
} from "../services/trackingApi";

interface TrackingContextValue {
  stats: StatsResponse | null;
  statsError: string | null;
  isStatsLoading: boolean;
  lastUpdated: Date | null;
  track: (event: TrackEventPayload) => void;
  refreshStats: () => Promise<void>;
  interactionCount: number;
  register: (credentials: AuthCredentials) => Promise<AuthResponse>;
  login: (credentials: AuthCredentials) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  authError: string | null;
  isAuthLoading: boolean;
  exportData: (format: "csv" | "json") => Promise<ExportPayload>;
}

const TrackingContext = createContext<TrackingContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "analyticsAuth";

interface StoredAuth {
  token: string;
  user: AuthenticatedUser;
}

const readStoredAuth = (): StoredAuth | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch (error) {
    console.error("Failed to read stored auth", error);
    return null;
  }
};

const writeStoredAuth = (auth: StoredAuth | null) => {
  if (typeof window === "undefined") return;
  if (!auth) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

const TrackingProvider = ({ children }: { children: ReactNode }) => {
  const storedAuth = useRef<StoredAuth | null>(readStoredAuth());
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [token, setToken] = useState<string | null>(storedAuth.current?.token ?? null);
  const [user, setUser] = useState<AuthenticatedUser | null>(storedAuth.current?.user ?? null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const response = await trackingApi.getStats();
      setStats(response);
      setStatsError(null);
      setLastUpdated(new Date());
    } catch (error) {
      setStatsError((error as Error).message);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats().catch((error) => console.error("Failed to fetch stats", error));
    const interval = window.setInterval(() => {
      fetchStats().catch((error) => console.error("Failed to fetch stats", error));
    }, 5000);

    return () => window.clearInterval(interval);
  }, [fetchStats]);

  const track = useCallback((event: TrackEventPayload) => {
    const timestamp = new Date().toISOString();
    trackingApi
      .trackComponent({ ...event, timestamp })
      .then(() => {
        setStats((previous) => {
          if (!previous) {
            return previous;
          }

          const variantKey = event.variant ?? "default";

          const updatedTotals = {
            events: previous.totals.events + 1,
            lastHour: previous.totals.lastHour + 1,
            components: {
              ...previous.totals.components,
              [event.componentName]:
                (previous.totals.components[event.componentName] || 0) + 1,
            },
            actions: {
              ...previous.totals.actions,
              [event.action]: (previous.totals.actions[event.action] || 0) + 1,
            },
            variants: {
              ...previous.totals.variants,
              [event.componentName]: {
                ...(previous.totals.variants[event.componentName] || {}),
                [variantKey]:
                  ((previous.totals.variants[event.componentName] || {})[
                    variantKey
                  ] || 0) + 1,
              },
            },
          };

          const recentEvent = {
            id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            componentName: event.componentName,
            variant: event.variant ?? null,
            action: event.action,
            metadata: event.metadata ?? null,
            createdAt: timestamp,
          };

          return {
            totals: updatedTotals,
            recentEvents: [recentEvent, ...previous.recentEvents].slice(0, 20),
            lastEvent: recentEvent,
          };
        });
        setLastUpdated(new Date());
      })
      .catch((error) => {
        console.error("Failed to track component interaction", error);
      });
  }, []);

  const persistAuth = useCallback((auth: StoredAuth | null) => {
    writeStoredAuth(auth);
    storedAuth.current = auth;
  }, []);

  const register = useCallback(
    async (credentials: AuthCredentials) => {
      try {
        setIsAuthLoading(true);
        const response = await trackingApi.register(credentials);
        setToken(response.token);
        setUser(response.user);
        setAuthError(null);
        persistAuth({ token: response.token, user: response.user });
        return response;
      } catch (error) {
        const message = (error as Error).message;
        setAuthError(message);
        throw error;
      } finally {
        setIsAuthLoading(false);
      }
    },
    [persistAuth]
  );

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      try {
        setIsAuthLoading(true);
        const response = await trackingApi.login(credentials);
        setToken(response.token);
        setUser(response.user);
        setAuthError(null);
        persistAuth({ token: response.token, user: response.user });
        return response;
      } catch (error) {
        const message = (error as Error).message;
        setAuthError(message);
        throw error;
      } finally {
        setIsAuthLoading(false);
      }
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    persistAuth(null);
  }, [persistAuth]);

  const exportData = useCallback(
    async (format: "csv" | "json") => {
      if (!token) {
        throw new Error("Authentication required for export");
      }

      return await trackingApi.exportData(format, token);
    },
    [token]
  );

  const value = useMemo<TrackingContextValue>(
    () => ({
      stats,
      statsError,
      isStatsLoading,
      lastUpdated,
      track,
      refreshStats: fetchStats,
      interactionCount: stats?.totals.events ?? 0,
      register,
      login,
      logout,
      isAuthenticated: Boolean(token),
      user,
      authError,
      isAuthLoading,
      exportData,
    }),
    [
      stats,
      statsError,
      isStatsLoading,
      lastUpdated,
      track,
      fetchStats,
      register,
      login,
      logout,
      token,
      user,
      authError,
      isAuthLoading,
      exportData,
    ]
  );

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
};

const useTracking = (): TrackingContextValue => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error("useTracking must be used within a TrackingProvider");
  }
  return context;
};

export { TrackingProvider, useTracking };
