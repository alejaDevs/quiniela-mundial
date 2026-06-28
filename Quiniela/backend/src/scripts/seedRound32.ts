import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "../config/Database";
import { MatchModel, IMatch } from "../models/Match";

dotenv.config();

type SeedMatch = Pick<
  IMatch,
  "homeTeam" | "awayTeam" | "stage" | "groupLabel" | "kickoffDate"
>;

// Guatemala is UTC-6. Times with "TBC" use a placeholder confirmed later by admin.
const toDate = (dateStr: string, gtTime: string): Date =>
  new Date(`${dateStr}T${gtTime}:00-06:00`);

const ISO: Record<string, string> = {
  "Sudáfrica": "za",
  "Canadá": "ca",
  "Países Bajos": "nl",
  "Marruecos": "ma",
  "Alemania": "de",
  "Paraguay": "py",
  "Francia": "fr",
  "Suecia": "se",
  "Brasil": "br",
  "Japón": "jp",
  "Costa de Marfil": "ci",
  "Noruega": "no",
  "México": "mx",
  "Ecuador": "ec",
  "Inglaterra": "gb-eng",
  "Rep. Dem. del Congo": "cd",
  "Portugal": "pt",
  "Croacia": "hr",
  "España": "es",
  "Austria": "at",
  "Estados Unidos": "us",
  "Bosnia y Herzegovina": "ba",
  "Bélgica": "be",
  "Senegal": "sn",
  "Argentina": "ar",
  "Cabo Verde": "cv",
  "Australia": "au",
  "Egipto": "eg",
  "Suiza": "ch",
  "Argelia": "dz",
  "Colombia": "co",
  "Ghana": "gh",
};

const team = (name: string) => ({ name, countryCode: ISO[name] ?? "un" });

const ROUND_32_MATCHES: SeedMatch[] = [
  // ── Lado A ──────────────────────────────────────────────────────────────────
  { homeTeam: team("Sudáfrica"),            awayTeam: team("Canadá"),                stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-06-28", "15:00") },
  { homeTeam: team("Países Bajos"),         awayTeam: team("Marruecos"),             stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-06-29", "19:00") },
  { homeTeam: team("Alemania"),             awayTeam: team("Paraguay"),              stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-06-29", "14:30") },
  { homeTeam: team("Francia"),              awayTeam: team("Suecia"),                stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-06-30", "15:00") },
  { homeTeam: team("Brasil"),               awayTeam: team("Japón"),                 stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-06-29", "11:00") },
  { homeTeam: team("Costa de Marfil"),      awayTeam: team("Noruega"),               stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-06-30", "11:00") },
  { homeTeam: team("México"),               awayTeam: team("Ecuador"),               stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-06-30", "19:00") },
  { homeTeam: team("Inglaterra"),           awayTeam: team("Rep. Dem. del Congo"),   stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-07-01", "10:00") },
  // ── Lado B ──────────────────────────────────────────────────────────────────
  { homeTeam: team("Portugal"),             awayTeam: team("Croacia"),               stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-07-02", "17:00") },
  { homeTeam: team("España"),               awayTeam: team("Austria"),               stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-07-02", "13:00") },
  { homeTeam: team("Estados Unidos"),       awayTeam: team("Bosnia y Herzegovina"),  stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-07-01", "18:00") },
  { homeTeam: team("Bélgica"),              awayTeam: team("Senegal"),               stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-07-01", "14:00") },
  { homeTeam: team("Argentina"),            awayTeam: team("Cabo Verde"),            stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-07-03", "20:00") }, // hora TBC
  { homeTeam: team("Australia"),            awayTeam: team("Egipto"),                stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-07-03", "12:00") },
  { homeTeam: team("Suiza"),                awayTeam: team("Argelia"),               stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-07-02", "21:00") },
  { homeTeam: team("Colombia"),             awayTeam: team("Ghana"),                 stage: "round_of_32", groupLabel: null, kickoffDate: toDate("2026-07-02", "09:00") }, // hora TBC
];

const seed = async (): Promise<void> => {
  const mongoUri: string = process.env.MONGODB_URI ?? "";
  await connectDatabase(mongoUri);

  // eslint-disable-next-line no-console
  console.log("[Seed32] Conectado a MongoDB");

  const deleted = await MatchModel.deleteMany({ stage: "round_of_32" });
  // eslint-disable-next-line no-console
  console.log(`[Seed32] Eliminados ${deleted.deletedCount ?? 0} partidos previos de round_of_32`);

  const inserted = await MatchModel.insertMany(
    ROUND_32_MATCHES.map(
      (match: SeedMatch): Partial<IMatch> => ({
        ...match,
        homeScore: null,
        awayScore: null,
        isFinished: false,
        apiFootballId: null,
      }),
    ),
  );

  // eslint-disable-next-line no-console
  console.log(`[Seed32] Insertados ${inserted.length} partidos de dieciseisavos de final`);

  await disconnectDatabase();
  // eslint-disable-next-line no-console
  console.log("[Seed32] Listo");
};

seed().catch((error: unknown): void => {
  // eslint-disable-next-line no-console
  console.error("[Seed32] Error:", error);
  process.exit(1);
});
