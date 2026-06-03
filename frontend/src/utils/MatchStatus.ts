import { IMatch } from '../types/Index';

export type MatchStatus = 'finished' | 'live' | 'upcoming';

const isSameLocalDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const getMatchStatus = (match: IMatch): MatchStatus => {
  if (match.isFinished) {
    return 'finished';
  }
  const kickoff: Date = new Date(match.kickoffDate);
  if (Number.isNaN(kickoff.getTime())) {
    return 'upcoming';
  }
  if (isSameLocalDay(kickoff, new Date())) {
    return 'live';
  }
  return 'upcoming';
};

export const getMatchStatusLabel = (status: MatchStatus): string => {
  switch (status) {
    case 'finished':
      return 'Finalizado';
    case 'live':
      return 'Hoy';
    case 'upcoming':
      return 'Pendiente';
  }
};
