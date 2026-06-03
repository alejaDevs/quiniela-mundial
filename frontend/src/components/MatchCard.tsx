import { ReactElement, CSSProperties, ChangeEvent } from 'react';
import { Theme } from '../Theme';
import { IMatch } from '../types/Index';
import { FlagIcon } from './FlagIcon';
import { isMatchLocked } from '../utils/MatchLock';
import { formatKickoff } from '../utils/FormatScore';

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

const teamStyle = (alignEnd: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.md,
  flex: '1 1 160px',
  justifyContent: 'flex-start',
  flexDirection: alignEnd ? 'row' : 'row-reverse'
});

const teamNameStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  lineHeight: Theme.Typography.headlineMd.lineHeight,
  fontWeight: Theme.Typography.headlineMd.fontWeight,
  color: Theme.Colors.onSurface
};

const scoreContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.md,
  backgroundColor: Theme.Colors.surfaceContainerLow,
  padding: Theme.Spacing.sm,
  borderRadius: Theme.Radii.md
};

const inputStyle = (disabled: boolean): CSSProperties => ({
  width: '64px',
  height: '64px',
  textAlign: 'center',
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.scoreDisplay.fontSize,
  lineHeight: Theme.Typography.scoreDisplay.lineHeight,
  fontWeight: Theme.Typography.scoreDisplay.fontWeight,
  color: Theme.Colors.onSurface,
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  border: `2px solid ${Theme.Colors.outlineVariant}`,
  borderRadius: Theme.Radii.md,
  outline: 'none',
  opacity: disabled ? 0.6 : 1
});

const dashStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineLg.fontSize,
  color: Theme.Colors.outlineVariant
};

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

  return (
    <article style={cardStyle(highlight)}>
      <div style={innerStyle}>
        <div style={metaStyle}>
          <span>
            {match.groupLabel !== null ? `Grupo ${match.groupLabel}` : match.stage}
          </span>
          <span>•</span>
          <span style={{ textTransform: 'none' }}>{formatKickoff(match.kickoffDate)}</span>
          {locked ? (
            <span style={lockedBadgeStyle}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '16px' }}
              >
                lock
              </span>
              Bloqueado
            </span>
          ) : null}
        </div>
        <div style={teamStyle(true)}>
          <span style={teamNameStyle}>{match.homeTeam.name}</span>
          <FlagIcon
            countryCode={match.homeTeam.countryCode}
            alt={`Bandera de ${match.homeTeam.name}`}
          />
        </div>
        <div style={scoreContainerStyle}>
          <input
            type="number"
            min="0"
            max="99"
            value={homeValue}
            placeholder="0"
            onChange={handleHome}
            disabled={inputsDisabled}
            aria-label={`Predicción ${match.homeTeam.name}`}
            style={inputStyle(inputsDisabled)}
          />
          <span style={dashStyle}>-</span>
          <input
            type="number"
            min="0"
            max="99"
            value={awayValue}
            placeholder="0"
            onChange={handleAway}
            disabled={inputsDisabled}
            aria-label={`Predicción ${match.awayTeam.name}`}
            style={inputStyle(inputsDisabled)}
          />
        </div>
        <div style={teamStyle(false)}>
          <span style={teamNameStyle}>{match.awayTeam.name}</span>
          <FlagIcon
            countryCode={match.awayTeam.countryCode}
            alt={`Bandera de ${match.awayTeam.name}`}
          />
        </div>
      </div>
    </article>
  );
};
