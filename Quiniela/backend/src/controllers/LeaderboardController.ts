import { Request, Response, NextFunction } from 'express';
import { UserModel, IUserDocument } from '../models/User';
import { MatchModel, IMatchDocument, MatchStage } from '../models/Match';
import { PredictionModel, IPredictionDocument } from '../models/Prediction';
import { PhaseSnapshotModel } from '../models/PhaseSnapshot';
import { calculatePredictionPoints } from '../utils/ScoreCalculator';
import { computeAndSaveSnapshot, ORDERED_KNOCKOUT_STAGES } from '../services/SnapshotService';

interface ILeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  totalPoints: number;
  rank: number;
}

interface IPhaseLeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  totalPoints: number;
  predictionsCount: number;
  predictionsScored: number;
  totalFinishedMatchesInPhase: number;
  rank: number;
}

const PHASE_STAGES: Record<string, MatchStage[]> = {
  group:         ['group'],
  round_of_32:   ['round_of_32'],
  round_of_16:   ['round_of_16'],
  quarter_final: ['quarter_final'],
  semi_final:    ['semi_final'],
  final_all:     ['final', 'third_place'],
};

const PHASE_NAMES: Record<string, string> = {
  group:         'Fase de Grupos',
  round_of_32:   '16vos de Final',
  round_of_16:   'Octavos de Final',
  quarter_final: 'Cuartos de Final',
  semi_final:    'Semifinales',
  final_all:     'Final',
};

const detectActivePhaseKey = (allMatches: IMatchDocument[]): string => {
  const activeStage: MatchStage | undefined = ORDERED_KNOCKOUT_STAGES.find(
    (s: MatchStage): boolean =>
      allMatches.some((m: IMatchDocument): boolean => m.stage === s && !m.isFinished)
  );

  if (activeStage !== undefined) {
    if (activeStage === 'final' || activeStage === 'third_place') {
      return 'final_all';
    }
    return activeStage;
  }

  const lastStage: MatchStage | undefined = [...ORDERED_KNOCKOUT_STAGES]
    .reverse()
    .find((s: MatchStage): boolean =>
      allMatches.some((m: IMatchDocument): boolean => m.stage === s && m.isFinished)
    );

  if (lastStage !== undefined) {
    if (lastStage === 'final' || lastStage === 'third_place') {
      return 'final_all';
    }
    return lastStage;
  }

  return 'round_of_32';
};

export const getLeaderboard = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allMatches: IMatchDocument[] = await MatchModel.find().lean<IMatchDocument[]>();

    const activePhase: string = detectActivePhaseKey(allMatches);
    const activeStages: MatchStage[] = PHASE_STAGES[activePhase] ?? [];
    const activePhaseName: string = PHASE_NAMES[activePhase] ?? activePhase;

    const activeMatchIds: Set<string> = new Set(
      allMatches
        .filter(
          (m: IMatchDocument): boolean =>
            activeStages.includes(m.stage) && m.isFinished
        )
        .map((m: IMatchDocument): string => String(m._id))
    );

    const matchById: Map<string, IMatchDocument> = new Map();
    allMatches.forEach((m: IMatchDocument): void => {
      if (activeMatchIds.has(String(m._id))) {
        matchById.set(String(m._id), m);
      }
    });

    const [users, predictions] = await Promise.all([
      UserModel.find({ isAdmin: false, isActive: { $ne: false } }).lean<IUserDocument[]>(),
      PredictionModel.find().lean<IPredictionDocument[]>(),
    ]);

    const totalsByUser: Map<string, number> = new Map();

    predictions.forEach((prediction: IPredictionDocument): void => {
      const match: IMatchDocument | undefined = matchById.get(String(prediction.match));
      if (match === undefined) return;
      if (match.homeScore === null || match.awayScore === null) return;

      const points: number = calculatePredictionPoints({
        predictedHomeScore: prediction.predictedHomeScore,
        predictedAwayScore: prediction.predictedAwayScore,
        actualHomeScore: match.homeScore,
        actualAwayScore: match.awayScore,
        stage: match.stage,
      });
      const userKey: string = String(prediction.user);
      totalsByUser.set(userKey, (totalsByUser.get(userKey) ?? 0) + points);
    });

    const unranked: Omit<ILeaderboardEntry, 'rank'>[] = users.map(
      (user: IUserDocument): Omit<ILeaderboardEntry, 'rank'> => ({
        userId: String(user._id),
        username: user.username,
        displayName: user.displayName,
        totalPoints: totalsByUser.get(String(user._id)) ?? 0,
      })
    );

    unranked.sort(
      (a: Omit<ILeaderboardEntry, 'rank'>, b: Omit<ILeaderboardEntry, 'rank'>): number =>
        b.totalPoints - a.totalPoints
    );

    const entries: ILeaderboardEntry[] = unranked.map(
      (entry: Omit<ILeaderboardEntry, 'rank'>, index: number): ILeaderboardEntry => ({
        ...entry,
        rank: index + 1,
      })
    );

    res.status(200).json({ entries, activePhase, activePhaseName });
  } catch (error: unknown) {
    next(error);
  }
};

