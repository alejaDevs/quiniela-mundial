import { ReactElement, CSSProperties, ChangeEvent } from 'react';
import { Theme } from '../Theme';
import { IMatch } from '../types/Index';
import { FlagIcon } from './FlagIcon';
import { isMatchLocked } from '../utils/MatchLock';
import { formatKickoff } from '../utils/FormatScore';
import { useIsMobile } from '../utils/UseIsMobile';

interface IMatchCardProps {
  match: IMatch;
  predictedHomeScore: number | null;
  predictedAwayScore: number | null;
  onHomeScoreChange?: (value: number) => void;
  onAwayScoreChange?: (value: number) => void;
  variant?: 'editable' | 'readonly' | 'admin';
  highlight?: boolean;
}

const cardStyle = (highlight: boolean): CSSProperties => ({
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  borderRadius: Theme.Radii.lg,
  boxShadow: Theme.Shadows.card,
  border: `1.5px solid ${highlight ? Theme.Colors.primary : 'transparent'}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'border-color 0.2s'
});

const innerStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: Theme.Spacing.md,
  padding: `${Theme.Spacing.md} ${Theme.Spacing.lg}`
};

// ─── Desktop: equipo en columna horizontal con bandera ───────────────────────

const desktopTeamStyle = (alignEnd: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.md,
  flex: '1 1 160px',
  justifyContent: 'flex-start',
  flexDirection: alignEnd ? 'row' : 'row-reverse'
});

const desktopTeamNameStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  lineHeight: Theme.Typography.headlineMd.lineHeight,
  fontWeight: Theme.Typography.headlineMd.fontWeight,
  color: Theme.Colors.onSurface
};

// ─── Mobile: fila de equipos (nombres a los lados) ───────────────────────────

const mobileTeamsRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flex: '1 1 100%'
};

const mobileTeamItemStyle = (isHome: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.xs,
  maxWidth: '48%',
  minWidth: 0,
  flexDirection: isHome ? 'row' : 'row-reverse'
});

const mobileTeamNameStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.labelLg.fontSize,
  lineHeight: Theme.Typography.labelLg.lineHeight,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  color: Theme.Colors.onSurface,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

// ─── Mobile: fila del marcador centrado ──────────────────────────────────────

const mobileScoreRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  flex: '1 1 100%'
};

// ─── Compartidos ─────────────────────────────────────────────────────────────

const scoreContainerStyle = (isMobile: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: isMobile ? Theme.Spacing.xs : Theme.Spacing.md,
  backgroundColor: Theme.Colors.surfaceContainerLow,
  padding: isMobile ? Theme.Spacing.xs : Theme.Spacing.sm,
  borderRadius: Theme.Radii.md
});

const inputStyle = (disabled: boolean, isMobile: boolean): CSSProperties => ({
  width: isMobile ? '48px' : '64px',
  height: isMobile ? '48px' : '64px',
  textAlign: 'center',
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: isMobile
    ? Theme.Typography.headlineMd.fontSize
    : Theme.Typography.scoreDisplay.fontSize,
  lineHeight: isMobile
    ? Theme.Typography.headlineMd.lineHeight
    : Theme.Typography.scoreDisplay.lineHeight,
  fontWeight: Theme.Typography.scoreDisplay.fontWeight,
  color: Theme.Colors.onSurface,
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  border: `2px solid ${Theme.Colors.outlineVariant}`,
  borderRadius: Theme.Radii.md,
  outline: 'none',
  opacity: disabled ? 0.6 : 1
});

const dashStyle = (isMobile: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: isMobile
    ? Theme.Typography.bodyMd.fontSize
    : Theme.Typography.headlineLg.fontSize,
  color: Theme.Colors.outlineVariant
});

const metaStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.sm,
  flex: '1 1 100%',
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const lockedBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: Theme.Spacing.xs,
  padding: `${Theme.Spacing.xs} ${Theme.Spacing.sm}`,
  borderRadius: Theme.Radii.full,
  backgroundColor: Theme.Colors.errorContainer,
  color: Theme.Colors.onErrorContainer,
  fontSize: Theme.Typography.labelMd.fontSize,
  fontWeight: Theme.Typography.labelMd.fontWeight
};

const deadlineBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: Theme.Spacing.xs,
  padding: `${Theme.Spacing.xs} ${Theme.Spacing.sm}`,
  borderRadius: Theme.Radii.full,
  backgroundColor: Theme.Colors.tertiaryFixed,
  color: Theme.Colors.onTertiaryContainer,
  fontSize: Theme.Typography.labelMd.fontSize,
  fontWeight: Theme.Typography.labelMd.fontWeight,
  textTransform: 'none'
};

const parseScore = (raw: string): number => {
  const parsed: number = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
};

export const MatchCard = ({
  match,
  predictedHomeScore,
  predictedAwayScore,
  onHomeScoreChange,
  onAwayScoreChange,
  variant = 'editable',
  highlight = false
}: IMatchCardProps): ReactElement => {
  const isMobile = useIsMobile();
  const kickoff: Date = new Date(match.kickoffDate);
  const locked: boolean = isMatchLocked(kickoff);
  const inputsDisabled: boolean = variant === 'readonly' || locked;

  const homeValue: string =
    predictedHomeScore === null ? '' : String(predictedHomeScore);
  const awayValue: string =
    predictedAwayScore === null ? '' : String(predictedAwayScore);

  const handleHome = (event: ChangeEvent<HTMLInputElement>): void => {
    if (onHomeScoreChange !== undefined) {
      onHomeScoreChange(parseScore(event.target.value));
    }
  };

  const handleAway = (event: ChangeEvent<HTMLInputElement>): void => {
    if (onAwayScoreChange !== undefined) {
      onAwayScoreChange(parseScore(event.target.value));
    }
  };

  const renderInputs = (): ReactElement => (
    <div style={scoreContainerStyle(isMobile)}>
      <input
        type="number"
        min="0"
        max="99"
        value={homeValue}
        placeholder="0"
        onChange={handleHome}
        disabled={inputsDisabled}
        aria-label={`Predicción ${match.homeTeam.name}`}
        style={inputStyle(inputsDisabled, isMobile)}
      />
      <span style={dashStyle(isMobile)}>-</span>
      <input
        type="number"
        min="0"
        max="99"
        value={awayValue}
        placeholder="0"
        onChange={handleAway}
        disabled={inputsDisabled}
        aria-label={`Predicción ${match.awayTeam.name}`}
        style={inputStyle(inputsDisabled, isMobile)}
      />
    </div>
  );

  return (
    <article style={cardStyle(highlight)}>
      <div style={innerStyle}>
        <div style={metaStyle}>
          <span>
            {match.groupLabel !== null ? `Grupo ${match.groupLabel}` : match.stage}
          </span>
          <span>•</span>
          {locked ? (
            <>
              <span style={{ textTransform: 'none' }}>
                {formatKickoff(match.kickoffDate)}
              </span>
              <span style={lockedBadgeStyle}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px' }}
                >
                  lock
                </span>
                Bloqueado
              </span>
            </>
          ) : (
            <span style={deadlineBadgeStyle}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '14px' }}
              >
                schedule
              </span>
              Límite: {formatKickoff(match.kickoffDate)}
            </span>
          )}
        </div>

        {isMobile ? (
          <>
            <div style={mobileTeamsRowStyle}>
              <div style={mobileTeamItemStyle(true)}>
                <span style={mobileTeamNameStyle}>{match.homeTeam.name}</span>
                <FlagIcon
                  countryCode={match.homeTeam.countryCode}
                  alt={`Bandera de ${match.homeTeam.name}`}
                  size="sm"
                />
              </div>
              <div style={mobileTeamItemStyle(false)}>
                <FlagIcon
                  countryCode={match.awayTeam.countryCode}
                  alt={`Bandera de ${match.awayTeam.name}`}
                  size="sm"
                />
                <span style={mobileTeamNameStyle}>{match.awayTeam.name}</span>
              </div>
            </div>
            <div style={mobileScoreRowStyle}>{renderInputs()}</div>
          </>
        ) : (
          <>
            <div style={desktopTeamStyle(true)}>
              <span style={desktopTeamNameStyle}>{match.homeTeam.name}</span>
              <FlagIcon
                countryCode={match.homeTeam.countryCode}
                alt={`Bandera de ${match.homeTeam.name}`}
              />
            </div>
            {renderInputs()}
            <div style={desktopTeamStyle(false)}>
              <span style={desktopTeamNameStyle}>{match.awayTeam.name}</span>
              <FlagIcon
                countryCode={match.awayTeam.countryCode}
                alt={`Bandera de ${match.awayTeam.name}`}
              />
            </div>
          </>
        )}
      </div>
    </article>
  );
};
