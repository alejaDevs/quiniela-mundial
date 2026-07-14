import { forwardRef, CSSProperties, ReactElement } from 'react';
import { Theme } from '../Theme';
import { IMatch, IMatchPredictionEntry } from '../types/Index';
import { FlagIcon } from './FlagIcon';
import { getStageLabel } from '../utils/StageLabel';

interface IShareableMatchCardProps {
  match: IMatch;
  entries: IMatchPredictionEntry[];
}

const CARD_WIDTH = 480;

const cardStyle: CSSProperties = {
  width: CARD_WIDTH,
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  fontFamily: Theme.Typography.fontFamilyBody,
  display: 'flex',
  flexDirection: 'column'
};

const headerStyle: CSSProperties = {
  backgroundColor: Theme.Colors.primary,
  color: Theme.Colors.onPrimary,
  padding: `${Theme.Spacing.md} ${Theme.Spacing.lg}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const brandStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: '15px',
  fontWeight: 800,
  letterSpacing: '0.02em'
};

const stageChipStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  backgroundColor: 'rgba(255,255,255,0.18)',
  padding: '4px 10px',
  borderRadius: Theme.Radii.full
};

const matchRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${Theme.Spacing.lg} ${Theme.Spacing.lg}`,
  gap: Theme.Spacing.sm
};

const teamColumnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  gap: Theme.Spacing.sm
};

const teamNameStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: '16px',
  fontWeight: 700,
  color: Theme.Colors.onBackground,
  textAlign: 'center'
};

const scoreBoxStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.sm,
  backgroundColor: Theme.Colors.surfaceContainer,
  border: `1px solid ${Theme.Colors.outlineVariant}`,
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.md}`,
  borderRadius: Theme.Radii.md
};

const scoreStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: '28px',
  fontWeight: 800,
  color: Theme.Colors.onBackground,
  minWidth: '28px',
  textAlign: 'center'
};

const separatorStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: '20px',
  color: Theme.Colors.outlineVariant
};

const metaRowStyle: CSSProperties = {
  textAlign: 'center',
  color: Theme.Colors.onSurfaceVariant,
  fontSize: '12px',
  paddingBottom: Theme.Spacing.md
};

const tableWrapStyle: CSSProperties = {
  padding: `0 ${Theme.Spacing.lg} ${Theme.Spacing.lg}`
};

const tableTitleStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: Theme.Colors.onSurfaceVariant,
  margin: 0,
  marginBottom: Theme.Spacing.sm
};

const tableHeaderStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr',
  gap: Theme.Spacing.sm,
  padding: `${Theme.Spacing.xs} ${Theme.Spacing.sm}`,
  color: Theme.Colors.onSurfaceVariant,
  fontSize: '11px',
  fontWeight: 700,
  borderBottom: `1px solid ${Theme.Colors.surfaceContainer}`
};

const tableRowStyle = (zebra: boolean): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr',
  gap: Theme.Spacing.sm,
  padding: `${Theme.Spacing.xs} ${Theme.Spacing.sm}`,
  alignItems: 'center',
  backgroundColor: zebra ? Theme.Colors.surfaceContainerLow : 'transparent'
});

const userCellStyle: CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: Theme.Colors.onBackground,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const predictedCellStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: '15px',
  fontWeight: 700,
  color: Theme.Colors.onBackground
};

const pointsCellStyle = (positive: boolean): CSSProperties => ({
  textAlign: 'right',
  fontSize: '13px',
  fontWeight: 700,
  color: positive ? Theme.Colors.primary : Theme.Colors.outline
});

const emptyStyle: CSSProperties = {
  textAlign: 'center',
  padding: Theme.Spacing.md,
  fontSize: '13px',
  color: Theme.Colors.onSurfaceVariant
};

const footerStyle: CSSProperties = {
  borderTop: `1px solid ${Theme.Colors.surfaceContainer}`,
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.lg}`,
  textAlign: 'center',
  fontSize: '11px',
  color: Theme.Colors.onSurfaceVariant
};

const formatKickoff = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleString('es-GT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const ShareableMatchCard = forwardRef<HTMLDivElement, IShareableMatchCardProps>(
  ({ match, entries }, ref): ReactElement => {
    const stageLabel = getStageLabel(match);

    return (
      <div ref={ref} style={cardStyle}>
        <div style={headerStyle}>
          <span style={brandStyle}>Quiniela Mundial 2026</span>
          <span style={stageChipStyle}>{stageLabel}</span>
        </div>

        <div style={matchRowStyle}>
          <div style={teamColumnStyle}>
            <FlagIcon
              countryCode={match.homeTeam.countryCode}
              alt={`Bandera de ${match.homeTeam.name}`}
            />
            <span style={teamNameStyle}>{match.homeTeam.name}</span>
          </div>
          <div style={teamColumnStyle}>
            <div style={scoreBoxStyle}>
              <span style={scoreStyle}>
                {match.homeScore === null ? '–' : match.homeScore}
              </span>
              <span style={separatorStyle}>-</span>
              <span style={scoreStyle}>
                {match.awayScore === null ? '–' : match.awayScore}
              </span>
            </div>
          </div>
          <div style={teamColumnStyle}>
            <FlagIcon
              countryCode={match.awayTeam.countryCode}
              alt={`Bandera de ${match.awayTeam.name}`}
            />
            <span style={teamNameStyle}>{match.awayTeam.name}</span>
          </div>
        </div>

        <div style={metaRowStyle}>
          {match.isFinished ? 'Partido finalizado' : formatKickoff(match.kickoffDate)}
        </div>

        <div style={tableWrapStyle}>
          <h3 style={tableTitleStyle}>Predicciones de la comunidad</h3>
          {entries.length === 0 ? (
            <div style={emptyStyle}>Aún no hay predicciones registradas.</div>
          ) : (
            <div>
              <div style={tableHeaderStyle}>
                <div>Usuario</div>
                <div style={{ textAlign: 'center' }}>Pronóstico</div>
                <div style={{ textAlign: 'right' }}>Puntos</div>
              </div>
              {entries.map((entry: IMatchPredictionEntry, index: number): ReactElement => (
                <div key={entry.userId} style={tableRowStyle(index % 2 === 1)}>
                  <div style={userCellStyle}>{entry.displayName}</div>
                  <div style={predictedCellStyle}>
                    {entry.predictedHomeScore} - {entry.predictedAwayScore}
                  </div>
                  <div
                    style={pointsCellStyle(
                      entry.pointsAwarded !== null && entry.pointsAwarded > 0
                    )}
                  >
                    {entry.pointsAwarded === null ? '—' : `+${entry.pointsAwarded}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={footerStyle}>
          {match.homeTeam.name} vs {match.awayTeam.name}
        </div>
      </div>
    );
  }
);

ShareableMatchCard.displayName = 'ShareableMatchCard';
