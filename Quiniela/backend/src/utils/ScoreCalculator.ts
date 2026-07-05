import { MatchStage } from "../models/Match";

export interface IScoreInput {
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore: number;
  actualAwayScore: number;
  stage?: MatchStage;
}

export const calculatePredictionPoints = (input: IScoreInput): number => {
  const {
    predictedHomeScore,
    predictedAwayScore,
    actualHomeScore,
    actualAwayScore,
  } = input;

  const isExact =
    predictedHomeScore === actualHomeScore &&
    predictedAwayScore === actualAwayScore;

  if (isExact) return 5;

  const predictedOutcome = Math.sign(predictedHomeScore - predictedAwayScore);
  const actualOutcome = Math.sign(actualHomeScore - actualAwayScore);

  if (predictedOutcome === actualOutcome && predictedOutcome !== 0) return 3;
  if (predictedOutcome === 0 && actualOutcome === 0) return 2;
  return 0;
};
