import {
  ReactElement,
  CSSProperties,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Theme } from "../../Theme";
import { useIsMobile } from "../../utils/UseIsMobile";
import { IMatch, MatchStage } from "../../types/Index";
import { apiGet } from "../../utils/ApiClient";
import { adaptMatchListFromApi } from "../../adapters/MatchAdapter";
import { ResultCard } from "../../components/ResultCard";

type TimeFilter = "all" | "today" | "week" | "finished";
type StageFilter = MatchStage | "final_all";

interface IMatchesResponse {
  matches: unknown;
}

const TIME_OPTIONS: ReadonlyArray<{ key: TimeFilter; label: string }> = [
  { key: "all",      label: "Todos" },
  { key: "today",    label: "Hoy" },
  { key: "week",     label: "Esta semana" },
  { key: "finished", label: "Finalizados" },
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

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isSameWeek = (date: Date, ref: Date): boolean => {
  const day: number = ref.getDay();
  const diff: number = day === 0 ? -6 : 1 - day;
  const start: Date = new Date(ref);
  start.setDate(ref.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end: Date = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
};

// ── Styles ───────────────────────────────────────────────────────────────────

const headerRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: Theme.Spacing.md,
  marginBottom: Theme.Spacing.xl,
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
  margin: 0,
});

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
  gap: Theme.Spacing.lg,
  marginTop: Theme.Spacing.lg,
};

const emptyStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  padding: Theme.Spacing.lg,
  textAlign: "center",
  marginTop: Theme.Spacing.lg,
};

// ── Component ────────────────────────────────────────────────────────────────

export const Resultados = (): ReactElement => {
  const isMobile = useIsMobile();
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [stageFilter, setStageFilter] = useState<StageFilter | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response: IMatchesResponse =
        await apiGet<IMatchesResponse>("/api/matches");
      const matchList: IMatch[] = adaptMatchListFromApi(response.matches);
      setMatches(matchList);

      // Auto-select the first stage that has unfinished matches (the "active" stage)
      const activeStage: MatchStage | undefined = ORDERED_STAGES.find(
        (s: MatchStage): boolean =>
          matchList.some((m: IMatch) => m.stage === s && !m.isFinished),
      );
      // Fallback: last stage that has any match at all
      const fallbackStage: MatchStage | undefined = [...ORDERED_STAGES]
        .reverse()
        .find((s: MatchStage): boolean =>
          matchList.some((m: IMatch) => m.stage === s),
        );

      const selected: MatchStage | undefined = activeStage ?? fallbackStage;
      if (selected !== undefined) {
        setStageFilter(selected === "third_place" ? "final_all" : selected);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect((): void => {
    void load();
  }, [load]);

  // ── Filter logic ───────────────────────────────────────────────────────────

  const byStage: IMatch[] = matches.filter((m: IMatch): boolean => {
    if (stageFilter === null) return true;
    if (stageFilter === "final_all") {
      return m.stage === "final" || m.stage === "third_place";
    }
    return m.stage === stageFilter;
  });

  const now: Date = new Date();

  const visibleMatches: IMatch[] = byStage
    .filter((m: IMatch): boolean => {
      const kickoff: Date = new Date(m.kickoffDate);
      if (timeFilter === "finished") return m.isFinished;
      if (timeFilter === "today") return isSameDay(kickoff, now);
      if (timeFilter === "week") return isSameWeek(kickoff, now);
      return true;
    })
    .sort((a: IMatch, b: IMatch): number => {
      if (a.isFinished !== b.isFinished) return a.isFinished ? -1 : 1;
      return (
        new Date(a.kickoffDate).getTime() - new Date(b.kickoffDate).getTime()
      );
    });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div style={headerRowStyle}>
        <span
          className="material-symbols-outlined"
          style={{
            color: Theme.Colors.primary,
            fontSize: isMobile ? "32px" : "48px",
            fontVariationSettings: "'FILL' 1",
          }}
        >
          sports_soccer
        </span>
        <h1 style={titleStyle(isMobile)}>Resultados y Partidos</h1>
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

      {/* Time filter */}
      <div style={filterBarStyle}>
        <span style={filterLabelStyle}>Tiempo:</span>
        {TIME_OPTIONS.map(
          (opt): ReactElement => (
            <button
              key={opt.key}
              type="button"
              style={chipStyle(timeFilter === opt.key)}
              onClick={(): void => setTimeFilter(opt.key)}
            >
              {opt.label}
            </button>
          ),
        )}
      </div>

      {loading ? (
        <div style={emptyStyle}>Cargando partidos…</div>
      ) : visibleMatches.length === 0 ? (
        <div style={emptyStyle}>
          {matches.length === 0
            ? "Aún no hay partidos cargados."
            : "No hay partidos para los filtros seleccionados."}
        </div>
      ) : (
        <div style={listStyle}>
          {visibleMatches.map(
            (match: IMatch): ReactElement => (
              <ResultCard key={match.id} match={match} />
            ),
          )}
        </div>
      )}
    </>
  );
};
