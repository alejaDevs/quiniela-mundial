import { UserModel, IUserDocument } from '../models/User';
import { MatchModel, IMatchDocument, MatchStage } from '../models/Match';
import { PredictionModel, IPredictionDocument } from '../models/Prediction';
import { PhaseSnapshotModel, IPhaseSnapshotEntry } from '../models/PhaseSnapshot';
import { calculatePredictionPoints } from '../utils/ScoreCalculator';

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

interface IUserStats {
  totalPoints: number;
  predictionsCount: number;
  predictionsScored: number;
}

export const computeAndSaveSnapshot = async (phase: string): Promise<void> => {
  const stages: MatchStage[] | undefined = PHASE_STAGES[phase];
  if (stages === undefined) {
    return;
  }

  const phaseName: string = PHASE_NAMES[phase] ?? phase;

  const [users, stageMatches, predictions] = await Promise.all([
    UserModel.find({ isAdmin: false, isActive: { $ne: false } }).lean<IUserDocument[]>(),
    MatchModel.find({ stage: { $in: stages }, isFinished: true }).lean<IMatchDocument[]>(),
    PredictionModel.find().lean<IPredictionDocument[]>(),
  ]);

  const matchById: Map<string, IMatchDocument> = new Map();
  stageMatches.forEach((m: IMatchDocument): void => {
    matchById.set(String(m._id), m);
  });

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

  const totalMatches: number = stageMatches.length;

  const unranked: Omit<IPhaseSnapshotEntry, 'rank'>[] = users.map(
    (user: IUserDocument): Omit<IPhaseSnapshotEntry, 'rank'> => {
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
      };
    }
  );

  unranked.sort(
    (a: Omit<IPhaseSnapshotEntry, 'rank'>, b: Omit<IPhaseSnapshotEntry, 'rank'>): number =>
      b.totalPoints - a.totalPoints
  );

  const entries: IPhaseSnapshotEntry[] = unranked.map(
    (entry: Omit<IPhaseSnapshotEntry, 'rank'>, index: number): IPhaseSnapshotEntry => ({
      ...entry,
      rank: index + 1,
    })
  );

  await PhaseSnapshotModel.findOneAndUpdate(
    { phase },
    { phase, phaseName, totalMatches, entries },
    { upsert: true, new: true }
  );
};

export const ORDERED_KNOCKOUT_STAGES: MatchStage[] = [
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'third_place',
  'final',
];
