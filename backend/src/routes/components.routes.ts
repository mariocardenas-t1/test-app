import { Router } from "express";
import { z } from "zod";
import validateRequest from "../middleware/validateRequest";
import authenticate from "../middleware/authenticate";
import {
  trackEvent,
  getComponentStats,
  exportComponentEvents,
} from "../controllers/components.controller";

const router = Router();

const trackSchema = z.object({
  componentName: z.string().min(1, "componentName is required"),
  variant: z.string().optional(),
  action: z.string().min(1, "action is required"),
  metadata: z.record(z.string(), z.any()).optional(),
  timestamp: z.string().datetime().optional(),
});

const exportQuerySchema = z.object({
  format: z.enum(["csv", "json"]).optional(),
});

router.post("/track", validateRequest({ body: trackSchema }), trackEvent);
router.get("/stats", getComponentStats);
router.get(
  "/export",
  authenticate,
  validateRequest({ query: exportQuerySchema }),
  exportComponentEvents
);

export default router;
