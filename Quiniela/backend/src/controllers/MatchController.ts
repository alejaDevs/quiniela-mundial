import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { MatchModel, IMatchDocument, MatchStage } from '../models/Match';
import { PredictionModel, IPredictionDocument } from '../models/Prediction';
import { UserModel, IUserDocument } from '../models/User';
import { calculatePredictionPoints } from '../utils/ScoreCalculator';
import { computeAndSaveSnapshot } from '../services/SnapshotService';
import { resolveMatchWinner, MatchSide } from '../utils/MatchWinner';
import { PHASE_STAGES, stageToPhaseKey } from '../config/Phases';

const VALID_STAGES: MatchStage[] = [
  'group',
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'third_place',
  'final'
];

const isString = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0;
};

const isCountryCode = (value: unknown): value is string => {
  return typeof value === 'string' && /^[a-zA-Z]{2}(-[a-zA-Z]{2,4})?$/.test(value);
};

const isStage = (value: unknown): value is MatchStage => {
  return (
    typeof value === 'string' && VALID_STAGES.includes(value as MatchStage)
  );
};

interface ITeamInput {
  name: string;
  countryCode: string;
}

interface ICreateMatchBody {
  homeTeam: ITeamInput;
  awayTeam: ITeamInput;
  stage: MatchStage;
  groupLabel: string | null;
  kickoffDate: Date;
}

const parseTeam = (raw: unknown): ITeamInput | null => {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }
  const team: Record<string, unknown> = raw as Record<string, unknown>;
  if (!isString(team.name) || !isCountryCode(team.countryCode)) {
    return null;
  }
  return {
    name: team.name.trim(),
    countryCode: team.countryCode.toLowerCase()
  };
};

const parseCreateBody = (body: unknown): ICreateMatchBody | null => {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const candidate: Record<string, unknown> = body as Record<string, unknown>;
  const homeTeam: ITeamInput | null = parseTeam(candidate.homeTeam);
  const awayTeam: ITeamInput | null = parseTeam(candidate.awayTeam);
  if (homeTeam === null || awayTeam === null) {
    return null;
  }
  if (!isStage(candidate.stage)) {
    return null;
  }
  if (typeof candidate.kickoffDate !== 'string') {
    return null;
  }
  const kickoff: Date = new Date(candidate.kickoffDate);
  if (Number.isNaN(kickoff.getTime())) {
    return null;
  }
  const groupLabel: string | null =
    typeof candidate.groupLabel === 'string' && candidate.groupLabel.length > 0
      ? candidate.groupLabel.trim().toUpperCase()
      : null;
  return {
    homeTeam,
    awayTeam,
    stage: candidate.stage,
    groupLabel,
    kickoffDate: kickoff
  };
};

interface IUpdateResultBody {
  homeScore: number;
  awayScore: number;
}

const parseResultBody = (body: unknown): IUpdateResultBody | null => {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const candidate: Record<string, unknown> = body as Record<string, unknown>;
  if (
    typeof candidate.homeScore !== 'number' ||
    typeof candidate.awayScore !== 'number'
  ) {
    return null;
  }
  if (
    !Number.isInteger(candidate.homeScore) ||
    !Number.isInteger(candidate.awayScore) ||
    candidate.homeScore < 0 ||
    candidate.awayScore < 0
  ) {
    return null;
  }
  return { homeScore: candidate.homeScore, awayScore: candidate.awayScore };
};

interface IUpdateFinalResultBody {
  finalHomeScore: number;
  finalAwayScore: number;
  winnerSide: MatchSide | null;
}