export const getLeaderboardByPhase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const phases: MatchStage[] | undefined = PHASE_STAGES[req.params.phase];
    if (phases === undefined) {
      res.status(400).json({ message: 'Invalid phase' });
      return;
    }

    const [users, stageMatches, predictions] = await Promise.all([
      UserModel.find({ isAdmin: false, isActive: { $ne: false } }).lean<IUserDocument[]>(),
      MatchModel.find({ stage: { $in: phases }, isFinished: true }).lean<IMatchDocument[]>(),
      PredictionModel.find().lean<IPredictionDocument[]>(),
    ]);

    const matchById: Map<string, IMatchDocument> = new Map();
    stageMatches.forEach((m: IMatchDocument): void => {
      matchById.set(String(m._id), m);
    });

    interface IUserStats {
      totalPoints: number;
      predictionsCount: number;
      predictionsScored: number;
    }

    const statsByUser: Map<string, IUserStats> = new Map();

    predictions.forEach((prediction: IPredictionDocument): void => {
      const match: IMatchDocument | undefined = matchById.get(String(prediction.match));
      if (match === undefined) return;
      if (match.homeScore === null || match.awayScore === null) return;

      const points: number = calculatePredictionPoints({
        predictedHomeScore: prediction.predictedHomeScore,
        predictedAwayScore: prediction.predictedAwayScore,
        actualHomeScore: match.homeScore,
        actualAwayScore: match.awayScore,
        stage: match.stage,
      });

      const uid: string = String(prediction.user);
      const cur: IUserStats = statsByUser.get(uid) ?? {
        totalPoints: 0,
        predictionsCount: 0,
        predictionsScored: 0,
      };
      statsByUser.set(uid, {
        totalPoints: cur.totalPoints + points,
        predictionsCount: cur.predictionsCount + 1,
        predictionsScored: cur.predictionsScored + (points > 0 ? 1 : 0),
      });
    });

    const totalFinishedMatchesInPhase: number = stageMatches.length;

    const unranked: Omit<IPhaseLeaderboardEntry, 'rank'>[] = users.map(
      (user: IUserDocument): Omit<IPhaseLeaderboardEntry, 'rank'> => {
        const stats: IUserStats = statsByUser.get(String(user._id)) ?? {
          totalPoints: 0,
          predictionsCount: 0,
          predictionsScored: 0,
        };
        return {
          userId: String(user._id),
          username: user.username,
          displayName: user.displayName,
          totalPoints: stats.totalPoints,
          predictionsCount: stats.predictionsCount,
          predictionsScored: stats.predictionsScored,
          totalFinishedMatchesInPhase,
        };
      }
    );

    unranked.sort(
      (a: Omit<IPhaseLeaderboardEntry, 'rank'>, b: Omit<IPhaseLeaderboardEntry, 'rank'>): number =>
        b.totalPoints - a.totalPoints
    );

    const entries: IPhaseLeaderboardEntry[] = unranked.map(
      (entry: Omit<IPhaseLeaderboardEntry, 'rank'>, index: number): IPhaseLeaderboardEntry => ({
        ...entry,
        rank: index + 1,
      })
    );

    res.status(200).json({ entries, totalFinishedMatchesInPhase });
  } catch (error: unknown) {
    next(error);
  }
};

export const manualSnapshot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phase } = req.params;
    const validPhases: string[] = Object.keys(PHASE_STAGES);
    if (!validPhases.includes(phase)) {
      res.status(400).json({ message: 'Invalid phase' });
      return;
    }
    await computeAndSaveSnapshot(phase);
    res.status(200).json({ message: `Snapshot guardado para fase: ${phase}` });
  } catch (error: unknown) {
    next(error);
  }
};

export const getSnapshots = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const snapshots = await PhaseSnapshotModel.find(
      {},
      { phase: 1, phaseName: 1, totalMatches: 1, createdAt: 1 }
    )
      .sort({ createdAt: 1 })
      .lean();
    res.status(200).json({ snapshots });
  } catch (error: unknown) {
    next(error);
  }
};

export const getSnapshotByPhase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const snapshot = await PhaseSnapshotModel.findOne({ phase: req.params.phase }).lean();
    if (snapshot === null) {
      res.status(404).json({ message: 'Snapshot not found for this phase' });
      return;
    }
    res.status(200).json({ snapshot });
  } catch (error: unknown) {
    next(error);
  }
};
