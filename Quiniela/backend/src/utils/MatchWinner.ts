export type MatchSide = "home" | "away";

export interface IMatchWinnerInput {
  homeScore: number | null;
  awayScore: number | null;
  finalHomeScore: number | null;
  finalAwayScore: number | null;
  winnerSide: MatchSide | null;
}

// Determina el lado ganador de un partido para efectos de avance de llave.
// El resultado final (posterior al minuto 90, cargado por el admin) tiene
// prioridad sobre el marcador de 90' porque es el único que refleja tiempo
// extra/penales. Si ambos marcadores finales empatan, se usa winnerSide,
// que el admin debe indicar explícitamente en ese caso.
export const resolveMatchWinner = (
  match: IMatchWinnerInput
): MatchSide | null => {
  if (match.finalHomeScore !== null && match.finalAwayScore !== null) {
    if (match.finalHomeScore !== match.finalAwayScore) {
      return match.finalHomeScore > match.finalAwayScore ? "home" : "away";
    }
    return match.winnerSide;
  }

  if (match.homeScore !== null && match.awayScore !== null) {
    if (match.homeScore === match.awayScore) {
      return null;
    }
    return match.homeScore > match.awayScore ? "home" : "away";
  }

  return null;
};
