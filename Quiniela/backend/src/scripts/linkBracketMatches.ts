import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "../config/Database";
import { MatchModel } from "../models/Match";

dotenv.config();

// Vincula los partidos del cuadro según la estructura del torneo.
// Cada entrada usa kickoffDate (UTC) para identificar el partido fuente
// y el partido destino, más el slot (home/away) que ocupa el ganador.
//
// Estructura:
//   R16 Llave 1 (2026-07-04 21:00 UTC) → winner → QF1 home (2026-07-10 21:00 UTC)
//   R16 Llave 2 (2026-07-04 17:00 UTC) → winner → QF1 away
//   R16 Llave 3 (2026-07-05 20:00 UTC) → winner → QF3 home (2026-07-10 17:00 UTC)
//   R16 Llave 4 (2026-07-05 22:00 UTC) → winner → QF3 away
//   R16 Llave 5 (2026-07-06 18:00 UTC) → winner → QF2 home (2026-07-11 21:00 UTC)
//   R16 Llave 6 (2026-07-06 21:00 UTC) → winner → QF2 away
//   R16 Llave 7 (2026-07-07 16:00 UTC) → winner → QF4 home (2026-07-11 17:00 UTC)
//   R16 Llave 8 (2026-07-07 17:00 UTC) → winner → QF4 away
//   QF1 (2026-07-10 21:00 UTC)          → winner → SF1 home (2026-07-14 21:00 UTC)
//   QF2 (2026-07-11 21:00 UTC)          → winner → SF1 away
//   QF3 (2026-07-10 17:00 UTC)          → winner → SF2 home (2026-07-15 21:00 UTC)
//   QF4 (2026-07-11 17:00 UTC)          → winner → SF2 away
//   SF1 (2026-07-14 21:00 UTC)          → winner → Final home (2026-07-19 21:00 UTC)
//                                       → loser  → 3rd place home (2026-07-18 20:00 UTC)
//   SF2 (2026-07-15 21:00 UTC)          → winner → Final away
//                                       → loser  → 3rd place away

// Seeds were created with Guatemala UTC-6, so kickoffDate stored = local + 6h
const gt = (dateStr: string, gtTime: string): Date =>
  new Date(`${dateStr}T${gtTime}:00-06:00`);

interface ILink {
  sourceKickoff: Date;
  nextKickoff: Date;
  nextSlot: "home" | "away";
  loserNextKickoff?: Date;
  loserNextSlot?: "home" | "away";
}

const LINKS: ILink[] = [
  // R16 → QF
  { sourceKickoff: gt("2026-07-04", "15:00"), nextKickoff: gt("2026-07-10", "15:00"), nextSlot: "home" }, // Llave 1 → QF1
  { sourceKickoff: gt("2026-07-04", "11:00"), nextKickoff: gt("2026-07-10", "15:00"), nextSlot: "away" }, // Llave 2 → QF1
  { sourceKickoff: gt("2026-07-05", "14:00"), nextKickoff: gt("2026-07-10", "11:00"), nextSlot: "home" }, // Llave 3 → QF3
  { sourceKickoff: gt("2026-07-05", "16:00"), nextKickoff: gt("2026-07-10", "11:00"), nextSlot: "away" }, // Llave 4 → QF3
  { sourceKickoff: gt("2026-07-06", "12:00"), nextKickoff: gt("2026-07-11", "15:00"), nextSlot: "home" }, // Llave 5 → QF2
  { sourceKickoff: gt("2026-07-06", "15:00"), nextKickoff: gt("2026-07-11", "15:00"), nextSlot: "away" }, // Llave 6 → QF2
  { sourceKickoff: gt("2026-07-07", "10:00"), nextKickoff: gt("2026-07-11", "11:00"), nextSlot: "home" }, // Llave 7 → QF4
  { sourceKickoff: gt("2026-07-07", "11:00"), nextKickoff: gt("2026-07-11", "11:00"), nextSlot: "away" }, // Llave 8 → QF4
  // QF → SF
  { sourceKickoff: gt("2026-07-10", "15:00"), nextKickoff: gt("2026-07-14", "15:00"), nextSlot: "home" }, // QF1 → SF1
  { sourceKickoff: gt("2026-07-11", "15:00"), nextKickoff: gt("2026-07-14", "15:00"), nextSlot: "away" }, // QF2 → SF1
  { sourceKickoff: gt("2026-07-10", "11:00"), nextKickoff: gt("2026-07-15", "15:00"), nextSlot: "home" }, // QF3 → SF2
  { sourceKickoff: gt("2026-07-11", "11:00"), nextKickoff: gt("2026-07-15", "15:00"), nextSlot: "away" }, // QF4 → SF2
  // SF → Final + 3rd Place
  {
    sourceKickoff: gt("2026-07-14", "15:00"),
    nextKickoff: gt("2026-07-19", "15:00"),
    nextSlot: "home",
    loserNextKickoff: gt("2026-07-18", "14:00"),
    loserNextSlot: "home",
  },
  {
    sourceKickoff: gt("2026-07-15", "15:00"),
    nextKickoff: gt("2026-07-19", "15:00"),
    nextSlot: "away",
    loserNextKickoff: gt("2026-07-18", "14:00"),
    loserNextSlot: "away",
  },
];

