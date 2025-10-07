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
    id: string;
    componentName: string;
    variant: string | null;
    action: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  }>;
  lastEvent: {
    id: string;
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
  id: string;
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

const resolveApiBaseUrl = (): string => {
  if (typeof window !== "undefined" && window.__ANALYTICS_API_URL__) {
    return window.__ANALYTICS_API_URL__;
  }

  const processEnv =
    typeof process !== "undefined"
      ? (process.env?.VITE_ANALYTICS_API_URL as string | undefined)
      : undefined;

  return processEnv || "http://localhost:4000";
};

const API_BASE_URL = resolveApiBaseUrl();

type RequestInitWithBody = RequestInit & { body?: BodyInit | null };

async function request<T>(path: string, options: RequestInitWithBody = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = isJson
      ? (payload?.error?.message as string) || payload?.message || response.statusText
      : response.statusText;
    throw new Error(errorMessage);
  }

  return payload as T;
}

async function trackComponent(payload: TrackEventPayload): Promise<void> {
  await request("/api/components/track", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function getStats(): Promise<StatsResponse> {
  return await request<StatsResponse>("/api/components/stats");
}

async function register(credentials: AuthCredentials): Promise<AuthResponse> {
  return await request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

async function login(credentials: AuthCredentials): Promise<AuthResponse> {
  return await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

async function exportData(
  format: "csv" | "json",
  token: string
): Promise<ExportPayload> {
  const response = await fetch(`${API_BASE_URL}/api/components/export?format=${format}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to export data");
  }

  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename=(.+)/i);
  const filename = match ? match[1].replace(/"/g, "").trim() : `export.${format}`;
  const blob = await response.blob();

  return { blob, filename };
}

export const trackingApi = {
  trackComponent,
  getStats,
  register,
  login,
  exportData,
};
