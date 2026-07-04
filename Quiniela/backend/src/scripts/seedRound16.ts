import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "../config/Database";
import { MatchModel, IMatch } from "../models/Match";

dotenv.config();

type SeedMatch = Pick<
  IMatch,
  "homeTeam" | "awayTeam" | "stage" | "groupLabel" | "kickoffDate" | "stadium" | "city"
>;

// Guatemala is UTC-6.
const toDate = (dateStr: string, gtTime: string): Date =>
  new Date(`${dateStr}T${gtTime}:00-06:00`);

const ISO: Record<string, string> = {
  "Paraguay": "py",
  "Francia": "fr",
  "Canadá": "ca",
  "Marruecos": "ma",
  "Brasil": "br",
  "Noruega": "no",
  "México": "mx",
  "Inglaterra": "gb-eng",
  "Portugal": "pt",
  "España": "es",
  "Estados Unidos": "us",
  "Bélgica": "be",
  "Argentina": "ar",
  "Egipto": "eg",
  "Suiza": "ch",
  "Colombia": "co",
};

const team = (name: string) => ({ name, countryCode: ISO[name] ?? "un" });
const tbd = (label: string) => ({ name: label, countryCode: "un" });

// ── Octavos de Final (Round of 16) ──────────────────────────────────────────
const ROUND_16_MATCHES: SeedMatch[] = [
  // Llave 1: Paraguay vs Francia → M97
  {
    homeTeam: team("Paraguay"),
    awayTeam: team("Francia"),
    stage: "round_of_16",
    groupLabel: null,
    kickoffDate: toDate("2026-07-04", "15:00"),
    stadium: "Estadio Filadelfia (Lincoln Financial Field)",
    city: "Filadelfia, Pensilvania",
  },
  // Llave 2: Canadá vs Marruecos → M97
  {
    homeTeam: team("Canadá"),
    awayTeam: team("Marruecos"),
    stage: "round_of_16",
    groupLabel: null,
    kickoffDate: toDate("2026-07-04", "11:00"),
    stadium: "Estadio Houston (NRG Stadium)",
    city: "Houston, Texas",
  },
  // Llave 3: Brasil vs Noruega → M99
  {
    homeTeam: team("Brasil"),
    awayTeam: team("Noruega"),
    stage: "round_of_16",
    groupLabel: null,
    kickoffDate: toDate("2026-07-05", "14:00"),
    stadium: "Estadio Nueva York Nueva Jersey (MetLife Stadium)",
    city: "East Rutherford, Nueva Jersey",
  },
  // Llave 4: México vs Inglaterra → M99
  {
    homeTeam: team("México"),
    awayTeam: team("Inglaterra"),
    stage: "round_of_16",
    groupLabel: null,
    kickoffDate: toDate("2026-07-05", "16:00"),
    stadium: "Estadio Ciudad de México (Estadio Azteca)",
    city: "Ciudad de México",
  },
  // Llave 5: Portugal vs España → M98
  {
    homeTeam: team("Portugal"),
    awayTeam: team("España"),
    stage: "round_of_16",
    groupLabel: null,
    kickoffDate: toDate("2026-07-06", "12:00"),
    stadium: "Estadio Dallas (AT&T Stadium)",
    city: "Arlington, Texas",
  },
  // Llave 6: Estados Unidos vs Bélgica → M98
  {
    homeTeam: team("Estados Unidos"),
    awayTeam: team("Bélgica"),
    stage: "round_of_16",
    groupLabel: null,
    kickoffDate: toDate("2026-07-06", "15:00"),
    stadium: "Estadio Seattle (Lumen Field)",
    city: "Seattle, Washington",
  },
  // Llave 7: Argentina vs Egipto → M100
  {
    homeTeam: team("Argentina"),
    awayTeam: team("Egipto"),
    stage: "round_of_16",
    groupLabel: null,
    kickoffDate: toDate("2026-07-07", "10:00"),
    stadium: "Estadio Atlanta (Mercedes-Benz Stadium)",
    city: "Atlanta, Georgia",
  },
  // Llave 8: Suiza vs Colombia → M100
  {
    homeTeam: team("Suiza"),
    awayTeam: team("Colombia"),
    stage: "round_of_16",
    groupLabel: null,
    kickoffDate: toDate("2026-07-07", "11:00"),
    stadium: "Estadio BC Place Vancouver",
    city: "Vancouver, Canadá",
  },
];

