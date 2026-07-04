import { IMatch, IMatchTeam, MatchStage } from '../types/Index';

interface IRawTeam {
  name?: string;
  countryCode?: string;
}

interface IRawMatch {
  _id?: string;
  id?: string;
  homeTeam?: IRawTeam;
  awayTeam?: IRawTeam;
  stage?: MatchStage;
  groupLabel?: string | null;
  kickoffDate?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  isFinished?: boolean;
  updatedAt?: string;
  stadium?: string | null;
  city?: string | null;
}

const adaptTeam = (raw: IRawTeam | undefined): IMatchTeam => {
  if (
    raw === undefined ||
    typeof raw.name !== 'string' ||
    typeof raw.countryCode !== 'string'
  ) {
    throw new Error('Invalid team payload');
  }
  return { name: raw.name, countryCode: raw.countryCode.toLowerCase() };
};

export const adaptMatchFromApi = (raw: unknown): IMatch => {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid match payload');
  }
  const data: IRawMatch = raw as IRawMatch;
  const id: string | undefined = data.id ?? data._id;
  if (
    typeof id !== 'string' ||
    typeof data.stage !== 'string' ||
    typeof data.kickoffDate !== 'string' ||
    typeof data.isFinished !== 'boolean'
  ) {
    throw new Error('Invalid match payload');
  }
  return {
    id,
    homeTeam: adaptTeam(data.homeTeam),
    awayTeam: adaptTeam(data.awayTeam),
    stage: data.stage,
    groupLabel:
      typeof data.groupLabel === 'string' ? data.groupLabel : null,
    kickoffDate: data.kickoffDate,
    homeScore: typeof data.homeScore === 'number' ? data.homeScore : null,
    awayScore: typeof data.awayScore === 'number' ? data.awayScore : null,
    isFinished: data.isFinished,
    updatedAt:
      typeof data.updatedAt === 'string' ? data.updatedAt : new Date(0).toISOString(),
    stadium: typeof data.stadium === 'string' ? data.stadium : null,
    city: typeof data.city === 'string' ? data.city : null,
  };
};

export const adaptMatchListFromApi = (raw: unknown): IMatch[] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(adaptMatchFromApi);
};
