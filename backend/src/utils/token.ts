import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import config from "../config/env";
import type { UserRecord } from "../types";

export const generateToken = (user: UserRecord): string => {
  const payload = {
    sub: user.id,
    email: user.email,
  };

  const secret = config.jwtSecret as Secret;
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};
