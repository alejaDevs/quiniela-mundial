import { ReactElement, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Theme } from "../../Theme";
import { useIsMobile } from "../../utils/UseIsMobile";

// ── Styles ────────────────────────────────────────────────────────────────────

const pageStyle: CSSProperties = {
  backgroundColor: Theme.Colors.background,
  minHeight: "100vh",
};

const containerStyle = (isMobile: boolean): CSSProperties => ({
  maxWidth: `${Theme.Breakpoints.maxContent}px`,
  margin: "0 auto",
  padding: isMobile
    ? `${Theme.Spacing.xl} ${Theme.Spacing.marginMobile}`
    : `${Theme.Spacing.xl} ${Theme.Spacing.marginDesktop}`,
  paddingBottom: isMobile ? Theme.Spacing.xxl : Theme.Spacing.xl,
});

const headerStyle: CSSProperties = {
  marginBottom: Theme.Spacing.xl,
};

const pageTitleStyle = (isMobile: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: isMobile
    ? Theme.Typography.headlineLgMobile.fontSize
    : Theme.Typography.headlineLg.fontSize,
  lineHeight: isMobile
    ? Theme.Typography.headlineLgMobile.lineHeight
    : Theme.Typography.headlineLg.lineHeight,
  fontWeight: isMobile
    ? Theme.Typography.headlineLgMobile.fontWeight
    : Theme.Typography.headlineLg.fontWeight,
  color: Theme.Colors.primary,
  marginBottom: Theme.Spacing.md,
});

const subtitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyLg.fontSize,
  lineHeight: Theme.Typography.bodyLg.lineHeight,
  color: Theme.Colors.onSurfaceVariant,
  maxWidth: "640px",
};

// ── Scoring Grid ──────────────────────────────────────────────────────────────

const bentoGridStyle = (isMobile: boolean): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "7fr 5fr",
  gap: Theme.Spacing.md,
  marginBottom: Theme.Spacing.xxl,
});

const glassCardStyle: CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(8px)",
  border: `1.5px solid transparent`,
  borderRadius: Theme.Radii.xl,
  boxShadow: Theme.Shadows.card,
  transition: "all 0.25s ease",
  overflow: "hidden",
};

// ── 5pts card (full-width on desktop, spans both rows) ────────────────────────

const fivePtsCardStyle = (isMobile: boolean): CSSProperties => ({
  ...glassCardStyle,
  display: "flex",
  flexDirection: isMobile ? "column" : "row",
  alignItems: "center",
  gap: Theme.Spacing.lg,
  padding: `${Theme.Spacing.lg} ${Theme.Spacing.lg}`,
  position: "relative",
  gridColumn: isMobile ? undefined : "1 / 2",
});

const accentBarStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "4px",
  height: "100%",
  backgroundColor: Theme.Colors.primaryContainer,
  borderRadius: "4px 0 0 4px",
};

const iconCircleStyle = (
  bg: string,
  isMobile: boolean
): CSSProperties => ({
  flexShrink: 0,
  width: isMobile ? "64px" : "96px",
  height: isMobile ? "64px" : "96px",
  backgroundColor: bg,
  borderRadius: Theme.Radii.full,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const cardBodyStyle = (isMobile: boolean): CSSProperties => ({
  flex: 1,
  textAlign: isMobile ? "center" : "left",
});

const scoreBadgeRowStyle = (isMobile: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: isMobile ? "center" : "flex-start",
  gap: Theme.Spacing.sm,
  marginBottom: Theme.Spacing.xs,
});

const scoreBadgeStyle = (color: string): CSSProperties => ({
  backgroundColor: color,
  color: "#ffffff",
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  fontWeight: Theme.Typography.headlineMd.fontWeight,
  padding: `${Theme.Spacing.xs} ${Theme.Spacing.md}`,
  borderRadius: Theme.Radii.md,
});

const cardTitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  fontWeight: Theme.Typography.headlineMd.fontWeight,
  color: Theme.Colors.onSurface,
};

const cardDescStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  marginTop: Theme.Spacing.xs,
  marginBottom: Theme.Spacing.md,
};

const exampleBoxStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: Theme.Spacing.lg,
  backgroundColor: Theme.Colors.surfaceContainer,
  border: `1px solid ${Theme.Colors.outlineVariant}`,
  borderRadius: Theme.Radii.md,
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.md}`,
};

const exampleColStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2px",
};

const exampleLabelStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  fontWeight: 600,
  color: Theme.Colors.onSurfaceVariant,
  textTransform: "uppercase" as const,
};

const exampleDividerStyle: CSSProperties = {
  width: "1px",
  height: "32px",
  backgroundColor: Theme.Colors.outlineVariant,
};

const exampleScoreStyle = (color: string): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  fontWeight: 800,
  color,
});

// ── Small scoring cards (3pts, 2pts) ─────────────────────────────────────────

const smallCardStyle: CSSProperties = {
  ...glassCardStyle,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: Theme.Spacing.md,
  padding: Theme.Spacing.lg,
};

const exampleRowStyle = (): CSSProperties => ({
  width: "100%",
  backgroundColor: Theme.Colors.surfaceContainer,
  borderRadius: Theme.Radii.md,
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.md}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  color: Theme.Colors.onSurface,
});

// ── 0pts card ─────────────────────────────────────────────────────────────────

const zeroPtsCardStyle = (isMobile: boolean): CSSProperties => ({
  ...glassCardStyle,
  display: "flex",
  flexDirection: isMobile ? "column" : "row",
  alignItems: "center",
  gap: Theme.Spacing.lg,
  padding: `${Theme.Spacing.lg} ${Theme.Spacing.lg}`,
  gridColumn: isMobile ? undefined : "1 / 2",
});

// ── Section header ────────────────────────────────────────────────────────────

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: Theme.Spacing.md,
  marginBottom: Theme.Spacing.lg,
};

const sectionAccentStyle: CSSProperties = {
  width: "8px",
  height: "32px",
  backgroundColor: Theme.Colors.primaryContainer,
  borderRadius: Theme.Radii.full,
  flexShrink: 0,
};

const sectionTitleStyle = (isMobile: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: isMobile
    ? Theme.Typography.headlineMd.fontSize
    : Theme.Typography.headlineLg.fontSize,
  fontWeight: isMobile
    ? Theme.Typography.headlineMd.fontWeight
    : Theme.Typography.headlineLg.fontWeight,
  color: Theme.Colors.onSurface,
});

// ── General rules grid ────────────────────────────────────────────────────────

const rulesGridStyle = (isMobile: boolean): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
  gap: `${Theme.Spacing.xl} ${Theme.Spacing.xxl}`,
  marginBottom: Theme.Spacing.xxl,
});

const ruleItemStyle: CSSProperties = {
  display: "flex",
  gap: Theme.Spacing.md,
};

const ruleIconStyle: CSSProperties = {
  color: Theme.Colors.primaryContainer,
  flexShrink: 0,
  marginTop: "2px",
};

const ruleTitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: Theme.Colors.onSurface,
  marginBottom: Theme.Spacing.xs,
};

const ruleDescStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  lineHeight: Theme.Typography.bodyMd.lineHeight,
};

// ── Phase scoring table ───────────────────────────────────────────────────────

const phaseTableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  marginBottom: Theme.Spacing.xxl,
};

const phaseTableHeadStyle: CSSProperties = {
  backgroundColor: Theme.Colors.primaryContainer,
  color: "#ffffff",
};

const phaseThStyle: CSSProperties = {
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.md}`,
  textAlign: "left" as const,
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
};