const parseFinalResultBody = (body: unknown): IUpdateFinalResultBody | null => {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const candidate: Record<string, unknown> = body as Record<string, unknown>;
  if (
    typeof candidate.finalHomeScore !== 'number' ||
    typeof candidate.finalAwayScore !== 'number'
  ) {
    return null;
  }
  if (
    !Number.isInteger(candidate.finalHomeScore) ||
    !Number.isInteger(candidate.finalAwayScore) ||
    candidate.finalHomeScore < 0 ||
    candidate.finalAwayScore < 0
  ) {
    return null;
  }

  let winnerSide: MatchSide | null = null;
  if (candidate.winnerSide === 'home' || candidate.winnerSide === 'away') {
    winnerSide = candidate.winnerSide;
  } else if (candidate.winnerSide !== undefined && candidate.winnerSide !== null) {
    return null;
  }

  // Un empate en el resultado final (ej. definido en penales) requiere que
  // el admin indique explícitamente quién avanza.
  if (candidate.finalHomeScore === candidate.finalAwayScore && winnerSide === null) {
    return null;
  }

  return {
    finalHomeScore: candidate.finalHomeScore,
    finalAwayScore: candidate.finalAwayScore,
    winnerSide
  };
};

export const listMatches = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matches: IMatchDocument[] = await MatchModel.find()
      .sort({ kickoffDate: 1 })
      .lean<IMatchDocument[]>();
    res.status(200).json({ matches });
  } catch (error: unknown) {
    next(error);
  }
};

export const createMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body: ICreateMatchBody | null = parseCreateBody(req.body);
    if (body === null) {
      res.status(400).json({ message: 'Invalid match payload' });
      return;
    }
    const created: IMatchDocument = await MatchModel.create({
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      stage: body.stage,
      groupLabel: body.groupLabel,
      kickoffDate: body.kickoffDate,
      homeScore: null,
      awayScore: null,
      isFinished: false
    });
    res.status(201).json({ match: created });
  } catch (error: unknown) {
    next(error);
  }
};

interface IMatchPredictionEntry {
  userId: string;
  username: string;
  displayName: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsAwarded: number | null;
}

export const listMatchPredictions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id: string = req.params.id;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid match id' });
      return;
    }

    const match: IMatchDocument | null = await MatchModel.findById(id);
    if (match === null) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    const predictions: IPredictionDocument[] = await PredictionModel.find({
      match: new Types.ObjectId(id)
    }).lean<IPredictionDocument[]>();

    if (predictions.length === 0) {
      res.status(200).json({ predictions: [] });
      return;
    }

    const userIds: Types.ObjectId[] = predictions.map(
      (p: IPredictionDocument): Types.ObjectId => p.user
    );
    const users: IUserDocument[] = await UserModel.find({
      _id: { $in: userIds },
      isAdmin: false
    }).lean<IUserDocument[]>();

    const userById: Map<string, IUserDocument> = new Map();
    users.forEach((user: IUserDocument): void => {
      userById.set(String(user._id), user);
    });

    const entries: IMatchPredictionEntry[] = predictions
      .map((prediction: IPredictionDocument): IMatchPredictionEntry | null => {
        const user: IUserDocument | undefined = userById.get(
          String(prediction.user)
        );
        if (user === undefined) {
          return null;
        }
        const pointsAwarded: number | null =
          match.isFinished &&
          match.homeScore !== null &&
          match.awayScore !== null
            ? calculatePredictionPoints({
                predictedHomeScore: prediction.predictedHomeScore,
                predictedAwayScore: prediction.predictedAwayScore,
                actualHomeScore: match.homeScore,
                actualAwayScore: match.awayScore,
                stage: match.stage,
              })
            : null;
        return {
          userId: String(user._id),
          username: user.username,
          displayName: user.displayName,
          predictedHomeScore: prediction.predictedHomeScore,
          predictedAwayScore: prediction.predictedAwayScore,
          pointsAwarded
        };
      })
      .filter(
        (entry: IMatchPredictionEntry | null): entry is IMatchPredictionEntry =>
          entry !== null
      );

    entries.sort(
      (a: IMatchPredictionEntry, b: IMatchPredictionEntry): number => {
        const ap: number = a.pointsAwarded ?? -1;
        const bp: number = b.pointsAwarded ?? -1;
        if (bp !== ap) {
          return bp - ap;
        }
        return a.displayName.localeCompare(b.displayName);
      }
    );

    res.status(200).json({ predictions: entries });
  } catch (error: unknown) {
    next(error);
  }
};

