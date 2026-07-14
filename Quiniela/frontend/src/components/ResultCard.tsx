import { ReactElement, CSSProperties, useState, useRef } from "react";
import { toPng } from "html-to-image";
import { Theme } from "../Theme";
import { IMatch, IMatchPredictionEntry } from "../types/Index";
import { FlagIcon } from "./FlagIcon";
import { ShareableMatchCard } from "./ShareableMatchCard";
import { apiGet } from "../utils/ApiClient";
import { adaptMatchPredictionListFromApi } from "../adapters/MatchPredictionAdapter";
import { getStageLabel } from "../utils/StageLabel";
import {
  getMatchStatus,
  getMatchStatusLabel,
  MatchStatus,
} from "../utils/MatchStatus";
import { useIsMobile } from "../utils/UseIsMobile";

const waitForNextPaint = (): Promise<void> =>
  new Promise((resolve: () => void): void => {
    requestAnimationFrame((): void => {
      requestAnimationFrame((): void => resolve());
    });
  });

interface IResultCardProps {
  match: IMatch;
}

interface IPredictionsResponse {
  predictions: unknown;
}

const cardStyle: CSSProperties = {
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  borderRadius: Theme.Radii.lg,
  boxShadow: Theme.Shadows.card,
  overflow: "hidden",
};

const headerAccent: CSSProperties = {
  height: "4px",
  backgroundColor: Theme.Colors.primary,
};

const bodyStyle: CSSProperties = {
  padding: `${Theme.Spacing.md} ${Theme.Spacing.lg}`,
};

const chipRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  marginBottom: Theme.Spacing.md,
};

const chipBaseStyle: CSSProperties = {
  padding: `${Theme.Spacing.xs} ${Theme.Spacing.md}`,
  borderRadius: Theme.Radii.full,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  fontWeight: Theme.Typography.labelMd.fontWeight,
};

const chipVariants: Record<MatchStatus, CSSProperties> = {
  finished: {
    ...chipBaseStyle,
    backgroundColor: Theme.Colors.surfaceContainer,
    color: Theme.Colors.onSurfaceVariant,
  },
  live: {
    ...chipBaseStyle,
    backgroundColor: Theme.Colors.primaryFixed,
    color: Theme.Colors.primary,
  },
  upcoming: {
    ...chipBaseStyle,
    backgroundColor: Theme.Colors.tertiaryFixed,
    color: Theme.Colors.onTertiaryContainer,
  },
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `0 ${Theme.Spacing.md}`,
};

const teamColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
  gap: Theme.Spacing.sm,
};

const teamNameStyle = (isMobile: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: isMobile
    ? Theme.Typography.labelLg.fontSize
    : Theme.Typography.headlineMd.fontSize,
  fontWeight: isMobile
    ? Theme.Typography.labelLg.fontWeight
    : Theme.Typography.headlineMd.fontWeight,
  color: Theme.Colors.onBackground,
  textAlign: "center",
  wordBreak: "break-word",
});

const scoreBoxStyle = (isMobile: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: isMobile ? Theme.Spacing.xs : Theme.Spacing.md,
  backgroundColor: Theme.Colors.surfaceBright,
  border: `1px solid ${Theme.Colors.outlineVariant}`,
  padding: isMobile
    ? `${Theme.Spacing.sm} ${Theme.Spacing.sm}`
    : `${Theme.Spacing.sm} ${Theme.Spacing.lg}`,
  borderRadius: Theme.Radii.md,
});

const scoreStyle = (isMobile: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: isMobile
    ? Theme.Typography.headlineMd.fontSize
    : Theme.Typography.scoreDisplay.fontSize,
  lineHeight: isMobile
    ? Theme.Typography.headlineMd.lineHeight
    : Theme.Typography.scoreDisplay.lineHeight,
  fontWeight: isMobile
    ? Theme.Typography.headlineMd.fontWeight
    : Theme.Typography.scoreDisplay.fontWeight,
  color: Theme.Colors.onBackground,
});

const separatorStyle = (isMobile: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: isMobile
    ? Theme.Typography.labelLg.fontSize
    : Theme.Typography.headlineMd.fontSize,
  color: Theme.Colors.outlineVariant,
});

