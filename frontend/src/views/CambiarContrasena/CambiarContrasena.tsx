import { ReactElement, CSSProperties, useState, ChangeEvent, FormEvent } from 'react';
import { toast } from 'sonner';
import { Theme } from '../../Theme';
import { useIsMobile } from '../../utils/UseIsMobile';
import { apiPatch } from '../../utils/ApiClient';

interface IChangePasswordResponse {
  message: string;
}

const headerRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.md,
  marginBottom: Theme.Spacing.xl
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
  margin: 0
});

const cardStyle: CSSProperties = {
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  borderRadius: Theme.Radii.lg,
  boxShadow: Theme.Shadows.card,
  padding: Theme.Spacing.xl,
  maxWidth: '480px'
};

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: Theme.Spacing.xs,
  marginBottom: Theme.Spacing.lg
};

const labelStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: Theme.Colors.onSurface
};

const inputStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  color: Theme.Colors.onSurface,
  backgroundColor: Theme.Colors.surfaceContainerLow,
  border: `1.5px solid ${Theme.Colors.outlineVariant}`,
  borderRadius: Theme.Radii.md,
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.md}`,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

const submitButtonStyle = (disabled: boolean): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
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
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  width: '100%'
});

export const CambiarContrasena = (): ReactElement => {
  const isMobile = useIsMobile();
  const [newPassword, setNewPassword] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (newPassword.length === 0) return;
    setSaving(true);
    try {
      await apiPatch<IChangePasswordResponse>('/api/auth/password', {
        newPassword
      });
      toast.success('¡Contraseña actualizada correctamente!');
      setNewPassword('');
    } catch (err: unknown) {
      const message: string =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Error al actualizar la contraseña';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={headerRowStyle}>
        <span
          className="material-symbols-outlined"
          style={{
            color: Theme.Colors.primary,
            fontSize: isMobile ? '32px' : '48px',
            fontVariationSettings: "'FILL' 1"
          }}
        >
          lock_reset
        </span>
        <h1 style={titleStyle(isMobile)}>Cambiar contraseña</h1>
      </div>

      <div style={cardStyle}>
        <form
          onSubmit={(e: FormEvent<HTMLFormElement>): void => {
            void handleSubmit(e);
          }}
        >
          <div style={fieldStyle}>
            <label htmlFor="new-password" style={labelStyle}>
              Nueva contraseña
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                setNewPassword(e.target.value)
              }
              placeholder="Ingresa tu nueva contraseña"
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={saving || newPassword.length === 0}
            style={submitButtonStyle(saving || newPassword.length === 0)}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
            >
              {saving ? 'hourglass_top' : 'save'}
            </span>
            {saving ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </>
  );
};
