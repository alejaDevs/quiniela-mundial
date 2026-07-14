import { MatchStage } from '../models/Match';

// A "phase" is the unit the leaderboard/snapshot system resets scoring at.
// Cuartos de Final en adelante (cuartos, semis, 3er lugar y final) se juegan
// como una sola liga: los puntos se acumulan sin reiniciar hasta el final
// del torneo, por eso esas cuatro etapas comparten la misma phase key.
export type PhaseKey =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final';

export const PHASE_STAGES: Record<PhaseKey, MatchStage[]> = {
  group: ['group'],
  round_of_32: ['round_of_32'],
  round_of_16: ['round_of_16'],
  quarter_final: ['quarter_final', 'semi_final', 'third_place', 'final'],
};

export const PHASE_NAMES: Record<PhaseKey, string> = {
  group: 'Fase de Grupos',
  round_of_32: '16vos de Final',
  round_of_16: 'Octavos de Final',
  quarter_final: 'Cuartos de Final en Adelante',
};

export const ORDERED_PHASES: PhaseKey[] = [
  'group',
  'round_of_32',
  'round_of_16',
  'quarter_final',
];

// Orden de las etapas de eliminación directa, usado para detectar cuál está
// activa/fue la última en jugarse.
export const ORDERED_KNOCKOUT_STAGES: MatchStage[] = [
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'third_place',
  'final',
];

export const isPhaseKey = (value: string): value is PhaseKey =>
  Object.prototype.hasOwnProperty.call(PHASE_STAGES, value);

export const stageToPhaseKey = (stage: MatchStage): PhaseKey | undefined =>
  (Object.keys(PHASE_STAGES) as PhaseKey[]).find((key: PhaseKey): boolean =>
    PHASE_STAGES[key].includes(stage)
  );
