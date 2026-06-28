import cron from "node-cron";
import { syncKnockoutTeams } from "../services/SyncService";

export const startKnockoutSyncCron = (): void => {
  cron.schedule("0 6 * * *", async (): Promise<void> => {
    try {
      const upserted = await syncKnockoutTeams();
      if (upserted > 0) {
        // eslint-disable-next-line no-console
        console.log(`[KnockoutSync] ${upserted} partidos actualizados`);
      }
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error("[KnockoutSync] Error al sincronizar:", error);
    }
  });
};
