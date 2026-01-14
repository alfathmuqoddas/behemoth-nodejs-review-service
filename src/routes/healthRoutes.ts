import { Router } from "express";
import sequelize from "../config/database";
import { healthState } from "../utils/healthState";

const router = Router();

/**
 * LIVENESS
 * - Only checks process health
 * - Never checks DB
 */
router.get("/liveness", (_req, res) => {
  if (healthState.isShuttingDown()) {
    return res.status(500).json({ status: "shutting-down" });
  }
  res.status(200).json({ status: "alive" });
});

/**
 * READINESS
 * - Traffic safety
 * - Fail when DB is unavailable
 */
router.get("/readiness", async (_req, res) => {
  if (!healthState.isStarted() || healthState.isShuttingDown()) {
    return res.status(503).json({ status: "not-ready" });
  }

  try {
    await sequelize.authenticate();
    res.status(200).json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "db-unavailable" });
  }
});

/**
 * STARTUP
 * - Only indicates app boot completion
 */
router.get("/startup", (_req, res) => {
  if (!healthState.isStarted()) {
    return res.status(503).json({ status: "starting" });
  }
  res.status(200).json({ status: "started" });
});

export default router;
