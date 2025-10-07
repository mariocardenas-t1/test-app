export interface TrackEventPayload {
    componentName: string;
    action: string;
    variant?: string;
    metadata?: Record<string, unknown>;
    timestamp?: string;
}
export interface StatsResponse {
    totals: {
        events: number;
        lastHour: number;
        components: Record<string, number>;
        actions: Record<string, number>;
        variants: Record<string, Record<string, number>>;
    };
    recentEvents: Array<{
        id: number;
        componentName: string;
        variant: string | null;
        action: string;
        metadata: Record<string, unknown> | null;
        createdAt: string;
    }>;
    lastEvent: {
        id: number;
        componentName: string;
        variant: string | null;
        action: string;
        metadata: Record<string, unknown> | null;
        createdAt: string;
    } | null;
}
export interface AuthCredentials {
    email: string;
    password: string;
}
export interface AuthenticatedUser {
    id: number;
    email: string;
    createdAt?: string;
}
export interface AuthResponse {
    message: string;
    token: string;
    user: AuthenticatedUser;
}
export interface ExportPayload {
    blob: Blob;
    filename: string;
}
declare function trackComponent(payload: TrackEventPayload): Promise<void>;
declare function getStats(): Promise<StatsResponse>;
declare function register(credentials: AuthCredentials): Promise<AuthResponse>;
declare function login(credentials: AuthCredentials): Promise<AuthResponse>;
declare function exportData(format: "csv" | "json", token: string): Promise<ExportPayload>;
export declare const trackingApi: {
    trackComponent: typeof trackComponent;
    getStats: typeof getStats;
    register: typeof register;
    login: typeof login;
    exportData: typeof exportData;
};
export {};
