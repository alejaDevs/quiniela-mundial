import {
  ReactElement,
  CSSProperties,
  useEffect,
  useState,
  useCallback,
  ChangeEvent
} from 'react';
import { Theme } from '../../Theme';
import { IMatch } from '../../types/Index';
import { apiGet, apiPut, apiPost, apiPatch } from '../../utils/ApiClient';
import {
  adaptMatchFromApi,
  adaptMatchListFromApi
} from '../../adapters/MatchAdapter';
import { FlagIcon } from '../../components/FlagIcon';

interface IMatchesResponse {
  matches: unknown;
}

interface IMatchResponse {
  match: unknown;
}

interface IUserEntry {
  id: string;
  username: string;
  displayName: string;
  isActive: boolean;
}

interface IRawUser {
  id?: string;
  username?: string;
  displayName?: string;
  isActive?: boolean;
}

interface IUsersResponse {
  users: unknown;
}

interface IUserResponse {
  user: unknown;
}

const adaptUser = (raw: unknown): IUserEntry | null => {
  if (typeof raw !== 'object' || raw === null) return null;
  const data: IRawUser = raw as IRawUser;
  if (
    typeof data.id !== 'string' ||
    typeof data.username !== 'string' ||
    typeof data.displayName !== 'string' ||
    typeof data.isActive !== 'boolean'
  ) {
    return null;
  }
  return {
    id: data.id,
    username: data.username,
    displayName: data.displayName,
    isActive: data.isActive
  };
};

const adaptUserList = (raw: unknown): IUserEntry[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(adaptUser)
    .filter((u: IUserEntry | null): u is IUserEntry => u !== null);
};

interface IDraft {
  homeScore: number | null;
  awayScore: number | null;
}

interface IFinalDraft {
  finalHomeScore: number | null;
  finalAwayScore: number | null;
  winnerSide: 'home' | 'away' | null;
}

const headerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: Theme.Spacing.sm,
  marginBottom: Theme.Spacing.xl
};

const adminBadgeStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.sm,
  color: Theme.Colors.error,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  fontWeight: Theme.Typography.labelMd.fontWeight,
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const titleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.displayLg.fontSize,
  lineHeight: Theme.Typography.displayLg.lineHeight,
  letterSpacing: Theme.Typography.displayLg.letterSpacing,
  fontWeight: Theme.Typography.displayLg.fontWeight,
  color: Theme.Colors.onSurface,
  margin: 0
};

const subtitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.bodyLg.fontSize,
  color: Theme.Colors.onSurfaceVariant,
  margin: 0
};

const workspaceStyle: CSSProperties = {
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  borderRadius: Theme.Radii.xl,
  padding: Theme.Spacing.xl,
  boxShadow: Theme.Shadows.card,
  display: 'flex',
  flexDirection: 'column',
  gap: Theme.Spacing.lg
};

const sectionHeader: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${Theme.Colors.surfaceContainerHighest}`,
  paddingBottom: Theme.Spacing.md
};

const sectionTitleStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  fontWeight: Theme.Typography.headlineMd.fontWeight,
  color: Theme.Colors.onSurface,
  margin: 0
};

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: Theme.Spacing.md
};

const rowStyle: CSSProperties = {
  backgroundColor: Theme.Colors.surfaceContainerLowest,
  borderRadius: Theme.Radii.md,
  border: `1px solid ${Theme.Colors.surfaceContainerHighest}`,
  padding: `${Theme.Spacing.md} ${Theme.Spacing.lg}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: Theme.Spacing.md,
  flexWrap: 'wrap'
};

const teamCellStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.md,
  flex: '1 1 30%',
  minWidth: '160px'
};

const teamNameStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  color: Theme.Colors.onSurface
};

const scoreCellStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: Theme.Spacing.md,
  justifyContent: 'center',
  flex: '1 1 30%'
};

const inputStyle: CSSProperties = {
  width: '64px',
  height: '64px',
  textAlign: 'center',
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.scoreDisplay.fontSize,
  fontWeight: Theme.Typography.scoreDisplay.fontWeight,
  color: Theme.Colors.onSurface,
  backgroundColor: Theme.Colors.surface,
  border: `1px solid ${Theme.Colors.outlineVariant}`,
  borderRadius: Theme.Radii.md,
  outline: 'none'
};

const colonStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyDisplay,
  fontSize: Theme.Typography.headlineMd.fontSize,
  color: Theme.Colors.outline
};

const actionButtonStyle = (disabled: boolean): CSSProperties => ({
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.md}`,
  borderRadius: Theme.Radii.md,
  backgroundColor: Theme.Colors.primary,
  color: Theme.Colors.onPrimary,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  opacity: disabled ? 0.6 : 1
});

// Cuartos de Final en adelante (cuartos, semis, 3er lugar y final) se juegan
// como una sola liga, por eso comparten una única fase de snapshot.
type SnapshotPhaseKey =
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final';

const SNAPSHOT_PHASES: ReadonlyArray<{ key: SnapshotPhaseKey; label: string }> = [
  { key: 'round_of_32',   label: '16vos de Final' },
  { key: 'round_of_16',   label: 'Octavos de Final' },
  { key: 'quarter_final', label: 'Cuartos de Final en Adelante' },
];

const chipStyle = (selected: boolean): CSSProperties => ({
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.md}`,
  borderRadius: Theme.Radii.full,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelLg.fontSize,
  fontWeight: Theme.Typography.labelLg.fontWeight,
  letterSpacing: Theme.Typography.labelLg.letterSpacing,
  backgroundColor: selected ? Theme.Colors.primary : Theme.Colors.surfaceContainerLow,
  color: selected ? Theme.Colors.onPrimary : Theme.Colors.onSurfaceVariant,
  border: selected
    ? `1px solid ${Theme.Colors.primary}`
    : `1px solid ${Theme.Colors.surfaceContainerHighest}`,
  cursor: 'pointer',
  transition: 'background-color 0.15s, color 0.15s',
});

const winnerButtonStyle = (selected: boolean): CSSProperties => ({
  padding: `${Theme.Spacing.xs} ${Theme.Spacing.md}`,
  borderRadius: Theme.Radii.md,
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  fontWeight: Theme.Typography.labelMd.fontWeight,
  backgroundColor: selected ? Theme.Colors.primary : Theme.Colors.surfaceContainerLow,
  color: selected ? Theme.Colors.onPrimary : Theme.Colors.onSurfaceVariant,
  border: selected
    ? `1px solid ${Theme.Colors.primary}`
    : `1px solid ${Theme.Colors.outlineVariant}`,
  cursor: 'pointer',
});

const warningStyle: CSSProperties = {
  fontFamily: Theme.Typography.fontFamilyBody,
  fontSize: Theme.Typography.labelMd.fontSize,
  color: Theme.Colors.error,
  backgroundColor: `${Theme.Colors.error}18`,
  border: `1px solid ${Theme.Colors.error}44`,
  borderRadius: Theme.Radii.md,
  padding: `${Theme.Spacing.sm} ${Theme.Spacing.md}`,
};

const parseScore = (raw: string): number | null => {
  if (raw === '') {
    return null;
  }
  const parsed: number = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
};

interface ISnapshotMessageResponse {
  message: string;
}

