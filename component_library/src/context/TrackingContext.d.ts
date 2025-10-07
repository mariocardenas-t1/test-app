import { type ReactNode } from "react";
import { type AuthCredentials, type AuthResponse, type ExportPayload, type StatsResponse, type TrackEventPayload, type AuthenticatedUser } from "../services/trackingApi";
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
declare const TrackingProvider: ({ children }: {
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
declare const useTracking: () => TrackingContextValue;
export { TrackingProvider, useTracking };
