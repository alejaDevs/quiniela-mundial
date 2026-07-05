import { ReactElement, CSSProperties, useEffect, useState } from 'react';
import { Theme } from '../../Theme';
import { IMatch, MatchStage } from '../../types/Index';
import { apiGet } from '../../utils/ApiClient';
import { adaptMatchListFromApi } from '../../adapters/MatchAdapter';
import { FlagIcon } from '../../components/FlagIcon';
import { useIsMobile } from '../../utils/UseIsMobile';

// ── Layout constants ──────────────────────────────────────────────────────────
//
// All columns share BRACKET_HEIGHT with justify-content: space-around.
// For N items in height H the centers are at H/(2N), 3H/(2N), …
//
//   BRACKET_HEIGHT = 720, CARD_HEIGHT = 84
//
//   R16 (4 items): slot=180 → centers 90, 270, 450, 630   gap=96 px ✓
//   QF  (2 items): slot=360 → centers 180, 540            (midpoints of R16 pairs)
//   SF  (1 item):  center   = 360                         (midpoint of QF pair)
//   F   (1 item):  center   = 360                         (same as SF)
//
const BH = 720;         // BRACKET_HEIGHT
const CW = 220;         // card width
const CH = 84;          // card height
const CG = 40;          // column gap (connector SVG width)
const MID = CG / 2;     // connector midpoint x
const LC = Theme.Colors.outlineVariant; // line color

// Pre-computed y-centers (in SVG/container space, origin at top of bracket)
const Y_R16 = [90, 270, 450, 630];   // 4 R16 per side
const Y_QF  = [180, 540];             // 2 QF per side
const Y_SF  = 360;                    // 1 SF per side  (= FINAL center)

// ── Interfaces ────────────────────────────────────────────────────────────────

interface IMatchesResponse {
  matches: unknown;
}

// ── BracketMatchCard ──────────────────────────────────────────────────────────

interface IBracketMatchCardProps {
  match: IMatch | undefined;
  isFinal?: boolean;
}

const BracketMatchCard = ({
  match,
  isFinal = false,
}: IBracketMatchCardProps): ReactElement => {
  const base: CSSProperties = {
    width: CW,
    height: CH,
    borderRadius: Theme.Radii.lg,
    flexShrink: 0,
    overflow: 'hidden',
  };

  if (match === undefined || match.homeTeam.countryCode === 'un') {
    return (
      <div style={{
        ...base,
        border: `1.5px dashed ${Theme.Colors.outlineVariant}`,
        backgroundColor: Theme.Colors.surfaceContainerLow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: Theme.Typography.fontFamilyBody,
          fontSize: Theme.Typography.labelMd.fontSize,
          color: Theme.Colors.onSurfaceVariant,
        }}>
          Por definir
        </span>
      </div>
    );
  }

  const { isFinished, homeScore, awayScore, homeTeam, awayTeam } = match;

  const winner: 'home' | 'away' | null =
    isFinished && homeScore !== null && awayScore !== null
      ? homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : null
      : null;

  const TeamRow = ({ side, score }: { side: 'home' | 'away'; score: number | null }): ReactElement => {
    const team = side === 'home' ? homeTeam : awayTeam;
    const isWinner = winner === side;
    const isLoser = winner !== null && winner !== side;
    const short = team.name.length > 13 ? `${team.name.slice(0, 13)}.` : team.name;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `3px ${Theme.Spacing.sm}`,
        backgroundColor: isWinner ? `${Theme.Colors.primary}15` : 'transparent',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FlagIcon countryCode={team.countryCode} alt={team.name} size="sm" />
          <span style={{
            fontFamily: Theme.Typography.fontFamilyBody,
            fontSize: '13px',
            fontWeight: isWinner ? 700 : 500,
            color: isLoser ? Theme.Colors.onSurfaceVariant : Theme.Colors.onBackground,
            whiteSpace: 'nowrap',
          }}>
            {short}
          </span>
        </div>
        <span style={{
          fontFamily: Theme.Typography.fontFamilyDisplay,
          fontSize: '16px',
          fontWeight: 700,
          color: isWinner ? Theme.Colors.primary : Theme.Colors.onBackground,
          minWidth: 20,
          textAlign: 'right',
        }}>
          {isFinished && score !== null ? score : '–'}
        </span>
      </div>
    );
  };

  return (
    <div style={{
      ...base,
      border: `1.5px solid ${isFinal ? Theme.Colors.primary : Theme.Colors.outlineVariant}`,
      backgroundColor: Theme.Colors.surfaceContainerLowest,
      boxShadow: isFinal ? Theme.Shadows.card : 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 2,
      padding: '2px 0',
    }}>
      <TeamRow side="home" score={homeScore} />
      <div style={{
        height: 1,
        backgroundColor: Theme.Colors.outlineVariant,
        margin: `0 ${Theme.Spacing.sm}`,
        opacity: 0.5,
      }} />
      <TeamRow side="away" score={awayScore} />
    </div>
  );
};

