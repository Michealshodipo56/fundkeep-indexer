import cors from "cors";
import express from "express";
import { config } from "../config.js";
import { activityRouter } from "./routes/activity.js";
import { goalsRouter } from "./routes/goals.js";
import { healthRouter } from "./routes/health.js";

export function createServer() {
  const app = express();

  app.use(cors({ origin: config.corsOrigins }));
  app.use(healthRouter);
  app.use("/api", goalsRouter);
  app.use("/api", activityRouter);

  return app;
}
