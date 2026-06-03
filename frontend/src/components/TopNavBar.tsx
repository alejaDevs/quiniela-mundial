import { ReactElement, CSSProperties } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Theme } from '../Theme';
import { useAuth } from './AuthContext';
import { useIsMobile } from '../utils/UseIsMobile';

const headerStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 50,
  width: '100%',
  backgroundColor: Theme.Colors.surface,
  boxShadow: Theme.Shadows.navbar
};

const containerStyle = (isMobile: boolean): CSSProperties =>
  isMobile
    ? {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: `${Theme.Breakpoints.maxContent}px`,
        margin: '0 auto',
        padding: `${Theme.Spacing.sm} ${Theme.Spacing.marginMobile}`,
        gap: Theme.Spacing.xs
      }
    : {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: `${Theme.Breakpoints.maxContent}px`,
        margin: '0 auto',
        height: '64px',
        padding: `0 ${Theme.Spacing.marginMobile}`
      };

const mobileTopRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: '48px'
};

const brandStyle = (isMobile: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: isMobile
    ? Theme.Typography.headlineMd.fontSize
    : Theme.Typography.headlineLg.fontSize,
  lineHeight: '1.2',
  fontWeight: 900,
  color: Theme.Colors.primary,
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.sm,
  flexShrink: 0
});

const navStyle = (isMobile: boolean): CSSProperties =>
  isMobile
    ? {
        display: 'flex',
        alignItems: 'center',
        gap: Theme.Spacing.xs,
        overflowX: 'auto',
        paddingBottom: '4px'
      }
    : {
        display: 'flex',
        gap: Theme.Spacing.lg,
        alignItems: 'center'
      };

const actionsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.sm,
  flexShrink: 0
};

const userNameStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  color: Theme.Colors.onSurfaceVariant
};

const logoutButtonStyle: CSSProperties = {
  padding: Theme.Spacing.sm,
  borderRadius: Theme.Radii.full,
  color: Theme.Colors.onSurfaceVariant,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const buildLinkStyle = (isMobile: boolean, isActive: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: isMobile
    ? Theme.Typography.labelMd.fontSize
    : Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: isActive ? Theme.Colors.primary : Theme.Colors.onSurfaceVariant,
  paddingTop: Theme.Spacing.xs,
  paddingLeft: Theme.Spacing.sm,
  paddingRight: Theme.Spacing.sm,
  paddingBottom: isActive ? '2px' : Theme.Spacing.xs,
  borderRadius: Theme.Radii.md,
  borderBottom: isActive ? `2px solid ${Theme.Colors.primary}` : undefined,
  whiteSpace: 'nowrap'
});

export const TopNavBar = (): ReactElement => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const renderLink = (to: string, label: string): ReactElement => (
    <NavLink
      to={to}
      style={({ isActive }): CSSProperties => buildLinkStyle(isMobile, isActive)}
    >
      {label}
    </NavLink>
  );

  const renderNav = (): ReactElement => (
    <nav style={navStyle(isMobile)}>
      {renderLink('/dashboard', 'Pronósticos')}
      {renderLink('/mis-predicciones', 'Mis Predicciones')}
      {renderLink('/resultados', 'Resultados')}
      {renderLink('/leaderboard', 'Liga')}
      {user !== null && user.isAdmin ? renderLink('/admin', 'Admin') : null}
    </nav>
  );

  const renderActions = (): ReactElement => (
    <div style={actionsStyle}>
      {user !== null ? (
        <span style={userNameStyle}>{user.displayName}</span>
      ) : null}
      <button
        type="button"
        onClick={handleLogout}
        style={logoutButtonStyle}
        aria-label="Cerrar sesión"
      >
        <span className="material-symbols-outlined">logout</span>
      </button>
    </div>
  );

  return (
    <header style={headerStyle}>
      <div style={containerStyle(isMobile)}>
        {isMobile ? (
          <>
            <div style={mobileTopRowStyle}>
              <div style={brandStyle(isMobile)}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shoe_cleats
                </span>
                QF 2026
              </div>
              {renderActions()}
            </div>
            {renderNav()}
          </>
        ) : (
          <>
            <div style={brandStyle(isMobile)}>
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shoe_cleats
              </span>
              QUINIELA FAMILIAR 2026
            </div>
            {renderNav()}
            {renderActions()}
          </>
        )}
      </div>
    </header>
  );
};
