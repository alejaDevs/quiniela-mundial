import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "../config/Database";
import { MatchModel, IMatch } from "../models/Match";

dotenv.config();

type SeedMatch = Pick<
  IMatch,
  "homeTeam" | "awayTeam" | "stage" | "groupLabel" | "kickoffDate"
>;

const parseDateTime = (dateStr: string, timeStr: string): Date => {
  const timePart = timeStr.split(" ")[0];
  const offsetPart = timeStr.split(" ")[1].replace("UTC", "");

  const sign = offsetPart.startsWith("-") ? "-" : "+";
  const numericHour = offsetPart.replace(/[-+]/, "");
  const paddedHour = numericHour.padStart(2, "0");

  return new Date(`${dateStr}T${timePart}:00${sign}${paddedHour}:00`);
};

const RAW_CALENDAR = [
  {
    date: "2026-06-11",
    time: "13:00 UTC-6",
    t1: "Mexico",
    t2: "South Africa",
    g: "A",
  },
  {
    date: "2026-06-11",
    time: "20:00 UTC-6",
    t1: "South Korea",
    t2: "Czech Republic",
    g: "A",
  },
  {
    date: "2026-06-18",
    time: "12:00 UTC-4",
    t1: "Czech Republic",
    t2: "South Africa",
    g: "A",
  },
  {
    date: "2026-06-18",
    time: "19:00 UTC-6",
    t1: "Mexico",
    t2: "South Korea",
    g: "A",
  },
  {
    date: "2026-06-24",
    time: "19:00 UTC-6",
    t1: "Czech Republic",
    t2: "Mexico",
    g: "A",
  },
  {
    date: "2026-06-24",
    time: "19:00 UTC-6",
    t1: "South Africa",
    t2: "South Korea",
    g: "A",
  },
  {
    date: "2026-06-12",
    time: "15:00 UTC-4",
    t1: "Canada",
    t2: "Bosnia & Herzegovina",
    g: "B",
  },
  {
    date: "2026-06-13",
    time: "12:00 UTC-7",
    t1: "Qatar",
    t2: "Switzerland",
    g: "B",
  },
  {
    date: "2026-06-18",
    time: "12:00 UTC-7",
    t1: "Switzerland",
    t2: "Bosnia & Herzegovina",
    g: "B",
  },
  {
    date: "2026-06-18",
    time: "15:00 UTC-7",
    t1: "Canada",
    t2: "Qatar",
    g: "B",
  },
  {
    date: "2026-06-24",
    time: "12:00 UTC-7",
    t1: "Switzerland",
    t2: "Canada",
    g: "B",
  },
  {
    date: "2026-06-24",
    time: "12:00 UTC-7",
    t1: "Bosnia & Herzegovina",
    t2: "Qatar",
    g: "B",
  },
  {
    date: "2026-06-13",
    time: "18:00 UTC-4",
    t1: "Brazil",
    t2: "Morocco",
    g: "C",
  },
  {
    date: "2026-06-13",
    time: "21:00 UTC-4",
    t1: "Haiti",
    t2: "Scotland",
    g: "C",
  },
  {
    date: "2026-06-19",
    time: "18:00 UTC-4",
    t1: "Scotland",
    t2: "Morocco",
    g: "C",
  },
  {
    date: "2026-06-19",
    time: "20:30 UTC-4",
    t1: "Brazil",
    t2: "Haiti",
    g: "C",
  },
  {
    date: "2026-06-24",
    time: "18:00 UTC-4",
    t1: "Scotland",
    t2: "Brazil",
    g: "C",
  },
  {
    date: "2026-06-24",
    time: "18:00 UTC-4",
    t1: "Morocco",
    t2: "Haiti",
    g: "C",
  },
  {
    date: "2026-06-12",
    time: "18:00 UTC-7",
    t1: "USA",
    t2: "Paraguay",
    g: "D",
  },
  {
    date: "2026-06-13",
    time: "21:00 UTC-7",
    t1: "Australia",
    t2: "Turkey",
    g: "D",
  },
  {
    date: "2026-06-19",
    time: "12:00 UTC-7",
    t1: "USA",
    t2: "Australia",
    g: "D",
  },
  {
    date: "2026-06-19",
    time: "20:00 UTC-7",
    t1: "Turkey",
    t2: "Paraguay",
    g: "D",
  },
  { date: "2026-06-25", time: "19:00 UTC-7", t1: "Turkey", t2: "USA", g: "D" },
  {
    date: "2026-06-25",
    time: "19:00 UTC-7",
    t1: "Paraguay",
    t2: "Australia",
    g: "D",
  },
  {
    date: "2026-06-14",
    time: "12:00 UTC-5",
    t1: "Germany",
    t2: "Curaçao",
    g: "E",
  },
  {
    date: "2026-06-14",
    time: "19:00 UTC-4",
    t1: "Ivory Coast",
    t2: "Ecuador",
    g: "E",
  },
  {
    date: "2026-06-20",
    time: "16:00 UTC-4",
    t1: "Germany",
    t2: "Ivory Coast",
    g: "E",
  },
  {
    date: "2026-06-20",
    time: "19:00 UTC-5",
    t1: "Ecuador",
    t2: "Curaçao",
    g: "E",
  },
  {
    date: "2026-06-25",
    time: "16:00 UTC-4",
    t1: "Curaçao",
    t2: "Ivory Coast",
    g: "E",
  },
  {
    date: "2026-06-25",
    time: "16:00 UTC-4",
    t1: "Ecuador",
    t2: "Germany",
    g: "E",
  },
  {
    date: "2026-06-14",
    time: "15:00 UTC-5",
    t1: "Netherlands",
    t2: "Japan",
    g: "F",
  },
  {
    date: "2026-06-14",
    time: "20:00 UTC-6",
    t1: "Sweden",
    t2: "Tunisia",
    g: "F",
  },
  {
    date: "2026-06-20",
    time: "12:00 UTC-5",
    t1: "Netherlands",
    t2: "Sweden",
    g: "F",
  },
  {
    date: "2026-06-20",
    time: "22:00 UTC-6",
    t1: "Tunisia",
    t2: "Japan",
    g: "F",
  },
  {
    date: "2026-06-25",
    time: "18:00 UTC-5",
    t1: "Japan",
    t2: "Sweden",
    g: "F",
  },
  {
    date: "2026-06-25",
    time: "18:00 UTC-5",
    t1: "Tunisia",
    t2: "Netherlands",
    g: "F",
  },
  {
    date: "2026-06-15",
    time: "12:00 UTC-7",
    t1: "Belgium",
    t2: "Egypt",
    g: "G",
  },
  {
    date: "2026-06-15",
    time: "18:00 UTC-7",
    t1: "Iran",
    t2: "New Zealand",
    g: "G",
  },
  {
    date: "2026-06-21",
    time: "12:00 UTC-7",
    t1: "Belgium",
    t2: "Iran",
    g: "G",
  },
  {
    date: "2026-06-21",
    time: "18:00 UTC-7",
    t1: "New Zealand",
    t2: "Egypt",
    g: "G",
  },
  { date: "2026-06-26", time: "20:00 UTC-7", t1: "Egypt", t2: "Iran", g: "G" },
  {
    date: "2026-06-26",
    time: "20:00 UTC-7",
    t1: "New Zealand",
    t2: "Belgium",
    g: "G",
  },
  {
    date: "2026-06-15",
    time: "12:00 UTC-4",
    t1: "Spain",
    t2: "Cape Verde",
    g: "H",
  },
  {
    date: "2026-06-15",
    time: "18:00 UTC-4",
    t1: "Saudi Arabia",
    t2: "Uruguay",
    g: "H",
  },
  {
    date: "2026-06-21",
    time: "12:00 UTC-4",
    t1: "Spain",
    t2: "Saudi Arabia",
    g: "H",
  },
  {
    date: "2026-06-21",
    time: "18:00 UTC-4",
    t1: "Uruguay",
    t2: "Cape Verde",
    g: "H",
  },
  {
    date: "2026-06-26",
    time: "19:00 UTC-5",
    t1: "Cape Verde",
    t2: "Saudi Arabia",
    g: "H",
  },
  {
    date: "2026-06-26",
    time: "18:00 UTC-6",
    t1: "Uruguay",
    t2: "Spain",
    g: "H",
  },
  {
    date: "2026-06-16",
    time: "15:00 UTC-4",
    t1: "France",
    t2: "Senegal",
    g: "I",
  },
  { date: "2026-06-16", time: "18:00 UTC-4", t1: "Iraq", t2: "Norway", g: "I" },
  { date: "2026-06-22", time: "17:00 UTC-4", t1: "France", t2: "Iraq", g: "I" },
  {
    date: "2026-06-22",
    time: "20:00 UTC-4",
    t1: "Norway",
    t2: "Senegal",
    g: "I",
  },
  {
    date: "2026-06-26",
    time: "15:00 UTC-4",
    t1: "Norway",
    t2: "France",
    g: "I",
  },
  {
    date: "2026-06-26",
    time: "15:00 UTC-4",
    t1: "Senegal",
    t2: "Iraq",
    g: "I",
  },
  {
    date: "2026-06-16",
    time: "20:00 UTC-5",
    t1: "Argentina",
    t2: "Algeria",
    g: "J",
  },
  {
    date: "2026-06-16",
    time: "21:00 UTC-7",
    t1: "Austria",
    t2: "Jordan",
    g: "J",
  },
  {
    date: "2026-06-22",
    time: "12:00 UTC-5",
    t1: "Argentina",
    t2: "Austria",
    g: "J",
  },
  {
    date: "2026-06-22",
    time: "20:00 UTC-7",
    t1: "Jordan",
    t2: "Algeria",
    g: "J",
  },
  {
    date: "2026-06-27",
    time: "21:00 UTC-5",
    t1: "Algeria",
    t2: "Austria",
    g: "J",
  },
  {
    date: "2026-06-27",
    time: "21:00 UTC-5",
    t1: "Jordan",
    t2: "Argentina",
    g: "J",
  },
  {
    date: "2026-06-17",
    time: "12:00 UTC-5",
    t1: "Portugal",
    t2: "DR Congo",
    g: "K",
  },
  {
    date: "2026-06-17",
    time: "20:00 UTC-6",
    t1: "Uzbekistan",
    t2: "Colombia",
    g: "K",
  },
  {
    date: "2026-06-23",
    time: "12:00 UTC-5",
    t1: "Portugal",
    t2: "Uzbekistan",
    g: "K",
  },
  {
    date: "2026-06-23",
    time: "20:00 UTC-6",
    t1: "Colombia",
    t2: "DR Congo",
    g: "K",
  },
  {
    date: "2026-06-27",
    time: "19:30 UTC-4",
    t1: "Colombia",
    t2: "Portugal",
    g: "K",
  },
  {
    date: "2026-06-27",
    time: "19:30 UTC-4",
    t1: "DR Congo",
    t2: "Uzbekistan",
    g: "K",
  },
  {
    date: "2026-06-17",
    time: "15:00 UTC-5",
    t1: "England",
    t2: "Croatia",
    g: "L",
  },
  {
    date: "2026-06-17",
    time: "19:00 UTC-4",
    t1: "Ghana",
    t2: "Panama",
    g: "L",
  },
  {
    date: "2026-06-23",
    time: "16:00 UTC-4",
    t1: "England",
    t2: "Ghana",
    g: "L",
  },
  {
    date: "2026-06-23",
    time: "19:00 UTC-4",
    t1: "Panama",
    t2: "Croatia",
    g: "L",
  },
  {
    date: "2026-06-27",
    time: "17:00 UTC-4",
    t1: "Panama",
    t2: "England",
    g: "L",
  },
  {
    date: "2026-06-27",
    time: "17:00 UTC-4",
    t1: "Croatia",
    t2: "Ghana",
    g: "L",
  },
];

