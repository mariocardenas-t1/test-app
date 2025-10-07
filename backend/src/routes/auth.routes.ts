import { Router } from "express";
import { z } from "zod";
import { register, login } from "../controllers/auth.controller";
import validateRequest from "../middleware/validateRequest";

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

router.post("/register", validateRequest({ body: credentialsSchema }), register);
router.post("/login", validateRequest({ body: credentialsSchema }), login);

export default router;
