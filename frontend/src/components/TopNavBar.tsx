import { ReactElement, CSSProperties, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Theme } from '../Theme';
import { useAuth } from './AuthContext';
import { useIsMobile } from '../utils/UseIsMobile';

// ─── Header (sticky, debajo del drawer) ──────────────────────────────────────

const headerStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 40,
  width: '100%',
  backgroundColor: Theme.Colors.surface,
  boxShadow: Theme.Shadows.navbar
};

const containerStyle = (isMobile: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  maxWidth: `${Theme.Breakpoints.maxContent}px`,
  margin: '0 auto',
  height: isMobile ? '56px' : '64px',
  padding: `0 ${Theme.Spacing.marginMobile}`
});

const mobileHeaderLeftStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.xs
};

// ─── Brand ────────────────────────────────────────────────────────────────────

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

// ─── Desktop nav ──────────────────────────────────────────────────────────────

const desktopNavStyle: CSSProperties = {
  display: 'flex',
  gap: Theme.Spacing.lg,
  alignItems: 'center'
};

const buildLinkStyle = (isActive: boolean): CSSProperties => ({
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
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

// ─── Acciones (desktop) ───────────────────────────────────────────────────────

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

const iconButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: Theme.Spacing.sm,
  borderRadius: Theme.Radii.full,
  color: Theme.Colors.onSurfaceVariant,
  background: 'none',
  border: 'none',
  cursor: 'pointer'
};

// ─── Drawer (mobile) ──────────────────────────────────────────────────────────

const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  zIndex: 50
};

const drawerStyle = (open: boolean): CSSProperties => ({
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  width: '75%',
  maxWidth: '300px',
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  boxShadow: '4px 0 24px rgba(0, 0, 0, 0.14)',
  zIndex: 51,
  display: 'flex',
  flexDirection: 'column',
  transform: open ? 'translateX(0)' : 'translateX(-100%)',
  transition: 'transform 0.25s ease'
});

const drawerHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${Theme.Spacing.md} ${Theme.Spacing.lg}`,
  borderBottom: `1px solid ${Theme.Colors.outlineVariant}`
};

const drawerCloseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: Theme.Spacing.sm,
  borderRadius: Theme.Radii.full,
  color: Theme.Colors.onSurfaceVariant,
  background: 'none',
  border: 'none',
  cursor: 'pointer'
};

const drawerNavStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingTop: Theme.Spacing.sm,
  paddingBottom: Theme.Spacing.sm,
  overflowY: 'auto'
};

const buildDrawerLinkStyle = (isActive: boolean): CSSProperties => ({
  display: 'block',
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: isActive ? Theme.Colors.primary : Theme.Colors.onSurface,
  padding: `${Theme.Spacing.md} ${Theme.Spacing.lg}`,
  borderLeft: `3px solid ${isActive ? Theme.Colors.primary : 'transparent'}`,
  backgroundColor: isActive ? Theme.Colors.surfaceContainerLow : 'transparent'
});

const drawerFooterStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${Theme.Spacing.md} ${Theme.Spacing.lg}`,
  borderTop: `1px solid ${Theme.Colors.outlineVariant}`,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  color: Theme.Colors.onSurfaceVariant
};

const drawerChangePasswordStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.sm,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: Theme.Colors.onSurfaceVariant,
  padding: `${Theme.Spacing.md} ${Theme.Spacing.lg}`,
  borderTop: `1px solid ${Theme.Colors.outlineVariant}`
};

// ─── Componente ───────────────────────────────────────────────────────────────

export const TopNavBar = (): ReactElement => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const closeDrawer = (): void => setDrawerOpen(false);
  const openDrawer = (): void => setDrawerOpen(true);

  const renderLink = (to: string, label: string): ReactElement => (
    <NavLink
      to={to}
      style={({ isActive }: { isActive: boolean }): CSSProperties =>
        buildLinkStyle(isActive)
      }
    >
      {label}
    </NavLink>
  );

  const renderDrawerLink = (to: string, label: string): ReactElement => (
    <NavLink
      to={to}
      onClick={closeDrawer}
      style={({ isActive }: { isActive: boolean }): CSSProperties =>
        buildDrawerLinkStyle(isActive)
      }
    >
      {label}
    </NavLink>
  );

  return (
    <>
      {isMobile && drawerOpen ? (
        <div style={backdropStyle} onClick={closeDrawer} />
      ) : null}

      {isMobile ? (
        <aside style={drawerStyle(drawerOpen)} aria-hidden={!drawerOpen}>
          <div style={drawerHeaderStyle}>
            <div style={brandStyle(true)}>
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shoe_cleats
              </span>
              QF 2026
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              style={drawerCloseStyle}
              aria-label="Cerrar menú"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav style={drawerNavStyle}>
            {renderDrawerLink('/dashboard', 'Pronósticos')}
            {renderDrawerLink('/mis-predicciones', 'Mis Predicciones')}
            {renderDrawerLink('/resultados', 'Resultados')}
            {renderDrawerLink('/leaderboard', 'Liga')}
            {user !== null && user.isAdmin
              ? renderDrawerLink('/admin', 'Admin')
              : null}
          </nav>

          <Link
            to="/cambiar-contrasena"
            onClick={closeDrawer}
            style={drawerChangePasswordStyle}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              lock_reset
            </span>
            Cambiar contraseña
          </Link>

          {user !== null ? (
            <div style={drawerFooterStyle}>
              <span>{user.displayName}</span>
              <button
                type="button"
                onClick={(): void => {
                  closeDrawer();
                  handleLogout();
                }}
                style={drawerCloseStyle}
                aria-label="Cerrar sesión"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          ) : null}
        </aside>
      ) : null}

      <header style={headerStyle}>
        <div style={containerStyle(isMobile)}>
          {isMobile ? (
            <div style={mobileHeaderLeftStyle}>
              <button
                type="button"
                onClick={openDrawer}
                style={iconButtonStyle}
                aria-label="Abrir menú"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div style={brandStyle(true)}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shoe_cleats
                </span>
                QF 2026
              </div>
            </div>
          ) : (
            <>
              <div style={brandStyle(false)}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shoe_cleats
                </span>
                QUINIELA FAMILIAR 2026
              </div>
              <nav style={desktopNavStyle}>
                {renderLink('/dashboard', 'Pronósticos')}
                {renderLink('/mis-predicciones', 'Mis Predicciones')}
                {renderLink('/resultados', 'Resultados')}
                {renderLink('/leaderboard', 'Liga')}
                {user !== null && user.isAdmin
                  ? renderLink('/admin', 'Admin')
                  : null}
              </nav>
              <div style={actionsStyle}>
                {user !== null ? (
                  <span style={userNameStyle}>{user.displayName}</span>
                ) : null}
                <Link
                  to="/cambiar-contrasena"
                  style={iconButtonStyle}
                  aria-label="Cambiar contraseña"
                >
                  <span className="material-symbols-outlined">lock_reset</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={iconButtonStyle}
                  aria-label="Cerrar sesión"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
};
