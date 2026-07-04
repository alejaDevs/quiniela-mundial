import {
  ReactElement,
  CSSProperties,
  useEffect,
  useState,
  useCallback,
} from "react";
import { toast } from "sonner";
import { Theme } from "../../Theme";
import { useIsMobile } from "../../utils/UseIsMobile";
import { IMatch, IPrediction, MatchStage } from "../../types/Index";
import { apiGet, apiPost } from "../../utils/ApiClient";
import { adaptMatchListFromApi } from "../../adapters/MatchAdapter";
import {
  adaptPredictionFromApi,
  adaptPredictionListFromApi,
} from "../../adapters/PredictionAdapter";
import { MatchCard } from "../../components/MatchCard";
import { isMatchLocked } from "../../utils/MatchLock";

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

type TimeFilter = "today" | "week" | "pending" | "locked" | "finished";
type StageFilter = MatchStage | "final_all";

const TIME_OPTIONS: ReadonlyArray<{ key: TimeFilter | null; label: string }> = [
  { key: null,        label: "Todos" },
  { key: "today",     label: "Hoy" },
  { key: "week",      label: "Esta semana" },
  { key: "pending",   label: "Pendientes" },
  { key: "locked",    label: "Bloqueados" },
  { key: "finished",  label: "Finalizados" },
];

const STAGE_OPTIONS: ReadonlyArray<{ key: StageFilter | null; label: string }> = [
  { key: null,            label: "Todas" },
  { key: "group",         label: "Fase de Grupos" },
  { key: "round_of_32",   label: "16vos" },
  { key: "round_of_16",   label: "Octavos" },
  { key: "quarter_final", label: "Cuartos" },
  { key: "semi_final",    label: "Semis" },
  { key: "final_all",     label: "Final" },
];

const ORDERED_STAGES: MatchStage[] = [
  "group",
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "third_place",
  "final",
];

const isToday = (date: Date): boolean => {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const getWeekBounds = (): { start: Date; end: Date } => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ── Styles ───────────────────────────────────────────────────────────────────

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
  marginTop: 0,
  marginBottom: Theme.Spacing.xl,
};

const filterBarStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: Theme.Spacing.sm,
  marginBottom: Theme.Spacing.md,
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

const listStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: Theme.Spacing.md,
  marginTop: Theme.Spacing.lg,
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

const emptyStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  padding: Theme.Spacing.lg,
  textAlign: "center",
  marginTop: Theme.Spacing.lg,
};

// ── Component ────────────────────────────────────────────────────────────────