export const linkBracketMatches = async (): Promise<void> => {
  let linked = 0;

  for (const link of LINKS) {
    const [source, next] = await Promise.all([
      MatchModel.findOne({ kickoffDate: link.sourceKickoff }),
      MatchModel.findOne({ kickoffDate: link.nextKickoff }),
    ]);

    if (!source || !next) {
      console.warn(
        `[LinkBracket] Partido no encontrado: source=${link.sourceKickoff.toISOString()} next=${link.nextKickoff.toISOString()}`
      );
      continue;
    }

    const update: Record<string, unknown> = {
      nextMatchId: next._id,
      nextMatchSlot: link.nextSlot,
    };

    if (link.loserNextKickoff) {
      const loserNext = await MatchModel.findOne({ kickoffDate: link.loserNextKickoff });
      if (loserNext) {
        update.loserNextMatchId = loserNext._id;
        update.loserNextMatchSlot = link.loserNextSlot;
      }
    }

    await MatchModel.findByIdAndUpdate(source._id, update);
    linked++;
  }

  console.log(`[LinkBracket] ${linked}/${LINKS.length} partidos vinculados`);
};

// Propaga los ganadores de partidos ya terminados que aún no se reflejan en
// la siguiente ronda. Debe ejecutarse DESPUÉS de linkBracketMatches().
const propagateExistingWinners = async (): Promise<void> => {
  const finished = await MatchModel.find({
    isFinished: true,
    nextMatchId: { $ne: null },
    homeScore: { $ne: null },
    awayScore: { $ne: null },
  });

  let propagated = 0;

  for (const match of finished) {
    const winner = (match.homeScore ?? 0) >= (match.awayScore ?? 0)
      ? match.homeTeam
      : match.awayTeam;
    const loser = (match.homeScore ?? 0) >= (match.awayScore ?? 0)
      ? match.awayTeam
      : match.homeTeam;

    const winnerField = match.nextMatchSlot === "home" ? "homeTeam" : "awayTeam";
    await MatchModel.findByIdAndUpdate(match.nextMatchId, { [winnerField]: winner });

    if (match.loserNextMatchId && match.loserNextMatchSlot) {
      const loserField = match.loserNextMatchSlot === "home" ? "homeTeam" : "awayTeam";
      await MatchModel.findByIdAndUpdate(match.loserNextMatchId, { [loserField]: loser });
    }

    console.log(
      `[LinkBracket] Ganador propagado: ${winner.name} → ${match.nextMatchSlot} del siguiente partido`
    );
    propagated++;
  }

  console.log(`[LinkBracket] ${propagated} ganadores propagados`);
};

const run = async (): Promise<void> => {
  const mongoUri: string = process.env.MONGODB_URI ?? "";
  await connectDatabase(mongoUri);
  await linkBracketMatches();
  await propagateExistingWinners();
  await disconnectDatabase();
};

run().catch((error: unknown): void => {
  console.error("[LinkBracket] Error:", error);
  process.exit(1);
});
