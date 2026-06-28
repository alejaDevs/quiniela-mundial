import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "../config/Database";
import { syncKnockoutTeams } from "../services/SyncService";

dotenv.config();

const run = async (): Promise<void> => {
  const mongoUri: string = process.env.MONGODB_URI ?? "";
  await connectDatabase(mongoUri);

  // eslint-disable-next-line no-console
  console.log("[SyncKnockout] Conectado a MongoDB");
  // eslint-disable-next-line no-console
  console.log("[SyncKnockout] Consultando API-Football…");

  const upserted = await syncKnockoutTeams();

  // eslint-disable-next-line no-console
  console.log(`[SyncKnockout] Listo — ${upserted} partidos creados/actualizados`);

  await disconnectDatabase();
};

run().catch((error: unknown): void => {
  // eslint-disable-next-line no-console
  console.error("[SyncKnockout] Error:", error);
  process.exit(1);
});
