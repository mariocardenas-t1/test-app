import { type RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/env";

const authenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const error = new Error("Authorization header missing");
    (error as Error & { status?: number }).status = 401;
    return next(error);
  }

  const [scheme, token] = authHeader.split(" ");

  if (!token || scheme.toLowerCase() !== "bearer") {
    const error = new Error("Authorization token missing or malformed");
    (error as Error & { status?: number }).status = 401;
    return next(error);
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch (error) {
    const authError = new Error("Invalid or expired token");
    (authError as Error & { status?: number }).status = 401;
    next(authError);
  }
};

export default authenticate;
