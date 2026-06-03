import { ReactElement, CSSProperties } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Theme } from '../Theme';
import { TopNavBar } from './TopNavBar';
import { Footer } from './Footer';

const wrapperStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: Theme.Colors.background,
  color: Theme.Colors.onBackground,
  fontFamily: Theme.Typography.fontFamilyBody
};

const mainStyle: CSSProperties = {
  flex: 1,
  width: '100%',
  maxWidth: `${Theme.Breakpoints.maxContent}px`,
  margin: '0 auto',
  padding: `${Theme.Spacing.xl} ${Theme.Spacing.marginMobile}`
};

export const AppLayout = (): ReactElement => {
  return (
    <div style={wrapperStyle}>
      <TopNavBar />
      <main style={mainStyle}>
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: Theme.Colors.surfaceContainerLowest,
            color: Theme.Colors.onBackground,
            border: `1px solid ${Theme.Colors.outlineVariant}`,
            fontFamily: Theme.Typography.fontFamilyBody,
            fontSize: Theme.Typography.labelLg.fontSize,
            fontWeight: Theme.Typography.labelLg.fontWeight
          }
        }}
      />
    </div>
  );
};
