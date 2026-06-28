export const formatScore = (
  homeScore: number | null,
  awayScore: number | null
): string => {
  if (homeScore === null || awayScore === null) {
    return '–';
  }
  return `${homeScore} - ${awayScore}`;
};

export const formatKickoff = (kickoffIso: string): string => {
  const date: Date = new Date(kickoffIso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
