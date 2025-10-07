import morgan, { type StreamOptions } from "morgan";
import config from "./env";

type LogMetadata = Record<string, unknown>;

const stream: StreamOptions = {
  write: (message: string) => {
    console.log(message.trim());
  },
};

const skip = (): boolean => config.env === "test";

export const requestLogger = morgan("combined", { stream, skip });

export const logger = {
  info: (message: string, meta: LogMetadata = {}): void => {
    console.log(JSON.stringify({ level: "info", message, ...meta }));
  },
  error: (message: string, meta: LogMetadata = {}): void => {
    console.error(JSON.stringify({ level: "error", message, ...meta }));
  },
};