const ISO_MAP: Record<string, string> = {
  // Nombres en Inglés (RAW_CALENDAR)
  Mexico: "mx",
  "South Africa": "za",
  "South Korea": "kr",
  "Czech Republic": "cz",
  Canada: "ca",
  "Bosnia & Herzegovina": "ba",
  Qatar: "qa",
  Switzerland: "ch",
  Brazil: "br",
  Morocco: "ma",
  Haiti: "ht",
  Scotland: "gb-sct",
  USA: "us",
  Paraguay: "py",
  Australia: "au",
  Turkey: "tr",
  Germany: "de",
  Curaçao: "cw",
  "Ivory Coast": "ci",
  Ecuador: "ec",
  Netherlands: "nl",
  Japan: "jp",
  Sweden: "se",
  Tunisia: "tn",
  Belgium: "be",
  Egypt: "eg",
  Iran: "ir",
  "New Zealand": "nz",
  Spain: "es",
  "Cape Verde": "cv",
  "Saudi Arabia": "sa",
  Uruguay: "uy",
  France: "fr",
  Senegal: "sn",
  Iraq: "iq",
  Norway: "no",
  Argentina: "ar",
  Algeria: "dz",
  Austria: "at",
  Jordan: "jo",
  Portugal: "pt",
  "DR Congo": "cd",
  Uzbekistan: "uz",
  Colombia: "co",
  England: "gb-eng",
  Ghana: "gh",
  Panama: "pa",
  Croatia: "hr",
};