const phaseTdStyle = (zebra: boolean): CSSProperties => ({
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.md}`,
  backgroundColor: zebra ? Theme.Colors.surfaceContainerLow : Theme.Colors.surfaceContainerLowest,
  borderBottom: `1px solid ${Theme.Colors.outlineVariant}`,
  color: Theme.Colors.onSurface,
});

const ptsBadgeStyle = (color: string): CSSProperties => ({
  display: "inline-block",
  backgroundColor: color,
  color: "#ffffff",
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontWeight: 700,
  fontSize: Theme.Typography.labelLg.fontSize,
  padding: `2px ${Theme.Spacing.sm}`,
  borderRadius: Theme.Radii.sm,
  minWidth: "40px",
  textAlign: "center" as const,
});

// ── CTA ───────────────────────────────────────────────────────────────────────

const ctaStyle: CSSProperties = {
  backgroundColor: Theme.Colors.primaryContainer,
  borderRadius: Theme.Radii.xl,
  padding: Theme.Spacing.xxl,
  textAlign: "center",
  boxShadow: Theme.Shadows.cardElevated,
  position: "relative",
  overflow: "hidden",
};

const ctaTitleStyle = (isMobile: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: isMobile
    ? Theme.Typography.headlineMd.fontSize
    : Theme.Typography.headlineLg.fontSize,
  fontWeight: isMobile
    ? Theme.Typography.headlineMd.fontWeight
    : Theme.Typography.headlineLg.fontWeight,
  color: Theme.Colors.onPrimaryContainer,
  marginBottom: Theme.Spacing.sm,
});

const ctaDescStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyLg.fontSize,
  color: Theme.Colors.onPrimaryContainer,
  opacity: 0.85,
  marginBottom: Theme.Spacing.lg,
};

const ctaButtonStyle: CSSProperties = {
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  color: Theme.Colors.primaryContainer,
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontWeight: 700,
  fontSize: Theme.Typography.labelLg.fontSize,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  padding: `${Theme.Spacing.md} ${Theme.Spacing.xl}`,
  borderRadius: Theme.Radii.full,
  border: "none",
  cursor: "pointer",
  boxShadow: Theme.Shadows.card,
};

// ── Component ─────────────────────────────────────────────────────────────────

export const Reglas = (): ReactElement => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div style={pageStyle}>
      <div style={containerStyle(isMobile)}>

        {/* Header */}
        <div style={headerStyle}>
          <h1 style={pageTitleStyle(isMobile)}>Reglas y Puntuación</h1>
          <p style={subtitleStyle}>
            Domina el arte de la predicción. Entiende cómo se calculan tus
            puntos para escalar en el leaderboard del Mundial 2026.
          </p>
        </div>

        {/* Scoring Bento Grid — Fases Eliminatorias */}
        <div style={sectionHeaderStyle}>
          <div style={sectionAccentStyle} />
          <h2 style={sectionTitleStyle(isMobile)}>Fases Eliminatorias</h2>
        </div>

        <div style={bentoGridStyle(isMobile)}>
          {/* 5 pts — large card */}
          <div style={fivePtsCardStyle(isMobile)}>
            <div style={accentBarStyle} />
            <div
              style={iconCircleStyle(
                `${Theme.Colors.primaryFixed}33`,
                isMobile
              )}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: isMobile ? "32px" : "48px",
                  color: Theme.Colors.primaryContainer,
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                emoji_events
              </span>
            </div>
            <div style={cardBodyStyle(isMobile)}>
              <div style={scoreBadgeRowStyle(isMobile)}>
                <span style={scoreBadgeStyle(Theme.Colors.primaryContainer)}>
                  5 pts
                </span>
                <span style={cardTitleStyle}>Marcador Exacto</span>
              </div>
              <p style={cardDescStyle}>
                El premio máximo para el analista perfecto. Adivina el
                resultado final idéntico al oficial.
              </p>
              <div style={exampleBoxStyle}>
                <div style={exampleColStyle}>
                  <span style={exampleLabelStyle}>Predicho</span>
                  <span
                    style={exampleScoreStyle(Theme.Colors.primaryContainer)}
                  >
                    2 - 1
                  </span>
                </div>
                <div style={exampleDividerStyle} />
                <div style={exampleColStyle}>
                  <span style={exampleLabelStyle}>Resultado</span>
                  <span
                    style={exampleScoreStyle(Theme.Colors.primaryContainer)}
                  >
                    2 - 1
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 pts */}
          <div style={smallCardStyle}>
            <div
              style={iconCircleStyle(
                `${Theme.Colors.secondaryContainer}33`,
                isMobile
              )}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "32px",
                  color: Theme.Colors.secondary,
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                sports_soccer
              </span>
            </div>
            <div>
              <div
                style={{
                  ...scoreBadgeRowStyle(true),
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    ...cardTitleStyle,
                    color: Theme.Colors.secondary,
                    fontWeight: 700,
                  }}
                >
                  3 pts
                </span>
                <span style={cardTitleStyle}>Acertar Ganador</span>
              </div>
              <p style={{ ...cardDescStyle, marginBottom: 0 }}>
                Predices quién ganará pero no el marcador exacto.
              </p>
            </div>
            <div style={exampleRowStyle()}>
              <span>Predicho: 1 - 0</span>
              <span
                className="material-symbols-outlined"
                style={{ color: Theme.Colors.secondary, fontSize: "20px" }}
              >
                trending_flat
              </span>
              <span>Final: 3 - 0</span>
            </div>
          </div>

          {/* 2 pts */}
          <div style={smallCardStyle}>
            <div
              style={iconCircleStyle(
                `${Theme.Colors.tertiaryFixed}66`,
                isMobile
              )}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "32px",
                  color: Theme.Colors.tertiary,
                }}
              >
                handshake
              </span>
            </div>
            <div>
              <div
                style={{
                  ...scoreBadgeRowStyle(true),
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    ...cardTitleStyle,
                    color: Theme.Colors.tertiary,
                    fontWeight: 700,
                  }}
                >
                  2 pts
                </span>
                <span style={cardTitleStyle}>Empate Táctico</span>
              </div>
              <p style={{ ...cardDescStyle, marginBottom: 0 }}>
                Predices un empate, pero la cantidad de goles es distinta.
              </p>
            </div>
            <div style={exampleRowStyle()}>
              <span>Predicho: 1 - 1</span>
              <span
                className="material-symbols-outlined"
                style={{ color: Theme.Colors.tertiary, fontSize: "20px" }}
              >
                trending_flat
              </span>
              <span>Final: 2 - 2</span>
            </div>
          </div>

          {/* 0 pts — large card */}
          <div style={zeroPtsCardStyle(isMobile)}>
            <div
              style={iconCircleStyle(
                `${Theme.Colors.errorContainer}66`,
                isMobile
              )}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: isMobile ? "32px" : "48px",
                  color: Theme.Colors.error,
                }}
              >
                close
              </span>
            </div>
            <div style={cardBodyStyle(isMobile)}>
              <div style={scoreBadgeRowStyle(isMobile)}>
                <span
                  style={{
                    ...cardTitleStyle,
                    color: Theme.Colors.error,
                    fontWeight: 700,
                  }}
                >
                  0 pts
                </span>
                <span style={cardTitleStyle}>Sin Acierto</span>
              </div>
              <p style={cardDescStyle}>
                Cuando ni el ganador ni el marcador coinciden con tu visión.
              </p>
              <p
                style={{
                  ...cardDescStyle,
                  marginBottom: 0,
                  fontStyle: "italic",
                  opacity: 0.7,
                }}
              >
                ¡No te preocupes, el fútbol siempre da revanchas!
              </p>
            </div>
          </div>
        </div>

        {/* Scoring comparison table */}
        <div style={sectionHeaderStyle}>
          <div style={sectionAccentStyle} />
          <h2 style={sectionTitleStyle(isMobile)}>Puntuación por Fase</h2>
        </div>

        <div style={{ overflowX: "auto", marginBottom: Theme.Spacing.xxl }}>
          <table style={phaseTableStyle}>
            <thead style={phaseTableHeadStyle}>
              <tr>
                <th style={phaseThStyle}>Resultado</th>
                <th style={{ ...phaseThStyle, textAlign: "center" }}>
                  Fase de Grupos
                </th>
                <th style={{ ...phaseThStyle, textAlign: "center" }}>
                  Fases Eliminatorias
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={phaseTdStyle(false)}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "16px",
                      verticalAlign: "middle",
                      marginRight: Theme.Spacing.sm,
                      color: Theme.Colors.primaryContainer,
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    emoji_events
                  </span>
                  Marcador exacto
                </td>
                <td style={{ ...phaseTdStyle(false), textAlign: "center" }}>
                  <span style={ptsBadgeStyle(Theme.Colors.primaryContainer)}>5</span>
                </td>
                <td style={{ ...phaseTdStyle(false), textAlign: "center" }}>
                  <span style={ptsBadgeStyle(Theme.Colors.primaryContainer)}>5</span>
                </td>
              </tr>
              <tr>
                <td style={phaseTdStyle(true)}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "16px",
                      verticalAlign: "middle",
                      marginRight: Theme.Spacing.sm,
                      color: Theme.Colors.secondary,
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    sports_soccer
                  </span>
                  Ganador correcto (no exacto)
                </td>
                <td style={{ ...phaseTdStyle(true), textAlign: "center" }}>
                  <span style={ptsBadgeStyle(Theme.Colors.secondary)}>2</span>
                </td>
                <td style={{ ...phaseTdStyle(true), textAlign: "center" }}>
                  <span style={ptsBadgeStyle(Theme.Colors.secondary)}>3</span>
                </td>
              </tr>
              <tr>
                <td style={phaseTdStyle(false)}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "16px",
                      verticalAlign: "middle",
                      marginRight: Theme.Spacing.sm,
                      color: Theme.Colors.tertiary,
                    }}
                  >
                    handshake
                  </span>
                  Empate correcto (no exacto)
                </td>
                <td style={{ ...phaseTdStyle(false), textAlign: "center" }}>
                  <span style={ptsBadgeStyle(Theme.Colors.outline)}>—</span>
                </td>
                <td style={{ ...phaseTdStyle(false), textAlign: "center" }}>
                  <span style={ptsBadgeStyle(Theme.Colors.tertiary)}>2</span>
                </td>
              </tr>
              <tr>
                <td style={phaseTdStyle(true)}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "16px",
                      verticalAlign: "middle",
                      marginRight: Theme.Spacing.sm,
                      color: Theme.Colors.error,
                    }}
                  >
                    close
                  </span>
                  Sin acierto
                </td>
                <td style={{ ...phaseTdStyle(true), textAlign: "center" }}>
                  <span style={ptsBadgeStyle(Theme.Colors.error)}>0</span>
                </td>
                <td style={{ ...phaseTdStyle(true), textAlign: "center" }}>
                  <span style={ptsBadgeStyle(Theme.Colors.error)}>0</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* General Rules */}
        <div style={sectionHeaderStyle}>
          <div style={sectionAccentStyle} />
          <h2 style={sectionTitleStyle(isMobile)}>Reglas Generales</h2>
        </div>

        <div style={rulesGridStyle(isMobile)}>
          <div style={ruleItemStyle}>
            <span
              className="material-symbols-outlined"
              style={ruleIconStyle}
            >
              update
            </span>
            <div>
              <h4 style={ruleTitleStyle}>Cierre de Predicciones</h4>
              <p style={ruleDescStyle}>
                Las predicciones se cierran exactamente 15 minutos antes del
                silbatazo inicial de cada encuentro. Una vez guardada tu
                predicción, ya no se puede modificar, incluso si todavía queda
                tiempo antes del partido.
              </p>
            </div>
          </div>

          <div style={ruleItemStyle}>
            <span
              className="material-symbols-outlined"
              style={ruleIconStyle}
            >
              groups
            </span>
            <div>
              <h4 style={ruleTitleStyle}>Puntos Acumulativos</h4>
              <p style={ruleDescStyle}>
                Los puntos se otorgan por partido y se suman automáticamente a
                tu perfil. Puedes ver tu posición en tiempo real en la Liga.
              </p>
            </div>
          </div>

          <div style={ruleItemStyle}>
            <span
              className="material-symbols-outlined"
              style={ruleIconStyle}
            >
              timer
            </span>
            <div>
              <h4 style={ruleTitleStyle}>Tiempo Reglamentario</h4>
              <p style={ruleDescStyle}>
                Los resultados se calculan con base en el tiempo regular (90
                min + compensación). Los tiempos extra y penales no cuentan
                para la predicción del marcador final.
              </p>
            </div>
          </div>

          <div style={ruleItemStyle}>
            <span
              className="material-symbols-outlined"
              style={ruleIconStyle}
            >
              verified
            </span>
            <div>
              <h4 style={ruleTitleStyle}>Fair Play</h4>
              <p style={ruleDescStyle}>
                Solo se permite una cuenta por usuario. Cualquier intento de
                manipulación resultará en la eliminación total del torneo.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={ctaStyle}>
          <h3 style={ctaTitleStyle(isMobile)}>
            ¿Listo para demostrar tu conocimiento?
          </h3>
          <p style={ctaDescStyle}>
            Comienza a predecir los partidos de los 16vos de Final ahora.
          </p>
          <button
            type="button"
            style={ctaButtonStyle}
            onClick={(): void => {
              navigate("/dashboard");
            }}
          >
            Ir a Pronósticos
          </button>
        </div>

      </div>
    </div>
  );
};
