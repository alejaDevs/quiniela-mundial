import {
  ReactElement,
  CSSProperties,
  useEffect,
  useState,
  useCallback,
} from "react";
import { toast } from "sonner";
import { Theme } from "../../Theme";
import { IMatch, IPrediction, MatchStage } from "../../types/Index";
import { apiGet, apiPost } from "../../utils/ApiClient";
import { adaptMatchListFromApi } from "../../adapters/MatchAdapter";
import {
  adaptPredictionFromApi,
  adaptPredictionListFromApi,
} from "../../adapters/PredictionAdapter";
import { MatchCard } from "../../components/MatchCard";
import { isMatchLocked } from "../../utils/MatchLock";
import {
  hasRecentResults,
  findDeadlineMatches,
} from "../../utils/RecentResultsEvaluator";
import { useIsMobile } from "../../utils/UseIsMobile";

const RESULTS_NOTIFIED_KEY = "quiniela2026.results_notified";
const DEADLINE_NOTIFIED_KEY = "quiniela2026.deadline_notified";

const STAGE_LABELS: Record<MatchStage, string> = {
  group: "Fase de Grupos",
  round_of_32: "16vos de Final",
  round_of_16: "Octavos de Final",
  quarter_final: "Cuartos de Final",
  semi_final: "Semifinales",
  third_place: "3er Lugar",
  final: "Final",
};

const ORDERED_STAGES: MatchStage[] = [
  "group",
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "third_place",
  "final",
];

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

const getAvailableGroups = (matches: IMatch[]): string[] => {
  const groups = matches
    .map((m: IMatch) => m.groupLabel)
    .filter((g): g is string => g !== null && g !== undefined);
  return [...new Set(groups)].sort();
};

const headerStyle = (isMobile: boolean): CSSProperties => ({
  marginBottom: isMobile ? Theme.Spacing.lg : Theme.Spacing.xl,
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
  marginBottom: Theme.Spacing.sm,
});

const subtitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyLg.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  margin: 0,
};

const listStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: Theme.Spacing.md,
};

const matchWrapperStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: Theme.Spacing.sm,
};

const matchActionRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: Theme.Spacing.md,
  paddingRight: Theme.Spacing.xs,
};

const saveButtonStyle = (disabled: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
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
  cursor: disabled ? "default" : "pointer",
  border: "none",
});

const filterBarStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: Theme.Spacing.sm,
  marginBottom: Theme.Spacing.lg,
};

const chipStyle = (active: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
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
  cursor: "pointer",
  border: "none",
  transition: "background-color 0.15s, color 0.15s",
});

const disabledChipStyle: CSSProperties = {
  ...chipStyle(false),
  opacity: 0.4,
  cursor: "default",
};

const filterLabelStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: Theme.Colors.onSurfaceVariant,
  alignSelf: "center",
  marginRight: Theme.Spacing.xs,
};

const messageStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  padding: Theme.Spacing.lg,
  textAlign: "center",
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
  const [activeStage, setActiveStage] = useState<MatchStage>("group");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const matchesResponse: IMatchesResponse =
        await apiGet<IMatchesResponse>("/api/matches");
      const predictionsResponse: IPredictionsResponse =
        await apiGet<IPredictionsResponse>("/api/predictions/me");

      const matchList: IMatch[] = adaptMatchListFromApi(
        matchesResponse.matches,
      );
      const predictionList: IPrediction[] = adaptPredictionListFromApi(
        predictionsResponse.predictions,
      );

      const predictionsMap: Map<string, IPrediction> = new Map();
      predictionList.forEach((p: IPrediction): void => {
        predictionsMap.set(p.matchId, p);
      });

      setMatches(matchList);
      setPredictionsByMatchId(predictionsMap);
      setDrafts(new Map());

      const pending: IMatch[] = matchList.filter(
        (m: IMatch): boolean => !m.isFinished && !predictionsMap.has(m.id),
      );
      const firstStage: MatchStage | undefined = ORDERED_STAGES.find(
        (s: MatchStage): boolean => pending.some((m: IMatch) => m.stage === s),
      );
      if (firstStage !== undefined) {
        setActiveStage(firstStage);
        setGroupFilter(null);
      }

      if (
        hasRecentResults(matchList) &&
        sessionStorage.getItem(RESULTS_NOTIFIED_KEY) === null
      ) {
        sessionStorage.setItem(RESULTS_NOTIFIED_KEY, "1");
        toast.success(
          "¡Nuevos marcadores publicados! Revisa la tabla de posiciones.",
        );
      }

      const predictedIds: ReadonlySet<string> = new Set(
        predictionList.map((p: IPrediction): string => p.matchId),
      );
      const deadlineMatches: IMatch[] = findDeadlineMatches(
        matchList,
        predictedIds,
      );
      if (
        deadlineMatches.length > 0 &&
        sessionStorage.getItem(DEADLINE_NOTIFIED_KEY) === null
      ) {
        sessionStorage.setItem(DEADLINE_NOTIFIED_KEY, "1");
        const message: string =
          deadlineMatches.length === 1
            ? `${deadlineMatches[0].homeTeam.name} vs ${deadlineMatches[0].awayTeam.name} cierra en menos de 24 h y aún no tienes predicción.`
            : `Tienes ${deadlineMatches.length} partidos que cierran en menos de 24 h sin predicción registrada.`;
        toast.warning(message);
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
    side: "home" | "away",
    value: number,
  ): void => {
    setDrafts((prev: Map<string, IDraft>): Map<string, IDraft> => {
      const next: Map<string, IDraft> = new Map(prev);
      const existing: IDraft | undefined = next.get(matchId);
      const baseline: IPrediction | undefined =
        predictionsByMatchId.get(matchId);
      const home: number | null =
        side === "home"
          ? value
          : (existing?.homeScore ?? baseline?.predictedHomeScore ?? null);
      const away: number | null =
        side === "away"
          ? value
          : (existing?.awayScore ?? baseline?.predictedAwayScore ?? null);
      next.set(matchId, { homeScore: home, awayScore: away });
      return next;
    });
  };

  const resolveHomeValue = (matchId: string): number | null => {
    const draft: IDraft | undefined = drafts.get(matchId);
    if (draft !== undefined) return draft.homeScore;
    return predictionsByMatchId.get(matchId)?.predictedHomeScore ?? null;
  };

  const resolveAwayValue = (matchId: string): number | null => {
    const draft: IDraft | undefined = drafts.get(matchId);
    if (draft !== undefined) return draft.awayScore;
    return predictionsByMatchId.get(matchId)?.predictedAwayScore ?? null;
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
    if (isMatchLocked(new Date(match.kickoffDate))) return;

    setSavingId(match.id);
    try {
      const response: IPredictionResponse = await apiPost<IPredictionResponse>(
        "/api/predictions",
        {
          matchId: match.id,
          predictedHomeScore: draft.homeScore,
          predictedAwayScore: draft.awayScore,
        },
      );
      const saved: IPrediction = adaptPredictionFromApi(response.prediction);
      setPredictionsByMatchId(
        (prev: Map<string, IPrediction>): Map<string, IPrediction> =>
          new Map(prev).set(saved.matchId, saved),
      );
      setDrafts((prev: Map<string, IDraft>): Map<string, IDraft> => {
        const next: Map<string, IDraft> = new Map(prev);
        next.delete(match.id);
        return next;
      });
      toast.success(
        `Pronóstico de ${match.homeTeam.name} vs ${match.awayTeam.name} guardado.`,
      );
    } catch (err: unknown) {
      const message: string =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Error al guardar";
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  };

  const allPending: IMatch[] = matches.filter(
    (m: IMatch): boolean => !m.isFinished && !predictionsByMatchId.has(m.id),
  );

  const stagesWithMatches: MatchStage[] = ORDERED_STAGES.filter(
    (s: MatchStage): boolean => allPending.some((m: IMatch) => m.stage === s),
  );

  const pendingForStage: IMatch[] = allPending.filter(
    (m: IMatch): boolean => m.stage === activeStage,
  );

  const availableGroups: string[] = getAvailableGroups(pendingForStage);

  const visibleMatches: IMatch[] =
    activeStage === "group" && groupFilter !== null
      ? pendingForStage.filter((m: IMatch) => m.groupLabel === groupFilter)
      : pendingForStage;

  const stageTitle: string = STAGE_LABELS[activeStage];

  const handleStageChange = (stage: MatchStage): void => {
    setActiveStage(stage);
    setGroupFilter(null);
  };

  return (
    <>
      <div style={headerStyle(isMobile)}>
        <h1 style={titleStyle(isMobile)}>Pronósticos</h1>
        <p style={subtitleStyle}>
          Ingresa tu pronóstico para cada partido. Una vez que inicie, el
          marcador queda bloqueado.
        </p>
      </div>

      {/* Stage tabs */}
      {stagesWithMatches.length > 0 && (
        <div style={filterBarStyle}>
          <span style={filterLabelStyle}>Fase:</span>
          {ORDERED_STAGES.map((stage: MatchStage): ReactElement => {
            const hasMatches: boolean = stagesWithMatches.includes(stage);
            return (
              <button
                key={stage}
                type="button"
                disabled={!hasMatches}
                style={
                  !hasMatches
                    ? disabledChipStyle
                    : chipStyle(activeStage === stage)
                }
                onClick={(): void => {
                  if (hasMatches) handleStageChange(stage);
                }}
              >
                {STAGE_LABELS[stage]}
              </button>
            );
          })}
        </div>
      )}

      {/* Group filter — only for group stage */}
      {activeStage === "group" && availableGroups.length > 0 && (
        <div style={filterBarStyle}>
          <span style={filterLabelStyle}>Grupo:</span>
          <button
            type="button"
            style={chipStyle(groupFilter === null)}
            onClick={(): void => setGroupFilter(null)}
          >
            Todos
          </button>
          {availableGroups.map(
            (group: string): ReactElement => (
              <button
                key={group}
                type="button"
                style={chipStyle(groupFilter === group)}
                onClick={(): void => setGroupFilter(group)}
              >
                {group}
              </button>
            ),
          )}
        </div>
      )}

      {loading ? (
        <div style={messageStyle}>Cargando partidos…</div>
      ) : visibleMatches.length === 0 ? (
        <div style={messageStyle}>
          {stagesWithMatches.length === 0
            ? "¡Ya tienes pronóstico en todos los partidos disponibles!"
            : activeStage !== "group"
              ? `No hay partidos de ${stageTitle} pendientes por pronosticar.`
              : groupFilter !== null
                ? "No hay partidos pendientes en este grupo."
                : "No hay partidos de Fase de Grupos pendientes."}
        </div>
      ) : (
        <div style={listStyle}>
          {visibleMatches.map((match: IMatch): ReactElement => {
            const draft: IDraft | undefined = drafts.get(match.id);
            const hasDraft: boolean =
              draft !== undefined &&
              draft.homeScore !== null &&
              draft.awayScore !== null;
            const locked: boolean = isMatchLocked(new Date(match.kickoffDate));
            const isSaving: boolean = savingId === match.id;

            return (
              <div key={match.id} style={matchWrapperStyle}>
                <MatchCard
                  match={match}
                  predictedHomeScore={resolveHomeValue(match.id)}
                  predictedAwayScore={resolveAwayValue(match.id)}
                  onHomeScoreChange={(value: number): void =>
                    updateDraft(match.id, "home", value)
                  }
                  onAwayScoreChange={(value: number): void =>
                    updateDraft(match.id, "away", value)
                  }
                />
                <div style={matchActionRowStyle}>
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
                        style={{
                          fontSize: "18px",
                          fontVariationSettings: "'FILL' 1",
                        }}
                      >
                        save
                      </span>
                      {isSaving ? "Guardando…" : "Guardar"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
