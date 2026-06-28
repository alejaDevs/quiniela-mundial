const LOCK_BEFORE_MS = 15 * 60 * 1000;

export const isMatchLocked = (kickoffDate: Date): boolean => {
  return kickoffDate.getTime() - LOCK_BEFORE_MS <= new Date().getTime();
};
