import { MatchModel } from "../models/Match";
import {
  resolveMatchTeam,
  toScoreUpdateDto,
  toKnockoutTeamsDto,
  type ApiFixture,
  type ApiFootballResponse,
  type KnockoutTeamsDto,
  type ScoreUpdateDto,
} from "../adapters/ApiFootballAdapter";

const API_BASE = "https://v3.football.api-sports.io";
const LEAGUE_ID = process.env.API_FOOTBALL_LEAGUE_ID ?? "1";
const SEASON = process.env.API_FOOTBALL_SEASON ?? "2026";
const KICKOFF_TOLERANCE_MS = 15 * 60 * 1000;

async function fetchFixtures(params: Record<string, string>): Promise<ApiFixture[]> {
  const url = new URL(`${API_BASE}/fixtures`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY ?? "" },
  });

  if (!response.ok) {
    throw new Error(`API-Football responded with HTTP ${response.status}`);
  }

  const body = (await response.json()) as ApiFootballResponse;
  return body.response;
}

export async function initializeApiFootballIds(): Promise<number> {
  const fixtures = await fetchFixtures({ league: LEAGUE_ID, season: SEASON });

  const groupFixtures = fixtures.filter((f) => f.league.round.startsWith("Group Stage"));

  const bulkOps = groupFixtures.map((fixture) => {
    const homeSpanishName = resolveMatchTeam(fixture.teams.home.name).name;
    const kickoff = new Date(fixture.fixture.date);

    return {
      updateOne: {
        filter: {
          "homeTeam.name": homeSpanishName,
          apiFootballId: null,
          kickoffDate: {
            $gte: new Date(kickoff.getTime() - KICKOFF_TOLERANCE_MS),
            $lte: new Date(kickoff.getTime() + KICKOFF_TOLERANCE_MS),
          },
        },
        update: { $set: { apiFootballId: fixture.fixture.id } },
      },
    };
  });

  if (bulkOps.length === 0) return 0;

  const result = await MatchModel.bulkWrite(bulkOps);
  return result.modifiedCount;
}

export async function syncLiveScores(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  const fixtures = await fetchFixtures({
    league: LEAGUE_ID,
    season: SEASON,
    date: today,
    status: "1H-HT-2H-ET-BT-P-INT-FT-AET-PEN",
  });

  const dtos: ScoreUpdateDto[] = fixtures
    .map(toScoreUpdateDto)
    .filter((dto) => dto.homeScore !== null || dto.awayScore !== null);

  if (dtos.length === 0) return 0;

  const bulkOps = dtos.map((dto) => ({
    updateOne: {
      filter: { apiFootballId: dto.apiFootballId },
      update: {
        $set: {
          homeScore: dto.homeScore,
          awayScore: dto.awayScore,
          isFinished: dto.isFinished,
        },
      },
    },
  }));

  const result = await MatchModel.bulkWrite(bulkOps);
  return result.modifiedCount;
}

export async function syncKnockoutTeams(): Promise<number> {
  const fixtures = await fetchFixtures({ league: LEAGUE_ID, season: SEASON });

  const dtos: KnockoutTeamsDto[] = fixtures
    .map(toKnockoutTeamsDto)
    .filter((dto): dto is KnockoutTeamsDto => dto !== null);

  if (dtos.length === 0) return 0;

  const bulkOps = dtos.map((dto) => ({
    updateOne: {
      filter: { apiFootballId: dto.apiFootballId },
      update: {
        $set: {
          homeTeam: dto.homeTeam,
          awayTeam: dto.awayTeam,
          stage: dto.stage,
          kickoffDate: dto.kickoffDate,
          apiFootballId: dto.apiFootballId,
        },
        $setOnInsert: {
          groupLabel: null,
          homeScore: null,
          awayScore: null,
          isFinished: false,
        },
      },
      upsert: true,
    },
  }));

  const result = await MatchModel.bulkWrite(bulkOps);
  return result.modifiedCount + result.upsertedCount;
}