// Propaga el ganador (y perdedor, para semis) al siguiente partido de la
// llave, y dispara el cálculo de snapshot cuando una fase queda completa.
// Fire-and-forget: los errores no deben afectar la respuesta HTTP ya enviada.
const propagateWinnerAndCheckSnapshot = async (
  updated: IMatchDocument
): Promise<void> => {
  try {
    const stage: MatchStage = updated.stage;
    if (stage === 'group') return;

    const winner: MatchSide | null = resolveMatchWinner(updated);

    if (winner !== null && updated.nextMatchId) {
      const winnerTeam = winner === 'home' ? updated.homeTeam : updated.awayTeam;
      const loserTeam = winner === 'home' ? updated.awayTeam : updated.homeTeam;

      const winnerField = updated.nextMatchSlot === 'home' ? 'homeTeam' : 'awayTeam';
      await MatchModel.findByIdAndUpdate(updated.nextMatchId, { [winnerField]: winnerTeam });

      if (updated.loserNextMatchId && updated.loserNextMatchSlot) {
        const loserField = updated.loserNextMatchSlot === 'home' ? 'homeTeam' : 'awayTeam';
        await MatchModel.findByIdAndUpdate(updated.loserNextMatchId, { [loserField]: loserTeam });
      }
    }

    // Cuartos de Final en adelante (cuartos, semis, 3er lugar y final) se
    // juegan como una sola liga: solo se genera el snapshot hasta que TODAS
    // esas etapas están finalizadas, no una por una.
    const phaseKey = stageToPhaseKey(stage);
    if (phaseKey === undefined) return;

    const phaseStages: MatchStage[] = PHASE_STAGES[phaseKey];
    const pending: number = await MatchModel.countDocuments({
      stage: { $in: phaseStages },
      isFinished: false
    });
    if (pending === 0) {
      await computeAndSaveSnapshot(phaseKey);
    }
  } catch {
    // fire-and-forget: errors must not affect the response
  }
};

export const updateMatchResult = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id: string = req.params.id;
    const body: IUpdateResultBody | null = parseResultBody(req.body);
    if (body === null) {
      res.status(400).json({ message: 'homeScore and awayScore must be non-negative integers' });
      return;
    }

    const updated: IMatchDocument | null = await MatchModel.findByIdAndUpdate(
      id,
      {
        homeScore: body.homeScore,
        awayScore: body.awayScore,
        isFinished: true
      },
      { new: true }
    );

    if (updated === null) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    res.status(200).json({ match: updated });

    void propagateWinnerAndCheckSnapshot(updated);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateMatchFinalResult = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id: string = req.params.id;
    const body: IUpdateFinalResultBody | null = parseFinalResultBody(req.body);
    if (body === null) {
      res.status(400).json({
        message:
          'finalHomeScore y finalAwayScore deben ser enteros no negativos; si empatan, winnerSide (home|away) es requerido'
      });
      return;
    }

    const existing: IMatchDocument | null = await MatchModel.findById(id);
    if (existing === null) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }
    if (existing.stage === 'group') {
      res.status(400).json({ message: 'El resultado final solo aplica a partidos de eliminación directa' });
      return;
    }
    if (!existing.isFinished) {
      res.status(400).json({ message: 'Primero debe publicarse el resultado del partido' });
      return;
    }

    const updated: IMatchDocument | null = await MatchModel.findByIdAndUpdate(
      id,
      {
        finalHomeScore: body.finalHomeScore,
        finalAwayScore: body.finalAwayScore,
        winnerSide: body.winnerSide
      },
      { new: true }
    );

    if (updated === null) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    res.status(200).json({ match: updated });

    void propagateWinnerAndCheckSnapshot(updated);
  } catch (error: unknown) {
    next(error);
  }
};