const EN_TO_ES_MAP: Record<string, string> = {
  Mexico: "México",
  "South Africa": "Sudáfrica",
  "South Korea": "Corea del Sur",
  "Czech Republic": "República Checa",
  Canada: "Canadá",
  "Bosnia & Herzegovina": "Bosnia y Herzegovina",
  Qatar: "Catar",
  Switzerland: "Suiza",
  Brazil: "Brasil",
  Morocco: "Marruecos",
  Haiti: "Haití",
  Scotland: "Escocia",
  USA: "Estados Unidos",
  Paraguay: "Paraguay",
  Australia: "Australia",
  Turkey: "Turquía",
  Germany: "Alemania",
  Curaçao: "Curazao",
  "Ivory Coast": "Costa de Marfil",
  Ecuador: "Ecuador",
  Netherlands: "Países Bajos",
  Japan: "Japón",
  Sweden: "Suecia",
  Tunisia: "Túnez",
  Belgium: "Bélgica",
  Egypt: "Egipto",
  Iran: "Irán",
  "New Zealand": "Nueva Zelanda",
  Spain: "España",
  "Cape Verde": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudita",
  Uruguay: "Uruguay",
  France: "Francia",
  Senegal: "Senegal",
  Iraq: "Irak",
  Norway: "Noruega",
  Argentina: "Argentina",
  Algeria: "Argelia",
  Austria: "Austria",
  Jordan: "Jordania",
  Portugal: "Portugal",
  "DR Congo": "RD Congo",
  Uzbekistan: "Uzbekistán",
  Colombia: "Colombia",
  England: "Inglaterra",
  Ghana: "Ghana",
  Panama: "Panamá",
  Croatia: "Croacia",
};

