import { ObjectId, type Collection, type Document } from "mongodb";
import { getCollection, collectionNames } from "../config/database";
import type {
  ExportFormat,
  ExportResult,
  RecordedEvent,
  StatsResponse,
  TrackEventInput,
} from "../types";

interface ComponentEventDocument extends Document {
  _id?: ObjectId;
  componentName: string;
  variant?: string | null;
  action: string;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

const getEventsCollection = (): Collection<ComponentEventDocument> =>
  getCollection<ComponentEventDocument>(collectionNames.events);

const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue =
    typeof value === "object" ? JSON.stringify(value) : String(value);

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const toRecordedEvent = (doc: ComponentEventDocument): RecordedEvent => {
  if (!doc._id) {
    throw new Error("Event document is missing _id");
  }

  return {
    id: doc._id.toHexString(),
    componentName: doc.componentName,
    variant: doc.variant ?? null,
    action: doc.action,
    metadata: doc.metadata ?? null,
    createdAt: doc.createdAt.toISOString(),
  };
};

export const recordEvent = async ({
  componentName,
  variant,
  action,
  metadata,
  timestamp,
}: TrackEventInput): Promise<void> => {
  const events = getEventsCollection();
  const createdAt = timestamp ? new Date(timestamp) : new Date();

  await events.insertOne({
    componentName,
    variant: variant ?? null,
    action,
    metadata: metadata ?? null,
    createdAt,
  });
};

export const fetchStats = async (): Promise<StatsResponse> => {
  const events = getEventsCollection();
  const lastHourDate = new Date(Date.now() - 60 * 60 * 1000);

  const [
    totalCount,
    lastHourCount,
    perComponentAgg,
    perActionAgg,
    perVariantAgg,
    recentEventDocs,
  ] = await Promise.all([
    events.countDocuments(),
    events.countDocuments({ createdAt: { $gte: lastHourDate } }),
    events
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$componentName", count: { $sum: 1 } } },
      ])
      .toArray(),
    events
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$action", count: { $sum: 1 } } },
      ])
      .toArray(),
    events
      .aggregate<{
        _id: { componentName: string; variant: string | null };
        count: number;
      }>([
        {
          $group: {
            _id: { componentName: "$componentName", variant: "$variant" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray(),
    events
      .find()
      .sort({ createdAt: -1, _id: -1 })
      .limit(20)
      .toArray(),
  ]);

  const components = perComponentAgg.reduce<Record<string, number>>((acc, item) => {
    const name = item._id ?? "unknown";
    acc[name] = item.count;
    return acc;
  }, {});

  const actions = perActionAgg.reduce<Record<string, number>>((acc, item) => {
    const name = item._id ?? "unknown";
    acc[name] = item.count;
    return acc;
  }, {});

  const variants = perVariantAgg.reduce<Record<string, Record<string, number>>>(
    (acc, item) => {
      const componentName = item._id.componentName ?? "unknown";
      const variantName = item._id.variant ?? "default";
      if (!acc[componentName]) {
        acc[componentName] = {};
      }
      acc[componentName][variantName] = item.count;
      return acc;
    },
    {}
  );

  const recentEvents = recentEventDocs.map(toRecordedEvent);
  const lastEvent = recentEvents[0] ?? null;

  return {
    totals: {
      events: totalCount,
      lastHour: lastHourCount,
      components,
      actions,
      variants,
    },
    recentEvents,
    lastEvent,
  };
};

export const exportEvents = async (
  format: ExportFormat = "json"
): Promise<ExportResult> => {
  const events = getEventsCollection();
  const eventDocs = await events
    .find()
    .sort({ createdAt: 1, _id: 1 })
    .toArray();

  const records = eventDocs.map(toRecordedEvent);

  if (format === "csv") {
    const header: Array<keyof RecordedEvent> = [
      "id",
      "componentName",
      "variant",
      "action",
      "metadata",
      "createdAt",
    ];

    const rows = records.map((event) =>
      header.map((key) => escapeCsvValue(event[key])).join(",")
    );

    return {
      contentType: "text/csv",
      filename: `component-events-${Date.now()}.csv`,
      payload: [header.join(","), ...rows].join("\n"),
    };
  }

  return {
    contentType: "application/json",
    filename: `component-events-${Date.now()}.json`,
    payload: JSON.stringify({ events: records }, null, 2),
  };
};
