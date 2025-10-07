import { type NextFunction, type Request, type Response } from "express";
import { logger } from "../config/logger";
import config from "../config/env";

interface AppError extends Error {
  status?: number;
  details?: unknown;
}

const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(err.message, { stack: err.stack });

  if (res.headersSent) {
    return;
  }

  const status = err.status ?? 500;
  const response: {
    error: {
      message: string;
      details?: unknown;
      stack?: string;
    };
  } = {
    error: {
      message: err.message || "Internal Server Error",
    },
  };

  if (err.details) {
    response.error.details = err.details;
  }

  if (config.env !== "production" && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(status).json(response);
};

export default errorHandler;
