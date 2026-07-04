import {
  ReactElement,
  CSSProperties,
  useEffect,
  useState,
} from "react";
import { Theme } from "../../Theme";
import { useIsMobile } from "../../utils/UseIsMobile";
import { IMatch, MatchStage, IPhaseSnapshotSummary, IPhaseSnapshot } from "../../types/Index";
import { apiGet } from "../../utils/ApiClient";
import { adaptMatchListFromApi } from "../../adapters/MatchAdapter";

// ── Types ─────────────────────────────────────────────────────────────────────

type PhaseKey =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "final_all";

interface IPhaseLeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  totalPoints: number;
  predictionsCount: number;
  predictionsScored: number;
  totalFinishedMatchesInPhase: number;
  rank: number;
}

interface IMatchesResponse {
  matches: unknown;
}

interface IPhaseLeaderboardResponse {
  entries: IPhaseLeaderboardEntry[];
  totalFinishedMatchesInPhase: number;
}

interface ISnapshotsResponse {
  snapshots: IPhaseSnapshotSummary[];
}

interface ISnapshotResponse {
  snapshot: IPhaseSnapshot;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PHASE_TABS: ReadonlyArray<{ key: PhaseKey; label: string }> = [
  { key: "group",         label: "Fase de Grupos" },
  { key: "round_of_32",   label: "16vos de Final" },
  { key: "round_of_16",   label: "Octavos de Final" },
  { key: "quarter_final", label: "Cuartos de Final" },
  { key: "semi_final",    label: "Semifinales" },
  { key: "final_all",     label: "Final" },
];

const PHASE_STAGES: Record<PhaseKey, MatchStage[]> = {
  group:         ["group"],
  round_of_32:   ["round_of_32"],
  round_of_16:   ["round_of_16"],
  quarter_final: ["quarter_final"],
  semi_final:    ["semi_final"],
  final_all:     ["final", "third_place"],
};

const ORDERED_PHASES: PhaseKey[] = [
  "group", "round_of_32", "round_of_16", "quarter_final", "semi_final", "final_all",
];

const AVATAR_COLORS: ReadonlyArray<{ bg: string; text: string }> = [
  { bg: Theme.Colors.primaryFixed,         text: Theme.Colors.primary },
  { bg: Theme.Colors.secondaryContainer,   text: Theme.Colors.onSecondary },
  { bg: Theme.Colors.tertiaryFixed,        text: Theme.Colors.tertiary },
  { bg: Theme.Colors.surfaceContainerHigh, text: Theme.Colors.onSurface },
];

const GOLD   = "#FFD700";
const SILVER = "#B0BEC5";
const BRONZE = "#CD7F32";

// ── Helpers ───────────────────────────────────────────────────────────────────

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const avatarColor = (index: number): { bg: string; text: string } =>
  AVATAR_COLORS[index % AVATAR_COLORS.length];

const detectActivePhase = (matches: IMatch[]): PhaseKey => {
  const active = ORDERED_PHASES.find((p) =>
    PHASE_STAGES[p].some(
      (s: MatchStage) => matches.some((m) => m.stage === s && !m.isFinished),
    ),
  );
  if (active !== undefined) return active;
  const last = [...ORDERED_PHASES].reverse().find((p) =>
    PHASE_STAGES[p].some((s: MatchStage) => matches.some((m) => m.stage === s)),
  );
  return last ?? "group";
};

// ── Styles ────────────────────────────────────────────────────────────────────

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
  color: Theme.Colors.primary,
  margin: 0,
  marginBottom: Theme.Spacing.sm,
});

const subtitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyLg.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  marginTop: 0,
  marginBottom: Theme.Spacing.xl,
  maxWidth: "560px",
};

const tabsWrapperStyle: CSSProperties = {
  display: "flex",
  overflowX: "auto",
  gap: "0",
  borderBottom: `2px solid ${Theme.Colors.outlineVariant}`,
  marginBottom: Theme.Spacing.xl,
};

const tabStyle = (active: boolean): CSSProperties => ({
  whiteSpace: "nowrap",
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.lg}`,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: active ? 700 : Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: active ? Theme.Colors.primary : Theme.Colors.onSurfaceVariant,
  borderBottom: active ? `2px solid ${Theme.Colors.primary}` : "2px solid transparent",
  marginBottom: "-2px",
  background: "none",
  border: "none",
  borderBottomWidth: "2px",
  borderBottomStyle: "solid",
  borderBottomColor: active ? Theme.Colors.primary : "transparent",
  cursor: "pointer",
  transition: "color 0.15s, border-color 0.15s",
});

const podiumGridStyle = (isMobile: boolean): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
  gap: Theme.Spacing.lg,
  marginBottom: Theme.Spacing.xl,
  alignItems: "end",
});

const podiumCardStyle = (rank: 1 | 2 | 3): CSSProperties => ({
  backgroundColor: rank === 1 ? Theme.Colors.surfaceContainerLowest : Theme.Colors.surfaceContainerLowest,
  borderRadius: Theme.Radii.xl,
  border: rank === 1
    ? `2px solid ${Theme.Colors.primaryContainer}`
    : `1px solid ${Theme.Colors.outlineVariant}`,
  padding: rank === 1 ? `${Theme.Spacing.xl} ${Theme.Spacing.lg}` : `${Theme.Spacing.lg} ${Theme.Spacing.md}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxShadow: rank === 1
    ? "0 8px 32px rgba(0,0,0,0.08)"
    : "0 4px 16px rgba(0,0,0,0.04)",
  position: "relative",
  transform: rank === 1 ? "scale(1.05)" : "scale(1)",
  transition: "transform 0.2s",
});

