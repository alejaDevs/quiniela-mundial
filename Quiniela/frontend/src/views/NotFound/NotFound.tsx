import { ReactElement, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Theme } from '../../Theme';
import { useAuth } from '../../components/AuthContext';
import { useIsMobile } from '../../utils/UseIsMobile';

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: Theme.Colors.background,
  padding: Theme.Spacing.xl,
  textAlign: 'center',
  gap: Theme.Spacing.lg
};

const iconStyle: CSSProperties = {
  fontSize: '72px',
  color: Theme.Colors.outlineVariant,
  fontVariationSettings: "'FILL' 1"
};

const titleStyle = (isMobile: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: isMobile
    ? Theme.Typography.headlineLgMobile.fontSize
    : Theme.Typography.headlineLg.fontSize,
  lineHeight: isMobile
    ? Theme.Typography.headlineLgMobile.lineHeight
    : Theme.Typography.headlineLg.lineHeight,
  fontWeight: Theme.Typography.headlineLg.fontWeight,
  color: Theme.Colors.onSurface,
  margin: 0
});

const subtitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  lineHeight: Theme.Typography.bodyMd.lineHeight,
  color: Theme.Colors.onSurfaceVariant,
  margin: 0,
  maxWidth: '400px'
};

const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: Theme.Spacing.sm,
  backgroundColor: Theme.Colors.primary,
  color: Theme.Colors.onPrimary,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.xl}`,
  borderRadius: Theme.Radii.md,
  border: 'none',
  cursor: 'pointer',
  marginTop: Theme.Spacing.sm
};

export const NotFound = (): ReactElement => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBack = (): void => {
    navigate(token !== null ? '/dashboard' : '/login', { replace: true });
  };

  return (
    <div style={pageStyle}>
      <span className="material-symbols-outlined" style={iconStyle}>
        search_off
      </span>
      <h1 style={titleStyle(isMobile)}>Esta ruta no existe o no tienes acceso</h1>
      <p style={subtitleStyle}>
        La página que buscas no existe, fue movida o no tienes permisos para
        verla.
      </p>
      <button type="button" onClick={handleBack} style={buttonStyle}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '18px' }}
        >
          arrow_back
        </span>
        Ir al inicio
      </button>
    </div>
  );
};
