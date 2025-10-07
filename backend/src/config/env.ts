import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  env: string;
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  mongoUri: string;
  mongoDbName: string;
}

const config: AppConfig = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
  mongoUri:
    process.env.MONGODB_URI ??
    "mongodb://127.0.0.1:27017/analytics-demo",
  mongoDbName: process.env.MONGODB_DB_NAME ?? "analytics-demo",
};

export default config;
