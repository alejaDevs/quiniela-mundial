import { IMatch } from '../types/Index';

export const hasRecentResults = (
  matches: IMatch[],
  hoursLimit = 3
): boolean => {
  const cutoff: Date = new Date(Date.now() - hoursLimit * 60 * 60 * 1000);
  return matches.some(
    (m: IMatch): boolean => m.isFinished && new Date(m.updatedAt) > cutoff
  );
};

export const findDeadlineMatches = (
  matches: IMatch[],
  predictedMatchIds: ReadonlySet<string>,
  hoursLimit = 24
): IMatch[] => {
  const now: number = Date.now();
  return matches.filter((m: IMatch): boolean => {
    const kickoff: number = new Date(m.kickoffDate).getTime();
    const hoursUntil: number = (kickoff - now) / (1000 * 60 * 60);
    return hoursUntil > 0 && hoursUntil <= hoursLimit && !predictedMatchIds.has(m.id);
  });
};
