export const isMatchLocked = (kickoffDate: Date): boolean => {
  return kickoffDate.getTime() <= new Date().getTime();
};
