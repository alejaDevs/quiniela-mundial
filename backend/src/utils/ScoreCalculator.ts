export interface IScoreInput {
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore: number;
  actualAwayScore: number;
}

export const POINTS_EXACT_SCORE = 5;
export const POINTS_CORRECT_OUTCOME = 2;
export const POINTS_NONE = 0;

export const calculatePredictionPoints = (input: IScoreInput): number => {
  const {
    predictedHomeScore,
    predictedAwayScore,
    actualHomeScore,
    actualAwayScore
  } = input;

  if (
    predictedHomeScore === actualHomeScore &&
    predictedAwayScore === actualAwayScore
  ) {
    return POINTS_EXACT_SCORE;
  }

  const predictedDiff: number = predictedHomeScore - predictedAwayScore;
  const actualDiff: number = actualHomeScore - actualAwayScore;

  const predictedOutcome: number = Math.sign(predictedDiff);
  const actualOutcome: number = Math.sign(actualDiff);

  if (predictedOutcome === actualOutcome && predictedOutcome !== 0) {
    return POINTS_CORRECT_OUTCOME;
  }

  return POINTS_NONE;
};
