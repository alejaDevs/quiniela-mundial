import { IMatchPredictionEntry } from '../types/Index';

interface IRawEntry {
  userId?: string;
  username?: string;
  displayName?: string;
  predictedHomeScore?: number;
  predictedAwayScore?: number;
  pointsAwarded?: number | null;
}

export const adaptMatchPredictionFromApi = (
  raw: unknown
): IMatchPredictionEntry => {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid match prediction payload');
  }
  const data: IRawEntry = raw as IRawEntry;
  if (
    typeof data.userId !== 'string' ||
    typeof data.username !== 'string' ||
    typeof data.displayName !== 'string' ||
    typeof data.predictedHomeScore !== 'number' ||
    typeof data.predictedAwayScore !== 'number'
  ) {
    throw new Error('Invalid match prediction payload');
  }
  const pointsAwarded: number | null =
    typeof data.pointsAwarded === 'number' ? data.pointsAwarded : null;
  return {
    userId: data.userId,
    username: data.username,
    displayName: data.displayName,
    predictedHomeScore: data.predictedHomeScore,
    predictedAwayScore: data.predictedAwayScore,
    pointsAwarded
  };
};

export const adaptMatchPredictionListFromApi = (
  raw: unknown
): IMatchPredictionEntry[] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(adaptMatchPredictionFromApi);
};