// ── Cuartos de Final ─────────────────────────────────────────────────────────
// M97: Ganador Llave 1 vs Ganador Llave 2 (Paraguay/Francia vs Canadá/Marruecos)
// M98: Ganador Llave 5 vs Ganador Llave 6 (Portugal/España vs USA/Bélgica)
// M99: Ganador Llave 3 vs Ganador Llave 4 (Brasil/Noruega vs México/Inglaterra)
// M100: Ganador Llave 7 vs Ganador Llave 8 (Argentina/Egipto vs Suiza/Colombia)
const QUARTER_FINAL_MATCHES: SeedMatch[] = [
  {
    homeTeam: tbd("G. Llave 1"),
    awayTeam: tbd("G. Llave 2"),
    stage: "quarter_final",
    groupLabel: null,
    kickoffDate: toDate("2026-07-10", "15:00"),
    stadium: "Estadio Filadelfia (Lincoln Financial Field)",
    city: "Filadelfia, Pensilvania",
  },
  {
    homeTeam: tbd("G. Llave 5"),
    awayTeam: tbd("G. Llave 6"),
    stage: "quarter_final",
    groupLabel: null,
    kickoffDate: toDate("2026-07-11", "15:00"),
    stadium: "Estadio Dallas (AT&T Stadium)",
    city: "Arlington, Texas",
  },
  {
    homeTeam: tbd("G. Llave 3"),
    awayTeam: tbd("G. Llave 4"),
    stage: "quarter_final",
    groupLabel: null,
    kickoffDate: toDate("2026-07-10", "11:00"),
    stadium: "Estadio Nueva York Nueva Jersey (MetLife Stadium)",
    city: "East Rutherford, Nueva Jersey",
  },
  {
    homeTeam: tbd("G. Llave 7"),
    awayTeam: tbd("G. Llave 8"),
    stage: "quarter_final",
    groupLabel: null,
    kickoffDate: toDate("2026-07-11", "11:00"),
    stadium: "Estadio Los Ángeles (SoFi Stadium)",
    city: "Inglewood, California",
  },
];

// ── Semifinales ──────────────────────────────────────────────────────────────
// SF1: Ganador M97 (Llave 1/2) vs Ganador M98 (Llave 5/6)
// SF2: Ganador M99 (Llave 3/4) vs Ganador M100 (Llave 7/8)
const SEMI_FINAL_MATCHES: SeedMatch[] = [
  {
    homeTeam: tbd("G. Cuarto 1"),
    awayTeam: tbd("G. Cuarto 2"),
    stage: "semi_final",
    groupLabel: null,
    kickoffDate: toDate("2026-07-14", "15:00"),
    stadium: "Estadio Nueva York Nueva Jersey (MetLife Stadium)",
    city: "East Rutherford, Nueva Jersey",
  },
  {
    homeTeam: tbd("G. Cuarto 3"),
    awayTeam: tbd("G. Cuarto 4"),
    stage: "semi_final",
    groupLabel: null,
    kickoffDate: toDate("2026-07-15", "15:00"),
    stadium: "Estadio Dallas (AT&T Stadium)",
    city: "Arlington, Texas",
  },
];

// ── Tercer Lugar ─────────────────────────────────────────────────────────────
const THIRD_PLACE_MATCHES: SeedMatch[] = [
  {
    homeTeam: tbd("P. Semi 1"),
    awayTeam: tbd("P. Semi 2"),
    stage: "third_place",
    groupLabel: null,
    kickoffDate: toDate("2026-07-18", "14:00"),
    stadium: "Estadio Miami (Hard Rock Stadium)",
    city: "Miami Gardens, Florida",
  },
];

// ── Final ────────────────────────────────────────────────────────────────────
const FINAL_MATCHES: SeedMatch[] = [
  {
    homeTeam: tbd("G. Semi 1"),
    awayTeam: tbd("G. Semi 2"),
    stage: "final",
    groupLabel: null,
    kickoffDate: toDate("2026-07-19", "15:00"),
    stadium: "Estadio Nueva York Nueva Jersey (MetLife Stadium)",
    city: "East Rutherford, Nueva Jersey",
  },
];

const ALL_STAGES = [
  "round_of_16",
  "quarter_final",
  "semi_final",
  "third_place",
  "final",
] as const;

const seed = async (): Promise<void> => {
  const mongoUri: string = process.env.MONGODB_URI ?? "";
  await connectDatabase(mongoUri);

  // eslint-disable-next-line no-console
  console.log("[SeedR16] Conectado a MongoDB");

  const deleted = await MatchModel.deleteMany({ stage: { $in: ALL_STAGES } });
  // eslint-disable-next-line no-console
  console.log(`[SeedR16] Eliminados ${deleted.deletedCount ?? 0} partidos previos`);

  const allMatches = [
    ...ROUND_16_MATCHES,
    ...QUARTER_FINAL_MATCHES,
    ...SEMI_FINAL_MATCHES,
    ...THIRD_PLACE_MATCHES,
    ...FINAL_MATCHES,
  ];

  const inserted = await MatchModel.insertMany(
    allMatches.map(
      (match: SeedMatch): Partial<IMatch> => ({
        ...match,
        homeScore: null,
        awayScore: null,
        isFinished: false,
        apiFootballId: null,
      }),
    ),
  );

  const counts = {
    round_of_16: ROUND_16_MATCHES.length,
    quarter_final: QUARTER_FINAL_MATCHES.length,
    semi_final: SEMI_FINAL_MATCHES.length,
    third_place: THIRD_PLACE_MATCHES.length,
    final: FINAL_MATCHES.length,
  };

  // eslint-disable-next-line no-console
  console.log(`[SeedR16] Insertados ${inserted.length} partidos:`);
  // eslint-disable-next-line no-console
  Object.entries(counts).forEach(([stage, count]) =>
    console.log(`  • ${stage}: ${count}`),
  );

  await disconnectDatabase();
  // eslint-disable-next-line no-console
  console.log("[SeedR16] Listo");
};

seed().catch((error: unknown): void => {
  // eslint-disable-next-line no-console
  console.error("[SeedR16] Error:", error);
  process.exit(1);
});