export const MisPredicciones = (): ReactElement => {
  const isMobile = useIsMobile();
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [predictionsByMatchId, setPredictionsByMatchId] = useState<
    Map<string, IPrediction>
  >(new Map());
  const [drafts, setDrafts] = useState<Map<string, IDraft>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter | null>(null);
  const [stageFilter, setStageFilter] = useState<StageFilter | null>(null);

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

      // Auto-select the active phase: first stage with any unfinished match
      const activeStage: MatchStage | undefined = ORDERED_STAGES.find(
        (s: MatchStage): boolean =>
          matchList.some((m: IMatch) => m.stage === s && !m.isFinished),
      );
      if (activeStage !== undefined) {
        setStageFilter(activeStage === "third_place" ? "final_all" : activeStage);
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

  const handleSavePrediction = async (matchId: string): Promise<void> => {
    const draft: IDraft | undefined = drafts.get(matchId);
    if (
      draft === undefined ||
      draft.homeScore === null ||
      draft.awayScore === null
    ) {
      return;
    }
    setSavingId(matchId);
    try {
      const response: IPredictionResponse =
        await apiPost<IPredictionResponse>("/api/predictions", {
          matchId,
          predictedHomeScore: draft.homeScore,
          predictedAwayScore: draft.awayScore,
        });
      const saved: IPrediction = adaptPredictionFromApi(response.prediction);
      setPredictionsByMatchId(
        (prev: Map<string, IPrediction>): Map<string, IPrediction> =>
          new Map(prev).set(saved.matchId, saved),
      );
      setDrafts((prev: Map<string, IDraft>): Map<string, IDraft> => {
        const next: Map<string, IDraft> = new Map(prev);
        next.delete(matchId);
        return next;
      });
      toast.success("Predicción actualizada.");
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

  // ── Filter helpers ─────────────────────────────────────────────────────────

  const passesTimeFilter = (match: IMatch): boolean => {
    if (timeFilter === null) return true;
    const kickoff = new Date(match.kickoffDate);
    const locked = isMatchLocked(kickoff);
    if (timeFilter === "today") return isToday(kickoff);
    if (timeFilter === "week") {
      const { start, end } = getWeekBounds();
      return kickoff >= start && kickoff <= end;
    }
    if (timeFilter === "pending") return !match.isFinished && !locked;
    if (timeFilter === "locked") return locked && !match.isFinished;
    return match.isFinished; // "finished"
  };

  const passesStageFilter = (match: IMatch): boolean => {
    if (stageFilter === null) return true;
    if (stageFilter === "final_all") {
      return match.stage === "final" || match.stage === "third_place";
    }
    return match.stage === stageFilter;
  };

  // Only show matches that have a saved prediction
  const savedMatches: IMatch[] = matches.filter((m: IMatch): boolean =>
    predictionsByMatchId.has(m.id),
  );

  const visibleMatches: IMatch[] = savedMatches.filter(
    (m: IMatch): boolean => passesTimeFilter(m) && passesStageFilter(m),
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <h1 style={titleStyle(isMobile)}>Mis Predicciones</h1>
      <p style={subtitleStyle}>
        Tus pronósticos guardados. Puedes editar los de partidos que aún no han
        iniciado.
      </p>

      {/* Time filter */}
      <div style={filterBarStyle}>
        <span style={filterLabelStyle}>Tiempo:</span>
        {TIME_OPTIONS.map(
          (opt): ReactElement => (
            <button
              key={opt.key ?? "all-time"}
              type="button"
              style={chipStyle(timeFilter === opt.key)}
              onClick={(): void => setTimeFilter(opt.key)}
            >
              {opt.label}
            </button>
          ),
        )}
      </div>

      {/* Stage filter */}
      <div style={filterBarStyle}>
        <span style={filterLabelStyle}>Fase:</span>
        {STAGE_OPTIONS.map(
          (opt): ReactElement => (
            <button
              key={opt.key ?? "all-stages"}
              type="button"
              style={chipStyle(stageFilter === opt.key)}
              onClick={(): void => setStageFilter(opt.key)}
            >
              {opt.label}
            </button>
          ),
        )}
      </div>

      {loading ? (
        <div style={emptyStyle}>Cargando…</div>
      ) : savedMatches.length === 0 ? (
        <div style={emptyStyle}>
          Aún no tienes predicciones guardadas. Ve a Pronósticos para registrar
          las tuyas.
        </div>
      ) : visibleMatches.length === 0 ? (
        <div style={emptyStyle}>
          No hay predicciones que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <div style={listStyle}>
          {visibleMatches.map((match: IMatch): ReactElement => {
            const locked: boolean = isMatchLocked(
              new Date(match.kickoffDate),
            );
            const draft: IDraft | undefined = drafts.get(match.id);
            const hasDraft: boolean =
              draft !== undefined &&
              draft.homeScore !== null &&
              draft.awayScore !== null;
            const isSaving: boolean = savingId === match.id;

            return (
              <div key={match.id} style={matchWrapperStyle}>
                <MatchCard
                  match={match}
                  predictedHomeScore={resolveHomeValue(match.id)}
                  predictedAwayScore={resolveAwayValue(match.id)}
                  variant={locked ? "readonly" : "editable"}
                  onHomeScoreChange={
                    locked
                      ? undefined
                      : (value: number): void =>
                          updateDraft(match.id, "home", value)
                  }
                  onAwayScoreChange={
                    locked
                      ? undefined
                      : (value: number): void =>
                          updateDraft(match.id, "away", value)
                  }
                />
                {!locked ? (
                  <div style={matchActionRowStyle}>
                    <button
                      type="button"
                      disabled={isSaving || !hasDraft}
                      onClick={(): void => {
                        void handleSavePrediction(match.id);
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
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
