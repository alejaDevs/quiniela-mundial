import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "../config/Database";
import { MatchModel } from "../models/Match";

dotenv.config();

const UPDATES: Array<{
  desc: string;
  filter: Record<string, unknown>;
  set: Record<string, unknown>;
}> = [
  {
    desc: "Sudáfrica vs Canadá  → 2026-06-28 13:00 GT",
    filter: { "homeTeam.name": "Sudáfrica", "awayTeam.name": "Canadá" },
    set: { kickoffDate: new Date("2026-06-28T19:00:00Z") },
  },
  {
    desc: "Colombia vs Ghana   → 2026-07-03 19:30 GT",
    filter: { "homeTeam.name": "Colombia", "awayTeam.name": "Ghana" },
    set: { kickoffDate: new Date("2026-07-04T01:30:00Z") },
  },
  // ── Cuartos de Final ──────────────────────────────────────────────────────
  {
    desc: "M97 QF1 → 2026-07-09 14:00 GT, Boston (Gillette Stadium)",
    filter: { stage: "quarter_final", kickoffDate: new Date("2026-07-10T21:00:00Z") },
    set: {
      kickoffDate: new Date("2026-07-09T14:00:00-06:00"),
      stadium: "Estadio Boston (Gillette Stadium)",
      city: "Foxborough, Massachusetts",
    },
  },
  {
    desc: "M98 QF2 → 2026-07-10 18:00 GT, Los Ángeles (SoFi Stadium)",
    filter: { stage: "quarter_final", kickoffDate: new Date("2026-07-11T21:00:00Z") },
    set: {
      kickoffDate: new Date("2026-07-10T18:00:00-06:00"),
      stadium: "Estadio Los Ángeles (SoFi Stadium)",
      city: "Inglewood, California",
    },
  },
  {
    desc: "M99 QF3 → 2026-07-11 14:00 GT, Miami (Hard Rock Stadium)",
    filter: { stage: "quarter_final", kickoffDate: new Date("2026-07-10T17:00:00Z") },
    set: {
      kickoffDate: new Date("2026-07-11T14:00:00-06:00"),
      stadium: "Estadio Miami (Hard Rock Stadium)",
      city: "Miami Gardens, Florida",
    },
  },
  {
    desc: "M100 QF4 → 2026-07-11 18:00 GT, Kansas City (Arrowhead Stadium)",
    filter: { stage: "quarter_final", kickoffDate: new Date("2026-07-11T17:00:00Z") },
    set: {
      kickoffDate: new Date("2026-07-11T18:00:00-06:00"),
      stadium: "Estadio Kansas City (Arrowhead Stadium)",
      city: "Kansas City, Misuri",
    },
  },
  // ── Semifinales ───────────────────────────────────────────────────────────
  {
    desc: "M101 SF1 → 2026-07-14 18:00 GT, Dallas (AT&T Stadium)",
    filter: { stage: "semi_final", kickoffDate: new Date("2026-07-14T21:00:00Z") },
    set: {
      kickoffDate: new Date("2026-07-14T18:00:00-06:00"),
      stadium: "Estadio Dallas (AT&T Stadium)",
      city: "Arlington, Texas",
    },
  },
  {
    desc: "M102 SF2 → 2026-07-15 18:00 GT, Atlanta (Mercedes-Benz Stadium)",
    filter: { stage: "semi_final", kickoffDate: new Date("2026-07-15T21:00:00Z") },
    set: {
      kickoffDate: new Date("2026-07-15T18:00:00-06:00"),
      stadium: "Estadio Atlanta (Mercedes-Benz Stadium)",
      city: "Atlanta, Georgia",
    },
  },
  // ── Final ─────────────────────────────────────────────────────────────────
  {
    desc: "M104 Final → 2026-07-19 13:00 GT, Nueva York Nueva Jersey (MetLife Stadium)",
    filter: { stage: "final", kickoffDate: new Date("2026-07-19T21:00:00Z") },
    set: {
      kickoffDate: new Date("2026-07-19T13:00:00-06:00"),
    },
  },
];

const run = async (): Promise<void> => {
  await connectDatabase(process.env.MONGODB_URI ?? "");
  // eslint-disable-next-line no-console
  console.log("[UpdateKickoffs] Conectado a MongoDB\n");

  for (const u of UPDATES) {
    const result = await MatchModel.updateOne(u.filter, { $set: u.set });
    // eslint-disable-next-line no-console
    console.log(`${u.desc}  →  matched=${result.matchedCount}  modified=${result.modifiedCount}`);
  }

  await disconnectDatabase();
  // eslint-disable-next-line no-console
  console.log("\n[UpdateKickoffs] Listo");
};

run().catch((e: unknown) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
