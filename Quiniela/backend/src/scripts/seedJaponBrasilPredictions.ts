import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "../config/Database";
import { MatchModel } from "../models/Match";
import { UserModel } from "../models/User";
import { PredictionModel } from "../models/Prediction";

dotenv.config();

// Match stored as homeTeam=Brasil, awayTeam=Japón
// Prediction: Brasil 2 - 1 Japón (a favor de Brasil)
const PREDICTIONS: Array<{
  identifier: string; // username OR displayName
  homeScore: number;  // Brasil
  awayScore: number;  // Japón
}> = [
  { identifier: "chernandez", homeScore: 2, awayScore: 1 },
];

const run = async (): Promise<void> => {
  await connectDatabase(process.env.MONGODB_URI ?? "");
  // eslint-disable-next-line no-console
  console.log("[SeedPredictions] Conectado a MongoDB\n");

  const match = await MatchModel.findOne({
    "homeTeam.name": "Brasil",
    "awayTeam.name": "Japón",
  });
  if (!match) {
    // eslint-disable-next-line no-console
    console.error("ERROR: Partido Brasil vs Japón no encontrado.");
    await disconnectDatabase();
    process.exit(1);
  }
  // eslint-disable-next-line no-console
  console.log(`Partido encontrado: ${match._id}  (resultado: ${match.homeScore}-${match.awayScore}, finished=${match.isFinished})\n`);

  let inserted = 0;
  let skipped = 0;
  let notFound = 0;

  for (const p of PREDICTIONS) {
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
    console.log(`  [OK]           ${user.username} (${user.displayName})  →  Brasil ${p.homeScore} - ${p.awayScore} Japón`);
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
