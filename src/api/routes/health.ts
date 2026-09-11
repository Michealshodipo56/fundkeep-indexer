import { Router } from "express";
import { getSyncState } from "../../db.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  const { lastLedger } = getSyncState();
  res.json({ ok: true, lastLedger });
});
