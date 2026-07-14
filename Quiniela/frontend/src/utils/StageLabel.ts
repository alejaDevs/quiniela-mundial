import { IMatch } from '../types/Index';

const STAGE_LABELS: Record<string, string> = {
  group: 'Fase de Grupos',
  round_of_32: '16avos de Final',
  round_of_16: 'Octavos de Final',
  quarter_final: 'Cuartos de Final',
  semi_final: 'Semifinales',
  third_place: '3er Lugar',
  final: 'Final'
};

export const getStageLabel = (match: IMatch): string =>
  match.groupLabel !== null
    ? `Grupo ${match.groupLabel}`
    : (STAGE_LABELS[match.stage] ?? match.stage);
