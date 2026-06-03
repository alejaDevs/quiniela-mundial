import {
  ReactElement,
  CSSProperties,
  FormEvent,
  useState,
  ChangeEvent,
} from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Theme } from "../../Theme";
import { useAuth } from "../../components/AuthContext";

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: Theme.Colors.background,
  padding: Theme.Spacing.marginMobile,
  fontFamily: Theme.Typography.fontFamilyBody,
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "1000px",
  display: "flex",
  flexWrap: "wrap",
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  borderRadius: Theme.Radii.xl,
  boxShadow: Theme.Shadows.card,
  border: `1px solid ${Theme.Colors.surfaceDim}`,
  overflow: "hidden",
};

const brandPanelStyle: CSSProperties = {
  flex: "1 1 380px",
  minWidth: "300px",
  position: "relative",
  backgroundColor: Theme.Colors.primary,
  padding: "48px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  color: Theme.Colors.onPrimary,
  backgroundImage: `linear-gradient(180deg, ${Theme.Colors.primaryContainer} 0%, ${Theme.Colors.primary} 100%)`,
};

const brandTitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.displayLg.fontSize,
  lineHeight: Theme.Typography.displayLg.lineHeight,
  letterSpacing: Theme.Typography.displayLg.letterSpacing,
  fontWeight: Theme.Typography.displayLg.fontWeight,
  margin: 0,
};

const brandSubtitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  fontWeight: Theme.Typography.headlineMd.fontWeight,
  color: Theme.Colors.primaryFixed,
  marginTop: Theme.Spacing.sm,
};

const brandFooterStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  maxWidth: "340px",
  color: Theme.Colors.onPrimary,
};

const formPanelStyle: CSSProperties = {
  flex: "1 1 380px",
  padding: "48px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  backgroundColor: Theme.Colors.surfaceContainerLowest,
};

const formHeaderTitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineLg.fontSize,
  lineHeight: Theme.Typography.headlineLg.lineHeight,
  letterSpacing: Theme.Typography.headlineLg.letterSpacing,
  fontWeight: Theme.Typography.headlineLg.fontWeight,
  color: Theme.Colors.onSurface,
  margin: 0,
  marginBottom: Theme.Spacing.sm,
};

const formHeaderSubtitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  margin: 0,
  marginBottom: Theme.Spacing.xl,
};

const fieldStyle: CSSProperties = {
  marginBottom: Theme.Spacing.lg,
};

const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: Theme.Colors.onSurface,
  marginBottom: Theme.Spacing.sm,
};

const inputWrapStyle: CSSProperties = {
  position: "relative",
};

const iconStyle: CSSProperties = {
  position: "absolute",
  left: Theme.Spacing.sm,
  top: "50%",
  transform: "translateY(-50%)",
  color: Theme.Colors.outline,
  fontSize: "20px",
  pointerEvents: "none",
};

const inputStyle: CSSProperties = {
  width: "100%",
  backgroundColor: Theme.Colors.surface,
  padding: `${Theme.Spacing.md} ${Theme.Spacing.md} ${Theme.Spacing.md} 40px`,
  borderRadius: Theme.Radii.md,
  border: `1px solid ${Theme.Colors.outlineVariant}`,
  color: Theme.Colors.onSurface,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  outline: "none",
};

const submitButtonStyle = (disabled: boolean): CSSProperties => ({
  width: "100%",
  backgroundColor: Theme.Colors.primary,
  color: Theme.Colors.onPrimary,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  padding: `${Theme.Spacing.md}`,
  borderRadius: Theme.Radii.md,
  opacity: disabled ? 0.7 : 1,
});

const bottomLinkRowStyle: CSSProperties = {
  marginTop: Theme.Spacing.xl,
  textAlign: "center",
};

const bottomLinkStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: Theme.Colors.secondary,
};

const errorStyle: CSSProperties = {
  marginBottom: Theme.Spacing.md,
  padding: Theme.Spacing.sm,
  borderRadius: Theme.Radii.sm,
  backgroundColor: Theme.Colors.errorContainer,
  color: Theme.Colors.onErrorContainer,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  textAlign: "center",
};

export const Register = (): ReactElement => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (user !== null) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const trimmedUsername: string = username.trim();
      const trimmedDisplay: string = displayName.trim();
      const effectiveDisplayName: string =
        trimmedDisplay.length > 0 ? trimmedDisplay : trimmedUsername;
      await register(trimmedUsername, password, effectiveDisplayName);
      navigate("/dashboard");
    } catch (err: unknown) {
      const message: string =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "No se pudo crear la cuenta";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <main style={cardStyle}>
        <section style={brandPanelStyle}>
          <div>
            <h1 style={brandTitleStyle}>QUINIELA FAMILIAR 2026</h1>
            <p style={brandSubtitleStyle}>Únete a la acción</p>
          </div>
          <p style={brandFooterStyle}>
            Predice, compite y domina la tabla de clasificación mundial. Tu
            análisis profesional comienza aquí.
          </p>
        </section>

        <section style={formPanelStyle}>
          <h2 style={formHeaderTitleStyle}>Crear Cuenta</h2>
          <p style={formHeaderSubtitleStyle}>
            Ingresa tus datos para registrarte en la plataforma.
          </p>

          <form onSubmit={handleSubmit}>
            {error !== null ? <div style={errorStyle}>{error}</div> : null}

            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="username">
                Nombre de Usuario
              </label>
              <div style={inputWrapStyle}>
                <span className="material-symbols-outlined" style={iconStyle}>
                  person
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  placeholder="Pedro"
                  required
                  minLength={3}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                    setUsername(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="displayName">
                Nombre para Mostrar
              </label>
              <div style={inputWrapStyle}>
                <span className="material-symbols-outlined" style={iconStyle}>
                  badge
                </span>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  placeholder="Pedrito31"
                  onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                    setDisplayName(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="password">
                Contraseña
              </label>
              <div style={inputWrapStyle}>
                <span className="material-symbols-outlined" style={iconStyle}>
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                    setPassword(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={submitButtonStyle(submitting)}
            >
              {submitting ? "Creando cuenta…" : "Registrarse"}
            </button>
          </form>

          <div style={bottomLinkRowStyle}>
            <Link to="/login" style={bottomLinkStyle}>
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};
