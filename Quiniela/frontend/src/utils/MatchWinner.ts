import { IMatch } from '../types/Index';

export type MatchSide = 'home' | 'away';

// Espejo del resolver del backend (backend/src/utils/MatchWinner.ts): el
// resultado final (posterior al minuto 90) manda sobre el marcador de 90'
// para efectos de quién avanza de ronda.
export const resolveMatchWinner = (match: IMatch): MatchSide | null => {
  if (match.finalHomeScore !== null && match.finalAwayScore !== null) {
    if (match.finalHomeScore !== match.finalAwayScore) {
      return match.finalHomeScore > match.finalAwayScore ? 'home' : 'away';
    }
    return match.winnerSide;
  }

  if (match.homeScore !== null && match.awayScore !== null) {
    if (match.homeScore === match.awayScore) {
      return null;
    }
    return match.homeScore > match.awayScore ? 'home' : 'away';
  }

  return null;
};
