import { type NextFunction, type Request, type Response } from "express";
import { logger } from "../config/logger";
import { recordEvent, fetchStats, exportEvents } from "../services/trackingService";
import type { ExportFormat, TrackEventInput } from "../types";

export const trackEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { componentName, variant, action, metadata, timestamp } =
      req.body as TrackEventInput;

    const eventMetadata = {
      ...(metadata ?? {}),
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    } as Record<string, unknown>;

    await recordEvent({
      componentName,
      variant,
      action,
      metadata: eventMetadata,
      timestamp,
    });

    logger.info("Component interaction recorded", {
      componentName,
      variant,
      action,
    });

    res.status(201).json({
      message: "Event recorded",
    });
  } catch (error) {
    next(error);
  }
};

export const getComponentStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await fetchStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const exportComponentEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const formatParam = (req.query.format as string | undefined)?.toLowerCase();
    const format: ExportFormat = formatParam === "csv" ? "csv" : "json";
    const exportPayload = await exportEvents(format);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${exportPayload.filename}`
    );
    res.setHeader("Content-Type", exportPayload.contentType);
    res.send(exportPayload.payload);
  } catch (error) {
    next(error);
  }
};