// ── Column ────────────────────────────────────────────────────────────────────

const LABEL_H = 28; // height of the phase label row

const PhaseLabel = ({ label }: { label: string }): ReactElement => (
  <div style={{
    fontFamily: Theme.Typography.fontFamilyBody,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: Theme.Colors.onSurfaceVariant,
    textAlign: 'center',
    width: CW,
    height: LABEL_H,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    {label}
  </div>
);

// Standard match column: all items spread over the full BH with space-around
const MatchColumn = ({
  label,
  matches,
  isFinal,
}: {
  label: string;
  matches: (IMatch | undefined)[];
  isFinal?: boolean;
}): ReactElement => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
    <PhaseLabel label={label} />
    <div style={{
      height: BH,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      alignItems: 'center',
    }}>
      {matches.map((m, i) => (
        <BracketMatchCard key={m?.id ?? `col-${label}-${i}`} match={m} isFinal={isFinal} />
      ))}
    </div>
  </div>
);

// ── SVG connector strip ───────────────────────────────────────────────────────

// A line segment inside a connector SVG
const S = (x1: number, y1: number, x2: number, y2: number): ReactElement => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={LC} strokeWidth={2} strokeLinecap="round" />
);

// Wrapper SVG for a connector column (full BH height, aligned with card columns)
const Connector = ({ children }: { children: React.ReactNode }): ReactElement => (
  <div style={{ flexShrink: 0, paddingTop: LABEL_H }}>
    <svg width={CG} height={BH} style={{ display: 'block', overflow: 'visible' }}>
      {children}
    </svg>
  </div>
);

// ── Bracket ───────────────────────────────────────────────────────────────────