const leaderBadgeStyle: CSSProperties = {
  position: "absolute",
  top: "-14px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: Theme.Colors.tertiary,
  color: "#ffffff",
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  fontWeight: 700,
  letterSpacing: "0.08em",
  padding: `2px ${Theme.Spacing.md}`,
  borderRadius: Theme.Radii.full,
  whiteSpace: "nowrap",
};

const avatarStyle = (size: number, borderColor: string): CSSProperties => ({
  width: size,
  height: size,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: size >= 80 ? "24px" : "16px",
  fontWeight: 700,
  border: `4px solid ${borderColor}`,
  marginBottom: Theme.Spacing.md,
  flexShrink: 0,
});

const podiumNameStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  fontWeight: 700,
  color: Theme.Colors.onSurface,
  textAlign: "center",
  marginBottom: "4px",
};

const podiumSubStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  marginBottom: Theme.Spacing.md,
};

const podiumScoreStyle = (rank: 1 | 2 | 3): CSSProperties => ({
  backgroundColor: rank === 1 ? Theme.Colors.primaryContainer : Theme.Colors.surfaceContainer,
  color: rank === 1 ? Theme.Colors.onPrimaryContainer : Theme.Colors.primary,
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: "36px",
  fontWeight: 800,
  lineHeight: "44px",
  padding: `${Theme.Spacing.sm} ${rank === 1 ? Theme.Spacing.xl : Theme.Spacing.lg}`,
  borderRadius: Theme.Radii.md,
  marginBottom: "4px",
});

const scoreLabelStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  letterSpacing: "0.08em",
  fontWeight: 600,
};

const tableCardStyle: CSSProperties = {
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  borderRadius: Theme.Radii.xl,
  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
  overflow: "hidden",
};

const tableHeaderBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `${Theme.Spacing.lg} ${Theme.Spacing.xl}`,
  borderBottom: `1px solid ${Theme.Colors.outlineVariant}`,
};

const tableHeaderTitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  fontWeight: 700,
  color: Theme.Colors.primary,
  margin: 0,
};

const tableHeaderNoteStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  display: "flex",
  alignItems: "center",
  gap: Theme.Spacing.xs,
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: 600,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: Theme.Colors.onSurfaceVariant,
  padding: `${Theme.Spacing.md} ${Theme.Spacing.lg}`,
  backgroundColor: Theme.Colors.surfaceContainerLow,
  textAlign: "left",
  borderBottom: `1px solid ${Theme.Colors.outlineVariant}`,
};

const tdStyle: CSSProperties = {
  padding: `${Theme.Spacing.md} ${Theme.Spacing.lg}`,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  color: Theme.Colors.onSurface,
  borderBottom: `1px solid ${Theme.Colors.outlineVariant}`,
  verticalAlign: "middle",
};

const trStyle = (isCurrentUser: boolean, isEven: boolean): CSSProperties => ({
  backgroundColor: isCurrentUser
    ? `${Theme.Colors.primaryFixed}33`
    : isEven
      ? `${Theme.Colors.surfaceContainerLow}44`
      : "transparent",
  borderLeft: isCurrentUser ? `4px solid ${Theme.Colors.primary}` : "4px solid transparent",
  transition: "background-color 0.1s",
});

const rankStyle = (isCurrentUser: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: "24px",
  fontWeight: 800,
  color: isCurrentUser ? Theme.Colors.primary : Theme.Colors.onSurfaceVariant,
});

const accuracyBarWrapStyle: CSSProperties = {
  width: "120px",
  height: "6px",
  backgroundColor: Theme.Colors.outlineVariant,
  borderRadius: Theme.Radii.full,
  overflow: "hidden",
};

const pointsCellStyle = (isCurrentUser: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  fontWeight: 700,
  color: Theme.Colors.primary,
  textAlign: "right",
  paddingRight: isCurrentUser ? Theme.Spacing.xl : Theme.Spacing.lg,
});

const emptyStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  padding: `${Theme.Spacing.xl} ${Theme.Spacing.lg}`,
  textAlign: "center",
};

const finalizedBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: Theme.Colors.tertiaryContainer,
  color: Theme.Colors.onTertiaryContainer,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  fontWeight: 700,
  letterSpacing: '0.06em',
  padding: `4px 14px`,
  borderRadius: Theme.Radii.full,
  marginBottom: Theme.Spacing.lg,
};

// ── Component ─────────────────────────────────────────────────────────────────

export const HistorialPuntajes = (): ReactElement => {
  const isMobile = useIsMobile();
  const [activePhase, setActivePhase] = useState<PhaseKey | null>(null);
  const [entries, setEntries] = useState<IPhaseLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [closedPhases, setClosedPhases] = useState<Set<string>>(new Set());
  const [isPhaseFinalized, setIsPhaseFinalized] = useState<boolean>(false);

  // Detect active phase from matches on mount + fetch closed snapshots
  useEffect((): void => {
    const init = async (): Promise<void> => {
      try {
        const [matchResp, snapshotResp] = await Promise.all([
          apiGet<IMatchesResponse>("/api/matches"),
          apiGet<ISnapshotsResponse>("/api/leaderboard/snapshots"),
        ]);
        const matchList: IMatch[] = adaptMatchListFromApi(matchResp.matches);
        setActivePhase(detectActivePhase(matchList));
        const closed: Set<string> = new Set(
          snapshotResp.snapshots.map((s: IPhaseSnapshotSummary): string => s.phase)
        );
        setClosedPhases(closed);
      } catch {
        setActivePhase("group");
      }
    };
    void init();
  }, []);

  // Load leaderboard whenever active phase changes
  useEffect((): void => {
    if (activePhase === null) return;
    const load = async (): Promise<void> => {
      setLoading(true);
      setIsPhaseFinalized(false);
      try {
        if (closedPhases.has(activePhase)) {
          const resp = await apiGet<ISnapshotResponse>(
            `/api/leaderboard/snapshots/${activePhase}`,
          );
          const snap = resp.snapshot;
          const mapped: IPhaseLeaderboardEntry[] = snap.entries.map(
            (e: IPhaseSnapshot['entries'][number]): IPhaseLeaderboardEntry => ({
              userId: e.userId,
              username: e.username,
              displayName: e.displayName,
              totalPoints: e.totalPoints,
              predictionsCount: e.predictionsCount,
              predictionsScored: e.predictionsScored,
              totalFinishedMatchesInPhase: snap.totalMatches,
              rank: e.rank,
            })
          );
          setEntries(mapped);
          setIsPhaseFinalized(true);
        } else {
          const resp = await apiGet<IPhaseLeaderboardResponse>(
            `/api/leaderboard/phase/${activePhase}`,
          );
          setEntries(resp.entries);
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [activePhase, closedPhases]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const renderAvatar = (
    entry: IPhaseLeaderboardEntry,
    size: number,
    borderColor: string,
  ): ReactElement => {
    const colors = avatarColor(entry.rank - 1);
    return (
      <div
        style={{
          ...avatarStyle(size, borderColor),
          backgroundColor: colors.bg,
          color: colors.text,
        }}
      >
        {getInitials(entry.displayName)}
      </div>
    );
  };

  const renderPodiumCard = (
    entry: IPhaseLeaderboardEntry | undefined,
    rank: 1 | 2 | 3,
    medalColor: string,
    medalIcon: string,
    medalLabel: string,
  ): ReactElement => {
    if (entry === undefined) {
      return (
        <div style={podiumCardStyle(rank)}>
          <div style={{ ...podiumScoreStyle(rank), opacity: 0.3 }}>—</div>
        </div>
      );
    }
    const accuracy =
      entry.predictionsCount > 0
        ? Math.round((entry.predictionsScored / entry.predictionsCount) * 100)
        : 0;

    return (
      <div style={podiumCardStyle(rank)}>
        {rank === 1 ? (
          <span style={leaderBadgeStyle}>LÍDER ACTUAL</span>
        ) : null}
        {renderAvatar(entry, rank === 1 ? 96 : 72, medalColor)}
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: rank === 1 ? "40px" : "32px",
            color: medalColor,
            fontVariationSettings: "'FILL' 1",
            marginBottom: Theme.Spacing.sm,
          }}
        >
          {medalIcon}
        </span>
        <p style={podiumNameStyle}>{entry.displayName}</p>
        <p style={podiumSubStyle}>{medalLabel}</p>
        <div style={podiumScoreStyle(rank)}>{entry.totalPoints.toLocaleString()}</div>
        <p style={scoreLabelStyle}>PUNTOS</p>
        {entry.predictionsCount > 0 ? (
          <p
            style={{
              ...scoreLabelStyle,
              marginTop: Theme.Spacing.sm,
              color: Theme.Colors.onSurfaceVariant,
            }}
          >
            {entry.predictionsCount} pron. · {accuracy}% exactitud
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <h1 style={titleStyle(isMobile)}>Ganadores por Fase</h1>
      <p style={subtitleStyle}>
        Descubre quiénes lideran en cada etapa del torneo. Los mejores
        pronósticos de cada fase.
      </p>

      {/* Phase tabs */}
      <div style={tabsWrapperStyle}>
        {PHASE_TABS.map(
          (tab): ReactElement => (
            <button
              key={tab.key}
              type="button"
              style={tabStyle(activePhase === tab.key)}
              onClick={(): void => setActivePhase(tab.key)}
            >
              {tab.label}
            </button>
          ),
        )}
      </div>

      {loading || activePhase === null ? (
        <div style={emptyStyle}>Cargando…</div>
      ) : entries.length === 0 ? (
        <div style={emptyStyle}>
          Aún no hay partidos finalizados en esta fase.
        </div>
      ) : (
        <>
          {isPhaseFinalized ? (
            <div style={finalizedBadgeStyle}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              Fase Finalizada
            </div>
          ) : null}

          {/* Podium — ordered 2nd, 1st, 3rd */}
          <div style={podiumGridStyle(isMobile)}>
            {isMobile ? (
              <>
                {renderPodiumCard(top3[0], 1, GOLD,   "emoji_events",  "Oro")}
                {renderPodiumCard(top3[1], 2, SILVER, "military_tech", "Plata")}
                {renderPodiumCard(top3[2], 3, BRONZE, "military_tech", "Bronce")}
              </>
            ) : (
              <>
                {renderPodiumCard(top3[1], 2, SILVER, "military_tech", "Plata")}
                {renderPodiumCard(top3[0], 1, GOLD,   "emoji_events",  "Oro")}
                {renderPodiumCard(top3[2], 3, BRONZE, "military_tech", "Bronce")}
              </>
            )}
          </div>

          {/* Full table */}
          {rest.length > 0 ? (
            <div style={tableCardStyle}>
              <div style={tableHeaderBarStyle}>
                <h2 style={tableHeaderTitleStyle}>Clasificación Completa</h2>
                <span style={tableHeaderNoteStyle}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    info
                  </span>
                  Solo partidos finalizados
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Rango</th>
                      <th style={thStyle}>Usuario</th>
                      <th style={{ ...thStyle, display: isMobile ? "none" : "table-cell" }}>
                        Predicciones
                      </th>
                      <th style={{ ...thStyle, display: isMobile ? "none" : "table-cell" }}>
                        Exactitud
                      </th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map(
                      (entry: IPhaseLeaderboardEntry, idx: number): ReactElement => {
                        const accuracy =
                          entry.predictionsCount > 0
                            ? Math.round(
                                (entry.predictionsScored / entry.predictionsCount) * 100,
                              )
                            : 0;
                        const isCurrentUser = false; // no current-user info here
                        return (
                          <tr
                            key={entry.userId}
                            style={trStyle(isCurrentUser, idx % 2 === 1)}
                          >
                            <td style={{ ...tdStyle, ...rankStyle(isCurrentUser) }}>
                              {entry.rank}
                            </td>
                            <td style={tdStyle}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: Theme.Spacing.md,
                                }}
                              >
                                <div
                                  style={{
                                    ...avatarStyle(40, "transparent"),
                                    marginBottom: 0,
                                    border: "none",
                                    ...avatarColor(entry.rank - 1),
                                    backgroundColor: avatarColor(entry.rank - 1).bg,
                                    color: avatarColor(entry.rank - 1).text,
                                    fontSize: "13px",
                                  }}
                                >
                                  {getInitials(entry.displayName)}
                                </div>
                                <span
                                  style={{
                                    fontFamily: Theme.Typography.fontFamilyDisplay,
                                    fontWeight: 700,
                                    fontSize: Theme.Typography.headlineMd.fontSize,
                                  }}
                                >
                                  {entry.displayName}
                                </span>
                              </div>
                            </td>
                            <td
                              style={{
                                ...tdStyle,
                                display: isMobile ? "none" : "table-cell",
                              }}
                            >
                              {entry.predictionsCount} / {entry.totalFinishedMatchesInPhase}
                            </td>
                            <td
                              style={{
                                ...tdStyle,
                                display: isMobile ? "none" : "table-cell",
                              }}
                            >
                              <div style={accuracyBarWrapStyle}>
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${accuracy}%`,
                                    backgroundColor: Theme.Colors.primary,
                                    borderRadius: Theme.Radii.full,
                                  }}
                                />
                              </div>
                            </td>
                            <td style={{ ...tdStyle, ...pointsCellStyle(isCurrentUser) }}>
                              {entry.totalPoints.toLocaleString()}
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      )}
    </>
  );
};