const expandRowStyle: CSSProperties = {
  marginTop: Theme.Spacing.lg,
  paddingTop: Theme.Spacing.md,
  borderTop: `1px solid ${Theme.Colors.surfaceContainer}`,
  display: "flex",
  justifyContent: "center",
  gap: Theme.Spacing.xl,
  flexWrap: "wrap",
};

const expandButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: Theme.Spacing.sm,
  color: Theme.Colors.primary,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
};

const expandedSectionStyle: CSSProperties = {
  backgroundColor: Theme.Colors.surfaceBright,
  borderTop: `1px solid ${Theme.Colors.surfaceContainer}`,
  padding: `${Theme.Spacing.md} ${Theme.Spacing.lg}`,
};

const sectionTitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: Theme.Colors.onSurfaceVariant,
  textTransform: "uppercase",
  margin: 0,
  marginBottom: Theme.Spacing.md,
};

const tableHeaderStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr",
  gap: Theme.Spacing.md,
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.md}`,
  color: Theme.Colors.onSurfaceVariant,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  fontWeight: Theme.Typography.labelMd.fontWeight,
  borderBottom: `1px solid ${Theme.Colors.surfaceContainer}`,
};

const tableRowStyle = (zebra: boolean): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr",
  gap: Theme.Spacing.md,
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.md}`,
  alignItems: "center",
  backgroundColor: zebra
    ? Theme.Colors.surfaceBright
    : Theme.Colors.surfaceContainerLowest,
  borderRadius: Theme.Radii.sm,
});

const userCellStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  fontWeight: 500,
  color: Theme.Colors.onBackground,
};

const predictedCellStyle: CSSProperties = {
  textAlign: "center",
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  fontWeight: Theme.Typography.headlineMd.fontWeight,
  color: Theme.Colors.onBackground,
};

const pointsCellStyle = (positive: boolean): CSSProperties => ({
  textAlign: "right",
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: 700,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: positive ? Theme.Colors.primary : Theme.Colors.outline,
});

const messageStyle: CSSProperties = {
  textAlign: "center",
  padding: Theme.Spacing.md,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
};