export const Bracket = (): ReactElement => {
  const isMobile = useIsMobile();
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect((): void => {
    const load = async (): Promise<void> => {
      try {
        const res = await apiGet<IMatchesResponse>('/api/matches');
        setMatches(adaptMatchListFromApi(res.matches));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const byDate = (a: IMatch, b: IMatch): number =>
    new Date(a.kickoffDate).getTime() - new Date(b.kickoffDate).getTime();

  const byStage = (s: MatchStage): IMatch[] =>
    matches.filter((m): boolean => m.stage === s).sort(byDate);

  const pad = (arr: IMatch[], len: number): (IMatch | undefined)[] => {
    const out: (IMatch | undefined)[] = [...arr];
    while (out.length < len) out.push(undefined);
    return out;
  };

  const r16All = pad(byStage('round_of_16'), 8);
  const qfAll  = pad(byStage('quarter_final'), 4);
  const sfAll  = pad(byStage('semi_final'), 2);
  const finMatch = byStage('final')[0];
  const tpMatch  = byStage('third_place')[0];

  // Bracket structure (based on kickoffDate sort order of seeded matches):
  //
  // R16 sorted: [0]=Canadá/Marruecos, [1]=Paraguay/Francia,
  //             [2]=Brasil/Noruega,   [3]=México/Inglaterra,
  //             [4]=Portugal/España,  [5]=EE.UU/Bélgica,
  //             [6]=Argentina/Egipto, [7]=Suiza/Colombia
  //
  // QF sorted:  [0]=M97 (09-jul, Llaves 1&2, Lado A top), [1]=M98 (10-jul, Llaves 5&6, Lado A bot)
  //             [2]=M99 (11-jul 14:00, Llaves 3&4, Lado B top), [3]=M100 (11-jul 18:00, Llaves 7&8, Lado B bot)
  //
  // SF sorted:  [0]=M101 (Lado A: M97 vs M98), [1]=M102 (Lado B: M99 vs M100)

  // LEFT side (Lado A): Llaves 1,2 top + Llaves 5,6 bottom
  const r16L = [r16All[0], r16All[1], r16All[4], r16All[5]];
  const qfL  = [qfAll[0], qfAll[1]]; // M97, M98
  const sfL  = sfAll.slice(0, 1);    // M101

  // RIGHT side (Lado B): Llaves 3,4 top + Llaves 7,8 bottom
  const sfR  = sfAll.slice(1, 2);    // M102
  const qfR  = [qfAll[2], qfAll[3]]; // M99, M100
  const r16R = [r16All[2], r16All[3], r16All[6], r16All[7]];

  return (
    <>
      <h1 style={{
        fontFamily: Theme.Typography.fontFamilyDisplay,
        fontSize: isMobile
          ? Theme.Typography.headlineLgMobile.fontSize
          : Theme.Typography.displayLg.fontSize,
        lineHeight: isMobile
          ? Theme.Typography.headlineLgMobile.lineHeight
          : Theme.Typography.displayLg.lineHeight,
        fontWeight: Theme.Typography.displayLg.fontWeight,
        color: Theme.Colors.onSurface,
        margin: 0,
        marginBottom: Theme.Spacing.sm,
      }}>
        Cuadro de Eliminación
      </h1>
      <p style={{
        fontFamily: Theme.Typography.fontFamilyBody,
        fontSize: Theme.Typography.bodyLg.fontSize,
        color: Theme.Colors.onSurfaceVariant,
        marginTop: 0,
        marginBottom: Theme.Spacing.xl,
      }}>
        Resultados de la fase eliminatoria del Mundial 2026.
      </p>

      {loading ? (
        <div style={{
          fontFamily: Theme.Typography.fontFamilyBody,
          color: Theme.Colors.onSurfaceVariant,
          padding: Theme.Spacing.lg,
          textAlign: 'center',
        }}>
          Cargando…
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: Theme.Spacing.xl }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 'max-content' }}>

            {/* ── R16 LEFT ── */}
            <MatchColumn label="Octavos" matches={r16L} />

            {/* R16L[0,1]→QFL[0]  and  R16L[2,3]→QFL[1] */}
            <Connector>
              {S(0, Y_R16[0], MID, Y_R16[0])}
              {S(0, Y_R16[1], MID, Y_R16[1])}
              {S(MID, Y_R16[0], MID, Y_R16[1])}
              {S(MID, Y_QF[0], CG, Y_QF[0])}

              {S(0, Y_R16[2], MID, Y_R16[2])}
              {S(0, Y_R16[3], MID, Y_R16[3])}
              {S(MID, Y_R16[2], MID, Y_R16[3])}
              {S(MID, Y_QF[1], CG, Y_QF[1])}
            </Connector>

            {/* ── QF LEFT ── */}
            <MatchColumn label="Cuartos" matches={qfL} />

            {/* QFL[0,1]→SFL */}
            <Connector>
              {S(0, Y_QF[0], MID, Y_QF[0])}
              {S(0, Y_QF[1], MID, Y_QF[1])}
              {S(MID, Y_QF[0], MID, Y_QF[1])}
              {S(MID, Y_SF, CG, Y_SF)}
            </Connector>

            {/* ── SF LEFT ── */}
            <MatchColumn label="Semis" matches={sfL} />

            {/* SFL→FINAL (horizontal, both at Y_SF=360) */}
            <Connector>
              {S(0, Y_SF, CG, Y_SF)}
            </Connector>

            {/* ── FINAL (center) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <PhaseLabel label="Final" />
              <div style={{
                height: BH,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: Theme.Spacing.sm,
              }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1", color: Theme.Colors.primary }}
                >
                  emoji_events
                </span>
                <BracketMatchCard match={finMatch} isFinal />
                <div style={{
                  marginTop: Theme.Spacing.lg,
                  fontFamily: Theme.Typography.fontFamilyBody,
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: Theme.Colors.onSurfaceVariant,
                }}>
                  3er Lugar
                </div>
                <BracketMatchCard match={tpMatch} />
              </div>
            </div>

            {/* FINAL→SFR (horizontal) */}
            <Connector>
              {S(0, Y_SF, CG, Y_SF)}
            </Connector>

            {/* ── SF RIGHT ── */}
            <MatchColumn label="Semis" matches={sfR} />

            {/* SFR→QFR[0,1] (fan-out) */}
            <Connector>
              {S(0, Y_SF, MID, Y_SF)}
              {S(MID, Y_QF[0], MID, Y_QF[1])}
              {S(MID, Y_QF[0], CG, Y_QF[0])}
              {S(MID, Y_QF[1], CG, Y_QF[1])}
            </Connector>

            {/* ── QF RIGHT ── */}
            <MatchColumn label="Cuartos" matches={qfR} />

            {/* QFR[0]→R16R[0,1]  and  QFR[1]→R16R[2,3] (fan-out) */}
            <Connector>
              {S(0, Y_QF[0], MID, Y_QF[0])}
              {S(MID, Y_R16[0], MID, Y_R16[1])}
              {S(MID, Y_R16[0], CG, Y_R16[0])}
              {S(MID, Y_R16[1], CG, Y_R16[1])}

              {S(0, Y_QF[1], MID, Y_QF[1])}
              {S(MID, Y_R16[2], MID, Y_R16[3])}
              {S(MID, Y_R16[2], CG, Y_R16[2])}
              {S(MID, Y_R16[3], CG, Y_R16[3])}
            </Connector>

            {/* ── R16 RIGHT ── */}
            <MatchColumn label="Octavos" matches={r16R} />

          </div>
        </div>
      )}
    </>
  );
};
