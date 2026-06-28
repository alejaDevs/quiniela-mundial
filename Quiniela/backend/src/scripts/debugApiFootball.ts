import dotenv from "dotenv";

dotenv.config();

const API_BASE = "https://v3.football.api-sports.io";
const LEAGUE_ID = process.env.API_FOOTBALL_LEAGUE_ID ?? "1";
const SEASON = process.env.API_FOOTBALL_SEASON ?? "2026";

const run = async (): Promise<void> => {
  const url = new URL(`${API_BASE}/fixtures`);
  url.searchParams.set("league", LEAGUE_ID);
  url.searchParams.set("season", SEASON);

  // eslint-disable-next-line no-console
  console.log(`[Debug] GET ${url.toString()}\n`);

  const response = await fetch(url.toString(), {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY ?? "" },
  });

  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error(`[Debug] HTTP ${response.status}`);
    return;
  }

  const body = await response.json() as {
    results: number;
    response: Array<{
      fixture: { id: number; date: string; status: { short: string } };
      league: { id: number; round: string };
      teams: { home: { name: string }; away: { name: string } };
    }>;
  };

  // eslint-disable-next-line no-console
  console.log(`[Debug] Total fixtures recibidos: ${body.results}\n`);

  const rounds = [...new Set(body.response.map(f => f.league.round))].sort();
  // eslint-disable-next-line no-console
  console.log("[Debug] Rondas disponibles:");
  rounds.forEach(r => {
    const count = body.response.filter(f => f.league.round === r).length;
    // eslint-disable-next-line no-console
    console.log(`  "${r}" → ${count} partido(s)`);
  });

  // eslint-disable-next-line no-console
  console.log("\n[Debug] Partidos NO de fase de grupos:");
  const knockouts = body.response.filter(f => !f.league.round.startsWith("Group Stage"));
  if (knockouts.length === 0) {
    // eslint-disable-next-line no-console
    console.log("  (ninguno todavía)");
  } else {
    knockouts.slice(0, 10).forEach(f => {
      // eslint-disable-next-line no-console
      console.log(
        `  [${f.league.round}] ${f.teams.home.name} vs ${f.teams.away.name} | status: ${f.fixture.status.short} | date: ${f.fixture.date}`,
      );
    });
  }
};

run().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error("[Debug] Error:", err);
  process.exit(1);
});
