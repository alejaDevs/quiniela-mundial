export interface IUser {
  id: string;
  username: string;
  displayName: string;
  isAdmin: boolean;
}

export type MatchStage =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final';

export interface IMatchTeam {
  name: string;
  countryCode: string;
}

export interface IMatch {
  id: string;
  homeTeam: IMatchTeam;
  awayTeam: IMatchTeam;
  stage: MatchStage;
  groupLabel: string | null;
  kickoffDate: string;
  homeScore: number | null;
  awayScore: number | null;
  isFinished: boolean;
  finalHomeScore: number | null;
  finalAwayScore: number | null;
  winnerSide: 'home' | 'away' | null;
  updatedAt: string;
  stadium: string | null;
  city: string | null;
}

export interface IPrediction {
  id: string;
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
}

export interface ILeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  totalPoints: number;
  rank: number;
}

export interface IAuthSession {
  token: string;
  user: IUser;
}

export interface IMatchPredictionEntry {
  userId: string;
  username: string;
  displayName: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsAwarded: number | null;
}

export interface IPhaseSnapshotSummary {
  phase: string;
  phaseName: string;
  totalMatches: number;
  createdAt: string;
}

export interface IPhaseSnapshotEntry {
  userId: string;
  username: string;
  displayName: string;
  totalPoints: number;
  rank: number;
  predictionsCount: number;
  predictionsScored: number;
}

export interface IPhaseSnapshot {
  phase: string;
  phaseName: string;
  totalMatches: number;
  entries: IPhaseSnapshotEntry[];
  createdAt: string;
}
