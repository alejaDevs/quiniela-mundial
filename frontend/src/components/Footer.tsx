import { ReactElement, CSSProperties } from "react";
import { Theme } from "../Theme";

const footerStyle: CSSProperties = {
  backgroundColor: Theme.Colors.surfaceContainerHigh,
  width: "100%",
  marginTop: "auto",
};

const containerStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  maxWidth: `${Theme.Breakpoints.maxContent}px`,
  margin: "0 auto",
  padding: `${Theme.Spacing.xl} ${Theme.Spacing.marginMobile}`,
  gap: Theme.Spacing.md,
};

const brandStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  fontWeight: Theme.Typography.headlineMd.fontWeight,
  color: Theme.Colors.onSurface,
};

const linksStyle: CSSProperties = {
  display: "flex",
  gap: Theme.Spacing.lg,
};

const linkStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  fontWeight: Theme.Typography.labelMd.fontWeight,
  color: Theme.Colors.onSurfaceVariant,
};

export const Footer = (): ReactElement => {
  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={brandStyle}>Quiniela Familiar - Mundial 2026</div>
        <div style={linksStyle}>
          <a style={linkStyle} href="#">
            Vive la emoción.
          </a>
          <a style={linkStyle} href="#">
            Emocionate con los partidos.
          </a>
          <a style={linkStyle} href="#">
            ¡Exitos!
          </a>
        </div>
        <div
          style={{
            fontFamily: Theme.Typography.fontFamilyBody,
            fontSize: Theme.Typography.labelMd.fontSize,
            color: Theme.Colors.onSurfaceVariant,
          }}
        >
          Developed by: Cristian Hernandez - Claude Code.
        </div>
      </div>
    </footer>
  );
};
