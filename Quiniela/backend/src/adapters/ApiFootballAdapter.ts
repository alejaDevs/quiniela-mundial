import type { IMatchTeam, MatchStage } from "../models/Match";

interface ApiFixtureStatus {
  short: string;
  elapsed: number | null;
}

interface ApiTeam {
  id: number;
  name: string;
}

interface ApiLeague {
  id: number;
  round: string;
}

interface ApiGoals {
  home: number | null;
  away: number | null;
}

export interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: ApiFixtureStatus;
  };
  league: ApiLeague;
  teams: {
    home: ApiTeam;
    away: ApiTeam;
  };
  goals: ApiGoals;
}

export interface ApiFootballResponse {
  response: ApiFixture[];
}

export interface ScoreUpdateDto {
  apiFootballId: number;
  homeScore: number | null;
  awayScore: number | null;
  isFinished: boolean;
}

export interface KnockoutTeamsDto {
  apiFootballId: number;
  kickoffDate: Date;
  homeTeam: IMatchTeam;
  awayTeam: IMatchTeam;
  stage: MatchStage;
}

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

const ROUND_TO_STAGE: Readonly<Record<string, MatchStage>> = {
  "Round of 32": "round_of_32",
  "Round of 16": "round_of_16",
  "Quarter-finals": "quarter_final",
  "Semi-finals": "semi_final",
  "3rd Place Final": "third_place",
  Final: "final",
};

const EN_TO_ES: Readonly<Record<string, string>> = {
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
  "United States": "Estados Unidos",
  Paraguay: "Paraguay",
  Australia: "Australia",
  Turkey: "Turquía",
  Germany: "Alemania",
  "Curaçao": "Curazao",
  "Ivory Coast": "Costa de Marfil",
  "Côte d'Ivoire": "Costa de Marfil",
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
  "Congo DR": "RD Congo",
  Uzbekistan: "Uzbekistán",
  Colombia: "Colombia",
  England: "Inglaterra",
  Ghana: "Ghana",
  Panama: "Panamá",
  Croatia: "Croacia",
};

const ISO: Readonly<Record<string, string>> = {
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
  "United States": "us",
  Paraguay: "py",
  Australia: "au",
  Turkey: "tr",
  Germany: "de",
  "Curaçao": "cw",
  "Ivory Coast": "ci",
  "Côte d'Ivoire": "ci",
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
  "Congo DR": "cd",
  Uzbekistan: "uz",
  Colombia: "co",
  England: "gb-eng",
  Ghana: "gh",
  Panama: "pa",
  Croatia: "hr",
};

export function resolveMatchTeam(apiTeamName: string): IMatchTeam {
  return {
    name: EN_TO_ES[apiTeamName] ?? apiTeamName,
    countryCode: ISO[apiTeamName] ?? apiTeamName.slice(0, 3).toLowerCase(),
  };
}

export function toScoreUpdateDto(fixture: ApiFixture): ScoreUpdateDto {
  return {
    apiFootballId: fixture.fixture.id,
    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,
    isFinished: FINISHED_STATUSES.has(fixture.fixture.status.short),
  };
}

export function toKnockoutTeamsDto(fixture: ApiFixture): KnockoutTeamsDto | null {
  const stage = ROUND_TO_STAGE[fixture.league.round];
  if (stage === undefined) return null;

  const { name: homeName } = fixture.teams.home;
  const { name: awayName } = fixture.teams.away;

  if (homeName === "TBD" || awayName === "TBD") return null;

  return {
    apiFootballId: fixture.fixture.id,
    kickoffDate: new Date(fixture.fixture.date),
    homeTeam: resolveMatchTeam(homeName),
    awayTeam: resolveMatchTeam(awayName),
    stage,
  };
}
