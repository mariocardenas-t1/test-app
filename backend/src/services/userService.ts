import bcrypt from "bcryptjs";
import { getCollection, collectionNames } from "../config/database";
import { logger } from "../config/logger";
import type { UserRecord } from "../types";
import { ObjectId, type Document } from "mongodb";

interface UserDocument extends Document {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const toUserRecord = (doc: UserDocument): UserRecord => {
  if (!doc._id) {
    throw new Error("User document is missing _id");
  }

  return {
    id: doc._id.toHexString(),
    email: doc.email,
    createdAt: doc.createdAt.toISOString(),
  };
};

export const createUser = async (
  email: string,
  password: string
): Promise<UserRecord> => {
  const users = getCollection<UserDocument>(collectionNames.users);
  const normalizedEmail = normalizeEmail(email);

  const existing = await users.findOne({ email: normalizedEmail });
  if (existing) {
    const error = new Error("Email is already registered");
    (error as Error & { status?: number }).status = 409;
    throw error;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const now = new Date();
  const insertResult = await users.insertOne({
    email: normalizedEmail,
    passwordHash,
    createdAt: now,
  });

  const userDoc: UserDocument = {
    _id: insertResult.insertedId,
    email: normalizedEmail,
    passwordHash,
    createdAt: now,
  };

  logger.info("User registered", { userId: insertResult.insertedId.toHexString() });

  return toUserRecord(userDoc);
};

export const authenticateUser = async (
  email: string,
  password: string
): Promise<UserRecord | null> => {
  const users = getCollection<UserDocument>(collectionNames.users);
  const normalizedEmail = normalizeEmail(email);

  const userDoc = await users.findOne({ email: normalizedEmail });
  if (!userDoc) {
    return null;
  }

  const isValid = bcrypt.compareSync(password, userDoc.passwordHash);
  if (!isValid) {
    return null;
  }

  return toUserRecord(userDoc);
};
