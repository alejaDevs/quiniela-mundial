import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "../config/Database";
import { MatchModel } from "../models/Match";
import { UserModel } from "../models/User";
import { PredictionModel } from "../models/Prediction";

dotenv.config();

// Match stored as homeTeam=Sudáfrica, awayTeam=Canadá
// User input format: "canadá X - Y sudáfrica"
//   → predictedAwayScore = X (Canadá, away)
//   → predictedHomeScore = Y (Sudáfrica, home)
const PREDICTIONS: Array<{
  identifier: string; // username OR displayName
  homeScore: number;  // Sudáfrica
  awayScore: number;  // Canadá
}> = [
  { identifier: "chernandez",      homeScore: 1, awayScore: 2 },
  { identifier: "EeHq",            homeScore: 1, awayScore: 2 },
  { identifier: "egarcia",         homeScore: 1, awayScore: 2 },
  { identifier: "J. Hernández",    homeScore: 3, awayScore: 1 },
  { identifier: "Diego Hernández", homeScore: 1, awayScore: 2 },
  { identifier: "mlopez",          homeScore: 3, awayScore: 1 },
  { identifier: "jlopez",          homeScore: 2, awayScore: 1 },
  { identifier: "Elfego",          homeScore: 2, awayScore: 2 },
  { identifier: "agarcia",         homeScore: 1, awayScore: 2 },
  { identifier: "diazj",           homeScore: 1, awayScore: 2 },
  { identifier: "EDUARDO",         homeScore: 3, awayScore: 2 },
  { identifier: "Maycol",          homeScore: 0, awayScore: 2 },
];

const run = async (): Promise<void> => {
  await connectDatabase(process.env.MONGODB_URI ?? "");
  // eslint-disable-next-line no-console
  console.log("[SeedPredictions] Conectado a MongoDB\n");

  // Find the match
  const match = await MatchModel.findOne({
    "homeTeam.name": "Sudáfrica",
    "awayTeam.name": "Canadá",
  });
  if (!match) {
    // eslint-disable-next-line no-console
    console.error("ERROR: Partido Sudáfrica vs Canadá no encontrado.");
    await disconnectDatabase();
    process.exit(1);
  }
  // eslint-disable-next-line no-console
  console.log(`Partido encontrado: ${match._id}  (resultado: ${match.homeScore}-${match.awayScore}, finished=${match.isFinished})\n`);

  let inserted = 0;
  let skipped = 0;
  let notFound = 0;

  for (const p of PREDICTIONS) {
    // Try username first (case-insensitive), then displayName
    let user = await UserModel.findOne({ username: new RegExp(`^${p.identifier}$`, "i") });
    if (!user) {
      user = await UserModel.findOne({ displayName: new RegExp(`^${p.identifier}$`, "i") });
    }

    if (!user) {
      // eslint-disable-next-line no-console
      console.log(`  [NO ENCONTRADO] "${p.identifier}"`);
      notFound++;
      continue;
    }

    // Check if prediction already exists
    const existing = await PredictionModel.findOne({ user: user._id, match: match._id });
    if (existing) {
      // eslint-disable-next-line no-console
      console.log(`  [YA EXISTE]    ${user.username} (${user.displayName})  →  ${existing.predictedHomeScore}-${existing.predictedAwayScore}`);
      skipped++;
      continue;
    }

    await PredictionModel.create({
      user: user._id,
      match: match._id,
      predictedHomeScore: p.homeScore,
      predictedAwayScore: p.awayScore,
    });
    // eslint-disable-next-line no-console
    console.log(`  [OK]           ${user.username} (${user.displayName})  →  Sudáfrica ${p.homeScore} - ${p.awayScore} Canadá`);
    inserted++;
  }

  // eslint-disable-next-line no-console
  console.log(`\nResumen: ${inserted} insertadas · ${skipped} ya existían · ${notFound} usuarios no encontrados`);
  await disconnectDatabase();
};

run().catch((e: unknown) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
