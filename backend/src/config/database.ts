import { MongoClient, type Db, type Collection, type Document } from "mongodb";
import config from "./env";
import { logger } from "./logger";

let client: MongoClient | null = null;
let database: Db | null = null;

const USERS_COLLECTION = "users";
const EVENTS_COLLECTION = "component_events";

const ensureIndexes = async (db: Db): Promise<void> => {
  await Promise.all([
    db
      .collection(USERS_COLLECTION)
      .createIndex({ email: 1 }, { unique: true, background: true }),
    db
      .collection(EVENTS_COLLECTION)
      .createIndex({ componentName: 1 }, { background: true }),
    db
      .collection(EVENTS_COLLECTION)
      .createIndex({ createdAt: -1 }, { background: true }),
    db
      .collection(EVENTS_COLLECTION)
      .createIndex(
        { componentName: 1, variant: 1 },
        { background: true }
      ),
  ]);
};

export const connectToDatabase = async (): Promise<Db> => {
  if (database) {
    return database;
  }

  const uri = config.mongoUri;
  client = new MongoClient(uri);
  await client.connect();

  database = client.db(config.mongoDbName);
  await ensureIndexes(database);

  logger.info("MongoDB connected", {
    database: config.mongoDbName,
    uri: uri.replace(/:[^:@]+@/, ":****@"),
  });

  return database;
};

export const getCollection = <TSchema extends Document>(
  name: string
): Collection<TSchema> => {
  if (!database) {
    throw new Error("Database has not been initialized. Call connectToDatabase first.");
  }

  return database.collection<TSchema>(name);
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    database = null;
    logger.info("MongoDB connection closed");
  }
};

export const collectionNames = {
  users: USERS_COLLECTION,
  events: EVENTS_COLLECTION,
} as const;
