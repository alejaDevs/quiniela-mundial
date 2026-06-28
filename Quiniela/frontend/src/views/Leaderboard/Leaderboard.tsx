import {
  ReactElement,
  CSSProperties,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Theme } from "../../Theme";
import { ILeaderboardEntry } from "../../types/Index";
import { apiGet } from "../../utils/ApiClient";
import { adaptLeaderboardFromApi } from "../../adapters/LeaderboardAdapter";
import { useAuth } from "../../components/AuthContext";

interface ILeaderboardResponse {
  entries: unknown;
}

const headerStyle: CSSProperties = {
  marginBottom: Theme.Spacing.xxl,
  display: "flex",
  flexDirection: "column",
  gap: Theme.Spacing.sm,
};

const titleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineLg.fontSize,
  lineHeight: Theme.Typography.headlineLg.lineHeight,
  letterSpacing: Theme.Typography.headlineLg.letterSpacing,
  fontWeight: Theme.Typography.headlineLg.fontWeight,
  color: Theme.Colors.onSurface,
  margin: 0,
};

const subtitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyLg.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  margin: 0,
};

const listStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: Theme.Spacing.sm,
};

const rowBaseStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `${Theme.Spacing.md} ${Theme.Spacing.lg}`,
  borderRadius: Theme.Radii.lg,
  border: "1px solid transparent",
};

const leftGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: Theme.Spacing.lg,
};

const initialsStyle = (background: string, color: string): CSSProperties => ({
  width: "40px",
  height: "40px",
  borderRadius: Theme.Radii.full,
  backgroundColor: background,
  color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
});

const buildInitials = (displayName: string): string => {
  const parts: string[] = displayName.trim().split(/\s+/);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

const rankCellStyle = (highlight: boolean): CSSProperties => ({
  width: "48px",
  textAlign: "center",
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: highlight
    ? Theme.Typography.scoreDisplay.fontSize
    : Theme.Typography.headlineMd.fontSize,
  fontWeight: highlight
    ? Theme.Typography.scoreDisplay.fontWeight
    : Theme.Typography.headlineMd.fontWeight,
  color: highlight ? Theme.Colors.onTertiaryContainer : Theme.Colors.outline,
});

const nameStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyLg.fontSize,
  fontWeight: 500,
  color: Theme.Colors.onSurface,
};

const pointsStyle = (highlight: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: highlight
    ? Theme.Typography.scoreDisplay.fontSize
    : Theme.Typography.headlineMd.fontSize,
  fontWeight: highlight
    ? Theme.Typography.scoreDisplay.fontWeight
    : Theme.Typography.headlineMd.fontWeight,
  color: highlight ? Theme.Colors.onTertiaryContainer : Theme.Colors.onSurface,
});

const podiumBackground: Record<number, string> = {
  1: Theme.Colors.tertiaryContainer,
  2: Theme.Colors.surfaceContainerLowest,
  3: Theme.Colors.surfaceContainerLow,
};

const computeRowStyle = (
  rank: number,
  isCurrentUser: boolean,
): CSSProperties => {
  const background: string =
    podiumBackground[rank] ?? Theme.Colors.surfaceContainerLowest;
  return {
    ...rowBaseStyle,
    backgroundColor: background,
    boxShadow: rank === 1 ? Theme.Shadows.cardElevated : Theme.Shadows.card,
    borderLeft: isCurrentUser ? `4px solid ${Theme.Colors.primary}` : undefined,
  };
};

export const Leaderboard = (): ReactElement => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ILeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response: ILeaderboardResponse =
        await apiGet<ILeaderboardResponse>("/api/leaderboard");
      setEntries(adaptLeaderboardFromApi(response.entries));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect((): void => {
    void load();
  }, [load]);

  return (
    <>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Tabla de Posiciones</h1>
        <p style={subtitleStyle}>
          Aquí puedes ver el puntaje de todos los participantes.
        </p>
      </div>

      {loading ? (
        <div
          style={{
            padding: Theme.Spacing.lg,
            textAlign: "center",
            color: Theme.Colors.onSurfaceVariant,
          }}
        >
          Cargando ranking…
        </div>
      ) : (
        <div style={listStyle}>
          {entries.map((entry: ILeaderboardEntry): ReactElement => {
            const isCurrentUser: boolean =
              user !== null && user.id === entry.userId;
            const highlight: boolean = entry.rank === 1;
            return (
              <div
                key={entry.userId}
                style={computeRowStyle(entry.rank, isCurrentUser)}
              >
                <div style={leftGroupStyle}>
                  <div style={rankCellStyle(highlight)}>{entry.rank}</div>
                  <div
                    style={initialsStyle(
                      isCurrentUser
                        ? Theme.Colors.primaryContainer
                        : Theme.Colors.surfaceContainerHigh,
                      isCurrentUser
                        ? Theme.Colors.onPrimaryContainer
                        : Theme.Colors.onSurfaceVariant,
                    )}
                  >
                    {isCurrentUser ? "YO" : buildInitials(entry.displayName)}
                  </div>
                  <div style={nameStyle}>{entry.displayName}</div>
                </div>
                <div style={pointsStyle(highlight)}>{entry.totalPoints}</div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
