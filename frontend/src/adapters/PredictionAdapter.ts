import { IPrediction } from '../types/Index';

interface IRawPrediction {
  _id?: string;
  id?: string;
  match?: string;
  matchId?: string;
  predictedHomeScore?: number;
  predictedAwayScore?: number;
}

export const adaptPredictionFromApi = (raw: unknown): IPrediction => {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid prediction payload');
  }
  const data: IRawPrediction = raw as IRawPrediction;
  const id: string | undefined = data.id ?? data._id;
  const matchId: string | undefined = data.matchId ?? data.match;
  if (
    typeof id !== 'string' ||
    typeof matchId !== 'string' ||
    typeof data.predictedHomeScore !== 'number' ||
    typeof data.predictedAwayScore !== 'number'
  ) {
    throw new Error('Invalid prediction payload');
  }
  return {
    id,
    matchId,
    predictedHomeScore: data.predictedHomeScore,
    predictedAwayScore: data.predictedAwayScore
  };
};

export const adaptPredictionListFromApi = (raw: unknown): IPrediction[] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(adaptPredictionFromApi);
};
