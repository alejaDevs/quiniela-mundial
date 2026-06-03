import {
  ReactElement,
  CSSProperties,
  useEffect,
  useState,
  useCallback
} from 'react';
import { Theme } from '../../Theme';
import { useIsMobile } from '../../utils/UseIsMobile';
import { IMatch } from '../../types/Index';
import { apiGet } from '../../utils/ApiClient';
import { adaptMatchListFromApi } from '../../adapters/MatchAdapter';
import { ResultCard } from '../../components/ResultCard';

type ResultsFilter = 'all' | 'finished' | 'today' | 'week';

interface IFilterOption {
  value: ResultsFilter;
  label: string;
}

interface IMatchesResponse {
  matches: unknown;
}

const FILTER_OPTIONS: IFilterOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'finished', label: 'Finalizados' }
];

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isSameWeek = (date: Date, ref: Date): boolean => {
  const dayOfWeek: number = ref.getDay();
  const diffToMonday: number = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart: Date = new Date(ref);
  weekStart.setDate(ref.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd: Date = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return date >= weekStart && date < weekEnd;
};

const applyFilter = (matches: IMatch[], filter: ResultsFilter): IMatch[] => {
  const now: Date = new Date();
  switch (filter) {
    case 'finished':
      return matches.filter((m: IMatch): boolean => m.isFinished);
    case 'today':
      return matches.filter((m: IMatch): boolean =>
        isSameDay(new Date(m.kickoffDate), now)
      );
    case 'week':
      return matches.filter((m: IMatch): boolean =>
        isSameWeek(new Date(m.kickoffDate), now)
      );
    default:
      return matches;
  }
};

const headerRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.md,
  marginBottom: Theme.Spacing.xl
};

const titleStyle = (isMobile: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: isMobile
    ? Theme.Typography.headlineLgMobile.fontSize
    : Theme.Typography.displayLg.fontSize,
  lineHeight: isMobile
    ? Theme.Typography.headlineLgMobile.lineHeight
    : Theme.Typography.displayLg.lineHeight,
  letterSpacing: Theme.Typography.displayLg.letterSpacing,
  fontWeight: Theme.Typography.displayLg.fontWeight,
  color: Theme.Colors.onBackground,
  margin: 0
});

const filterBarStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: Theme.Spacing.sm,
  marginBottom: Theme.Spacing.lg
};

const chipStyle = (active: boolean): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: `${Theme.Spacing.xs} ${Theme.Spacing.md}`,
  borderRadius: Theme.Radii.full,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  backgroundColor: active
    ? Theme.Colors.primary
    : Theme.Colors.surfaceContainer,
  color: active ? Theme.Colors.onPrimary : Theme.Colors.onSurfaceVariant,
  cursor: 'pointer',
  border: 'none',
  transition: 'background-color 0.15s, color 0.15s'
});

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: Theme.Spacing.lg
};

const emptyStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  padding: Theme.Spacing.lg,
  textAlign: 'center'
};

export const Resultados = (): ReactElement => {
  const isMobile = useIsMobile();
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<ResultsFilter>('all');

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response: IMatchesResponse = await apiGet<IMatchesResponse>(
        '/api/matches'
      );
      setMatches(adaptMatchListFromApi(response.matches));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect((): void => {
    void load();
  }, [load]);

  const orderedMatches: IMatch[] = [...matches].sort(
    (a: IMatch, b: IMatch): number => {
      if (a.isFinished !== b.isFinished) {
        return a.isFinished ? -1 : 1;
      }
      return (
        new Date(a.kickoffDate).getTime() - new Date(b.kickoffDate).getTime()
      );
    }
  );

  const visibleMatches: IMatch[] = applyFilter(orderedMatches, filter);

  return (
    <>
      <div style={headerRowStyle}>
        <span
          className="material-symbols-outlined"
          style={{
            color: Theme.Colors.primary,
            fontSize: isMobile ? '32px' : '48px',
            fontVariationSettings: "'FILL' 1"
          }}
        >
          sports_soccer
        </span>
        <h1 style={titleStyle(isMobile)}>Resultados y Partidos</h1>
      </div>

      <div style={filterBarStyle}>
        {FILTER_OPTIONS.map(
          (opt: IFilterOption): ReactElement => (
            <button
              key={opt.value}
              type="button"
              style={chipStyle(filter === opt.value)}
              onClick={(): void => setFilter(opt.value)}
            >
              {opt.label}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div style={emptyStyle}>Cargando partidos…</div>
      ) : visibleMatches.length === 0 ? (
        <div style={emptyStyle}>
          {matches.length === 0
            ? 'Aún no hay partidos cargados.'
            : 'No hay partidos para este filtro.'}
        </div>
      ) : (
        <div style={listStyle}>
          {visibleMatches.map(
            (match: IMatch): ReactElement => (
              <ResultCard key={match.id} match={match} />
            )
          )}
        </div>
      )}
    </>
  );
};
