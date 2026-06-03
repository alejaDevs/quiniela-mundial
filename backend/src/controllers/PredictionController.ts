import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { PredictionModel, IPredictionDocument } from '../models/Prediction';
import { MatchModel, IMatchDocument } from '../models/Match';
import { isMatchLocked } from '../utils/DateLockValidator';

interface IUpsertBody {
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
}

const parseBody = (body: unknown): IUpsertBody | null => {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const candidate: Record<string, unknown> = body as Record<string, unknown>;
  if (
    typeof candidate.matchId !== 'string' ||
    !Types.ObjectId.isValid(candidate.matchId)
  ) {
    return null;
  }
  if (
    typeof candidate.predictedHomeScore !== 'number' ||
    typeof candidate.predictedAwayScore !== 'number'
  ) {
    return null;
  }
  if (
    !Number.isInteger(candidate.predictedHomeScore) ||
    !Number.isInteger(candidate.predictedAwayScore) ||
    candidate.predictedHomeScore < 0 ||
    candidate.predictedAwayScore < 0
  ) {
    return null;
  }
  return {
    matchId: candidate.matchId,
    predictedHomeScore: candidate.predictedHomeScore,
    predictedAwayScore: candidate.predictedAwayScore
  };
};

export const listUserPredictions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.authUser === undefined) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    const predictions: IPredictionDocument[] = await PredictionModel.find({
      user: new Types.ObjectId(req.authUser.userId)
    }).lean<IPredictionDocument[]>();
    res.status(200).json({ predictions });
  } catch (error: unknown) {
    next(error);
  }
};

export const upsertPrediction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.authUser === undefined) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const body: IUpsertBody | null = parseBody(req.body);
    if (body === null) {
      res.status(400).json({ message: 'Invalid prediction payload' });
      return;
    }

    const match: IMatchDocument | null = await MatchModel.findById(body.matchId);
    if (match === null) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    if (isMatchLocked(match.kickoffDate)) {
      res.status(403).json({ message: 'Predictions are locked for this match' });
      return;
    }

    const userId: Types.ObjectId = new Types.ObjectId(req.authUser.userId);
    const matchId: Types.ObjectId = new Types.ObjectId(body.matchId);

    const prediction: IPredictionDocument | null =
      await PredictionModel.findOneAndUpdate(
        { user: userId, match: matchId },
        {
          user: userId,
          match: matchId,
          predictedHomeScore: body.predictedHomeScore,
          predictedAwayScore: body.predictedAwayScore
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

    res.status(200).json({ prediction });
  } catch (error: unknown) {
    next(error);
  }
};
