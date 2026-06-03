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

interface IMatchesResponse {
  matches: unknown;
}

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

      {loading ? (
        <div style={emptyStyle}>Cargando partidos…</div>
      ) : orderedMatches.length === 0 ? (
        <div style={emptyStyle}>Aún no hay partidos cargados.</div>
      ) : (
        <div style={listStyle}>
          {orderedMatches.map(
            (match: IMatch): ReactElement => (
              <ResultCard key={match.id} match={match} />
            )
          )}
        </div>
      )}
    </>
  );
};