export const Admin = (): ReactElement => {
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [drafts, setDrafts] = useState<Map<string, IDraft>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [finalDrafts, setFinalDrafts] = useState<Map<string, IFinalDraft>>(new Map());
  const [finalFeedback, setFinalFeedback] = useState<string | null>(null);
  const [submittingFinalId, setSubmittingFinalId] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<SnapshotPhaseKey>('round_of_32');
  const [snapshotLoading, setSnapshotLoading] = useState<boolean>(false);
  const [snapshotFeedback, setSnapshotFeedback] = useState<string | null>(null);
  const [snapshotError, setSnapshotError] = useState<boolean>(false);
  const [users, setUsers] = useState<IUserEntry[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [userFeedback, setUserFeedback] = useState<string | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response: IMatchesResponse = await apiGet<IMatchesResponse>(
        '/api/matches'
      );
      setMatches(adaptMatchListFromApi(response.matches));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async (): Promise<void> => {
    setUsersLoading(true);
    try {
      const response: IUsersResponse = await apiGet<IUsersResponse>('/api/users');
      setUsers(adaptUserList(response.users));
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect((): void => {
    void load();
    void loadUsers();
  }, [load, loadUsers]);

  const updateDraft = (
    matchId: string,
    side: 'home' | 'away',
    value: number | null
  ): void => {
    setDrafts((prev: Map<string, IDraft>): Map<string, IDraft> => {
      const next: Map<string, IDraft> = new Map(prev);
      const current: IDraft = next.get(matchId) ?? {
        homeScore: null,
        awayScore: null
      };
      next.set(matchId, {
        homeScore: side === 'home' ? value : current.homeScore,
        awayScore: side === 'away' ? value : current.awayScore
      });
      return next;
    });
  };

  const handlePublish = async (match: IMatch): Promise<void> => {
    const draft: IDraft | undefined = drafts.get(match.id);
    if (
      draft === undefined ||
      draft.homeScore === null ||
      draft.awayScore === null
    ) {
      setFeedback('Ingresa ambos marcadores antes de publicar.');
      return;
    }
    setSubmittingId(match.id);
    setFeedback(null);
    try {
      const response: IMatchResponse = await apiPut<IMatchResponse>(
        `/api/matches/${match.id}/result`,
        { homeScore: draft.homeScore, awayScore: draft.awayScore }
      );
      const updated: IMatch = adaptMatchFromApi(response.match);
      setMatches(
        (prev: IMatch[]): IMatch[] =>
          prev.map((m: IMatch): IMatch => (m.id === updated.id ? updated : m))
      );
      setDrafts(
        (prev: Map<string, IDraft>): Map<string, IDraft> => {
          const next: Map<string, IDraft> = new Map(prev);
          next.delete(match.id);
          return next;
        }
      );
      setFeedback(
        `Resultado publicado para ${match.homeTeam.name} vs ${match.awayTeam.name}.`
      );
    } catch (err: unknown) {
      const message: string =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Error al publicar resultado';
      setFeedback(message);
    } finally {
      setSubmittingId(null);
    }
  };

  const updateFinalDraft = (
    matchId: string,
    patch: Partial<IFinalDraft>
  ): void => {
    setFinalDrafts((prev: Map<string, IFinalDraft>): Map<string, IFinalDraft> => {
      const next: Map<string, IFinalDraft> = new Map(prev);
      const current: IFinalDraft = next.get(matchId) ?? {
        finalHomeScore: null,
        finalAwayScore: null,
        winnerSide: null
      };
      next.set(matchId, { ...current, ...patch });
      return next;
    });
  };

  const handlePublishFinalResult = async (match: IMatch): Promise<void> => {
    const draft: IFinalDraft | undefined = finalDrafts.get(match.id);
    if (
      draft === undefined ||
      draft.finalHomeScore === null ||
      draft.finalAwayScore === null
    ) {
      setFinalFeedback('Ingresa el resultado final antes de publicar.');
      return;
    }
    if (draft.finalHomeScore === draft.finalAwayScore && draft.winnerSide === null) {
      setFinalFeedback('El resultado final quedó empatado: indica quién avanzó.');
      return;
    }
    setSubmittingFinalId(match.id);
    setFinalFeedback(null);
    try {
      const response: IMatchResponse = await apiPut<IMatchResponse>(
        `/api/matches/${match.id}/final-result`,
        {
          finalHomeScore: draft.finalHomeScore,
          finalAwayScore: draft.finalAwayScore,
          winnerSide: draft.winnerSide
        }
      );
      const updated: IMatch = adaptMatchFromApi(response.match);
      setMatches(
        (prev: IMatch[]): IMatch[] =>
          prev.map((m: IMatch): IMatch => (m.id === updated.id ? updated : m))
      );
      setFinalDrafts(
        (prev: Map<string, IFinalDraft>): Map<string, IFinalDraft> => {
          const next: Map<string, IFinalDraft> = new Map(prev);
          next.delete(match.id);
          return next;
        }
      );
      setFinalFeedback(
        `Resultado final publicado para ${match.homeTeam.name} vs ${match.awayTeam.name}.`
      );
    } catch (err: unknown) {
      const message: string =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Error al publicar resultado final';
      setFinalFeedback(message);
    } finally {
      setSubmittingFinalId(null);
    }
  };

  const handleSaveSnapshot = async (): Promise<void> => {
    setSnapshotLoading(true);
    setSnapshotFeedback(null);
    setSnapshotError(false);
    try {
      const resp = await apiPost<ISnapshotMessageResponse>(
        `/api/leaderboard/snapshot/${selectedPhase}`,
        {}
      );
      setSnapshotFeedback(resp.message);
      setSnapshotError(false);
    } catch (err: unknown) {
      const message: string =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Error al guardar el snapshot';
      setSnapshotFeedback(message);
      setSnapshotError(true);
    } finally {
      setSnapshotLoading(false);
    }
  };

  const handleToggleUserActive = async (user: IUserEntry): Promise<void> => {
    setTogglingUserId(user.id);
    setUserFeedback(null);
    try {
      const response: IUserResponse = await apiPatch<IUserResponse>(
        `/api/users/${user.id}/active`,
        { isActive: !user.isActive }
      );
      const updated: IUserEntry | null = adaptUser(response.user);
      if (updated !== null) {
        setUsers(
          (prev: IUserEntry[]): IUserEntry[] =>
            prev.map((u: IUserEntry): IUserEntry => (u.id === updated.id ? updated : u))
        );
      }
    } catch (err: unknown) {
      const message: string =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Error al actualizar el usuario';
      setUserFeedback(message);
    } finally {
      setTogglingUserId(null);
    }
  };

  const playableMatches: IMatch[] = matches.filter(
    (m: IMatch): boolean => !m.isFinished
  );

  const tiedKnockoutMatches: IMatch[] = matches.filter(
    (m: IMatch): boolean =>
      m.isFinished &&
      m.stage !== 'group' &&
      m.homeScore === m.awayScore &&
      m.finalHomeScore === null
  );

  return (
    <>
      <div style={headerStyle}>
        <div style={adminBadgeStyle}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}
          >
            admin_panel_settings
          </span>
          Sistema de Control Oficial
        </div>
        <h1 style={titleStyle}>Cargar Resultados Reales del Torneo</h1>
        <p style={subtitleStyle}>
          Introduce los marcadores finales oficiales. Al publicar, la tabla de
          posiciones se recalcula automáticamente.
        </p>
      </div>

      <section style={workspaceStyle}>
        <div style={sectionHeader}>
          <h2 style={sectionTitleStyle}>Partidos Pendientes</h2>
          {feedback !== null ? (
            <span
              style={{
                fontFamily: Theme.Typography.fontFamilyBody,
                fontSize: Theme.Typography.labelMd.fontSize,
                color: Theme.Colors.onSurfaceVariant
              }}
            >
              {feedback}
            </span>
          ) : null}
        </div>

        {loading ? (
          <div
            style={{
              padding: Theme.Spacing.lg,
              textAlign: 'center',
              color: Theme.Colors.onSurfaceVariant
            }}
          >
            Cargando partidos…
          </div>
        ) : playableMatches.length === 0 ? (
          <div
            style={{
              padding: Theme.Spacing.lg,
              textAlign: 'center',
              color: Theme.Colors.onSurfaceVariant
            }}
          >
            No hay partidos pendientes de resultado.
          </div>
        ) : (
          <div style={listStyle}>
            {playableMatches.map(
              (match: IMatch): ReactElement => {
                const draft: IDraft = drafts.get(match.id) ?? {
                  homeScore: null,
                  awayScore: null
                };
                const isSubmitting: boolean = submittingId === match.id;
                return (
                  <div key={match.id} style={rowStyle}>
                    <div style={teamCellStyle}>
                      <FlagIcon
                        countryCode={match.homeTeam.countryCode}
                        alt={`Bandera de ${match.homeTeam.name}`}
                      />
                      <span style={teamNameStyle}>{match.homeTeam.name}</span>
                    </div>
                    <div style={scoreCellStyle}>
                      <input
                        type="number"
                        min="0"
                        placeholder="-"
                        value={
                          draft.homeScore === null ? '' : String(draft.homeScore)
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                          updateDraft(match.id, 'home', parseScore(e.target.value))
                        }
                        style={inputStyle}
                      />
                      <span style={colonStyle}>:</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="-"
                        value={
                          draft.awayScore === null ? '' : String(draft.awayScore)
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                          updateDraft(match.id, 'away', parseScore(e.target.value))
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ ...teamCellStyle, justifyContent: 'flex-end' }}>
                      <span style={teamNameStyle}>{match.awayTeam.name}</span>
                      <FlagIcon
                        countryCode={match.awayTeam.countryCode}
                        alt={`Bandera de ${match.awayTeam.name}`}
                      />
                    </div>
                    <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={(): void => {
                          void handlePublish(match);
                        }}
                        style={actionButtonStyle(isSubmitting)}
                      >
                        {isSubmitting ? 'Publicando…' : 'Publicar Resultado'}
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      <section style={{ ...workspaceStyle, marginTop: Theme.Spacing.xl }}>
        <div style={sectionHeader}>
          <h2 style={sectionTitleStyle}>Definir Resultado Final (Empates en 90&apos;)</h2>
          {finalFeedback !== null ? (
            <span
              style={{
                fontFamily: Theme.Typography.fontFamilyBody,
                fontSize: Theme.Typography.labelMd.fontSize,
                color: Theme.Colors.onSurfaceVariant
              }}
            >
              {finalFeedback}
            </span>
          ) : null}
        </div>

        <p style={warningStyle}>
          Estos partidos terminaron empatados en el minuto 90. El marcador de
          90&apos; ya se usó para calificar los pronósticos; aquí solo se
          define quién avanza en el cuadro (tiempo extra / penales).
        </p>

        {tiedKnockoutMatches.length === 0 ? (
          <div
            style={{
              padding: Theme.Spacing.lg,
              textAlign: 'center',
              color: Theme.Colors.onSurfaceVariant
            }}
          >
            No hay partidos empatados pendientes de definición.
          </div>
        ) : (
          <div style={listStyle}>
            {tiedKnockoutMatches.map(
              (match: IMatch): ReactElement => {
                const draft: IFinalDraft = finalDrafts.get(match.id) ?? {
                  finalHomeScore: null,
                  finalAwayScore: null,
                  winnerSide: null
                };
                const isSubmitting: boolean = submittingFinalId === match.id;
                const isTiedDraft: boolean =
                  draft.finalHomeScore !== null &&
                  draft.finalAwayScore !== null &&
                  draft.finalHomeScore === draft.finalAwayScore;
                return (
                  <div key={match.id} style={rowStyle}>
                    <div style={teamCellStyle}>
                      <FlagIcon
                        countryCode={match.homeTeam.countryCode}
                        alt={`Bandera de ${match.homeTeam.name}`}
                      />
                      <span style={teamNameStyle}>{match.homeTeam.name}</span>
                    </div>
                    <div style={scoreCellStyle}>
                      <input
                        type="number"
                        min="0"
                        placeholder="-"
                        value={
                          draft.finalHomeScore === null ? '' : String(draft.finalHomeScore)
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                          updateFinalDraft(match.id, {
                            finalHomeScore: parseScore(e.target.value),
                            winnerSide: null
                          })
                        }
                        style={inputStyle}
                      />
                      <span style={colonStyle}>:</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="-"
                        value={
                          draft.finalAwayScore === null ? '' : String(draft.finalAwayScore)
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                          updateFinalDraft(match.id, {
                            finalAwayScore: parseScore(e.target.value),
                            winnerSide: null
                          })
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ ...teamCellStyle, justifyContent: 'flex-end' }}>
                      <span style={teamNameStyle}>{match.awayTeam.name}</span>
                      <FlagIcon
                        countryCode={match.awayTeam.countryCode}
                        alt={`Bandera de ${match.awayTeam.name}`}
                      />
                    </div>
                    {isTiedDraft ? (
                      <div
                        style={{
                          flex: '1 1 100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: Theme.Spacing.sm,
                          justifyContent: 'center'
                        }}
                      >
                        <span
                          style={{
                            fontFamily: Theme.Typography.fontFamilyBody,
                            fontSize: Theme.Typography.labelMd.fontSize,
                            color: Theme.Colors.onSurfaceVariant
                          }}
                        >
                          Empate en resultado final, ¿quién avanza?
                        </span>
                        <button
                          type="button"
                          style={winnerButtonStyle(draft.winnerSide === 'home')}
                          onClick={(): void =>
                            updateFinalDraft(match.id, { winnerSide: 'home' })
                          }
                        >
                          {match.homeTeam.name}
                        </button>
                        <button
                          type="button"
                          style={winnerButtonStyle(draft.winnerSide === 'away')}
                          onClick={(): void =>
                            updateFinalDraft(match.id, { winnerSide: 'away' })
                          }
                        >
                          {match.awayTeam.name}
                        </button>
                      </div>
                    ) : null}
                    <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={(): void => {
                          void handlePublishFinalResult(match);
                        }}
                        style={actionButtonStyle(isSubmitting)}
                      >
                        {isSubmitting ? 'Publicando…' : 'Publicar Resultado Final'}
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      <section style={{ ...workspaceStyle, marginTop: Theme.Spacing.xl }}>
        <div style={sectionHeader}>
          <h2 style={sectionTitleStyle}>Cerrar Fase Manualmente</h2>
          {snapshotFeedback !== null ? (
            <span
              style={{
                fontFamily: Theme.Typography.fontFamilyBody,
                fontSize: Theme.Typography.labelMd.fontSize,
                color: snapshotError ? Theme.Colors.error : Theme.Colors.onSurfaceVariant,
              }}
            >
              {snapshotFeedback}
            </span>
          ) : null}
        </div>

        <p style={warningStyle}>
          Esto sobrescribirá el historial guardado de esta fase si ya existe.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: Theme.Spacing.sm }}>
          {SNAPSHOT_PHASES.map(
            (p): ReactElement => (
              <button
                key={p.key}
                type="button"
                style={chipStyle(selectedPhase === p.key)}
                onClick={(): void => setSelectedPhase(p.key)}
              >
                {p.label}
              </button>
            )
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            disabled={snapshotLoading}
            onClick={(): void => {
              void handleSaveSnapshot();
            }}
            style={actionButtonStyle(snapshotLoading)}
          >
            {snapshotLoading ? 'Guardando…' : 'Guardar Snapshot de Fase'}
          </button>
        </div>
      </section>

      <section style={{ ...workspaceStyle, marginTop: Theme.Spacing.xl }}>
        <div style={sectionHeader}>
          <h2 style={sectionTitleStyle}>Gestionar Usuarios</h2>
          {userFeedback !== null ? (
            <span
              style={{
                fontFamily: Theme.Typography.fontFamilyBody,
                fontSize: Theme.Typography.labelMd.fontSize,
                color: Theme.Colors.error
              }}
            >
              {userFeedback}
            </span>
          ) : null}
        </div>

        <p style={warningStyle}>
          Ocultar a un usuario lo quita de la liga y del historial de puntajes
          sin borrar sus pronósticos; puedes volver a mostrarlo cuando quieras.
        </p>

        {usersLoading ? (
          <div
            style={{
              padding: Theme.Spacing.lg,
              textAlign: 'center',
              color: Theme.Colors.onSurfaceVariant
            }}
          >
            Cargando usuarios…
          </div>
        ) : users.length === 0 ? (
          <div
            style={{
              padding: Theme.Spacing.lg,
              textAlign: 'center',
              color: Theme.Colors.onSurfaceVariant
            }}
          >
            No hay usuarios registrados.
          </div>
        ) : (
          <div style={listStyle}>
            {users.map(
              (user: IUserEntry): ReactElement => {
                const isToggling: boolean = togglingUserId === user.id;
                return (
                  <div key={user.id} style={rowStyle}>
                    <div style={teamCellStyle}>
                      <span style={teamNameStyle}>{user.displayName}</span>
                      <span
                        style={{
                          fontFamily: Theme.Typography.fontFamilyBody,
                          fontSize: Theme.Typography.labelMd.fontSize,
                          color: Theme.Colors.onSurfaceVariant
                        }}
                      >
                        @{user.username}
                      </span>
                    </div>
                    <div
                      style={{
                        flex: '1 1 auto',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: Theme.Spacing.sm
                      }}
                    >
                      {!user.isActive ? (
                        <span style={chipStyle(false)}>Oculto de la liga</span>
                      ) : null}
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={(): void => {
                          void handleToggleUserActive(user);
                        }}
                        style={actionButtonStyle(isToggling)}
                      >
                        {isToggling
                          ? 'Actualizando…'
                          : user.isActive
                            ? 'Ocultar de la Liga'
                            : 'Mostrar en la Liga'}
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>
    </>
  );
};
