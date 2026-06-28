import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "../config/Database";
import { MatchModel } from "../models/Match";

dotenv.config();

const UPDATES = [
  {
    desc: "Sudáfrica vs Canadá  → 2026-06-28 13:00 GT",
    filter: { "homeTeam.name": "Sudáfrica", "awayTeam.name": "Canadá" },
    kickoffDate: new Date("2026-06-28T19:00:00Z"),
  },
  {
    desc: "Colombia vs Ghana   → 2026-07-03 19:30 GT",
    filter: { "homeTeam.name": "Colombia", "awayTeam.name": "Ghana" },
    kickoffDate: new Date("2026-07-04T01:30:00Z"),
  },
];

const run = async (): Promise<void> => {
  await connectDatabase(process.env.MONGODB_URI ?? "");
  // eslint-disable-next-line no-console
  console.log("[UpdateKickoffs] Conectado a MongoDB\n");

  for (const u of UPDATES) {
    const result = await MatchModel.updateOne(u.filter, { $set: { kickoffDate: u.kickoffDate } });
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
