import { Request, Response, NextFunction } from 'express';
import { UserModel, IUserDocument } from '../models/User';
import { MatchModel, IMatchDocument } from '../models/Match';
import { PredictionModel, IPredictionDocument } from '../models/Prediction';
import { calculatePredictionPoints } from '../utils/ScoreCalculator';

interface ILeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  totalPoints: number;
  rank: number;
}

export const getLeaderboard = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [users, finishedMatches, predictions] = await Promise.all([
      UserModel.find({ isAdmin: false }).lean<IUserDocument[]>(),
      MatchModel.find({ isFinished: true }).lean<IMatchDocument[]>(),
      PredictionModel.find().lean<IPredictionDocument[]>()
    ]);

    const matchById: Map<string, IMatchDocument> = new Map();
    finishedMatches.forEach((match: IMatchDocument): void => {
      matchById.set(String(match._id), match);
    });

    const totalsByUser: Map<string, number> = new Map();

    predictions.forEach((prediction: IPredictionDocument): void => {
      const match: IMatchDocument | undefined = matchById.get(
        String(prediction.match)
      );
      if (match === undefined) {
        return;
      }
      if (match.homeScore === null || match.awayScore === null) {
        return;
      }
      const points: number = calculatePredictionPoints({
        predictedHomeScore: prediction.predictedHomeScore,
        predictedAwayScore: prediction.predictedAwayScore,
        actualHomeScore: match.homeScore,
        actualAwayScore: match.awayScore
      });
      const userKey: string = String(prediction.user);
      totalsByUser.set(userKey, (totalsByUser.get(userKey) ?? 0) + points);
    });

    const unranked: Omit<ILeaderboardEntry, 'rank'>[] = users.map(
      (user: IUserDocument): Omit<ILeaderboardEntry, 'rank'> => ({
        userId: String(user._id),
        username: user.username,
        displayName: user.displayName,
        totalPoints: totalsByUser.get(String(user._id)) ?? 0
      })
    );

    unranked.sort(
      (
        a: Omit<ILeaderboardEntry, 'rank'>,
        b: Omit<ILeaderboardEntry, 'rank'>
      ): number => b.totalPoints - a.totalPoints
    );

    const entries: ILeaderboardEntry[] = unranked.map(
      (entry: Omit<ILeaderboardEntry, 'rank'>, index: number): ILeaderboardEntry => ({
        ...entry,
        rank: index + 1
      })
    );

    res.status(200).json({ entries });
  } catch (error: unknown) {
    next(error);
  }
};
