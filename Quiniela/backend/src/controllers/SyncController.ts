import { Request, Response, NextFunction } from "express";
import {
  initializeApiFootballIds,
  syncLiveScores,
  syncKnockoutTeams,
} from "../services/SyncService";

export const setupSync = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const updated = await initializeApiFootballIds();
    res.status(200).json({ updated });
  } catch (error) {
    next(error);
  }
};

export const syncScores = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const updated = await syncLiveScores();
    res.status(200).json({ updated });
  } catch (error) {
    next(error);
  }
};

export const syncKnockout = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const upserted = await syncKnockoutTeams();
    res.status(200).json({ upserted });
  } catch (error) {
    next(error);
  }
};