export const ResultCard = ({ match }: IResultCardProps): ReactElement => {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [entries, setEntries] = useState<IMatchPredictionEntry[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const status: MatchStatus = getMatchStatus(match);
  const statusLabel: string = getMatchStatusLabel(status);
  const stageLabel: string = getStageLabel(match);

  const fetchEntries = async (): Promise<IMatchPredictionEntry[]> => {
    const response: IPredictionsResponse = await apiGet<IPredictionsResponse>(
      `/api/matches/${match.id}/predictions`,
    );
    return adaptMatchPredictionListFromApi(response.predictions);
  };

  const handleToggle = async (): Promise<void> => {
    const next: boolean = !expanded;
    setExpanded(next);
    if (!next || entries !== null) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setEntries(await fetchEntries());
    } catch (err: unknown) {
      const message: string =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "No se pudieron cargar las predicciones";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = async (): Promise<void> => {
    setGeneratingImage(true);
    setImageError(null);
    try {
      let dataEntries: IMatchPredictionEntry[] = entries ?? [];
      if (entries === null) {
        dataEntries = await fetchEntries();
        setEntries(dataEntries);
        await waitForNextPaint();
      }

      if (shareCardRef.current === null) {
        return;
      }
      const dataUrl: string = await toPng(shareCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const fileName = `quiniela-${match.homeTeam.countryCode}-vs-${match.awayTeam.countryCode}.png`;

      // navigator.share requires an active user gesture, which can expire
      // during the async work above; a failure here (including the user
      // cancelling the share sheet) should fall back to a plain download
      // instead of surfacing an error — the image was generated either way.
      try {
        if (navigator.share !== undefined && navigator.canShare !== undefined) {
          const blob: Blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], fileName, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
            });
            return;
          }
        }
      } catch {
        // fall through to download
      }

      const link: HTMLAnchorElement = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      link.click();
    } catch (err: unknown) {
      const message: string =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "No se pudo generar la imagen";
      setImageError(message);
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={headerAccent} />
      <div style={bodyStyle}>
        <div style={chipRowStyle}>
          <span style={chipVariants[status]}>
            {statusLabel} • {stageLabel}
          </span>
        </div>
        <div style={rowStyle}>
          <div style={teamColumnStyle}>
            <FlagIcon
              countryCode={match.homeTeam.countryCode}
              alt={`Bandera de ${match.homeTeam.name}`}
            />
            <span style={teamNameStyle(isMobile)}>{match.homeTeam.name}</span>
          </div>
          <div style={teamColumnStyle}>
            <div style={scoreBoxStyle(isMobile)}>
              <span style={scoreStyle(isMobile)}>
                {match.homeScore === null ? "–" : match.homeScore}
              </span>
              <span style={separatorStyle(isMobile)}>-</span>
              <span style={scoreStyle(isMobile)}>
                {match.awayScore === null ? "–" : match.awayScore}
              </span>
            </div>
          </div>
          <div style={teamColumnStyle}>
            <FlagIcon
              countryCode={match.awayTeam.countryCode}
              alt={`Bandera de ${match.awayTeam.name}`}
            />
            <span style={teamNameStyle(isMobile)}>{match.awayTeam.name}</span>
          </div>
        </div>

        {match.stadium !== null || match.city !== null ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: Theme.Spacing.xs,
              marginTop: Theme.Spacing.md,
              color: Theme.Colors.onSurfaceVariant,
              fontFamily: Theme.Typography.fontFamilyBody,
              fontSize: Theme.Typography.labelMd.fontSize,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              stadium
            </span>
            <span>
              {match.stadium !== null ? match.stadium : ""}
              {match.stadium !== null && match.city !== null ? " · " : ""}
              {match.city !== null ? match.city : ""}
            </span>
          </div>
        ) : null}

        <div style={expandRowStyle}>
          <button
            type="button"
            onClick={(): void => {
              void handleToggle();
            }}
            style={expandButtonStyle}
            aria-expanded={expanded}
          >
            {expanded ? "Ocultar predicciones" : "Ver predicciones"}
            <span className="material-symbols-outlined">
              {expanded ? "expand_less" : "expand_more"}
            </span>
          </button>
          <button
            type="button"
            disabled={generatingImage}
            onClick={(): void => {
              void handleDownloadImage();
            }}
            style={{
              ...expandButtonStyle,
              opacity: generatingImage ? 0.6 : 1,
            }}
          >
            {generatingImage ? "Generando…" : "Descargar imagen"}
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
        {imageError !== null ? (
          <div style={messageStyle}>{imageError}</div>
        ) : null}
      </div>

      <div
        style={{ position: "fixed", top: 0, left: "-10000px" }}
        aria-hidden="true"
      >
        <ShareableMatchCard
          ref={shareCardRef}
          match={match}
          entries={entries ?? []}
        />
      </div>

      {expanded ? (
        <div style={expandedSectionStyle}>
          <h3 style={sectionTitleStyle}>Predicciones de la comunidad</h3>
          {loading ? (
            <div style={messageStyle}>Cargando predicciones…</div>
          ) : error !== null ? (
            <div style={messageStyle}>{error}</div>
          ) : entries === null || entries.length === 0 ? (
            <div style={messageStyle}>
              Aún no hay predicciones registradas para este partido.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: Theme.Spacing.xs,
              }}
            >
              <div style={tableHeaderStyle}>
                <div>Usuario</div>
                <div style={{ textAlign: "center" }}>Pronóstico</div>
                <div style={{ textAlign: "right" }}>Puntos</div>
              </div>
              {entries.map(
                (entry: IMatchPredictionEntry, index: number): ReactElement => (
                  <div
                    key={entry.userId}
                    style={tableRowStyle(index % 2 === 1)}
                  >
                    <div style={userCellStyle}>{entry.displayName}</div>
                    <div style={predictedCellStyle}>
                      {entry.predictedHomeScore} - {entry.predictedAwayScore}
                    </div>
                    <div
                      style={pointsCellStyle(
                        entry.pointsAwarded !== null && entry.pointsAwarded > 0,
                      )}
                    >
                      {entry.pointsAwarded === null
                        ? "—"
                        : `+${entry.pointsAwarded}`}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
