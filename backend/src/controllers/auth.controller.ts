import { type NextFunction, type Request, type Response } from "express";
import { logger } from "../config/logger";
import { createUser, authenticateUser } from "../services/userService";
import { generateToken } from "../utils/token";
import type { AuthCredentials } from "../types";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as AuthCredentials;
    const user = await createUser(email, password);
    const token = generateToken(user);

    logger.info("User registration successful", { userId: user.id });

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as AuthCredentials;
    const user = await authenticateUser(email, password);

    if (!user) {
      const authError = new Error("Invalid email or password");
      (authError as Error & { status?: number }).status = 401;
      throw authError;
    }

    const token = generateToken(user);

    logger.info("User login", { userId: user.id });

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};
