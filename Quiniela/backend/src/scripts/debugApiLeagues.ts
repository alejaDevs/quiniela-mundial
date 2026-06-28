import dotenv from "dotenv";

dotenv.config();

const API_BASE = "https://v3.football.api-sports.io";

const run = async (): Promise<void> => {
  // 1. Check league 1 seasons
  const leagueUrl = new URL(`${API_BASE}/leagues`);
  leagueUrl.searchParams.set("id", "1");

  // eslint-disable-next-line no-console
  console.log(`[Debug] GET ${leagueUrl.toString()}\n`);

  const leagueRes = await fetch(leagueUrl.toString(), {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY ?? "" },
  });

  const leagueBody = await leagueRes.json() as {
    errors?: unknown;
    results: number;
    response: Array<{
      league: { id: number; name: string };
      seasons: Array<{ year: number; current: boolean }>;
    }>;
  };

  // eslint-disable-next-line no-console
  console.log("[Debug] Response headers status:", leagueRes.status);
  // eslint-disable-next-line no-console
  console.log("[Debug] Errors:", JSON.stringify(leagueBody.errors));
  // eslint-disable-next-line no-console
  console.log("[Debug] Results:", leagueBody.results);

  if (leagueBody.response.length > 0) {
    const league = leagueBody.response[0];
    // eslint-disable-next-line no-console
    console.log(`[Debug] Liga: ${league.league.name}`);
    // eslint-disable-next-line no-console
    console.log("[Debug] Temporadas disponibles:");
    league.seasons.forEach(s => {
      // eslint-disable-next-line no-console
      console.log(`  year=${s.year} current=${s.current}`);
    });
  }

  // 2. Search for World Cup by name
  // eslint-disable-next-line no-console
  console.log("\n[Debug] Buscando 'World Cup' en ligas...");
  const searchUrl = new URL(`${API_BASE}/leagues`);
  searchUrl.searchParams.set("search", "World Cup");
  searchUrl.searchParams.set("type", "cup");

  const searchRes = await fetch(searchUrl.toString(), {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY ?? "" },
  });
  const searchBody = await searchRes.json() as {
    results: number;
    response: Array<{
      league: { id: number; name: string };
      country: { name: string };
      seasons: Array<{ year: number; current: boolean }>;
    }>;
  };

  // eslint-disable-next-line no-console
  console.log(`[Debug] Ligas encontradas: ${searchBody.results}`);
  searchBody.response.slice(0, 5).forEach(l => {
    // eslint-disable-next-line no-console
    console.log(`  ID=${l.league.id} Name="${l.league.name}" Country="${l.country.name}"`);
    const currentSeason = l.seasons.find(s => s.current);
    if (currentSeason) {
      // eslint-disable-next-line no-console
      console.log(`    → Temporada activa: ${currentSeason.year}`);
    }
  });
};

run().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error("[Debug] Error:", err);
  process.exit(1);
});
