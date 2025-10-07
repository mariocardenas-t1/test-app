import express, { type Application } from "express";
import cors, { type CorsOptions } from "cors";
import config from "./config/env";
import { requestLogger } from "./config/logger";
import errorHandler from "./middleware/errorHandler";
import notFoundHandler from "./middleware/notFoundHandler";
import authRoutes from "./routes/auth.routes";
import componentRoutes from "./routes/components.routes";
import healthRoutes from "./routes/health.routes";

const app: Application = express();

const corsOptions: CorsOptions = {
  origin: config.env === "development" ? "*" : false,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/components", componentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
