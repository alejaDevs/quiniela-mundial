import { ILeaderboardEntry } from '../types/Index';

interface IRawEntry {
  userId?: string;
  username?: string;
  displayName?: string;
  totalPoints?: number;
  rank?: number;
}

export const adaptLeaderboardEntryFromApi = (
  raw: unknown
): ILeaderboardEntry => {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid leaderboard entry payload');
  }
  const data: IRawEntry = raw as IRawEntry;
  if (
    typeof data.userId !== 'string' ||
    typeof data.username !== 'string' ||
    typeof data.displayName !== 'string' ||
    typeof data.totalPoints !== 'number' ||
    typeof data.rank !== 'number'
  ) {
    throw new Error('Invalid leaderboard entry payload');
  }
  return {
    userId: data.userId,
    username: data.username,
    displayName: data.displayName,
    totalPoints: data.totalPoints,
    rank: data.rank
  };
};

export const adaptLeaderboardFromApi = (raw: unknown): ILeaderboardEntry[] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(adaptLeaderboardEntryFromApi);
};
