import { type Request, type Response } from "express";
import config from "../config/env";

export const getHealth = (_req: Request, res: Response): void => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.env,
    uptime: process.uptime(),
  });
};
