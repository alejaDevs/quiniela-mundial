import { MatchStage } from '../models/Match';

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
    stage,
  } = input;

  const isExact =
    predictedHomeScore === actualHomeScore &&
    predictedAwayScore === actualAwayScore;

  if (isExact) return 5;

  const predictedOutcome = Math.sign(predictedHomeScore - predictedAwayScore);
  const actualOutcome    = Math.sign(actualHomeScore    - actualAwayScore);

  // ── Round of 32 (16vos): 3 correct winner · 2 correct draw · 0 wrong ──
  if (stage === 'round_of_32') {
    if (predictedOutcome === actualOutcome && predictedOutcome !== 0) return 3;
    if (predictedOutcome === 0 && actualOutcome === 0)                return 2;
    return 0;
  }

  // ── Default (group stage): 2 correct winner · 0 otherwise ──────────────
  if (predictedOutcome === actualOutcome && predictedOutcome !== 0) return 2;
  return 0;
};
