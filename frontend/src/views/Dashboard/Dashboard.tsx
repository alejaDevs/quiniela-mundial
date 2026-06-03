import {
  ReactElement,
  CSSProperties,
  useEffect,
  useState,
  useCallback
} from 'react';
import { toast } from 'sonner';
import { Theme } from '../../Theme';
import { IMatch, IPrediction } from '../../types/Index';
import { apiGet, apiPost } from '../../utils/ApiClient';
import { adaptMatchListFromApi } from '../../adapters/MatchAdapter';
import {
  adaptPredictionFromApi,
  adaptPredictionListFromApi
} from '../../adapters/PredictionAdapter';
import { MatchCard } from '../../components/MatchCard';
import { isMatchLocked } from '../../utils/MatchLock';
import { hasRecentResults } from '../../utils/RecentResultsEvaluator';
import { useIsMobile } from '../../utils/UseIsMobile';

const RESULTS_NOTIFIED_KEY = 'quiniela2026.results_notified';

interface IMatchesResponse {
  matches: unknown;
}

interface IPredictionsResponse {
  predictions: unknown;
}

interface IPredictionResponse {
  prediction: unknown;
}

interface IDraft {
  homeScore: number | null;
  awayScore: number | null;
}

interface IToast {
  message: string;
  ok: boolean;
}

const headerStyle = (isMobile: boolean): CSSProperties => ({
  marginBottom: isMobile ? Theme.Spacing.lg : Theme.Spacing.xl
});

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
  color: Theme.Colors.onSurface,
  margin: 0,
  marginBottom: Theme.Spacing.sm
});

const subtitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyLg.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  margin: 0
};

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: Theme.Spacing.md
};

const matchWrapperStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: Theme.Spacing.sm
};

const matchActionRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: Theme.Spacing.md,
  paddingRight: Theme.Spacing.xs
};

