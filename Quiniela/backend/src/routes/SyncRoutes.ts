import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/AuthMiddleware";
import { setupSync, syncScores, syncKnockout } from "../controllers/SyncController";

export const SyncRoutes: Router = Router();

SyncRoutes.use(requireAuth, requireAdmin);

SyncRoutes.post("/setup", setupSync);
SyncRoutes.post("/scores", syncScores);
SyncRoutes.post("/knockout-teams", syncKnockout);