const SEED_MATCHES: SeedMatch[] = RAW_CALENDAR.map((m) => ({
  homeTeam: {
    name: EN_TO_ES_MAP[m.t1] ?? m.t1,
    countryCode: ISO_MAP[m.t1] ?? "un",
  },
  awayTeam: {
    name: EN_TO_ES_MAP[m.t2] ?? m.t2,
    countryCode: ISO_MAP[m.t2] ?? "un",
  },
  stage: "group",
  groupLabel: m.g,
  kickoffDate: parseDateTime(m.date, m.time),
}));

const seed = async (): Promise<void> => {
  const mongoUri: string = process.env.MONGODB_URI ?? "";
  await connectDatabase(mongoUri);

  // eslint-disable-next-line no-console
  console.log("[Seed] Connected to MongoDB");

  const deleted: { deletedCount?: number } = await MatchModel.deleteMany({});
  // eslint-disable-next-line no-console
  console.log(`[Seed] Removed ${deleted.deletedCount ?? 0} previous matches`);

  const inserted: IMatch[] = await MatchModel.insertMany(
    SEED_MATCHES.map(
      (match: SeedMatch): Partial<IMatch> => ({
        ...match,
        homeScore: null,
        awayScore: null,
        isFinished: false,
      }),
    ),
  );

  // eslint-disable-next-line no-console
  console.log(`[Seed] Inserted ${inserted.length} matches into the database.`);

  await disconnectDatabase();
  // eslint-disable-next-line no-console
  console.log("[Seed] Done");
};

seed().catch((error: unknown): void => {
  // eslint-disable-next-line no-console
  console.error("[Seed] Failed", error);
  process.exit(1);
});