const saveButtonStyle = (disabled: boolean): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: Theme.Spacing.sm,
  backgroundColor: Theme.Colors.primary,
  color: Theme.Colors.onPrimary,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.lg}`,
  borderRadius: Theme.Radii.md,
  opacity: disabled ? 0.5 : 1,
  cursor: disabled ? 'default' : 'pointer'
});

const toastStyle = (ok: boolean): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: Theme.Spacing.xs,
  padding: `${Theme.Spacing.xs} ${Theme.Spacing.md}`,
  borderRadius: Theme.Radii.full,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  fontWeight: Theme.Typography.labelMd.fontWeight,
  backgroundColor: ok ? Theme.Colors.primaryFixed : Theme.Colors.errorContainer,
  color: ok ? Theme.Colors.primary : Theme.Colors.onErrorContainer
});

const messageStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  padding: Theme.Spacing.lg,
  textAlign: 'center'
};

export const Dashboard = (): ReactElement => {
  const isMobile = useIsMobile();
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [predictionsByMatchId, setPredictionsByMatchId] = useState<
    Map<string, IPrediction>
  >(new Map());
  const [drafts, setDrafts] = useState<Map<string, IDraft>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastByMatchId, setToastByMatchId] = useState<Map<string, IToast>>(
    new Map()
  );

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const matchesResponse: IMatchesResponse = await apiGet<IMatchesResponse>(
        '/api/matches'
      );
      const predictionsResponse: IPredictionsResponse =
        await apiGet<IPredictionsResponse>('/api/predictions/me');

      const matchList: IMatch[] = adaptMatchListFromApi(matchesResponse.matches);
      const predictionList: IPrediction[] = adaptPredictionListFromApi(
        predictionsResponse.predictions
      );

      const predictionsMap: Map<string, IPrediction> = new Map();
      predictionList.forEach((p: IPrediction): void => {
        predictionsMap.set(p.matchId, p);
      });

      setMatches(matchList);
      setPredictionsByMatchId(predictionsMap);
      setDrafts(new Map());

      if (
        hasRecentResults(matchList) &&
        sessionStorage.getItem(RESULTS_NOTIFIED_KEY) === null
      ) {
        sessionStorage.setItem(RESULTS_NOTIFIED_KEY, '1');
        toast.success(
          '¡Nuevos marcadores publicados! Revisa la tabla de posiciones.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect((): void => {
    void loadData();
  }, [loadData]);

  const updateDraft = (
    matchId: string,
    side: 'home' | 'away',
    value: number
  ): void => {
    setDrafts((prev: Map<string, IDraft>): Map<string, IDraft> => {
      const next: Map<string, IDraft> = new Map(prev);
      const existing: IDraft | undefined = next.get(matchId);
      const baseline: IPrediction | undefined = predictionsByMatchId.get(matchId);
      const home: number | null =
        side === 'home'
          ? value
          : existing?.homeScore ?? baseline?.predictedHomeScore ?? null;
      const away: number | null =
        side === 'away'
          ? value
          : existing?.awayScore ?? baseline?.predictedAwayScore ?? null;
      next.set(matchId, { homeScore: home, awayScore: away });
      return next;
    });
  };

  const resolveHomeValue = (matchId: string): number | null => {
    const draft: IDraft | undefined = drafts.get(matchId);
    if (draft !== undefined) {
      return draft.homeScore;
    }
    return predictionsByMatchId.get(matchId)?.predictedHomeScore ?? null;
  };

  const resolveAwayValue = (matchId: string): number | null => {
    const draft: IDraft | undefined = drafts.get(matchId);
    if (draft !== undefined) {
      return draft.awayScore;
    }
    return predictionsByMatchId.get(matchId)?.predictedAwayScore ?? null;
  };

  const showToast = (matchId: string, message: string, ok: boolean): void => {
    setToastByMatchId(
      (prev: Map<string, IToast>): Map<string, IToast> =>
        new Map(prev).set(matchId, { message, ok })
    );
    setTimeout((): void => {
      setToastByMatchId((prev: Map<string, IToast>): Map<string, IToast> => {
        const next: Map<string, IToast> = new Map(prev);
        next.delete(matchId);
        return next;
      });
    }, 3000);
  };

  const handleSaveMatch = async (match: IMatch): Promise<void> => {
    const draft: IDraft | undefined = drafts.get(match.id);
    if (
      draft === undefined ||
      draft.homeScore === null ||
      draft.awayScore === null
    ) {
      return;
    }
    if (isMatchLocked(new Date(match.kickoffDate))) {
      return;
    }
    setSavingId(match.id);
    try {
      const response: IPredictionResponse = await apiPost<IPredictionResponse>(
        '/api/predictions',
        {
          matchId: match.id,
          predictedHomeScore: draft.homeScore,
          predictedAwayScore: draft.awayScore
        }
      );
      const saved: IPrediction = adaptPredictionFromApi(response.prediction);
      setPredictionsByMatchId(
        (prev: Map<string, IPrediction>): Map<string, IPrediction> =>
          new Map(prev).set(saved.matchId, saved)
      );
      setDrafts((prev: Map<string, IDraft>): Map<string, IDraft> => {
        const next: Map<string, IDraft> = new Map(prev);
        next.delete(match.id);
        return next;
      });
      showToast(match.id, 'Predicción guardada', true);
    } catch (err: unknown) {
      const message: string =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Error al guardar';
      showToast(match.id, message, false);
    } finally {
      setSavingId(null);
    }
  };

  const upcomingMatches: IMatch[] = matches.filter(
    (m: IMatch): boolean => !m.isFinished
  );

  return (
    <>
      <div style={headerStyle(isMobile)}>
        <h1 style={titleStyle(isMobile)}>Fase de Grupos</h1>
        <p style={subtitleStyle}>
          Ingresa tu pronóstico para cada partido. Una vez que un encuentro
          inicie, los marcadores quedan bloqueados.
        </p>
      </div>

      {loading ? (
        <div style={messageStyle}>Cargando partidos…</div>
      ) : upcomingMatches.length === 0 ? (
        <div style={messageStyle}>Aún no hay partidos próximos.</div>
      ) : (
        <div style={listStyle}>
          {upcomingMatches.map(
            (match: IMatch): ReactElement => {
              const draft: IDraft | undefined = drafts.get(match.id);
              const hasDraft: boolean =
                draft !== undefined &&
                draft.homeScore !== null &&
                draft.awayScore !== null;
              const locked: boolean = isMatchLocked(new Date(match.kickoffDate));
              const isSaving: boolean = savingId === match.id;
              const toast: IToast | undefined = toastByMatchId.get(match.id);

              return (
                <div key={match.id} style={matchWrapperStyle}>
                  <MatchCard
                    match={match}
                    predictedHomeScore={resolveHomeValue(match.id)}
                    predictedAwayScore={resolveAwayValue(match.id)}
                    onHomeScoreChange={(value: number): void =>
                      updateDraft(match.id, 'home', value)
                    }
                    onAwayScoreChange={(value: number): void =>
                      updateDraft(match.id, 'away', value)
                    }
                  />
                  <div style={matchActionRowStyle}>
                    {toast !== undefined ? (
                      <span style={toastStyle(toast.ok)}>
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
                        >
                          {toast.ok ? 'check_circle' : 'error'}
                        </span>
                        {toast.message}
                      </span>
                    ) : null}
                    {!locked ? (
                      <button
                        type="button"
                        disabled={isSaving || !hasDraft}
                        onClick={(): void => {
                          void handleSaveMatch(match);
                        }}
                        style={saveButtonStyle(isSaving || !hasDraft)}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
                        >
                          save
                        </span>
                        {isSaving ? 'Guardando…' : 'Guardar'}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </>
  );
};
