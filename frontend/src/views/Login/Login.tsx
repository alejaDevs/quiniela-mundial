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
  backgroundColor: Theme.Colors.surface,
  padding: Theme.Spacing.marginMobile,
  fontFamily: Theme.Typography.fontFamilyBody,
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  borderRadius: Theme.Radii.xl,
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  border: `1px solid ${Theme.Colors.surfaceVariant}`,
  padding: "40px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const brandCircleStyle: CSSProperties = {
  width: "64px",
  height: "64px",
  borderRadius: Theme.Radii.full,
  backgroundColor: `${Theme.Colors.primaryContainer}1a`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: Theme.Spacing.lg,
};

const headlineStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineLg.fontSize,
  lineHeight: Theme.Typography.headlineLg.lineHeight,
  letterSpacing: Theme.Typography.headlineLg.letterSpacing,
  fontWeight: Theme.Typography.headlineLg.fontWeight,
  color: Theme.Colors.primary,
  textAlign: "center",
  margin: 0,
  marginBottom: Theme.Spacing.sm,
};

const subtitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyMd.fontSize,
  lineHeight: Theme.Typography.bodyMd.lineHeight,
  color: Theme.Colors.onSurfaceVariant,
  textAlign: "center",
  marginBottom: Theme.Spacing.xs,
};

const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: Theme.Colors.onSurface,
  marginBottom: Theme.Spacing.sm,
  paddingLeft: Theme.Spacing.xs,
};

const inputWrapStyle: CSSProperties = {
  position: "relative",
  marginBottom: Theme.Spacing.lg,
};

const iconStyle: CSSProperties = {
  position: "absolute",
  left: Theme.Spacing.md,
  top: "50%",
  transform: "translateY(-50%)",
  color: Theme.Colors.outline,
  fontSize: "20px",
  pointerEvents: "none",
};

const inputStyle: CSSProperties = {
  width: "100%",
  backgroundColor: Theme.Colors.surface,
  padding: `${Theme.Spacing.md} ${Theme.Spacing.md} ${Theme.Spacing.md} ${Theme.Spacing.xxl}`,
  borderRadius: Theme.Radii.md,
  border: `1px solid ${Theme.Colors.outline}`,
  color: Theme.Colors.onSurface,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyLg.fontSize,
  lineHeight: Theme.Typography.bodyLg.lineHeight,
  outline: "none",
};

const buttonStyle = (disabled: boolean): CSSProperties => ({
  width: "100%",
  backgroundColor: Theme.Colors.primary,
  color: Theme.Colors.onPrimary,
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  fontWeight: Theme.Typography.headlineMd.fontWeight,
  padding: `${Theme.Spacing.md}`,
  borderRadius: Theme.Radii.md,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: Theme.Spacing.sm,
  opacity: disabled ? 0.7 : 1,
});

const errorStyle: CSSProperties = {
  width: "100%",
  marginBottom: Theme.Spacing.md,
  padding: Theme.Spacing.sm,
  borderRadius: Theme.Radii.sm,
  backgroundColor: Theme.Colors.errorContainer,
  color: Theme.Colors.onErrorContainer,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  textAlign: "center",
};

export const Login = (): ReactElement => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
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
      await login(username.trim(), password);
      navigate("/dashboard");
    } catch (err: unknown) {
      const message: string =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "No se pudo iniciar sesión";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <main style={cardStyle}>
        <div style={brandCircleStyle}>
          <span
            className="material-symbols-outlined"
            style={{
              color: Theme.Colors.primary,
              fontSize: "36px",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            shoe_cleats
          </span>
        </div>
        <h1 style={headlineStyle}>QF 2026</h1>
        <p style={subtitleStyle}>
          ¡Bienvenido a la Quiniela Familiar - Mundial 2026!
        </p>
        <p style={{ ...subtitleStyle, marginBottom: Theme.Spacing.xl }}>
          Ingresa para predecir los resultados.
        </p>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          {error !== null ? <div style={errorStyle}>{error}</div> : null}
          <div>
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
                placeholder="Ej. Pedro"
                onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                  setUsername(e.target.value)
                }
                required
                style={inputStyle}
              />
            </div>
          </div>
          <div>
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
                onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                  setPassword(e.target.value)
                }
                required
                style={inputStyle}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={buttonStyle(submitting)}
          >
            <span>{submitting ? "Ingresando…" : "Entrar"}</span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}
            >
              arrow_forward
            </span>
          </button>
        </form>
        <div
          style={{
            marginTop: Theme.Spacing.lg,
            textAlign: "center",
          }}
        >
          <Link
            to="/register"
            style={{
              fontFamily: Theme.Typography.fontFamilyBody,
              fontSize: Theme.Typography.labelLg.fontSize,
              fontWeight: Theme.Typography.labelLg.fontWeight,
              letterSpacing: Theme.Typography.labelLg.letterSpacing,
              color: Theme.Colors.secondary,
            }}
          >
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </main>
    </div>
  );
};
