export interface UserRecord {
  id: string;
  email: string;
  createdAt?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface TrackEventInput {
  componentName: string;
  variant?: string | null;
  action: string;
  metadata?: Record<string, unknown> | null;
  timestamp?: string;
}

export interface RecordedEvent {
  id: string;
  componentName: string;
  variant: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface StatsTotals {
  events: number;
  lastHour: number;
  components: Record<string, number>;
  actions: Record<string, number>;
  variants: Record<string, Record<string, number>>;
}

export interface StatsResponse {
  totals: StatsTotals;
  recentEvents: RecordedEvent[];
  lastEvent: RecordedEvent | null;
}

export type ExportFormat = "csv" | "json";

export interface ExportResult {
  contentType: string;
  filename: string;
  payload: string;
}
