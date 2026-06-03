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
