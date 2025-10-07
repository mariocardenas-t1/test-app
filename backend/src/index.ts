import type { Server } from "http";
import app from "./app";
import config from "./config/env";
import { logger } from "./config/logger";
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "./config/database";

let server: Server | undefined;

const start = async (): Promise<void> => {
  try {
    await connectToDatabase();
    server = app.listen(config.port, () => {
      logger.info(`Analytics backend running on port ${config.port}`);
    });
  } catch (error) {
    logger.error("Failed to start server", {
      error: (error as Error).message,
    });
    process.exit(1);
  }
};

void start();

const shutdown = (signal: NodeJS.Signals): void => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  void (async () => {
    try {
      await disconnectFromDatabase();
    } catch (error) {
      logger.error("Error during database disconnection", {
        error: (error as Error).message,
      });
    }

    if (server) {
      server.close(() => {
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  })();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled promise rejection", { reason });
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught exception", { error: error.message });
  void (async () => {
    await disconnectFromDatabase();
    process.exit(1);
  })();
});
